"""
═══════════════════════════════════════════════════════════════════════════════
SEED COURSE DETAILS — Django management command for course data seeding.

Populates course models with comprehensive course details including descriptions,
features, target audience, resources, and FAQs. Used during initial setup to
provide realistic course data for different course types.

═══════════════════════════════════════════════════════════════════════════════
USAGE
═══════════════════════════════════════════════════════════════════════════════

python manage.py seed_course_details

This command:
  1. Queries all courses from the database
  2. Categorizes them by type (EIA, EA, Compliance, Training, etc.)
  3. Applies type-specific course content (descriptions, features, etc.)
  4. Saves updated course records to database

═══════════════════════════════════════════════════════════════════════════════
DATA STRUCTURE
═══════════════════════════════════════════════════════════════════════════════

Each course receives:
  - full_description: Comprehensive course overview (multiple paragraphs)
  - features: Array of course features/benefits
  - target_audience: Array of ideal student personas
  - resources: Array of resource types available
  - faqs: FAQ entries for common questions

Course Categories:
  - General: Foundational environmental course content
  - Compliance: Regulatory compliance and licensing guidance
  - Audit: Environmental audit and assessment procedures
  - Training: Professional skills and training programs
  - Custom: Custom course descriptions

═══════════════════════════════════════════════════════════════════════════════
"""

from django.core.management.base import BaseCommand
from courses.models import Course

