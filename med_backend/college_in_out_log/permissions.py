from rest_framework.permissions import BasePermission

class IsAdminPrincipalOrHiddenSuperuser(BasePermission):
    """
    Allows access only to admin, principal, and hidden superuser users.
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        if user.is_staff:  # Admin and Django superusers
            return True
        
        if getattr(user, 'role', None) in ['admin', 'principal']:
            return True

        if getattr(user, 'is_hidden_superuser', False):
            return True

        return False
