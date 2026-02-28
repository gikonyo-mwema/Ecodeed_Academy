import os
import django
import pymysql
pymysql.install_as_MySQLdb()

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from courses.models import Course, Module, Lesson, Assignment, Resource

def seed_eia_masterclass():
    """
    Comprehensive 10-week EIA (Environmental Impact Assessment) Master Class
    Industry standard course structure with videos, readings, and assignments.
    """
    
    course_data = {
        "title": "EIA Mentorship Mastermind",
        "slug": "eia-mentorship-mastermind",
        "short_description": "A comprehensive 10-week mentorship program designed to guide aspiring and practicing environmental experts through the intricacies of Environmental Impact Assessments in Kenya.",
        "full_description": """The EIA Mentorship Mastermind is an intensive 10-week program that bridges the gap between academic knowledge and practical application. 

You will learn the end-to-end process of conducting EIAs, from scoping and baseline studies to impact prediction, mitigation planning, and report writing. The course includes real-world case studies, practical video lessons from experienced consultants, and structured assignments to build your portfolio.

**What You'll Learn:**
- Complete understanding of EIA frameworks and regulations in Kenya
- Step-by-step process for conducting EIAs
- Report writing best practices and common pitfalls to avoid
- How to handle non-compliant clients professionally
- Career pathways and NEMA registration requirements

**Course Format:**
- 10 structured weeks of content
- 2-3 video lessons per week
- Recommended readings and articles
- Weekly assignments and case studies
- Certificate of completion""",
        "category": "masterclass",
        "price": 25000.00,
        "is_free": False,
        "has_certificate": True,
        "image": "https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        "level": ["Beginner", "Intermediate", "Advanced"],
        "features": [
            "10 Weeks of Structured Content",
            "20+ Video Lessons",
            "Weekly Assignments",
            "Reading Resources",
            "Case Studies",
            "Certificate of Completion",
            "Lifetime Access"
        ],
        "target_audience": [
            "Environmental Science Graduates",
            "Aspiring EIA Consultants",
            "Junior Environmental Experts",
            "Project Managers",
            "Land Developers",
            "Anyone seeking NEMA registration"
        ],
        "faqs": [
            {
                "question": "Do I need prior experience to take this course?",
                "answer": "No prior experience is required. The course starts from the basics and progressively builds your expertise."
            },
            {
                "question": "Will this help me get registered with NEMA?",
                "answer": "Yes, this course covers all the knowledge areas required for NEMA registration as an EIA expert in Kenya."
            },
            {
                "question": "How long do I have access to the course?",
                "answer": "You get lifetime access to all course materials, including any future updates."
            },
            {
                "question": "Are there assignments?",
                "answer": "Yes, each week includes practical assignments designed to build your EIA portfolio."
            }
        ]
    }
    
    # 10 Weeks + Preview Module
    modules_data = [
        # ==================== PREVIEW ====================
        {
            "title": "Course Preview",
            "description": "Get a glimpse of what you'll learn in this comprehensive EIA Master Class. Watch the preview video to understand the course structure and learning outcomes.",
            "lessons": [
                {
                    "title": "Welcome to the EIA Master Class",
                    "content": """<h2>Welcome to the EIA Mentorship Mastermind!</h2>
                    
<p>In this comprehensive 10-week program, you will master the complete Environmental Impact Assessment process from start to finish.</p>

<h3>What This Course Covers:</h3>
<ul>
    <li>Understanding EIA fundamentals and legal frameworks</li>
    <li>Step-by-step EIA process in Kenya</li>
    <li>Report writing and submission</li>
    <li>Dealing with NEMA and regulatory compliance</li>
    <li>Career development as an EIA expert</li>
</ul>

<p>Watch this preview video to get started!</p>""",
                    "video_url": "https://www.youtube.com/watch?v=5-6Fhbv-HIg",
                    "duration": 600,
                    "is_free_preview": True
                }
            ],
            "resources": [
                {"title": "Course Syllabus (PDF)", "file_url": "#syllabus"},
                {"title": "EIA Learning Roadmap", "file_url": "#roadmap"}
            ]
        },
        
        # ==================== WEEK 1 ====================
        {
            "title": "Week 1: Introduction to Environmental Impact Assessment",
            "description": "Understand what EIA is, why it matters, and its role in sustainable development. This foundational week sets the stage for everything that follows.",
            "lessons": [
                {
                    "title": "Environmental Impact Assessment (EIA) Explained in Simple Terms",
                    "content": """<h2>What is Environmental Impact Assessment?</h2>
                    
<p>Environmental Impact Assessment (EIA) is a systematic process used to evaluate the potential environmental effects of a proposed project or development before it is carried out.</p>

<h3>Key Concepts You'll Learn:</h3>
<ul>
    <li>Definition and purpose of EIA</li>
    <li>Historical development of EIA globally and in Kenya</li>
    <li>The role of EIA in sustainable development</li>
    <li>Types of projects that require EIA</li>
</ul>

<h3>Why EIA Matters:</h3>
<p>EIA helps decision-makers understand the environmental consequences of their choices before committing resources. It promotes transparency, public participation, and informed decision-making.</p>

<h3>📚 Further Reading:</h3>
<ul>
    <li><a href="https://www.nema.go.ke" target="_blank">NEMA Kenya Official Website</a></li>
    <li><a href="https://www.unep.org/explore-topics/environmental-assessment" target="_blank">UNEP Environmental Assessment</a></li>
</ul>""",
                    "video_url": "https://www.youtube.com/watch?v=5-6Fhbv-HIg",
                    "duration": 720,
                    "is_free_preview": False
                },
                {
                    "title": "Where to Start as an EIA Expert in 2026",
                    "content": """<h2>Starting Your Journey as an EIA Expert</h2>

<p>This lesson provides career guidance and entry points into EIA consulting. Learn the pathways available for different educational backgrounds.</p>

<h3>Topics Covered:</h3>
<ul>
    <li>Educational requirements for EIA practice</li>
    <li>NEMA registration categories (Lead Expert vs Associate Expert)</li>
    <li>Building your first EIA portfolio</li>
    <li>Networking in the environmental sector</li>
</ul>

<h3>📚 Further Reading:</h3>
<ul>
    <li><a href="https://www.nema.go.ke/index.php?option=com_content&view=article&id=33" target="_blank">NEMA Expert Registration Requirements</a></li>
</ul>""",
                    "video_url": "https://www.youtube.com/watch?v=XI-TxMFa81I",
                    "duration": 900,
                    "is_free_preview": False
                }
            ],
            "assignments": [
                {
                    "title": "Week 1 Assignment: EIA Reflection Paper",
                    "description": """Write a 500-word reflection paper answering the following questions:

1. What is your understanding of EIA after watching this week's videos?
2. Why do you think EIA is important for Kenya's development?
3. What type of EIA expert do you aspire to become (Lead or Associate)?
4. List 3 projects in your area that you think would require an EIA.

Submit your paper as a PDF document.""",
                    "resource_url": "#assignment-template-week1"
                }
            ],
            "resources": [
                {"title": "EMCA 1999 Summary", "file_url": "#emca-summary"},
                {"title": "Types of Projects Requiring EIA", "file_url": "#project-types"}
            ]
        },
        
        # ==================== WEEK 2 ====================
        {
            "title": "Week 2: EIA Legal Framework & Enforcement in Kenya",
            "description": "Deep dive into the legal and regulatory landscape governing EIA in Kenya. Understand NEMA's role, EMCA 1999, and the enforcement mechanisms.",
            "lessons": [
                {
                    "title": "Who Enforces Environmental Impact Assessment (EIA) in Kenya",
                    "content": """<h2>Understanding EIA Enforcement in Kenya</h2>

<p>This lesson explains the enforcement side of EIA compliance in Kenya, including the roles of regulatory agencies such as NEMA and county bodies.</p>

<h3>Key Regulatory Bodies:</h3>
<ul>
    <li><strong>NEMA (National Environment Management Authority)</strong> - The principal instrument of government for implementation of environmental policies</li>
    <li><strong>County Environment Committees</strong> - Local enforcement and monitoring</li>
    <li><strong>Lead Agencies</strong> - Sector-specific oversight</li>
</ul>

<h3>Enforcement Mechanisms:</h3>
<ul>
    <li>Environmental licenses and permits</li>
    <li>Inspection and monitoring</li>
    <li>Penalties for non-compliance</li>
    <li>Environmental restoration orders</li>
</ul>

<h3>📚 Further Reading:</h3>
<ul>
    <li><a href="https://www.nema.go.ke/index.php?option=com_content&view=article&id=24" target="_blank">NEMA Mandate and Functions</a></li>
    <li><a href="http://kenyalaw.org/kl/fileadmin/pdfdownloads/Acts/EnvironmentalManagementandCo-ordinationAct_No8of1999.pdf" target="_blank">EMCA 1999 Full Text</a></li>
</ul>""",
                    "video_url": "https://www.youtube.com/watch?v=m0Yv0VyxF44",
                    "duration": 840,
                    "is_free_preview": False
                },
                {
                    "title": "What Happens If You Build Without an EIA License",
                    "content": """<h2>Legal Consequences of Building Without EIA</h2>

<p>This lesson focuses on the legal consequences of proceeding with development without proper EIA approval.</p>

<h3>Potential Consequences:</h3>
<ul>
    <li>Stoppage orders and demolition</li>
    <li>Heavy fines (up to KES 2 million)</li>
    <li>Imprisonment of up to 2 years</li>
    <li>Environmental restoration costs</li>
    <li>Civil liability for damages</li>
</ul>

<h3>Case Studies:</h3>
<p>We'll examine real cases where developers faced consequences for non-compliance, including notable demolitions in Nairobi.</p>

<h3>📚 Further Reading:</h3>
<ul>
    <li>EMCA 1999 Section 58 - Offences and Penalties</li>
    <li>Environmental (Impact Assessment and Audit) Regulations, 2003</li>
</ul>""",
                    "video_url": "https://www.youtube.com/watch?v=SxsLjALwxfw",
                    "duration": 780,
                    "is_free_preview": False
                }
            ],
            "assignments": [
                {
                    "title": "Week 2 Assignment: Legal Framework Analysis",
                    "description": """Research and prepare a summary document covering:

1. List 5 key sections of EMCA 1999 relevant to EIA
2. Describe the role of NEMA in EIA enforcement
3. Find and summarize a recent news article about EIA enforcement in Kenya
4. What are the penalties for conducting activities without EIA approval?

Include citations and references.""",
                    "resource_url": "#assignment-template-week2"
                }
            ],
            "resources": [
                {"title": "EMCA 1999 PDF", "file_url": "http://kenyalaw.org/kl/fileadmin/pdfdownloads/Acts/EnvironmentalManagementandCo-ordinationAct_No8of1999.pdf"},
                {"title": "EIA Regulations 2003", "file_url": "#eia-regulations-2003"}
            ]
        },
        
        # ==================== WEEK 3 ====================
        {
            "title": "Week 3: The Complete EIA Process - Step by Step",
            "description": "Learn the entire EIA process from project registration to license issuance. This week provides a comprehensive walkthrough of every stage.",
            "lessons": [
                {
                    "title": "How to Conduct an EIA Project in Kenya",
                    "content": """<h2>Step-by-Step Guide to Conducting an EIA</h2>

<p>This comprehensive lesson walks you through the complete EIA process as practiced in Kenya.</p>

<h3>The EIA Process Steps:</h3>
<ol>
    <li><strong>Project Registration</strong> - Registering with NEMA</li>
    <li><strong>Screening</strong> - Determining if full EIA is needed</li>
    <li><strong>Scoping</strong> - Defining study boundaries</li>
    <li><strong>Baseline Studies</strong> - Current environmental conditions</li>
    <li><strong>Impact Assessment</strong> - Predicting effects</li>
    <li><strong>Mitigation Planning</strong> - Reducing negative impacts</li>
    <li><strong>Public Participation</strong> - Stakeholder engagement</li>
    <li><strong>Report Compilation</strong> - Documenting findings</li>
    <li><strong>Review & Decision</strong> - NEMA evaluation</li>
    <li><strong>Monitoring</strong> - Post-approval compliance</li>
</ol>

<h3>📚 Further Reading:</h3>
<ul>
    <li><a href="https://www.nema.go.ke" target="_blank">NEMA EIA Guidelines</a></li>
</ul>""",
                    "video_url": "https://www.youtube.com/watch?v=SxsLjALwxfw",
                    "duration": 1200,
                    "is_free_preview": False
                },
                {
                    "title": "How I Conduct EIA: My Step-by-Step Process",
                    "content": """<h2>Practical EIA Process - From the Field</h2>

<p>Learn from an experienced practitioner's actual process for conducting EIAs. This practical walkthrough shows real-world application.</p>

<h3>What You'll Learn:</h3>
<ul>
    <li>Initial client consultation and site visit</li>
    <li>Document collection and preliminary assessment</li>
    <li>Field data collection methods</li>
    <li>Stakeholder engagement strategies</li>
    <li>Report writing timeline and workflow</li>
    <li>NEMA submission process</li>
</ul>

<h3>Pro Tips:</h3>
<ul>
    <li>Always verify land ownership documents</li>
    <li>Take comprehensive photographs</li>
    <li>Keep detailed field notes</li>
    <li>Build relationships with local administration</li>
</ul>""",
                    "video_url": "https://www.youtube.com/watch?v=2-B1elUAb90",
                    "duration": 1080,
                    "is_free_preview": False
                }
            ],
            "assignments": [
                {
                    "title": "Week 3 Assignment: EIA Process Flowchart",
                    "description": """Create a detailed flowchart showing the complete EIA process in Kenya.

Your flowchart should include:
1. All major stages from screening to monitoring
2. Decision points and branching paths
3. Timeframes for each stage (NEMA guidelines)
4. Key stakeholders involved at each stage
5. Required documents at each stage

Use any flowchart tool (draw.io, Lucidchart, or hand-drawn and scanned).""",
                    "resource_url": "#flowchart-template"
                }
            ],
            "resources": [
                {"title": "EIA Process Checklist", "file_url": "#eia-checklist"},
                {"title": "NEMA Application Forms", "file_url": "#nema-forms"}
            ]
        },
        
        # ==================== WEEK 4 ====================
        {
            "title": "Week 4: Scoping & Baseline Studies",
            "description": "Master the critical early stages of EIA - defining scope and establishing environmental baselines. Learn what data to collect and how.",
            "lessons": [
                {
                    "title": "EIA Scoping: Defining Your Study Boundaries",
                    "content": """<h2>The Art of Scoping</h2>

<p>Scoping determines the boundaries and focus of your EIA study. Get it right, and the rest flows smoothly. Get it wrong, and you'll waste time and resources.</p>

<h3>Key Scoping Elements:</h3>
<ul>
    <li><strong>Spatial Scope</strong> - Geographic area of influence</li>
    <li><strong>Temporal Scope</strong> - Timeframe of impacts</li>
    <li><strong>Technical Scope</strong> - Issues to be studied</li>
    <li><strong>Institutional Scope</strong> - Stakeholders to engage</li>
</ul>

<h3>Scoping Outputs:</h3>
<ul>
    <li>Terms of Reference (ToR)</li>
    <li>Study area maps</li>
    <li>List of environmental components to assess</li>
    <li>Stakeholder register</li>
</ul>

<h3>📚 Further Reading:</h3>
<ul>
    <li>NEMA Scoping Guidelines</li>
    <li>Sample Terms of Reference</li>
</ul>""",
                    "video_url": "https://www.youtube.com/watch?v=2-B1elUAb90",
                    "duration": 900,
                    "is_free_preview": False
                },
                {
                    "title": "Baseline Studies: Capturing Current Conditions",
                    "content": """<h2>Establishing Environmental Baselines</h2>

<p>Baseline studies document the current state of the environment before project implementation. This data is crucial for measuring impacts.</p>

<h3>Components of Baseline Studies:</h3>

<h4>Physical Environment:</h4>
<ul>
    <li>Topography and geology</li>
    <li>Soil characteristics</li>
    <li>Water resources (surface and groundwater)</li>
    <li>Air quality</li>
    <li>Climate and weather patterns</li>
</ul>

<h4>Biological Environment:</h4>
<ul>
    <li>Flora (vegetation types, protected species)</li>
    <li>Fauna (wildlife, endangered species)</li>
    <li>Ecosystems and habitats</li>
</ul>

<h4>Socio-Economic Environment:</h4>
<ul>
    <li>Population and demographics</li>
    <li>Land use patterns</li>
    <li>Economic activities</li>
    <li>Cultural and heritage sites</li>
    <li>Infrastructure and services</li>
</ul>

<h3>Data Collection Methods:</h3>
<ul>
    <li>Field surveys and observations</li>
    <li>Laboratory testing</li>
    <li>Questionnaires and interviews</li>
    <li>Secondary data review</li>
    <li>GIS mapping</li>
</ul>""",
                    "video_url": "https://www.youtube.com/watch?v=5-6Fhbv-HIg",
                    "duration": 1020,
                    "is_free_preview": False
                }
            ],
            "assignments": [
                {
                    "title": "Week 4 Assignment: Baseline Data Collection Plan",
                    "description": """Develop a baseline data collection plan for a hypothetical housing project.

Your plan should include:
1. Study area definition (include a sketch map)
2. List of environmental parameters to measure
3. Data collection methods for each parameter
4. Equipment and resources needed
5. Timeline for data collection
6. Quality assurance measures

Choose a location you're familiar with for realism.""",
                    "resource_url": "#baseline-template"
                }
            ],
            "resources": [
                {"title": "Baseline Survey Checklist", "file_url": "#baseline-checklist"},
                {"title": "Sample ToR Document", "file_url": "#sample-tor"}
            ]
        },
        
        # ==================== WEEK 5 ====================
        {
            "title": "Week 5: Impact Identification & Prediction",
            "description": "Learn systematic methods for identifying and predicting environmental impacts. Master impact assessment matrices and prediction techniques.",
            "lessons": [
                {
                    "title": "Impact Identification Methods",
                    "content": """<h2>Systematic Impact Identification</h2>

<p>This lesson covers various methods for systematically identifying potential environmental impacts of a proposed project.</p>

<h3>Impact Identification Methods:</h3>

<h4>1. Checklists</h4>
<ul>
    <li>Simple checklists</li>
    <li>Descriptive checklists</li>
    <li>Scaling checklists</li>
</ul>

<h4>2. Matrices</h4>
<ul>
    <li>Leopold Matrix</li>
    <li>Interaction matrices</li>
    <li>Magnitude-importance matrices</li>
</ul>

<h4>3. Networks</h4>
<ul>
    <li>Cause-effect diagrams</li>
    <li>Component interaction diagrams</li>
</ul>

<h4>4. Overlays</h4>
<ul>
    <li>GIS-based overlay analysis</li>
    <li>Sensitivity mapping</li>
</ul>

<h3>Categorizing Impacts:</h3>
<ul>
    <li><strong>Direct vs Indirect</strong></li>
    <li><strong>Short-term vs Long-term</strong></li>
    <li><strong>Reversible vs Irreversible</strong></li>
    <li><strong>Local vs Regional</strong></li>
    <li><strong>Cumulative impacts</strong></li>
</ul>""",
                    "video_url": "https://www.youtube.com/watch?v=2-B1elUAb90",
                    "duration": 960,
                    "is_free_preview": False
                },
                {
                    "title": "Impact Prediction & Significance Assessment",
                    "content": """<h2>Predicting Impact Magnitude and Significance</h2>

<p>Once impacts are identified, we need to predict their magnitude and assess their significance for decision-making.</p>

<h3>Impact Prediction Methods:</h3>
<ul>
    <li>Mathematical models</li>
    <li>Statistical extrapolation</li>
    <li>Expert judgment</li>
    <li>Analogue studies</li>
    <li>Simulation modeling</li>
</ul>

<h3>Significance Assessment Criteria:</h3>
<ul>
    <li><strong>Magnitude</strong> - Size of the impact</li>
    <li><strong>Geographic extent</strong> - Area affected</li>
    <li><strong>Duration</strong> - How long it lasts</li>
    <li><strong>Frequency</strong> - How often it occurs</li>
    <li><strong>Reversibility</strong> - Can it be undone?</li>
    <li><strong>Probability</strong> - Likelihood of occurrence</li>
    <li><strong>Sensitivity</strong> - Receptor vulnerability</li>
</ul>

<h3>Significance Ratings:</h3>
<table>
    <tr><th>Rating</th><th>Description</th></tr>
    <tr><td>Negligible</td><td>No noticeable impact</td></tr>
    <tr><td>Minor</td><td>Minimal, localized impact</td></tr>
    <tr><td>Moderate</td><td>Noticeable but manageable</td></tr>
    <tr><td>Major</td><td>Significant, requires mitigation</td></tr>
    <tr><td>Critical</td><td>Unacceptable, project modification needed</td></tr>
</table>""",
                    "video_url": "https://www.youtube.com/watch?v=SxsLjALwxfw",
                    "duration": 1080,
                    "is_free_preview": False
                }
            ],
            "assignments": [
                {
                    "title": "Week 5 Assignment: Impact Assessment Matrix",
                    "description": """Create a Leopold-style impact assessment matrix for a petrol station project.

Your matrix should:
1. List at least 10 project activities (rows)
2. List at least 15 environmental components (columns)
3. Rate magnitude (-10 to +10) and importance (1-10) for each interaction
4. Identify the top 5 significant impacts
5. Provide brief justification for your ratings

Include a summary of findings and recommendations.""",
                    "resource_url": "#matrix-template"
                }
            ],
            "resources": [
                {"title": "Leopold Matrix Template", "file_url": "#leopold-matrix"},
                {"title": "Impact Significance Criteria Guide", "file_url": "#significance-guide"}
            ]
        },
        
        # ==================== WEEK 6 ====================
        {
            "title": "Week 6: Mitigation Measures & Environmental Management Plans",
            "description": "Learn to develop effective mitigation measures and comprehensive Environmental Management Plans (EMPs) that satisfy NEMA requirements.",
            "lessons": [
                {
                    "title": "Developing Effective Mitigation Measures",
                    "content": """<h2>The Mitigation Hierarchy</h2>

<p>Mitigation is about reducing the adverse environmental impacts of a project. We follow a hierarchy of approaches.</p>

<h3>Mitigation Hierarchy:</h3>
<ol>
    <li><strong>Avoidance</strong> - Don't do the activity that causes impact</li>
    <li><strong>Minimization</strong> - Reduce the scale or intensity</li>
    <li><strong>Rectification</strong> - Repair or restore the environment</li>
    <li><strong>Reduction</strong> - Ongoing measures to lessen impact</li>
    <li><strong>Compensation</strong> - Offset unavoidable impacts</li>
</ol>

<h3>Characteristics of Good Mitigation Measures:</h3>
<ul>
    <li><strong>Specific</strong> - Clear and unambiguous</li>
    <li><strong>Measurable</strong> - Can be monitored</li>
    <li><strong>Achievable</strong> - Technically and economically feasible</li>
    <li><strong>Relevant</strong> - Addresses the identified impact</li>
    <li><strong>Time-bound</strong> - Implementation schedule defined</li>
</ul>

<h3>Examples by Phase:</h3>
<h4>Construction Phase:</h4>
<ul>
    <li>Dust suppression through water spraying</li>
    <li>Noise barriers and work hour restrictions</li>
    <li>Silt traps and erosion control</li>
    <li>Waste management facilities</li>
</ul>

<h4>Operation Phase:</h4>
<ul>
    <li>Wastewater treatment systems</li>
    <li>Air emission controls</li>
    <li>Energy efficiency measures</li>
    <li>Landscaping and revegetation</li>
</ul>""",
                    "video_url": "https://www.youtube.com/watch?v=2-B1elUAb90",
                    "duration": 1020,
                    "is_free_preview": False
                },
                {
                    "title": "Creating Environmental Management Plans (EMPs)",
                    "content": """<h2>The Environmental Management Plan</h2>

<p>An EMP is a practical document that translates EIA findings into actionable management strategies. It's often required as a condition of approval.</p>

<h3>EMP Components:</h3>
<ol>
    <li><strong>Environmental Policy</strong> - Commitment statement</li>
    <li><strong>Legal Framework</strong> - Applicable regulations</li>
    <li><strong>Roles & Responsibilities</strong> - Who does what</li>
    <li><strong>Mitigation Measures Table</strong> - Impact-mitigation-responsibility-timing</li>
    <li><strong>Monitoring Plan</strong> - What to measure, when, how</li>
    <li><strong>Training Requirements</strong> - Staff awareness</li>
    <li><strong>Emergency Response Plan</strong> - Contingency procedures</li>
    <li><strong>Reporting Requirements</strong> - Documentation</li>
</ol>

<h3>EMP Format (NEMA Preferred):</h3>
<table>
    <tr>
        <th>Impact</th>
        <th>Mitigation Measure</th>
        <th>Responsibility</th>
        <th>Timeframe</th>
        <th>Monitoring Indicator</th>
        <th>Cost (KES)</th>
    </tr>
</table>

<h3>📚 Further Reading:</h3>
<ul>
    <li>NEMA EMP Guidelines</li>
    <li>IFC Performance Standards</li>
</ul>""",
                    "video_url": "https://www.youtube.com/watch?v=m0Yv0VyxF44",
                    "duration": 960,
                    "is_free_preview": False
                }
            ],
            "assignments": [
                {
                    "title": "Week 6 Assignment: Environmental Management Plan",
                    "description": """Develop a comprehensive Environmental Management Plan for a construction project.

Your EMP should include:
1. Executive summary
2. Project description (brief)
3. Environmental policy statement
4. Organizational structure for environmental management
5. Mitigation measures table (at least 15 measures)
6. Monitoring plan with indicators
7. Emergency response procedures
8. Estimated costs for implementation

Use the NEMA-preferred table format.""",
                    "resource_url": "#emp-template"
                }
            ],
            "resources": [
                {"title": "EMP Template (Word)", "file_url": "#emp-template-doc"},
                {"title": "Sample EMP for Housing Project", "file_url": "#sample-emp"}
            ]
        },
        
        # ==================== WEEK 7 ====================
        {
            "title": "Week 7: EIA Report Writing",
            "description": "Master the art of writing professional EIA reports that get approved. Learn structure, style, and common mistakes to avoid.",
            "lessons": [
                {
                    "title": "EIA Report Structure & Writing Best Practices",
                    "content": """<h2>Writing EIA Reports That Get Approved</h2>

<p>Report writing is where all your work comes together. A well-written report communicates findings clearly and facilitates decision-making.</p>

<h3>Standard EIA Report Structure (Kenya):</h3>
<ol>
    <li><strong>Cover Page</strong> - Project title, proponent, expert details</li>
    <li><strong>Executive Summary</strong> - 2-4 pages, standalone summary</li>
    <li><strong>Table of Contents</strong></li>
    <li><strong>Introduction</strong> - Background, objectives, scope</li>
    <li><strong>Project Description</strong> - Technical details</li>
    <li><strong>Policy, Legal & Administrative Framework</strong></li>
    <li><strong>Baseline Conditions</strong> - Current environment</li>
    <li><strong>Analysis of Alternatives</strong></li>
    <li><strong>Impact Assessment</strong> - Predictions and significance</li>
    <li><strong>Mitigation Measures</strong></li>
    <li><strong>Environmental Management Plan</strong></li>
    <li><strong>Conclusion & Recommendations</strong></li>
    <li><strong>References</strong></li>
    <li><strong>Appendices</strong> - Maps, data, forms, photographs</li>
</ol>

<h3>Writing Tips:</h3>
<ul>
    <li>Use clear, simple language</li>
    <li>Be objective and evidence-based</li>
    <li>Include quality maps and photographs</li>
    <li>Properly cite all sources</li>
    <li>Number all pages, tables, and figures</li>
    <li>Proofread thoroughly</li>
</ul>""",
                    "video_url": "https://www.youtube.com/watch?v=2-B1elUAb90",
                    "duration": 1140,
                    "is_free_preview": False
                },
                {
                    "title": "Common Reasons Why EIAs Are Rejected by NEMA",
                    "content": """<h2>Avoiding EIA Rejection</h2>

<p>Understanding why EIAs get rejected helps you avoid common pitfalls. Learn from others' mistakes!</p>

<h3>Top Reasons for EIA Rejection:</h3>

<h4>1. Incomplete Documentation</h4>
<ul>
    <li>Missing land ownership documents</li>
    <li>Incomplete application forms</li>
    <li>Missing expert registration certificate</li>
</ul>

<h4>2. Poor Report Quality</h4>
<ul>
    <li>Copy-paste from other reports</li>
    <li>Generic content not specific to project</li>
    <li>Poor grammar and formatting</li>
    <li>Missing or low-quality maps</li>
</ul>

<h4>3. Inadequate Baseline Data</h4>
<ul>
    <li>No site-specific data collection</li>
    <li>Outdated secondary data</li>
    <li>Missing key environmental parameters</li>
</ul>

<h4>4. Weak Impact Assessment</h4>
<ul>
    <li>Impacts not linked to project activities</li>
    <li>No significance assessment</li>
    <li>Missing cumulative impacts</li>
</ul>

<h4>5. Poor Public Participation</h4>
<ul>
    <li>Inadequate stakeholder engagement</li>
    <li>Missing attendance lists</li>
    <li>Issues raised not addressed in report</li>
</ul>

<h4>6. Unrealistic Mitigation Measures</h4>
<ul>
    <li>Generic measures not tailored to project</li>
    <li>Technically or economically unfeasible</li>
    <li>No monitoring provisions</li>
</ul>

<h3>📚 Further Reading:</h3>
<ul>
    <li>NEMA EIA Review Criteria</li>
    <li>Case Studies of Rejected EIAs</li>
</ul>""",
                    "video_url": "https://www.youtube.com/watch?v=5-6Fhbv-HIg",
                    "duration": 900,
                    "is_free_preview": False
                }
            ],
            "assignments": [
                {
                    "title": "Week 7 Assignment: Executive Summary Writing",
                    "description": """Write a professional Executive Summary for a hypothetical EIA project.

Choose one project type:
- A) 50-unit apartment complex in Nairobi suburbs
- B) Petrol station in Nakuru town center
- C) Flower farm in Naivasha

Your executive summary should:
1. Be 2-3 pages maximum
2. Include project description
3. Summarize key baseline conditions
4. Highlight major impacts (positive and negative)
5. Present key mitigation measures
6. Provide overall conclusion

Use professional formatting and language.""",
                    "resource_url": "#executive-summary-guide"
                }
            ],
            "resources": [
                {"title": "EIA Report Template", "file_url": "#report-template"},
                {"title": "NEMA Submission Checklist", "file_url": "#submission-checklist"}
            ]
        },
        
        # ==================== WEEK 8 ====================
        {
            "title": "Week 8: Public Participation & Stakeholder Engagement",
            "description": "Learn effective techniques for stakeholder identification, engagement, and incorporating public input into your EIA reports.",
            "lessons": [
                {
                    "title": "Stakeholder Identification & Mapping",
                    "content": """<h2>Who Are Your Stakeholders?</h2>

<p>Public participation is a legal requirement for EIA in Kenya. Effective stakeholder engagement leads to better projects and smoother approvals.</p>

<h3>Types of Stakeholders:</h3>

<h4>Primary Stakeholders (Directly Affected):</h4>
<ul>
    <li>Adjacent landowners</li>
    <li>Local community members</li>
    <li>Project-affected persons (PAPs)</li>
    <li>Indigenous peoples (if applicable)</li>
</ul>

<h4>Secondary Stakeholders (Indirectly Affected):</h4>
<ul>
    <li>Local businesses</li>
    <li>NGOs and CBOs</li>
    <li>Interest groups</li>
    <li>General public</li>
</ul>

<h4>Institutional Stakeholders:</h4>
<ul>
    <li>County government (Governor's office, County Environment Committee)</li>
    <li>National government (NEMA, Lead Agencies)</li>
    <li>Chiefs and sub-chiefs</li>
    <li>Ward administrators</li>
</ul>

<h3>Stakeholder Analysis Matrix:</h3>
<table>
    <tr>
        <th>Stakeholder</th>
        <th>Interest</th>
        <th>Influence</th>
        <th>Engagement Strategy</th>
    </tr>
</table>""",
                    "video_url": "https://www.youtube.com/watch?v=SxsLjALwxfw",
                    "duration": 840,
                    "is_free_preview": False
                },
                {
                    "title": "Conducting Effective Public Consultations",
                    "content": """<h2>Public Consultation Methods</h2>

<p>Different contexts require different engagement approaches. Learn which methods work best for different stakeholder groups.</p>

<h3>Consultation Methods:</h3>

<h4>1. Public Barazas (Community Meetings)</h4>
<ul>
    <li>Open meetings at chief's camp or community center</li>
    <li>Present project in local language</li>
    <li>Allow for questions and concerns</li>
    <li>Document attendance and issues raised</li>
</ul>

<h4>2. Key Informant Interviews</h4>
<ul>
    <li>One-on-one with local leaders</li>
    <li>Technical experts consultation</li>
    <li>NGO and CBO representatives</li>
</ul>

<h4>3. Questionnaire Surveys</h4>
<ul>
    <li>Household surveys for socio-economic data</li>
    <li>Opinion surveys on project perception</li>
</ul>

<h4>4. Focus Group Discussions</h4>
<ul>
    <li>Women's groups</li>
    <li>Youth groups</li>
    <li>Special interest groups</li>
</ul>

<h3>Documentation Requirements:</h3>
<ul>
    <li>Attendance lists (signed)</li>
    <li>Meeting minutes</li>
    <li>Photographs of meetings</li>
    <li>Issues-response matrix</li>
    <li>Evidence of advertisement (newspaper, notice board)</li>
</ul>

<h3>📚 Further Reading:</h3>
<ul>
    <li>IFC Stakeholder Engagement Good Practice Handbook</li>
</ul>""",
                    "video_url": "https://www.youtube.com/watch?v=m0Yv0VyxF44",
                    "duration": 960,
                    "is_free_preview": False
                }
            ],
            "assignments": [
                {
                    "title": "Week 8 Assignment: Stakeholder Engagement Plan",
                    "description": """Develop a comprehensive Stakeholder Engagement Plan for an EIA project.

Your plan should include:
1. Stakeholder identification and mapping (use matrix format)
2. Engagement objectives for each stakeholder group
3. Methods to be used (barazas, interviews, surveys, etc.)
4. Timeline of engagement activities
5. Budget estimate
6. Documentation plan
7. Issues-response framework

Include sample invitation letter and attendance register templates.""",
                    "resource_url": "#engagement-plan-template"
                }
            ],
            "resources": [
                {"title": "Stakeholder Register Template", "file_url": "#stakeholder-template"},
                {"title": "Public Meeting Minutes Template", "file_url": "#minutes-template"},
                {"title": "Issues-Response Matrix Template", "file_url": "#issues-matrix"}
            ]
        },
        
        # ==================== WEEK 9 ====================
        {
            "title": "Week 9: Professional Practice & Client Management",
            "description": "Navigate the business side of EIA consulting - handling difficult clients, non-compliance issues, and professional ethics.",
            "lessons": [
                {
                    "title": "How I Handle Non-Compliant Clients as an EIA Expert",
                    "content": """<h2>Dealing with Difficult Clients</h2>

<p>Not all clients understand or appreciate environmental compliance. Learn how to handle challenging situations professionally.</p>

<h3>Common Client Issues:</h3>

<h4>1. Clients Who Want to Cut Corners</h4>
<ul>
    <li>"Can you just do a quick report?"</li>
    <li>"Do we really need all that data?"</li>
    <li>"Can you skip the public meetings?"</li>
</ul>
<p><strong>Response:</strong> Explain legal requirements and consequences of non-compliance</p>

<h4>2. Clients Already Building Without EIA</h4>
<ul>
    <li>Project already under construction</li>
    <li>May face stoppage orders</li>
    <li>Need retrospective assessment</li>
</ul>
<p><strong>Response:</strong> Advise on regularization process, be honest about risks</p>

<h4>3. Clients Who Want Favorable Reports</h4>
<ul>
    <li>Pressure to downplay impacts</li>
    <li>Request to remove negative findings</li>
</ul>
<p><strong>Response:</strong> Maintain integrity - your license depends on honest work</p>

<h3>Professional Ethics:</h3>
<ul>
    <li>Always maintain objectivity</li>
    <li>Never falsify data or findings</li>
    <li>Declare conflicts of interest</li>
    <li>Maintain confidentiality appropriately</li>
    <li>Keep professional indemnity insurance</li>
</ul>

<h3>When to Walk Away:</h3>
<ul>
    <li>Client insists on falsifying reports</li>
    <li>Project is clearly illegal</li>
    <li>Payment not forthcoming after agreement</li>
</ul>""",
                    "video_url": "https://www.youtube.com/watch?v=XI-TxMFa81I",
                    "duration": 1020,
                    "is_free_preview": False
                },
                {
                    "title": "Business & Pricing for EIA Consultants",
                    "content": """<h2>The Business of EIA Consulting</h2>

<p>Beyond technical skills, successful EIA practice requires business acumen. Learn pricing, proposals, and client relationships.</p>

<h3>Pricing Your Services:</h3>

<h4>Factors Affecting Price:</h4>
<ul>
    <li>Project type and complexity</li>
    <li>Geographic location</li>
    <li>Required specialist studies</li>
    <li>Timeline urgency</li>
    <li>Number of public meetings needed</li>
</ul>

<h4>Typical Price Ranges (Kenya, 2026):</h4>
<ul>
    <li>Simple projects (shops, houses): KES 80,000 - 150,000</li>
    <li>Medium projects (apartments, factories): KES 200,000 - 500,000</li>
    <li>Large projects (infrastructure, mining): KES 1,000,000+</li>
</ul>

<h3>Proposal Writing:</h3>
<ul>
    <li>Understand client needs</li>
    <li>Scope of work clearly defined</li>
    <li>Timeline with milestones</li>
    <li>Deliverables specified</li>
    <li>Payment terms (avoid 100% upfront)</li>
</ul>

<h3>Contract Essentials:</h3>
<ul>
    <li>Scope of work</li>
    <li>Fee and payment schedule</li>
    <li>Client responsibilities</li>
    <li>Deliverables and timelines</li>
    <li>Dispute resolution</li>
    <li>Professional liability limitations</li>
</ul>""",
                    "video_url": "https://www.youtube.com/watch?v=2-B1elUAb90",
                    "duration": 900,
                    "is_free_preview": False
                }
            ],
            "assignments": [
                {
                    "title": "Week 9 Assignment: Proposal Writing",
                    "description": """Write a professional proposal for an EIA project.

Scenario: A client wants to build a 100-room hotel on 2 acres along the Kenyan coast (Mombasa).

Your proposal should include:
1. Cover letter
2. Understanding of the project
3. Technical approach and methodology
4. Work plan and timeline
5. Team composition
6. Deliverables
7. Fee proposal (itemized)
8. Payment terms
9. Company profile (fictitious is okay)

Make it professional and ready to submit.""",
                    "resource_url": "#proposal-template"
                }
            ],
            "resources": [
                {"title": "Sample EIA Proposal", "file_url": "#sample-proposal"},
                {"title": "Contract Template", "file_url": "#contract-template"}
            ]
        },
        
        # ==================== WEEK 10 ====================
        {
            "title": "Week 10: Career Development & NEMA Registration",
            "description": "Final week focusing on career growth, obtaining NEMA registration, continuing education, and building your professional network.",
            "lessons": [
                {
                    "title": "NEMA Registration Process for EIA Experts",
                    "content": """<h2>Becoming a Registered EIA Expert</h2>

<p>Registration with NEMA is required to practice as an EIA expert in Kenya. This lesson walks you through the process.</p>

<h3>Categories of Registration:</h3>

<h4>1. Lead Expert</h4>
<ul>
    <li>Can lead and sign off on EIA reports</li>
    <li>Requires: Postgraduate degree in environmental field + experience</li>
    <li>Must supervise Associate Experts</li>
</ul>

<h4>2. Associate Expert</h4>
<ul>
    <li>Can conduct EIAs under Lead Expert supervision</li>
    <li>Requires: Bachelor's degree in relevant field</li>
    <li>Entry point for new graduates</li>
</ul>

<h3>Registration Requirements:</h3>
<ul>
    <li>Application form from NEMA</li>
    <li>Academic certificates (certified)</li>
    <li>Professional certificates</li>
    <li>CV detailing environmental experience</li>
    <li>Two passport photos</li>
    <li>National ID copy</li>
    <li>Registration fee (current rates on NEMA website)</li>
</ul>

<h3>Maintaining Your License:</h3>
<ul>
    <li>Annual renewal</li>
    <li>Continuing professional development</li>
    <li>Adherence to code of conduct</li>
    <li>Professional indemnity insurance recommended</li>
</ul>

<h3>📚 Further Reading:</h3>
<ul>
    <li><a href="https://www.nema.go.ke" target="_blank">NEMA Expert Registration Portal</a></li>
</ul>""",
                    "video_url": "https://www.youtube.com/watch?v=XI-TxMFa81I",
                    "duration": 900,
                    "is_free_preview": False
                },
                {
                    "title": "Building Your EIA Career & Next Steps",
                    "content": """<h2>Your Journey Forward</h2>

<p>Congratulations on completing the EIA Master Class! Here's how to continue growing in your career.</p>

<h3>Career Pathways:</h3>

<h4>1. Independent Consultant</h4>
<ul>
    <li>Register your consultancy firm</li>
    <li>Build client base through networking</li>
    <li>Specialize in specific sectors (mining, real estate, etc.)</li>
</ul>

<h4>2. Employment</h4>
<ul>
    <li>Environmental consultancy firms</li>
    <li>Government agencies (NEMA, Counties)</li>
    <li>Corporate environmental departments</li>
    <li>NGOs and international organizations</li>
</ul>

<h4>3. Academia & Research</h4>
<ul>
    <li>University teaching</li>
    <li>Research institutions</li>
</ul>

<h3>Building Your Network:</h3>
<ul>
    <li>Join Environment Institute of Kenya (EIK)</li>
    <li>Attend environmental conferences</li>
    <li>Connect with peers on LinkedIn</li>
    <li>Participate in NEMA consultative forums</li>
</ul>

<h3>Continuous Learning:</h3>
<ul>
    <li>GIS for environmental mapping</li>
    <li>Environmental auditing (EA)</li>
    <li>Strategic Environmental Assessment (SEA)</li>
    <li>Climate change assessment</li>
    <li>Biodiversity assessment</li>
</ul>

<h3>Action Items:</h3>
<ol>
    <li>Complete NEMA registration (if not already)</li>
    <li>Build portfolio with practice reports</li>
    <li>Join professional associations</li>
    <li>Start networking - attend your first event this month</li>
    <li>Consider specialization areas</li>
</ol>

<p><strong>Thank you for completing this course! Good luck in your EIA career!</strong></p>""",
                    "video_url": "https://www.youtube.com/watch?v=5-6Fhbv-HIg",
                    "duration": 720,
                    "is_free_preview": False
                }
            ],
            "assignments": [
                {
                    "title": "Week 10 Final Assignment: Career Development Plan",
                    "description": """Create a personal career development plan for the next 12 months.

Your plan should include:
1. Current status assessment (skills, qualifications, experience)
2. Career goals (short-term and long-term)
3. NEMA registration plan (timeline, requirements to obtain)
4. Skills gap analysis
5. Learning and development plan
6. Networking strategy
7. Portfolio building strategy (types of projects to pursue)
8. Financial targets

Be specific with timelines and actionable steps.

This is your roadmap - make it personal and realistic!""",
                    "resource_url": "#career-plan-template"
                }
            ],
            "resources": [
                {"title": "NEMA Registration Forms", "file_url": "https://www.nema.go.ke"},
                {"title": "EIA Expert Code of Conduct", "file_url": "#code-of-conduct"},
                {"title": "Professional Associations List", "file_url": "#associations"}
            ]
        }
    ]

    # Find or create the course
    try:
        course = Course.objects.get(slug="eia-mentorship-mastermind")
        print(f"Found existing course: {course.title}")
        # Clear existing modules
        course.modules.all().delete()
        print("Cleared existing modules")
    except Course.DoesNotExist:
        course = Course.objects.create(**{k: v for k, v in course_data.items() if k != 'slug'})
        course.slug = "eia-mentorship-mastermind"
        course.save()
        print(f"Created new course: {course.title}")

    # Update course fields
    for key, value in course_data.items():
        setattr(course, key, value)
    course.save()
    print(f"Updated course: {course.title}")
    
    # Create Modules, Lessons, Assignments, and Resources
    for m_idx, m_data in enumerate(modules_data):
        lessons_data = m_data.pop('lessons', [])
        assignments_data = m_data.pop('assignments', [])
        resources_data = m_data.pop('resources', [])
        
        module = Module.objects.create(
            course=course,
            order=m_idx,
            title=m_data['title'],
            description=m_data['description']
        )
        print(f"  Created module: {module.title}")
        
        # Create Lessons
        for l_idx, l_data in enumerate(lessons_data):
            lesson = Lesson.objects.create(
                module=module,
                order=l_idx,
                title=l_data.get('title', ''),
                content=l_data.get('content', ''),
                video_url=l_data.get('video_url', ''),
                duration=l_data.get('duration', 600),
                is_free_preview=l_data.get('is_free_preview', False)
            )
            print(f"    Created lesson: {lesson.title}")
        
        # Create Assignments
        for a_data in assignments_data:
            assignment = Assignment.objects.create(
                module=module,
                title=a_data.get('title', ''),
                description=a_data.get('description', ''),
                resource_url=a_data.get('resource_url', '')
            )
            print(f"    Created assignment: {assignment.title}")
        
        # Create Resources
        for r_data in resources_data:
            resource = Resource.objects.create(
                module=module,
                title=r_data.get('title', ''),
                file_url=r_data.get('file_url', '')
            )
            print(f"    Created resource: {resource.title}")

    print("\n✅ EIA Master Class seeding completed successfully!")
    print(f"Total modules: {course.modules.count()}")
    total_lessons = sum(m.lessons.count() for m in course.modules.all())
    print(f"Total lessons: {total_lessons}")

if __name__ == '__main__':
    seed_eia_masterclass()
