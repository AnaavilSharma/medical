# leaves/admin.py

from django.contrib import admin
from .models import LeaveRequest

@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'start_date', 'end_date', 'status', 'applied_at')
    list_filter = ('status', 'start_date', 'end_date')
    search_fields = ('user__username', 'reason')
    ordering = ('-applied_at',)