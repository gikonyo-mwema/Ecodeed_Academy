import requests
from django.conf import settings
from rest_framework import views, status, permissions, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from .models import Payment
from .serializers import PaymentSerializer
from courses.models import Course, Enrollment

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
            
            try:
                if course_id:
                     course = Course.objects.get(pk=course_id)
                     payment.course = course
                     payment.save()
                     
                     Enrollment.objects.get_or_create(
                         user=request.user,
                         course=course,
                         defaults={'status': 'active'}
                     )
                else:
                    return Response({'message': 'Course ID missing in transaction metadata'}, status=status.HTTP_400_BAD_REQUEST)

            except Course.DoesNotExist:
                 return Response({'message': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
            
            return Response({'message': 'Payment verified and enrollment active'}, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Payment Verification Error: {e}")
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
        if user.is_staff or user.is_superuser:
            return Payment.objects.all().order_by('-created_at')
        return Payment.objects.filter(user=user).order_by('-created_at')
