import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import CallToAction from '../components/CallToAction';
import {
  FiCheckCircle,
  FiChevronDown,
  FiArrowRight,
  FiCalendar,
  FiClock,
  FiDollarSign
} from 'react-icons/fi';

// Section Navigation Component
const SectionNav = ({ sections }) => {
  const [activeSection, setActiveSection] = useState('');
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, { threshold: 0.5 });
    
    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });
    
    return () => observer.disconnect();
  }, [sections]);
  
  return (
    <div className="hidden lg:block fixed right-8 top-1/2 transform -translate-y-1/2 z-10">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4">
        <div className="space-y-3">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={`block w-3 h-3 rounded-full transition-all duration-300 ${
                activeSection === section.id 
                  ? 'bg-brand-green dark:bg-brand-yellow scale-125' 
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
              title={section.title}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Quote Request Bar Component  
const QuoteRequestBar = ({ service }) => {
  return (
    <div className="sticky bottom-0 bg-white/95 backdrop-blur dark:bg-gray-900/90 shadow-xl border-t border-gray-200 dark:border-gray-800 z-20">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ready to get started?</h3>
            <p className="text-gray-600 dark:text-gray-300">Get a personalized quote for {service.title}</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/contact"
              className="px-5 py-2.5 rounded-md font-medium transition-colors duration-300 border border-gray-300 text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
            >
              Request Quote
            </Link>
            <Link
              to="/contact"
              className="px-5 py-2.5 rounded-md font-semibold transition-colors duration-300 bg-gradient-to-r from-brand-green to-brand-yellow text-white hover:from-brand-green/90 hover:to-brand-yellow/90"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const ServiceDetail = () => {
  const { slug } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
  const fetchService = async () => {
      try {
        // Try slug endpoint first; fallback to id for backward-compat
        let response;
        try {
      response = await axios.get(`/api/services/slug/${slug}`, { headers: { 'Cache-Control': 'no-cache' } });
        } catch (e) {
      response = await axios.get(`/api/services/${slug}`, { headers: { 'Cache-Control': 'no-cache' } });
        }
        const svc = response.data?.data?.service || response.data?.service || response.data;
        setService(svc);
      } catch (err) {
        console.error('Error fetching service:', err);
        setError('Unable to load the service. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [slug]);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-green"></div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <section className="flex flex-col items-center justify-center min-h-[400px] text-center px-6">
        <div className="max-w-md bg-red-100 dark:bg-red-900/10 rounded-lg p-8 border border-red-200 dark:border-red-800 shadow-lg">
          <svg 
            className="mx-auto h-12 w-12 text-red-500 dark:text-red-400 mb-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-4">
            {error || 'Service Not Found'}
          </h2>
          <Link
            to="/services"
            className="inline-flex items-center mt-4 px-6 py-2 bg-brand-yellow text-brand-blue rounded-full hover:bg-brand-yellow/90 transition-colors duration-300 font-medium shadow-md"
          >
            Browse All Services
            <FiArrowRight className="ml-2" />
          </Link>
        </div>
      </section>
    );
  }

  const descHtml = service.description || service.fullDescription;
  const steps = Array.isArray(service.processSteps) ? service.processSteps.map((s, i) => ({
    title: s.title || s.step,
    description: s.description,
    order: s.order ?? i + 1
  })) : [];

  // Define sections for navigation
  const sections = [
    { id: 'overview', title: 'Overview' },
    ...(Array.isArray(service?.benefits) && service.benefits.length > 0 ? [{ id: 'benefits', title: 'Benefits' }] : []),
    ...(Array.isArray(service?.features) && service.features.length > 0 ? [{ id: 'features', title: 'Features' }] : []),
    ...(steps.length > 0 ? [{ id: 'process', title: 'Process' }] : []),
    ...(service?.examples?.length > 0 ? [{ id: 'examples', title: 'Examples' }] : []),
    ...(service?.faqs?.length > 0 ? [{ id: 'faq', title: 'FAQ' }] : []),
  ];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SectionNav sections={sections} />
      
      {/* Hero Section */}
      <header className="relative bg-white dark:bg-gray-900 text-gray-900 dark:text-white overflow-hidden border-b border-gray-100 dark:border-gray-800">
  <div className="relative max-w-6xl mx-auto px-4 py-8 sm:py-12 text-center">
          {/* Service Icon */}
          <div className="mb-3">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border text-4xl 
              bg-gray-50 border-gray-200 text-brand-green 
              dark:bg-gray-800 dark:border-gray-700 dark:text-brand-yellow">
              <span className="inline-block" style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif' }}>
                {service.icon || '📋'}
              </span>
            </div>
          </div>

          {/* Category Badge */}
          <div className="mb-4">
            <span className="inline-block px-3 py-1 rounded-md text-xs font-medium uppercase tracking-wide 
              bg-gray-100 text-gray-700 border border-gray-200 
              dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700">
              {service.category || 'Professional Service'}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            {service.title}
          </h1>

          {service.shortDescription && (
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-6 max-w-4xl mx-auto leading-relaxed">
              {service.shortDescription}
            </p>
          )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-16 space-y-20">
        
        {/* Full Description */}
        {descHtml && (
          <section id="overview" className="relative">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 
                    bg-gray-100 text-brand-green dark:bg-gray-700 dark:text-brand-yellow">
                    <span className="text-lg">📖</span>
                  </div>
                  Service Overview
                </h2>
              </div>
              <div className="p-8">
                <div className="prose prose-lg dark:prose-invert max-w-none 
                  prose-headings:text-gray-900 dark:prose-headings:text-white 
                  prose-p:text-gray-700 dark:prose-p:text-gray-300 
                  prose-strong:text-gray-900 dark:prose-strong:text-white 
                  prose-a:text-brand-blue dark:prose-a:text-brand-yellow hover:prose-a:underline
                  prose-ul:text-gray-700 dark:prose-ul:text-gray-300 
                  prose-ol:text-gray-700 dark:prose-ol:text-gray-300
                  prose-li:text-gray-700 dark:prose-li:text-gray-300
                  prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400
                  prose-code:text-gray-800 dark:prose-code:text-gray-200
                  prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800
                  prose-hr:border-gray-300 dark:prose-hr:border-gray-600
                  prose-blockquote:border-brand-green dark:prose-blockquote:border-brand-yellow
                  prose-blockquote:bg-brand-green/5 dark:prose-blockquote:bg-brand-yellow/10
                  prose-ul:marker:text-brand-green dark:prose-ul:marker:text-brand-yellow
                  prose-ol:marker:text-brand-green dark:prose-ol:marker:text-brand-yellow
                  [&>div]:text-gray-700 [&>div]:dark:text-gray-300
                  [&>div>*]:text-gray-700 [&>div>*]:dark:text-gray-300
                  [&>div>p]:text-gray-700 [&>div>p]:dark:text-gray-300
                  [&>div>h1]:text-gray-900 [&>div>h1]:dark:text-white
                  [&>div>h2]:text-gray-900 [&>div>h2]:dark:text-white
                  [&>div>h3]:text-gray-900 [&>div>h3]:dark:text-white
                  [&>div>h4]:text-gray-900 [&>div>h4]:dark:text-white
                  [&>div>h5]:text-gray-900 [&>div>h5]:dark:text-white
                  [&>div>h6]:text-gray-900 [&>div>h6]:dark:text-white
                  [&>div>ul]:text-gray-700 [&>div>ul]:dark:text-gray-300
                  [&>div>ol]:text-gray-700 [&>div>ol]:dark:text-gray-300
                  [&>div>li]:text-gray-700 [&>div>li]:dark:text-gray-300
                  [&>div>strong]:text-gray-900 [&>div>strong]:dark:text-white
                  [&>div>em]:text-gray-700 [&>div>em]:dark:text-gray-300
                  ">
                  <div 
                    className="text-gray-700 dark:text-gray-300" 
                    dangerouslySetInnerHTML={{ __html: descHtml }} 
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Benefits Section */}
        {Array.isArray(service.benefits) && service.benefits.length > 0 && (
          <section id="benefits" className="relative">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose This Service
              </h2>
              <div className="w-24 h-px bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {service.benefits.map((b, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-brand-green/10 dark:bg-brand-yellow/10 flex items-center justify-center text-2xl">
                    <span style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif' }}>
                      {b.icon || '✅'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{b.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Features Section */}
        {Array.isArray(service.features) && service.features.length > 0 && (
          <section id="features" className="relative">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Key Features
              </h2>
              <div className="w-24 h-px bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {service.features.map((f, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{f.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Process Steps */}
        {steps.length > 0 && (
          <section id="process" className="relative">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
              <div className="w-24 h-px bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
            </div>
            
            <div className="grid gap-6 md:gap-8">
              {steps.sort((a,b)=>a.order-b.order).map((step, idx) => (
                <div key={idx} className="relative">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-l border-gray-200 dark:border-gray-700">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg 
          bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white">
                          {step.order}
                        </div>
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          {step.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Connector line */}
                  {idx < steps.length - 1 && (
        <div className="hidden md:block absolute left-6 top-16 w-0.5 h-8 bg-gray-200 dark:bg-gray-700"></div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

  {/* Examples Section */}
        {service.examples?.length > 0 && (
          <section id="examples" className="relative">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Our {service.title} Projects
                </h2>
                <div className="w-24 h-px bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
              </div>
              <ul className="space-y-4 max-w-4xl mx-auto">
                {service.examples.map((example, index) => (
                  <li key={index} className="flex items-start bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                    <span className="flex-shrink-0 mt-1 mr-4 text-brand-green dark:text-brand-yellow">
                      <FiCheckCircle className="w-5 h-5" />
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{example}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* FAQ Section */}
        {service.faqs?.length > 0 && (
          <section id="faq" className="relative">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Frequently Asked Questions
              </h2>
              <div className="w-24 h-px bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
            </div>
            <div className="max-w-4xl mx-auto space-y-4">
              {service.faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex justify-between items-center p-6 text-left focus:outline-none hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {faq.question}
                    </h3>
                    <FiChevronDown 
                      className={`w-5 h-5 text-brand-green dark:text-brand-yellow transition-transform duration-300 ${activeFaq === index ? 'transform rotate-180' : ''}`}
                    />
                  </button>
                  {activeFaq === index && (
                    <div className="px-6 pb-6 pt-0 text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700">
                      <div className="pt-4">
                        {faq.answer}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Primary CTAs: placed after details, before site-wide CTA */}
        <div className="max-w-6xl mx-auto">
          <div className="mt-2 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-7 py-3 rounded-md transition-all duration-300 font-semibold shadow-sm hover:shadow-md
              bg-gradient-to-r from-brand-green to-brand-yellow text-white hover:from-brand-green/90 hover:to-brand-yellow/90"
            >
              Get Started Today
              <FiArrowRight className="ml-2" />
            </Link>
            <Link
              to="/services"
              className="inline-flex items-center justify-center px-7 py-3 border rounded-md transition-all duration-300 font-semibold
              border-gray-300 text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
            >
              View All Services
            </Link>
          </div>
        </div>

        {/* CTA Section */}
        <CallToAction 
          type="services"
          serviceName={service.title}
          title={`Ready to get started with ${service.title}?`}
          subtitle="Contact us today to discuss how we can help you achieve your goals with our professional services."
          primaryButtonText="Schedule Consultation"
          secondaryButtonText="Get Quote"
        />
      </div>

      {/* Quote Request Bar */}
      <QuoteRequestBar service={service} />
    </main>
  );
};

export default ServiceDetail;
