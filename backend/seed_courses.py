import os
import django
import pymysql
pymysql.install_as_MySQLdb()

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from courses.models import Course, Module, Lesson

def seed_courses():
    courses_data = [
        {
            "title": "EIA Mentorship Mastermind",
            "short_description": "A comprehensive mentorship program designed to guide aspiring and practicing environmental experts through the intricacies of Environmental Impact Assessments.",
            "full_description": "The EIA Mentorship Mastermind is an intensive program that bridges the gap between academic knowledge and practical application. You will learn the end-to-end process of conducting EIAs, from scoping and baseline studies to impact prediction, mitigation planning, and report writing. The course includes real-world case studies, guest lectures from industry veterans, and personalized feedback on your projects.",
            "category": "masterclass",
            "price": 25000.00,
            "is_free": False,
            "image": "https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
            "level": ["Intermediate", "Advanced"],
            "features": ["Weekly Live Q&A", "Template Library", "Certificate of Completion", "Network Access"],
            "target_audience": ["Environmental Graduates", "Junior Consultants", "Project Managers"],
            "modules": [
                {
                    "title": "Introduction to EIA Frameworks",
                    "description": "Understanding the legal and regulatory landscape.",
                    "lessons": [
                        {"title": "Evolution of EIA in Kenya", "content": "History and context..."},
                        {"title": "EMCA 1999 and Regulations", "content": "Deep dive into the act..."}
                    ]
                },
                {
                    "title": "Public Participation",
                    "description": "How to effectively engage stakeholders.",
                    "lessons": [
                        {"title": "Stakeholder Mapping", "content": "Identifying key players..."},
                        {"title": "Conducting Public Barazas", "content": "Practical tips for field meetings..."}
                    ]
                }
            ]
        },
        {
            "title": "Environmental Audit & Compliance",
            "short_description": "Master the skills required to conduct annual environmental audits (EA) and ensure organizational compliance with NEMA regulations.",
            "full_description": "This course covers the essentials of Environmental Auditing (EA). You will learn how to prepare audit protocols, gather evidence, identify non-conformities, and write examining audit reports. Ideal for registered lead and associate experts looking to refine their auditing skills.",
            "category": "compliance",
            "price": 15000.00,
            "is_free": False,
            "image": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
            "level": ["Intermediate"],
            "features": ["Audit Checklists", "Report Templates", "NEMA Liaison Guide"],
            "target_audience": ["Lead Experts", "Associate Experts", "EHS Managers"],
            "modules": [
                {
                    "title": "Audit Planning",
                    "description": "Preparation is key to a successful audit.",
                    "lessons": [
                        {"title": "Developing an Audit Plan", "content": "Scope, criteria, and schedule..."},
                        {"title": "Pre-audit Questionnaires", "content": "Gathering initial data..."}
                    ]
                },
                {
                    "title": "Fieldwork & Evidence Gathering",
                    "description": "On-site activities.",
                    "lessons": [
                        {"title": "Interview Techniques", "content": "Getting the right information..."},
                        {"title": "Sampling and Testing", "content": "Water, air, and noise measurements..."}
                    ]
                }
            ]
        },
        {
            "title": "GIS for Environmental Professionals",
            "short_description": "Learn to use Geographic Information Systems (GIS) to map environmental data, analyze spatial patterns, and enhance your environmental reports.",
            "full_description": "Spatial data is crucial for environmental decision making. This course introduces you to QGIS and ArcGIS, teaching you how to create maps for EIA reports, analyze land cover change, and map sensitive ecosystems. No prior GIS experience is required.",
            "category": "specialized",
            "price": 18000.00,
            "is_free": False,
            "image": "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
            "level": ["Beginner", "Intermediate"],
            "features": ["Dataset Access", "Software Installation Guide", "Project Portfolio"],
            "target_audience": ["EIA Experts", "Urban Planners", "Students"],
            "modules": [
                {
                    "title": "Basics of GIS",
                    "description": "Getting started with coordinate systems and software.",
                    "lessons": [
                        {"title": "Introduction to QGIS", "content": "Interface and basic tools..."},
                        {"title": "Coordinate Reference Systems", "content": "Understanding projections..."}
                    ]
                },
                {
                    "title": "Mapping for Reports",
                    "description": "Creating professional maps for your EIAs.",
                    "lessons": [
                        {"title": "Digitizing Features", "content": "Creating points, lines, and polygons..."},
                        {"title": "Map Layout and Export", "content": "Adding legends, scale bars, and north arrows..."}
                    ]
                }
            ]
        }
    ]

    for data in courses_data:
        modules_data = data.pop('modules', [])
        
        course, created = Course.objects.update_or_create(
            title=data['title'],
            defaults=data
        )
        
        if created:
            print(f"Created course: {course.title}")
        else:
            print(f"Updated course: {course.title}")
            # Clear existing modules to re-seed (simple approach for seeding)
            course.modules.all().delete()
            
        # Create Modules and Lessons
        for m_idx, m_data in enumerate(modules_data):
            lessons_data = m_data.pop('lessons', [])
            module = Module.objects.create(
                course=course,
                order=m_idx + 1,
                **m_data
            )
            print(f"  - Created module: {module.title}")
            
            for l_idx, l_data in enumerate(lessons_data):
                Lesson.objects.create(
                    module=module,
                    order=l_idx + 1,
                    **l_data
                )
                print(f"    - Created lesson: {l_data['title']}")

if __name__ == '__main__':
    seed_courses()
