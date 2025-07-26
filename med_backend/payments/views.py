from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action # Import action decorator
from rest_framework.exceptions import PermissionDenied, ValidationError # Import for custom validation
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
        if not student_id:
            raise ValidationError({"student_id": "Student ID is required to create a payment."})
        
        try:
            # Ensure the provided student_id corresponds to an actual student user
            student_user = User.objects.get(id=student_id, role='student') 
        except User.DoesNotExist:
            raise ValidationError({"student_id": "Student with provided ID does not exist or is not a student."})
        
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

        if 'payment_proof' not in request.FILES: # Name matches model field
            return Response({"error": "No payment proof file provided. Please use 'payment_proof' as field name."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Ensure the payment status allows for proof upload (e.g., 'pending' or 'due')
        if payment.status not in ['pending', 'due']: 
            return Response({"error": f"Payment status '{payment.status}' does not allow proof upload."}, status=status.HTTP_400_BAD_REQUEST)

        # Assign the uploaded file to the payment_proof field
        payment.payment_proof = request.FILES['payment_proof']
        payment.status = 'pending_proof' # Update status to indicate proof uploaded, awaiting verification
        payment.save()
        serializer = self.get_serializer(payment) # Serialize the updated object
        return Response(serializer.data, status=status.HTTP_200_OK)

    # Custom action to get payments for the logged-in student/parent
    @action(detail=False, methods=['get'], url_path='my')
    def my_payments(self, request):
        # The get_queryset method already handles filtering for student/parent roles
        queryset = self.get_queryset() 
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

