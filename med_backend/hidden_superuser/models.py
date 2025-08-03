from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import json

User = get_user_model()

class AdminActivityLog(models.Model):
    """Track all activities performed by admin and principal users"""
    ACTION_CHOICES = [
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('view', 'View'),
        ('export', 'Export'),
        ('import', 'Import'),
        ('bulk_action', 'Bulk Action'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activity_logs')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    model_name = models.CharField(max_length=100, help_text="Name of the model being acted upon")
    object_id = models.CharField(max_length=100, blank=True, null=True, help_text="ID of the object being acted upon")
    details = models.JSONField(default=dict, help_text="Additional details about the action")
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = "Admin Activity Log"
        verbose_name_plural = "Admin Activity Logs"
    
    def __str__(self):
        return f"{self.user.username} - {self.action} - {self.model_name} - {self.timestamp}"

class LoginHistory(models.Model):
    """Track login history for admin and principal users"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='login_history')
    login_time = models.DateTimeField(auto_now_add=True)
    logout_time = models.DateTimeField(blank=True, null=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True)
    session_duration = models.DurationField(blank=True, null=True)
    is_active = models.BooleanField(default=True, help_text="Whether this session is still active")
    
    class Meta:
        ordering = ['-login_time']
        verbose_name = "Login History"
        verbose_name_plural = "Login History"
    
    def __str__(self):
        return f"{self.user.username} - {self.login_time}"
    
    def calculate_duration(self):
        if self.logout_time and self.login_time:
            return self.logout_time - self.login_time
        elif self.is_active:
            return timezone.now() - self.login_time
        return None

class SystemAuditLog(models.Model):
    """Track system-wide changes and important events"""
    EVENT_CHOICES = [
        ('user_created', 'User Created'),
        ('user_modified', 'User Modified'),
        ('user_deleted', 'User Deleted'),
        ('payment_generated', 'Payment Generated'),
        ('attendance_marked', 'Attendance Marked'),
        ('grade_uploaded', 'Grade Uploaded'),
        ('leave_approved', 'Leave Approved'),
        ('bulletin_posted', 'Bulletin Posted'),
        ('system_backup', 'System Backup'),
        ('code_modified', 'Code Modified'),
    ]
    
    event_type = models.CharField(max_length=50, choices=EVENT_CHOICES)
    description = models.TextField()
    affected_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    details = models.JSONField(default=dict)
    timestamp = models.DateTimeField(auto_now_add=True)
    severity = models.CharField(max_length=20, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ], default='medium')
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = "System Audit Log"
        verbose_name_plural = "System Audit Logs"
    
    def __str__(self):
        return f"{self.event_type} - {self.timestamp}"

class CodeModificationLog(models.Model):
    """Track code modifications made through the hidden superuser panel"""
    file_path = models.CharField(max_length=500, help_text="Path to the modified file")
    file_type = models.CharField(max_length=20, choices=[
        ('frontend', 'Frontend'),
        ('backend', 'Backend'),
        ('database', 'Database'),
        ('config', 'Configuration'),
    ])
    modification_type = models.CharField(max_length=20, choices=[
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('restore', 'Restore'),
    ])
    old_content = models.TextField(blank=True, help_text="Previous content before modification")
    new_content = models.TextField(blank=True, help_text="New content after modification")
    description = models.TextField(help_text="Description of what was changed")
    modified_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='code_modifications')
    timestamp = models.DateTimeField(auto_now_add=True)
    is_applied = models.BooleanField(default=True, help_text="Whether the modification was successfully applied")
    error_message = models.TextField(blank=True, help_text="Error message if modification failed")
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = "Code Modification Log"
        verbose_name_plural = "Code Modification Logs"
    
    def __str__(self):
        return f"{self.file_path} - {self.modification_type} - {self.timestamp}"
