from django.contrib import admin
from .models import Batch, ClassSession, AttendanceRecord

admin.site.register(Batch)
admin.site.register(ClassSession)
admin.site.register(AttendanceRecord)