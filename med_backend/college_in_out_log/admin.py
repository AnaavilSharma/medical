# college_in_out_log/admin.py

from django.contrib import admin
from .models import CollegeInOutLog

@admin.register(CollegeInOutLog)
class CollegeInOutLogAdmin(admin.ModelAdmin):
    list_display = ('student', 'entry_time', 'exit_time', 'marked_by')
    list_filter = ('entry_time', 'exit_time')
    search_fields = ('student__username', 'student__email')
    readonly_fields = ('entry_time', 'exit_time', 'marked_by')

    def has_change_permission(self, request, obj=None):
        # Disable editing via admin to keep logs accurate
        return False

    def has_delete_permission(self, request, obj=None):
        # Only allow superusers (hidden superuser included) to delete logs
        return request.user.is_superuser