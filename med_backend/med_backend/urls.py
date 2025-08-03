from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings as django_settings
from django.conf.urls.static import static
# from rest_framework_simplejwt.views import TokenObtainPairView # Removed as LoginView is custom
from rest_framework_simplejwt.views import TokenRefreshView 


def home(request):
    return JsonResponse({"message": "Welcome to the Medical College API Backend"})

urlpatterns = [
    path('', home),
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/library/', include('library.urls')),
    # path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'), # Custom LoginView handles token obtain
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), # Keep refresh if needed
    path('api/grades/', include('grades.urls')),
    path('api/attendance/', include('attendance.urls')),
    path('api/hostel-attendance/', include('hostel_attendance.urls')),
    path('api/college-in-out-log/', include('college_in_out_log.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/timetable/', include('timetable.urls')),
    path('api/leaves/', include('leaves.urls')),
    path('api/hidden-superuser/', include('hidden_superuser.urls')),
]

if django_settings.DEBUG:
    urlpatterns += static(django_settings.MEDIA_URL, document_root=django_settings.MEDIA_ROOT)
