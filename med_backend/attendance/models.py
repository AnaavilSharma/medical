from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Batch(models.Model):
    name = models.CharField(max_length=100)
    students = models.ManyToManyField(User, related_name='batches')

    def __str__(self):
        return self.name

class ClassSession(models.Model):
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='class_sessions')
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='class_sessions')
    date = models.DateField()
    topic = models.CharField(max_length=255, blank=True, null=True)
    teacher_attendance_marked = models.BooleanField(default=False)  # New field

    def __str__(self):
        return f"{self.batch.name} - {self.date} - {self.teacher.username}"

class AttendanceRecord(models.Model):
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
        ('excused', 'Excused'),
    ]

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendance_records')
    class_session = models.ForeignKey(ClassSession, on_delete=models.CASCADE, related_name='attendance_records')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='present')
    marked_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='marked_attendance')
    marked_at = models.DateTimeField(auto_now=True)
    is_confirmed = models.BooleanField(default=False)  # New field

    class Meta:
        unique_together = ('student', 'class_session')

    def __str__(self):
        return f"{self.student.username} - {self.class_session} - {self.status} - Confirmed: {self.is_confirmed}"