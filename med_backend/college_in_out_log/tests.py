from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from users.models import User
from .models import CollegeInOutLog
from datetime import datetime
from rest_framework_simplejwt.tokens import RefreshToken

class CollegeInOutLogAPITests(APITestCase):
    def setUp(self):
        # Create users
        self.admin_user = User.objects.create_user(username='admin', password='adminpass', role='admin', is_staff=True)
        self.principal_user = User.objects.create_user(username='principal', password='principalpass', role='principal')
        self.hidden_superuser = User.objects.create_user(
            username='hidden', password='hiddenpass', role='admin',
            is_hidden_superuser=True, is_staff=True, is_superuser=True
        )
        self.student_user = User.objects.create_user(username='student', password='studentpass', role='student')

        # Create a log
        self.log = CollegeInOutLog.objects.create(
            student=self.student_user,
            entry_time=datetime.now(),
            marked_by=self.admin_user
        )

        self.url = reverse('college-in-out-log-list')

    def get_token(self, user):
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)

    def test_admin_can_access_logs(self):
        token = self.get_token(self.admin_user)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_principal_can_access_logs(self):
        token = self.get_token(self.principal_user)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_hidden_superuser_can_access_logs(self):
        token = self.get_token(self.hidden_superuser)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_student_cannot_access_logs(self):
        token = self.get_token(self.student_user)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)