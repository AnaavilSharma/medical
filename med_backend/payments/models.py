from django.db import models
from users.models import User

class Payment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),      # Payment is due, waiting for payment
        ('received', 'Received'),    # Payment successfully collected
        ('pending_proof', 'Pending Proof'), # Proof uploaded by student/parent, awaiting verification
    ]

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    # Renamed 'reason' to 'type' as per frontend expectation
    type = models.CharField(max_length=255) 
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    payment_link = models.URLField(max_length=200, blank=True, null=True, help_text="Optional link to a payment gateway") # Max length added
    late_fine = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_proof = models.FileField(upload_to='payment_proofs/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending') # Default to 'pending'
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.username} - {self.type} - {self.status}"
