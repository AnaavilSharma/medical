from rest_framework import serializers
from .models import TimetableImage, ClassSchedule, TimetableFile # Import new model
from users.serializers import UserSimpleSerializer # Import UserSimpleSerializer
from attendance.models import Batch # For Batch name access in ClassScheduleSerializer


class ClassScheduleSerializer(serializers.ModelSerializer):
    """
    Serializer for ClassSchedule model, providing structured timetable data.
    Flattens batch name and teacher name for direct access.
    Formats time for frontend display.
    """
    batch_name = serializers.CharField(source='batch.name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.username', read_only=True) # Or full_name if available

    class Meta:
        model = ClassSchedule
        fields = ['id', 'batch', 'batch_name', 'day', 'start_time', 'end_time', 'subject', 'room', 'teacher', 'teacher_name']
        read_only_fields = ['id', 'batch_name', 'teacher_name'] # batch and teacher are FKs, so can be written via their IDs.

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Format time fields to HH:MM string for frontend display
        representation['start_time'] = instance.start_time.strftime('%H:%M')
        representation['end_time'] = instance.end_time.strftime('%H:%M')
        # Add the 'time' field as requested by frontend, combining start and end time
        representation['time'] = f"{instance.start_time.strftime('%H:%M')} - {instance.end_time.strftime('%H:%M')}"
        return representation


class TimetableFileSerializer(serializers.ModelSerializer):
    """
    Serializer for TimetableFile model, supporting multiple file formats (images, PDFs, Excel files).
    """
    uploaded_by = UserSimpleSerializer(read_only=True)
    file_url = serializers.SerializerMethodField()
    batch_name = serializers.CharField(source='batch.name', read_only=True)
    file_extension = serializers.CharField(source='get_file_extension', read_only=True)
    file_size = serializers.CharField(source='get_file_size', read_only=True)

    class Meta:
        model = TimetableFile
        fields = [
            'id', 'batch', 'batch_name', 'term', 'effective_date', 'file', 'file_url',
            'file_type', 'title', 'description', 'uploaded_by', 'uploaded_at',
            'is_active', 'file_extension', 'file_size'
        ]
        read_only_fields = ['uploaded_by', 'uploaded_at', 'file_url', 'batch_name', 'file_extension', 'file_size']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and hasattr(obj.file, 'url'):
            return request.build_absolute_uri(obj.file.url) if request else obj.file.url
        return None

    def create(self, validated_data):
        # Automatically assign the logged-in user as the uploader
        validated_data['uploaded_by'] = self.context['request'].user
        return super().create(validated_data)

    def validate_file(self, value):
        """
        Validate file type and size
        """
        if value:
            # Check file size (max 10MB)
            if value.size > 10 * 1024 * 1024:  # 10MB
                raise serializers.ValidationError("File size must be less than 10MB")
            
            # Check file extension
            allowed_extensions = {
                'image': ['.jpg', '.jpeg', '.png', '.gif', '.bmp'],
                'pdf': ['.pdf'],
                'excel': ['.xls', '.xlsx']
            }
            
            file_extension = value.name.lower()
            if not any(file_extension.endswith(ext) for extensions in allowed_extensions.values() for ext in extensions):
                raise serializers.ValidationError(
                    "File must be an image (JPG, PNG, GIF, BMP), PDF, or Excel file (XLS, XLSX)"
                )
        
        return value


class TimetableImageSerializer(serializers.ModelSerializer):
    """
    Serializer for TimetableImage model, primarily for image uploads.
    Includes full user object for uploader and batch name.
    """
    uploaded_by = UserSimpleSerializer(read_only=True) # Use UserSimpleSerializer for uploader
    image_url = serializers.SerializerMethodField() # Provides full URL to the image file
    batch_name = serializers.CharField(source='batch.name', read_only=True) # Display batch name from FK

    class Meta:
        model = TimetableImage
        fields = ['id', 'batch', 'batch_name', 'term', 'effective_date', 'image', 'image_url', 'uploaded_by', 'uploaded_at']
        read_only_fields = ['uploaded_by', 'uploaded_at', 'image_url', 'batch_name'] # These fields are set by the system or derived

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None

    def create(self, validated_data):
        # Automatically assign the logged-in user as the uploader
        validated_data['uploaded_by'] = self.context['request'].user
        return super().create(validated_data)
