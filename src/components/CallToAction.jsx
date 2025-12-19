import React, { useState } from 'react';
import { Button } from 'flowbite-react';
import { Link } from 'react-router-dom';
import { 
  FiArrowRight, 
  FiCalendar, 
  FiMail, 
  FiCheckCircle,
  FiBookOpen,
  FiUsers,
  FiStar
} from 'react-icons/fi';

function CallToAction({ 
  type = 'blog', 
  title, 
  subtitle, 
  primaryButtonText, 
  secondaryButtonText, 
  serviceName,
  showNewsletter = false,
  className = '' 
}) {
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');

  // Handle newsletter signup
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setNewsletterStatus('subscribing');
    
    try {
      const response = await fetch('/api/messages/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim() }),
      });

      if (response.ok) {
        setNewsletterStatus('success');
        setEmail('');
        setTimeout(() => setNewsletterStatus(''), 5000);
      } else {
        setNewsletterStatus('error');
        setTimeout(() => setNewsletterStatus(''), 5000);
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setNewsletterStatus('error');
      setTimeout(() => setNewsletterStatus(''), 5000);
    }
  };

  // Different CTA configurations based on type
  const getCtaConfig = () => {
    switch (type) {
      case 'service':
        return {
          title: title || `Ready to get started with ${serviceName}?`,
          subtitle: subtitle || 'Contact us today to discuss how we can help with your specific needs.',
          primaryText: primaryButtonText || 'Schedule Consultation',
          secondaryText: secondaryButtonText || 'Get Quote',
          icon: <FiUsers className="text-2xl" />
        };
      
      case 'newsletter':
        return {
          title: title || 'Stay Connected with Our Updates! 🌟',
          subtitle: subtitle || 'Join our newsletter for industry insights and exclusive offers.',
          showNewsletterOnly: true,
          icon: <FiMail className="text-2xl" />
        };
      
      case 'services':
        return {
          title: title || 'Looking for Professional Environmental Services?',
          subtitle: subtitle || 'Discover our comprehensive environmental consulting and audit services tailored to your needs.',
          primaryText: primaryButtonText || 'Explore Services',
          secondaryText: secondaryButtonText || 'Learn More',
          icon: <FiStar className="text-2xl" />
        };
      
      case 'blog':
      default:
        return {
          title: title || 'Need Environmental Consulting Services?',
          subtitle: subtitle || 'Explore our comprehensive environmental impact assessment and audit services.',
          primaryText: primaryButtonText || 'View Services',
          secondaryText: secondaryButtonText || 'Contact Us',
          icon: <FiBookOpen className="text-2xl" />
        };
    }
  };

  const config = getCtaConfig();

  // Service CTA
  if (type === 'service') {
    return (
      <section className={`relative overflow-hidden rounded-2xl shadow-xl ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-green to-brand-yellow z-0"></div>
        <div className="absolute right-0 top-0 w-1/3 h-full opacity-10">
          <div className="pattern-dots pattern-brand-blue pattern-opacity-20 pattern-size-4 w-full h-full"></div>
        </div>
        
        <div className="relative z-10 p-6 md:p-8 text-white text-center">
          <div className="flex flex-col items-center">
            <div className="bg-brand-yellow p-3 rounded-full mb-4">
              {config.icon}
            </div>
            <div className="max-w-2xl">
              <h2 className="text-xl md:text-2xl font-bold mb-2">{config.title}</h2>
              <p className="mb-6 opacity-90 text-sm md:text-base">{config.subtitle}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/services"
                  className="inline-flex items-center justify-center px-5 py-3 bg-brand-yellow text-brand-blue rounded-full hover:bg-brand-yellow/90 transition-colors duration-300 font-semibold shadow-md"
                >
                  <FiCalendar className="mr-2" />
                  {config.primaryText}
                </Link>
                {config.secondaryText && (
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center px-5 py-3 border-2 border-white/30 text-white rounded-full hover:bg-white/10 transition-all duration-300 font-medium"
                  >
                    <FiArrowRight className="mr-2" />
                    {config.secondaryText}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Newsletter CTA
  if (type === 'newsletter') {
    return (
      <section className={`rounded-2xl shadow-xl overflow-hidden ${className}`}>
        <div className="bg-gradient-to-r from-brand-green to-brand-yellow text-white">
          <div className="p-6 md:p-8 text-center">
            <div className="flex flex-col items-center mb-6">
              <div className="bg-brand-yellow p-3 rounded-full mb-4">
                {config.icon}
              </div>
              <div className="max-w-2xl">
                <h2 className="text-xl md:text-2xl font-bold mb-2">{config.title}</h2>
                <p className="opacity-90 text-sm md:text-base">{config.subtitle}</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 items-start max-w-4xl mx-auto">
              <div className="space-y-3 text-left">
                <h3 className="text-lg font-semibold text-brand-yellow text-center md:text-left">What You'll Get:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <FiCheckCircle className="text-brand-yellow flex-shrink-0" />
                    Industry insights and updates
                  </li>
                  <li className="flex items-center gap-2">
                    <FiCheckCircle className="text-brand-yellow flex-shrink-0" />
                    Exclusive offers and promotions
                  </li>
                  <li className="flex items-center gap-2">
                    <FiCheckCircle className="text-brand-yellow flex-shrink-0" />
                    Early access to new services
                  </li>
                </ul>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={newsletterStatus === 'subscribing'}
                      className="w-full px-4 py-3 rounded-full border-0 bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                    />
                    <FiMail className="absolute right-3 top-3.5 text-white/70" />
                  </div>
                  <button
                    type="submit"
                    disabled={newsletterStatus === 'subscribing' || newsletterStatus === 'success'}
                    className="w-full bg-gradient-to-r from-brand-green to-brand-yellow hover:from-brand-green/90 hover:to-brand-yellow/90 disabled:opacity-60 text-white font-semibold py-3 rounded-full transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    {newsletterStatus === 'subscribing' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin"></div>
                        Subscribing...
                      </>
                    ) : newsletterStatus === 'success' ? (
                      <>
                        <FiCheckCircle className="text-lg" />
                        Subscribed!
                      </>
                    ) : (
                      'Subscribe Now'
                    )}
                  </button>
                </form>
                <p className="text-xs text-white/70 mt-2 text-center">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Services CTA
  if (type === 'services') {
    return (
      <div className={`rounded-2xl p-6 bg-gradient-to-r from-brand-green/5 to-brand-yellow/5 shadow-md text-center ${className}`}>
        <div className="flex flex-col items-center">
          <div className="bg-gradient-to-r from-brand-green to-brand-yellow p-3 rounded-full text-white mb-4">
            {config.icon}
          </div>
          
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold text-brand-blue dark:text-white mb-2">
              {config.title}
            </h2>
            <p className="text-brand-blue/80 dark:text-brand-green/80 text-sm mb-6">
              {config.subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link 
                to="/services" 
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-brand-green to-brand-yellow hover:from-brand-green/90 hover:to-brand-yellow/90 text-white font-medium py-3 px-6 rounded-full transition-all shadow-md hover:shadow-lg"
              >
                {config.primaryText}
                <FiArrowRight className="text-sm" />
              </Link>
              
              {config.secondaryText && (
                <Link 
                  to="/contact" 
                  className="flex items-center justify-center gap-2 border border-brand-blue text-brand-blue dark:text-brand-green dark:border-brand-green hover:bg-brand-blue/5 font-medium py-3 px-6 rounded-full transition-all"
                >
                  {config.secondaryText}
                  <FiMail className="text-sm" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Newsletter signup for services types */}
        {showNewsletter && (
          <div className="mt-6 pt-5 border-t border-brand-blue/20 dark:border-brand-green/20">
            <div className="flex flex-col items-center gap-3">
              <div className="text-center">
                <p className="text-sm text-brand-blue dark:text-brand-green font-medium">
                  Stay updated with our latest services:
                </p>
              </div>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
                <div className="relative flex-1">
                  <input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 text-sm rounded-full border border-brand-blue/30 dark:border-brand-green/30 bg-white dark:bg-brand-blue/10 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                  />
                  <FiMail className="absolute right-3 top-2.5 text-brand-blue/40 dark:text-brand-green/40 text-sm" />
                </div>
                <button
                  type="submit"
                  disabled={newsletterStatus === 'subscribing'}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-brand-green to-brand-yellow hover:from-brand-green/90 hover:to-brand-yellow/90 text-white rounded-full transition-all whitespace-nowrap shadow-md hover:shadow-lg"
                >
                  {newsletterStatus === 'subscribing' ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Blog CTA (default)
  return (
    <div className={`rounded-2xl p-6 bg-gradient-to-r from-brand-green/5 to-brand-yellow/5 shadow-md text-center ${className}`}>
      <div className="flex flex-col items-center">
        <div className="bg-gradient-to-r from-brand-green to-brand-yellow p-3 rounded-full text-white mb-4">
          {config.icon}
        </div>
        
        <div className="max-w-2xl">
          <h2 className="text-xl font-bold text-brand-blue dark:text-white mb-2">
            {config.title}
          </h2>
          <p className="text-brand-blue/80 dark:text-brand-green/80 text-sm mb-6">
            {config.subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              to="/services" 
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-brand-green to-brand-yellow hover:from-brand-green/90 hover:to-brand-yellow/90 text-white font-medium py-3 px-6 rounded-full transition-all shadow-md hover:shadow-lg"
            >
              {config.primaryText}
              <FiArrowRight className="text-sm" />
            </Link>
            
            {config.secondaryText && (
              <Link 
                to="/contact" 
                className="flex items-center justify-center gap-2 border border-brand-blue text-brand-blue dark:text-brand-green dark:border-brand-green hover:bg-brand-blue/5 font-medium py-3 px-6 rounded-full transition-all"
              >
                {config.secondaryText}
                <FiMail className="text-sm" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Newsletter signup for blog types */}
      {showNewsletter && (
        <div className="mt-6 pt-5 border-t border-brand-blue/20 dark:border-brand-green/20">
          <div className="flex flex-col items-center gap-3">
            <div className="text-center">
              <p className="text-sm text-brand-blue dark:text-brand-green font-medium">
                Stay updated with our latest services:
              </p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
              <div className="relative flex-1">
                <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 text-sm rounded-full border border-brand-blue/30 dark:border-brand-green/30 bg-white dark:bg-brand-blue/10 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                />
                <FiMail className="absolute right-3 top-2.5 text-brand-blue/40 dark:text-brand-green/40 text-sm" />
              </div>
              <button
                type="submit"
                disabled={newsletterStatus === 'subscribing'}
                className="px-4 py-2 text-sm bg-gradient-to-r from-brand-green to-brand-yellow hover:from-brand-green/90 hover:to-brand-yellow/90 text-white rounded-full transition-all whitespace-nowrap shadow-md hover:shadow-lg"
              >
                {newsletterStatus === 'subscribing' ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CallToAction;