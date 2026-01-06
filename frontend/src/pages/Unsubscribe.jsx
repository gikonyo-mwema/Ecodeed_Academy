import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button, Alert, Spinner } from 'flowbite-react';
import { HiCheckCircle, HiXCircle } from 'react-icons/hi';

export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const { theme } = useSelector((state) => state.theme);
  const [status, setStatus] = useState('loading'); // loading, success, error, not-found
  const [message, setMessage] = useState('');
  const email = searchParams.get('email');

  useEffect(() => {
    const handleUnsubscribe = async () => {
      if (!email) {
        setStatus('error');
        setMessage('No email address provided');
        return;
      }

      try {
        const response = await fetch(`/api/messages/newsletter/unsubscribe?email=${encodeURIComponent(email)}`, {
          method: 'GET',
          credentials: 'include',
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.message || 'Failed to unsubscribe');
        }
      } catch (error) {
        console.error('Unsubscribe error:', error);
        setStatus('error');
        setMessage('An error occurred while processing your request');
      }
    };

    handleUnsubscribe();
  }, [email]);

  const logoUrl = theme === "light"
    ? "https://res.cloudinary.com/dcrubaesi/image/upload/v1753007363/ECODEED_BLACK_LOGO_xtwjoy.png"
    : "https://res.cloudinary.com/dcrubaesi/image/upload/v1737333837/ECODEED_COLORED_LOGO_wj2yy8.png";

  return (
    <div className={`min-h-screen ${theme === "light" ? "bg-gray-50" : "bg-brand-blue"}`}>
      {/* Header */}
      <div className={`py-6 px-4 ${theme === "light" ? "bg-white shadow-sm" : "bg-brand-blue"}`}>
        <div className="max-w-6xl mx-auto flex justify-center">
          <Link to="/" className="flex items-center">
            <img src={logoUrl} alt="Ecodeed Logo" className="h-16 w-16 mr-3" />
            <h2 className={`text-2xl font-bold ${theme === "light" ? "text-brand-blue" : "text-white"}`}>
              Ecodeed Consultancy
            </h2>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center`}>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Newsletter Unsubscribe
          </h1>

          {status === 'loading' && (
            <div className="flex flex-col items-center space-y-4">
              <Spinner size="xl" />
              <p className="text-gray-600 dark:text-gray-300">
                Processing your unsubscribe request...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <HiCheckCircle className="mx-auto text-6xl text-green-500" />
              <Alert color="success" className="text-left">
                <span className="font-medium">Successfully unsubscribed!</span> {message}
              </Alert>
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-300">
                  You have been successfully unsubscribed from our newsletter.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  If you change your mind, you can always resubscribe on our website.
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <HiXCircle className="mx-auto text-6xl text-red-500" />
              <Alert color="failure" className="text-left">
                <span className="font-medium">Unsubscribe failed!</span> {message}
              </Alert>
              <p className="text-gray-600 dark:text-gray-300">
                If you continue to experience issues, please contact us directly at{' '}
                <a 
                  href="mailto:contact@ecodeed.co.ke" 
                  className="text-brand-green hover:underline"
                >
                  contact@ecodeed.co.ke
                </a>
              </p>
            </div>
          )}

          <div className="mt-8 space-y-4">
            <Link to="/">
              <Button 
                gradientDuoTone="greenToBlue" 
                className="w-full sm:w-auto"
              >
                Back to Homepage
              </Button>
            </Link>
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Thank you for supporting environmental sustainability! 🌱</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
