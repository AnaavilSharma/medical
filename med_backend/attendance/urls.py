from django.urls import path
from .views import (
    ClassSessionCreateView,
    TeacherMarkAttendanceView,
    MarkAttendanceView,
    ViewMyAttendance,
    AttendanceRecordDetailView,
    AttendanceListByBatchView,
    AttendanceListByStudentView,
    AttendanceListAllView,
    ParentViewStudentAttendance,
)

urlpatterns = [
    path('classsession/create/', ClassSessionCreateView.as_view(), name='create-class-session'),
    path('teacher/mark/', TeacherMarkAttendanceView.as_view(), name='teacher-mark-attendance'),
    path('attendance/mark/', MarkAttendanceView.as_view(), name='mark-attendance'),
    path('attendance/my/', ViewMyAttendance.as_view(), name='view-my-attendance'),
    path('attendance/batch/<int:batch_id>/', AttendanceListByBatchView.as_view(), name='attendance-by-batch'),
    path('attendance/student/<int:student_id>/', AttendanceListByStudentView.as_view(), name='attendance-by-student'),
    path('attendance/all/', AttendanceListAllView.as_view(), name='attendance-all'),
    path('attendance/<int:pk>/', AttendanceRecordDetailView.as_view(), name='attendance-detail'),
    path('parent/student/attendance/', ParentViewStudentAttendance.as_view(), name='parent-view-student-attendance'),
]
