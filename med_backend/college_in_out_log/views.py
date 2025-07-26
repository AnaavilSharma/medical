from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from .models import CollegeInOutLog
from .serializers import CollegeInOutLogSerializer
from users.models import User
from .permissions import IsAdminPrincipalOrHiddenSuperuser # Import permission


class CollegeEntryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.role != 'student':
            return Response({"error": "Only students can mark entry."}, status=status.HTTP_403_FORBIDDEN)

        # Prevent multiple open entries without exit
        open_entries = CollegeInOutLog.objects.filter(student=user, exit_time__isnull=True)
        if open_entries.exists():
            return Response({"error": "You have already marked entry without exit. Please mark exit first."}, status=status.HTTP_400_BAD_REQUEST)

        entry = CollegeInOutLog.objects.create(student=user, marked_by=user)
        serializer = CollegeInOutLogSerializer(entry)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class CollegeExitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.role != 'student':
            return Response({"error": "Only students can mark exit."}, status=status.HTTP_403_FORBIDDEN)

        try:
            # Get the latest entry that doesn't have an exit time for the current student
            entry = CollegeInOutLog.objects.filter(student=user, exit_time__isnull=True).latest('entry_time')
        except CollegeInOutLog.DoesNotExist:
            return Response({"error": "No open entry record found for you. Please mark entry first."}, status=status.HTTP_400_BAD_REQUEST)

        entry.exit_time = timezone.now()
        entry.marked_by = user # Ensure marked_by is the user who performs the action
        entry.save()

        serializer = CollegeInOutLogSerializer(entry)
        return Response(serializer.data)

# Pagination class for CollegeInOutLogView
class CollegeLogPagination(PageNumberPagination):
    page_size = 50 
    page_size_query_param = 'page_size'
    max_page_size = 1000 


class CollegeInOutLogView(generics.ListAPIView): # Changed from APIView to generics.ListAPIView
    queryset = CollegeInOutLog.objects.select_related('student', 'marked_by').all().order_by('-entry_time') # Optimized queryset and default ordering
    serializer_class = CollegeInOutLogSerializer
    permission_classes = [IsAuthenticated, IsAdminPrincipalOrHiddenSuperuser] # Apply custom permission
    pagination_class = CollegeLogPagination # Apply pagination
    
    # The get method is now handled by generics.ListAPIView with queryset and serializer_class
