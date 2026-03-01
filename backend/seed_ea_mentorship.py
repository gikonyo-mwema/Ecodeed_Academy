import os
import django
import pymysql
pymysql.install_as_MySQLdb()

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from courses.models import Course, Module, Lesson, Assignment, Resource


def seed_ea_mentorship():
    """
    Comprehensive 10-Week Environmental Audit Mentorship Program.
    Cost: 2 KSH | Paid course
    Covers environmental auditing in Kenya – theory, regulation, practical skills.
    """

    course_data = {
        "title": "Environmental Audit Mentorship Program",
        "slug": "environmental-audit-mentorship-program",
        "short_description": "A hands-on 10-week mentorship program that teaches you how to plan, conduct, report, and manage environmental audits in Kenya — from legal frameworks to career pathways.",
        "full_description": """The Environmental Audit Mentorship Program is a structured 10-week journey designed for environmental professionals and students who want to master environmental auditing in Kenya.

Each week blends theory with practice: you'll watch expert video lessons from Miriam Mukami, study Kenya's regulatory framework (EMCA, NEMA regulations), complete real-world assignments, and build a professional portfolio you can use in the field.

**What You'll Learn:**
- What environmental audits are and why they matter
- Kenya's legal framework — EMCA 1999 and NEMA regulations
- Types of audits: compliance, performance, management system, and due diligence
- EIA vs Environmental Audit — key differences
- How to plan and conduct an environmental audit step by step
- Audit report writing — structure, findings, corrective actions
- Compliance, enforcement, and risk management
- Sector-specific auditing (agriculture, hospitality, manufacturing)
- Internal self-audits and continuous improvement systems
- Career pathways — becoming a NEMA-registered environmental expert

**Course Format:**
- 10 structured weeks of content
- Expert video lessons each week
- Recommended government & academic readings
- Weekly practical assignments
- Final capstone mock audit project
- Certificate of completion""",
        "category": "compliance",
        "price": 2.00,
        "is_free": False,
        "has_certificate": True,
        "pacing_type": "scheduled",
        "image": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        "level": ["Beginner", "Intermediate"],
        "features": [
            "10 Weeks of Structured Content",
            "Expert Video Lessons",
            "Weekly Practical Assignments",
            "Government & Academic Reading Materials",
            "Final Capstone Mock Audit Project",
            "Certificate of Completion",
            "Lifetime Access",
        ],
        "target_audience": [
            "Environmental Science Graduates",
            "Aspiring Environmental Auditors",
            "Junior Environmental Consultants",
            "EHS (Environment, Health & Safety) Officers",
            "Compliance Officers",
            "Anyone preparing for NEMA expert registration",
        ],
        "faqs": [
            {
                "question": "Do I need prior experience to take this course?",
                "answer": "No. The course starts from the very basics of environmental auditing and builds up progressively over the 10 weeks.",
            },
            {
                "question": "Will this help me become a NEMA-registered expert?",
                "answer": "Yes. The final weeks cover professional practice, NEMA registration requirements, and career development as an environmental auditor.",
            },
            {
                "question": "How long do I have access to the course?",
                "answer": "You receive lifetime access to all course materials, including any future updates.",
            },
            {
                "question": "Are there assignments?",
                "answer": "Absolutely. Every week includes practical assignments that build your professional portfolio, culminating in a capstone mock environmental audit.",
            },
            {
                "question": "What is the course fee?",
                "answer": "The course costs KES 2 only, making it affordable and accessible to everyone.",
            },
        ],
    }

    # =========================================================
    # MODULE DATA — Preview + 10 Weeks
    # =========================================================
    modules_data = [
        # ==================== PREVIEW ====================
        {
            "title": "Course Preview",
            "description": "Get an overview of the 10-Week Environmental Audit Mentorship Program. Watch the introductory video to understand the course structure, learning outcomes, and what to expect each week.",
            "lessons": [
                {
                    "title": "Welcome to the Environmental Audit Mentorship Program",
                    "content": """<h2>Welcome to the Environmental Audit Mentorship Program!</h2>

<p>Over the next 10 weeks you will build a thorough understanding of environmental auditing — from the fundamentals and Kenya's legal framework, through practical audit techniques, to career development as a NEMA-registered expert.</p>

<h3>What This Course Covers:</h3>
<ul>
    <li>Foundations of environmental auditing</li>
    <li>Kenya's EMCA legislation and NEMA regulations</li>
    <li>Types of environmental audits</li>
    <li>EIA vs Environmental Audit</li>
    <li>Conducting, reporting, and managing audits</li>
    <li>Sector-specific audits</li>
    <li>Self-audits and continuous improvement</li>
    <li>Professional practice and career pathways</li>
</ul>

<p>Watch the preview video below to get started!</p>""",
                    "video_url": "https://www.youtube.com/watch?v=HAjXIGJE6Y8",
                    "duration": 600,
                    "is_free_preview": True,
                },
            ],
            "resources": [
                {"title": "Course Syllabus", "file_url": "#ea-syllabus"},
                {"title": "10-Week Learning Roadmap", "file_url": "#ea-roadmap"},
            ],
        },
        # ==================== WEEK 1 ====================
        {
            "title": "Week 1: Introduction to Environmental Auditing",
            "description": "This week lays the foundation. You will understand what an environmental audit is, its objectives, and its role in environmental compliance and sustainability.",
            "lessons": [
                {
                    "title": "What Is an Environmental Audit?",
                    "content": """<h2>What Is an Environmental Audit?</h2>

<p>An environmental audit is a systematic, documented, periodic, and objective evaluation of how well an organisation's environmental management systems, processes, and equipment are performing against set criteria.</p>

<h3>Key Concepts:</h3>
<ul>
    <li>Definition and purpose of environmental audits</li>
    <li>Objectives of environmental auditing</li>
    <li>The difference between environmental compliance and environmental performance</li>
    <li>Why environmental audits are important in Kenya</li>
</ul>

<h3>Why Environmental Audits Matter:</h3>
<p>Environmental audits ensure organisations comply with legal requirements, identify environmental risks, and drive continuous improvement. In Kenya, NEMA requires annual environmental audit reports from facilities that may impact the environment.</p>

<h3>📚 Supplementary Reading:</h3>
<ul>
    <li><a href="https://en.wikipedia.org/wiki/Environmental_audit" target="_blank">Environmental Audit Overview — Wikipedia</a></li>
    <li><a href="https://www.nema.go.ke/index.php?option=com_content&view=article&id=132&Itemid=188" target="_blank">NEMA Kenya — Environmental Audit (EA) Overview</a></li>
</ul>""",
                    "video_url": "https://www.youtube.com/watch?v=HAjXIGJE6Y8",
                    "duration": 720,
                    "is_free_preview": False,
                },
            ],
            "assignments": [
                {
                    "title": "Week 1 Assignment: Introduction to Environmental Auditing",
                    "description": """Complete the following tasks:

1. **Define environmental audit** in your own words (300–500 words).
2. **Identify 5 objectives** of environmental auditing.
3. **Describe the difference** between environmental compliance and environmental performance.
4. **Reflection:** Why are environmental audits important in Kenya? (200–300 words)

Submit your work as a PDF document.""",
                    "resource_url": "#week1-assignment",
                },
            ],
            "resources": [
                {
                    "title": "Environmental Audit Overview — Wikipedia",
                    "file_url": "https://en.wikipedia.org/wiki/Environmental_audit",
                },
                {
                    "title": "NEMA Kenya — Environmental Audit (EA) Overview",
                    "file_url": "https://www.nema.go.ke/index.php?option=com_content&view=article&id=132&Itemid=188",
                },
            ],
        },
        # ==================== WEEK 2 ====================
        {
            "title": "Week 2: Legal Framework & When Audits Are Required",
            "description": "Understand Kenya's Environmental Management and Coordination Act (EMCA) and when environmental audits are legally required.",
            "lessons": [
                {
                    "title": "Which Projects Need Environmental Audit?",
                    "content": """<h2>Legal Framework & When Audits Are Required</h2>

<p>Kenya's Environmental Management and Coordination Act (EMCA) 1999 and the Environmental (Impact Assessment & Audit) Regulations of 2003 establish when environmental audits are mandatory.</p>

<h3>Key Topics:</h3>
<ul>
    <li>Overview of EMCA 1999 and its relevance to environmental auditing</li>
    <li>The Environmental (Impact Assessment & Audit) Regulations, 2003</li>
    <li>Types of businesses and projects that must submit annual environmental audit reports</li>
    <li>Consequences of non-compliance</li>
</ul>

<h3>When Is an Environmental Audit Required?</h3>
<p>Any facility whose operations are likely to have an impact on the environment is required to carry out annual environmental audits and submit reports to NEMA. This includes manufacturing plants, hotels, hospitals, petrol stations, and large agricultural operations.</p>

<h3>📚 Supplementary Reading:</h3>
<ul>
    <li><a href="https://www.nema.go.ke/index.php?option=com_content&view=article&id=133&Itemid=189" target="_blank">NEMA — Environmental Auditing & Annual Reporting Requirements</a></li>
    <li><a href="https://www.nema.go.ke/index.php?option=com_content&view=article&id=134&Itemid=190" target="_blank">Environmental (Impact Assessment & Audit) Regulations — NEMA Kenya</a></li>
    <li><a href="http://kenyalaw.org/kl/fileadmin/pdfdownloads/Acts/EnvironmentalManagementandCo-ordinationAct_No8of1999.pdf" target="_blank">Kenya Law — Environmental (Impact Assessment and Audit) Regulations, 2003</a></li>
</ul>""",
                    "video_url": "https://www.youtube.com/watch?v=WdD_bKLR0II",
                    "duration": 780,
                    "is_free_preview": False,
                },
            ],
            "assignments": [
                {
                    "title": "Week 2 Assignment: Legal Framework Analysis",
                    "description": """Complete the following tasks:

1. **Identify 5 types of businesses** that must submit annual environmental audits to NEMA.
2. **Explain the consequences** of non-compliance with environmental audit requirements in Kenya.
3. **Draft a simple compliance checklist** for a small manufacturing plant (minimum 15 items).

Submit your work as a PDF document.""",
                    "resource_url": "#week2-assignment",
                },
            ],
            "resources": [
                {
                    "title": "NEMA — Environmental Auditing & Annual Reporting Requirements",
                    "file_url": "https://www.nema.go.ke/index.php?option=com_content&view=article&id=133&Itemid=189",
                },
                {
                    "title": "Environmental (Impact Assessment & Audit) Regulations — NEMA Kenya",
                    "file_url": "https://www.nema.go.ke/index.php?option=com_content&view=article&id=134&Itemid=190",
                },
                {
                    "title": "Kenya Law — EMCA 1999 Full Text",
                    "file_url": "http://kenyalaw.org/kl/fileadmin/pdfdownloads/Acts/EnvironmentalManagementandCo-ordinationAct_No8of1999.pdf",
                },
            ],
        },
        # ==================== WEEK 3 ====================
        {
            "title": "Week 3: Types of Environmental Audits",
            "description": "Explore compliance audits, performance audits, management system audits, and due diligence audits. Understand when each type is appropriate.",
            "lessons": [
                {
                    "title": "Types of Environmental Audits You Need to Know",
                    "content": """<h2>Types of Environmental Audits</h2>

<p>Not all environmental audits are the same. This lesson introduces the main types you will encounter in practice.</p>

<h3>Main Types of Environmental Audits:</h3>
<ul>
    <li><strong>Compliance Audit</strong> — Checks adherence to laws, regulations, and permit conditions</li>
    <li><strong>Performance Audit</strong> — Evaluates effectiveness of environmental management practices</li>
    <li><strong>Management System Audit</strong> — Assesses the EMS (e.g., ISO 14001) in place</li>
    <li><strong>Due Diligence Audit</strong> — Conducted before acquisitions or mergers to assess environmental liabilities</li>
</ul>

<h3>When to Use Each Type:</h3>
<p>The type of audit chosen depends on the objective: legal compliance, operational improvement, system certification, or risk assessment during business transactions.</p>

<h3>📚 Supplementary Reading:</h3>
<ul>
    <li><a href="https://www.douglaspartners.com.au/articles/introduction-to-environmental-auditing" target="_blank">Introduction to Environmental Auditing — Douglas Partners</a></li>
    <li><a href="https://www.intosai.org/focus-areas/audit-of-the-environment" target="_blank">INTOSAI Environmental Auditing Guidance</a></li>
</ul>""",
                    "video_url": "https://www.youtube.com/watch?v=jlxgKPOELH8",
                    "duration": 840,
                    "is_free_preview": False,
                },
            ],
            "assignments": [
                {
                    "title": "Week 3 Assignment: Types of Environmental Audits",
                    "description": """Complete the following tasks:

1. **Compare 3 types of environmental audits** in a table format (columns: Audit Type, Objective, When Used, Key Features).
2. **Case Study:** A factory has received complaints about air and water pollution from the surrounding community. Which audit type would you recommend and why? Write 300–500 words.
3. **Develop 10 audit questions** suitable for a compliance audit of a manufacturing facility.

Submit your work as a PDF document.""",
                    "resource_url": "#week3-assignment",
                },
            ],
            "resources": [
                {
                    "title": "Introduction to Environmental Auditing — Douglas Partners",
                    "file_url": "https://www.douglaspartners.com.au/articles/introduction-to-environmental-auditing",
                },
                {
                    "title": "INTOSAI Environmental Auditing Guidance",
                    "file_url": "https://www.intosai.org/focus-areas/audit-of-the-environment",
                },
            ],
        },
        # ==================== WEEK 4 ====================
        {
            "title": "Week 4: EIA vs Environmental Audit",
            "description": "Learn the key differences between Environmental Impact Assessment (EIA) and Environmental Audit (EA). Understand at what stage each process is conducted.",
            "lessons": [
                {
                    "title": "Difference Between EIA and Environmental Audit",
                    "content": """<h2>EIA vs Environmental Audit — What's the Difference?</h2>

<p>Environmental Impact Assessment (EIA) and Environmental Audit (EA) are both critical tools in environmental management, but they serve different purposes at different stages of a project's lifecycle.</p>

<h3>Key Differences:</h3>
<table>
    <tr><th>Aspect</th><th>EIA</th><th>Environmental Audit</th></tr>
    <tr><td>Timing</td><td>Before project implementation</td><td>After project is operational</td></tr>
    <tr><td>Purpose</td><td>Predict potential impacts</td><td>Assess actual impacts and compliance</td></tr>
    <tr><td>Frequency</td><td>One-time (before approval)</td><td>Periodic / Annual</td></tr>
    <tr><td>Focus</td><td>Future environmental effects</td><td>Current environmental performance</td></tr>
    <tr><td>Legal Basis</td><td>EMCA 1999, EIA Regulations</td><td>EMCA 1999, EA Regulations</td></tr>
</table>

<h3>📚 Supplementary Reading:</h3>
<ul>
    <li><a href="https://www.nema.go.ke/index.php?option=com_content&view=article&id=131&Itemid=187" target="_blank">NEMA — Environmental Impact Assessment (EIA) Guidance</a></li>
</ul>""",
                    "video_url": "https://www.youtube.com/watch?v=DMLRc6FAAfk",
                    "duration": 720,
                    "is_free_preview": False,
                },
            ],
            "assignments": [
                {
                    "title": "Week 4 Assignment: EIA vs Environmental Audit",
                    "description": """Complete the following tasks:

1. **Create a detailed comparison table** (EIA vs EA) covering at least 8 comparison criteria.
2. **Explain at what stage** each process is conducted in a project's lifecycle.
3. **Scenario:** A new housing estate is being planned on the outskirts of Nairobi. Which process (EIA or EA) is required first and why? What will happen once the estate is operational? Write 400–600 words.

Submit your work as a PDF document.""",
                    "resource_url": "#week4-assignment",
                },
            ],
            "resources": [
                {
                    "title": "NEMA — Environmental Impact Assessment (EIA) Guidance",
                    "file_url": "https://www.nema.go.ke/index.php?option=com_content&view=article&id=131&Itemid=187",
                },
            ],
        },
        # ==================== WEEK 5 ====================
        {
            "title": "Week 5: Conducting an Environmental Audit",
            "description": "This week focuses on methodology: planning, scoping, site visits, interviews, and documentation review. Learn the step-by-step process of conducting an environmental audit.",
            "lessons": [
                {
                    "title": "Can You Conduct an Environmental Audit Without a NEMA Expert?",
                    "content": """<h2>Conducting an Environmental Audit — Methodology</h2>

<p>This lesson walks you through the practical process of conducting an environmental audit, from initial planning to final documentation.</p>

<h3>Step-by-Step Audit Process:</h3>
<ol>
    <li><strong>Planning & Scoping</strong> — Define audit objectives, scope, criteria, and schedule</li>
    <li><strong>Pre-Audit Preparation</strong> — Review relevant documents, permits, previous audit reports</li>
    <li><strong>Opening Meeting</strong> — Introduce audit team, confirm scope with facility management</li>
    <li><strong>Site Visit & Inspection</strong> — Physical walkthrough, observations, measurements</li>
    <li><strong>Interviews</strong> — Speak with site staff, management, and relevant stakeholders</li>
    <li><strong>Document Review</strong> — Examine records, logs, permits, training documents</li>
    <li><strong>Evidence Gathering</strong> — Photographs, samples, data collection</li>
    <li><strong>Analysis & Findings</strong> — Compare evidence against audit criteria</li>
    <li><strong>Closing Meeting</strong> — Present preliminary findings to facility management</li>
    <li><strong>Report Writing</strong> — Compile comprehensive audit report</li>
</ol>

<h3>Who Can Conduct an Environmental Audit?</h3>
<p>In Kenya, environmental audits must be conducted by NEMA-registered Lead Environmental Experts or Associate Environmental Experts. This video explores what qualifications are needed and when you might involve external consultants.</p>

<h3>📚 Supplementary Reading:</h3>
<ul>
    <li><a href="https://www.epd.gov.hk/epd/english/environmentinhk/eia_planning/guide/guide1.html" target="_blank">How to Conduct an Environmental Audit — EPD Hong Kong Guide</a></li>
    <li><a href="https://www.process.st/checklist/environmental-compliance-audit-checklist/" target="_blank">Environmental Compliance Audit Checklist — Process Street</a></li>
</ul>""",
                    "video_url": "https://www.youtube.com/watch?v=L55Y4D5Ai2o",
                    "duration": 900,
                    "is_free_preview": False,
                },
            ],
            "assignments": [
                {
                    "title": "Week 5 Assignment: Conducting an Environmental Audit",
                    "description": """Complete the following tasks:

1. **Outline the step-by-step process** of conducting an environmental audit (use numbered steps with brief explanations).
2. **Draft an audit plan** for a small hotel, including: objectives, scope, criteria, audit team, schedule, and methodology.
3. **Prepare 15 interview questions** you would ask site staff during an environmental audit of a hotel.

Submit your work as a PDF document.""",
                    "resource_url": "#week5-assignment",
                },
            ],
            "resources": [
                {
                    "title": "How to Conduct an Environmental Audit — EPD Hong Kong Guide",
                    "file_url": "https://www.epd.gov.hk/epd/english/environmentinhk/eia_planning/guide/guide1.html",
                },
                {
                    "title": "Environmental Compliance Audit Checklist — Process Street",
                    "file_url": "https://www.process.st/checklist/environmental-compliance-audit-checklist/",
                },
                {
                    "title": "EHS Consultancy — EIA/EA Assessment Explanation",
                    "file_url": "https://www.ehsconsultancy.com/environmental-impact-assessment",
                },
            ],
        },
        # ==================== WEEK 6 ====================
        {
            "title": "Week 6: Environmental Audit Reporting",
            "description": "Learn how to structure audit reports: executive summary, findings, non-conformities, corrective actions. Master the art of clear, professional audit reporting.",
            "lessons": [
                {
                    "title": "What Happens If You Don't Do Environmental Audit on Time",
                    "content": """<h2>Environmental Audit Reporting</h2>

<p>The audit report is the most important deliverable. A well-structured report communicates findings clearly and provides actionable recommendations.</p>

<h3>Key Components of an Environmental Audit Report:</h3>
<ol>
    <li><strong>Cover Page & Table of Contents</strong></li>
    <li><strong>Executive Summary</strong> — High-level overview of key findings</li>
    <li><strong>Introduction</strong> — Audit objectives, scope, methodology</li>
    <li><strong>Facility Description</strong> — Location, operations, workforce</li>
    <li><strong>Regulatory Framework</strong> — Applicable laws and standards</li>
    <li><strong>Findings</strong> — Detailed observations organised by environmental aspect</li>
    <li><strong>Non-Conformities</strong> — Areas of non-compliance with regulations or standards</li>
    <li><strong>Corrective Action Recommendations</strong> — Specific, measurable actions</li>
    <li><strong>Conclusion</strong> — Overall compliance status</li>
    <li><strong>Appendices</strong> — Photos, lab results, maps, staff lists</li>
</ol>

<h3>Consequences of Late Submission:</h3>
<p>This video discusses what happens when organisations fail to submit their environmental audit reports on time — including penalties, improvement orders, and potential prosecution by NEMA.</p>

<h3>📚 Supplementary Reading:</h3>
<ul>
    <li><a href="https://www.nema.go.ke/index.php?option=com_content&view=article&id=132&Itemid=188" target="_blank">NEMA — Environmental Audit Report Components Guide</a></li>
</ul>""",
                    "video_url": "https://www.youtube.com/watch?v=WdD_bKLR0II",
                    "duration": 840,
                    "is_free_preview": False,
                },
            ],
            "assignments": [
                {
                    "title": "Week 6 Assignment: Environmental Audit Reporting",
                    "description": """Complete the following tasks:

1. **Create a mock environmental audit report outline** for a manufacturing facility — list all sections with brief descriptions of content expected in each.
2. **Write a sample executive summary** (300 words) for a hypothetical environmental audit of a cement factory.
3. **Develop 5 corrective action recommendations** for a facility found to have improper waste disposal practices. Each recommendation should include: finding, action required, responsible person, and timeline.

Submit your work as a PDF document.""",
                    "resource_url": "#week6-assignment",
                },
            ],
            "resources": [
                {
                    "title": "NEMA — Environmental Audit Report Components",
                    "file_url": "https://www.nema.go.ke/index.php?option=com_content&view=article&id=132&Itemid=188",
                },
            ],
        },
        # ==================== WEEK 7 ====================
        {
            "title": "Week 7: Compliance, Enforcement & Risk Management",
            "description": "Understand regulatory inspections, improvement notices, penalties, and enforcement mechanisms. Learn to manage environmental risk proactively.",
            "lessons": [
                {
                    "title": "NEMA Approvals for Businesses — Environmental Audits & Licenses",
                    "content": """<h2>Compliance, Enforcement & Risk Management</h2>

<p>This week examines the enforcement side of environmental auditing — what happens when audits reveal non-compliance, and how to manage environmental risks proactively.</p>

<h3>Key Topics:</h3>
<ul>
    <li><strong>Regulatory Inspections</strong> — How NEMA conducts inspections</li>
    <li><strong>Improvement Notices</strong> — What they are and how to respond</li>
    <li><strong>Penalties & Prosecution</strong> — Financial penalties and criminal liability</li>
    <li><strong>Environmental Restoration Orders</strong> — Mandatory remediation</li>
</ul>

<h3>Risk Management Framework:</h3>
<ul>
    <li>Environmental risk identification</li>
    <li>Risk assessment (likelihood × severity)</li>
    <li>Risk mitigation strategies</li>
    <li>Monitoring and review</li>
</ul>

<h3>📚 Supplementary Reading:</h3>
<ul>
    <li><a href="https://www.nema.go.ke/index.php?option=com_content&view=article&id=135&Itemid=191" target="_blank">NEMA — Compliance and Enforcement Overview</a></li>
</ul>""",
                    "video_url": "https://www.youtube.com/watch?v=WdD_bKLR0II",
                    "duration": 780,
                    "is_free_preview": False,
                },
            ],
            "assignments": [
                {
                    "title": "Week 7 Assignment: Compliance & Risk Management",
                    "description": """Complete the following tasks:

1. **Identify 5 risks** of failing an environmental audit (consider legal, financial, reputational, operational, and environmental consequences).
2. **Propose a risk mitigation strategy** for a facility that handles hazardous chemicals — cover at least 5 risk areas with specific mitigation actions.
3. **Draft a formal response letter to NEMA** after receiving a notice of non-compliance. The letter should acknowledge the findings, outline corrective actions planned, and propose a timeline for implementation.

Submit your work as a PDF document.""",
                    "resource_url": "#week7-assignment",
                },
            ],
            "resources": [
                {
                    "title": "NEMA — Compliance and Enforcement Overview",
                    "file_url": "https://www.nema.go.ke/index.php?option=com_content&view=article&id=135&Itemid=191",
                },
            ],
        },
        # ==================== WEEK 8 ====================
        {
            "title": "Week 8: Sector-Specific Environmental Audits",
            "description": "Examine environmental audits in key sectors: agriculture, hospitality, and manufacturing. Learn how audit scope and focus change by industry.",
            "lessons": [
                {
                    "title": "Types of Environmental Audits — Sector Lens",
                    "content": """<h2>Sector-Specific Environmental Audits</h2>

<p>Different sectors face different environmental challenges. This lesson explores how environmental audits are tailored for specific industries.</p>

<h3>Agriculture Sector:</h3>
<ul>
    <li>Pesticide and fertiliser management</li>
    <li>Soil erosion and land degradation</li>
    <li>Water abstraction and irrigation impacts</li>
    <li>Waste management (agrochemical containers, organic waste)</li>
</ul>

<h3>Hospitality Sector:</h3>
<ul>
    <li>Water consumption and wastewater management</li>
    <li>Energy efficiency and carbon footprint</li>
    <li>Solid waste management and recycling</li>
    <li>Noise pollution management</li>
</ul>

<h3>Manufacturing Sector:</h3>
<ul>
    <li>Emissions to air (particulates, gases)</li>
    <li>Industrial effluent treatment and discharge</li>
    <li>Hazardous waste management</li>
    <li>Occupational health and safety</li>
    <li>Raw material sourcing sustainability</li>
</ul>

<h3>📚 Supplementary Reading:</h3>
<ul>
    <li><a href="http://erepository.uonbi.ac.ke/handle/11295/63658" target="_blank">Environmental Audits in Kenya's Agricultural Sector — UoN Repository</a></li>
</ul>""",
                    "video_url": "https://www.youtube.com/watch?v=jlxgKPOELH8",
                    "duration": 840,
                    "is_free_preview": False,
                },
            ],
            "assignments": [
                {
                    "title": "Week 8 Assignment: Sector-Specific Audit",
                    "description": """Complete the following tasks:

1. **Choose one sector** (agriculture, hospitality, or manufacturing).
2. **Identify key environmental risks** in that sector (minimum 8 risks).
3. **Develop a sector-specific audit checklist** with a minimum of 20 items, organised by environmental aspect (e.g., waste, water, air, energy, land).

Submit your work as a PDF document.""",
                    "resource_url": "#week8-assignment",
                },
            ],
            "resources": [
                {
                    "title": "Environmental Audits in Kenya's Agricultural Sector — UoN Repository",
                    "file_url": "http://erepository.uonbi.ac.ke/handle/11295/63658",
                },
            ],
        },
        # ==================== WEEK 9 ====================
        {
            "title": "Week 9: Self-Audits & Continuous Improvement",
            "description": "Learn how organisations maintain compliance through internal audits and monitoring systems. Explore the Plan-Do-Check-Act cycle for environmental management.",
            "lessons": [
                {
                    "title": "Environmental Audit for Continuous Improvement",
                    "content": """<h2>Self-Audits & Continuous Improvement</h2>

<p>External audits happen annually, but best-practice organisations conduct regular internal (self-) audits to stay ahead of compliance requirements and drive continuous improvement.</p>

<h3>Internal Audit Benefits:</h3>
<ul>
    <li>Early identification of non-conformities</li>
    <li>Reduced risk of penalties during external audits</li>
    <li>Improved environmental performance over time</li>
    <li>Demonstrating corporate environmental responsibility</li>
</ul>

<h3>Plan-Do-Check-Act (PDCA) Cycle:</h3>
<ul>
    <li><strong>Plan</strong> — Set environmental objectives and targets</li>
    <li><strong>Do</strong> — Implement environmental management procedures</li>
    <li><strong>Check</strong> — Monitor, measure, and audit performance</li>
    <li><strong>Act</strong> — Take corrective and preventive actions</li>
</ul>

<h3>Key Performance Indicators (KPIs):</h3>
<p>Effective environmental management requires measurable KPIs — energy consumption, water usage, waste generation, emission levels, compliance rates, and incident frequency.</p>

<h3>📚 Supplementary Reading:</h3>
<ul>
    <li><a href="https://www.epd.gov.hk/epd/english/environmentinhk/eia_planning/guide/guide1.html" target="_blank">Self-Audit Guidelines — EPD</a></li>
</ul>""",
                    "video_url": "https://www.youtube.com/watch?v=HAjXIGJE6Y8",
                    "duration": 720,
                    "is_free_preview": False,
                },
            ],
            "assignments": [
                {
                    "title": "Week 9 Assignment: Self-Audits & Continuous Improvement",
                    "description": """Complete the following tasks:

1. **Design a quarterly internal audit schedule** for a medium-sized manufacturing facility. Include: audit areas, frequency, responsible person, and methodology.
2. **Develop 10 KPIs** (Key Performance Indicators) for environmental performance. For each KPI, specify: what is measured, unit of measurement, target value, and monitoring frequency.
3. **Create a corrective action tracking template** (table format) with columns for: finding reference, non-conformity description, corrective action, responsible person, deadline, status, and verification date.

Submit your work as a PDF document.""",
                    "resource_url": "#week9-assignment",
                },
            ],
            "resources": [
                {
                    "title": "Self-Audit Guidelines — EPD",
                    "file_url": "https://www.epd.gov.hk/epd/english/environmentinhk/eia_planning/guide/guide1.html",
                },
            ],
        },
        # ==================== WEEK 10 ====================
        {
            "title": "Week 10: Professional Practice & Career Pathways",
            "description": "Explore becoming a NEMA-registered environmental expert, required qualifications, career opportunities, and your capstone mock audit project.",
            "lessons": [
                {
                    "title": "Career Pathways in Environmental Auditing",
                    "content": """<h2>Professional Practice & Career Pathways</h2>

<p>This final week focuses on your professional development as an environmental auditor and the requirements for NEMA registration.</p>

<h3>NEMA Registration Categories:</h3>
<ul>
    <li><strong>Lead Environmental Expert</strong> — Minimum Master's degree + 5 years experience</li>
    <li><strong>Associate Environmental Expert</strong> — Minimum Bachelor's degree + relevant training</li>
</ul>

<h3>Career Opportunities:</h3>
<ul>
    <li>Independent Environmental Consultant</li>
    <li>Corporate EHS Manager</li>
    <li>Government Environmental Officer</li>
    <li>NGO Environmental Programme Manager</li>
    <li>Academic / Researcher</li>
</ul>

<h3>Building Your Portfolio:</h3>
<ul>
    <li>Volunteer for audits with experienced experts</li>
    <li>Build a library of audit checklists and templates</li>
    <li>Join professional associations (EIAK, NEMA Expert Network)</li>
    <li>Attend conferences, workshops, and CPD events</li>
</ul>

<h3>📚 Supplementary Reading:</h3>
<ul>
    <li><a href="https://www.nema.go.ke/index.php?option=com_content&view=article&id=33" target="_blank">NEMA Expert Registration Guidelines</a></li>
    <li><a href="https://www.nema.go.ke" target="_blank">Environmental Audit & EIA Training Programs</a></li>
</ul>""",
                    "video_url": "https://www.youtube.com/watch?v=jlxgKPOELH8",
                    "duration": 900,
                    "is_free_preview": False,
                },
            ],
            "assignments": [
                {
                    "title": "Week 10 — Final Capstone Assignment: Mock Environmental Audit Project",
                    "description": """This is your capstone project. You will conduct a **Mock Environmental Audit** and produce a professional-grade report.

**Instructions:**

Select a hypothetical business (factory, hotel, school, or farm) and prepare the following deliverables:

1. **Audit Plan** — Objectives, scope, criteria, team composition, schedule, and methodology.
2. **Site Checklist** — Minimum 25 items covering waste, water, air, energy, land, and occupational health.
3. **Risk Assessment** — Identify at least 10 environmental risks with likelihood and severity ratings.
4. **Findings Summary** — Document at least 8 findings (conformities and non-conformities).
5. **Corrective Action Plan** — For each non-conformity, specify the corrective action, responsible person, deadline, and expected outcome.
6. **Executive Summary** — A 500-word summary of the overall audit.

**Compile everything into a 10–15 page report** (PDF format) with:
- Cover page
- Table of contents
- All sections above
- Appendices (photos, maps, or diagrams — can be illustrative)

This capstone project serves as a portfolio piece for your professional career.

Submit your report as a PDF document.""",
                    "resource_url": "#capstone-template",
                },
            ],
            "resources": [
                {
                    "title": "NEMA Expert Registration Guidelines",
                    "file_url": "https://www.nema.go.ke/index.php?option=com_content&view=article&id=33",
                },
                {
                    "title": "Environmental Audit & EIA Training Programs",
                    "file_url": "https://www.nema.go.ke",
                },
                {
                    "title": "University of Nairobi — Environmental Audits Repository",
                    "file_url": "http://erepository.uonbi.ac.ke/handle/11295/63658",
                },
            ],
        },
    ]

    # ----------------------------------------------------------
    # CREATE / UPDATE THE COURSE
    # ----------------------------------------------------------
    try:
        course = Course.objects.get(slug="environmental-audit-mentorship-program")
        print(f"Found existing course: {course.title}")
        course.modules.all().delete()
        print("Cleared existing modules")
    except Course.DoesNotExist:
        course = Course.objects.create(
            **{k: v for k, v in course_data.items() if k != "slug"}
        )
        course.slug = "environmental-audit-mentorship-program"
        course.save()
        print(f"Created new course: {course.title}")

    # Update all course fields
    for key, value in course_data.items():
        setattr(course, key, value)
    course.save()
    print(f"Updated course: {course.title}")

    # ----------------------------------------------------------
    # CREATE MODULES, LESSONS, ASSIGNMENTS, RESOURCES
    # ----------------------------------------------------------
    for m_idx, m_data in enumerate(modules_data):
        lessons_data = m_data.pop("lessons", [])
        assignments_data = m_data.pop("assignments", [])
        resources_data = m_data.pop("resources", [])

        module = Module.objects.create(
            course=course,
            order=m_idx,
            title=m_data["title"],
            description=m_data["description"],
        )
        print(f"  Created module: {module.title}")

        # Lessons
        for l_idx, l_data in enumerate(lessons_data):
            lesson = Lesson.objects.create(
                module=module,
                order=l_idx,
                title=l_data.get("title", ""),
                content=l_data.get("content", ""),
                video_url=l_data.get("video_url", ""),
                duration=l_data.get("duration", 600),
                is_free_preview=l_data.get("is_free_preview", False),
            )
            print(f"    Created lesson: {lesson.title}")

        # Assignments
        for a_data in assignments_data:
            assignment = Assignment.objects.create(
                module=module,
                title=a_data.get("title", ""),
                description=a_data.get("description", ""),
                resource_url=a_data.get("resource_url", ""),
            )
            print(f"    Created assignment: {assignment.title}")

        # Resources
        for r_data in resources_data:
            resource = Resource.objects.create(
                module=module,
                title=r_data.get("title", ""),
                file_url=r_data.get("file_url", ""),
            )
            print(f"    Created resource: {resource.title}")

    print("\n✅ Environmental Audit Mentorship Program seeding completed!")
    print(f"Total modules: {course.modules.count()}")
    total_lessons = sum(m.lessons.count() for m in course.modules.all())
    total_assignments = sum(m.assignments.count() for m in course.modules.all())
    total_resources = sum(m.resources.count() for m in course.modules.all())
    print(f"Total lessons: {total_lessons}")
    print(f"Total assignments: {total_assignments}")
    print(f"Total resources: {total_resources}")


if __name__ == "__main__":
    seed_ea_mentorship()
