from rest_framework.permissions import BasePermission

class IsAdminPrincipalOrHiddenSuperuser(BasePermission):
    """
    Allow access only to admin, principal, or hidden superuser.
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_staff:  # Admin and Django superusers
            return True
        
        if getattr(user, 'role', None) in ['admin', 'principal']:  # Modified to include 'admin'
            return True

        if getattr(user, 'is_hidden_superuser', False):
            return True

        return False