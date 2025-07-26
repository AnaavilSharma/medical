from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    isbn = models.CharField(max_length=13, unique=True, null=True, blank=True) # ISBN should generally be unique
    # Renamed is_available to total_copies (integer) and added currently_borrowed_count
    total_copies = models.IntegerField(default=1)
    currently_borrowed_count = models.IntegerField(default=0)
    # Adding 'genre' field for consistency with frontend mock data. Add if needed.
    genre = models.CharField(max_length=100, blank=True, null=True, default='General')

    def __str__(self):
        return self.title

class Borrow(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='borrowed_books')
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='borrows')
    borrow_date = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField()
    returned = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} borrowed {self.book.title}"

class Attendance(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='library_attendance')
    entry_time = models.DateTimeField()
    exit_time = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} attended library on {self.entry_time.date()}"
