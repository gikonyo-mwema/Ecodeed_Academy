"""
Management command to seed About Us page with detailed company content.

Usage:
    python manage.py seed_aboutus
"""

from django.core.management.base import BaseCommand
from services.models import AboutUs


class Command(BaseCommand):
    help = 'Seed About Us page with comprehensive company content'

    def handle(self, *args, **options):
        """Create or update About Us with detailed content"""
        
        about_us_data = {
            'hero_title': 'Transforming Compliance Into Competitive Advantage',
            'hero_subtitle': 'Where environmental responsibility meets business success',
            'hero_image_url': 'https://res.cloudinary.com/dcrubaesi/image/upload/v1737333837/ECODEED_COLORED_LOGO_wj2yy8.png',
            
            'mission_statement': 'At Ecodeed Consulting, we empower businesses, governments, and communities to navigate environmental compliance, implement sustainable practices, and future-proof their operations—so no dream is lost due to regulatory hurdles.',
            
            'vision_statement': 'We exist to ensure that no dream dies because of environmental non-compliance. At Ecodeed, we don\'t just help businesses comply — we help them thrive.',
            
            'founder_name': 'Miriam Mukami Mwema',
            
            'founder_bio': '''Miriam Mukami Mwema is an environmental strategist, sustainability educator, and the driving force behind Ecodeed Consulting. With over 8 years of experience in environmental impact assessments, audits, and regulatory compliance, she has led 100+ projects across Kenya, helping businesses and counties align with environmental laws while fostering sustainable growth.

A licensed Environmental Impact Assessment & Audit (EIA/EA) Expert, Miriam holds a degree in Environmental Science from Maseno University and is trained in ISO 14001:2015 Environmental Management Systems.

## The Day Everything Changed

Eight years ago, a distressed woman entered NEMA offices where Miriam was working. She had operated a petrol station business for three years without knowing she needed NEMA approvals. Now she faced fines, prosecution, and the loss of her life's investment—her dream crushed by lack of guidance.

"That woman's pain became my purpose. I couldn't stand by while dreams were crushed by lack of knowledge. I decided to dedicate my life to ensuring what happened to her would never happen to another investor."

## Our Core Promise

We exist to ensure that no dream dies because of environmental non-compliance. Not under our watch. Not in our time. Every client we work with, every approval we guide, every business we support—is a vow to protect dreamers and help them build empires that last, legally, ethically, and sustainably.''',
            
            'founder_image_url': 'https://res.cloudinary.com/dcrubaesi/image/upload/v1759583146/Mukami_Mwema_profile_1_luizqu.jpg',
            
            'values': [
                {
                    'name': 'Integrity',
                    'description': 'Honest and transparent in all dealings. We are guided by ethical principles and commitment to doing what is right.'
                },
                {
                    'name': 'Innovation',
                    'description': 'Constantly seeking new solutions to environmental challenges. We stay ahead of regulatory changes and industry best practices.'
                },
                {
                    'name': 'Impact',
                    'description': 'Committed to meaningful change. Every project drives real environmental and business transformation for our clients and communities.'
                },
                {
                    'name': 'Excellence',
                    'description': 'Striving for the highest standards in everything we do. From compliance to sustainability implementation, we deliver superior results.'
                }
            ],
            
            'metrics': [
                {
                    'label': 'Years of Experience',
                    'value': '8+'
                },
                {
                    'label': 'Projects Completed',
                    'value': '100+'
                },
                {
                    'label': 'Clients Served',
                    'value': '50+'
                },
                {
                    'label': 'Counties Supported',
                    'value': 'Nationwide'
                }
            ],
            
            'team_members': [
                {
                    'name': 'Miriam Mukami Mwema',
                    'role': 'CEO & Founder',
                    'bio': 'Environmental strategist and sustainability educator. Licensed EIA/EA Expert with 8+ years transforming environmental compliance into competitive advantage.',
                    'image': 'https://res.cloudinary.com/dcrubaesi/image/upload/v1759583146/Mukami_Mwema_profile_1_luizqu.jpg'
                }
            ],
            
            'is_published': True
        }
        
        # Update or create About Us entry
        about_us, created = AboutUs.objects.update_or_create(
            id=1,
            defaults=about_us_data
        )
        
        if created:
            self.stdout.write(
                self.style.SUCCESS('✓ About Us page created with detailed content')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS('✓ About Us page updated with new content')
            )
        
        self.stdout.write(
            self.style.SUCCESS(f'\n📋 Content Seeded:')
        )
        self.stdout.write(
            self.style.SUCCESS(f'  ✓ Hero Title: {about_us.hero_title}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'  ✓ Mission: {about_us.mission_statement[:80]}...')
        )
        self.stdout.write(
            self.style.SUCCESS(f'  ✓ Founder: {about_us.founder_name}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'  ✓ Values: {len(about_us.values)} items')
        )
        self.stdout.write(
            self.style.SUCCESS(f'  ✓ Metrics: {len(about_us.metrics)} items')
        )
        self.stdout.write(
            self.style.SUCCESS(f'  ✓ Team Members: {len(about_us.team_members)} items')
        )
        self.stdout.write(
            self.style.SUCCESS(f'  ✓ Published: {about_us.is_published}')
        )
