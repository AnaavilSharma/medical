from django.contrib import admin
from .models import HostelAttendance

@admin.register(HostelAttendance)
class HostelAttendanceAdmin(admin.ModelAdmin):
    list_display = ('student', 'entry_time', 'exit_time', 'marked_by')
    list_filter = ('entry_time', 'exit_time')
    search_fields = ('student__username', 'student__email')
    readonly_fields = ('entry_time', 'exit_time', 'marked_by')

    def has_change_permission(self, request, obj=None):
        # Prevent edits after creation
        return False

    def has_delete_permission(self, request, obj=None):
        # Allow only superusers to delete
        return request.user.is_superuser