from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from posts.models import Post


class Command(BaseCommand):
    help = 'Seed the database with sample blog posts about environmental topics'

    def handle(self, *args, **options):
        User = get_user_model()
        
        # Get or create an admin user to be the author
        admin_user = User.objects.filter(is_staff=True).first()
        if not admin_user:
            admin_user = User.objects.first()
        
        if not admin_user:
            self.stdout.write(self.style.ERROR('No users found. Please create a user first.'))
            return

        posts_data = [
            {
                'title': 'Understanding Environmental Impact Assessments: A Complete Guide',
                'category': 'Environmental Assessment',
                'content': '''<h2>What is an Environmental Impact Assessment?</h2>
<p>An Environmental Impact Assessment (EIA) is a systematic process used to evaluate the potential environmental consequences of a proposed project or development before it begins. This critical tool helps decision-makers understand both positive and negative environmental effects.</p>

<h3>Why EIAs Matter</h3>
<p>EIAs serve multiple important purposes in sustainable development:</p>
<ul>
<li><strong>Prevention:</strong> Identifying potential environmental problems before they occur</li>
<li><strong>Informed Decision Making:</strong> Providing stakeholders with comprehensive environmental data</li>
<li><strong>Public Participation:</strong> Ensuring communities have a voice in development decisions</li>
<li><strong>Sustainable Development:</strong> Balancing economic growth with environmental protection</li>
</ul>

<h3>The EIA Process</h3>
<p>The typical EIA process includes several key stages:</p>
<ol>
<li>Screening - Determining if an EIA is required</li>
<li>Scoping - Identifying key issues to be studied</li>
<li>Impact Analysis - Predicting and evaluating effects</li>
<li>Mitigation - Proposing measures to reduce negative impacts</li>
<li>Reporting - Documenting findings in an Environmental Impact Statement</li>
<li>Review - Public and regulatory review of the report</li>
<li>Decision Making - Authority decision based on EIA findings</li>
<li>Monitoring - Post-decision tracking of actual impacts</li>
</ol>

<p>Understanding and properly conducting EIAs is essential for anyone involved in project development, urban planning, or environmental management.</p>''',
                'image': 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=800',
            },
            {
                'title': 'Climate Change Mitigation Strategies for Businesses',
                'category': 'Climate Action',
                'content': '''<h2>Taking Action Against Climate Change</h2>
<p>Businesses play a crucial role in addressing climate change. With the corporate sector responsible for a significant portion of global greenhouse gas emissions, implementing effective mitigation strategies is not just an environmental imperative—it's a business necessity.</p>

<h3>Key Mitigation Strategies</h3>

<h4>1. Energy Efficiency</h4>
<p>Improving energy efficiency is often the most cost-effective way to reduce emissions. This includes:</p>
<ul>
<li>Upgrading to LED lighting and smart building systems</li>
<li>Implementing energy management systems</li>
<li>Regular equipment maintenance and optimization</li>
</ul>

<h4>2. Renewable Energy Transition</h4>
<p>Transitioning to renewable energy sources such as solar, wind, and hydropower can dramatically reduce a company's carbon footprint. Many businesses are now committing to 100% renewable energy goals.</p>

<h4>3. Supply Chain Optimization</h4>
<p>Working with suppliers to reduce emissions throughout the value chain is essential for comprehensive climate action. This includes:</p>
<ul>
<li>Supplier engagement programs</li>
<li>Sustainable procurement policies</li>
<li>Local sourcing when possible</li>
</ul>

<h4>4. Carbon Offsetting</h4>
<p>While not a substitute for direct emission reductions, carbon offsetting through verified projects can help businesses address residual emissions.</p>

<h3>The Business Case for Climate Action</h3>
<p>Beyond environmental benefits, climate mitigation strategies often deliver significant business value through reduced operating costs, enhanced brand reputation, and improved resilience to climate-related risks.</p>''',
                'image': 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=800',
            },
            {
                'title': 'Biodiversity Conservation: Protecting Our Natural Heritage',
                'category': 'Conservation',
                'content': '''<h2>The Importance of Biodiversity</h2>
<p>Biodiversity—the variety of life on Earth—is essential for healthy ecosystems and human well-being. From the air we breathe to the food we eat, biodiversity underpins the natural systems that sustain us.</p>

<h3>Current Challenges</h3>
<p>Global biodiversity is declining at an unprecedented rate. Key threats include:</p>
<ul>
<li><strong>Habitat Loss:</strong> Deforestation, urbanization, and agricultural expansion</li>
<li><strong>Climate Change:</strong> Shifting temperatures and weather patterns</li>
<li><strong>Pollution:</strong> Chemical contamination of air, water, and soil</li>
<li><strong>Overexploitation:</strong> Unsustainable harvesting of species</li>
<li><strong>Invasive Species:</strong> Non-native species disrupting ecosystems</li>
</ul>

<h3>Conservation Strategies</h3>

<h4>Protected Areas</h4>
<p>Establishing and effectively managing protected areas remains one of the most important conservation tools. This includes national parks, wildlife reserves, and marine protected areas.</p>

<h4>Ecosystem Restoration</h4>
<p>Restoring degraded ecosystems can help recover biodiversity. The UN Decade on Ecosystem Restoration (2021-2030) highlights the global commitment to this approach.</p>

<h4>Sustainable Use</h4>
<p>Ensuring that natural resources are used sustainably allows communities to benefit from biodiversity while maintaining it for future generations.</p>

<h4>Community Engagement</h4>
<p>Local communities are often the best stewards of biodiversity. Supporting community-based conservation initiatives is essential for long-term success.</p>

<p>Everyone can contribute to biodiversity conservation through conscious consumption choices, supporting conservation organizations, and advocating for strong environmental policies.</p>''',
                'image': 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800',
            },
            {
                'title': 'Sustainable Water Management in Urban Areas',
                'category': 'Water Resources',
                'content': '''<h2>The Urban Water Challenge</h2>
<p>As urban populations grow, cities face increasing pressure on water resources. Sustainable water management is essential for ensuring reliable water supplies while protecting aquatic ecosystems.</p>

<h3>Integrated Urban Water Management</h3>
<p>Modern approaches to urban water management consider the entire water cycle, including:</p>
<ul>
<li>Water supply and distribution</li>
<li>Wastewater collection and treatment</li>
<li>Stormwater management</li>
<li>Water conservation and efficiency</li>
</ul>

<h3>Green Infrastructure Solutions</h3>
<p>Green infrastructure offers multiple benefits for urban water management:</p>

<h4>Rain Gardens and Bioswales</h4>
<p>These landscape features capture and filter stormwater runoff, reducing flooding and improving water quality.</p>

<h4>Green Roofs</h4>
<p>Vegetated roofs absorb rainfall, reduce runoff, and provide insulation benefits.</p>

<h4>Permeable Pavements</h4>
<p>Allowing water to infiltrate through surfaces helps recharge groundwater and reduce runoff.</p>

<h3>Water Conservation Strategies</h3>
<p>Reducing water demand is often more cost-effective than developing new supplies:</p>
<ul>
<li>Water-efficient fixtures and appliances</li>
<li>Leak detection and repair programs</li>
<li>Tiered pricing to encourage conservation</li>
<li>Public education and awareness campaigns</li>
</ul>

<h3>Water Reuse and Recycling</h3>
<p>Treating and reusing wastewater can significantly extend water supplies. Applications include irrigation, industrial processes, and even potable reuse with advanced treatment.</p>''',
                'image': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800',
            },
            {
                'title': 'Circular Economy: Rethinking Waste as a Resource',
                'category': 'Sustainability',
                'content': '''<h2>From Linear to Circular</h2>
<p>The traditional "take-make-dispose" economic model is unsustainable. The circular economy offers an alternative approach that keeps materials in use, designs out waste, and regenerates natural systems.</p>

<h3>Principles of Circular Economy</h3>

<h4>1. Design Out Waste and Pollution</h4>
<p>Products should be designed for longevity, repair, and eventual recycling. This requires thinking about end-of-life from the beginning of the design process.</p>

<h4>2. Keep Products and Materials in Use</h4>
<p>Strategies include:</p>
<ul>
<li>Product-as-a-service models</li>
<li>Sharing platforms</li>
<li>Repair and refurbishment services</li>
<li>Remanufacturing</li>
<li>Recycling and upcycling</li>
</ul>

<h4>3. Regenerate Natural Systems</h4>
<p>The circular economy aims to return valuable nutrients to the soil and other ecosystems, supporting natural processes rather than degrading them.</p>

<h3>Business Opportunities</h3>
<p>The circular economy creates significant business opportunities:</p>
<ul>
<li><strong>New Revenue Streams:</strong> From repair services, remanufacturing, and material recovery</li>
<li><strong>Cost Savings:</strong> Through material efficiency and waste reduction</li>
<li><strong>Customer Loyalty:</strong> By offering sustainable products and services</li>
<li><strong>Risk Mitigation:</strong> By reducing dependence on virgin materials</li>
</ul>

<h3>Getting Started</h3>
<p>Organizations can begin their circular economy journey by:</p>
<ol>
<li>Mapping material flows and identifying waste streams</li>
<li>Exploring partnerships for material recovery and recycling</li>
<li>Redesigning products for circularity</li>
<li>Engaging customers in take-back and recycling programs</li>
</ol>''',
                'image': 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800',
            },
            {
                'title': 'Environmental Compliance: Navigating Regulations',
                'category': 'Compliance',
                'content': '''<h2>Understanding Environmental Regulations</h2>
<p>Environmental compliance is essential for businesses operating in today's regulatory environment. Understanding and meeting regulatory requirements protects both the environment and your organization from legal and financial risks.</p>

<h3>Key Regulatory Areas</h3>

<h4>Air Quality</h4>
<p>Regulations governing air emissions include permits for stationary sources, emissions limits for specific pollutants, and reporting requirements.</p>

<h4>Water Quality</h4>
<p>Water regulations cover discharge permits, stormwater management, and protection of water bodies and groundwater.</p>

<h4>Waste Management</h4>
<p>Proper handling, storage, transportation, and disposal of both hazardous and non-hazardous waste is regulated at multiple levels.</p>

<h4>Chemical Management</h4>
<p>Regulations require proper storage, labeling, and handling of chemicals, as well as reporting of chemical inventories and releases.</p>

<h3>Building a Compliance Program</h3>

<h4>1. Know Your Requirements</h4>
<p>Identify all applicable federal, state, and local regulations. Consider industry-specific requirements and any voluntary commitments.</p>

<h4>2. Assign Responsibility</h4>
<p>Designate environmental compliance responsibilities and ensure adequate resources and authority.</p>

<h4>3. Develop Procedures</h4>
<p>Create documented procedures for meeting compliance requirements, including monitoring, record-keeping, and reporting.</p>

<h4>4. Train Personnel</h4>
<p>Ensure all relevant staff understand their compliance responsibilities and how to fulfill them.</p>

<h4>5. Monitor and Audit</h4>
<p>Regular monitoring and periodic audits help identify and correct compliance gaps before they become violations.</p>

<h4>6. Continuous Improvement</h4>
<p>Use compliance data and audit findings to drive ongoing improvement in environmental performance.</p>''',
                'image': 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800',
            },
            {
                'title': 'Renewable Energy Technologies: Current Trends and Future Outlook',
                'category': 'Renewable Energy',
                'content': '''<h2>The Renewable Energy Revolution</h2>
<p>Renewable energy is transforming the global energy landscape. Driven by falling costs, technological improvements, and climate commitments, renewables are now the fastest-growing source of electricity generation worldwide.</p>

<h3>Solar Power</h3>
<p>Solar photovoltaic (PV) technology has seen dramatic cost reductions—over 90% in the past decade. Key developments include:</p>
<ul>
<li>Higher efficiency solar cells</li>
<li>Building-integrated photovoltaics (BIPV)</li>
<li>Floating solar installations</li>
<li>Solar-plus-storage systems</li>
</ul>

<h3>Wind Energy</h3>
<p>Wind power continues to grow, with larger and more efficient turbines being deployed:</p>
<ul>
<li>Offshore wind farms accessing stronger, more consistent winds</li>
<li>Taller towers and longer blades increasing capacity factors</li>
<li>Hybrid wind-solar projects maximizing land use</li>
</ul>

<h3>Energy Storage</h3>
<p>Storage is the key enabler for high renewable penetration. Technologies include:</p>
<ul>
<li>Lithium-ion batteries (rapidly declining costs)</li>
<li>Flow batteries for longer duration storage</li>
<li>Pumped hydro storage</li>
<li>Green hydrogen production and storage</li>
</ul>

<h3>Emerging Technologies</h3>
<p>Several promising technologies are advancing toward commercial viability:</p>
<ul>
<li><strong>Floating Offshore Wind:</strong> Accessing deep-water wind resources</li>
<li><strong>Perovskite Solar Cells:</strong> Potentially cheaper and more versatile</li>
<li><strong>Green Hydrogen:</strong> For hard-to-decarbonize sectors</li>
<li><strong>Enhanced Geothermal:</strong> Expanding geothermal potential beyond traditional areas</li>
</ul>

<h3>The Path Forward</h3>
<p>Continued growth in renewable energy requires supportive policies, grid modernization, and workforce development. The transition to clean energy represents one of the greatest economic opportunities of our time.</p>''',
                'image': 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
            },
            {
                'title': 'Corporate Sustainability Reporting: Best Practices',
                'category': 'Sustainability',
                'content': '''<h2>Why Sustainability Reporting Matters</h2>
<p>Sustainability reporting has evolved from a voluntary practice to a business imperative. Stakeholders—including investors, customers, employees, and regulators—increasingly demand transparency on environmental, social, and governance (ESG) performance.</p>

<h3>Key Reporting Frameworks</h3>

<h4>Global Reporting Initiative (GRI)</h4>
<p>GRI Standards provide the most widely used framework for sustainability reporting, covering a comprehensive range of topics.</p>

<h4>SASB Standards</h4>
<p>The Sustainability Accounting Standards Board focuses on financially material sustainability information for investors.</p>

<h4>Task Force on Climate-related Financial Disclosures (TCFD)</h4>
<p>TCFD recommendations help organizations disclose climate-related risks and opportunities.</p>

<h4>CDP (formerly Carbon Disclosure Project)</h4>
<p>CDP provides a global system for companies to measure and disclose environmental impacts.</p>

<h3>Best Practices for Reporting</h3>

<h4>1. Materiality Assessment</h4>
<p>Identify the most significant sustainability topics for your organization and stakeholders. Focus your reporting on these material issues.</p>

<h4>2. Stakeholder Engagement</h4>
<p>Engage with key stakeholders to understand their information needs and incorporate their perspectives.</p>

<h4>3. Data Quality</h4>
<p>Ensure robust data collection, management, and verification processes. Consider third-party assurance for credibility.</p>

<h4>4. Clear Communication</h4>
<p>Present information clearly and accessibly. Use visuals, case studies, and concrete examples to bring data to life.</p>

<h4>5. Balance and Transparency</h4>
<p>Report both achievements and challenges. Acknowledge areas for improvement and describe your plans to address them.</p>

<h4>6. Integration</h4>
<p>Connect sustainability performance to business strategy and financial outcomes. Consider integrated reporting approaches.</p>''',
                'image': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
            },
        ]

        created_count = 0
        for post_data in posts_data:
            post, created = Post.objects.get_or_create(
                title=post_data['title'],
                defaults={
                    'content': post_data['content'],
                    'category': post_data['category'],
                    'image': post_data['image'],
                    'user': admin_user,
                }
            )
            if created:
                created_count += 1
                self.stdout.write(f'  Created: {post.title}')
            else:
                self.stdout.write(f'  Already exists: {post.title}')

        self.stdout.write(self.style.SUCCESS(f'\nSuccessfully seeded {created_count} new posts (Total: {Post.objects.count()})'))
