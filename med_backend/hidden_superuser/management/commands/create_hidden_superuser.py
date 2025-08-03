from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a hidden superuser for testing'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, default='hidden_superuser', help='Username for the hidden superuser')
        parser.add_argument('--email', type=str, default='hidden@example.com', help='Email for the hidden superuser')
        parser.add_argument('--password', type=str, default='hidden123', help='Password for the hidden superuser')

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']

        try:
            with transaction.atomic():
                # Check if user already exists
                if User.objects.filter(username=username).exists():
                    self.stdout.write(
                        self.style.WARNING(f'User "{username}" already exists. Updating to hidden superuser...')
                    )
                    user = User.objects.get(username=username)
                else:
                    # Create new user
                    user = User.objects.create_user(
                        username=username,
                        email=email,
                        password=password,
                        role='admin'  # Set as admin role for compatibility
                    )
                    self.stdout.write(
                        self.style.SUCCESS(f'Created user "{username}"')
                    )

                # Set hidden superuser flags
                user.is_hidden_superuser = True
                user.is_superuser = True
                user.is_staff = True
                user.save()

                self.stdout.write(
                    self.style.SUCCESS(
                        f'Hidden superuser "{username}" created/updated successfully!\n'
                        f'Username: {username}\n'
                        f'Password: {password}\n'
                        f'Email: {email}\n'
                        f'Login with admin role and hidden superuser privileges will be granted.'
                    )
                )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating hidden superuser: {str(e)}')
            ) 