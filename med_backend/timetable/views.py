from rest_framework import viewsets, permissions, generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from django.db.models import Q
from rest_framework import status
# Import all models and serializers
from .models import TimetableImage, ClassSchedule, TimetableFile
from .serializers import TimetableImageSerializer, ClassScheduleSerializer, TimetableFileSerializer
# Import Batch model from attendance app
from attendance.models import Batch
# Import Batch Serializer for BatchListView - use the SimpleBatchSerializer defined in timetable/views.py
from rest_framework import serializers
from users.models import User


# Minimal Batch Serializer for BatchListView (if not already defined in attendance app for this purpose)
class SimpleBatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Batch
        fields = ['id', 'name', 'description']


# Permissions (Assuming IsAdminPrincipalSuperuser is defined consistently in a shared permissions file or in relevant app's permissions.py)
class IsAdminPrincipalSuperuser(permissions.BasePermission):
    """
    Custom permission for Admin, Principal, or Hidden Superuser to manage timetables.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.role in ['admin', 'principal'] or getattr(request.user, 'is_hidden_superuser', False)
        )


# For ClassSchedule (structured timetable)
class ClassScheduleViewSet(viewsets.ModelViewSet):
    # Optimize queryset with select_related for batch and teacher
    queryset = ClassSchedule.objects.all().select_related('batch', 'teacher').order_by('day', 'start_time')
    serializer_class = ClassScheduleSerializer

    def get_permissions(self):
        # Admin/Principal/Hidden Superuser can create, update, delete
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsAdminPrincipalSuperuser()]
        # All authenticated users (students, teachers, parents, admins, principals) can read
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        base_queryset = ClassSchedule.objects.all().select_related('batch', 'teacher').order_by('day', 'start_time')

        if user.role == 'student':
            # Students see schedules for batches they are part of
            return base_queryset.filter(batch__users_in_batch=user)
        elif user.role == 'parent' and user.child:
            # Parents see schedules for their child's batches
            return base_queryset.filter(batch__users_in_batch=user.child)
        elif user.role == 'teacher':
            # Teachers see all classes they teach, or classes for batches they are associated with.
            # Here, filtering by classes where the teacher is assigned.
            return base_queryset.filter(Q(teacher=user) | Q(batch__class_sessions__teacher=user)).distinct()
            # The Q(batch__class_sessions__teacher=user) part ensures teachers can see all schedules for batches
            # where they teach at least one class, giving them a broader view if desired.
        elif user.role in ['admin', 'principal'] or getattr(user, 'is_hidden_superuser', False):
            # Admin/Principal/Hidden Superuser see all schedules
            return base_queryset
        
        return ClassSchedule.objects.none() # Default for other roles

    def perform_create(self, serializer):
        # If the user is a teacher, automatically assign them as the teacher for the class
        # Unless an admin/principal explicitly sets a teacher.
        if self.request.user.role == 'teacher':
            if 'teacher' not in serializer.validated_data or serializer.validated_data['teacher'] == self.request.user:
                serializer.save(teacher=self.request.user)
            else:
                raise PermissionDenied("Teachers can only create classes where they are the assigned teacher.")
        else: # Admin/Principal can create classes for any teacher
            serializer.save()


# For TimetableFile (multi-format file uploads)
class TimetableFileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for TimetableFile model supporting multiple file formats (images, PDFs, Excel files).
    """
    queryset = TimetableFile.objects.all().select_related('batch', 'uploaded_by').order_by('-uploaded_at')
    serializer_class = TimetableFileSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsAdminPrincipalSuperuser()]
        return [permissions.IsAuthenticated()] # All authenticated users can read timetable files

    def get_queryset(self):
        user = self.request.user
        base_queryset = TimetableFile.objects.all().select_related('batch', 'uploaded_by').order_by('-uploaded_at')

        if user.role == 'student':
            # Students see timetable files for batches they are part of
            return base_queryset.filter(batch__users_in_batch=user)
        elif user.role == 'parent' and user.child:
            # Parents see timetable files for their child's batches
            return base_queryset.filter(batch__users_in_batch=user.child)
        elif user.role == 'teacher':
            # Teachers can see all timetable files
            return base_queryset
        elif user.role in ['admin', 'principal'] or getattr(user, 'is_hidden_superuser', False):
            # Admin, Principal, Hidden Superuser see all timetable files
            return base_queryset
        
        return TimetableFile.objects.none()

    def perform_create(self, serializer):
        # Automatically assign the logged-in user as the uploader
        serializer.save(uploaded_by=self.request.user)

    def perform_update(self, serializer):
        # Only allow the uploader or admin/principal to update
        if (self.request.user != serializer.instance.uploaded_by and 
            self.request.user.role not in ['admin', 'principal'] and 
            not getattr(self.request.user, 'is_hidden_superuser', False)):
            raise PermissionDenied("Only the uploader or admin/principal can update timetable files.")
        serializer.save()

    def perform_destroy(self, instance):
        # Only allow the uploader or admin/principal to delete
        if (self.request.user != instance.uploaded_by and 
            self.request.user.role not in ['admin', 'principal'] and 
            not getattr(self.request.user, 'is_hidden_superuser', False)):
            raise PermissionDenied("Only the uploader or admin/principal can delete timetable files.")
        instance.delete()


