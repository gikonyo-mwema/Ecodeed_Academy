/**
 * About Page — Company mission, values, founder story, and team
 *
 * DYNAMIC VERSION: Fetches content from /api/v1/aboutus/ backend endpoint
 * Displays all content from database instead of hardcoded values.
 *
 * @component
 * @purpose
 *   Showcases Ecodeed Consulting's mission, vision, leadership, and impact.
 *   All content is managed by admins through the dashboard and displayed here.
 * @features
 *   - Dynamic hero section from backend
 *   - Mission & vision statements
 *   - Founder biography with photo
 *   - Core values (from database)
 *   - Impact metrics (from database)
 *   - Leadership team showcase (from database)
 *   - Loading and error states
 * @sections
 *   - Hero: Headline and logo
 *   - Mission: Company values and purpose
 *   - Founder: Story and background
 *   - Values: Core principles visualization
 *   - Impact: Key metrics and achievements
 *   - Team: Leadership profiles
 * @styles
 *   - Brand colors: Blue (#051836), Green (#008037), Yellow (#F8BF0F)
 *   - Responsive grid layout
 *   - Dark mode support
 * @example
 *   <Route path="/about" element={<About />} />
 * @version 3.0.0
 * @author Gikonyo Mwema
 */

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Spinner, Alert } from "flowbite-react";
import { HiExclamation } from "react-icons/hi";
import { apiFetch } from "../utils/api";

/**
 * About - Dynamic company information page fetched from API
 * 
 * @returns {JSX.Element} About page with content from /api/v1/aboutus/
 */
export default function About() {
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch About Us content from API
  useEffect(() => {
    const fetchAboutUs = async () => {
      try {
        const data = await apiFetch("/api/v1/aboutus/");
        if (Array.isArray(data)) {
          setAboutData(data[0]);
        } else {
          setAboutData(data);
        }
      } catch (err) {
        console.error("Error fetching About Us:", err);
        setError("Failed to load About Us content");
      } finally {
        setLoading(false);
      }
    };

    fetchAboutUs();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <Spinner size="xl" />
      </div>
    );
  }

  // Show error state
  if (error || !aboutData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center p-4">
        <Alert color="failure" className="max-w-2xl">
          <HiExclamation className="mr-2" /> {error || "Failed to load content"}
        </Alert>
      </div>
    );
  }

  const { hero_title, hero_subtitle, hero_image_url, mission_statement, vision_statement, founder_name, founder_bio, founder_image_url, values = [], metrics = [], team_members = [] } = aboutData;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-brand-blue dark:bg-brand-blue/80 dark:border-b dark:border-brand-green/30 text-white py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                {hero_title}
              </h1>
              <p className="text-xl text-brand-yellow">
                {hero_subtitle}
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
                src={hero_image_url}
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
              {mission_statement}
            </p>
            {vision_statement && (
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-brand-blue dark:text-white mb-3">
                  Our Vision
                </h3>
                <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                  {vision_statement}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Founder Section */}
      {founder_name && (
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/3 flex justify-center">
                <div className="relative">
                  <img
                    src={founder_image_url || "/default-avatar.png"}
                    alt={founder_name}
                    className="w-64 h-64 rounded-full object-cover border-4 border-brand-yellow shadow-lg"
                  />
                  <div className="absolute -bottom-4 -right-4 bg-brand-green text-white px-4 py-2 rounded-lg shadow-md">
                    <span className="font-bold">CEO & Founder</span>
                  </div>
                </div>
              </div>
              <div className="md:w-2/3">
                <h2 className="text-3xl font-bold text-brand-blue dark:text-white mb-6">
                  Meet Our Founder: {founder_name}
                </h2>
                <div className="w-24 h-1 bg-brand-green mb-6"></div>
                <div className="text-gray-600 dark:text-gray-300 text-base leading-relaxed whitespace-pre-wrap">
                  {founder_bio}
                </div>
                <div className="mt-6">
                  <Link
                    to="/contact"
                    className="inline-flex items-center text-brand-green hover:text-green-700 font-medium transition duration-300"
                  >
                    Get in touch
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
      )}

      {/* Core Values Section */}
      {values && values.length > 0 && (
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-brand-blue dark:text-white mb-4">
                Our Core Values
              </h2>
              <div className="w-24 h-1 bg-brand-green mx-auto mb-6"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
                  <h3 className="text-xl font-bold text-brand-blue dark:text-white mb-3">
                    {value.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Impact Metrics Section */}
      {metrics && metrics.length > 0 && (
        <section className="py-16 bg-brand-blue dark:bg-brand-blue/80 text-white">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Our Impact
              </h2>
              <div className="w-24 h-1 bg-brand-yellow mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map((metric, index) => (
                <div key={index} className="bg-white/10 dark:bg-white/5 p-8 rounded-lg text-center hover:bg-white/20 dark:hover:bg-white/10 transition duration-300">
                  <div className="text-4xl font-bold text-brand-yellow mb-2">
                    {metric.value}
                  </div>
                  <p className="text-xl">
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Team Section */}
      {team_members && team_members.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-brand-blue dark:text-white mb-4">
                Our Team
              </h2>
              <div className="w-24 h-1 bg-brand-green mx-auto mb-6"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {team_members.map((member, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                  {member.image && (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-64 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-brand-blue dark:text-white mb-1">
                      {member.name}
                    </h3>
                    <p className="text-brand-green font-semibold mb-3">
                      {member.role}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      {member.bio}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl text-center">
          <h2 className="text-3xl font-bold text-brand-blue dark:text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Let us help you navigate compliance and build a sustainable future for your organization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-block bg-brand-green hover:bg-green-700 text-white font-medium py-3 px-8 rounded-lg transition duration-300"
            >
              Get in Touch
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
