from rest_framework import status, generics # Import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination # Import pagination
from django.utils import timezone
from .models import HostelAttendance
from .serializers import HostelAttendanceSerializer
from users.models import User
from .permissions import IsAdminPrincipalOrHiddenSuperuser # Import permission


class HostelEntryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.role != 'student':
            return Response({"error": "Only students can mark hostel entry."}, status=status.HTTP_403_FORBIDDEN)

        # Prevent multiple entry logs without exit
        open_entries = HostelAttendance.objects.filter(student=user, exit_time__isnull=True)
        if open_entries.exists():
            return Response({"error": "You have already marked an entry without an exit. Please mark exit first."}, status=status.HTTP_400_BAD_REQUEST)

        entry = HostelAttendance.objects.create(student=user, marked_by=user)
        serializer = HostelAttendanceSerializer(entry)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class HostelExitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.role != 'student':
            return Response({"error": "Only students can mark hostel exit."}, status=status.HTTP_403_FORBIDDEN)

        try:
            # Get the latest entry that doesn't have an exit time for the current student
            entry = HostelAttendance.objects.filter(student=user, exit_time__isnull=True).latest('entry_time')
        except HostelAttendance.DoesNotExist:
            return Response({"error": "No open entry record found. Please mark entry first."}, status=status.HTTP_400_BAD_REQUEST)

        entry.exit_time = timezone.now()
        entry.marked_by = user # Ensure marked_by is the user who performs the action
        entry.save()

        serializer = HostelAttendanceSerializer(entry)
        return Response(serializer.data)

# Pagination class for HostelAttendanceLogView
class HostelAttendanceLogPagination(PageNumberPagination):
    page_size = 50 
    page_size_query_param = 'page_size'
    max_page_size = 1000


class HostelAttendanceLogView(generics.ListAPIView): # Changed from APIView to generics.ListAPIView
    queryset = HostelAttendance.objects.select_related('student', 'marked_by').all().order_by('-entry_time') # Optimized queryset and default ordering
    serializer_class = HostelAttendanceSerializer
    permission_classes = [IsAuthenticated, IsAdminPrincipalOrHiddenSuperuser] # Apply custom permission
    pagination_class = HostelAttendanceLogPagination # Apply pagination
    
    # The get method is now handled by generics.ListAPIView with queryset and serializer_class
