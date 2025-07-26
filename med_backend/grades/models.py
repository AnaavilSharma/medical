from django.db import models
from users.models import User

class Grade(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='grades_as_student')
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='grades_as_teacher')
    subject = models.CharField(max_length=100)
    marks = models.DecimalField(max_digits=5, decimal_places=2)
    grade = models.CharField(max_length=2)
    remarks = models.TextField(blank=True, null=True)
    date_recorded = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.username} - {self.subject} - {self.grade} ({self.marks})"
