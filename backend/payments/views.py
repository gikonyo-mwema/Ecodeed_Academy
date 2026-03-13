"""
═══════════════════════════════════════════════════════════════════════════════
PAYMENT API VIEWS — Paystack integration and payment verification endpoints.

Handles course payment processing via Paystack payment gateway. Provides:
1. Payment verification endpoint (client-initiated via reference)
2. Webhook endpoint (Paystack-initiated notifications)
3. Payment history viewset for students and admins

Payment Flow:
  Client → Paystack Payment Gateway
     ↓ (on success)
  Client sends reference → VerifyPaymentView
  Verify with Paystack API → Payment created → Enrollment activated

═══════════════════════════════════════════════════════════════════════════════
ENDPOINTS
═══════════════════════════════════════════════════════════════════════════════

Verification:
  POST   /api/v1/payments/verify/        - Verify payment by reference

Payment History:
  GET    /api/v1/payments/               - List user's payment history
  GET    /api/v1/payments/{id}/          - Get payment details

Webhooks (Internal):
  POST   /api/v1/payments/webhook/       - Paystack webhook (unsigned)

═══════════════════════════════════════════════════════════════════════════════
PERMISSIONS & SECURITY
═══════════════════════════════════════════════════════════════════════════════

VerifyPaymentView (Authenticated):
  - Requires: Authenticated user + valid Paystack reference
  - Verifies: Payment with Paystack API using secret key
  - Actions: Create Payment record + Enrollment for course

PaymentViewSet (Authenticated):
  - Students: See own payment history (ordered by date)
  - Admins: See all payments across users
  - Method: select_related() for performance

PaystackWebhookView (Webhook Signed):
  - Requires: Valid X-Paystack-Signature header (HMAC-SHA512)
  - NO CSRF protection (webhook endpoint)
  - Verifies: Signature against PAYSTACK_WEBHOOK_SECRET
  - Handles: charge.success events for async updates
  - Idempotent: Uses get_or_create() for safety

═══════════════════════════════════════════════════════════════════════════════
DATA FLOW
═══════════════════════════════════════════════════════════════════════════════

Client Verification Flow:
  1. User completes payment on Paystack
  2. Paystack returns reference + success callback
  3. Client sends reference to VerifyPaymentView
  4. View queries Paystack API with secret key
  5. On success: Create Payment + Enrollment (atomic transaction)
  6. Return success response to client

Webhook Flow (Async):
  1. Paystack sends charge.success event to webhook endpoint
  2. Webhook validates signature (HMAC-SHA512)
  3. Create/update Payment record
  4. If courseId in metadata + user attached: Create Enrollment
  5. Return 200 OK (Paystack expects immediate acknowledgment)

═══════════════════════════════════════════════════════════════════════════════
ENVIRONMENT VARIABLES REQUIRED
═══════════════════════════════════════════════════════════════════════════════

PAYSTACK_SECRET_KEY     - For API verification (VerifyPaymentView)
PAYSTACK_WEBHOOK_SECRET - For signature validation (PaystackWebhookView)

═══════════════════════════════════════════════════════════════════════════════
"""

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
    """
    VerifyPaymentView — Payment verification via Paystack API.
    
    Client-initiated verification endpoint. Takes transaction reference from
    Paystack, verifies with Paystack API, and creates Payment + Enrollment
    records atomically.
    
    Permissions:
      - Requires: Authenticated user
    
    Endpoint:
      POST /api/v1/payments/verify/
      Body: {"reference": "paystack_reference_string"}
    
    Process:
      1. Extract 'reference' from request data
      2. Verify with Paystack API (headers: Authorization Bearer secret)
      3. On success: Extract amount, course_id, email from response
      4. Create Payment record (atomic)
      5. Create Enrollment for course
      6. Return success response
    
    Responses:
      200: Payment verified, enrollment activated
      400: Invalid reference, missing course ID, or transaction not successful
      404: Course not found
      500: Server config error, verification failed
    
    Error Handling:
      - Missing PAYSTACK_SECRET_KEY → 500
      - Missing reference → 400
      - Paystack API error → 500 (logged)
      - Course not found → 404
    
    Transactions:
      Uses database transaction.atomic() to ensure Payment + Enrollment
      created together or both rolled back on error.
    
    @view VerifyPaymentView
    @version 1.0.0
    """
    
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
    PaymentViewSet — Payment history and details read-only viewset.
    
    Provides GET-only access to payment records with role-based filtering.
    
    Permissions:
      - Requires: Authenticated user
      - Students: See only own payments
      - Admins/Staff: See all payments
    
    Endpoints:
      GET  /api/v1/payments/      - List payment history
      GET  /api/v1/payments/{id}/ - Get payment details
    
    Query Optimization:
      Uses select_related('user', 'course') to avoid N+1 queries
    
    Filtering:
      Default: Order by -created_at (newest first)
      Students: user=request.user
      Admins: All payments
    
    Serializer:
      PaymentSerializer for all read actions
    
    Methods:
      get_queryset(): Returns filtered payments based on user role
    
    @viewset PaymentViewSet
    @version 1.0.0
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
    """
    PaystackWebhookView — Webhook receiver for Paystack charge.success events.
    
    Receives asynchronous payment notifications from Paystack payment gateway.
    Validates webhook signature using HMAC-SHA512, then processes payment events.
    
    Security:
      - CSRF exempt: Required for webhook endpoints (external POST)
      - Signature validation: Verifies X-Paystack-Signature header
      - HMAC-SHA512: Uses PAYSTACK_WEBHOOK_SECRET for validation
      - No authentication: Paystack cannot provide user credentials
    
    Endpoint:
      POST /api/v1/payments/webhook/
      Header: X-Paystack-Signature: <hmac-sha512-hex>
      Body: Paystack webhook payload
    
    Supported Events:
      - charge.success: Payment successful (creates/updates Payment record)
    
    Signature Validation:
      1. Extract X-Paystack-Signature header
      2. Compute HMAC-SHA512(body, PAYSTACK_WEBHOOK_SECRET)
      3. Compare with constant-time comparison (hmac.compare_digest)
      4. Reject if invalid → 400
    
    Process (on charge.success):
      1. Validate signature
      2. Extract metadata, reference, amount, email
      3. Create/update Payment record (atomic)
      4. If courseId in metadata + user attached: Create Enrollment
      5. Return {"received": true} immediately
    
    Idempotency:
      Uses get_or_create() to handle duplicate webhooks safely.
      Paystack may send webhooks multiple times for network reliability.
    
    Error Handling:
      - No PAYSTACK_WEBHOOK_SECRET configured → 503 Service Unavailable
      - Missing X-Paystack-Signature → 400 Bad Request
      - Invalid signature → 400 Bad Request
      - Course not found → Silently ignored (payment still recorded)
      - No user attached → Payment created, enrollment skipped
    
    Responses:
      200: Webhook received and processed
      400: Missing or invalid signature
      503: Webhook not configured (PAYSTACK_WEBHOOK_SECRET missing)
    
    Logging:
      Error logs if PAYSTACK_WEBHOOK_SECRET missing (configuration issue)
    
    Transactions:
      Uses database transaction.atomic() to ensure Payment + Enrollment
      created together or both rolled back on error.
    
    @webhook PaystackWebhookView
    @version 1.0.0
    """
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        secret = getattr(settings, 'PAYSTACK_WEBHOOK_SECRET', '')
        if not secret:
            logger.error('PAYSTACK_WEBHOOK_SECRET is not configured — rejecting webhook')
            return Response({'detail': 'webhook not configured'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        header_sig = request.META.get('HTTP_X_PAYSTACK_SIGNATURE', '')
        if not header_sig:
            return Response({'detail': 'missing signature'}, status=status.HTTP_400_BAD_REQUEST)
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
