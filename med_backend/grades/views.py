from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, generics # Import generics
from rest_framework.exceptions import PermissionDenied # Import PermissionDenied
from django.shortcuts import get_object_or_404
from .models import Grade
from .serializers import GradeSerializer, GradeCreateSerializer
from .permissions import IsAdminPrincipalOrTeacher # Updated permission import
from users.models import User # For querying User model
from attendance.models import ClassSession # For teacher permissions with students


class AddGradeView(generics.CreateAPIView): # Changed from APIView to generics.CreateAPIView
    queryset = Grade.objects.all()
    serializer_class = GradeCreateSerializer
    permission_classes = [IsAuthenticated, IsAdminPrincipalOrTeacher]

    def perform_create(self, serializer):
        # Ensure the teacher in the payload matches the current user if role is teacher,
        # or that an admin/principal is performing the action.
        user = self.request.user
        teacher_in_payload = serializer.validated_data.get('teacher')

        if user.is_staff or getattr(user, 'is_hidden_superuser', False) or user.role in ['admin', 'principal']:
            # Admin/Principal/Hidden Superuser can add grades for any teacher
            serializer.save()
        elif user.role == 'teacher':
            if teacher_in_payload and teacher_in_payload != user:
                raise PermissionDenied("Teachers can only add grades for themselves as the 'teacher' in the record.")
            serializer.save(teacher=user) # Ensure logged-in teacher is the one marking
        else:
            raise PermissionDenied("You do not have permission to add grades.")


class MyGradesView(generics.ListAPIView): # Changed from APIView to generics.ListAPIView
    serializer_class = GradeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Optimize queryset with select_related for related FKs
        base_queryset = Grade.objects.select_related('student', 'teacher').order_by('-date_recorded')

        if user.role == 'student':
            # Student sees only their own grades
            return base_queryset.filter(student=user)
        elif user.role == 'teacher':
            # Teachers see grades they have given
            return base_queryset.filter(teacher=user)
        # Admin/Principal should use AdminGradeListView for all grades
        # For other roles, deny access
        raise PermissionDenied("Access denied. This view is for students/teachers only.")


class UpdateGradeView(generics.RetrieveUpdateAPIView): # Changed from APIView to generics.RetrieveUpdateAPIView
    queryset = Grade.objects.all() # Queryset for object lookup
    serializer_class = GradeCreateSerializer # Use GradeCreateSerializer for updates (it has all writable fields)
    permission_classes = [IsAuthenticated, IsAdminPrincipalOrTeacher]

    def get_object(self):
        user = self.request.user
        pk = self.kwargs['pk']
        # Optimize object retrieval with select_related
        grade = get_object_or_404(Grade.objects.select_related('student', 'teacher'), pk=pk) 

        # Admin/Principal/Hidden Superuser can update any grade
        if user.is_staff or getattr(user, 'is_hidden_superuser', False) or user.role in ['admin', 'principal']:
            return grade
        # Teacher can only update their own given grades
        elif user.role == 'teacher' and grade.teacher == user:
            return grade
        
        raise PermissionDenied("You do not have permission to update this grade.")


class DeleteGradeView(generics.DestroyAPIView): # Changed from APIView to generics.DestroyAPIView
    queryset = Grade.objects.all() # Queryset for object lookup
    permission_classes = [IsAuthenticated, IsAdminPrincipalOrTeacher]

    def get_object(self):
        user = self.request.user
        pk = self.kwargs['pk']
        # Optimize object retrieval with select_related
        grade = get_object_or_404(Grade.objects.select_related('student', 'teacher'), pk=pk)

        if user.is_staff or getattr(user, 'is_hidden_superuser', False) or user.role in ['admin', 'principal']:
            return grade
        elif user.role == 'teacher' and grade.teacher == user:
            return grade
        
        raise PermissionDenied("You do not have permission to delete this grade.")


