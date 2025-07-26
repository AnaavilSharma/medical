from django.contrib import admin
from .models import Book, Borrow, Attendance

# Admin configuration for the Book model
@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    # list_display defines the fields to be displayed in the list view of the admin interface.
    # 'is_available' was removed as it no longer exists; replaced with custom method 'display_available_copies'.
    list_display = ('title', 'author', 'isbn', 'total_copies', 'currently_borrowed_count', 'display_available_copies')
    # list_filter provides filters in the sidebar of the admin list view.
    list_filter = ('author', 'genre') # Assuming 'genre' field exists on Book model
    # search_fields enables a search bar for the specified fields.
    search_fields = ('title', 'author', 'isbn')
    # readonly_fields makes certain fields read-only in the admin detail view.
    readonly_fields = ('currently_borrowed_count',) # This count is managed by system logic

    # Custom method to calculate and display available copies in the admin list view.
    def display_available_copies(self, obj):
        return obj.total_copies - obj.currently_borrowed_count
    # Sets a more user-friendly column header for the custom method.
    display_available_copies.short_description = 'Available Copies'


# Admin configuration for the Borrow model
@admin.register(Borrow)
class BorrowAdmin(admin.ModelAdmin):
    # Displays user, book, borrow date, due date, and returned status.
    list_display = ('user', 'book', 'borrow_date', 'due_date', 'returned')
    # Filters by user, book, and returned status.
    list_filter = ('user', 'book', 'returned')
    # Search by username and book title.
    search_fields = ('user__username', 'book__title')
    # Automatically populates the user and sets returned to False on creation.
    # This might need adjustment if admins can create borrows for other users.
    # For now, it assumes the admin is creating a borrow record directly for a user.
    # Consider making 'returned' editable by admin, but not 'borrow_date'.
    raw_id_fields = ('user', 'book') # Use raw_id_fields for FKs to improve performance for many records


# Admin configuration for the Library Attendance model
@admin.register(Attendance)
class LibraryAttendanceAdmin(admin.ModelAdmin):
    # Displays user, entry time, and exit time.
    list_display = ('user', 'entry_time', 'exit_time')
    # Filters by user and entry date.
    list_filter = ('user', 'entry_time')
    # Search by username.
    search_fields = ('user__username',)
    # Makes entry_time and exit_time read-only as they are set automatically.
    readonly_fields = ('entry_time', 'exit_time')

