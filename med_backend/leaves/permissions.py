# leaves/permissions.py

from rest_framework import permissions

class IsOwnerOrAdminPrincipalSuperuser(permissions.BasePermission):
    """
    Custom permission:
    - Users can create and view their own leaves
    - Admin, Principal, Hidden Superuser can view all
    - Only Admin can approve Principal's leaves
    - Admin/Principal/Hidden Superuser can approve others
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Allow safe methods for owner and privileged roles
        if request.method in permissions.SAFE_METHODS:
            return obj.user == request.user or request.user.role in ['admin', 'principal'] or request.user.is_hidden_superuser

        # Allow create for authenticated users
        if request.method == 'POST':
            return True

        # For status update (PUT/PATCH), enforce role rules
        if request.method in ['PUT', 'PATCH']:
            if obj.user.role == 'principal':
                return request.user.role == 'admin' or request.user.is_hidden_superuser
            else:
                return request.user.role in ['admin', 'principal'] or request.user.is_hidden_superuser

        return False