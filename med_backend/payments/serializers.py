from rest_framework import serializers
from .models import Payment
from users.models import User # For PrimaryKeyRelatedField queryset
from users.serializers import UserSimpleSerializer # Import UserSimpleSerializer

class PaymentSerializer(serializers.ModelSerializer):
    """
    Serializer for the Payment model.
    Handles display of student name and allows for creation by admin (via student_id).
    """
    student_name = serializers.CharField(source='student.username', read_only=True)
    # The 'type' field now comes directly from the model (renamed from 'reason')
    
    student = UserSimpleSerializer(read_only=True) # Display student details in read operations
    student_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), # Allow any user for queryset initially, validation will filter by role
        source='student',
        write_only=True,
        required=False, # Make it not strictly required for updates, but for create it will be validated.
        allow_null=True # Allow null for partial updates where student is not changed
    ) 

    class Meta:
        model = Payment
        fields = [
            'id',
            'student', 'student_id', 
            'type',         
            'amount',
            'due_date',
            'payment_link',
            'late_fine',
            'payment_proof',
            'status',
            'created_at',
            'student_name', 
        ]
        # `status`, `created_at`, `student_name` are read-only
        # `payment_proof` and `payment_link` should be writable by relevant roles/actions
        read_only_fields = ['created_at', 'student_name'] 
        # 'status' is managed by specific actions/permissions, not by general serializer updates.
