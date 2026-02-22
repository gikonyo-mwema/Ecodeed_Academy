import os
import django
import sys
import pymysql
pymysql.install_as_MySQLdb()
from datetime import datetime, timedelta
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from courses.models import Course, Module, Lesson, Assignment, LiveSession, Resource
from django.contrib.auth import get_user_model

User = get_user_model()

def seed_program():
    print("Clearing existing courses...")
    Course.objects.all().delete()
    
    print("Creating new course: PROGRAM STRUCTURE OVERVIEW...")
    instructor = User.objects.first() # Assign to first user or create a superuser if needed
    
    program = Course.objects.create(
        title="PROGRAM STRUCTURE OVERVIEW",
        short_description="A 10-week comprehensive program on EIA Consulting.",
        full_description="Master the art and business of Environmental Impact Assessment (EIA) Consulting.",
        instructor=instructor,
        price=997.00, # Placeholder price
        category="specialized",
        is_live=True
    )

    weeks_data = [
        {
            "week": 1,
            "title": "The Real World of EIA Consulting",
            "theme": "Understanding the Industry Beyond Textbooks",
            "lessons": [
                {"title": "How the EIA industry actually works", "content": "Types of EIA projects, revenue streams..."},
                {"title": "Mistakes new consultants make", "content": "Ethics vs survival..."},
            ],
            "case_study": {
                "title": "How a poorly scoped EIA destroyed a consultant’s reputation",
                "content": "Case study details..."
            },
            "assignment": {
                "title": "Write your personal positioning",
                "description": "What sector do you want to specialize in? What value will you offer?"
            },
            "resources": [
                {"title": "Industry map diagram", "file_url": "http://example.com/industry_map.pdf"},
                {"title": "EIA process flowchart", "file_url": "http://example.com/process_flowchart.pdf"},
                {"title": "Career path blueprint", "file_url": "http://example.com/career_path.pdf"}
            ],
            "live_session": {
                "title": "Discussion + Q&A",
                "description": "2-hour live session"
            }
        },
        {
            "week": 2,
            "title": "Finding & Closing EIA Clients",
            "theme": "Business Development",
            "lessons": [
                {"title": "Where EIA clients come from", "content": "Developers vs architects vs engineers..."},
                {"title": "Writing winning proposals", "content": "Pricing strategy basics..."},
            ],
            "live_workshop": {
                "title": "Breakdown of a real EIA proposal",
                "content": "Live workshop session recording or notes."
            },
            "assignment": {
                "title": "Draft a technical proposal & pricing",
                "description": "Draft a 2-page technical proposal and a simple pricing breakdown."
            },
            "resources": [
                {"title": "Proposal template", "file_url": "http://example.com/proposal_template.docx"},
                {"title": "Budget spreadsheet template", "file_url": "http://example.com/budget.xlsx"},
                {"title": "Client discovery call script", "file_url": "http://example.com/script.pdf"},
                {"title": "Engagement letter template", "file_url": "http://example.com/engagement_letter.docx"}
            ],
             "live_session": {
                "title": "Discussion + Q&A",
                "description": "2-hour live session"
            }
        },
        {
            "week": 3,
            "title": "Research & Baseline Study Methodology",
            "theme": "Technical Competence",
            "lessons": [
                {"title": "Site reconnaissance planning", "content": "Baseline data collection..."},
                {"title": "Working with specialists", "content": "Ecologists, hydrologists, sociologists..."},
            ],
            "practical": {
                 "title": "Design a baseline study",
                 "content": "Design a baseline study for a proposed residential estate."
            },
            "resources": [
                {"title": "Field data sheets", "file_url": "http://example.com/field_data.pdf"},
                {"title": "Sampling framework template", "file_url": "http://example.com/sampling.pdf"},
                {"title": "Stakeholder mapping worksheet", "file_url": "http://example.com/stakeholder.pdf"},
                {"title": "GIS data sources list", "file_url": "http://example.com/gis.pdf"}
            ],
             "live_session": {
                "title": "Discussion + Q&A",
                "description": "2-hour live session"
            }
        },
        {
            "week": 4,
            "title": "Public Participation Mastery",
            "theme": "Managing Communities & Conflict",
            "lessons": [
                 {"title": "Legal requirements & Stakeholder identification", "content": "Organizing meetings..."},
                 {"title": "Handling hostile audiences", "content": "Conflict resolution..."},
            ],
            "simulation": {
                "title": "Mock public participation meeting role-play",
                "content": "Simulation instructions."
            },
            "assignment": {
                "title": "Prepare Public Meeting Docs",
                "description": "Prepare Public meeting notice, Attendance sheet, Meeting minutes template."
            },
            "resources": [
                {"title": "Public participation toolkit", "file_url": "http://example.com/toolkit.zip"},
                {"title": "Conflict de-escalation guide", "file_url": "http://example.com/guide.pdf"},
                {"title": "Stakeholder communication framework", "file_url": "http://example.com/framework.pdf"}
            ],
             "live_session": {
                "title": "Discussion + Q&A",
                "description": "2-hour live session"
            }
        },
        {
            "week": 5,
            "title": "Regulatory Navigation & Government Relations",
            "theme": "Surviving the Approval Process",
            "lessons": [
                {"title": "Interactions with Authorities", "content": "NEMA, WRA..."},
                {"title": "Submission requirements & Rejections", "content": "How to respond..."},
            ],
            "case_study": {
                "title": "Reviewing a rejected EIA",
                "content": "Reviewing and rewriting sections."
            },
            "assignment": {
                "title": "Draft response to regulator",
                "description": "Draft a professional response to regulator comments."
            },
            "resources": [
                {"title": "Submission checklist", "file_url": "http://example.com/checklist.pdf"},
                {"title": "Comment-response template", "file_url": "http://example.com/response_template.docx"},
                {"title": "Regulator communication email templates", "file_url": "http://example.com/email_templates.docx"}
            ],
             "live_session": {
                "title": "Discussion + Q&A",
                "description": "2-hour live session"
            }
        },
        {
            "week": 6,
            "title": "Advanced EIA Report Writing",
            "theme": "Writing Reports That Get Approved",
            "lessons": [
                {"title": "Structuring executive summaries", "content": "Impact identification..."},
                {"title": "Mitigation hierarchy & EMP design", "content": "Legal defensibility..."},
            ],
            "workshop": {
                "title": "Live editing of a weak report section",
                "content": "Workshop notes."
            },
             "assignment": {
                "title": "Write impact assessment & mitigation plan",
                "description": "Write One impact assessment section and A mitigation plan."
            },
            "resources": [
                {"title": "Full EIA structure template", "file_url": "http://example.com/structure.docx"},
                {"title": "Impact matrix template", "file_url": "http://example.com/impact_matrix.xlsx"},
                {"title": "EMP template", "file_url": "http://example.com/emp.docx"},
                {"title": "Quality control checklist", "file_url": "http://example.com/qc.pdf"}
            ],
             "live_session": {
                "title": "Discussion + Q&A",
                "description": "2-hour live session"
            }
        },
        {
            "week": 7,
            "title": "Pricing, Profit & Financial Strategy",
            "theme": "Making EIA Consulting Profitable",
            "lessons": [
                {"title": "Project costing formula", "content": "Retainers vs one-off..."},
                {"title": "Avoiding scope creep", "content": "Payment milestones..."},
            ],
            "exercise": {
                "title": "Break down real project costs",
                "content": "Exercise details."
            },
            "resources": [
                 {"title": "Pricing calculator spreadsheet", "file_url": "http://example.com/pricing.xlsx"},
                 {"title": "Scope control checklist", "file_url": "http://example.com/scope.pdf"},
                 {"title": "Invoice template", "file_url": "http://example.com/invoice.docx"},
                 {"title": "Cash flow tracker", "file_url": "http://example.com/cashflow.xlsx"}
            ],
             "live_session": {
                "title": "Discussion + Q&A",
                "description": "2-hour live session"
            }
        },
        {
            "week": 8,
            "title": "Risk, Ethics & Crisis Management",
            "theme": "Handling Pressure & Ethical Dilemmas",
            "lessons": [
                 {"title": "Data manipulation pressure", "content": "Corruption risks..."},
                 {"title": "Professional liability risks", "content": "Protecting license..."},
            ],
            "case_study": {
                "title": "When a client pressures you to alter findings",
                "content": "Case study details."
            },
            "assignment": {
                 "title": "Write your ethical decision framework",
                 "description": "Write your ethical decision framework."
            },
            "resources": [
                {"title": "Risk assessment matrix", "file_url": "http://example.com/risk_matrix.xlsx"},
                {"title": "Ethics response checklist", "file_url": "http://example.com/ethics.pdf"},
                {"title": "Incident documentation template", "file_url": "http://example.com/incident.docx"}
            ],
             "live_session": {
                "title": "Discussion + Q&A",
                "description": "2-hour live session"
            }
        },
        {
            "week": 9,
            "title": "Scaling from Solo Consultant to Firm",
            "theme": "Growth & Leadership",
            "lessons": [
                {"title": "When to hire associates", "content": "Building network..."},
                {"title": "Branding & authority positioning", "content": "Creating repeat clients..."},
            ],
            "assignment": {
                "title": "Design your 3-year consulting growth roadmap",
                "description": "Design your roadmap."
            },
            "resources": [
                {"title": "Firm structure template", "file_url": "http://example.com/firm_structure.pdf"},
                {"title": "Service portfolio template", "file_url": "http://example.com/portfolio.pdf"},
                {"title": "LinkedIn positioning guide", "file_url": "http://example.com/linkedin.pdf"},
                {"title": "Referral system blueprint", "file_url": "http://example.com/referral.pdf"}
            ],
             "live_session": {
                "title": "Discussion + Q&A",
                "description": "2-hour live session"
            }
        },
        {
            "week": 10,
            "title": "Capstone & Professional Review",
            "theme": "Integration & Mastery",
            "lessons": [
                {"title": "Final Advice", "content": "Alumni network introduction..."}
            ],
            "assignment": {
                "title": "Final Capstone Submission",
                "description": "Submit: Mini EIA outline, Pricing proposal, Public participation plan, Mitigation strategy section."
            },
            "live_session": {
                "title": "Selected project reviews & Group feedback",
                 "description": "Final session."
            }
        }
    ]

    base_date = datetime.now()

    for item in weeks_data:
        print(f"Creating Week {item['week']}: {item['title']}...")
        module = Module.objects.create(
            course=program,
            title=f"Week {item['week']}: {item['title']}",
            description=item.get('theme', ''),
            order=item['week']
        )
        
        # Lessons
        for i, lesson_data in enumerate(item.get('lessons', [])):
            Lesson.objects.create(
                module=module,
                title=lesson_data['title'],
                content=lesson_data['content'],
                order=i+1
            )
            
        # Case Study / Practical / Simulation / Workshop / Exercise as Lessons (Special type)
        special_types = ['case_study', 'practical', 'simulation', 'workshop', 'exercise', 'live_workshop']
        order_counter = len(item.get('lessons', [])) + 1
        
        for st in special_types:
            if st in item:
                 Lesson.objects.create(
                    module=module,
                    title=f"Activity: {item[st]['title']}",
                    content=item[st]['content'],
                    order=order_counter
                )
                 order_counter += 1

        # Assignment
        if 'assignment' in item:
            Assignment.objects.create(
                module=module,
                title=item['assignment']['title'],
                description=item['assignment']['description'],
                due_date=base_date + timedelta(weeks=item['week']) # Approx due date
            )

        # Resources
        if 'resources' in item:
            for resource_data in item['resources']:
                Resource.objects.create(
                    module=module,
                    title=resource_data['title'],
                    file_url=resource_data['file_url']
                )

        # Live Session
        if 'live_session' in item:
            LiveSession.objects.create(
                module=module,
                title=item['live_session']['title'],
                description=item['live_session']['description'],
                date_time=base_date + timedelta(weeks=item['week'], days=5), # Say Friday of that week
                zoom_link="https://zoom.us/j/123456789"
            )

    print("Program seeded successfully!")

if __name__ == '__main__':
    seed_program()
