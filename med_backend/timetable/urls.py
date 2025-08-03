from django.urls import path, include
from rest_framework.routers import DefaultRouter
# Import both ViewSets
from .views import TimetableImageViewSet, TimetableFileViewSet, BatchListView, ClassScheduleViewSet, BatchCreateView, BatchAssignmentView

router = DefaultRouter()
router.register(r'images', TimetableImageViewSet, basename='timetable-images') # For timetable images
router.register(r'files', TimetableFileViewSet, basename='timetable-files') # For multi-format timetable files
router.register(r'classes', ClassScheduleViewSet, basename='class-schedule') # New router for structured timetable data

urlpatterns = [
    path('', include(router.urls)),
    path('batches/', BatchListView.as_view(), name='batch-list'), # Existing endpoint for batches
    path('batches/create/', BatchCreateView.as_view(), name='batch-create'), # New endpoint for creating batches
    path('batches/assign/', BatchAssignmentView.as_view(), name='batch-assign'), # New endpoint for assigning students
]
