"""
Django management command to seed blog posts into the database.

Usage:
    python manage.py seed_blog_posts
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from posts.models import Post, Category

User = get_user_model()


class Command(BaseCommand):
    help = "Seed 5 blog posts about environmental topics in Kenya"

    def handle(self, *args, **options):
        # Get or create admin user
        admin_user = User.objects.filter(user_type="admin").first()
        if not admin_user:
            admin_user = User.objects.filter(is_superuser=True).first()
        if not admin_user:
            self.stdout.write(
                self.style.ERROR(
                    "No admin user found. Please create an admin user first."
                )
            )
            return

        # Get or create categories
        category_pollution, _ = Category.objects.get_or_create(
            name="Pollution",
            defaults={"emoji": "🌍", "order": 1},
        )
        category_regulation, _ = Category.objects.get_or_create(
            name="Regulation",
            defaults={"emoji": "⚖️", "order": 2},
        )
        category_forestry, _ = Category.objects.get_or_create(
            name="Forestry",
            defaults={"emoji": "🌲", "order": 3},
        )
        category_encroachment, _ = Category.objects.get_or_create(
            name="Encroachment",
            defaults={"emoji": "🏗️", "order": 4},
        )
        category_governance, _ = Category.objects.get_or_create(
            name="Governance",
            defaults={"emoji": "🏛️", "order": 5},
        )

        # Blog posts data
        posts_data = [
            {
                "title": "Nairobi River: From Lifeline to Sewer – Can We Reverse the Tide of Pollution?",
                "content": """<p>If you walk along the banks of the Nairobi River today, your senses are immediately overwhelmed. The pungent smell of raw sewage, the sight of plastic bottles bobbing on a dark, sluggish current, and the industrial effluent emptying into the water paint a grim picture. Once a clean source of water for the city's early inhabitants, the Nairobi River is now a symbol of Kenya's escalating pollution crisis.</p>

<p>But the problem extends far beyond the capital. In Lake Victoria, water hyacinth thrives on agricultural runoff and untreated wastewater, choking aquatic life and crippling local fishing economies. In Mombasa, plastic waste litters the beaches, threatening marine biodiversity and the tourism sector that drives the coastal economy.</p>

<h3>The Cost of Pollution</h3>

<p>Pollution in Kenya is not just an environmental issue; it is a public health and economic emergency. According to the Ministry of Environment, respiratory diseases linked to poor air and water quality cost the country billions of shillings annually in healthcare and lost productivity.</p>

<h3>A Way Forward</h3>

<p>Kenya took a bold step in 2017 by banning single-use plastics, a move that was lauded globally. However, enforcement remains a challenge. To reverse the tide of pollution, we need a multi-pronged approach:</p>

<ol>
<li><strong>Stricter Industrial Compliance:</strong> Factories that discharge effluent into water bodies must face severe penalties, not just slap-on-the-wrist fines.</li>
<li><strong>Circular Economy:</strong> We must shift from a "take-make-dispose" model to one where waste is recycled or repurposed.</li>
<li><strong>Community Action:</strong> Grassroots movements like clean-up drives are vital, but they must be backed by municipal waste management systems that actually work.</li>
</ol>

<p>The Nairobi River can flow clear again, but only if we treat pollution as a crime against nature and humanity, rather than an unavoidable byproduct of development.</p>""",
                "image": "https://images.unsplash.com/photo-1584339440033-8f9cd98ebf1a?w=1920&q=80",
                "og_image": "https://images.unsplash.com/photo-1589519160732-57fc498494f8?w=1200&q=80",
                "category_fk": category_pollution,
            },
            {
                "title": "NEMA and the Tightrope: Balancing Kenya's Development with Environmental Regulation",
                "content": """<p>Kenya is experiencing an infrastructure boom. From the Standard Gauge Railway (SGR) to the multi-billion-shilling Affordable Housing Programme, the skyline is changing rapidly. But behind every crane and concrete mixer lies a critical question: at what cost to our environment?</p>

<p>Enter the National Environment Management Authority (NEMA), the body tasked with overseeing Environmental Impact Assessments (EIAs) and enforcing environmental regulations in Kenya. NEMA often finds itself walking a tightrope between driving national development and protecting fragile ecosystems.</p>

<h3>The EIA Dilemma</h3>

<p>In theory, an EIA ensures that before a project begins, its environmental risks are identified and mitigated. In practice, the process has often been mired in controversy. Critics argue that some EIAs are mere formalities—rubber-stamp exercises conducted by compromised experts who prioritize developer interests over ecological safety.</p>

