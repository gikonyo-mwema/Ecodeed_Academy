"""
Django Settings for Ecodeed Academy Project.

This module contains all the Django configuration settings for the Ecodeed
Academy backend application. It includes settings for:
    - Security and secret keys
    - Database configuration (MySQL)
    - Installed applications
    - Middleware configuration
    - Authentication (JWT, Social Auth)
    - REST Framework settings
    - Static and media files
    - Email configuration
    - CORS settings

Environment Variables:
    Required environment variables should be set in a .env file or
    through system environment variables. See .env.example for reference.

For more information on Django settings, see:
    https://docs.djangoproject.com/en/4.2/topics/settings/
"""

import os
from pathlib import Path
import environ
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Initialize environment variables
env = environ.Env()
# Read .env file — check backend root first, fall back to project root (parent of backend/)
_env_file = os.path.join(BASE_DIR, '.env')
if not os.path.isfile(_env_file):
    _env_file = os.path.join(BASE_DIR.parent, '.env')
environ.Env.read_env(_env_file)

# SECURITY WARNING: keep the secret key used in production secret!
# No default — the app will refuse to start if SECRET_KEY is missing.
SECRET_KEY = env('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env.bool('DEBUG', default=False)

ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['localhost', '127.0.0.1', 'backend'])

CSRF_TRUSTED_ORIGINS = env.list('CSRF_TRUSTED_ORIGINS', default=[
    'http://localhost:5173',
    'http://127.0.0.1:5173',
])

# HTTPS settings — only when not in DEBUG mode
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    'django.contrib.sitemaps',

    # Third-party apps
    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_simplejwt.token_blacklist',  # JWT Token blacklist for logout
    'corsheaders',
    'drf_yasg',  # Swagger API documentation
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'dj_rest_auth',
    'dj_rest_auth.registration',
    'django_filters',

    # Social authentication providers
    'allauth.socialaccount.providers.google',
    'allauth.socialaccount.providers.facebook',
    'allauth.socialaccount.providers.twitter',

    # Apps
    'users.apps.UsersConfig',
    'posts',
    'comments',
    'courses',
    'services',
    'payments',
    'messages_app',
    # 'blog.apps.BlogConfig',  # TODO: Create blog app
    # 'services.apps.ServicesConfig',  # TODO: Create services app
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
    'django.middleware.http.ConditionalGetMiddleware',  # ETag / Last-Modified support
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates', BASE_DIR / 'messages_app' / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': env('MYSQL_DATABASE'),
        'USER': env('MYSQL_USER'),
        'PASSWORD': env('MYSQL_PASSWORD'),
        'HOST': env('MYSQL_HOST', default='db'),
        'PORT': env('MYSQL_PORT', default='3306'),
        'OPTIONS': {
            'charset': 'utf8mb4',
        },
    }
}

# Use SQLite for testing
import sys
if 'test' in sys.argv:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'test_db.sqlite3',
        }
    }

# ── Cache backend ──
# Local-memory cache for development.  Switch to Redis/Memcached in production.
# Used by @cache_page decorators in posts views.
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'ecodeed-cache',
        'TIMEOUT': 300,  # 5 minutes default
    }
}


# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True


# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Site URL for generating absolute URLs (avoid Docker internal hostnames)
# In development, this should be http://localhost:8000
# In production, set via SITE_URL environment variable
SITE_URL = env('SITE_URL', default='http://localhost:8000')

# Frontend URL — used by social auth callbacks to postMessage back to the SPA
FRONTEND_URL = env('FRONTEND_URL', default='http://localhost:5173')

# ------------------------------------------------------------------
# Payment provider secrets
# the secret key is used server-side only; public key goes to frontend
# set these in the root .env file or your environment management system
# No defaults — the app will refuse to start if these are missing.
PAYSTACK_SECRET_KEY = env('PAYSTACK_SECRET_KEY')
PAYSTACK_PUBLIC_KEY = env('PAYSTACK_PUBLIC_KEY')
# Webhook secret is optional in development (only needed to verify
# incoming Paystack webhook signatures in production).
PAYSTACK_WEBHOOK_SECRET = env('PAYSTACK_WEBHOOK_SECRET', default='')
# ------------------------------------------------------------------

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom User Model
AUTH_USER_MODEL = 'users.CustomUser'

