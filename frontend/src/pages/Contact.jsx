/**
 * Contact Page — Contact form and communication channels
 *
 * @component
 * @purpose
 *   Provides multiple contact methods for users (contact form, links to social media,
 *   calendar booking for consultations, email, and phone). Includes service routing
 *   from Services page to pre-fill subject.
 * @features
 *   - Contact form (name, email, subject, message)
 *   - Subject pre-fill from navigation state (e.g., from Services page)
 *   - Social media links (Facebook, Instagram, LinkedIn, Twitter)
 *   - Calendar link for meeting scheduling
 *   - Phone number and email display
 *   - Form validation and error handling
 *   - Success message on submission
 *   - Responsive design with dark mode support
 * @api
 *   POST /api/v1/messages/contact — Submit contact form
 * @state
 *   - formData: { name, email, subject, message }
 *   - status: { message, type } (success/error feedback)
 *   - isSubmitting: boolean (form submission in progress)
 * @routing
 *   Optionally receives serviceTitle via location.state from Services page
 *   to pre-populate the subject field
 * @example
 *   // From Services page:
 *   navigate('/contact', { state: { serviceTitle: 'Environmental Auditing' } });
 *   
 *   <Route path=\"/contact\" element={<Contact />} />
 * @version 2.0.0
 * @author Gikonyo Mwema
 */
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { apiFetch } from "../utils/api";
import CallToAction from "../components/CallToAction";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaPhoneAlt,
  FaEnvelope,
  FaGlobe,
  FaCalendarAlt,
  FaVideo,
} from "react-icons/fa";

/**
 * Contact Page Component
 * 
 * Displays the contact form and company contact information.
 * Allows users to send messages and inquiries to the company.
 * 
 * @component
 * @version 1.0.0
 * @author Gikonyo Mwema
 */
