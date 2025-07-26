from rest_framework import serializers
from .models import Batch, ClassSession, AttendanceRecord
from users.models import User
from users.serializers import UserSimpleSerializer  # Import UserSimpleSerializer


class BatchSerializer(serializers.ModelSerializer):
    """
    Serializer for the Batch model.
    Includes a list of students in the batch and allows adding students by ID.
    """
    students = UserSimpleSerializer(many=True, read_only=True) # Use UserSimpleSerializer for students
    student_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=User.objects.filter(role='student'), write_only=True, source='students'
    )

    class Meta:
        model = Batch
        fields = ['id', 'name', 'students', 'student_ids']


class ClassSessionSerializer(serializers.ModelSerializer):
    """
    Serializer for the ClassSession model.
    Allows linking to a Batch by ID and displays full Batch and Teacher objects.
    """
    batch = BatchSerializer(read_only=True)
    batch_id = serializers.PrimaryKeyRelatedField(
        queryset=Batch.objects.all(), source='batch', write_only=True
    )
    teacher = UserSimpleSerializer(read_only=True) # Use UserSimpleSerializer for teacher

    class Meta:
        model = ClassSession
        fields = [
            'id',
            'batch', 'batch_id',
            'teacher',
            'date',
            'topic',
            'teacher_attendance_marked', # Include this for admin/teacher view
        ]


class AttendanceRecordSerializer(serializers.ModelSerializer):
    """
    Serializer for the AttendanceRecord model.
    Flattens related ClassSession and User fields for simpler frontend consumption.
    """
    student = UserSimpleSerializer(read_only=True) # Use UserSimpleSerializer
    student_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='student'), source='student', write_only=True
    )

    # Flattened fields from ClassSession for direct frontend access
    subject = serializers.CharField(source='class_session.topic', read_only=True) # Maps ClassSession's topic to 'subject'
    date = serializers.DateField(source='class_session.date', read_only=True) # Maps ClassSession's date
    batch = serializers.CharField(source='class_session.batch.name', read_only=True) # Maps ClassSession's batch name

    marked_by = UserSimpleSerializer(read_only=True) # Use UserSimpleSerializer for marked_by

    class Meta:
        model = AttendanceRecord
        fields = [
            'id',
            'student', 'student_id',
            # Removed 'class_session' as a nested object to avoid redundancy with flattened fields
            'subject', 'date', 'batch', # Flattened fields from ClassSession
            'class_session_id', # Keep for writing/linking to a session
            'status',
            'marked_by',
            'marked_at',
            'is_confirmed', # This field tells whether teacher marked session
        ]
        read_only_fields = ['marked_at', 'is_confirmed', 'marked_by'] # These fields are set by the system or specific roles
