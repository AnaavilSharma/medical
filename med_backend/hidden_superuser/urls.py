from django.urls import path
from .views import HiddenSuperuserDashboardView, HiddenSuperuserUserManagementView, CodeModificationViewSet, toggle_user_status

urlpatterns = [
    path('dashboard/', HiddenSuperuserDashboardView.as_view(), name='hidden-superuser-dashboard'),
    path('user-management/', HiddenSuperuserUserManagementView.as_view(), name='hidden-superuser-user-management'),
    path('code-modifications/', CodeModificationViewSet.as_view({'get': 'list'}), name='hidden-superuser-code-modifications'),
    path('toggle-user-status/', toggle_user_status, name='hidden-superuser-toggle-user-status'),
] 