<p>Furthermore, public participation, a legal requirement in the EIA process, is frequently reduced to a box-ticking exercise. Local communities—who bear the brunt of environmental degradation—are often sidelined, unaware of the impacts until the bulldozers arrive.</p>

<h3>Strengthening the Regulator</h3>

<p>For regulation to work in Kenya, NEMA must be empowered, both financially and politically.</p>

<ul>
<li><strong>Independence:</strong> NEMA must be insulated from political interference. When a governor or cabinet secretary pushes for a project in a wetland or forest, NEMA must have the teeth to say "no."</li>
<li><strong>Accountability for Experts:</strong> Environmental auditors who submit fraudulent or heavily watered-down EIAs must lose their licenses and face prosecution.</li>
<li><strong>Meaningful Participation:</strong> Public hearings must be held in accessible locations, with information disseminated in local languages well in advance.</li>
</ul>

<p>Development is essential, but development that destroys the environment is self-defeating. Strong, uncompromised regulation is not an enemy of progress; it is its guardian.</p>""",
                "image": "https://images.unsplash.com/photo-1559807477-16d51f379a7c?w=1920&q=80",
                "og_image": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&q=80",
                "category_fk": category_regulation,
            },
            {
                "title": "The Mau Forest Complex: A Battle for Kenya's Greatest Water Tower",
                "content": """<p>When you turn on the tap in Nairobi, Eldoret, or Nakuru, the water flowing out has a secret origin: the Mau Forest Complex. As the largest indigenous montane forest in East Africa, the Mau is the catchment area for over 12 rivers, feeding lakes like Nakuru, Baringo, and Natron. It is, without exaggeration, Kenya's life support system.</p>

<p>Yet, for decades, the Mau has been under siege.</p>

<h3>The Scramble for the Mau</h3>

<p>Deforestation in the Mau has been driven by a toxic mix of illegal logging, charcoal burning, and, most significantly, political patronage. Over the years, thousands of hectares of forest land were hived off and allocated to politically connected individuals under the guise of settlement schemes.</p>

<p>The consequences have been devastating. Rivers have dried up or become seasonal. Lake Nakuru, a UNESCO World Heritage site, has fluctuated wildly in size, threatening its famous flamingo populations. The local microclimate has changed, affecting agricultural yields in the South Rift.</p>

<h3>Restoration Efforts and Realities</h3>

<p>The Kenyan government has launched several task forces and eviction exercises to reclaim the Mau, most notably the recent push to plant 15 billion trees by 2032. While tree-planting campaigns are commendable, they are not a silver bullet. Planting exotic eucalyptus in a wetland does not restore an ecosystem; in fact, it can worsen the water table.</p>

<p>Saving the Mau requires a transition from political rhetoric to ecological science:</p>

<ul>
<li><strong>Evicting Encroachers vs. Human Rights:</strong> Evictions must be carried out humanely, distinguishing between genuine landowners who were duped by corrupt officials and large-scale illegal grabbers.</li>
<li><strong>Indigenous Restoration:</strong> Replanting must focus on indigenous tree species that support local biodiversity and retain water effectively.</li>
<li><strong>Community Stewardship:</strong> The communities living adjacent to the forest must be made custodians of the ecosystem, benefiting from sustainable non-timber forest products like honey and eco-tourism.</li>
</ul>

