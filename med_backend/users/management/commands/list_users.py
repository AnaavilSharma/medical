from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'List all users with their roles'

    def handle(self, *args, **kwargs):
        User = get_user_model()
        users = User.objects.all()
        if not users:
            self.stdout.write("No users found.")
            return
        
        self.stdout.write(f"{'Username':<20} {'Email':<30} {'Role':<15}")
        self.stdout.write('-' * 65)
        for user in users:
            self.stdout.write(f"{user.username:<20} {user.email:<30} {user.role:<15}")