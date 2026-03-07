from django.db import models
from django.conf import settings
from courses.models import Course

class Payment(models.Model):
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
