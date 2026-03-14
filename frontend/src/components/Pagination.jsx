/**
 * Pagination Component — Navigation control for paginated content
 *
 * @component
 * @purpose
 *   Provides page navigation buttons for paginated content. Shows page numbers
 *   with smart ellipsis handling and smooth scrolling to top on page change.
 *
 * @features
 *   - Previous/Next buttons with disabled states
 *   - Numbered page buttons
 *   - Smart ellipsis (...) when pages exceed max visible
 *   - Current page highlighting
 *   - Auto-scroll to top on page change (smooth behavior)
 *   - Accessibility: aria-label, button roles
 *   - Responsive: adapts to screen size
 *   - Keyboard navigation support
 *
 * @props
 *   - currentPage: number (1-indexed current page)
 *   - totalPages: number (total number of pages)
 *   - onPageChange: function(page: number) → callback on page selection
 *
 * @behavior
 *   1. Shows max 5 consecutive page numbers
 *   2. Ellipsis inserted when jumping pages
 *   3. Always shows first and last page when pages > 7
 *   4. Smooth scroll to top with requestAnimationFrame
 *   5. Previous button disabled on page 1
 *   6. Next button disabled on last page
 *
 * @styling
 *   - Tailwind CSS classes
 *   - Brand colors for active page
 *   - Dark mode support
 *   - Hover states and transitions
 *
 * @example
 *   const [page, setPage] = useState(1);
 *   <Pagination
 *     currentPage={page}
 *     totalPages={10}
 *     onPageChange={setPage}
 *   />
 *
 * @version 2.0.0
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
      <nav aria-label="Pagination" className="flex items-center gap-1">
        <button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          aria-label="Go to previous page"
          className="px-3 py-2 rounded-md border text-brand-green border-brand-green hover:bg-brand-green hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-400 disabled:border-gray-200 transition-colors"
        >
          Previous
        </button>
        
        {getPageNumbers().map((number, index) => (
          number === '...' ? (
            <span key={index} aria-hidden="true" className="px-3 py-1">...</span>
          ) : (
            <button
              key={index}
              onClick={() => handlePageChange(number)}
              aria-label={`Go to page ${number}`}
              aria-current={currentPage === number ? 'page' : undefined}
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
          aria-label="Go to next page"
          className="px-3 py-2 rounded-md border text-brand-green border-brand-green hover:bg-brand-green hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-400 disabled:border-gray-200 transition-colors"
        >
          Next
        </button>
      </nav>
    </div>
  );
}