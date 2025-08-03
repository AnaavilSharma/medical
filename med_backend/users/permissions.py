from rest_framework.permissions import BasePermission

class IsAdminOrPrincipal(BasePermission):
    """
    Custom permission to only allow admins and principals to access the view.
    """
    
    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user has admin or principal role
        return request.user.role in ['admin', 'principal'] 