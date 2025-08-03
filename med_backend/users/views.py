from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from users.serializers import UserSerializer
from django.contrib.auth import authenticate
from attendance.models import Batch
from rest_framework_simplejwt.views import TokenRefreshView

from .serializers import UserSerializer, UserInfoSerializer
from .models import User


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]  # Keep AllowAny for public registration

    def create(self, request, *args, **kwargs):
        # Check if user is trying to create admin/principal/teacher roles
        role = request.data.get('role')
        if role in ['admin', 'principal', 'teacher']:
            # Require authentication for these roles
            if not request.user.is_authenticated:
                return Response({
                    "error": "Authentication required to create admin, principal, or teacher accounts."
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Check if authenticated user has permission
            if request.user.role not in ['admin', 'principal', 'hidden_superuser']:
                return Response({
                    "error": "Only admin or principal users can create admin, principal, or teacher accounts."
                }, status=status.HTTP_403_FORBIDDEN)
        
        # Pass request context to serializer for role validation in UserSerializer
        serializer = self.get_serializer(data=request.data, context={'request': request}) 
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(generics.GenericAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        username = request.data.get("username")
        password = request.data.get("password")
        role = request.data.get("role") # Assuming frontend sends 'role' in payload

        if not username or not password or not role:
            return Response({"error": "Username, password, and role are required."},
                            status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=username, password=password)

        if user is None:
            return Response({"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

        # Hidden superuser login bypasses role check, giving full access
        if getattr(user, 'is_hidden_superuser', False):
            pass  
        else:
            if user.role != role:
                return Response({"error": "Role mismatch. You are logged in as a different role."}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "username": user.username,
            "role": user.role,
            "id": user.id,
            "is_hidden_superuser": getattr(user, 'is_hidden_superuser', False)
        }, status=status.HTTP_200_OK)


class MyInfoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Optimize queryset for N+1 queries using select_related for related FKs
        # and prefetch_related for reverse FKs (like payments, leave_requests, parents)
        user_queryset = User.objects.filter(pk=request.user.pk).select_related('batch', 'child').prefetch_related('parents', 'leave_requests', 'payments')
        user_obj = user_queryset.first() 

        if user_obj:
            # Pass request context to UserInfoSerializer for methods that need it (e.g., for image URLs if any)
            serializer = UserInfoSerializer(user_obj, context={'request': request})
            return Response(serializer.data, status=200)
        return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)


class AssignBatchView(APIView):
    """
    API view to assign users to batches.
    Only admin and principal can assign users to batches.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Check if user has permission
        if request.user.role not in ['admin', 'principal', 'hidden_superuser']:
            return Response({
                "error": "Only admin or principal users can assign users to batches."
            }, status=status.HTTP_403_FORBIDDEN)

        batch_id = request.data.get('batch_id')
        user_ids = request.data.get('user_ids', [])

        if not batch_id:
            return Response({'error': 'batch_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not user_ids:
            return Response({'error': 'user_ids is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            batch = Batch.objects.get(id=batch_id)
        except Batch.DoesNotExist:
            return Response({'error': 'Batch not found'}, status=status.HTTP_404_NOT_FOUND)

        # Get users and validate they exist
        users = User.objects.filter(id__in=user_ids)
        if len(users) != len(user_ids):
            return Response({'error': 'Some user IDs are invalid'}, status=status.HTTP_400_BAD_REQUEST)

        # Update users' batch field
        updated_count = 0
        for user in users:
            user.batch = batch
            user.save()
            updated_count += 1
        
        return Response({
            'message': f'Successfully assigned {updated_count} users to batch {batch.name}',
            'batch_id': batch_id,
            'user_count': updated_count
        }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_users(request):
    role = request.query_params.get('role')
    if role:
        users = User.objects.filter(role=role)
    else:
        users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def token_refresh(request):
    """Custom token refresh endpoint with better error handling"""
    try:
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({
                'error': 'Refresh token is required',
                'details': 'Please provide a refresh token'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Use the built-in token refresh view
        refresh_view = TokenRefreshView.as_view()
        response = refresh_view(request._request)
        
        if response.status_code == 200:
            return Response({
                'access': response.data.get('access'),
                'message': 'Token refreshed successfully'
            })
        else:
            return Response({
                'error': 'Token refresh failed',
                'details': 'Invalid or expired refresh token'
            }, status=status.HTTP_401_UNAUTHORIZED)
            
    except Exception as e:
        return Response({
            'error': 'Token refresh error',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)