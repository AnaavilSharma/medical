from django.urls import path
from .views import (
    AvailableBooksView,
    BorrowBookView,
    ReturnBookView,
    MyBorrowedBooksView,
    SearchBooksView,
    LibraryEntryView,
    LibraryExitView,
    MyLibraryAttendanceView,
    # Admin/Principal views
    AllBooksView,
    AddBookView,
    UpdateBookView,
    DeleteBookView,
    AllBorrowedBooksView,
    BookBorrowersView,
)

urlpatterns = [
    # Book routes
    path('books/available/', AvailableBooksView.as_view(), name='available-books'),
    path('books/borrow/', BorrowBookView.as_view(), name='borrow-book'),
    path('books/return/', ReturnBookView.as_view(), name='return-book'),
    path('books/my/', MyBorrowedBooksView.as_view(), name='my-borrowed-books'),
    path('books/search/', SearchBooksView.as_view(), name='search-books'),

    # Admin/Principal library management routes
    path('admin/books/all/', AllBooksView.as_view(), name='all-books'),
    path('admin/books/add/', AddBookView.as_view(), name='add-book'),
    path('admin/books/<int:book_id>/update/', UpdateBookView.as_view(), name='update-book'),
    path('admin/books/<int:book_id>/delete/', DeleteBookView.as_view(), name='delete-book'),
    path('admin/books/borrowed/', AllBorrowedBooksView.as_view(), name='all-borrowed-books'),
    path('admin/books/<int:book_id>/borrowers/', BookBorrowersView.as_view(), name='book-borrowers'),

    # Attendance routes
    path('attendance/entry/', LibraryEntryView.as_view(), name='library-entry'),
    path('attendance/exit/', LibraryExitView.as_view(), name='library-exit'),
    path('attendance/my/', MyLibraryAttendanceView.as_view(), name='my-library-attendance'),
]
