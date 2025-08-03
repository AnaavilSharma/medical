from django.utils.deprecation import MiddlewareMixin
from django.utils import timezone
from django.contrib.auth import get_user_model
from .models import AdminActivityLog, LoginHistory, SystemAuditLog
import json

User = get_user_model()

class AdminActivityTrackingMiddleware(MiddlewareMixin):
    """Middleware to track admin and principal activities"""
    
    def process_request(self, request):
        # Store request info for later use in process_response
        request._admin_activity_info = {
            'start_time': timezone.now(),
            'ip_address': self.get_client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
        }
    
    def process_response(self, request, response):
        # Only track for admin/principal users
        if hasattr(request, 'user') and request.user.is_authenticated:
            if request.user.role in ['admin', 'principal'] or getattr(request.user, 'is_hidden_superuser', False):
                self.log_activity(request, response)
        
        return response
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def log_activity(self, request, response):
        """Log the activity performed by admin/principal users"""
        try:
            # Determine the action based on HTTP method
            action_map = {
                'GET': 'view',
                'POST': 'create',
                'PUT': 'update',
                'PATCH': 'update',
                'DELETE': 'delete',
            }
            
            action = action_map.get(request.method, 'view')
            
            # Get model name from URL path
            path_parts = request.path.strip('/').split('/')
            model_name = path_parts[-1] if len(path_parts) > 1 else 'unknown'
            
            # Get object ID if available
            object_id = None
            if len(path_parts) > 2 and path_parts[-1].isdigit():
                object_id = path_parts[-1]
            
            # Prepare details
            details = {
                'method': request.method,
                'path': request.path,
                'status_code': response.status_code,
                'content_type': response.get('Content-Type', ''),
            }
            
            # Add request data for POST/PUT/PATCH
            if request.method in ['POST', 'PUT', 'PATCH']:
                try:
                    if request.content_type == 'application/json':
                        details['request_data'] = json.loads(request.body.decode('utf-8'))
                    else:
                        details['request_data'] = dict(request.POST)
                except:
                    details['request_data'] = 'Unable to parse request data'
            
            # Create activity log
            AdminActivityLog.objects.create(
                user=request.user,
                action=action,
                model_name=model_name,
                object_id=object_id,
                details=details,
                ip_address=request._admin_activity_info['ip_address'],
                user_agent=request._admin_activity_info['user_agent'],
            )
            
        except Exception as e:
            # Log error but don't break the request
            print(f"Error logging admin activity: {e}")

class LoginTrackingMiddleware(MiddlewareMixin):
    """Middleware to track login/logout events"""
    
    def process_request(self, request):
        # Track login events
        if request.path.endswith('/login/') and request.method == 'POST':
            self.track_login(request)
    
    def track_login(self, request):
        """Track successful login events"""
        try:
            # This will be called after successful authentication
            if hasattr(request, 'user') and request.user.is_authenticated:
                if request.user.role in ['admin', 'principal'] or getattr(request.user, 'is_hidden_superuser', False):
                    # Create login history record
                    LoginHistory.objects.create(
                        user=request.user,
                        ip_address=self.get_client_ip(request),
                        user_agent=request.META.get('HTTP_USER_AGENT', ''),
                        is_active=True,
                    )
                    
                    # Log system event
                    SystemAuditLog.objects.create(
                        event_type='user_login',
                        description=f'{request.user.username} logged in',
                        affected_user=request.user,
                        details={
                            'ip_address': self.get_client_ip(request),
                            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
                        },
                        severity='low',
                    )
        except Exception as e:
            print(f"Error tracking login: {e}")
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

class SystemEventTrackingMiddleware(MiddlewareMixin):
    """Middleware to track system-wide events"""
    
    def process_response(self, request, response):
        # Track important system events
        if hasattr(request, 'user') and request.user.is_authenticated:
            self.track_system_events(request, response)
        
        return response
    
    def track_system_events(self, request, response):
        """Track important system events"""
        try:
            # Track user creation/modification
            if 'users/register/' in request.path and request.method == 'POST':
                SystemAuditLog.objects.create(
                    event_type='user_created',
                    description='New user created',
                    details={'path': request.path, 'method': request.method},
                    severity='medium',
                )
            
            # Track payment generation
            elif 'payments/generate/' in request.path and request.method == 'POST':
                SystemAuditLog.objects.create(
                    event_type='payment_generated',
                    description='Payment request generated',
                    details={'path': request.path, 'method': request.method},
                    severity='medium',
                )
            
            # Track attendance marking
            elif 'attendance/teacher/bulk-mark/' in request.path and request.method == 'POST':
                SystemAuditLog.objects.create(
                    event_type='attendance_marked',
                    description='Attendance marked by teacher',
                    details={'path': request.path, 'method': request.method},
                    severity='low',
                )
            
            # Track grade uploads
            elif 'grades/add/' in request.path and request.method == 'POST':
                SystemAuditLog.objects.create(
                    event_type='grade_uploaded',
                    description='Grades uploaded',
                    details={'path': request.path, 'method': request.method},
                    severity='medium',
                )
            
            # Track leave approvals
            elif 'leaves/' in request.path and request.method in ['PATCH', 'PUT']:
                SystemAuditLog.objects.create(
                    event_type='leave_approved',
                    description='Leave status changed',
                    details={'path': request.path, 'method': request.method},
                    severity='medium',
                )
            
            # Track bulletin posts
            elif 'bulletin/' in request.path and request.method == 'POST':
                SystemAuditLog.objects.create(
                    event_type='bulletin_posted',
                    description='Bulletin posted',
                    details={'path': request.path, 'method': request.method},
                    severity='low',
                )
                
        except Exception as e:
            print(f"Error tracking system events: {e}") 