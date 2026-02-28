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