const Contact = () => {
  const location = useLocation();
  const { theme } = useSelector((state) => state.theme);
  const serviceTitle = location.state?.serviceTitle || "";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: serviceTitle,
    message: "",
  });
  const [status, setStatus] = useState({ message: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ message: "", type: "" });

    try {
      await apiFetch("/api/v1/messages/contact", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setStatus({
        message: "Your message has been sent successfully! We'll contact you soon.",
        type: "success"
      });
      setFormData({
        name: "",
        email: "",
        subject: serviceTitle || "",
        message: ""
      });
    } catch (error) {
      setStatus({
        message: error.message || 
          "We couldn't send your message. Please try again or contact us directly at info@ecodeed.co.ke",
        type: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Logo based on theme
  const logoUrl = theme === "light"
    ? "https://res.cloudinary.com/dcrubaesi/image/upload/v1753007363/ECODEED_BLACK_LOGO_xtwjoy.png"
    : "https://res.cloudinary.com/dcrubaesi/image/upload/v1737333837/ECODEED_COLORED_LOGO_wj2yy8.png";

  // Styling classes based on theme
  const cardClass = theme === "light"
    ? "bg-white text-gray-800 shadow-lg"
    : "bg-gray-800 text-gray-200 shadow-xl";

  const inputClass = theme === "light"
    ? "bg-white border-gray-300 focus:ring-brand-green focus:border-brand-green"
    : "bg-gray-700 border-gray-600 focus:ring-brand-yellow focus:border-brand-yellow";

  return (
    <div className={`min-h-screen ${theme === "light" ? "bg-gray-50" : "bg-brand-blue"}`}>
      {/* Branding Header */}
      <div className={`py-6 px-4 ${theme === "light" ? "bg-white shadow-sm" : "bg-brand-blue"}`}>
        <div className="max-w-6xl mx-auto flex justify-center">
          <div className="flex items-center">
            <img src={logoUrl} alt="Ecodeed Logo" className="h-16 w-16 mr-3" />
            <h2 className={`text-2xl font-bold ${theme === "light" ? "text-brand-blue" : "text-white"}`}>
              Ecodeed Consultancy
            </h2>
          </div>
        </div>
      </div>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="text-center mb-12">
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${theme === "light" ? "text-brand-blue" : "text-brand-yellow"}`}>
            Get in Touch
          </h1>
          <p className={`text-lg max-w-2xl mx-auto ${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>
            Have questions about our environmental consulting services? Reach out to our team and we'll get back to you promptly.
          </p>
          <div className="mt-6 max-w-xl mx-auto">
            <div className={`flex items-center gap-3 p-4 rounded-lg ${theme === "light" ? "bg-brand-green/10 border border-brand-green/20" : "bg-brand-green/20 border border-brand-green/30"}`}>
              <div className="text-brand-green">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="text-sm">
                <p className={`font-medium ${theme === "light" ? "text-brand-blue" : "text-white"}`}>
                  Pro Tip: Subscribe to our newsletter below for updates!
                </p>
                <p className={`${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>
                  Get eco-tips, industry insights, and service announcements directly in your inbox.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
          {/* Contact Form */}
          <form onSubmit={handleSubmit} className={`p-6 sm:p-8 rounded-2xl ${cardClass} space-y-6`}>
            <h3 className={`text-2xl font-semibold ${theme === "light" ? "text-brand-blue" : "text-white"}`}>
              Send us a message
            </h3>

            {status.message && (
              <div className={`p-3 rounded-lg ${status.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                {status.message}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 rounded-lg border ${inputClass} focus:outline-none focus:ring-2 transition`}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 rounded-lg border ${inputClass} focus:outline-none focus:ring-2 transition`}
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${inputClass} focus:outline-none focus:ring-2 transition`}
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 rounded-lg border ${inputClass} focus:outline-none focus:ring-2 transition`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-lg bg-brand-green hover:bg-green-700 text-white font-semibold transition-colors shadow-md ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>

          {/* Contact Details */}
          <div className={`p-6 sm:p-8 rounded-2xl ${cardClass}`}>
            <h3 className={`text-2xl font-semibold mb-6 ${theme === "light" ? "text-brand-blue" : "text-white"}`}>
              Contact Information
            </h3>

            <div className="space-y-8">
              {/* Basic Contact Info */}
              <div className="space-y-4">
                <h4 className={`text-lg font-medium ${theme === "light" ? "text-brand-blue" : "text-brand-yellow"}`}>
                  General Inquiries
                </h4>
                <div className="flex items-start gap-4">
                  <FaPhoneAlt className="mt-1 text-brand-green" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <a
                      href="tel:+254708289680"
                      className="hover:underline"
                    >
                      +254 791 233 100
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <FaEnvelope className="mt-1 text-brand-green" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a
                      href="mailto:info@ecodeed.co.ke"
                      className="hover:underline"
                    >
                      info@ecodeed.co.ke
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <FaGlobe className="mt-1 text-brand-green" />
                  <div>
                    <p className="font-medium">Website</p>
                    <a
                      href="https://www.ecodeed.co.ke"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      www.ecodeed.co.ke
                    </a>
                  </div>
                </div>
              </div>

              {/* Scheduling */}
              <div className="space-y-4">
                <h4 className={`text-lg font-medium ${theme === "light" ? "text-brand-blue" : "text-brand-yellow"}`}>
                  Schedule a Meeting
                </h4>
                <a
                  href="https://calendly.com/talk-to-miriam"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 font-medium text-brand-green hover:underline"
                >
                  <FaCalendarAlt className="text-xl" /> Schedule via Calendly
                </a>
                <a
                  href="https://zoom.us"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 font-medium text-brand-green hover:underline"
                >
                  <FaVideo className="text-xl" /> Schedule Zoom Call
                </a>
              </div>

              {/* Social Media */}
              <div className="pt-4">
                <h4 className={`text-lg font-medium mb-4 ${theme === "light" ? "text-brand-blue" : "text-brand-yellow"}`}>
                  Connect With Us
                </h4>
                <div className="flex items-center gap-4">
                  {[
                    { icon: FaFacebookF, url: "https://www.facebook.com/ecodeedcompany/", label: "Facebook" },
                    { icon: FaInstagram, url: "https://www.instagram.com/ecodeedcompany/", label: "Instagram" },
                    { icon: FaLinkedinIn, url: "https://www.linkedin.com/company/ecodeed-consultancy-company", label: "LinkedIn" },
                    { icon: FaTwitter, url: "https://x.com/EcodeedC", label: "Twitter" },
                  ].map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-3 rounded-full hover:scale-110 transition-all duration-200 ${
                        theme === "light"
                          ? "bg-brand-green text-white hover:bg-brand-yellow hover:text-brand-blue"
                          : "bg-gray-700 text-gray-300 hover:bg-brand-yellow hover:text-brand-blue"
                      }`}
                      aria-label={social.label}
                    >
                      <social.icon size={16} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup Section */}
      <CallToAction 
        type="newsletter"
        title="Stay Connected with Ecodeed! 🌱"
        subtitle="Join our newsletter community and be the first to receive weekly eco-friendly tips, environmental news, and exclusive content."
      />
    </div>
  );
};

export default Contact;