# For TimetableImage (image uploads) - keeping for backward compatibility
class TimetableImageViewSet(viewsets.ModelViewSet):
    # Updated queryset to use select_related for the new Batch ForeignKey
    queryset = TimetableImage.objects.all().select_related('batch', 'uploaded_by').order_by('-uploaded_at')
    serializer_class = TimetableImageSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsAdminPrincipalSuperuser()]
        return [permissions.IsAuthenticated()] # All authenticated users can read timetable images

    def get_queryset(self):
        user = self.request.user
        base_queryset = TimetableImage.objects.all().select_related('batch', 'uploaded_by').order_by('-uploaded_at')

        if user.role == 'student':
            # Students see timetable images for batches they are part of
            return base_queryset.filter(batch__users_in_batch=user)
        elif user.role == 'parent' and user.child:
            # Parents see timetable images for their child's batches
            return base_queryset.filter(batch__users_in_batch=user.child)
        elif user.role == 'teacher':
            # Teachers might see all timetable images or only those relevant to their batches
            # For simplicity, allowing them to see all uploaded images. Adjust if stricter required.
            return base_queryset
        elif user.role in ['admin', 'principal'] or getattr(user, 'is_hidden_superuser', False):
            # Admin, Principal, Hidden Superuser see all timetable images
            return base_queryset
        
        return TimetableImage.objects.none()


class BatchListView(generics.ListAPIView):
    """
    API view to list all available batches.
    This view now correctly fetches actual Batch data from the attendance app's Batch model.
    """
    queryset = Batch.objects.all().order_by('name') # Now correctly fetches from attendance.Batch and orders
    serializer_class = SimpleBatchSerializer # Use the SimpleBatchSerializer
    permission_classes = [permissions.IsAuthenticated] # Only authenticated users can access


class BatchCreateView(generics.CreateAPIView):
    """
    API view to create new batches.
    Only admin and principal can create batches.
    """
    queryset = Batch.objects.all()
    serializer_class = SimpleBatchSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminPrincipalSuperuser]

    def perform_create(self, serializer):
        serializer.save()


class BatchAssignmentView(generics.GenericAPIView):
    """
    API view to assign students to batches.
    Only admin and principal can assign students to batches.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdminPrincipalSuperuser]

    def post(self, request):
        batch_id = request.data.get('batch_id')
        student_ids = request.data.get('student_ids', [])

        if not batch_id:
            return Response({'error': 'batch_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not student_ids:
            return Response({'error': 'student_ids is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            batch = Batch.objects.get(id=batch_id)
        except Batch.DoesNotExist:
            return Response({'error': 'Batch not found'}, status=status.HTTP_404_NOT_FOUND)

        # Get students and validate they exist
        students = User.objects.filter(id__in=student_ids, role='student')
        if len(students) != len(student_ids):
            return Response({'error': 'Some student IDs are invalid'}, status=status.HTTP_400_BAD_REQUEST)

        # Add students to batch
        batch.students.add(*students)
        
        return Response({
            'message': f'Successfully assigned {len(students)} students to batch {batch.name}',
            'batch_id': batch_id,
            'student_count': len(students)
        }, status=status.HTTP_200_OK)
