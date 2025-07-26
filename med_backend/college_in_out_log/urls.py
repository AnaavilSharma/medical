# college_in_out_log/urls.py

from django.urls import path
from .views import CollegeEntryView, CollegeExitView, CollegeInOutLogView

urlpatterns = [
    path('entry/', CollegeEntryView.as_view(), name='college-entry'),
    path('exit/', CollegeExitView.as_view(), name='college-exit'),
    path('logs/', CollegeInOutLogView.as_view(), name='college-in-out-log-list'),
]