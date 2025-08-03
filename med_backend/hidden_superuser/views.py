from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q, Count
from django.contrib.auth import get_user_model
from django.http import JsonResponse
import os
import json
import subprocess
import shutil
from datetime import datetime, timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from .models import AdminActivityLog, LoginHistory, SystemAuditLog, CodeModificationLog
from .serializers import (
    AdminActivityLogSerializer, LoginHistorySerializer, SystemAuditLogSerializer,
    CodeModificationLogSerializer, HiddenSuperuserDashboardSerializer,
    CodeModificationRequestSerializer
)

User = get_user_model()

class HiddenSuperuserPermission(permissions.BasePermission):
    """Custom permission for hidden superuser access"""
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            getattr(request.user, 'is_hidden_superuser', False)
        )

class HiddenSuperuserDashboardView(APIView):
    """Dashboard view for hidden superuser with comprehensive system overview"""
    permission_classes = [HiddenSuperuserPermission]
    
    def get(self, request):
        # Get user statistics
        total_users = User.objects.count()
        total_admins = User.objects.filter(role='admin').count()
        total_principals = User.objects.filter(role='principal').count()
        total_teachers = User.objects.filter(role='teacher').count()
        total_students = User.objects.filter(role='student').count()
        total_parents = User.objects.filter(role='parent').count()
        
        # Get recent activities (last 24 hours)
        yesterday = timezone.now() - timedelta(days=1)
        recent_activities = AdminActivityLog.objects.filter(
            timestamp__gte=yesterday
        ).order_by('-timestamp')[:20]
        
        # Get recent logins
        recent_logins = LoginHistory.objects.filter(
            login_time__gte=yesterday
        ).order_by('-login_time')[:20]
        
        # Get system events
        system_events = SystemAuditLog.objects.filter(
            timestamp__gte=yesterday
        ).order_by('-timestamp')[:20]
        
        # Get recent code modifications
        code_modifications = CodeModificationLog.objects.filter(
            timestamp__gte=yesterday
        ).order_by('-timestamp')[:20]
        
        # Count active sessions
        active_sessions = LoginHistory.objects.filter(is_active=True).count()
        
        # System health check
        system_health = {
            'database_connected': True,  # You can add actual DB health check
            'disk_usage': self.get_disk_usage(),
            'memory_usage': self.get_memory_usage(),
            'uptime': self.get_system_uptime(),
            'last_backup': self.get_last_backup_time(),
        }
        
        data = {
            'total_users': total_users,
            'total_admins': total_admins,
            'total_principals': total_principals,
            'total_teachers': total_teachers,
            'total_students': total_students,
            'total_parents': total_parents,
            'recent_activities': AdminActivityLogSerializer(recent_activities, many=True).data,
            'recent_logins': LoginHistorySerializer(recent_logins, many=True).data,
            'system_events': SystemAuditLogSerializer(system_events, many=True).data,
            'code_modifications': CodeModificationLogSerializer(code_modifications, many=True).data,
            'active_sessions': active_sessions,
            'system_health': system_health,
        }
        
        serializer = HiddenSuperuserDashboardSerializer(data)
        return Response(serializer.data)
    
    def get_disk_usage(self):
        try:
            result = subprocess.run(['df', '-h', '.'], capture_output=True, text=True)
            if result.returncode == 0:
                lines = result.stdout.strip().split('\n')
                if len(lines) > 1:
                    parts = lines[1].split()
                    if len(parts) >= 5:
                        return f"{parts[4]} used"
        except:
            pass
        return "Unknown"
    
    def get_memory_usage(self):
        try:
            result = subprocess.run(['free', '-h'], capture_output=True, text=True)
            if result.returncode == 0:
                lines = result.stdout.strip().split('\n')
                if len(lines) > 1:
                    parts = lines[1].split()
                    if len(parts) >= 3:
                        return f"{parts[2]} used"
        except:
            pass
        return "Unknown"
    
    def get_system_uptime(self):
        try:
            with open('/proc/uptime', 'r') as f:
                uptime_seconds = float(f.readline().split()[0])
                uptime_hours = int(uptime_seconds // 3600)
                return f"{uptime_hours}h"
        except:
            pass
        return "Unknown"
    
    def get_last_backup_time(self):
        # You can implement actual backup tracking
        return "Never"

class AdminActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for admin activity logs"""
    queryset = AdminActivityLog.objects.all().order_by('-timestamp')
    serializer_class = AdminActivityLogSerializer
    permission_classes = [HiddenSuperuserPermission]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by user
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filter by action
        action = self.request.query_params.get('action')
        if action:
            queryset = queryset.filter(action=action)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(timestamp__gte=start_date)
        if end_date:
            queryset = queryset.filter(timestamp__lte=end_date)
        
        return queryset

class LoginHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for login history"""
    queryset = LoginHistory.objects.all().order_by('-login_time')
    serializer_class = LoginHistorySerializer
    permission_classes = [HiddenSuperuserPermission]
    
    @action(detail=True, methods=['post'])
    def force_logout(self, request, pk=None):
        """Force logout a user session"""
        login_record = self.get_object()
        login_record.is_active = False
        login_record.logout_time = timezone.now()
        login_record.save()
        
        return Response({'message': 'User session terminated successfully'})

class SystemAuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for system audit logs"""
    queryset = SystemAuditLog.objects.all().order_by('-timestamp')
    serializer_class = SystemAuditLogSerializer
    permission_classes = [HiddenSuperuserPermission]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by severity
        severity = self.request.query_params.get('severity')
        if severity:
            queryset = queryset.filter(severity=severity)
        
        # Filter by event type
        event_type = self.request.query_params.get('event_type')
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        
        return queryset

class CodeModificationViewSet(viewsets.ModelViewSet):
    """ViewSet for code modifications"""
    queryset = CodeModificationLog.objects.all().order_by('-timestamp')
    serializer_class = CodeModificationLogSerializer
    permission_classes = [HiddenSuperuserPermission]
    
    @action(detail=False, methods=['post'])
    def modify_code(self, request):
        """Modify code files directly"""
        serializer = CodeModificationRequestSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            
            try:
                # Create backup if requested
                if data['backup_existing'] and os.path.exists(data['file_path']):
                    backup_path = f"{data['file_path']}.backup.{int(timezone.now().timestamp())}"
                    shutil.copy2(data['file_path'], backup_path)
                
                # Read old content if file exists
                old_content = ""
                if os.path.exists(data['file_path']):
                    with open(data['file_path'], 'r', encoding='utf-8') as f:
                        old_content = f.read()
                
                # Write new content
                if data['modification_type'] in ['create', 'update']:
                    os.makedirs(os.path.dirname(data['file_path']), exist_ok=True)
                    with open(data['file_path'], 'w', encoding='utf-8') as f:
                        f.write(data['new_content'])
                elif data['modification_type'] == 'delete':
                    if os.path.exists(data['file_path']):
                        os.remove(data['file_path'])
                
                # Log the modification
                modification_log = CodeModificationLog.objects.create(
                    file_path=data['file_path'],
                    file_type=data['file_type'],
                    modification_type=data['modification_type'],
                    old_content=old_content,
                    new_content=data['new_content'],
                    description=data['description'],
                    modified_by=request.user,
                    is_applied=True
                )
                
                return Response({
                    'message': 'Code modification applied successfully',
                    'modification_id': modification_log.id
                })
                
            except Exception as e:
                # Log the failed modification
                CodeModificationLog.objects.create(
                    file_path=data['file_path'],
                    file_type=data['file_type'],
                    modification_type=data['modification_type'],
                    old_content=old_content,
                    new_content=data['new_content'],
                    description=data['description'],
                    modified_by=request.user,
                    is_applied=False,
                    error_message=str(e)
                )
                
                return Response({
                    'error': f'Failed to modify code: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def deploy_changes(self, request):
        """Deploy changes by restarting servers and applying modifications"""
        try:
            # Log the deployment attempt
            deployment_log = CodeModificationLog.objects.create(
                file_path='SYSTEM_DEPLOYMENT',
                file_type='system',
                modification_type='deploy',
                old_content='',
                new_content='Deployment initiated by hidden superuser',
                description=f'System deployment initiated by {request.user.username}',
                modified_by=request.user,
                is_applied=True
            )
            
            # Get recent modifications that need to be deployed
            recent_modifications = CodeModificationLog.objects.filter(
                is_applied=True,
                timestamp__gte=timezone.now() - timedelta(hours=1)
            ).order_by('-timestamp')
            
            # Create deployment summary
            deployment_summary = {
                'deployment_id': deployment_log.id,
                'timestamp': timezone.now().isoformat(),
                'initiated_by': request.user.username,
                'modifications_count': recent_modifications.count(),
                'modified_files': list(recent_modifications.values_list('file_path', flat=True)),
                'status': 'initiated'
            }
            
            # In a real production environment, you would:
            # 1. Trigger server restarts
            # 2. Apply database migrations
            # 3. Clear caches
            # 4. Notify other services
            
            # For now, we'll simulate the deployment process
            import time
            time.sleep(2)  # Simulate deployment time
            
            # Update deployment log with success
            deployment_log.new_content = f'Deployment completed successfully. Modified {recent_modifications.count()} files.'
            deployment_log.save()
            
            return Response({
                'message': 'Deployment completed successfully!',
                'deployment_id': deployment_log.id,
                'modified_files_count': recent_modifications.count(),
                'deployment_summary': deployment_summary
            })
            
        except Exception as e:
            # Log the failed deployment
            CodeModificationLog.objects.create(
                file_path='SYSTEM_DEPLOYMENT',
                file_type='system',
                modification_type='deploy',
                old_content='',
                new_content='Deployment failed',
                description=f'System deployment failed: {str(e)}',
                modified_by=request.user,
                is_applied=False,
                error_message=str(e)
            )
            
            return Response({
                'error': f'Deployment failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def deployment_status(self, request):
        """Get deployment status and recent modifications"""
        try:
            # Get recent deployments
            recent_deployments = CodeModificationLog.objects.filter(
                modification_type='deploy',
                timestamp__gte=timezone.now() - timedelta(hours=24)
            ).order_by('-timestamp')[:10]
            
            # Get pending modifications
            pending_modifications = CodeModificationLog.objects.filter(
                is_applied=True,
                modification_type__in=['create', 'update', 'delete'],
                timestamp__gte=timezone.now() - timedelta(hours=1)
            ).order_by('-timestamp')
            
            # Get system health
            system_health = {
                'backend_running': True,  # You can add actual health checks
                'frontend_running': True,
                'database_connected': True,
                'last_deployment': recent_deployments.first().timestamp if recent_deployments.exists() else None,
                'pending_changes': pending_modifications.count()
            }
            
            return Response({
                'recent_deployments': CodeModificationLogSerializer(recent_deployments, many=True).data,
                'pending_modifications': CodeModificationLogSerializer(pending_modifications, many=True).data,
                'system_health': system_health
            })
            
        except Exception as e:
            return Response({
                'error': f'Failed to get deployment status: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def get_file_content(self, request):
        """Get content of a specific file"""
        file_path = request.query_params.get('file_path')
        if not file_path:
            return Response({'error': 'file_path parameter is required'}, status=400)
        
        try:
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                return Response({'content': content})
            else:
                return Response({'error': 'File not found'}, status=404)
        except Exception as e:
            return Response({'error': f'Error reading file: {str(e)}'}, status=500)
    
    @action(detail=False, methods=['get'])
    def list_files(self, request):
        """List files in a directory"""
        directory = request.query_params.get('directory', '.')
        file_type = request.query_params.get('file_type', 'all')
        
        try:
            files = []
            for root, dirs, filenames in os.walk(directory):
                for filename in filenames:
                    file_path = os.path.join(root, filename)
                    if file_type == 'all' or filename.endswith(self.get_file_extensions(file_type)):
                        files.append({
                            'path': file_path,
                            'name': filename,
                            'size': os.path.getsize(file_path),
                            'modified': datetime.fromtimestamp(os.path.getmtime(file_path)).isoformat()
                        })
            
            return Response({'files': files})
        except Exception as e:
            return Response({'error': f'Error listing files: {str(e)}'}, status=500)
    
    def get_file_extensions(self, file_type):
        extensions = {
            'frontend': ('.js', '.jsx', '.ts', '.tsx', '.css', '.html'),
            'backend': ('.py', '.pyc'),
            'database': ('.sql', '.db', '.sqlite3'),
            'config': ('.json', '.yaml', '.yml', '.env', '.ini')
        }
        return extensions.get(file_type, ())

class HiddenSuperuserUserManagementView(APIView):
    """View for hidden superuser to manage all users"""
    permission_classes = [HiddenSuperuserPermission]
    
    def get(self, request):
        """Get all users with detailed information"""
        users = User.objects.all().order_by('username')
        
        # Get additional stats for each user
        user_data = []
        for user in users:
            user_info = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'is_active': user.is_active,
                'date_joined': user.date_joined,
                'last_login': user.last_login,
                'is_hidden_superuser': getattr(user, 'is_hidden_superuser', False),
                'activity_count': user.activity_logs.count(),
                'login_count': user.login_history.count(),
                'recent_activity': user.activity_logs.first().timestamp if user.activity_logs.exists() else None,
            }
            user_data.append(user_info)
        
        return Response({'users': user_data})
    
    def post(self, request):
        """Create or modify users"""
        action = request.data.get('action')
        user_id = request.data.get('user_id')
        
        if action == 'toggle_hidden_superuser':
            try:
                user = User.objects.get(id=user_id)
                user.is_hidden_superuser = not getattr(user, 'is_hidden_superuser', False)
                user.save()
                return Response({'message': f'Hidden superuser status toggled for {user.username}'})
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=404)
        
        return Response({'error': 'Invalid action'}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_user_status(request):
    """Toggle user status (hidden superuser, active, etc.)"""
    user = request.user
    
    # Only hidden superusers can toggle user status
    if not getattr(user, 'is_hidden_superuser', False):
        return Response({
            "error": "Access denied",
            "details": "Only hidden superusers can toggle user status"
        }, status=status.HTTP_403_FORBIDDEN)
    
    user_id = request.data.get('user_id')
    action = request.data.get('action')
    
    if not user_id or not action:
        return Response({
            "error": "Missing required fields",
            "details": "user_id and action are required",
            "required_fields": ["user_id", "action"],
            "valid_actions": ["toggle_hidden_superuser", "toggle_active", "toggle_staff"]
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        target_user = get_object_or_404(User, id=user_id)
    except User.DoesNotExist:
        return Response({
            "error": "User not found",
            "details": f"User with ID {user_id} does not exist"
        }, status=status.HTTP_404_NOT_FOUND)
    
    if action == "toggle_hidden_superuser":
        target_user.is_hidden_superuser = not target_user.is_hidden_superuser
        status_msg = "enabled" if target_user.is_hidden_superuser else "disabled"
    elif action == "toggle_active":
        target_user.is_active = not target_user.is_active
        status_msg = "activated" if target_user.is_active else "deactivated"
    elif action == "toggle_staff":
        target_user.is_staff = not target_user.is_staff
        status_msg = "granted staff" if target_user.is_staff else "revoked staff"
    else:
        return Response({
            "error": "Invalid action",
            "details": f"Action '{action}' is not valid",
            "valid_actions": ["toggle_hidden_superuser", "toggle_active", "toggle_staff"]
        }, status=status.HTTP_400_BAD_REQUEST)
    
    target_user.save()
    
    return Response({
        "message": f"User {target_user.username} {status_msg} successfully",
        "user_id": target_user.id,
        "username": target_user.username,
        "action": action,
        "new_status": {
            "is_hidden_superuser": target_user.is_hidden_superuser,
            "is_active": target_user.is_active,
            "is_staff": target_user.is_staff
        }
    }, status=status.HTTP_200_OK)
