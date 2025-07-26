from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import AccessToken
from users.models import User
from leaves.models import LeaveRequest
from datetime import date

class LeaveRequestTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create users
        self.student = User.objects.create_user(username='student001', password='pass123', role='student', batch='MBBS 1st Year A')
        self.teacher = User.objects.create_user(username='teacher001', password='pass123', role='teacher')
        self.principal = User.objects.create_user(username='principal001', password='pass123', role='principal')
        self.admin = User.objects.create_user(username='admin001', password='admin123', role='admin')

        # Generate JWT access tokens
        self.student_token = str(AccessToken.for_user(self.student))
        self.teacher_token = str(AccessToken.for_user(self.teacher))
        self.principal_token = str(AccessToken.for_user(self.principal))
        self.admin_token = str(AccessToken.for_user(self.admin))

        # Create a leave request by student (as admin for control)
        self.leave = LeaveRequest.objects.create(
            user=self.student,
            start_date=date(2025, 6, 1),
            end_date=date(2025, 6, 3),
            reason="Personal"
        )

    def test_student_can_create_leave(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.student_token}')
        data = {
            'start_date': '2025-06-05',
            'end_date': '2025-06-07',
            'reason': 'Medical leave'
        }
        response = self.client.post(reverse('leave-list'), data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'pending')

    def test_student_can_list_own_leaves(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.student_token}')
        response = self.client.get(reverse('leave-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_admin_can_approve_student_leave(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        url = reverse('leave-detail', kwargs={'pk': self.leave.id})
        data = {'status': 'approved'}
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.leave.refresh_from_db()
        self.assertEqual(self.leave.status, 'approved')

    def test_principal_cannot_approve_principal_leave(self):
        # Create leave request by principal
        principal_leave = LeaveRequest.objects.create(
            user=self.principal,
            start_date=date(2025, 6, 10),
            end_date=date(2025, 6, 12),
            reason="Conference"
        )

        # Try to approve own leave
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.principal_token}')
        url = reverse('leave-detail', kwargs={'pk': principal_leave.id})
        response = self.client.patch(url, {'status': 'approved'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)