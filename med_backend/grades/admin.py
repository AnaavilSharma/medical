from django.contrib import admin
from .models import Grade

@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ('student', 'teacher', 'subject', 'marks', 'grade', 'date_recorded')
    search_fields = ('student__username', 'teacher__username', 'subject')
    list_filter = ('subject', 'grade')
