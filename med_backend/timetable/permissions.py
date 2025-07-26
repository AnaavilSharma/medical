# timetable/permissions.py

from rest_framework import permissions


class IsAdminPrincipalSuperuser(permissions.BasePermission):
    """
    Allows access only to Admins, Principals, or Hidden Superusers.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and (
                request.user.role in ['admin', 'principal'] or request.user.is_hidden_superuser
            )
        )


class IsReadOnly(permissions.BasePermission):
    """
    Allows read-only access for authenticated users.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        return False