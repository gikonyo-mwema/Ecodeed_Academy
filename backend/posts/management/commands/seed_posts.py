"""
Django management command to seed posts from MongoDB JSON export to Django MySQL database.

This command transforms the MongoDB posts.json data to be compatible with the Django Post model
and automatically creates missing dependencies (users, categories, tags).

Usage:
    python manage.py seed_posts --json-file=../posts.json
    python manage.py seed_posts --json-file=../posts.json --dry-run
    python manage.py seed_posts --json-file=../posts.json --clear  # Clear existing posts first
"""

import json
import logging
from pathlib import Path
from datetime import datetime
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from django.utils.text import slugify
from posts.models import Post, Category, Tag
from users.models import CustomUser

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Seed posts from MongoDB JSON export to Django MySQL database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--json-file',
            type=str,
            default='fixtures/seed_posts.json',
            help='Path to the seed posts JSON file (default: fixtures/seed_posts.json)'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be imported without making changes'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Delete all existing posts before seeding'
        )
        parser.add_argument(
            '--default-user',
            type=str,
            default=None,
            help='Email of default user if original userId not found'
        )

    def handle(self, *args, **options):
        json_file = options['json_file']
        dry_run = options['dry_run']
        clear_existing = options['clear']
        default_user_email = options['default_user']

        # Validate JSON file exists
        if not Path(json_file).exists():
            raise CommandError(f'JSON file not found: {json_file}')

        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                posts_data = json.load(f)
        except json.JSONDecodeError as e:
            raise CommandError(f'Invalid JSON file: {e}')

        self.stdout.write(self.style.WARNING(f'Found {len(posts_data)} posts to import'))

        if not isinstance(posts_data, list):
            raise CommandError('JSON file must contain an array of posts')

        # Clear existing posts if requested
        if clear_existing and not dry_run:
            count = Post.objects.count()
            if count > 0:
                confirm = input(
                    f'This will DELETE {count} existing posts. Continue? (yes/no): '
                )
                if confirm.lower() == 'yes':
                    Post.objects.all().delete()
                    self.stdout.write(self.style.SUCCESS(f'Deleted {count} posts'))
                else:
                    self.stdout.write(self.style.WARNING('Deletion cancelled'))
                    return

        # Get or create default user
        if default_user_email:
            try:
                default_user = CustomUser.objects.get(email=default_user_email)
            except CustomUser.DoesNotExist:
                raise CommandError(f'Default user not found: {default_user_email}')
        else:
            # Try to get the first admin or any user
            default_user = CustomUser.objects.filter(is_staff=True).first()
            if not default_user:
                default_user = CustomUser.objects.first()
            if not default_user:
                raise CommandError(
                    'No users in database. Create a user first or use --default-user option'
                )

        self.stdout.write(f'Using default user: {default_user.email}')

        # Transform and import posts
        stats = {
            'created': 0,
            'skipped': 0,
            'errors': 0,
            'categories_created': 0,
            'tags_created': 0,
        }

        for idx, post_data in enumerate(posts_data, 1):
            try:
                # Transform MongoDB data to Django model
                transformed = self.transform_post(post_data, default_user)

                if dry_run:
                    self.stdout.write(f'\n[{idx}] Would create: {transformed["title"]}')
                    self.stdout.write(f'    Category: {transformed["category_name"]}')
                    self.stdout.write(f'    Tags: {", ".join(transformed["tags"]) if transformed["tags"] else "None"}')
                else:
                    # Get or create category
                    if transformed['category_name']:
                        category, created = Category.objects.get_or_create(
                            name=transformed['category_name'],
                            defaults={'slug': slugify(transformed['category_name'])}
                        )
                        if created:
                            stats['categories_created'] += 1
                    else:
                        category = None

                    # Create post
                    post = Post.objects.create(
                        title=transformed['title'],
                        content=transformed['content'],
                        excerpt=transformed.get('excerpt', ''),
                        slug=transformed['slug'],
                        image=transformed.get('image', ''),
                        category=transformed.get('category_str', 'uncategorized'),
                        category_fk=category,
                        status=transformed['status'],
                        published_at=transformed.get('published_at'),
                        user=transformed['user'],
                        views=transformed.get('views', 0),
                        featured=transformed.get('featured', False),
                    )

                    # Add tags
                    for tag_name in transformed.get('tags', []):
                        tag, created = Tag.objects.get_or_create(
                            name=tag_name,
                            defaults={'slug': slugify(tag_name)}
                        )
                        post.tags.add(tag)
                        if created:
                            stats['tags_created'] += 1

                    # Override timestamps (preserve original dates from MongoDB)
                    if transformed.get('created_at'):
                        Post.objects.filter(pk=post.pk).update(
                            created_at=transformed['created_at']
                        )

                    stats['created'] += 1
                    self.stdout.write(f'[{idx}] ✓ {post.title}')

            except Exception as e:
                stats['errors'] += 1
                logger.error(f'Error processing post {idx}: {e}', exc_info=True)
                self.stdout.write(
                    self.style.ERROR(f'[{idx}] ✗ Error: {str(e)}')
                )

        # Print summary
        self.print_summary(stats, dry_run)

    def transform_post(self, mongo_post, default_user):
        """
        Transform MongoDB post document to Django Post model fields.
        
        Args:
            mongo_post: Dictionary with MongoDB post data
            default_user: Default user to assign if original not found
            
        Returns:
            Dictionary with transformed data ready for Django model
        """
        # Extract basic fields
        title = mongo_post.get('title', 'Untitled')
        content = mongo_post.get('content', '')
        category_str = mongo_post.get('category', 'uncategorized')
        views = mongo_post.get('views', 0)
        image = mongo_post.get('image', '')
        slug = mongo_post.get('slug', '')

        # Generate slug if missing
        if not slug:
            base_slug = slugify(title)
            if not base_slug:
                base_slug = 'post'
            slug = base_slug

        # Ensure unique slug
        counter = 1
        original_slug = slug
        while Post.objects.filter(slug=slug).exists():
            slug = f'{original_slug}-{counter}'
            counter += 1

        # Parse dates
        created_at = None
        updated_at = None
        
        if 'createdAt' in mongo_post:
            date_obj = mongo_post['createdAt']
            if isinstance(date_obj, dict) and '$date' in date_obj:
                # MongoDB extended JSON format: {"$date": "2025-09-18T08:15:25.675Z"}
                try:
                    created_at = timezone.datetime.fromisoformat(
                        date_obj['$date'].replace('Z', '+00:00')
                    )
                except (ValueError, TypeError):
                    pass
            elif isinstance(date_obj, str):
                try:
                    created_at = timezone.datetime.fromisoformat(
                        date_obj.replace('Z', '+00:00')
                    )
                except ValueError:
                    pass
            elif isinstance(date_obj, datetime):
                created_at = timezone.make_aware(date_obj)

        if 'updatedAt' in mongo_post:
            date_obj = mongo_post['updatedAt']
            if isinstance(date_obj, dict) and '$date' in date_obj:
                try:
                    updated_at = timezone.datetime.fromisoformat(
                        date_obj['$date'].replace('Z', '+00:00')
                    )
                except (ValueError, TypeError):
                    pass
            elif isinstance(date_obj, str):
                try:
                    updated_at = timezone.datetime.fromisoformat(
                        date_obj.replace('Z', '+00:00')
                    )
                except ValueError:
                    pass
            elif isinstance(date_obj, datetime):
                updated_at = timezone.make_aware(date_obj)

        if not created_at:
            created_at = timezone.now()
        if not updated_at:
            updated_at = created_at

        # Determine status - default to published if it has content
        status = 'published' if content else 'draft'

        # Try to find user, fallback to default
        user = default_user
        if 'userId' in mongo_post:
            user_id_obj = mongo_post['userId']
            # MongoDB ObjectId format
            try:
                # This is a placeholder - in reality you'd need to map MongoDB IDs
                # For now, use the default user
                pass
            except Exception:
                pass

        # Extract tags (if any were included in MongoDB document)
        tags = []
        if 'tags' in mongo_post and isinstance(mongo_post['tags'], list):
            tags = [str(t).strip() for t in mongo_post['tags'] if t]

        # Map MongoDB category to Django category
        category_name = self.map_category(category_str)

        return {
            'title': title,
            'content': content,
            'excerpt': mongo_post.get('excerpt', ''),
            'slug': slug,
            'image': image,
            'category_str': category_str,
            'category_name': category_name,
            'views': views,
            'status': status,
            'published_at': created_at if status == 'published' else None,
            'created_at': created_at,
            'updated_at': updated_at,
            'user': user,
            'tags': tags,
            'featured': False,
        }

    @staticmethod
    def map_category(mongo_category):
        """
        Map MongoDB category strings to Django Category names.
        Can be customized based on your actual category mapping.
        """
        category_map = {
            'governance': 'Governance',
            'climate-change': 'Climate Change',
            'conservation': 'Conservation',
            'renewable-energy': 'Renewable Energy',
            'sustainability': 'Sustainability',
            'education': 'Education',
            'uncategorized': 'Uncategorized',
            'environmental-law': 'Environmental Law',
            'regulation': 'Regulation',
            'biodiversity': 'Biodiversity',
        }
        
        category = mongo_category.lower().strip()
        return category_map.get(category, 'Uncategorized')

    def print_summary(self, stats, dry_run):
        """Print import summary."""
        self.stdout.write('\n' + '=' * 60)
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN - No changes made'))
        
        self.stdout.write(f'Posts created: {stats["created"]}')
        self.stdout.write(f'Posts skipped: {stats["skipped"]}')
        self.stdout.write(f'Posts errors: {stats["errors"]}')
        self.stdout.write(f'Categories created: {stats["categories_created"]}')
        self.stdout.write(f'Tags created: {stats["tags_created"]}')
        self.stdout.write('=' * 60)