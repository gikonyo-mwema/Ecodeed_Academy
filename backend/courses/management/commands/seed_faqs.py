"""
═══════════════════════════════════════════════════════════════════════════════
SEED FAQS — Django management command for FAQ data seeding.

Populates course FAQs (Frequently Asked Questions) with common questions and
answers for different course types. Provides common course questions and
type-specific FAQ content.

═══════════════════════════════════════════════════════════════════════════════
USAGE
═══════════════════════════════════════════════════════════════════════════════

python manage.py seed_faqs

This command:
  1. Queries all courses from the database
  2. Categorizes them by type (EIA, EA, Compliance, Training, etc.)
  3. Applies type-specific FAQ content (questions and answers)
  4. Saves updated course records to database

═══════════════════════════════════════════════════════════════════════════════
FAQ CATEGORIES
═══════════════════════════════════════════════════════════════════════════════

General FAQs (All courses):
  - Course access duration
  - Certificate upon completion
  - Self-paced learning
  - Q&A and support
  - Beginner-friendliness

Compliance-Specific FAQs:
  - Licensing/permit timeline
  - Required documentation
  - Renewal processes
  - Penalties for non-compliance
  - Regulatory requirements

Audit-Specific FAQs:
  - Audit frequency/schedule
  - Audit scope and methodology
  - Cost implications
  - Finding remediation

Training-Specific FAQs:
  - Workshop formats
  - Group vs individual training
  - Certification validity
  - Follow-up support

═══════════════════════════════════════════════════════════════════════════════
"""

from django.core.management.base import BaseCommand
from courses.models import Course

class Command(BaseCommand):
    """
    Django management command for seeding course FAQs.
    
    Populates FAQ content for courses based on their category/type.
    FAQs help prospective students understand course details and requirements.
    
    Command: python manage.py seed_faqs
    """
    
    help = 'Seed FAQs data for courses'

    def handle(self, *args, **options):
        # Generic environmental course FAQs
        general_faqs = [
            {
                "question": "How long do I have access to the course?",
                "answer": "Once enrolled, you have lifetime access to all course materials. This includes any future updates or additions to the content."
            },
            {
                "question": "Is there a certificate upon completion?",
                "answer": "Yes! Upon successfully completing all modules and assessments, you'll receive a professional certificate that you can add to your LinkedIn profile or CV."
            },
            {
                "question": "Can I take the course at my own pace?",
                "answer": "Absolutely. Our courses are designed to be self-paced, allowing you to learn whenever and wherever suits you best. There are no deadlines."
            },
            {
                "question": "What if I have questions during the course?",
                "answer": "You can post questions in the course discussion forum where our instructors and community members will help. Premium courses also include direct instructor support."
            },
            {
                "question": "Is this course suitable for beginners?",
                "answer": "Yes, our courses are designed to accommodate learners at all levels. We start with foundational concepts and progressively build to advanced topics."
            }
        ]

        # Compliance-specific FAQs
        compliance_faqs = [
            {
                "question": "How long does the licensing/permit approval process take?",
                "answer": "Typically 2-4 weeks with complete documentation. However, processing times may vary depending on the regulatory body's workload and application complexity. Our course includes strategies to expedite approvals."
            },
            {
                "question": "What documents do I need to prepare?",
                "answer": "Required documents vary by permit type but generally include: business registration, site plans, environmental impact assessments, management plans, and proof of payment. Our course provides detailed checklists and templates."
            },
            {
                "question": "Is the license/permit renewable?",
                "answer": "Most environmental licenses require annual renewal. The course covers both initial applications and the renewal process to ensure continued compliance."
            },
            {
                "question": "What happens if I operate without proper permits?",
                "answer": "Operating without valid permits can result in significant fines (up to millions of shillings), legal action, facility closure, and reputational damage. Regulatory bodies conduct regular inspections."
            },
            {
                "question": "Do you provide document templates?",
                "answer": "Yes! The course includes downloadable templates for all required documents, sample reports, checklists, and step-by-step guides to help you prepare a complete application."
            },
            {
                "question": "Can I get help with my specific application?",
                "answer": "While the course provides comprehensive guidance, we also offer consultation services for complex cases. Contact our support team for personalized assistance."
            }
        ]

        # Webinar-specific FAQs
        webinar_faqs = [
            {
                "question": "Are webinars recorded?",
                "answer": "Yes, all live webinars are recorded and made available within 24-48 hours. Enrolled participants get lifetime access to recordings."
            },
            {
                "question": "Can I ask questions during the live session?",
                "answer": "Absolutely! Our webinars are interactive. You can ask questions via chat or raise your hand to speak directly with the presenter."
            },
            {
                "question": "What if I miss the live session?",
                "answer": "No worries! You'll still have access to the recording. We recommend watching it soon so the content is fresh, and you can still post questions in the discussion forum."
            }
        ]

        # Update all courses with appropriate FAQs
        updated_count = 0
        
        for course in Course.objects.all():
            if not course.faqs or len(course.faqs) == 0:
                if course.category in ['compliance', 'licensing']:
                    course.faqs = compliance_faqs + general_faqs[:2]
                elif course.category == 'webinar':
                    course.faqs = webinar_faqs + general_faqs[:3]
                else:
                    course.faqs = general_faqs
                
                course.save()
                updated_count += 1
                self.stdout.write(f"Updated FAQs for: {course.title}")

        self.stdout.write(self.style.SUCCESS(f"Successfully updated {updated_count} courses with FAQs"))
