# payments/permissions.py

from rest_framework import permissions

SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS']

class IsAdminPrincipalSuperuser(permissions.BasePermission):
    """
    Allows full access to Admins, Principals, and Hidden Superuser.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and (
                request.user.role in ['admin', 'principal'] or
                request.user.is_hidden_superuser
            )
        )


class IsStudentOrParent(permissions.BasePermission):
    """
    Students and Parents can only view their own or their child’s payments.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'student':
            return obj.student == request.user
        elif request.user.role == 'parent' and request.user.child:
            return obj.student == request.user.child
        return False


class IsStudentUploadingProof(permissions.BasePermission):
    """
    Only allows student/parent to upload payment proof for their own dues.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.method in ['PATCH', 'PUT']
    
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'student':
            return obj.student == request.user
        elif request.user.role == 'parent' and request.user.child:
            return obj.student == request.user.child
        return False