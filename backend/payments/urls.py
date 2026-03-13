"""
═══════════════════════════════════════════════════════════════════════════════
PAYMENT URLS — Paystack payment processing endpoints.

URL routing for payment verification, payment history, and Paystack webhooks.

═══════════════════════════════════════════════════════════════════════════════
ENDPOINTS
═══════════════════════════════════════════════════════════════════════════════

Payment Verification:
  POST   /verify                     - Verify payment by Paystack reference

Payment History:
  GET    /history/                   - List user payment history
  GET    /history/{id}/              - Get payment details

Webhooks:
  POST   /webhook                    - Paystack webhook (receives charge.success events)
                                       Must be configured in Paystack dashboard
                                       Signature validation: X-Paystack-Signature header

═══════════════════════════════════════════════════════════════════════════════
SECURITY
═══════════════════════════════════════════════════════════════════════════════

Verify Endpoint:
  - Requires: Authenticated user
  - Uses: PAYSTACK_SECRET_KEY for API verification

Webhook Endpoint:
  - Requires: Valid X-Paystack-Signature header (HMAC-SHA512)
  - Uses: PAYSTACK_WEBHOOK_SECRET for signature validation
  - CSRF exempt: Required for external webhook

═══════════════════════════════════════════════════════════════════════════════
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VerifyPaymentView, PaymentViewSet, PaystackWebhookView

router = DefaultRouter()
router.register(r'history', PaymentViewSet, basename='payment-history')

urlpatterns = [
    path('verify', VerifyPaymentView.as_view(), name='payment-verify'),
    # Paystack will POST events here; configure in dashboard
    path('webhook', PaystackWebhookView.as_view(), name='paystack-webhook'),
    path('', include(router.urls)),
]
