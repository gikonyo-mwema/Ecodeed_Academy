/**
 * Pagination Component
 * 
 * Provides pagination controls for paginated content lists.
 * Displays page numbers with navigation buttons.
 * 
 * Features:
 * - Dynamic page number calculation
 * - Previous/Next navigation
 * - Smart page number display (shows limited range)
 * - Smooth scroll to top on page change
 * - Mobile-responsive design
 * - Current page highlighting
 * 
 * Props:
 * - currentPage: Current active page number
 * - totalPages: Total number of available pages
 * - onPageChange: Callback function when page changes
 * 
 * Usage:
 * <Pagination 
 *   currentPage={page}
 *   totalPages={Math.ceil(posts.length / 10)}
 *   onPageChange={(newPage) => setPage(newPage)}
 * />
 * 
 * @component
 * @version 1.0.0
 * @author Gikonyo Mwema
 */

import React from 'react';

/**
 * Pagination - Navigation for paginated content
 * 
 * @param {Object} props - Component props
 * @param {number} props.currentPage - Current page number
 * @param {number} props.totalPages - Total pages available
 * @param {Function} props.onPageChange - Callback for page change
 * @returns {JSX.Element} Pagination controls
 */
export default function Pagination({ currentPage, totalPages, onPageChange }) {
  // Smoothly scroll to top on page change to avoid jumpiness
  const handlePageChange = (page) => {
    if (typeof onPageChange === 'function') {
      onPageChange(page);
    }
    // Smooth scroll to top after changing page content
    if (typeof window !== 'undefined' && window.scrollTo) {
      // Use requestAnimationFrame to ensure DOM updates begin before scroll
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  };
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      if (startPage > 1) pages.push(1);
      if (startPage > 2) pages.push('...');
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < totalPages - 1) pages.push('...');
      if (endPage < totalPages) pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="flex justify-center mt-8">
      <nav className="flex items-center gap-1">
        <button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-md border text-brand-green border-brand-green hover:bg-brand-green hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-400 disabled:border-gray-200 transition-colors"
        >
          Previous
        </button>
        
        {getPageNumbers().map((number, index) => (
          number === '...' ? (
            <span key={index} className="px-3 py-1">...</span>
          ) : (
            <button
              key={index}
              onClick={() => handlePageChange(number)}
              className={`px-3 py-2 rounded-md border transition-colors ${
                currentPage === number
                  ? 'bg-brand-green text-white border-brand-green'
                  : 'bg-white text-brand-green border-brand-green hover:bg-brand-green hover:text-white'
              }`}
            >
              {number}
            </button>
          )
        ))}
        
        <button
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-md border text-brand-green border-brand-green hover:bg-brand-green hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-400 disabled:border-gray-200 transition-colors"
        >
          Next
        </button>
      </nav>
    </div>
  );
}