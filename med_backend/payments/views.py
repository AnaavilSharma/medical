from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action # Import action decorator
from rest_framework.exceptions import PermissionDenied, ValidationError # Import for custom validation
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Payment
from .serializers import PaymentSerializer
from .permissions import IsAdminPrincipalSuperuser, IsStudentOrParent, IsStudentUploadingProof 
from users.models import User # For student field queryset validation


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().order_by('-created_at')
    serializer_class = PaymentSerializer

    def get_permissions(self):
        user = self.request.user

        if user.is_authenticated:
            if user.role in ['admin', 'principal'] or getattr(user, 'is_hidden_superuser', False):
                # Full access for admin/principal/hidden superuser
                return [permissions.IsAuthenticated()]
            elif self.action in ['list', 'retrieve', 'my_payments']:
                # Students and parents can view their own payments
                return [IsStudentOrParent()]
            elif self.action == 'upload_proof': # Custom action for student/parent proof upload
                return [IsStudentUploadingProof()]
            else:
                # Other actions (create, update, destroy, other custom actions) forbidden for students/parents
                # Effectively, only IsAdminPrincipalSuperuser can do these.
                return [IsAdminPrincipalSuperuser()] # Explicitly deny if not admin/principal/superuser
        
        return [permissions.IsAuthenticated(False)] # Deny if not authenticated

    def get_queryset(self):
        user = self.request.user
        # Optimize queryset with select_related for the 'student' foreign key
        base_queryset = Payment.objects.all().select_related('student')

        if user.role in ['admin', 'principal'] or getattr(user, 'is_hidden_superuser', False):
            return base_queryset
        elif user.role == 'student':
            return base_queryset.filter(student=user)
        elif user.role == 'parent' and user.child:
            return base_queryset.filter(student=user.child)
        return Payment.objects.none()

    # Overriding create method to handle student assignment when admin creates a payment
    def create(self, request, *args, **kwargs):
        user = request.user
        # Only admin/principal/hidden superuser can create payments for students
        if not (user.is_staff or getattr(user, 'is_hidden_superuser', False) or user.role in ['admin', 'principal']):
            raise PermissionDenied("You do not have permission to create payment records.")

        student_id = request.data.get('student_id')
        amount = request.data.get('amount')
        payment_type = request.data.get('type')
        
        # Enhanced validation with specific error messages
        validation_errors = []
        
        if not student_id:
            validation_errors.append("student_id is required")
        if not amount:
            validation_errors.append("amount is required")
        if not payment_type:
            validation_errors.append("type is required")
            
        if validation_errors:
            return Response({
                "error": "Validation failed",
                "details": validation_errors,
                "required_fields": ["student_id", "amount", "type"],
                "example": {
                    "student_id": 1,
                    "amount": 100.00,
                    "type": "fine",
                    "description": "Late fee payment"
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Ensure the provided student_id corresponds to an actual student user
            student_user = User.objects.get(id=student_id, role='student') 
        except User.DoesNotExist:
            return Response({
                "error": "Student not found",
                "details": f"Student with ID {student_id} does not exist or is not a student",
                "available_students": list(User.objects.filter(role='student').values('id', 'username'))
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Use partial=True to allow the serializer to save without all fields if some are auto-set.
        # However, for creation, it's better to ensure all required fields are passed.
        # Assuming the serializer's `Meta.fields` defines all necessary writable fields.
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Assign the found student user to the payment record
        serializer.save(student=student_user) 
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    # Custom action to mark payment as received by admin/principal/superuser
    @action(detail=True, methods=['patch'], url_path='mark-received')
    def mark_received(self, request, pk=None):
        payment = self.get_object() # get_object will apply object-level permissions

        if payment.status == 'received':
            return Response({"message": "Payment already marked received."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Permissions are already enforced by get_permissions on the ViewSet.
        # This action is restricted to IsAdminPrincipalSuperuser.

        payment.status = 'received'
        payment.save()
        serializer = self.get_serializer(payment) # Re-serialize the updated object
        return Response(serializer.data, status=status.HTTP_200_OK)

    # Custom action for students/parents to upload payment proof
    # Frontend calls this with POST, so method changed to 'post'
    @action(detail=True, methods=['post'], url_path='submit-proof') 
    def upload_proof(self, request, pk=None):
        payment = self.get_object() # This will run has_object_permission from IsStudentUploadingProof

        # Enhanced validation for file upload
        if 'payment_proof' not in request.FILES:
            return Response({
                "error": "No payment proof file provided",
                "details": "Please include a file with field name 'payment_proof'",
                "required_fields": ["payment_proof"],
                "example": {
                    "payment_proof": "file_upload_here"
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate file type and size
        uploaded_file = request.FILES['payment_proof']
        allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
        max_size = 5 * 1024 * 1024  # 5MB
        
        if uploaded_file.content_type not in allowed_types:
            return Response({
                "error": "Invalid file type",
                "details": f"File type '{uploaded_file.content_type}' is not allowed",
                "allowed_types": allowed_types,
                "received_type": uploaded_file.content_type
            }, status=status.HTTP_400_BAD_REQUEST)
            
        if uploaded_file.size > max_size:
            return Response({
                "error": "File too large",
                "details": f"File size {uploaded_file.size} bytes exceeds maximum {max_size} bytes",
                "max_size_mb": max_size / (1024 * 1024)
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Ensure the payment status allows for proof upload (e.g., 'pending' or 'due')
        if payment.status not in ['pending', 'due']: 
            return Response({
                "error": "Payment status does not allow proof upload",
                "details": f"Payment status '{payment.status}' does not allow proof upload",
                "allowed_statuses": ['pending', 'due'],
                "current_status": payment.status
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Assign the uploaded file to the payment_proof field
            payment.payment_proof = uploaded_file
            payment.status = 'pending_proof' # Update status to indicate proof uploaded, awaiting verification
            payment.save()
            serializer = self.get_serializer(payment) # Serialize the updated object
            return Response({
                "message": "Payment proof uploaded successfully",
                "payment": serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "error": "Failed to upload payment proof",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Custom action to get payments for the logged-in student/parent
    @action(detail=False, methods=['get'], url_path='my')
    def my_payments(self, request):
        # The get_queryset method already handles filtering for student/parent roles
        queryset = self.get_queryset() 
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class GeneratePaymentRequestView(APIView):
    """
    View for admin/principal to generate payment requests for specific students.
    """
    permission_classes = [IsAdminPrincipalSuperuser]

    def post(self, request):
        user = request.user
        
        # Ensure only admin/principal/hidden superuser can generate payment requests
        if not (user.is_staff or getattr(user, 'is_hidden_superuser', False) or user.role in ['admin', 'principal']):
            return Response({"error": "Only admin and principal users can generate payment requests."}, 
                          status=status.HTTP_403_FORBIDDEN)

        # Get data from request
        student_id = request.data.get('student_id')
        payment_type = request.data.get('type')
        amount = request.data.get('amount')
        due_date = request.data.get('due_date')
        payment_link = request.data.get('payment_link', '')
        late_fine = request.data.get('late_fine', 0)

        # Enhanced validation with specific error messages
        validation_errors = []
        
        if not student_id:
            validation_errors.append("student_id is required")
        if not payment_type:
            validation_errors.append("type is required")
        if not amount:
            validation_errors.append("amount is required")
        if not due_date:
            validation_errors.append("due_date is required")
            
        if validation_errors:
            return Response({
                "error": "Validation failed",
                "details": validation_errors,
                "required_fields": ["student_id", "type", "amount", "due_date"],
                "example": {
                    "student_id": 1,
                    "type": "tuition",
                    "amount": 500.00,
                    "due_date": "2025-08-15",
                    "payment_link": "https://payment.example.com",
                    "late_fine": 50.00
                }
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Get the student
            student = get_object_or_404(User, id=student_id, role='student')
            
            # Create the payment request
            payment = Payment.objects.create(
                student=student,
                type=payment_type,
                amount=amount,
                due_date=due_date,
                payment_link=payment_link,
                late_fine=late_fine,
                status='pending'
            )
            
            serializer = PaymentSerializer(payment)
            return Response({
                "message": f"Payment request generated successfully for {student.username}",
                "payment": serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except User.DoesNotExist:
            return Response({
                "error": "Student not found",
                "details": f"Student with ID {student_id} does not exist or is not a student",
                "available_students": list(User.objects.filter(role='student').values('id', 'username'))
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                "error": "Failed to generate payment request",
                "details": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

