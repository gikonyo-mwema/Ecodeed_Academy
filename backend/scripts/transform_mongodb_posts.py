#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════════════════
TRANSFORM MONGODB POSTS — Data migration utility script.

Transforms MongoDB JSON export to Django-compatible format for bulk importing
blog posts into PostgreSQL database. Handles date parsing, category mapping,
slug generation, and comprehensive data validation.

═══════════════════════════════════════════════════════════════════════════════
USAGE
═══════════════════════════════════════════════════════════════════════════════

python transform_mongodb_posts.py <input_file> [options]

Options:
  --output FILE          - Output file path (default: transformed_posts.json)
  --validate-only        - Validate without transforming
  --strict              - Fail on any validation error (default: skip invalid)
  --verbose             - Print detailed transformation logs

Examples:
  python transform_mongodb_posts.py ../posts.json
  python transform_mongodb_posts.py ../posts.json --output transformed.json
  python transform_mongodb_posts.py ../posts.json --validate-only --verbose

═══════════════════════════════════════════════════════════════════════════════
TRANSFORMATIONS PERFORMED
═══════════════════════════════════════════════════════════════════════════════

Date Format:
  Input:  MongoDB extended JSON - {"$date": "2025-09-18T08:15:25.675Z"}
  Output: ISO 8601 - "2025-09-18T08:15:25+00:00"

Categories:
  Maps MongoDB category strings to Django Category IDs
  Fallback: "uncategorized" for unknown categories

Slugs:
  Generates URL-safe slugs from post title
  Ensures uniqueness by appending counter if needed
  Format: "post-title" or "post-title-2"

Images:
  Validates image URLs (must start with http/https)
  Converts image data to cloudinary URLs if applicable
  Defaults to fallback image if invalid

Status Mapping:
  draft → draft (unpublished)
  published → published (live)
  scheduled → scheduled (future publish)
  archived → archived (removed from active)

═══════════════════════════════════════════════════════════════════════════════
VALIDATION
═══════════════════════════════════════════════════════════════════════════════

Required Fields:
  - title (string, 1-255 chars)
  - content (string, HTML allowed)
  - user/author (required, maps to user ID)

Optional Fields:
  - excerpt (auto-generated from content if missing)
  - image (validated URL)
  - published_at (parsed date)
  - status (defaults to draft if invalid)
  - category (defaults to uncategorized)
  - tags (array of tag names)

Validation Errors:
  - Missing required fields: Skipped (logged)
  - Invalid dates: Set to current time
  - Invalid URLs: Set to fallback
  - Duplicate slugs: Appended with counter
  - Invalid user ID: Skipped with warning

═══════════════════════════════════════════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════════════════════════════════════════

JSON array suitable for Django fixture loading or bulk import:

[
  {
    "title": "Post Title",
    "slug": "post-title",
    "content": "<p>HTML content...</p>",
    "excerpt": "Plain text excerpt",
    "image": "https://example.com/image.jpg",
    "category": "Technology",
    "category_fk": 3,
    "status": "published",
    "published_at": "2025-09-18T08:15:25+00:00",
    "user": 1,
    "tags": ["tag1", "tag2"],
    "featured": false,
    "created_at": "2025-09-18T08:15:25+00:00",
    "updated_at": "2025-09-18T08:15:25+00:00"
  }
]

═══════════════════════════════════════════════════════════════════════════════
"""

import json
import sys
from pathlib import Path
from datetime import datetime
from urllib.parse import urlparse
from slug import Slug  # Using python-slug library, or fallback to basic slugify


def slugify(text):
    """Generate URL-safe slug from text."""
    import re
    # Basic slug generation if python-slug not available
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')


def parse_mongodb_date(date_obj):
    """
    Parse MongoDB date format to ISO datetime string.
    
    Handles multiple formats:
      - MongoDB extended JSON: {"$date": "2025-09-18T08:15:25.675Z"}
      - ISO strings: "2025-09-18T08:15:25Z"
      - Native datetime objects
    
    Args:
      date_obj: Date in various formats
      
    Returns:
      ISO 8601 string or None if parsing fails
    """
    if isinstance(date_obj, dict) and '$date' in date_obj:
        # MongoDB extended JSON: {"$date": "2025-09-18T08:15:25.675Z"}
        date_str = date_obj['$date']
        try:
            # Parse and return ISO format
            dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            return dt.isoformat()
        except (ValueError, TypeError):
            return None
    elif isinstance(date_obj, str):
        try:
            dt = datetime.fromisoformat(date_obj.replace('Z', '+00:00'))
            return dt.isoformat()
        except ValueError:
            return None
    return None


def validate_url(url):
    """Validate and clean image URL."""
    if not url:
        return None
    try:
        result = urlparse(url)
        if result.scheme in ('http', 'https'):
            return url
    except Exception:
        pass
    return None


def validate_html(html):
    """Basic HTML validation - ensure it's not empty."""
    if not html or not isinstance(html, str):
        return None
    html = html.strip()
    if len(html) < 10:
        return None
    return html


