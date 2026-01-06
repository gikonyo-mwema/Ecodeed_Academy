import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function DataDeletion() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (email !== confirmEmail) {
      setError('Email addresses do not match');
      return;
    }

    setLoading(true);

    try {
      // If user is logged in, we can use their authenticated session
      // Otherwise, we submit a deletion request for review
      const endpoint = currentUser 
        ? '/api/auth/delete-account/' 
        : '/api/auth/data-deletion-request/';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          reason,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to submit deletion request. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Deletion Request Submitted
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Your data deletion request has been received. We will process your request within 30 days 
            and send a confirmation to your email address.
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            If you have any questions, please contact us at{' '}
            <a href="mailto:joseph.mwemake@gmail.com" className="text-teal-600 hover:text-teal-700">
              joseph.mwemake@gmail.com
            </a>
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Delete Your Data
          </h1>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <h3 className="text-yellow-800 dark:text-yellow-200 font-semibold mb-2">
              ⚠️ Important Information
            </h3>
            <p className="text-yellow-700 dark:text-yellow-300 text-sm">
              Deleting your data is permanent and cannot be undone. This will remove:
            </p>
            <ul className="list-disc list-inside text-yellow-700 dark:text-yellow-300 text-sm mt-2 ml-2">
              <li>Your account and profile information</li>
              <li>Course enrollment history</li>
              <li>Any content you have created</li>
              <li>Social login connections (Google, Facebook, Twitter)</li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              What data do we store?
            </h2>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
              <li>Email address</li>
              <li>Name (if provided)</li>
              <li>Profile picture (if using social login)</li>
              <li>Course enrollment and progress data</li>
              <li>Account activity logs</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label htmlFor="confirmEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm Email Address
              </label>
              <input
                type="email"
                id="confirmEmail"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Confirm your email address"
              />
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reason for Deletion (Optional)
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Help us improve by telling us why you're leaving..."
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                id="confirm"
                required
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <label htmlFor="confirm" className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                I understand that this action is permanent and cannot be undone
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                       font-semibold"
            >
              {loading ? 'Processing...' : 'Request Data Deletion'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Alternative: Contact Us Directly
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              If you prefer, you can also request data deletion by emailing us directly at{' '}
              <a href="mailto:joseph.mwemake@gmail.com" className="text-teal-600 hover:text-teal-700">
                joseph.mwemake@gmail.com
              </a>
              . Please include "Data Deletion Request" in the subject line.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
