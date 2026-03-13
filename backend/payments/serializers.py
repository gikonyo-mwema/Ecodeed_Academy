from rest_framework import serializers
from .models import Payment

from users.serializers import UserSerializer


class PaymentCourseSerializer(serializers.Serializer):
    """
    PaymentCourseSerializer — Lightweight course reference in payment record.
    
    Read-only course representation for payment records.
    Used in PaymentSerializer to avoid circular imports.
    
    Fields:
      id: Course ID
      title: Course title
      slug: Course URL slug
      price: Course price (decimal)
    
    @serializer PaymentCourseSerializer
    """
    id = serializers.IntegerField()
    title = serializers.CharField()
    slug = serializers.SlugField()
    price = serializers.DecimalField(max_digits=10, decimal_places=2)


class PaymentSerializer(serializers.ModelSerializer):
    """
    PaymentSerializer — Complete payment record serialization.
    
    Full payment representation with nested user and course details.
    Used for payment history display and admin payment dashboard.
    
    Fields (Transaction Data):
      id: Payment ID (primary key)
      reference: Paystack transaction reference (unique identifier)
      amount: Transaction amount (decimal)
      email: Payment email address
      status: Payment status (pending, success, failed)
      provider: Payment provider (e.g., paystack)
      payment_method: Payment method (card, m-pesa, bank_transfer)
      
    Fields (Relationships):
      user: Nested UserSerializer (student who made payment)
      course: Nested PaymentCourseSerializer (course purchased)
      
    Fields (Metadata):
      verified_at: When payment was verified
      created_at: Payment record creation time
      updated_at: Last update time
    
    Nested Serializers:
      - user: UserSerializer (read-only, for admin UI)
      - course: PaymentCourseSerializer (read-only, course details)
    
    All fields are read-only (list/retrieve only, no create/update).
    
    @serializer PaymentSerializer
    @version 1.0.0
    """
    # include read-only nested representations for admin UI clarity
    user = UserSerializer(read_only=True)
    course = PaymentCourseSerializer(read_only=True)

    class Meta:
        model = Payment
        fields = '__all__'
