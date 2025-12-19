import React from "react";
import { Link } from "react-router-dom";
import { FaHandshake, FaLightbulb, FaShieldAlt, FaChartLine } from "react-icons/fa";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-brand-blue text-white py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Transforming Compliance Into Competitive Advantage
              </h1>
              <p className="text-xl text-brand-yellow">
                Where environmental responsibility meets business success
              </p>
              <Link
                to="/contact"
                className="inline-block bg-brand-green hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300"
              >
                Get Started
              </Link>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img
                src="https://res.cloudinary.com/dcrubaesi/image/upload/v1737333837/ECODEED_COLORED_LOGO_wj2yy8.png"
                alt="Ecodeed Logo"
                className="w-64 h-64 object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brand-blue dark:text-white mb-4">
              Our Mission
            </h2>
            <div className="w-24 h-1 bg-brand-green mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              At Ecodeed Consulting, we empower businesses, governments, and communities to navigate
              environmental compliance, implement sustainable practices, and future-proof their
              operations—so no dream is lost due to regulatory hurdles.
            </p>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/3 flex justify-center">
              <div className="relative">
                <img
                  src="https://res.cloudinary.com/dcrubaesi/image/upload/v1759583146/Mukami_Mwema_profile_1_luizqu.jpg"
                  alt="Miriam Mukami Mwema"
                  className="w-64 h-64 rounded-full object-cover border-4 border-brand-yellow shadow-lg"
                />
                <div className="absolute -bottom-4 -right-4 bg-brand-green text-white px-4 py-2 rounded-lg shadow-md">
                  <span className="font-bold">CEO & Founder</span>
                </div>
              </div>
            </div>
            <div className="md:w-2/3">
              <h2 className="text-3xl font-bold text-brand-blue dark:text-white mb-6">
                Meet Our Founder: Miriam Mukami Mwema
              </h2>
              <div className="w-24 h-1 bg-brand-green mb-6"></div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Miriam Mukami Mwema is an environmental strategist, sustainability educator, and the
                driving force behind Ecodeed Consulting. With over{" "}
                <span className="font-bold">8 years of experience</span> in environmental impact
                assessments, audits, and regulatory compliance, she has led{" "}
                <span className="font-bold">100+ projects</span> across Kenya, helping businesses and
                counties align with environmental laws while fostering sustainable growth.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                A licensed <span className="font-bold">Environmental Impact Assessment & Audit (EIA/EA) Expert</span>,
                Miriam holds a degree in <span className="font-bold">Environmental Science</span> from Maseno University
                and is trained in <span className="font-bold">ISO 14001:2015 Environmental Management Systems</span>.
              </p>
              <div className="mt-6">
                <Link
                  to="/team"
                  className="inline-flex items-center text-brand-green hover:text-green-700 font-medium transition duration-300"
                >
                  Meet the full team
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founding Story */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brand-blue dark:text-white mb-4">
              The Day Everything Changed
            </h2>
            <div className="w-24 h-1 bg-brand-green mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              How one woman's pain became our purpose
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Story Timeline */}
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 md:left-1/2 h-full w-0.5 bg-brand-green transform -translate-x-1/2"></div>

              {/* Timeline items */}
              <div className="space-y-12">
                {/* Timeline Item 1 */}
                <div className="relative flex md:justify-center">
                  <div className="md:w-1/2 md:pr-8 md:text-right">
                    <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-md relative">
                      <div className="absolute -left-2 md:left-auto md:-right-2 top-6 w-4 h-4 bg-brand-green rounded-full border-4 border-white dark:border-gray-800"></div>
                      <h3 className="text-xl font-bold text-brand-blue dark:text-white mb-2">The Beginning</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Eight years ago, I was working at NEMA as an assistant, dreaming of climbing the ranks to become a permanent environmental officer.
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:block md:w-1/2"></div>
                </div>

                {/* Timeline Item 2 */}
                <div className="relative flex md:justify-center">
                  <div className="hidden md:block md:w-1/2 md:pr-8"></div>
                  <div className="md:w-1/2 md:pl-8">
                    <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-md relative">
                      <div className="absolute -left-2 md:left-auto md:-right-2 top-6 w-4 h-4 bg-brand-green rounded-full border-4 border-white dark:border-gray-800"></div>
                      <h3 className="text-xl font-bold text-brand-blue dark:text-white mb-2">The Fateful Encounter</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        A distressed woman entered our offices - sweating, anxious, and ultimately breaking down in tears. Her petrol station business was being shut down for NEMA non-compliance.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timeline Item 3 */}
                <div className="relative flex md:justify-center">
                  <div className="md:w-1/2 md:pr-8 md:text-right">
                    <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-md relative">
                      <div className="absolute -left-2 md:left-auto md:-right-2 top-6 w-4 h-4 bg-brand-green rounded-full border-4 border-white dark:border-gray-800"></div>
                      <h3 className="text-xl font-bold text-brand-blue dark:text-white mb-2">The Harsh Reality</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        She had operated for three years without knowing she needed approvals. Now she faced fines, prosecution, and the loss of her life's investment.
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:block md:w-1/2"></div>
                </div>

                {/* Timeline Item 4 */}
                <div className="relative flex md:justify-center">
                  <div className="hidden md:block md:w-1/2 md:pr-8"></div>
                  <div className="md:w-1/2 md:pl-8">
                    <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-md relative">
                      <div className="absolute -left-2 md:left-auto md:-right-2 top-6 w-4 h-4 bg-brand-green rounded-full border-4 border-white dark:border-gray-800"></div>
                      <h3 className="text-xl font-bold text-brand-blue dark:text-white mb-2">The Turning Point</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        "That woman's pain became my purpose. I couldn't stand by while dreams were crushed by lack of knowledge or guidance."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Full Story */}
            <div className="mt-16 bg-brand-blue/10 dark:bg-gray-700 p-8 rounded-lg shadow-md">
              <div className="prose dark:prose-invert max-w-none">
                <h3 className="text-2xl font-bold text-brand-blue dark:text-white mb-6">The Full Story</h3>
                
                <p className="mb-4">
                  Eight years ago in 2018, I was an ordinary young woman living simply, trying to find my place in the world. After finishing school, I was lucky enough to land a job at NEMA as an assistant. I loved it. I admired the officers — sharp, confident, committed. I dreamed of one day becoming a permanent and pensionable environmental officer. Maybe rise through the ranks — county director, regional head, and if I worked super hard, maybe even reach the Deputy Director General. That was the vision... until one day changed everything.
                </p>
                
                <div className="my-6 p-4 border-l-4 border-brand-green bg-white dark:bg-gray-800">
                  <p className="italic text-gray-700 dark:text-gray-300">
                    "I remember it like it was yesterday. I was in the office, buried in work, when a man and a woman walked in. They asked to see the County Director of Environment, but she was in a meeting with the Environmental Officers. Some non-compliant facilities had been raided earlier on and prosecution preparations was underway."
                  </p>
                </div>
                
                <p className="mb-4">
                  I asked them to wait. They looked exhausted — the woman was sweating, visibly anxious. I assumed it was just the stairs. But then, she broke down. She cried. Right there in front of me.
                </p>
                
                <p className="mb-4">
                  I was confused. I asked if she needed water, help, anything. She asked for the washroom. I escorted her out and she decided what she needed was to catch a breath not the wash room... I didn't know how to console her, I didn't know what to tell her... So we stood outside, in silence. I had no words. She just breathed. I just stood there as she calmed herself down.
                </p>
                
                <p className="mb-4">
                  Eventually, she gathered herself and we went back to the office. After a short while the meeting was done and they could now talk to the director. As the officers came from the Director's office one of them said: "Haiya, mumefika? Mnataka kumwona Mkubwa?" I asked quietly what was going on. And then I heard her story.
                </p>
                
                <div className="my-6 bg-brand-yellow/20 dark:bg-brand-yellow/10 p-6 rounded-lg">
                  <h4 className="font-bold text-brand-blue dark:text-white mb-2">The Tragic Reality</h4>
                  <p>
                    She had leased a small petrol station business from a former operator three years ago. She invested and built it up for three years but either without knowing she needed NEMA approvals or she had ignored them. So the facility had been red marked as non-compliant. Now she was supposed to pay the License fee for the past years and penalties accumulated...the business had been shut down and a prosecution case to answer...
                  </p>
                </div>
                
                <p className="mb-4">
                  I got my nose in this woman's case and I understood that after many months of court case, she lost, paid the penalties. She was still paying off the bank loan and with all the extra penalties, she lost her business. Time. Sweat. Money. Apparently she didn't know she needed NEMA approval and for three years, she operated the petrol station without them.
                </p>
                
                <p className="mb-4 font-semibold">
                  What happened to all the sweat, blood, tears, time she had invested? What about her children and husband? What about her family? What about the young men & women she had employed? What about her employee's families? What about her money? What about her reputation? What about her confidence? What about her dreams? What about her vision...?
                </p>
                
                <div className="my-6 p-4 border-l-4 border-brand-red bg-white dark:bg-gray-800">
                  <p className="italic text-gray-700 dark:text-gray-300">
                    "That woman's pain became my purpose. I was heartbroken for her, I was furious for her, I was mad for her. That triggered my entrepreneur journey."
                  </p>
                </div>
                
                <p className="mb-4">
                  I couldn't just sit back anymore and hope to climb some government ladder while people lost everything due to lack of information, lack of someone to answer their questions, lack of a guiding hand. Due to ignorance, confusion, or bureaucracy.
                </p>
                
                <h4 className="text-xl font-bold text-brand-blue dark:text-white mt-8 mb-4">The Birth of Ecodeed</h4>
                
                <p className="mb-4">
                  So I made a decision. To protect dreamers like her. To stand in the gap for investors. To educate businesses, institutions, county governments and communities on environment issues. To help business owners build empires that last, legally, ethically, and sustainably. That was the day Ecodeed Consultancy Company was born.
                </p>
                
                <div className="my-6 bg-brand-green/10 dark:bg-brand-green/20 p-6 rounded-lg">
                  <h4 className="font-bold text-brand-blue dark:text-white mb-2">Our Core Promise</h4>
                  <p>
                    We exist to ensure that no dream dies because of environmental non-compliance. Not under my watch. Not in my time. I decided to dedicate my life, my knowledge, my sweat, my blood, my tears to ensuring investors see their dreams and visions come true.
                  </p>
                </div>
                
                <p className="mb-4">
                  I want to see the joy and smile an investor has after the transformation of their dream from paper to real life. I dedicated myself to ensuring what happened to that lady will never happen to any other investor under my watch. No other dream will be killed by NEMA because of non-compliance.
                </p>
                
                <p className="mb-4 font-semibold">
                  Every Client we work with, Every approval we guide, Every business we support — is a vow to that woman. A vow to all the people like her who don't even know how close they are to losing everything... until it's too late.
                </p>
                
                <p className="text-xl mt-8 font-bold text-brand-blue dark:text-white">
                  At Ecodeed, we don't just help businesses comply — we help them thrive.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brand-blue dark:text-white mb-4">
              What We Stand For
            </h2>
            <div className="w-24 h-1 bg-brand-green mx-auto mb-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <FaShieldAlt className="w-10 h-10 text-brand-green" />,
                title: "Expertise",
                description: "Licensed, experienced, and constantly updating our knowledge"
              },
              {
                icon: <FaChartLine className="w-10 h-10 text-brand-green" />,
                title: "Impact",
                description: "From County Environmental Action Plans to ESG audits, we turn policies into action"
              },
              {
                icon: <FaHandshake className="w-10 h-10 text-brand-green" />,
                title: "Empathy",
                description: "We listen, educate, and walk with clients every step of the way"
              },
              {
                icon: <FaLightbulb className="w-10 h-10 text-brand-green" />,
                title: "Advocacy",
                description: "Pushing for sustainable development in both grassroots projects and national policy"
              }
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 text-center"
              >
                <div className="flex justify-center mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-brand-blue dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-brand-blue text-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl text-center">
          <h2 className="text-3xl font-bold mb-6">Join the Movement</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Whether you're a <span className="font-bold">business owner</span>,{" "}
            <span className="font-bold">government agency</span>, or{" "}
            <span className="font-bold">community leader</span>, Ecodeed is your partner in{" "}
            <span className="font-bold">building ethically</span>,{" "}
            <span className="font-bold">operating sustainably</span>, and{" "}
            <span className="font-bold">thriving legally</span>.
          </p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/contact"
              className="inline-block bg-brand-green hover:bg-green-700 text-white font-medium py-3 px-8 rounded-lg transition duration-300"
            >
              Contact Us Today
            </Link>
            <Link
              to="/services"
              className="inline-block bg-brand-yellow hover:bg-yellow-600 text-brand-blue font-medium py-3 px-8 rounded-lg transition duration-300"
            >
              Explore Our Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}