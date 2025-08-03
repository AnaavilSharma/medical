from django.db import models
from django.contrib.auth import get_user_model
from attendance.models import Batch  # Import Batch model

CustomUser = get_user_model()

# New model for structured timetable entries
class ClassSchedule(models.Model):
    DAYS_OF_WEEK = [
        ('Monday', 'Monday'),
        ('Tuesday', 'Tuesday'),
        ('Wednesday', 'Wednesday'),
        ('Thursday', 'Thursday'),
        ('Friday', 'Friday'),
        ('Saturday', 'Saturday'),
        ('Sunday', 'Sunday'),
    ]

    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='class_schedules')
    day = models.CharField(max_length=10, choices=DAYS_OF_WEEK)
    start_time = models.TimeField()
    end_time = models.TimeField()
    subject = models.CharField(max_length=100)
    room = models.CharField(max_length=50, blank=True, null=True)
    teacher = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='scheduled_classes')

    class Meta:
        ordering = ['day', 'start_time']
        # Prevent exact duplicates for a given class session
        unique_together = ('batch', 'day', 'start_time', 'subject', 'room') 

    def __str__(self):
        return f"{self.batch.name} - {self.day} {self.start_time.strftime('%H:%M')}-{self.end_time.strftime('%H:%M')}: {self.subject}"


class TimetableFile(models.Model):
    FILE_TYPES = [
        ('image', 'Image (PNG, JPG, JPEG)'),
        ('pdf', 'PDF Document'),
        ('excel', 'Excel File (XLS, XLSX)'),
    ]
    
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='timetable_files')
    term = models.CharField(max_length=50, blank=True, null=True, help_text="e.g., 'Semester 1', 'Annual'")
    effective_date = models.DateField(blank=True, null=True, help_text="Date from which this timetable is effective")
    file = models.FileField(upload_to='timetable_files/', help_text="Upload timetable as image, PDF, or Excel file")
    file_type = models.CharField(max_length=10, choices=FILE_TYPES, default='image')
    title = models.CharField(max_length=200, blank=True, null=True, help_text="Optional title for the timetable")
    description = models.TextField(blank=True, null=True, help_text="Optional description")
    uploaded_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='uploaded_timetables')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True, help_text="Whether this timetable is currently active")

    class Meta:
        ordering = ['-uploaded_at'] # Order newest first

    def __str__(self):
        return f"Timetable for {self.batch.name} ({self.term or 'N/A'}) - {self.get_file_type_display()}"

    def get_file_extension(self):
        """Get the file extension for display purposes"""
        if self.file:
            return self.file.name.split('.')[-1].upper()
        return ''

    def get_file_size(self):
        """Get file size in human readable format"""
        if self.file:
            size = self.file.size
            for unit in ['B', 'KB', 'MB', 'GB']:
                if size < 1024.0:
                    return f"{size:.1f} {unit}"
                size /= 1024.0
            return f"{size:.1f} TB"
        return '0 B'


# Keep the old model for backward compatibility
class TimetableImage(models.Model):
    # Changed from CharField to ForeignKey to Batch model
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='timetable_images_uploaded')
    term = models.CharField(max_length=50, blank=True, null=True, help_text="e.g., 'Semester 1', 'Annual'")
    effective_date = models.DateField(blank=True, null=True, help_text="Date from which this timetable is effective")
    image = models.ImageField(upload_to='timetable_images/')
    uploaded_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='uploaded_timetables_old')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Ensure uniqueness for a specific batch, term, and effective date combination
        unique_together = ('batch', 'term', 'effective_date') 
        ordering = ['-uploaded_at'] # Order newest first

    def __str__(self):
        return f"Timetable Image for {self.batch.name} ({self.term or 'N/A'})"


class Subject(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name
    
class ClassSession(models.Model):
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    date = models.DateField()
    period = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.subject.name} on {self.date} for {self.batch.name}"