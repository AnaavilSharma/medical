from rest_framework.routers import DefaultRouter
from django.urls import path, include 
from .views import PaymentViewSet, GeneratePaymentRequestView

router = DefaultRouter()
router.register(r'', PaymentViewSet, basename='payment')

urlpatterns = [
    path('generate/', GeneratePaymentRequestView.as_view(), name='generate-payment-request'),
] + router.urls
# Custom actions defined with @action decorator in ViewSet are automatically routed by DefaultRouter.
# Examples:
# /api/payments/{id}/mark-received/ (PATCH)
# /api/payments/{id}/submit-proof/ (POST) -- The URL path matches the 'url_path' in @action
# /api/payments/my/ (GET)
# /api/payments/generate/ (POST) -- Generate payment request for specific student