# CORS Settings
# Never allow all origins — always use an explicit allowlist.
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=[
    'http://localhost:5173',
    'http://127.0.0.1:5173',
])
CORS_ALLOW_CREDENTIALS = True

# REST Framework Settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'dj_rest_auth.jwt_auth.JWTCookieAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
    # ── Throttling ──
    'DEFAULT_THROTTLE_CLASSES': [],  # Per-view throttling set in viewsets
    'DEFAULT_THROTTLE_RATES': {
        'image_upload': '30/hour',
        'view_count': '60/min',
        'post_write': '20/hour',
        'anon': '100/hour',
        'user': '1000/hour',
    },
    # ── Content negotiation ──
    # Versioning is handled by URL prefix in config/urls.py (/api/v1/…)
    # so no DRF versioning class is needed.
    # ── Filtering ──
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.OrderingFilter',
        'rest_framework.filters.SearchFilter',
    ],
    # ── Performance ──
    'COERCE_DECIMAL_TO_STRING': False,
}

# JWT Settings
REST_USE_JWT = True
JWT_AUTH_COOKIE = 'access'
JWT_AUTH_REFRESH_COOKIE = 'refresh'
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# Allauth Settings
SITE_ID = 1
ACCOUNT_LOGIN_METHODS = {'email'}
ACCOUNT_SIGNUP_FIELDS = ['email*', 'password1*', 'password2*']
ACCOUNT_EMAIL_VERIFICATION = 'optional'
ACCOUNT_UNIQUE_EMAIL = True
ACCOUNT_USER_MODEL_USERNAME_FIELD = None  # Tell allauth we don't use username

# Email Settings
# In development, emails are printed to the console.
# In production, emails are sent via Brevo (formerly Sendinblue) HTTP API,
# which works on DigitalOcean where SMTP ports are blocked.
if DEBUG:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
else:
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_HOST = 'smtp-relay.brevo.com'
    EMAIL_PORT = 587
    EMAIL_USE_TLS = True
    EMAIL_HOST_USER = env('BREVO_SMTP_LOGIN', default='')
    EMAIL_HOST_PASSWORD = env('BREVO_SMTP_KEY', default='')

DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL', default='Ecodeed <noreply@ecodeed.co.ke>')

# Brevo (Sendinblue) API Settings — used for transactional & marketing emails
BREVO_API_KEY = env('BREVO_API_KEY', default='')
BREVO_NEWSLETTER_LIST_ID = env.int('BREVO_NEWSLETTER_LIST_ID', default=0)
BREVO_SENDER_EMAIL = env('BREVO_SENDER_EMAIL', default='noreply@ecodeedacademy.com')
BREVO_SENDER_NAME = env('BREVO_SENDER_NAME', default='Ecodeed')
# The inbox that receives contact form notifications (your real inbox, not the sender address)
ADMIN_CONTACT_EMAIL = env('ADMIN_CONTACT_EMAIL', default='contact@ecodeed.co.ke')
ADMIN_CONTACT_NAME = env('ADMIN_CONTACT_NAME', default='Ecodeed Team')

# Social Auth Settings
SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'APP': {
            'client_id': env('GOOGLE_CLIENT_ID', default=''),
            'secret': env('GOOGLE_CLIENT_SECRET', default=''),
            'key': ''
        },
        'SCOPE': [
            'profile',
            'email',
        ],
        'AUTH_PARAMS': {
            'access_type': 'online',
        }
    },
    'facebook': {
        'APP': {
            'client_id': env('FACEBOOK_CLIENT_ID', default=''),
            'secret': env('FACEBOOK_CLIENT_SECRET', default=''),
            'key': ''
        }
    },
    'twitter': {
        'APP': {
            'client_id': env('TWITTER_CLIENT_ID', default=''),
            'secret': env('TWITTER_CLIENT_SECRET', default=''),
        }
    }
}

# ─── Cloudinary (image CDN & upload) ─────────────────────────────
import cloudinary
import cloudinary.uploader

CLOUDINARY_CLOUD_NAME = env('CLOUDINARY_CLOUD_NAME', default='')
CLOUDINARY_API_KEY = env('CLOUDINARY_API_KEY', default='')
CLOUDINARY_API_SECRET = env('CLOUDINARY_API_SECRET', default='')

cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
    secure=True,
)

# Max upload sizes
MAX_POST_IMAGE_SIZE = 5 * 1024 * 1024       # 5 MB for post images
MAX_PROFILE_PICTURE_SIZE = 5 * 1024 * 1024   # 5 MB for profile pictures


