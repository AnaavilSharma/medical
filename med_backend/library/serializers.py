# library/serializers.py
from rest_framework import serializers
from .models import Book, Borrow, Attendance
from users.models import User
from users.serializers import UserSimpleSerializer # Import UserSimpleSerializer


class BookSerializer(serializers.ModelSerializer):
    """
    Serializer for Book model, exposing availability based on copies.
    """
    # Calculate available copies based on total and currently borrowed
    available_copies = serializers.SerializerMethodField()
    # Adding 'genre' field, assuming it's on the model. Remove if not.
    genre = serializers.CharField(read_only=True) 

    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'isbn', 'total_copies', 'currently_borrowed_count', 'available_copies', 'genre']
        read_only_fields = ['currently_borrowed_count'] # This should be managed by borrow/return logic

    def get_available_copies(self, obj):
        return obj.total_copies - obj.currently_borrowed_count


class BookSimpleSerializer(serializers.ModelSerializer): # New, for nested use in BorrowSerializer
    """
    A simplified serializer for Book model, used when only basic book info is needed.
    """
    class Meta:
        model = Book
        fields = ['id', 'title', 'author'] # Include author if frontend needs it for borrowed books


class BorrowSerializer(serializers.ModelSerializer):
    """
    Serializer for Borrow model.
    Uses nested serializers for user and book, and flattens book title for convenience.
    """
    user = UserSimpleSerializer(read_only=True) # Use UserSimpleSerializer
    book = BookSimpleSerializer(read_only=True) # Use nested BookSimpleSerializer

    # Flatten book title for frontend directly
    book_title = serializers.CharField(source='book.title', read_only=True)

    class Meta:
        model = Borrow
        fields = ['id', 'user', 'book', 'book_title', 'borrow_date', 'due_date', 'returned']
        read_only_fields = ['borrow_date'] # borrow_date is auto_now_add


class AttendanceSerializer(serializers.ModelSerializer):
    """
    Serializer for Library Attendance model.
    Uses nested UserSimpleSerializer for the associated user.
    """
    user = UserSimpleSerializer(read_only=True) # Use UserSimpleSerializer

    class Meta:
        model = Attendance
        fields = ['id', 'user', 'entry_time', 'exit_time']
        read_only_fields = ['entry_time', 'exit_time'] # These are set by view logic
