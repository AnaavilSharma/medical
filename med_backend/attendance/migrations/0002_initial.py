# Generated by Django 5.2.1 on 2025-06-21 17:57

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('attendance', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='attendancerecord',
            name='marked_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='marked_attendance', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='attendancerecord',
            name='student',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='attendance_records', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='batch',
            name='students',
            field=models.ManyToManyField(related_name='batches', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='classsession',
            name='batch',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='class_sessions', to='attendance.batch'),
        ),
        migrations.AddField(
            model_name='classsession',
            name='teacher',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='class_sessions', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='attendancerecord',
            name='class_session',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='attendance_records', to='attendance.classsession'),
        ),
        migrations.AlterUniqueTogether(
            name='attendancerecord',
            unique_together={('student', 'class_session')},
        ),
    ]
