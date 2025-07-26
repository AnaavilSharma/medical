from rest_framework import serializers
from .models import CollegeInOutLog
from users.models import User
from users.serializers import UserSimpleSerializer # Import UserSimpleSerializer

class CollegeInOutLogSerializer(serializers.ModelSerializer):
    student = UserSimpleSerializer(read_only=True) # Use UserSimpleSerializer
    student_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='student'),
        source='student',
        write_only=True,
        required=False, # Make it optional for entry/exit views where user is current user
        allow_null=True
    )
    marked_by = UserSimpleSerializer(read_only=True) # Use UserSimpleSerializer

    class Meta:
        model = CollegeInOutLog
        fields = ['id', 'student', 'student_id', 'entry_time', 'exit_time', 'marked_by']
        read_only_fields = ['entry_time', 'exit_time', 'marked_by'] # marked_by is set by view
