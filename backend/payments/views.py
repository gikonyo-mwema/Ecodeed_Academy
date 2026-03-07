import logging
import requests
from django.conf import settings
from django.db import transaction
from rest_framework import views, status, permissions, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from .models import Payment
from .serializers import PaymentSerializer
from courses.models import Course, Enrollment

logger = logging.getLogger(__name__)

class VerifyPaymentView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        reference = request.data.get('reference')
        if not reference:
            return Response({'message': 'No reference provided'}, status=status.HTTP_400_BAD_REQUEST)
            
        paystack_secret_key = getattr(settings, 'PAYSTACK_SECRET_KEY', None)
        if not paystack_secret_key:
             return Response({'message': 'Server configuration error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
             
        try:
            headers = {'Authorization': f'Bearer {paystack_secret_key}'}
            url = f'https://api.paystack.co/transaction/verify/{reference}'
            response = requests.get(url, headers=headers)
            res_data = response.json()
            
            if not res_data.get('status'):
                 return Response({'message': 'Verification failed at provider'}, status=status.HTTP_400_BAD_REQUEST)
                 
            data = res_data.get('data', {})
            if data.get('status') != 'success':
                 return Response({'message': 'Transaction not successful'}, status=status.HTTP_400_BAD_REQUEST)
            
            metadata = data.get('metadata', {})
            course_id = metadata.get('courseId')
            payment_channel = data.get('channel')
            
            with transaction.atomic():
                payment, created = Payment.objects.get_or_create(
                    reference=reference,
                    defaults={
                        'user': request.user,
                        'amount': data.get('amount') / 100, 
                        'email': data.get('customer', {}).get('email'),
                        'status': 'success',
                        'verified_at': timezone.now(),
                        'payment_method': payment_channel
                    }
                )

                if not course_id:
                    return Response({'message': 'Course ID missing in transaction metadata'}, status=status.HTTP_400_BAD_REQUEST)

                try:
                    course = Course.objects.get(pk=course_id)
                except Course.DoesNotExist:
                    return Response({'message': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)

                payment.course = course
                payment.save()

                Enrollment.objects.get_or_create(
                    user=request.user,
                    course=course,
                    defaults={'status': 'active'}
                )
            
            return Response({'message': 'Payment verified and enrollment active'}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception('Payment verification failed for ref=%s', reference)
            return Response({'message': 'Verification processing failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for listing payments.
    Students see their own history.
    Admins see all.
    """
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Payment.objects.select_related('user', 'course')
        if user.is_staff or user.is_superuser:
            return qs.order_by('-created_at')
        return qs.filter(user=user).order_by('-created_at')


# ------------------------------------------------------------------
# Paystack webhook endpoint
# ------------------------------------------------------------------
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import hmac
import hashlib

@method_decorator(csrf_exempt, name='dispatch')
class PaystackWebhookView(views.APIView):
    """Receives asynchronous notifications from Paystack.

    This view does **not** require authentication and must verify the
    X-Paystack-Signature header using the webhook secret. The payload
    is parsed for events like `charge.success`, and the corresponding
    Payment record is created/updated. Enrollment logic is similar to
    verification.
    """
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        secret = getattr(settings, 'PAYSTACK_WEBHOOK_SECRET', '')
        header_sig = request.META.get('HTTP_X_PAYSTACK_SIGNATURE', '')
        computed = hmac.new(secret.encode(), request.body, hashlib.sha512).hexdigest()
        if not hmac.compare_digest(computed, header_sig):
            return Response({'detail': 'invalid signature'}, status=status.HTTP_400_BAD_REQUEST)

        event = request.data.get('event')
        data = request.data.get('data', {})
        reference = data.get('reference')

        # update or create payment record + enrollment atomically
        with transaction.atomic():
            payment, created = Payment.objects.get_or_create(
                reference=reference,
                defaults={
                    'user': None,
                    'amount': data.get('amount', 0) / 100,
                    'email': data.get('customer', {}).get('email', ''),
                    'status': 'success' if event == 'charge.success' else 'pending',
                    'provider': 'paystack',
                }
            )

            if not created and event == 'charge.success':
                payment.status = 'success'
                payment.verified_at = timezone.now()
                payment.save()

            # enroll user if courseId present and payment just succeeded
            if event == 'charge.success':
                metadata = data.get('metadata', {})
                course_id = metadata.get('courseId')
                if course_id and payment.user:
                    try:
                        course = Course.objects.get(pk=course_id)
                        Enrollment.objects.get_or_create(
                            user=payment.user,
                            course=course,
                            defaults={'status': 'active'}
                        )
                    except Course.DoesNotExist:
                        pass

        return Response({'received': True})