class Command(BaseCommand):
    """
    Django management command for seeding comprehensive course details.
    
    Populates course metadata (descriptions, features, audience) for all
    courses in the database based on their category/type.
    
    Command: python manage.py seed_course_details
    """
    
    help = 'Seed course details data (description, features, target audience, resources)'

    def handle(self, *args, **options):
        # Generic environmental course data
        general_data = {
            "full_description": """This comprehensive course is designed to equip you with practical knowledge and skills in environmental management and sustainability practices.

Whether you're a professional looking to advance your career, a business owner seeking compliance guidance, or someone passionate about environmental conservation, this course provides the foundation you need.

Our expert instructors bring real-world experience from working with regulatory bodies, consulting firms, and major organizations across Kenya and East Africa. You'll learn through a combination of video lectures, practical exercises, case studies, and downloadable resources.

By the end of this course, you'll have the confidence and competence to apply these concepts in your workplace, business, or community projects.""",
            "features": [
                "Expert-led video lessons with real-world examples",
                "Downloadable templates and checklists",
                "Practical case studies from Kenya and East Africa",
                "Self-paced learning with lifetime access",
                "Certificate of completion",
                "Access to course discussion forum"
            ],
            "target_audience": [
                "Environmental professionals",
                "Business owners and managers",
                "Compliance officers",
                "Students and graduates",
                "NGO workers",
                "Government officials"
            ],
            "resources": [
                "Video lectures",
                "PDF guides",
                "Document templates",
                "Checklists",
                "Reference materials"
            ]
        }

        # Compliance/Licensing specific data
        compliance_data = {
            "full_description": """Navigate the complex world of environmental compliance with confidence. This course provides step-by-step guidance on understanding and meeting regulatory requirements set by NEMA and other environmental authorities in Kenya.

Learn from practitioners who have successfully helped hundreds of businesses obtain their environmental permits and maintain compliance. We demystify the application process, document preparation, and ongoing compliance requirements.

The course includes practical tools, templates, and insider tips that can save you weeks of time and thousands of shillings in consultancy fees. Whether you're applying for a new license or renewing an existing one, this course has you covered.

Our approach is practical and action-oriented. By the end of this course, you'll have a clear roadmap and all the tools you need to successfully navigate the licensing process.""",
            "features": [
                "Complete application process walkthrough",
                "Document preparation templates",
                "Compliance checklist and timeline",
                "Common mistakes to avoid",
                "Insider tips from industry experts",
                "Sample successful applications",
                "Renewal process guidance",
                "Inspection preparation tips"
            ],
            "target_audience": [
                "Manufacturing facility managers",
                "Business owners requiring NEMA licenses",
                "Environmental consultants",
                "Compliance and HSE officers",
                "Operations managers",
                "Legal and regulatory affairs professionals"
            ],
            "resources": [
                "Application form templates",
                "Document checklists",
                "Sample EIA reports",
                "Compliance calendar",
                "Regulatory contact directory",
                "Fee schedule reference"
            ]
        }

        # EIA Consulting specific data
        eia_data = {
            "full_description": """Master the art and business of Environmental Impact Assessment (EIA) Consulting with this comprehensive professional development course.

Environmental Impact Assessment is a critical tool for sustainable development, and skilled EIA practitioners are in high demand across Kenya, East Africa, and beyond. This course takes you from foundational concepts to advanced consulting practices.

Learn the complete EIA process: screening, scoping, baseline studies, impact prediction, mitigation measures, Environmental Management Plans (EMPs), and monitoring. Understand NEMA requirements, stakeholder engagement best practices, and how to write compelling EIA reports that get approved.

Beyond technical skills, we cover the business side of EIA consulting - how to win projects, manage clients, price your services, and build a successful consultancy practice. Whether you're an aspiring consultant or an experienced professional looking to enhance your skills, this course delivers practical value.""",
            "features": [
                "Complete EIA process methodology",
                "NEMA regulatory framework explained",
                "Report writing best practices",
                "Stakeholder engagement techniques",
                "Environmental baseline studies",
                "Impact prediction methods",
                "Mitigation measures design",
                "EMP development and monitoring",
                "Business development for consultants",
                "Client management skills"
            ],
            "target_audience": [
                "Aspiring EIA consultants",
                "Environmental science graduates",
                "Practicing environmental professionals",
                "Project managers",
                "Urban planners and developers",
                "Government environmental officers",
                "NGO project coordinators"
            ],
            "resources": [
                "EIA report templates",
                "Scoping checklists",
                "Stakeholder register template",
                "EMP framework",
                "Baseline study guides",
                "Impact assessment matrices",
                "Sample approved EIA reports",
                "NEMA guidelines compilation"
            ]
        }

        # Webinar/Masterclass specific data
        webinar_data = {
            "full_description": """Join our expert-led live sessions designed to accelerate your learning and provide direct access to industry professionals.

These interactive webinars go beyond traditional recorded content. You'll engage directly with instructors, ask questions in real-time, participate in live demonstrations, and network with fellow environmental professionals from across the region.

Each session is carefully curated to address current industry challenges, regulatory updates, and emerging best practices. Our presenters include NEMA-licensed EIA experts, corporate sustainability leaders, and environmental policy specialists.

Can't attend live? No problem. All registered participants receive lifetime access to session recordings, presentation slides, and supplementary materials. You'll also get access to our exclusive community forum where discussions continue after each session.""",
            "features": [
                "Live interactive sessions",
                "Direct Q&A with experts",
                "Real-world case studies",
                "Networking opportunities",
                "Session recordings for replay",
                "Downloadable presentation slides",
                "Community forum access",
                "Certificate of participation"
            ],
            "target_audience": [
                "Environmental professionals",
                "Corporate sustainability teams",
                "Consultants and practitioners",
                "Students and researchers",
                "Policy makers",
                "Industry professionals"
            ],
            "resources": [
                "Session recordings",
                "Presentation slides",
                "Reference materials",
                "Discussion forum access",
                "Networking directory"
            ]
        }

        updated_count = 0

        for course in Course.objects.all():
            updated = False
            
            # Determine which data set to use based on course category or title
            if course.category in ['compliance', 'licensing']:
                data = compliance_data
            elif course.category == 'webinar' or course.category == 'masterclass':
                data = webinar_data
            elif 'eia' in course.title.lower() or 'impact assessment' in course.title.lower():
                data = eia_data
            else:
                data = general_data

            # Update full_description if empty
            if not course.full_description or course.full_description.strip() == '':
                course.full_description = data['full_description']
                updated = True

            # Update features if empty
            if not course.features or len(course.features) == 0:
                course.features = data['features']
                updated = True

            # Update target_audience if empty
            if not course.target_audience or len(course.target_audience) == 0:
                course.target_audience = data['target_audience']
                updated = True

            # Update resources if empty
            if not course.resources or len(course.resources) == 0:
                course.resources = data['resources']
                updated = True

            if updated:
                course.save()
                updated_count += 1
                self.stdout.write(f"Updated course details for: {course.title}")

        self.stdout.write(self.style.SUCCESS(f"Successfully updated {updated_count} courses with detailed content"))
