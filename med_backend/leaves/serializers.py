from rest_framework import serializers
from .models import LeaveRequest
from users.serializers import UserSimpleSerializer # Import simple user serializer

class LeaveRequestSerializer(serializers.ModelSerializer):
    """
    Serializer for LeaveRequest model.
    Uses nested UserSimpleSerializer for the associated user.
    `status` is writable to allow admin/principal to change it.
    """
    user = UserSimpleSerializer(read_only=True) # Use nested serializer to get user object

    class Meta:
        model = LeaveRequest
        fields = ['id', 'user', 'start_date', 'end_date', 'reason', 'status', 'applied_at']
        read_only_fields = ['applied_at'] # Removed 'status' and 'user' from read_only_fields
        # 'status' can now be updated via the serializer if permissions allow, or directly in view.
        # 'user' is set by perform_create and is read-only implicitly for normal updates.
