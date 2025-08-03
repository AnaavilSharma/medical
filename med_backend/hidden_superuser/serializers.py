from rest_framework import serializers
from .models import AdminActivityLog, LoginHistory, SystemAuditLog, CodeModificationLog
from users.serializers import UserSimpleSerializer

class AdminActivityLogSerializer(serializers.ModelSerializer):
    user = UserSimpleSerializer(read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_role = serializers.CharField(source='user.role', read_only=True)
    
    class Meta:
        model = AdminActivityLog
        fields = [
            'id', 'user', 'user_username', 'user_role', 'action', 'model_name', 
            'object_id', 'details', 'ip_address', 'user_agent', 'timestamp'
        ]

class LoginHistorySerializer(serializers.ModelSerializer):
    user = UserSimpleSerializer(read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_role = serializers.CharField(source='user.role', read_only=True)
    session_duration_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = LoginHistory
        fields = [
            'id', 'user', 'user_username', 'user_role', 'login_time', 'logout_time',
            'ip_address', 'user_agent', 'session_duration', 'session_duration_formatted',
            'is_active'
        ]
    
    def get_session_duration_formatted(self, obj):
        duration = obj.calculate_duration()
        if duration:
            total_seconds = int(duration.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            seconds = total_seconds % 60
            if hours > 0:
                return f"{hours}h {minutes}m {seconds}s"
            elif minutes > 0:
                return f"{minutes}m {seconds}s"
            else:
                return f"{seconds}s"
        return "Active" if obj.is_active else "N/A"

class SystemAuditLogSerializer(serializers.ModelSerializer):
    affected_user = UserSimpleSerializer(read_only=True)
    affected_user_username = serializers.CharField(source='affected_user.username', read_only=True)
    
    class Meta:
        model = SystemAuditLog
        fields = [
            'id', 'event_type', 'description', 'affected_user', 'affected_user_username',
            'details', 'timestamp', 'severity'
        ]

class CodeModificationLogSerializer(serializers.ModelSerializer):
    modified_by = UserSimpleSerializer(read_only=True)
    modified_by_username = serializers.CharField(source='modified_by.username', read_only=True)
    
    class Meta:
        model = CodeModificationLog
        fields = [
            'id', 'file_path', 'file_type', 'modification_type', 'old_content',
            'new_content', 'description', 'modified_by', 'modified_by_username',
            'timestamp', 'is_applied', 'error_message'
        ]

class HiddenSuperuserDashboardSerializer(serializers.Serializer):
    """Serializer for hidden superuser dashboard statistics"""
    total_users = serializers.IntegerField()
    total_admins = serializers.IntegerField()
    total_principals = serializers.IntegerField()
    total_teachers = serializers.IntegerField()
    total_students = serializers.IntegerField()
    total_parents = serializers.IntegerField()
    recent_activities = AdminActivityLogSerializer(many=True)
    recent_logins = LoginHistorySerializer(many=True)
    system_events = SystemAuditLogSerializer(many=True)
    code_modifications = CodeModificationLogSerializer(many=True)
    active_sessions = serializers.IntegerField()
    system_health = serializers.DictField()

class CodeModificationRequestSerializer(serializers.Serializer):
    """Serializer for code modification requests"""
    file_path = serializers.CharField(max_length=500)
    file_type = serializers.ChoiceField(choices=[
        ('frontend', 'Frontend'),
        ('backend', 'Backend'),
        ('database', 'Database'),
        ('config', 'Configuration'),
    ])
    modification_type = serializers.ChoiceField(choices=[
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('restore', 'Restore'),
    ])
    new_content = serializers.CharField(allow_blank=True)
    description = serializers.CharField()
    backup_existing = serializers.BooleanField(default=True) 