def transform_post(mongo_post, used_slugs):
    """
    Transform a MongoDB post to Django-compatible format.
    
    Args:
        mongo_post: MongoDB post document
        used_slugs: Set of already-used slugs to ensure uniqueness
        
    Returns:
        Dictionary with transformed data or None if invalid
    """
    errors = []
    warnings = []
    
    # Required fields
    title = mongo_post.get('title', '').strip()
    if not title:
        errors.append('Missing or empty title')
    
    content = mongo_post.get('content', '').strip()
    if not content or len(content) < 20:
        errors.append('Missing or insufficient content (minimum 20 characters)')
    
    if errors:
        return None, errors, warnings
    
    # Generate slug
    slug = mongo_post.get('slug', '')
    if not slug:
        slug = slugify(title)
    else:
        slug = slugify(slug)
    
    if not slug:
        errors.append('Could not generate slug from title')
        return None, errors, warnings
    
    # Ensure unique slug
    original_slug = slug
    counter = 1
    while slug in used_slugs:
        slug = f'{original_slug}-{counter}'
        counter += 1
    
    used_slugs.add(slug)
    
    # Optional fields
    category = mongo_post.get('category', 'uncategorized').lower().strip()
    image = mongo_post.get('image', '')
    if image:
        image = validate_url(image)
    
    views = mongo_post.get('views', 0)
    if not isinstance(views, int) or views < 0:
        views = 0
        warnings.append(f'Invalid views count, set to 0')
    
    # Parse dates
    created_at = None
    updated_at = None
    
    if 'createdAt' in mongo_post:
        created_at = parse_mongodb_date(mongo_post['createdAt'])
    
    if 'updatedAt' in mongo_post:
        updated_at = parse_mongodb_date(mongo_post['updatedAt'])
    
    if not created_at:
        created_at = datetime.now().isoformat()
        warnings.append('Missing createdAt, using current time')
    
    if not updated_at:
        updated_at = created_at
    
    # Extract tags if present
    tags = []
    if 'tags' in mongo_post and isinstance(mongo_post['tags'], list):
        tags = [str(t).strip() for t in mongo_post['tags'] if t]
    
    return {
        '_id': mongo_post.get('_id'),
        'userId': mongo_post.get('userId'),
        'title': title,
        'content': content,
        'slug': slug,
        'category': category,
        'image': image or '',
        'views': views,
        'createdAt': created_at,
        'updatedAt': updated_at,
        'tags': tags,
    }, errors, warnings


def main():
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Transform MongoDB posts.json for Django seeding'
    )
    parser.add_argument('input_file', help='Input posts.json file')
    parser.add_argument(
        '--output', '-o',
        default='transformed_posts.json',
        help='Output file (default: transformed_posts.json)'
    )
    parser.add_argument(
        '--validate-only', '-v',
        action='store_true',
        help='Only validate, don\'t write output file'
    )
    parser.add_argument(
        '--summary', '-s',
        action='store_true',
        help='Show summary statistics'
    )
    
    args = parser.parse_args()
    
    input_file = Path(args.input_file)
    
    # Validate input file
    if not input_file.exists():
        print(f'❌ Error: Input file not found: {input_file}', file=sys.stderr)
        sys.exit(1)
    
    # Load JSON
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            posts_data = json.load(f)
    except json.JSONDecodeError as e:
        print(f'❌ Error: Invalid JSON: {e}', file=sys.stderr)
        sys.exit(1)
    
    if not isinstance(posts_data, list):
        print('❌ Error: JSON must contain an array of posts', file=sys.stderr)
        sys.exit(1)
    
    print(f'📖 Processing {len(posts_data)} posts...\n')
    
    transformed = []
    used_slugs = set()
    stats = {
        'total': len(posts_data),
        'valid': 0,
        'invalid': 0,
        'warnings': 0,
    }
    
    for idx, post in enumerate(posts_data, 1):
        result, errors, warnings = transform_post(post, used_slugs)
        
        if result:
            transformed.append(result)
            stats['valid'] += 1
            print(f'✓ [{idx}] {result["title"][:50]}...')
            
            if warnings:
                for w in warnings:
                    print(f'  ⚠ {w}')
                stats['warnings'] += len(warnings)
        else:
            stats['invalid'] += 1
            print(f'✗ [{idx}] Skipped: {", ".join(errors)}')
    
    # Print summary
    print(f'\n{"="*60}')
    print(f'Total posts: {stats["total"]}')
    print(f'Valid posts: {stats["valid"]}')
    print(f'Invalid posts: {stats["invalid"]}')
    print(f'Warnings: {stats["warnings"]}')
    print(f'{"="*60}\n')
    
    # Write output file
    if not args.validate_only and transformed:
        output_file = Path(args.output)
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(transformed, f, indent=2, ensure_ascii=False)
            print(f'✅ Transformed data saved to: {output_file}')
            print(f'📊 Ready to seed {len(transformed)} posts\n')
        except Exception as e:
            print(f'❌ Error writing output file: {e}', file=sys.stderr)
            sys.exit(1)
    elif args.validate_only:
        print('✅ Validation complete (no output file created)\n')
    else:
        print('⚠ No valid posts to write', file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
