from rest_framework.permissions import BasePermission

class IsAdminPrincipalOrTeacher(BasePermission):
    """
    Allows access only to admin, principal, or teacher users.
    Includes is_staff and is_hidden_superuser for broader admin access.
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        # Check if user is staff/admin, principal, teacher, or hidden superuser
        if user.is_staff or getattr(user, 'role', None) in ['admin', 'principal', 'teacher'] or getattr(user, 'is_hidden_superuser', False):
            return True
        
        return False
