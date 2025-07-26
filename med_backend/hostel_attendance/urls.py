# hostel_attendance/urls.py

from django.urls import path
from .views import HostelEntryView, HostelExitView, HostelAttendanceLogView

urlpatterns = [
    path('entry/', HostelEntryView.as_view(), name='hostel-entry'),
    path('exit/', HostelExitView.as_view(), name='hostel-exit'),
    path('logs/', HostelAttendanceLogView.as_view(), name='hostel-attendance-logs'),
]