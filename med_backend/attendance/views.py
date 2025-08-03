from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, generics
from rest_framework.exceptions import PermissionDenied # Import PermissionDenied
from django.shortcuts import get_object_or_404
from django.db import models
from .models import Batch, ClassSession, AttendanceRecord
from .serializers import BatchSerializer, ClassSessionSerializer, AttendanceRecordSerializer
# Updated import for renamed permission
from .permissions import IsAdminPrincipalOrTeacher, IsStudentOrAdminOrTeacher, IsOwnerOrAdminOrTeacher 
from users.models import User 
# from users.serializers import UserSimpleSerializer # No need to import here, already imported in serializers.py


class ClassSessionCreateView(generics.CreateAPIView):
    queryset = ClassSession.objects.all()
    serializer_class = ClassSessionSerializer
    permission_classes = [IsAuthenticated, IsAdminPrincipalOrTeacher] # Updated permission

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)


class TeacherMarkAttendanceView(APIView):
    permission_classes = [IsAuthenticated, IsAdminPrincipalOrTeacher] # Updated permission

    def post(self, request):
        session_id = request.data.get('class_session_id') # Changed to class_session_id for consistency
        if not session_id:
            return Response({"error": "class_session_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        session = get_object_or_404(ClassSession, id=session_id)

        # Ensure only assigned teacher, admin, principal, or hidden superuser can mark
        if not (request.user.is_staff or getattr(request.user, 'is_hidden_superuser', False) or request.user.role in ['admin', 'principal'] or session.teacher == request.user):
            return Response({"error": "Not authorized to mark teacher attendance for this session."},
                            status=status.HTTP_403_FORBIDDEN)

        session.teacher_attendance_marked = True
        session.save()

        # Confirm all student attendance records for this session
        AttendanceRecord.objects.filter(class_session=session).update(is_confirmed=True)

        return Response({"message": "Teacher attendance marked; student records confirmed."})


class TeacherBulkAttendanceView(APIView):
    """
    New view for teachers to mark attendance for multiple students without requiring class sessions.
    This is a simplified approach for teachers to mark attendance.
    """
    permission_classes = [IsAuthenticated, IsAdminPrincipalOrTeacher]

    def post(self, request):
        user = request.user
        
        # Ensure only teachers, admins, principals can use this endpoint
        if not (user.is_staff or getattr(user, 'is_hidden_superuser', False) or user.role in ['admin', 'principal', 'teacher']):
            return Response({"error": "Only teachers, admins, and principals can mark attendance."}, 
                          status=status.HTTP_403_FORBIDDEN)

        # Get data from request
        student_id = request.data.get('student')
        date = request.data.get('date')
        subject = request.data.get('subject')
        status_attendance = request.data.get('status', 'Present')  # Default to Present

        # Enhanced validation with specific error messages
        validation_errors = []
        
        if not student_id:
            validation_errors.append("student_id is required")
        if not date:
            validation_errors.append("date is required")
        if not subject:
            validation_errors.append("subject is required")
            
        if validation_errors:
            return Response({
                "error": "Validation failed",
                "details": validation_errors,
                "required_fields": ["student_id", "date", "subject"],
                "example": {
                    "student_id": 1,
                    "date": "2025-07-31",
                    "subject": "Anatomy",
                    "status": "Present"
                }
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Get the student
            student = get_object_or_404(User, id=student_id, role='student')
            
            # Create a simple attendance record without class session
            attendance_record = AttendanceRecord.objects.create(
                student=student,
                date=date,
                subject=subject,
                status=status_attendance,
                marked_by=user,
                is_confirmed=True  # Teacher/admin/principal marks are confirmed
            )

            return Response({
                "message": f"Attendance marked successfully for {student.username}",
                "attendance_id": attendance_record.id,
                "details": {
                    "student": student.username,
                    "date": date,
                    "subject": subject,
                    "status": status_attendance
                }
            }, status=status.HTTP_201_CREATED)

        except User.DoesNotExist:
            return Response({
                "error": "Student not found",
                "details": f"Student with ID {student_id} does not exist or is not a student"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                "error": "Failed to mark attendance",
                "details": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class MarkAttendanceView(generics.CreateAPIView):
    queryset = AttendanceRecord.objects.all()
    serializer_class = AttendanceRecordSerializer
    permission_classes = [IsAuthenticated, IsStudentOrAdminOrTeacher] # Updated permission

    def perform_create(self, serializer):
        user = self.request.user
        student = serializer.validated_data.get('student')
        class_session = serializer.validated_data.get('class_session')

        is_confirmed_status = False
        # If admin, principal, teacher, or hidden superuser marks, it's confirmed
        if user.is_staff or getattr(user, 'is_hidden_superuser', False) or user.role in ['admin', 'principal', 'teacher']:
            is_confirmed_status = True
        elif user.role == 'student':
            # Student's mark is confirmed only if the teacher has marked the session
            is_confirmed_status = class_session.teacher_attendance_marked

        serializer.save(marked_by=user, is_confirmed=is_confirmed_status)

    def post(self, request, *args, **kwargs):
        # Additional validation for students marking their own attendance
        if request.user.role == 'student':
            requested_student_id = request.data.get('student_id')
            # Ensure student is marking their own record
            if requested_student_id and int(requested_student_id) != request.user.id:
                return Response({"error": "Students can only mark their own attendance."}, status=status.HTTP_403_FORBIDDEN)
            
            session_id = request.data.get('class_session_id')
            if not session_id:
                 return Response({"error": "class_session_id is required."}, status=status.HTTP_400_BAD_REQUEST)

            session = get_object_or_404(ClassSession, id=session_id)
            # Ensure the session's batch is one the student is part of
            if not session.batch in request.user.batches.all(): 
                 return Response({"error": "Session does not belong to your batch."}, status=status.HTTP_403_FORBIDDEN)

        return super().post(request, *args, **kwargs)


class ViewMyAttendance(generics.ListAPIView):
    serializer_class = AttendanceRecordSerializer
    permission_classes = [IsAuthenticated] # Permissions are handled in get_queryset

    def get_queryset(self):
        user = self.request.user
        role = getattr(user, 'role', None)

        # Apply select_related for all related ForeignKeys to optimize queries
        base_queryset = AttendanceRecord.objects.select_related(
            'student', 'class_session__batch', 'class_session__teacher', 'marked_by'
        )

        if user.is_staff or role in ['admin', 'principal'] or getattr(user, 'is_hidden_superuser', False):
            # Admins/Principals/Hidden Superusers see all confirmed records
            return base_queryset.filter(is_confirmed=True).order_by('-class_session__date')
        elif role == 'teacher':
            # Teachers see records for sessions they teach (both confirmed and unconfirmed)
            return base_queryset.filter(class_session__teacher=user).order_by('-class_session__date')
        elif role == 'student':
            # Students see their own confirmed records
            return base_queryset.filter(student=user, is_confirmed=True).order_by('-class_session__date')
        else:
            # For other roles or unauthenticated, return nothing
            return AttendanceRecord.objects.none()


class AttendanceListByBatchView(generics.ListAPIView):
    serializer_class = AttendanceRecordSerializer
    permission_classes = [IsAuthenticated, IsAdminPrincipalOrTeacher] # Updated permission

    def get_queryset(self):
        batch_id = self.kwargs['batch_id']
        batch = get_object_or_404(Batch, id=batch_id)
        user = self.request.user

        # Updated to handle both class_session-based and direct attendance records
        base_queryset = AttendanceRecord.objects.filter(
            models.Q(class_session__batch=batch) | models.Q(student__batch=batch)
        ).select_related(
            'student', 'class_session__batch', 'class_session__teacher', 'marked_by'
        ).order_by('-date', 'student__username')

        if user.is_staff or user.role in ['admin', 'principal'] or getattr(user, 'is_hidden_superuser', False):
            return base_queryset
        elif user.role == 'teacher':
            # Teachers can view any batch attendance (simplified for new system)
            return base_queryset
        return AttendanceRecord.objects.none()


class AttendanceListByStudentView(generics.ListAPIView):
    serializer_class = AttendanceRecordSerializer
    permission_classes = [IsAuthenticated, IsAdminPrincipalOrTeacher] # Updated permission

    def get_queryset(self):
        student_id = self.kwargs['student_id']
        student = get_object_or_404(User, id=student_id)
        user = self.request.user

        base_queryset = AttendanceRecord.objects.filter(student=student).select_related(
            'student', 'class_session__batch', 'class_session__teacher', 'marked_by'
        ).order_by('-date')

        if user.is_staff or user.role in ['admin', 'principal'] or getattr(user, 'is_hidden_superuser', False):
            return base_queryset
        elif user.role == 'teacher':
            # Teachers can view any student attendance (simplified for new system)
            return base_queryset
        return AttendanceRecord.objects.none()


class AttendanceListAllView(generics.ListAPIView):
    serializer_class = AttendanceRecordSerializer
    permission_classes = [IsAuthenticated, IsAdminPrincipalOrTeacher] # Updated permission

    def get_queryset(self):
        user = self.request.user
        # Only Admin or Principal or hidden superuser can view all attendance without filters
        if user.is_staff or user.role in ['admin', 'principal'] or getattr(user, 'is_hidden_superuser', False):
            return AttendanceRecord.objects.all().select_related(
                'student', 'class_session__batch', 'class_session__teacher', 'marked_by'
            ).order_by('-date', 'student__username')
        raise PermissionDenied("You do not have permission to view all attendance records.")


class AttendanceRecordDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AttendanceRecord.objects.all().select_related( # Optimize queryset for detail view too
        'student', 'class_session__batch', 'class_session__teacher', 'marked_by'
    )
    serializer_class = AttendanceRecordSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdminOrTeacher] # This one uses the 'Owner' permission

    def get_object(self):
        obj = super().get_object()
        self.check_object_permissions(self.request, obj) # Ensures object-level permission check
        return obj

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        user = request.user
        # Only admin/principal/teacher/hidden superuser can change 'is_confirmed' status
        if 'is_confirmed' in request.data and not (user.is_staff or getattr(user, 'is_hidden_superuser', False) or user.role in ['admin', 'principal', 'teacher']):
            raise PermissionDenied("You do not have permission to change 'is_confirmed' status.")
        
        # If admin/teacher/principal/hidden superuser updates, they implicitly confirm and are the 'marked_by'
        if user.is_staff or getattr(user, 'is_hidden_superuser', False) or user.role in ['admin', 'principal', 'teacher']:
            serializer.validated_data['is_confirmed'] = True
            serializer.validated_data['marked_by'] = user 

        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object() # Ensures object-level permission check
        self.perform_destroy(instance)
        return Response({"message": "Attendance record deleted."}, status=status.HTTP_204_NO_CONTENT)


class ParentViewStudentAttendance(generics.ListAPIView):
    serializer_class = AttendanceRecordSerializer
    permission_classes = [IsAuthenticated] # Permissions based on role within get_queryset

    def get_queryset(self):
        user = self.request.user
        if user.role == 'parent' and user.child:
            return AttendanceRecord.objects.filter(student=user.child).select_related(
                'student', 'class_session__batch', 'class_session__teacher', 'marked_by'
            ).order_by('-class_session__date')
        raise PermissionDenied("You are not authorized to view student attendance.")