class GradesGivenByTeacherView(generics.ListAPIView): # Changed from APIView to generics.ListAPIView
    serializer_class = GradeSerializer
    permission_classes = [IsAuthenticated, IsAdminPrincipalOrTeacher] # Permissions based on role within get_queryset

    def get_queryset(self):
        user = self.request.user
        base_queryset = Grade.objects.select_related('student', 'teacher').order_by('-date_recorded')

        if user.role == 'teacher':
            return base_queryset.filter(teacher=user)
        elif user.is_staff or user.role in ['admin', 'principal'] or getattr(user, 'is_hidden_superuser', False):
            # Admin/Principal/Hidden Superuser can see all grades (similar to AdminGradeListView but via a different path)
            return base_queryset
        raise PermissionDenied("Access denied. This view is for teachers, admins, principals, and hidden superusers.")
    
    
class AdminGradeListView(generics.ListAPIView): # Changed from APIView to generics.ListAPIView
    serializer_class = GradeSerializer
    permission_classes = [IsAuthenticated, IsAdminPrincipalOrTeacher] # Only Admin/Principal/Hidden Superuser can view all

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.role in ['admin', 'principal'] or getattr(user, 'is_hidden_superuser', False):
            return Grade.objects.all().select_related('student', 'teacher').order_by('-date_recorded')
        raise PermissionDenied("Access denied. Only admins, principals, and hidden superusers can view all grades.")

# List grades given by the teacher (Teacher only)
class TeacherGradeListView(generics.ListAPIView): # Changed from APIView to generics.ListAPIView
    serializer_class = GradeSerializer
    permission_classes = [IsAuthenticated, IsAdminPrincipalOrTeacher] # Only teachers, admins, principals

    def get_queryset(self):
        user = self.request.user
        base_queryset = Grade.objects.select_related('student', 'teacher').order_by('-date_recorded')

        if user.role == 'teacher':
            return base_queryset.filter(teacher=user)
        elif user.is_staff or user.role in ['admin', 'principal'] or getattr(user, 'is_hidden_superuser', False):
            # If an admin/principal accesses this, they can see all grades given by any teacher
            return base_queryset.filter(teacher__isnull=False) # Only show grades that have a teacher assigned
        raise PermissionDenied("Access denied. Only teachers, admins, principals, and hidden superusers can view grades given by teachers.")


# NEW VIEW: To get grades for a specific student (used by admin/teacher)
class GradesByStudentIdView(generics.ListAPIView):
    serializer_class = GradeSerializer
    permission_classes = [IsAuthenticated, IsAdminPrincipalOrTeacher] # Only admin/principal/teacher can access

    def get_queryset(self):
        student_id = self.kwargs['student_id']
        student = get_object_or_404(User, id=student_id)
        user = self.request.user
        
        base_queryset = Grade.objects.filter(student=student).select_related('student', 'teacher').order_by('-date_recorded')

        if user.is_staff or user.role in ['admin', 'principal'] or getattr(user, 'is_hidden_superuser', False):
            return base_queryset
        elif user.role == 'teacher':
            # Teachers can see grades for students in their assigned batches (if any)
            # or simply grades where they are the teacher. For simplicity here, let's allow
            # a teacher to see all grades of a student if the teacher has any class sessions
            # with that student's batch, or if they have given a grade to that student.
            if ClassSession.objects.filter(teacher=user, batch__students=student).exists() or \
               Grade.objects.filter(teacher=user, student=student).exists():
                return base_queryset
            raise PermissionDenied("You do not have permission to view grades for this student.")
        raise PermissionDenied("Access denied.")


# NEW VIEW: For parents to view their child's grades
class ParentViewStudentGrades(generics.ListAPIView):
    serializer_class = GradeSerializer
    permission_classes = [IsAuthenticated] # Permissions based on role within get_queryset

    def get_queryset(self):
        user = self.request.user
        if user.role == 'parent' and user.child:
            # Parents can only view grades for their linked child, with prefetching
            return Grade.objects.filter(student=user.child).select_related('student', 'teacher').order_by('-date_recorded')
        raise PermissionDenied("You are not authorized to view student grades.")
