from django.urls import path
from .views import (
    AddGradeView, AdminGradeListView, TeacherGradeListView, StudentGradesListView,
    MyGradesView, UpdateGradeView, DeleteGradeView, GradesGivenByTeacherView,
    GradesByStudentIdView, ParentViewStudentGrades, GradesByBatchView
)

urlpatterns = [
    path('add/', AddGradeView.as_view(), name='add-grade'),
    path('admin/list/', AdminGradeListView.as_view(), name='admin-grades-list'),
    path('teacher/list/', TeacherGradeListView.as_view(), name='teacher-grades-list'),
    path('student/list/', StudentGradesListView.as_view(), name='student-grades-list'),
    
    # Additional endpoints for frontend compatibility
    path('my/', MyGradesView.as_view(), name='my-grades'),
    path('given/', GradesGivenByTeacherView.as_view(), name='grades-given'),
    path('parent/student/grades/', ParentViewStudentGrades.as_view(), name='parent-student-grades'),
    path('student/<int:student_id>/', GradesByStudentIdView.as_view(), name='grades-by-student'),
    path('batch/<int:batch_id>/', GradesByBatchView.as_view(), name='grades-by-batch'),
    path('<int:pk>/update/', UpdateGradeView.as_view(), name='update-grade'),
    path('<int:pk>/delete/', DeleteGradeView.as_view(), name='delete-grade'),
]
