from rest_framework import serializers
from .models import HostelAttendance
from users.models import User
from users.serializers import UserSimpleSerializer # Import UserSimpleSerializer

class HostelAttendanceSerializer(serializers.ModelSerializer):
    student = UserSimpleSerializer(read_only=True) # Use UserSimpleSerializer
    student_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='student'),
        source='student',
        write_only=True,
        required=False, # Make it optional for entry/exit views where user is current user
        allow_null=True
    )
    marked_by = UserSimpleSerializer(read_only=True) # Use UserSimpleSerializer

    # If you have a 'hostel_room' field on the User model or a related profile, add here
    # For now, it's 'N/A' in frontend, if you want it from the model, you need to add it to User model first.
    # room = serializers.CharField(source='student.hostel_room', read_only=True) 

    class Meta:
        model = HostelAttendance
        fields = [
            'id',
            'student', 'student_id',
            'entry_time', 'exit_time',
            'marked_by',
            # 'room', # Include if added to User or a related model
        ]
        read_only_fields = ['entry_time', 'exit_time', 'marked_by'] # marked_by is set by view
