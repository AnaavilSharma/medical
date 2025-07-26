from rest_framework import serializers
from .models import Grade
from users.models import User
from users.serializers import UserSimpleSerializer # Import UserSimpleSerializer


class GradeSerializer(serializers.ModelSerializer):
    """
    Serializer for displaying Grade records.
    Uses UserSimpleSerializer for related student and teacher objects
    and adds a flattened student_name for convenience.
    """
    student = UserSimpleSerializer(read_only=True) # Use UserSimpleSerializer
    teacher = UserSimpleSerializer(read_only=True) # Use UserSimpleSerializer

    # Add flattened fields from student for frontend display consistency
    student_name = serializers.CharField(source='student.username', read_only=True) 
    # Frontend might expect 'exam' and 'maxMarks', assuming 'subject' and 'marks' cover this.
    # If these are separate fields on Grade model, ensure they are included.
    # For now, mapping subject to exam if needed, and maxMarks is not present on Grade model.
    exam = serializers.CharField(source='subject', read_only=True) # Assuming subject acts as exam name
    # maxMarks is not a field on Grade. If needed, it must be added to the model or derived.
    maxMarks = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True, default=100.00) # Mock if not present

    class Meta:
        model = Grade
        fields = [
            'id', 'student', 'student_name', 'teacher', 'subject', 
            'marks', 'grade', 'remarks', 'date_recorded', 
            'exam', 'maxMarks' # Include flattened/mocked fields
        ]
        read_only_fields = ['date_recorded']


class GradeCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating Grade records.
    Allows specifying student and teacher by their primary keys.
    """
    # Student and teacher are required as PrimaryKeyRelatedField for writing
    student = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(role='student'))
    teacher = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(role='teacher'))

    class Meta:
        model = Grade
        fields = ['student', 'teacher', 'subject', 'marks', 'grade', 'remarks']

