from django.test import TestCase
from .models import Book, Borrow, Attendance
from django.utils import timezone
from django.contrib.auth import get_user_model
from datetime import timedelta

User = get_user_model()

class LibraryModelTests(TestCase):

    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(username='testuser', password='testpass')
        # Create a test book
        self.book = Book.objects.create(title='Test Book', author='Author One', isbn='1234567890')

    def test_borrow_book(self):
        borrow = Borrow.objects.create(
            user=self.user,
            book=self.book,
            borrow_date=timezone.now(),
            due_date=timezone.now() + timedelta(days=7)  # Add due_date to avoid IntegrityError
        )
        self.assertEqual(borrow.user.username, 'testuser')
        self.assertEqual(borrow.book.title, 'Test Book')
        self.assertFalse(borrow.returned)

    def test_attendance_record(self):
        attendance = Attendance.objects.create(
            user=self.user,
            entry_time=timezone.now()
        )
        self.assertEqual(attendance.user.username, 'testuser')
        self.assertIsNone(attendance.exit_time)