from rest_framework.permissions import BasePermission

class IsAdminPrincipalOrHiddenSuperuser(BasePermission):
    """
    Allow access only to admin, principal, or hidden superuser.
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_staff or getattr(user, 'role', '') == 'principal' or getattr(user, 'is_hidden_superuser', False):
            return True
        return False