import os
import django
import pymysql
pymysql.install_as_MySQLdb()

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from courses.models import Course

def cleanup_courses():
    """
    Keep only the EIA Masterclass course, delete all others
    """
    
    # Find the EIA course
    eia_course = Course.objects.filter(
        slug='eia-mentorship-mastermind'
    ).first()
    
    if not eia_course:
        print("❌ EIA Masterclass course not found!")
        return
    
    print(f"✅ Found EIA course: {eia_course.title}")
    
    # Delete all other courses
    other_courses = Course.objects.exclude(id=eia_course.id)
    count = other_courses.count()
    
    if count > 0:
        print(f"🗑️  Deleting {count} other course(s)...")
        other_courses.delete()
        print(f"✅ Deleted {count} course(s)")
    else:
        print("ℹ️  No other courses to delete")
    
    # Verify
    total = Course.objects.count()
    print(f"\n📊 Final course count: {total}")
    
    # List remaining courses
    print("\n📚 Remaining courses:")
    for course in Course.objects.all():
        print(f"  - {course.title} ({course.slug})")

if __name__ == '__main__':
    cleanup_courses()
