"""
Management command to set a user's role as admin.

Usage:
  python manage.py set_user_admin <email> [--staff] [--superuser]
  
Examples:
  python manage.py set_user_admin admin@ecodeed.com
  python manage.py set_user_admin admin@ecodeed.com --staff --superuser
"""

from django.core.management.base import BaseCommand, CommandError
from users.models import CustomUser


class Command(BaseCommand):
    help = 'Set a user as admin'

    def add_arguments(self, parser):
        parser.add_argument(
            'email',
            type=str,
            help='Email of the user to make admin'
        )
        parser.add_argument(
            '--staff',
            action='store_true',
            help='Also set is_staff=True (Django admin access)'
        )
        parser.add_argument(
            '--superuser',
            action='store_true',
            help='Also set is_superuser=True (full Django permissions)'
        )

    def handle(self, *args, **options):
        email = options['email']
        
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            raise CommandError(f'User with email {email} does not exist')

        # Set user as admin
        user.user_type = CustomUser.UserType.ADMIN
        
        if options['staff']:
            user.is_staff = True
            self.stdout.write(self.style.SUCCESS('✓ Set is_staff=True'))
        
        if options['superuser']:
            user.is_superuser = True
            self.stdout.write(self.style.SUCCESS('✓ Set is_superuser=True'))
        
        user.save()
        
        self.stdout.write(
            self.style.SUCCESS(f'✓ User {email} is now admin')
        )
        self.stdout.write(
            f'  - user_type: {user.user_type}\n'
            f'  - is_staff: {user.is_staff}\n'
            f'  - is_superuser: {user.is_superuser}'
        )
