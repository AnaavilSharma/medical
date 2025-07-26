# timetable/admin.py

from django.contrib import admin
from .models import TimetableImage

@admin.register(TimetableImage)
class TimetableImageAdmin(admin.ModelAdmin):
    list_display = ['batch', 'uploaded_by', 'uploaded_at']
    search_fields = ['batch', 'uploaded_by__username']
    list_filter = ['uploaded_at']
    readonly_fields = ['uploaded_at', 'uploaded_by']