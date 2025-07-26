from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    model = User

    list_display = ('username', 'email', 'role', 'is_staff', 'is_superuser', 'is_hidden_superuser')
    list_filter = ('role', 'is_staff', 'is_superuser')

    fieldsets = (
        (None, {'fields': ('username', 'email', 'password', 'role', 'child', 'is_hidden_superuser')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'role', 'child', 'password1', 'password2', 'is_hidden_superuser'),
        }),
    )

    search_fields = ('username', 'email')
    ordering = ('email',)

    def get_queryset(self, request):
        """Hide hidden superusers from admin panel list view."""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs  # Full access for actual superusers
        return qs.exclude(is_hidden_superuser=True)