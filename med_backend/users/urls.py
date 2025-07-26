from django.urls import path
from .views import RegisterView, LoginView, MyInfoView, list_users  
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', MyInfoView.as_view()), 
    path('list/', list_users, name='list-users'),
]