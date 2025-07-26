from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from users.serializers import UserSerializer
from django.contrib.auth import authenticate

from .serializers import UserSerializer, UserInfoSerializer
from .models import User


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
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
            "id": user.id
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

@api_view(['GET'])
@permission_classes([IsAuthenticated])

def list_users(request):
    role = request.query_params.get('role')
    if role:
        users = CustomUser.objects.filter(role=role)
    else:
        users = CustomUser.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)