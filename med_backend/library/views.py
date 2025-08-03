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
from users.permissions import IsAdminOrPrincipal # Import the permission class


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

        # Enhanced validation
        if not book_id:
            return Response({
                "error": "Book ID is required",
                "details": "Please provide a book_id in the request",
                "required_fields": ["book_id"],
                "example": {
                    "book_id": 1
                }
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            book = Book.objects.get(id=book_id)
        except Book.DoesNotExist:
            return Response({
                "error": "Book not found",
                "details": f"Book with ID {book_id} does not exist",
                "available_books": BookSerializer(Book.objects.all()[:5], many=True).data
            }, status=status.HTTP_404_NOT_FOUND)

        # Check if book has available copies before allowing borrow
        if book.currently_borrowed_count >= book.total_copies:
            return Response({
                "error": "No copies available",
                "details": f"All {book.total_copies} copies of '{book.title}' are currently borrowed",
                "book_info": {
                    "title": book.title,
                    "total_copies": book.total_copies,
                    "currently_borrowed": book.currently_borrowed_count,
                    "available": book.total_copies - book.currently_borrowed_count
                }
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check user's active borrow limit (e.g., max 3 books)
        active_borrows = Borrow.objects.filter(user=user, returned=False).count()
        max_borrows = 3  # Example limit
        
        if active_borrows >= max_borrows:
            return Response({
                "error": "Borrow limit reached",
                "details": f"You have reached the maximum limit of {max_borrows} borrowed books",
                "current_borrows": active_borrows,
                "max_allowed": max_borrows,
                "borrowed_books": BorrowSerializer(Borrow.objects.filter(user=user, returned=False), many=True).data
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check if user already has this book borrowed
        existing_borrow = Borrow.objects.filter(user=user, book=book, returned=False).first()
        if existing_borrow:
            return Response({
                "error": "Already borrowed",
                "details": f"You have already borrowed '{book.title}'",
                "borrow_info": BorrowSerializer(existing_borrow).data
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
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
            return Response({
                "message": f"Book '{book.title}' borrowed successfully",
                "borrow": serializer.data,
                "due_date": borrow.due_date.strftime("%Y-%m-%d")
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                "error": "Failed to borrow book",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ReturnBookView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        book_id = request.data.get("book_id")

        # Enhanced validation
        if not book_id:
            return Response({
                "error": "Book ID is required",
                "details": "Please provide a book_id in the request",
                "required_fields": ["book_id"],
                "example": {
                    "book_id": 1
                }
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Get the latest unreturned borrow record for this user and specific book
            borrow = Borrow.objects.filter(user=user, book_id=book_id, returned=False).latest("borrow_date")
        except Borrow.DoesNotExist:
            return Response({
                "error": "No active borrow found",
                "details": f"No active borrow record found for book ID {book_id} by you",
                "your_borrowed_books": BorrowSerializer(Borrow.objects.filter(user=user, returned=False), many=True).data
            }, status=status.HTTP_404_NOT_FOUND)

        try:
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

            return Response({
                "message": f"Book '{book.title}' returned successfully",
                "return_info": {
                    "book_title": book.title,
                    "return_date": timezone.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "borrow_duration_days": (timezone.now() - borrow.borrow_date).days
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "error": "Failed to return book",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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

# ---------------- ADMIN/PRINCIPAL LIBRARY MANAGEMENT VIEWS ------------------

class AllBooksView(APIView):
    """
    View for admin/principal to see all books in the library inventory
    """
    permission_classes = [IsAuthenticated, IsAdminOrPrincipal]

    def get(self, request):
        books = Book.objects.all().order_by('title')
        serializer = BookSerializer(books, many=True, context={'request': request})
        return Response(serializer.data)

class AddBookView(APIView):
    """
    View for admin/principal to add new books to the library
    """
    permission_classes = [IsAuthenticated, IsAdminOrPrincipal]

    def post(self, request):
        title = request.data.get('title')
        author = request.data.get('author')
        isbn = request.data.get('isbn', '')
        total_copies = request.data.get('total_copies', 1)
        genre = request.data.get('genre', 'General')

        if not title or not author:
            return Response({
                "error": "Missing required fields",
                "details": "Title and author are required fields",
                "required_fields": ["title", "author"],
                "optional_fields": ["isbn", "total_copies", "genre"]
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate total_copies
        try:
            total_copies = int(total_copies)
            if total_copies <= 0:
                raise ValueError("Total copies must be positive")
        except (ValueError, TypeError):
            return Response({
                "error": "Invalid total_copies",
                "details": "Total copies must be a positive integer"
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check if book with same ISBN already exists (if ISBN provided)
        if isbn:
            existing_book = Book.objects.filter(isbn=isbn).first()
            if existing_book:
                return Response({
                    "error": "Book with this ISBN already exists",
                    "details": f"Book '{existing_book.title}' already has ISBN {isbn}",
                    "existing_book": BookSerializer(existing_book).data
                }, status=status.HTTP_400_BAD_REQUEST)

        try:
            book = Book.objects.create(
                title=title,
                author=author,
                isbn=isbn,
                total_copies=total_copies,
                genre=genre,
                currently_borrowed_count=0
            )
            serializer = BookSerializer(book, context={'request': request})
            return Response({
                "message": f"Book '{title}' added successfully",
                "book": serializer.data
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                "error": "Failed to add book",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UpdateBookView(APIView):
    """
    View for admin/principal to update book information
    """
    permission_classes = [IsAuthenticated, IsAdminOrPrincipal]

    def put(self, request, book_id):
        try:
            book = Book.objects.get(id=book_id)
        except Book.DoesNotExist:
            return Response({
                "error": "Book not found",
                "details": f"Book with ID {book_id} does not exist"
            }, status=status.HTTP_404_NOT_FOUND)

        title = request.data.get('title')
        author = request.data.get('author')
        isbn = request.data.get('isbn')
        total_copies = request.data.get('total_copies')
        genre = request.data.get('genre')

        # Validate total_copies if provided
        if total_copies is not None:
            try:
                total_copies = int(total_copies)
                if total_copies < book.currently_borrowed_count:
                    return Response({
                        "error": "Invalid total_copies",
                        "details": f"Cannot set total copies to {total_copies} when {book.currently_borrowed_count} copies are currently borrowed"
                    }, status=status.HTTP_400_BAD_REQUEST)
            except (ValueError, TypeError):
                return Response({
                    "error": "Invalid total_copies",
                    "details": "Total copies must be a positive integer"
                }, status=status.HTTP_400_BAD_REQUEST)

        # Check ISBN uniqueness if provided
        if isbn and isbn != book.isbn:
            existing_book = Book.objects.filter(isbn=isbn).exclude(id=book_id).first()
            if existing_book:
                return Response({
                    "error": "ISBN already exists",
                    "details": f"Another book '{existing_book.title}' already has ISBN {isbn}"
                }, status=status.HTTP_400_BAD_REQUEST)

        # Update fields
        if title is not None:
            book.title = title
        if author is not None:
            book.author = author
        if isbn is not None:
            book.isbn = isbn
        if total_copies is not None:
            book.total_copies = total_copies
        if genre is not None:
            book.genre = genre

        try:
            book.save()
            serializer = BookSerializer(book, context={'request': request})
            return Response({
                "message": f"Book '{book.title}' updated successfully",
                "book": serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "error": "Failed to update book",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DeleteBookView(APIView):
    """
    View for admin/principal to delete books from the library
    """
    permission_classes = [IsAuthenticated, IsAdminOrPrincipal]

    def delete(self, request, book_id):
        try:
            book = Book.objects.get(id=book_id)
        except Book.DoesNotExist:
            return Response({
                "error": "Book not found",
                "details": f"Book with ID {book_id} does not exist"
            }, status=status.HTTP_404_NOT_FOUND)

        # Check if any copies are currently borrowed
        if book.currently_borrowed_count > 0:
            return Response({
                "error": "Cannot delete book",
                "details": f"Cannot delete '{book.title}' because {book.currently_borrowed_count} copies are currently borrowed",
                "book_info": BookSerializer(book).data
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            book_title = book.title
            book.delete()
            return Response({
                "message": f"Book '{book_title}' deleted successfully"
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "error": "Failed to delete book",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AllBorrowedBooksView(APIView):
    """
    View for admin/principal to see all borrowed books and who has them
    """
    permission_classes = [IsAuthenticated, IsAdminOrPrincipal]

    def get(self, request):
        # Get all active borrows with user and book information
        borrows = Borrow.objects.filter(returned=False).select_related('user', 'book').order_by('-borrow_date')
        serializer = BorrowSerializer(borrows, many=True, context={'request': request})
        
        # Calculate summary statistics
        total_borrowed = borrows.count()
        overdue_borrows = borrows.filter(due_date__lt=timezone.now())
        overdue_count = overdue_borrows.count()
        
        return Response({
            "borrowed_books": serializer.data,
            "summary": {
                "total_borrowed": total_borrowed,
                "overdue_count": overdue_count,
                "overdue_books": BorrowSerializer(overdue_borrows, many=True, context={'request': request}).data
            }
        })

class BookBorrowersView(APIView):
    """
    View for admin/principal to see who has borrowed a specific book
    """
    permission_classes = [IsAuthenticated, IsAdminOrPrincipal]

    def get(self, request, book_id):
        try:
            book = Book.objects.get(id=book_id)
        except Book.DoesNotExist:
            return Response({
                "error": "Book not found",
                "details": f"Book with ID {book_id} does not exist"
            }, status=status.HTTP_404_NOT_FOUND)

        # Get all borrows for this book (both active and returned)
        borrows = Borrow.objects.filter(book=book).select_related('user').order_by('-borrow_date')
        active_borrows = borrows.filter(returned=False)
        returned_borrows = borrows.filter(returned=True)

        serializer = BorrowSerializer(borrows, many=True, context={'request': request})
        active_serializer = BorrowSerializer(active_borrows, many=True, context={'request': request})
        returned_serializer = BorrowSerializer(returned_borrows, many=True, context={'request': request})

        return Response({
            "book": BookSerializer(book, context={'request': request}).data,
            "all_borrows": serializer.data,
            "active_borrows": active_serializer.data,
            "returned_borrows": returned_serializer.data,
            "summary": {
                "total_borrows": borrows.count(),
                "active_borrows_count": active_borrows.count(),
                "returned_borrows_count": returned_borrows.count(),
                "overdue_count": active_borrows.filter(due_date__lt=timezone.now()).count()
            }
        })

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
