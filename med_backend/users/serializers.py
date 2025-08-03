# users/serializers.py

from rest_framework import serializers
from .models import User
from payments.models import Payment # Assuming Payment model is correctly located
from leaves.models import LeaveRequest # Assuming LeaveRequest model is correctly located
from attendance.models import Batch # Import Batch for batch name if needed


class UserSimpleSerializer(serializers.ModelSerializer):
    """
    A simple serializer for User model, providing basic information.
    Used in other apps to avoid deeply nested user objects and N+1 queries.
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role'] # Added role for more context


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User creation and general display.
    Sensitive fields like password are write-only.
    `is_hidden_superuser` is read-only for security.
    """
    child_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='student'),
        source='child',
        required=False,
        allow_null=True,
        write_only=True,
        help_text="Only for parents: Link to student"
    )
    child = serializers.SerializerMethodField(read_only=True)
    # is_hidden_superuser should not be settable directly via this serializer for security
    is_hidden_superuser = serializers.BooleanField(read_only=True) 
    
    # Add batch_id for writing the ForeignKey
    batch_id = serializers.PrimaryKeyRelatedField(
        queryset=Batch.objects.all(),
        source='batch',
        required=False,
        allow_null=True,
        write_only=True,
        help_text="Only for students/teachers: Link to batch"
    )
    # If you want to display batch name in read-only representations
    batch_name = serializers.CharField(source='batch.name', read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'role',
            'first_name',
            'last_name',
            'password',
            'child_id',
            'child',
            'is_hidden_superuser', # Include in fields but marked read_only
            'batch_id',            # For writing the batch FK
            'batch_name',          # For reading the batch name
        ]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def get_child(self, obj):
        if obj.role == 'parent' and obj.child:
            return {
                'id': obj.child.id,
                'username': obj.child.username,
                'email': obj.child.email,
                'first_name': obj.child.first_name,
                'last_name': obj.child.last_name,
                'role': obj.child.role # Include role for child
            }
        return None

    def validate_role(self, value):
        # Check if this is an authenticated request from admin/principal
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Allow admin/principal to create any role
            if request.user.role in ['admin', 'principal', 'hidden_superuser']:
                return value
        
        # For public registration or unauthenticated requests, restrict to student/parent
        if self.context['request'].method == 'POST' and value not in ['student', 'parent']:
            raise serializers.ValidationError(
                "Only 'student' and 'parent' roles can be registered through this endpoint. "
                "Contact an administrator to create other roles."
            )
        return value

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        child = validated_data.pop('child', None)
        batch = validated_data.pop('batch', None) # Pop batch here
        role = validated_data.get('role')

        user = User(**validated_data)
        if password:
            user.set_password(password)
        if child and role == 'parent':
            user.child = child
        if batch and (role == 'student' or role == 'teacher'): # Link batch for students/teachers
            user.batch = batch

        # is_hidden_superuser is handled by its read_only=True field for this serializer.
        # Any attempt to set it via this serializer will be ignored.
        # It should be managed only by a proper Django superuser in admin.

        user.save()
        return user


class UserInfoSerializer(serializers.ModelSerializer):
    """
    Serializer to provide detailed information about a user,
    customizing fields based on the user's role and pulling data
    from related models/logic.
    """
    full_name = serializers.SerializerMethodField()
    email = serializers.EmailField(read_only=True) # Email is a direct field on User
    
    # These fields need to be implemented either as direct fields on User model
    # or through related profile models (e.g., StudentProfile, FacultyProfile)
    # For now, they return None if not handled by a concrete method.
    student_id = serializers.SerializerMethodField()
    faculty_id = serializers.SerializerMethodField()
    department = serializers.SerializerMethodField()
    admin_level = serializers.SerializerMethodField() # For admin/principal roles

    child_name = serializers.SerializerMethodField() # For parent's child name
    academic_fee = serializers.SerializerMethodField()
    hostel_fee = serializers.SerializerMethodField()
    parent_name = serializers.SerializerMethodField()
    child_info = serializers.SerializerMethodField() # Detailed info for parent's child
    leaves_remaining = serializers.SerializerMethodField()


    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'full_name',
            'role',
            'batch',         # Now a ForeignKey, will return PK. Consider 'batch_name' for display.
            'student_id',
            'faculty_id',
            'department',
            'admin_level',
            'date_joined',   # date_joined is on AbstractUser
            'academic_fee',
            'hostel_fee',
            'parent_name',
            'child_name',
            'child_info',
            'leaves_remaining'
        ]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() if obj.first_name or obj.last_name else obj.username

    def get_student_id(self, obj):
        # Placeholder: If you have a StudentProfile model with student_id, link it here
        # E.g., if obj.role == 'student' and hasattr(obj, 'studentprofile'): return obj.studentprofile.student_id
        return None 

    def get_faculty_id(self, obj):
        # Placeholder: If you have a FacultyProfile model with faculty_id, link it here
        return None 

    def get_department(self, obj):
        # Placeholder: If you have department linked to user or profile
        return None 

    def get_admin_level(self, obj):
        # Placeholder: If you have a concept of admin levels
        return None 

    def get_child_name(self, obj):
        if obj.role == 'parent' and obj.child:
            return f"{obj.child.first_name} {obj.child.last_name}".strip()
        return None

    def get_academic_fee(self, obj):
        if obj.role == 'student':
            # Note: Payment.type (formerly reason) should match what's stored in DB
            payment = Payment.objects.filter(student=obj, type__icontains='academic', status='pending').order_by('-due_date').first()
            return payment.amount if payment else "No outstanding academic fee"
        return None

    def get_hostel_fee(self, obj):
        if obj.role == 'student':
            payment = Payment.objects.filter(student=obj, type__icontains='hostel', status='pending').order_by('-due_date').first()
            return payment.amount if payment else "No outstanding hostel fee"
        return None

    def get_parent_name(self, obj):
        # This assumes a reverse relationship from child (student) to parent
        # Your User model has `related_name='parents'` on the `child` FK.
        if obj.role == 'student' and obj.parents.exists(): 
            parent = obj.parents.first() # Get the first parent (assuming one primary parent)
            return f"{parent.first_name} {parent.last_name}".strip()
        return None

    def get_child_info(self, obj):
        if obj.role == 'parent' and obj.child:
            child = obj.child
            # Query fees directly for child to avoid circular imports if Payment imports UserInfoSerializer
            child_academic_fee_obj = Payment.objects.filter(student=child, type__icontains='academic', status='pending').order_by('-due_date').first()
            child_hostel_fee_obj = Payment.objects.filter(student=child, type__icontains='hostel', status='pending').order_by('-due_date').first()

            return {
                "id": child.id,
                "username": child.username,
                "name": f"{child.first_name} {child.last_name}".strip(),
                "batch": child.batch.name if child.batch else "N/A", # Access batch name via FK
                # "year": child.year, # This field is not defined on your User model, update if you add it
                "academic_fee": child_academic_fee_obj.amount if child_academic_fee_obj else "N/A",
                "hostel_fee": child_hostel_fee_obj.amount if child_hostel_fee_obj else "N/A",
                # "hostel_block": child.hostel_block # This field is not defined on your User model, update if you add it
            }
        return None

    def get_leaves_remaining(self, obj):
        # Ensure LeaveRequest model is correctly imported
        used = LeaveRequest.objects.filter(user=obj, status='approved').count()
        return max(0, 20 - used)  # Assuming 20 leaves per user/year
