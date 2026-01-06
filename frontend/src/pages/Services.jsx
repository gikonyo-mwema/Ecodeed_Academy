import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ServiceCard from '../components/ServiceCard';
import axios from 'axios';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Only fetch published services for the public page
        const res = await axios.get('/api/services?isPublished=true');
        
        // Extract services from the nested response format
        const servicesData = res.data?.data?.services || res.data?.services || res.data || [];
        setServices(servicesData);
      } catch (err) {
        console.error('Failed to fetch services:', err);
        setError('Failed to load services. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Get unique categories from services
  const categories = ['all', ...new Set(services.map(service => service.category).filter(Boolean))];
  
  // Filter services based on selected category
  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(service => service.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-green"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg max-w-md border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-300 font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-brand-green transition-colors duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-sm font-semibold text-brand-green uppercase tracking-wide mb-4">
          What We Offer
        </h2>
        <h1 className="text-4xl sm:text-5xl font-bold text-brand-blue dark:text-white mb-4">
          Our Professional Services
        </h1>
        <div className="w-24 h-1 bg-brand-yellow mx-auto mb-6"></div>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Expert solutions tailored to your specific needs with our industry-leading services
        </p>
      </div>

      {/* Category filtering */}
      {categories.length > 1 && (
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                selectedCategory === category
                  ? 'bg-brand-blue text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {category === 'all' ? 'All Services' : category}
            </button>
          ))}
        </div>
      )}
      
      {filteredServices.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, staggerChildren: 0.1 }}
        >
          {filteredServices.map((service, index) => (
            <motion.div
              key={service._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ServiceCard service={service} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <div className="mx-auto max-w-md px-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
              {selectedCategory === 'all' ? 'No services available' : `No services in ${selectedCategory}`}
            </h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              {selectedCategory === 'all' 
                ? "We're currently updating our service offerings. Please check back soon."
                : `Try selecting a different category or view all services.`
              }
            </p>
            <div className="mt-6">
              {selectedCategory !== 'all' ? (
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-blue hover:bg-brand-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-yellow transition-colors duration-300"
                >
                  View All Services
                </button>
              ) : (
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-blue hover:bg-brand-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-yellow transition-colors duration-300"
                >
                  Refresh
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Services;