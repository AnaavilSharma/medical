from django.urls import path
from .views import (
    AddGradeView,
    MyGradesView,
    GradesGivenByTeacherView,
    UpdateGradeView,
    DeleteGradeView,
    AdminGradeListView,
    TeacherGradeListView,
    GradesByStudentIdView, # New Import
    ParentViewStudentGrades, # New Import
)

urlpatterns = [
    path('add/', AddGradeView.as_view(), name='add-grade'),
    path('my/', MyGradesView.as_view(), name='my-grades'), # For logged-in student/teacher
    path('given/', GradesGivenByTeacherView.as_view(), name='grades-given'), # Grades given by the logged-in teacher (or all for admin)
    path('update/<int:pk>/', UpdateGradeView.as_view(), name='update-grade'),
    path('delete/<int:pk>/', DeleteGradeView.as_view(), name='delete-grade'),
    
    # Endpoints directly called by frontend for various roles
    path('admin/list/', AdminGradeListView.as_view(), name='admin-grade-list'), # Backend endpoint for /api/grades/all/
    path('teacher/list/', TeacherGradeListView.as_view(), name='teacher-grade-list'), # Dedicated for teachers to view grades they gave
    path('student/<int:student_id>/', GradesByStudentIdView.as_view(), name='grades-by-student-id'), # For admin/teacher to fetch specific student's grades
    path('parent/student/grades/', ParentViewStudentGrades.as_view(), name='parent-view-student-grades'), # For parents to view child's grades
]
