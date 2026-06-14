FROM python:3.11-slim

# Install system dependencies including redis-server
# redis-server runs inside this container as the Celery broker
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    default-libmysqlclient-dev \
    pkg-config \
    redis-server \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --timeout=120 --retries=5 -r requirements.txt

COPY . .

# Collect static files at build time so Gunicorn/WhiteNoise can serve them
RUN python manage.py collectstatic --noinput 2>/dev/null || true

# Make the startup script executable
RUN chmod +x /app/start.sh

# Security: run as non-root user
RUN addgroup --system app && adduser --system --ingroup app app \
    && chown -R app:app /app
USER app

# start.sh: starts Redis, waits for DB, runs migrations, starts Celery, then Gunicorn
# Use 'sh' explicitly so the execute bit on start.sh is not required
CMD ["sh", "/app/start.sh"]
