from django.contrib.auth.models import AbstractUser
from django.db import models
from attendance.models import Batch  # Import Batch model from attendance app


class User(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('parent', 'Parent'),
        ('admin', 'Admin'),
        ('principal', 'Principal'),
    )

    # Role is optional during user creation to allow admin/superuser setup
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, blank=True, null=True)

    # Link to batch, if applicable (e.g., for students and teachers)
    batch = models.ForeignKey(
        Batch,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users_in_batch'
    )

    # Link to a child if this user is a parent
    child = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='parents',
        limit_choices_to={'role': 'student'},
        help_text="Only for parents: Link to child who is a student."
    )

    # Hidden superuser flag
    is_hidden_superuser = models.BooleanField(
        default=False,
        help_text="If True, this user is a hidden superuser with unrestricted access."
    )

    def save(self, *args, **kwargs):
        if self.is_hidden_superuser:
            self.is_superuser = True
            self.is_staff = True
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} ({self.role})"