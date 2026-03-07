from rest_framework import serializers
from .models import Payment

from users.serializers import UserSerializer


class PaymentCourseSerializer(serializers.Serializer):
    """Lightweight read-only course representation for payment records."""
    id = serializers.IntegerField()
    title = serializers.CharField()
    slug = serializers.SlugField()
    price = serializers.DecimalField(max_digits=10, decimal_places=2)


class PaymentSerializer(serializers.ModelSerializer):
    # include read-only nested representations for admin UI clarity
    user = UserSerializer(read_only=True)
    course = PaymentCourseSerializer(read_only=True)

    class Meta:
        model = Payment
        fields = '__all__'
