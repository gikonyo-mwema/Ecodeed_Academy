from rest_framework import serializers
from .models import Payment

# Import related serializers to provide nested representations
from users.serializers import UserSerializer
from courses.serializers import CourseSerializer

class PaymentSerializer(serializers.ModelSerializer):
    # include read-only nested representations for admin UI clarity
    user = UserSerializer(read_only=True)
    course = CourseSerializer(read_only=True)

    class Meta:
        model = Payment
        fields = '__all__'
