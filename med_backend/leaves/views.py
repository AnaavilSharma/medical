from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import LeaveRequest
from .serializers import LeaveRequestSerializer
from users.models import User
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied # Import PermissionDenied


class IsOwnerOrAdminPrincipalSuperuser(permissions.BasePermission):
    """
    Custom permission for LeaveRequest:
    - Authenticated users can create their own leave requests.
    - Owners (the user who applied for leave) can view their own leave requests.
    - Admin, Principal, and Hidden Superuser can view all leave requests.
    - Only Admin, Principal, and Hidden Superuser can approve/reject (update status) of other users' leaves.
    - Specific rule: Only Admin/Hidden Superuser can approve/reject Principal's leaves.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user = request.user

        # Allow safe methods (GET, HEAD, OPTIONS) for owner and privileged roles
        if request.method in permissions.SAFE_METHODS:
            return obj.user == user or user.role in ['admin', 'principal'] or getattr(user, 'is_hidden_superuser', False)

        # Allow authenticated users to create (POST) their own leave requests
        if view.action == 'create' and request.method == 'POST':
            return True # Creation is handled in perform_create

        # For status update (PUT/PATCH), enforce role rules
        if view.action in ['update', 'partial_update']:
            # Check if the object's user is a 'principal'
            if obj.user.role == 'principal':
                # Only 'admin' or 'hidden_superuser' can approve/reject a 'principal's' leave
                return user.role == 'admin' or getattr(user, 'is_hidden_superuser', False)
            else:
                # For all other roles, 'admin', 'principal', or 'hidden_superuser' can modify status
                return user.role in ['admin', 'principal'] or getattr(user, 'is_hidden_superuser', False)
        
        # Deny all other unsafe methods (e.g., PUT/PATCH for non-status fields, DELETE)
        return False


class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all().order_by('-applied_at')
    serializer_class = LeaveRequestSerializer
    permission_classes = [IsOwnerOrAdminPrincipalSuperuser]

    def get_queryset(self):
        user = self.request.user
        # Optimize queryset with select_related for the 'user' foreign key
        if user.role in ['admin', 'principal'] or getattr(user, 'is_hidden_superuser', False):
            # Admin, Principal, Superuser see all
            return self.queryset.select_related('user')
        # All other authenticated users see only their own leaves
        return self.queryset.filter(user=user).select_related('user')

    def perform_create(self, serializer):
        # Assign the logged-in user automatically on leave creation
        serializer.save(user=self.request.user)

    def update(self, request, *args, **kwargs):
        instance = self.get_object() # This calls has_object_permission for update actions
        
        # Check if the request is trying to update only the 'status' field
        if 'status' in request.data and len(request.data) == 1:
            status_val = request.data['status']
            # Validate status value against defined choices
            if status_val not in [choice[0] for choice in LeaveRequest.STATUS_CHOICES]:
                return Response({'detail': f'Invalid status value: {status_val}. Must be one of {", ".join([c[0] for c in LeaveRequest.STATUS_CHOICES])}'}, status=status.HTTP_400_BAD_REQUEST)

            # Permissions for status update are already handled by IsOwnerOrAdminPrincipalSuperuser.has_object_permission
            instance.status = status_val
            instance.save()
            serializer = self.get_serializer(instance) # Serialize the updated instance
            return Response(serializer.data)
        else:
            # Prevent non-status field updates for non-privileged users
            user = request.user
            if not (user.is_staff or getattr(user, 'is_hidden_superuser', False) or user.role in ['admin', 'principal']):
                return Response({'detail': 'Only status can be updated by non-privileged users via this endpoint.'}, status=status.HTTP_400_BAD_REQUEST)
            
            # For admin/principal/superuser, allow all fields in PATCH (partial update)
            partial = kwargs.pop('partial', False)
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object() # This calls has_object_permission for destroy actions
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

