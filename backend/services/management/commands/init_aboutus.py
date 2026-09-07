"""
Management command to initialize About Us page content with default data.

Usage:
    python manage.py init_aboutus
"""

from django.core.management.base import BaseCommand
from services.models import AboutUs


class Command(BaseCommand):
    help = 'Initialize About Us page with default content'

    def handle(self, *args, **options):
        """Create default About Us content if it doesn't exist"""
        about_us, created = AboutUs.get_or_create_default()
        
        if created:
            self.stdout.write(
                self.style.SUCCESS('✓ About Us page created with default content')
            )
        else:
            self.stdout.write(
                self.style.WARNING('✓ About Us page already exists')
            )
        
        self.stdout.write(
            self.style.SUCCESS(f'\nAbout Us ID: {about_us.id}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Hero Title: {about_us.hero_title}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Mission: {about_us.mission_statement[:100]}...')
        )
