# college_in_out_log/models.py

from django.db import models
from django.conf import settings
from django.utils import timezone

User = settings.AUTH_USER_MODEL

class CollegeInOutLog(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='college_logs')
    entry_time = models.DateTimeField(auto_now_add=True)
    exit_time = models.DateTimeField(null=True, blank=True)
    marked_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='college_log_marked')

    def __str__(self):
        return f"{self.student.username} - Entry: {self.entry_time.strftime('%Y-%m-%d %H:%M')}"

    class Meta:
        ordering = ['-entry_time']