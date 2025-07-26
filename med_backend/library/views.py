from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.utils import timezone
from django.db.models import F # Import F for database operations
from .models import Book, Borrow, Attendance
from .serializers import BookSerializer, BorrowSerializer, AttendanceSerializer
from django.db.models import Q
from users.models import User # Required for select_related on User objects


# ---------------- BOOK VIEWS ------------------

class AvailableBooksView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Only show books with available copies (total_copies > currently_borrowed_count)
        # Use F() expression for efficient database-level comparison
        books = Book.objects.filter(total_copies__gt=F('currently_borrowed_count')).order_by('title')
        # Pass request context to serializer for methods like get_image_url if you add image fields
        serializer = BookSerializer(books, many=True, context={'request': request}) 
        return Response(serializer.data)

class BorrowBookView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        book_id = request.data.get("book_id")

        if not book_id:
            return Response({"error": "Book ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            book = Book.objects.get(id=book_id)
        except Book.DoesNotExist:
            return Response({"error": "Book not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check if book has available copies before allowing borrow
        if book.currently_borrowed_count >= book.total_copies:
            return Response({"error": "No copies of this book are currently available."}, status=status.HTTP_400_BAD_REQUEST)

        # Check user's active borrow limit (e.g., max 3 books)
        active_borrows = Borrow.objects.filter(user=user, returned=False).count()
        if active_borrows >= 3: # Example limit
            return Response({"error": "Borrow limit reached (max 3 books). Return a book to borrow a new one."}, status=status.HTTP_400_BAD_REQUEST)

        # Increment borrowed count on the Book model
        book.currently_borrowed_count += 1
        book.save()

        # Create the Borrow record
        borrow = Borrow.objects.create(
            user=user,
            book=book,
            borrow_date=timezone.now(),
            due_date=timezone.now() + timezone.timedelta(days=14), # 14 days default due date
            returned=False
        )

        serializer = BorrowSerializer(borrow, context={'request': request}) # Pass request context
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ReturnBookView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        book_id = request.data.get("book_id")

        if not book_id:
            return Response({"error": "Book ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Get the latest unreturned borrow record for this user and specific book
            borrow = Borrow.objects.filter(user=user, book_id=book_id, returned=False).latest("borrow_date")
        except Borrow.DoesNotExist:
            return Response({"error": "No active borrow record found for this book by you."}, status=status.HTTP_404_NOT_FOUND)

        # Mark the borrow record as returned
        borrow.returned = True
        borrow.save()

        book = borrow.book
        # Decrement borrowed count on the Book model, ensuring it doesn't go below zero
        if book.currently_borrowed_count > 0:
            book.currently_borrowed_count -= 1
            book.save()
        else:
            # This is an edge case and indicates a data inconsistency, log it.
            print(f"Warning: Attempted to decrement borrowed count for Book ID {book.id} ({book.title}) but it was already 0.")

        return Response({"message": "Book returned successfully."}, status=status.HTTP_200_OK)

class MyBorrowedBooksView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        # Optimize with select_related for the 'book' foreign key, which also brings book title
        borrows = Borrow.objects.filter(user=user, returned=False).select_related('book').order_by('-borrow_date')
        serializer = BorrowSerializer(borrows, many=True, context={'request': request}) # Pass request context
        return Response(serializer.data)

class SearchBooksView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        title = request.query_params.get("title")
        author = request.query_params.get("author")

        filters = Q()
        if title:
            filters &= Q(title__icontains=title)
        if author:
            filters &= Q(author__icontains=author)

        # Filter books based on criteria and ensure they have available copies
        books = Book.objects.filter(filters, total_copies__gt=F('currently_borrowed_count')).distinct().order_by('title')
        serializer = BookSerializer(books, many=True, context={'request': request}) # Pass request context
        return Response(serializer.data)

# ---------------- ATTENDANCE VIEWS (for Library specific attendance) ------------------

class LibraryEntryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        today = timezone.now().date()
        # Check for an existing un-exited entry for the current user today
        already_exists = Attendance.objects.filter(user=user, entry_time__date=today, exit_time__isnull=True).exists()

        if already_exists:
            return Response({"error": "You have already marked entry for today without an exit. Please mark exit first."}, status=status.HTTP_400_BAD_REQUEST)

        # Create a new entry record with current timestamp
        entry = Attendance.objects.create(user=user, entry_time=timezone.now())
        serializer = AttendanceSerializer(entry, context={'request': request}) # Pass request context
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class LibraryExitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        try:
            # Find the latest entry record for the user that does not have an exit time
            entry = Attendance.objects.filter(user=user, exit_time__isnull=True).latest("entry_time")
            entry.exit_time = timezone.now() # Set exit time to current timestamp
            entry.save()
            serializer = AttendanceSerializer(entry, context={'request': request}) # Pass request context
            return Response(serializer.data)
        except Attendance.DoesNotExist:
            return Response({"error": "No active entry found for you. Please mark entry first."}, status=status.HTTP_400_BAD_REQUEST)

class MyLibraryAttendanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        # Optimize with select_related for the 'user' foreign key
        attendance_records = Attendance.objects.filter(user=user).select_related('user').order_by("-entry_time")
        serializer = AttendanceSerializer(attendance_records, many=True, context={'request': request}) # Pass request context
        return Response(serializer.data)
