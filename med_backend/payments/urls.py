from rest_framework.routers import DefaultRouter
from django.urls import path, include 
from .views import PaymentViewSet

router = DefaultRouter()
router.register(r'', PaymentViewSet, basename='payment')

urlpatterns = router.urls 
# Custom actions defined with @action decorator in ViewSet are automatically routed by DefaultRouter.
# Examples:
# /api/payments/{id}/mark-received/ (PATCH)
# /api/payments/{id}/submit-proof/ (POST) -- The URL path matches the 'url_path' in @action
# /api/payments/my/ (GET)