<p>The Mau Forest cannot be recovered overnight, but with sustained political will and ecological wisdom, we can secure Kenya's water towers for generations to come.</p>""",
                "image": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80",
                "og_image": "https://images.unsplash.com/photo-1500226783826-36b0f6b6b7cf?w=1200&q=80",
                "category_fk": category_forestry,
            },
            {
                "title": "Building on Wetlands: The Cost of Riparian Encroachment in Kenya's Urban Centers",
                "content": """<p>In recent years, Kenyan cities and towns have witnessed a troubling trend: buildings collapsing, estates flooding, and rivers bursting their banks with devastating consequences. While climate change is often blamed—and rightly so—a more insidious, man-made culprit is lurking behind these disasters: riparian encroachment.</p>

<p>A riparian reserve is the land adjacent to a river, stream, or lake. In Kenya, the law mandates a minimum setback of 6 to 30 meters from the highest water mark, depending on the water body's size. This buffer zone is crucial. It absorbs floodwaters, filters pollutants, and prevents soil erosion.</p>

<h3>The Concrete Jungle</h3>

<p>Despite these clear regulations, developers in Nairobi, Kisumu, and Nakuru have systematically swallowed up wetlands and riparian land. Guided by greed and facilitated by corrupt county officials who issue illegal building permits, luxury apartments, malls, and factories have been erected right on riverbanks.</p>

<p>When the rains come—as they did tragically in recent months—rivers naturally reclaim their floodplains. With nowhere to expand, water backs up, flooding residential areas, destroying property, and causing loss of life.</p>

<h3>Evicting the Encroachers</h3>

<p>When the National Construction Authority (NCA) or NEMA finally moves to demolish these illegal structures, public sympathy often lies with the homeowners who lose their life savings. It is a tragic situation, but the blame should be directed at the county planners and developers who authorized and built on unsafe, illegal land.</p>

<p>To stop riparian encroachment:</p>

<ul>
<li><strong>Digitize Land Records:</strong> We need transparent, accessible mapping of all riparian reserves so buyers can verify land status before purchase.</li>
<li><strong>Hold Counties Accountable:</strong> County governments must be penalized for approving developments on protected zones.</li>
<li><strong>Restoration:</strong> Demolished sites should not be left as concrete rubble but actively rehabilitated and restored as public green spaces and natural flood buffers.</li>
</ul>

<p>We cannot build our way out of nature. Respecting the boundaries of our water bodies is not just a legal requirement; it is a matter of life and death.</p>""",
                "image": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80",
                "og_image": "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=1200&q=80",
                "category_fk": category_encroachment,
            },
            {
                "title": "Environmental Governance in Kenya: Is Devolution Failing Mother Nature?",
                "content": """<p>When Kenya promulgated the 2010 Constitution, it enshrined the right to a clean and healthy environment as a fundamental human right. It also introduced devolution, shifting power and resources to 47 county governments. The intention was clear: bring governance closer to the people, including the management of natural resources.</p>

<p>More than a decade later, how is environmental governance faring under devolution? The results are a mixed bag of localized successes and systemic failures.</p>

<h3>The Good and the Bad</h3>

<p>On the positive side, some counties have taken commendable steps. Makueni County has pioneered climate change legislation at the county level, creating a fund to help farmers adapt to drought. Kwale and Taita Taveta have made strides in community conservation and eco-tourism.</p>

<p>However, the darker side of devolved environmental governance is hard to ignore. Natural resources have become cash cows for local cartels. Sand harvesting in Makueni and Machakos, logging in the Aberdares, and mining in Taita Taveta are often controlled by powerful individuals who flout regulations with impunity. Furthermore, county environmental committees, which are legally mandated to oversee resource management, either do not exist or are comatose due to underfunding and political interference.</p>

<h3>The Governance Fix</h3>

<p>Kenya's environmental governance structure is fractured. While NEMA is a national body, enforcement often relies on county governments, leading to a jurisdictional ping-pong where no one takes responsibility.</p>

<p>To fix this:</p>

<ol>
<li><strong>Fund County Environmental Departments:</strong> Environment cannot be an afterthought in county budgets. Departments must be adequately funded to conduct patrols, monitoring, and public education.</li>
<li><strong>Empower Community Forest Associations (CFAs):</strong> True governance means putting resources in the hands of the people who live with the forests. CFAs need legal backing and financial support to manage local resources sustainably.</li>
<li><strong>Tackle Cartels:</strong> Environmental crimes are economic crimes. The Ethics and Anti-Corruption Commission (EACC) and the Directorate of Criminal Investigations (DCI) must treat illegal sand harvesting and logging with the same severity as financial fraud.</li>
</ol>

<p>Devolution has given Kenyans a voice in how their environment is managed, but that voice is being drowned out by cartels and political interests. It is time to reclaim our environmental governance for the people and the planet.</p>""",
                "image": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&q=80",
                "og_image": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80",
                "category_fk": category_governance,
            },
        ]

        # Create posts
        created_count = 0
        for post_data in posts_data:
            post, created = Post.objects.get_or_create(
                title=post_data["title"],
                defaults={
                    "content": post_data["content"],
                    "image": post_data["image"],
                    "og_image": post_data["og_image"],
                    "category": post_data["category_fk"].name,
                    "category_fk": post_data["category_fk"],
                    "user": admin_user,
                    "status": Post.Status.PUBLISHED,
                    "featured": created_count < 2,  # Feature first 2 posts
                },
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f"✓ Created: {post.title}")
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f"⊘ Already exists: {post.title}")
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"\n✓ Successfully seeded {created_count} blog posts!"
            )
        )
