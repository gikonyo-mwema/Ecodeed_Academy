#!/bin/bash
# Digital Ocean Deployment Script - Seed Posts to Django
#
# This script is designed to be run on your Digital Ocean droplet
# It prepares the environment and seeds posts from the MongoDB export
#
# Usage on droplet:
#   chmod +x seed_posts_do.sh
#   ./seed_posts_do.sh ../posts.json
#   ./seed_posts_do.sh ../posts.json --email admin@ecodeed.com
#
# Set -e: Exit on first error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DJANGO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PYTHON_BIN="$DJANGO_DIR/venv/bin/python"
MANAGE_PY="$DJANGO_DIR/manage.py"
JSON_FILE="${1:-./../posts.json}"
DEFAULT_EMAIL="${2:-}"

# Functions
print_header() {
    echo -e "${BLUE}==============================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}==============================================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check prerequisites
print_header "Checking Prerequisites"

if [ ! -f "$MANAGE_PY" ]; then
    print_error "manage.py not found at: $MANAGE_PY"
    exit 1
fi
print_success "Django project found"

if [ ! -f "$JSON_FILE" ]; then
    print_error "JSON file not found: $JSON_FILE"
    exit 1
fi
print_success "JSON file found: $JSON_FILE"

if [ ! -f "$PYTHON_BIN" ]; then
    print_warning "Virtual environment not found. Using system Python"
    PYTHON_BIN="python3"
fi

# Check database connection
print_header "Checking Database Connection"

if ! $PYTHON_BIN $MANAGE_PY shell <<EOF
from django.db import connections
from django.db.utils import OperationalError
try:
    connections['default'].ensure_connection()
    print("Database connected successfully")
except OperationalError as e:
    print(f"Database error: {e}")
    exit(1)
EOF
then
    print_error "Cannot connect to database"
    exit 1
fi
print_success "Database connection verified"

# Check for users
print_header "Checking Users"

USER_COUNT=$($PYTHON_BIN $MANAGE_PY shell <<EOF
from django.contrib.auth import get_user_model
User = get_user_model()
print(User.objects.count())
EOF
)

if [ "$USER_COUNT" -eq 0 ]; then
    print_error "No users found in database"
    echo "Please create an admin user first:"
    echo "  python manage.py createsuperuser"
    exit 1
fi
print_success "Found $USER_COUNT user(s)"

# Backup existing posts (optional)
print_header "Backing Up Existing Data"

BACKUP_DIR="$DJANGO_DIR/backups"
mkdir -p "$BACKUP_DIR"

BACKUP_FILE="$BACKUP_DIR/posts_backup_$(date +%Y%m%d_%H%M%S).json"
if $PYTHON_BIN $MANAGE_PY dumpdata posts.Post --indent=2 > "$BACKUP_FILE"; then
    POST_COUNT=$($PYTHON_BIN $MANAGE_PY shell <<EOF
from posts.models import Post
print(Post.objects.count())
EOF
)
    print_success "Backed up $POST_COUNT posts to: $BACKUP_FILE"
else
    print_warning "Could not create backup"
fi

# Prepare seeding options
SEED_OPTS="--json-file=$JSON_FILE"

if [ -n "$DEFAULT_EMAIL" ]; then
    SEED_OPTS="$SEED_OPTS --default-user=$DEFAULT_EMAIL"
    print_success "Using default user: $DEFAULT_EMAIL"
fi

# Run dry-run
print_header "Running Dry-Run"

if $PYTHON_BIN $MANAGE_PY seed_posts $SEED_OPTS --dry-run; then
    print_success "Dry-run completed successfully"
else
    print_error "Dry-run failed"
    exit 1
fi

# Confirm before seeding
echo ""
read -p "Proceed with seeding? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    print_warning "Seeding cancelled"
    exit 0
fi

# Run actual seed
print_header "Seeding Posts"

if $PYTHON_BIN $MANAGE_PY seed_posts $SEED_OPTS; then
    print_success "Posts seeded successfully!"
else
    print_error "Seeding failed"
    
    # Offer to restore backup
    if [ -f "$BACKUP_FILE" ]; then
        read -p "Restore from backup? (yes/no): " RESTORE
        if [ "$RESTORE" = "yes" ]; then
            echo "Restoring from backup..."
            $PYTHON_BIN $MANAGE_PY loaddata "$BACKUP_FILE"
            print_success "Backup restored"
        fi
    fi
    
    exit 1
fi

# Verify results
print_header "Verification"

FINAL_COUNT=$($PYTHON_BIN $MANAGE_PY shell <<EOF
from posts.models import Post, Category, Tag
posts = Post.objects.count()
categories = Category.objects.count()
tags = Tag.objects.count()
print(f"Posts: {posts}, Categories: {categories}, Tags: {tags}")
EOF
)

print_success "Final count: $FINAL_COUNT"

# Summary
print_header "Seeding Complete"
echo ""
echo "Summary:"
echo "  - Posts file: $JSON_FILE"
echo "  - Backup: $BACKUP_FILE"
echo "  - Database: $(grep 'DB_NAME' $DJANGO_DIR/config/settings.py | head -1)"
echo ""
echo "Next steps:"
echo "  1. Verify posts at: /admin/posts/post/"
echo "  2. Check posts on frontend"
echo "  3. Monitor logs: tail -f $DJANGO_DIR/logs/error.log"
echo ""
print_success "All done!"
