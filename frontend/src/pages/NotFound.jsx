import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineEmojiSad } from 'react-icons/hi';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-extrabold text-brand-green mb-2">404</h1>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
          <HiOutlineEmojiSad className="h-16 w-16 text-brand-yellow" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Page Not Found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          The page you&rsquo;re looking for doesn&rsquo;t exist or has been
          moved. Let&rsquo;s get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-brand-green hover:bg-green-700 text-white font-medium py-2.5 px-6 rounded-lg transition"
          >
            Go Home
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-brand-green hover:text-brand-green font-medium py-2.5 px-6 rounded-lg transition"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
