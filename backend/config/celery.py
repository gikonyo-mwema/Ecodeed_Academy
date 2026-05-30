"""
═══════════════════════════════════════════════════════════════════════════════
CELERY CONFIGURATION — Async Task Queue for Email Processing

This module configures Celery to handle asynchronous tasks (primarily email
sending) without blocking HTTP requests. Email sending is moved to background
workers, making the API responsive even when sending to thousands of recipients.

WHAT IS CELERY?
───────────────
Celery is a distributed task queue that runs code in the background. Instead of
waiting for an email to send (which can take 5-20 seconds for bulk sends), we:
  1. Submit the task to a queue (instant, <100ms)
  2. Return success response to user immediately
  3. Celery worker processes the task in the background

WHAT IS REDIS?
──────────────
Redis is an in-memory data store that acts as the message broker (task queue).
Think of it as a mailbox:
  - We put tasks in the mailbox (Redis)
  - Celery workers check the mailbox periodically
  - Workers pull tasks and execute them
  - Results are stored back in Redis

ARCHITECTURE
────────────
Django API  ──(submit task)──>  Redis Queue  ──>  Celery Worker 1
                                       └──────>  Celery Worker 2
                                       └──────>  Celery Worker N

User gets instant response while workers process emails in background.

═══════════════════════════════════════════════════════════════════════════════
"""

import os
import pymysql
from celery import Celery
from django.conf import settings

# PyMySQL is the pure-Python MySQL driver used in this project.
# Django's mysql backend looks for MySQLdb, so we register PyMySQL as the drop-in.
# This must happen BEFORE Django is set up (i.e. before config_from_object).
pymysql.install_as_MySQLdb()

# Set the default Django settings module for Celery.
# This tells Celery to use Django settings for configuration.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Initialize Celery app
app = Celery('ecodeed_academy')

# Load configuration from Django settings, with CELERY_ prefix.
# Example: CELERY_BROKER_URL in settings becomes broker_url in Celery.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks in all registered Django app modules.
# This finds all tasks.py files in each app and registers them.
app.autodiscover_tasks()

# Optional: Debugging task execution in development
@app.task(bind=True)
def debug_task(self):
    """
    Simple debug task to test Celery setup.
    Run: celery -A config call config.celery.debug_task
    """
    print(f'Request: {self.request!r}')
