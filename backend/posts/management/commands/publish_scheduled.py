"""
Management command: publish_scheduled

Auto-publishes posts whose status is 'scheduled' and scheduled_for <= now.
Run via cron (or django-celery-beat) in production, e.g.:

    * * * * *  cd /app && python manage.py publish_scheduled

Manual usage:

    python manage.py publish_scheduled
    python manage.py publish_scheduled --dry-run   # preview without saving
"""

from django.core.management.base import BaseCommand
from django.utils import timezone

from posts.models import Post


class Command(BaseCommand):
    help = "Publish posts whose scheduled_for datetime has passed."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show which posts would be published without actually saving.",
        )

    def handle(self, *args, **options):
        now = timezone.now()
        dry_run = options["dry_run"]

        due = Post.objects.filter(
            status=Post.Status.SCHEDULED,
            scheduled_for__isnull=False,
            scheduled_for__lte=now,
        ).select_related("user")

        count = due.count()
        if count == 0:
            self.stdout.write(self.style.SUCCESS("No scheduled posts due for publishing."))
            return

        for post in due:
            if dry_run:
                self.stdout.write(
                    f"  [DRY-RUN] Would publish: \"{post.title}\" "
                    f"(scheduled for {post.scheduled_for})"
                )
            else:
                post.status = Post.Status.PUBLISHED
                post.published_at = post.scheduled_for
                post.save(update_fields=["status", "published_at", "updated_at"])
                self.stdout.write(
                    self.style.SUCCESS(
                        f"  ✅ Published: \"{post.title}\" "
                        f"(was scheduled for {post.scheduled_for})"
                    )
                )

        verb = "would publish" if dry_run else "published"
        self.stdout.write(
            self.style.SUCCESS(f"\nDone — {verb} {count} post(s).")
        )
