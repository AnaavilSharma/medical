from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminPrincipalOrTeacher(BasePermission):
    """
    Allows access only to admin, principal, or teacher users.
    Includes is_staff and is_hidden_superuser for broader admin access.
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        # Explicitly check for 'admin', 'principal' roles or is_staff/is_hidden_superuser
        return user.is_staff or getattr(user, 'role', None) in ['teacher', 'admin', 'principal'] or getattr(user, 'is_hidden_superuser', False)


class IsStudentOrAdminOrTeacher(BasePermission):
    """
    Allows access to students, teachers, admins, principals, and hidden superusers.
    Students can only mark and view their own attendance.
    Admins, principals, teachers, and hidden superusers have broader access.
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        # Check for admin, principal, hidden superuser or student/teacher role
        return user.is_staff or getattr(user, 'role', None) in ['teacher', 'student', 'admin', 'principal'] or getattr(user, 'is_hidden_superuser', False)


class IsOwnerOrAdminOrTeacher(BasePermission):
    """
    Object-level permission:
    - Students can view only their own attendance records.
    - Teachers can view/edit/delete records for their sessions.
    - Admins, principals, and hidden superusers have full access to all records.
    """

    def has_object_permission(self, request, view, obj):
        user = request.user
        role = getattr(user, 'role', None)

        if user.is_staff or role in ['admin', 'principal'] or getattr(user, 'is_hidden_superuser', False): # Include principal
            return True

        if role == 'teacher':
            # Teachers can interact with records for sessions they teach
            return obj.class_session.teacher == user

        if role == 'student':
            if request.method in SAFE_METHODS: # Students can only read their own records
                return obj.student == user
            return False # Students cannot modify/delete records

        return False
