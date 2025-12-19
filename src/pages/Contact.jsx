import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
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

// Configure axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, // Use VITE_BACKEND_URL directly
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

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
      const response = await api.post("/api/messages", formData);
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
      console.error('Message submission error:', error);
      setStatus({
        message: error.response?.data?.message || 
          `We couldn't send your message. Please try again or contact us directly at info@ecodeed.co.ke (Error: ${error.message})`,
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
            <h3 className="text-2xl font-semibold text-brand-blue">
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
            <h3 className="text-2xl font-semibold mb-6 text-brand-blue">
              Contact Information
            </h3>

            <div className="space-y-8">
              {/* Basic Contact Info */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-brand-blue">
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
                <h4 className="text-lg font-medium text-brand-blue">
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
                <h4 className="text-lg font-medium mb-4 text-brand-blue">
                  Connect With Us
                </h4>
                <div className="flex items-center gap-4">
                  {[
                    { icon: FaFacebookF, url: "https://www.facebook.com/ecodeedcompany/", color: "bg-blue-600" },
                    { icon: FaInstagram, url: "https://www.instagram.com/ecodeedcompany/", color: "bg-gradient-to-r from-pink-500 to-purple-500" },
                    { icon: FaLinkedinIn, url: "https://www.linkedin.com/company/ecodeed-consultancy-company", color: "bg-blue-700" },
                    { icon: FaTwitter, url: "https://x.com/EcodeedC", color: "bg-gray-800" },
                  ].map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-3 rounded-full text-white hover:scale-110 transition-transform ${social.color}`}
                      aria-label={social.icon.name.replace("Fa", "")}
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

// Newsletter Signup Component (now part of CallToAction)
function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('subscribing');
    
    try {
      const response = await fetch('/api/messages/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setEmail('');
        setTimeout(() => setStatus(''), 5000);
      } else {
        setStatus('error');
        setTimeout(() => setStatus(''), 5000);
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setStatus('error');
      setTimeout(() => setStatus(''), 5000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        placeholder="Enter your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={status === 'subscribing'}
        className="w-full px-4 py-3 rounded-lg border-0 bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow backdrop-blur-sm"
      />
      <button
        type="submit"
        disabled={status === 'subscribing' || status === 'success'}
        className="w-full bg-brand-yellow hover:bg-brand-yellow/90 disabled:bg-brand-yellow/50 text-brand-blue font-semibold py-3 rounded-lg transition-colors"
      >
        {status === 'subscribing' ? 'Subscribing...' : 
         status === 'success' ? '✓ Subscribed!' : 
         status === 'error' ? '✗ Try Again' :
         'Subscribe to Newsletter'}
      </button>
      
      {status === 'success' && (
        <p className="text-sm text-green-200 mt-2">
          🎉 Welcome aboard! Check your email for a confirmation message.
        </p>
      )}
      {status === 'error' && (
        <p className="text-sm text-red-200 mt-2">
          ❌ Something went wrong. Please try again or contact us directly.
        </p>
      )}
    </form>
  );
}

export default Contact;