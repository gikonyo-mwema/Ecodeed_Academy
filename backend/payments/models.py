"""
═══════════════════════════════════════════════════════════════════════════════
PAYMENT MODELS — Course payment tracking and management.

This module handles payment processing for course enrollments, including
payment status tracking, multiple payment methods (Card, M-Pesa), and
integration with Paystack payment provider.

═══════════════════════════════════════════════════════════════════════════════
PAYMENT FLOW
═══════════════════════════════════════════════════════════════════════════════

1. User initiates payment for course enrollment
2. Payment record created with status='pending'
3. Payment provider (Paystack) processes transaction
4. Webhook callback updates status to 'success' or 'failed'
5. verified_at timestamp set on successful payment
6. Course enrollment/access granted on success

Status Flow: pending → success OR pending → failed

═══════════════════════════════════════════════════════════════════════════════
PROVIDERS & METHODS
═══════════════════════════════════════════════════════════════════════════════

Providers:
  • paystack (primary) - Payment processing
  
Payment Methods:
  • card: Credit/debit card (Visa, Mastercard)
  • mpesa: M-Pesa mobile payment (East Africa)

═══════════════════════════════════════════════════════════════════════════════
"""

from django.db import models
from django.conf import settings
from courses.models import Course

class Payment(models.Model):
    """
    Payment Model — Course payment transaction record.
    
    Tracks payment transactions for course enrollments. Records payment
    attempts, status, amount, and timing information. Linked to both
    User (payer) and Course (what's being paid for).
    
    Fields:
      user (FK): User making the payment (SET_NULL if user deleted)
      course (FK): Course being purchased (SET_NULL if course deleted)
      amount (Decimal): Payment amount in KES (max 99,999,999.99)
      reference (str): Unique transaction reference from payment provider
      email (str): Email associated with payment transaction
      status (str): Payment status - 'pending', 'success', or 'failed'
        - pending: Payment initiated, awaiting provider response
        - success: Payment successfully processed
        - failed: Payment rejected or canceled
      provider (str): Payment service provider (default: 'paystack')
      payment_method (str): Method used - 'card' or 'mpesa' (optional)
      created_at (DateTime): Payment initiated timestamp (auto-set)
      verified_at (DateTime): Payment verified timestamp (set on success)
    
    Methods:
      __str__(): Returns "User - Course - Reference" for admin/logs
    
    Indexes:
      - status: Fast filtering by payment status
      - -created_at: Newest payments first (reverse chronological)
      - user, -created_at: User's recent payments
    
    Status Transitions:
      Created:  status='pending', verified_at=None
      Success:  status='success', verified_at=datetime.now()
      Failed:   status='failed', verified_at=None
    
    @model Payment
    @version 1.0.0
    @author Gikonyo Mwema
    """
    
    PAYMENT_STATUS = (
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
    )
    
    PAYMENT_METHOD = (
        ('card', 'Card'),
        ('mpesa', 'M-Pesa'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    reference = models.CharField(max_length=100, unique=True)
    email = models.EmailField()
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    provider = models.CharField(max_length=50, default='paystack')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['-created_at']),
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self):
        return f"{self.user} - {self.course} - {self.reference}"
