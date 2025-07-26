from django.urls import path, include
from rest_framework.routers import DefaultRouter
# Import both ViewSets
from .views import TimetableImageViewSet, BatchListView, ClassScheduleViewSet 

router = DefaultRouter()
router.register(r'images', TimetableImageViewSet, basename='timetable-images') # For timetable images
router.register(r'classes', ClassScheduleViewSet, basename='class-schedule') # New router for structured timetable data

urlpatterns = [
    path('', include(router.urls)),
    path('batches/', BatchListView.as_view(), name='batch-list'), # Existing endpoint for batches
]