# ─── Logging ─────────────────────────────────────────────────────
# Structured logging configuration.
# - In DEBUG mode: everything INFO+ goes to the console.
# - In production: WARNING+ for most loggers, but INFO for our own
#   apps and security-sensitive modules.  Errors are written to a
#   dedicated file so they survive container restarts.
#
# Modules already using `logging.getLogger(__name__)`:
#   messages_app.views, messages_app.email_utils, payments.views
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,

    'formatters': {
        'verbose': {
            'format': '{asctime} {levelname} {name} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {name}: {message}',
            'style': '{',
        },
    },

    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose' if not DEBUG else 'simple',
        },
        'error_file': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'errors.log',
            'formatter': 'verbose',
        },
    },

    'root': {
        'handlers': ['console'],
        'level': 'INFO' if DEBUG else 'WARNING',
    },

    'loggers': {
        # Our apps — always at INFO so we see what’s happening
        'courses': {
            'handlers': ['console', 'error_file'],
            'level': 'INFO',
            'propagate': False,
        },
        'payments': {
            'handlers': ['console', 'error_file'],
            'level': 'INFO',
            'propagate': False,
        },
        'messages_app': {
            'handlers': ['console', 'error_file'],
            'level': 'INFO',
            'propagate': False,
        },
        'posts': {
            'handlers': ['console', 'error_file'],
            'level': 'INFO',
            'propagate': False,
        },
        'users': {
            'handlers': ['console', 'error_file'],
            'level': 'INFO',
            'propagate': False,
        },
        'comments': {
            'handlers': ['console', 'error_file'],
            'level': 'INFO',
            'propagate': False,
        },
        'services': {
            'handlers': ['console', 'error_file'],
            'level': 'INFO',
            'propagate': False,
        },

        # Django internals
        'django': {
            'handlers': ['console'],
            'level': 'INFO' if DEBUG else 'WARNING',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['console', 'error_file'],
            'level': 'ERROR',
            'propagate': False,
        },
        'django.security': {
            'handlers': ['console', 'error_file'],
            'level': 'WARNING',
            'propagate': False,
        },
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'DEBUG' if DEBUG else 'WARNING',
            'propagate': False,
        },
    },
}

# Ensure the log directory exists and is writable.
# When the backend code is volume-mounted in Docker dev the logs/ directory
# may have been created by a previous run with a different OS user
# (e.g. systemd-journal), making errors.log unwritable.  In that case we
# fall back to console-only logging so the container can still start.
import os as _os
_log_file = BASE_DIR / 'logs' / 'errors.log'
(BASE_DIR / 'logs').mkdir(exist_ok=True)
_log_writable = (
    (_log_file.exists() and _os.access(_log_file, _os.W_OK)) or
    (not _log_file.exists() and _os.access(_log_file.parent, _os.W_OK))
)

if not _log_writable:
    # Strip file handler and replace every reference with console-only
    LOGGING['handlers'].pop('error_file', None)
    for _logger in LOGGING['loggers'].values():
        _logger['handlers'] = [h for h in _logger.get('handlers', []) if h != 'error_file']


# ─── Production Security Headers ─────────────────────────────────
# These are only enforced when DEBUG is False (i.e. staging / production).
# In development they are intentionally relaxed so HTTP works locally.
if not DEBUG:
    # ── HTTPS / HSTS ──
    # Env-overridable so the production image can be smoke-tested locally
    # over plain HTTP (SECURE_SSL_REDIRECT=False). Defaults to True.
    SECURE_SSL_REDIRECT = env.bool('SECURE_SSL_REDIRECT', default=True)  # 301-redirect all HTTP → HTTPS
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')  # trust reverse-proxy header
    SECURE_HSTS_SECONDS = 31_536_000             # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True        # apply HSTS to *.ecodeedacademy.com
    SECURE_HSTS_PRELOAD = True                   # allow submission to browser preload lists

    # ── Cookie hardening ──
    SESSION_COOKIE_SECURE = True                 # only send session cookie over HTTPS
    CSRF_COOKIE_SECURE = True                    # only send CSRF cookie over HTTPS
    SESSION_COOKIE_HTTPONLY = True                # no JS access to session cookie
    SESSION_COOKIE_SAMESITE = 'Lax'              # CSRF mitigation
    CSRF_COOKIE_SAMESITE = 'Lax'

    # ── Response headers ──
    SECURE_CONTENT_TYPE_NOSNIFF = True           # X-Content-Type-Options: nosniff
    SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'
    SECURE_CROSS_ORIGIN_OPENER_POLICY = 'same-origin'  # COOP header
    X_FRAME_OPTIONS = 'DENY'                     # clickjacking protection
