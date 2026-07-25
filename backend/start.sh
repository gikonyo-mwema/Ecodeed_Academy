#!/bin/sh
# =============================================================================
# start.sh — Ecodeed Academy backend entrypoint
#
# This script runs INSIDE the backend Docker container and starts three
# processes in the correct order:
#
#   1. Redis server  — in-memory broker / result backend for Celery
#   2. Celery worker — processes async email tasks from the Redis queue
#   3. Gunicorn      — WSGI server that serves the Django application
#
# Why everything in one container?
#   Keeps the deployment to exactly 3 Docker images (backend / frontend / db)
#   matching what is already built and pushed to Docker Hub.
#   Redis is lightweight enough (~30 MB RAM idle) to share the container.
# =============================================================================

set -e

# ---------------------------------------------------------------------------
# 1. Start Redis in the background (no persistence needed for task queue)
# ---------------------------------------------------------------------------
echo "Starting Redis..."
redis-server --save "" --appendonly no --loglevel warning &
REDIS_PID=$!

# Wait until Redis responds to PING before continuing
until redis-cli ping 2>/dev/null | grep -q "PONG"; do
  echo "  Waiting for Redis to be ready..."
  sleep 1
done
echo "Redis is ready (PID $REDIS_PID)"

# ---------------------------------------------------------------------------
# 2. Wait for MySQL then run Django migrations
# ---------------------------------------------------------------------------
echo "Running database migrations..."
until python manage.py migrate --noinput; do
  echo "  Database not ready yet, retrying in 3 seconds..."
  sleep 3
done
echo "Migrations complete"

# ---------------------------------------------------------------------------
# 3. Start Celery worker in the background
#    --pool=solo     : single-threaded, low memory, perfect for I/O-bound email tasks
#    --concurrency=2 : two concurrent task slots
#    --max-tasks-per-child=1000 : recycle worker after 1000 tasks to prevent memory leaks
#    -B (beat)       : embedded scheduler that fires CELERY_BEAT_SCHEDULE tasks
#                      (e.g. publishing scheduled blog posts every minute)
# ---------------------------------------------------------------------------
echo "Starting Celery worker (with embedded beat)..."
celery -A config worker \
  --loglevel=info \
  --concurrency=2 \
  --pool=solo \
  --max-tasks-per-child=1000 \
  -B &
echo "Celery worker started"

# ---------------------------------------------------------------------------
# 4. Start Gunicorn in the FOREGROUND
#    Docker keeps the container alive as long as this process runs.
# ---------------------------------------------------------------------------
echo "Starting Gunicorn..."
exec gunicorn config.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers 3 \
  --timeout 120 \
  --access-logfile -
