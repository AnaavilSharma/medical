# payments/tests.py

from django.test import TestCase
from django.utils import timezone
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from users.models import User
from .models import Payment

class PaymentTests(TestCase):

    def setUp(self):
        self.student = User.objects.create_user(username='student1', password='pass123', role='student')
        self.admin = User.objects.create_user(username='admin1', password='pass123', role='admin', is_staff=True)
        self.principal = User.objects.create_user(username='principal1', password='pass123', role='principal')
        self.hidden_superuser = User.objects.create_user(
            username='hiddenadmin', password='hiddenpass', role='admin', is_staff=True, is_superuser=True, is_hidden_superuser=True
        )

        self.payment = Payment.objects.create(
            student=self.student,
            amount=500.0,
            reason="Library Fine",
            start_date=timezone.now().date(),
            end_date=timezone.now().date(),
            status="pending"
        )

        self.client = APIClient()

    def test_student_can_view_own_payments(self):
        self.client.login(username='student1', password='pass123')
        response = self.client.get(reverse('student-payments'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) >= 1)

    def test_admin_can_create_payment_request(self):
        self.payment = Payment.objects.create(
            student=self.student,
            amount=500.0,
            payment_type="fine",  # ✅ renamed from reason
            start_date=timezone.now().date(),
            due_date=timezone.now().date(),  # ✅ renamed from end_date
            status="pending"
        )
        response = self.client.post(reverse('create-payment'), data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_upload_receipt(self):
        self.client.login(username='student1', password='pass123')
        with open("receipt_test.jpg", "wb") as f:
            f.write(b"test image content")
        with open("receipt_test.jpg", "rb") as file:
            upload = SimpleUploadedFile("receipt.jpg", file.read(), content_type="image/jpeg")
            response = self.client.post(reverse('upload-receipt', args=[self.payment.id]), {'receipt': upload})
        self.assertIn(response.status_code, [200, 201, 204])