else:
    # Development defaults — keep things permissive for local work
    SECURE_SSL_REDIRECT = False
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False
    X_FRAME_OPTIONS = 'SAMEORIGIN'


# ═══════════════════════════════════════════════════════════════════════════════
# CELERY CONFIGURATION — Async Task Queue for Background Email Processing
# ═══════════════════════════════════════════════════════════════════════════════
# Celery enables asynchronous task processing without blocking HTTP requests.
# Instead of waiting for email to send (5-20 seconds), we:
#   1. Queue the task immediately (<100ms)
#   2. Return success to user instantly
#   3. Celery workers process emails in the background
#
# REDIS: Acts as the message broker (task queue). Redis is an in-memory data store
# that holds tasks waiting to be processed by Celery workers.
#
# DEPLOYMENT:
# - Development: Redis container with default settings
# - Production: Redis container with memory limit (256M) and eviction policy
# ═══════════════════════════════════════════════════════════════════════════════

# Broker settings: Redis connection string
# Format: redis://[:password]@host:port/db_number
# Redis runs inside the backend container (started by start.sh), so use localhost
CELERY_BROKER_URL = env('CELERY_BROKER_URL', default='redis://localhost:6379/0')

# Result backend: Where Celery stores task results
# Redis runs inside the backend container, so use localhost
CELERY_RESULT_BACKEND = env('CELERY_RESULT_BACKEND', default='redis://localhost:6379/1')

# Task serialization format
# 'json' is safer than 'pickle' (pickle can execute arbitrary code)
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'

# Timezone settings
# All timestamps in tasks will use UTC, then converted to local time if needed
CELERY_TIMEZONE = 'UTC'

# Task execution settings
# Keep tasks reasonably small to avoid OOM issues
CELERY_TASK_SOFT_TIME_LIMIT = 300  # Soft limit: 5 minutes (graceful shutdown)
CELERY_TASK_TIME_LIMIT = 600        # Hard limit: 10 minutes (forceful kill)

# Task compression
# Reduces network overhead when queuing tasks
CELERY_TASK_COMPRESSION = 'gzip'
CELERY_RESULT_COMPRESSION = 'gzip'

# Reduce memory footprint
# Important for 2GB droplets where memory is limited
CELERY_WORKER_MAX_TASKS_PER_CHILD = 1000  # Restart worker after 1000 tasks
CELERY_WORKER_DISABLE_RATE_LIMITS = False  # Respect rate limits

# Result expiration
# Task results are automatically deleted after this time (in seconds)
# 3600 = 1 hour (email results only needed briefly for status checks)
CELERY_RESULT_EXPIRES = 3600

# Broker connection settings
# Auto-retry connection with exponential backoff if Redis is temporarily down
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True
CELERY_BROKER_CONNECTION_RETRY = True
CELERY_BROKER_CONNECTION_MAX_RETRIES = 10

# Task retry settings
# Automatically retry failed tasks a few times before giving up
CELERY_TASK_ACKS_LATE = True  # Only acknowledge task after successful execution
CELERY_TASK_REJECT_ON_WORKER_LOST = True  # Requeue if worker crashes mid-task

# Periodic tasks (celery beat)
# The worker in start.sh runs with -B (embedded beat) so these fire
# without a separate beat container.
CELERY_BEAT_SCHEDULE = {
    # Promote 'scheduled' posts to 'published' once scheduled_for passes.
    'publish-due-scheduled-posts': {
        'task': 'posts.publish_due_posts',
        'schedule': 60.0,  # every minute
    },
}

# Production-specific tuning for 2GB droplet
if not DEBUG:
    # Reduce queue size to prevent excessive memory usage
    CELERY_BROKER_POOL_LIMIT = 10  # Connection pool limit
    
    # Limit the queue depth (prevent massive memory buildup)
    # If more than this many tasks are pending, new submissions will block
    # until workers catch up. This is a safety valve for the 2GB droplet.
    CELERYD_PREFETCH_MULTIPLIER = 1  # Workers only fetch 1 task at a time
