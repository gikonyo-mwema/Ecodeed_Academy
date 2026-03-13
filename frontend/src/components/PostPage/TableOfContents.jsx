/**
 * TableOfContents — Auto-generated from <h2> and <h3> headings in post content.
 *
 * Industry standard for long-form articles (Hashnode, Dev.to, Ghost).
 * Highlights the currently visible heading via IntersectionObserver.
 *
 * @component
 */
import { useEffect, useMemo, useState } from 'react';
import { FiList } from 'react-icons/fi';

/**
 * Parse headings from HTML string.
 * Returns an array of { id, text, level } objects.
 */
function parseHeadings(html) {
  if (!html) return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const headings = doc.querySelectorAll('h2, h3');
  return Array.from(headings).map((el, i) => {
    const id = el.id || `heading-${i}`;
    return {
      id,
      text: el.textContent.trim(),
      level: parseInt(el.tagName[1], 10), // 2 or 3
    };
  });
}

export default function TableOfContents({ contentHtml, className = '' }) {
  const headings = useMemo(() => parseHeadings(contentHtml), [contentHtml]);
  const [activeId, setActiveId] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  // Observe which heading is in view
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 3) return null; // Only show for long articles

  return (
    <nav
      aria-label="Table of contents"
      className={`mb-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 ${className}`}
    >
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-2 w-full p-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-brand-green transition-colors"
        aria-expanded={isOpen}
      >
        <FiList className="w-4 h-4" />
        Table of Contents
        <span className="ml-auto text-xs text-gray-400">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <ol className="px-4 pb-4 space-y-1 list-none">
          {headings.map(({ id, text, level }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(id);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    // Update URL hash without jump
                    window.history.replaceState(null, '', `#${id}`);
                    setActiveId(id);
                  }
                }}
                className={`block text-sm py-1 border-l-2 transition-colors ${
                  level === 3 ? 'pl-6' : 'pl-3'
                } ${
                  activeId === id
                    ? 'border-brand-green text-brand-green font-medium'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-brand-green hover:border-gray-300'
                }`}
              >
                {text}
              </a>
            </li>
          ))}
        </ol>
      )}
    </nav>
  );
}
