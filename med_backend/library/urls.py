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
)

urlpatterns = [
    # Book routes
    path('books/available/', AvailableBooksView.as_view(), name='available-books'),
    path('books/borrow/', BorrowBookView.as_view(), name='borrow-book'),
    path('books/return/', ReturnBookView.as_view(), name='return-book'),
    path('books/my/', MyBorrowedBooksView.as_view(), name='my-borrowed-books'),
    path('books/search/', SearchBooksView.as_view(), name='search-books'),

    # Attendance routes
    path('attendance/entry/', LibraryEntryView.as_view(), name='library-entry'),
    path('attendance/exit/', LibraryExitView.as_view(), name='library-exit'),
    path('attendance/my/', MyLibraryAttendanceView.as_view(), name='my-library-attendance'),
]
