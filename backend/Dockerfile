FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Collect static files at build time so Gunicorn/WhiteNoise can serve them
RUN python manage.py collectstatic --noinput 2>/dev/null || true

# Gunicorn: production-grade WSGI server
# --bind            listen on all interfaces, port 8000
# --workers         2× CPU cores + 1  (container usually gets 1-2 cores)
# --timeout         120 s for slow uploads / payment webhooks
# --access-logfile  stdout so Docker log drivers can capture it
CMD ["gunicorn", "config.wsgi:application", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "3", \
     "--timeout", "120", \
     "--access-logfile", "-"]
