from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VerifyPaymentView, PaymentViewSet

router = DefaultRouter()
router.register(r'history', PaymentViewSet, basename='payment-history')

urlpatterns = [
    path('verify', VerifyPaymentView.as_view(), name='payment-verify'),
    path('', include(router.urls)),
]
