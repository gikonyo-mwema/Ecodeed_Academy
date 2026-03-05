/**
 * PostContent — Safely renders sanitized HTML content with enhancements.
 *
 * Industry-standard improvements:
 *  1. DOMPurify sanitization (XSS prevention)
 *  2. Inject `loading="lazy"` and `decoding="async"` on all <img> tags
 *  3. Wrap images in responsive containers
 *  4. Code syntax highlighting via highlight.js
 *  5. Add IDs to headings for table-of-contents linking
 *  6. Handle YouTube / iframe embeds responsively
 *
 * @component
 */
import { useMemo } from 'react';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js/lib/core';

// Register only languages you expect in blog posts (keeps bundle small)
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml'; // also covers HTML
import json from 'highlight.js/lib/languages/json';
import sql from 'highlight.js/lib/languages/sql';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('css', css);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('json', json);
hljs.registerLanguage('sql', sql);

// Import a highlight.js theme — using github-dark which works well in both modes
import 'highlight.js/styles/github-dark.css';

// ---------------------------------------------------------------------------
// Configure DOMPurify: allow safe tags the editor produces
// ---------------------------------------------------------------------------
const PURIFY_CONFIG = {
  ALLOWED_TAGS: [
    'a', 'abbr', 'b', 'blockquote', 'br', 'code', 'div', 'em', 'figcaption',
    'figure', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'iframe', 'img',
    'li', 'ol', 'p', 'pre', 's', 'span', 'strong', 'sub', 'sup', 'table',
    'tbody', 'td', 'th', 'thead', 'tr', 'u', 'ul', 'video', 'source',
  ],
  ALLOWED_ATTR: [
    'href', 'title', 'target', 'rel', 'src', 'alt', 'width', 'height',
    'class', 'style', 'id', 'loading', 'decoding', 'data-cloudinary-id',
    'frameborder', 'allowfullscreen', 'allow', 'controls', 'type',
    'colspan', 'rowspan',
  ],
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: ['target'], // allow target="_blank"
};

// ---------------------------------------------------------------------------
// Post-sanitization HTML transforms
// ---------------------------------------------------------------------------
function enhanceHtml(html) {
  if (!html) return '';

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // --- 1. Enhance images: lazy load, async decode, responsive wrapper ---
  doc.querySelectorAll('img').forEach((img) => {
    img.setAttribute('loading', 'lazy');
    img.setAttribute('decoding', 'async');
    if (!img.getAttribute('alt')) img.setAttribute('alt', 'Post image');

    // Wrap in responsive figure if not already wrapped
    const parent = img.parentElement;
    if (parent?.tagName !== 'FIGURE') {
      const figure = doc.createElement('figure');
      figure.className = 'post-image-wrapper my-6';
      parent.insertBefore(figure, img);
      figure.appendChild(img);
    }
  });

  // --- 2. Add IDs to headings for TOC linking ---
  let headingCounter = 0;
  doc.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
    if (!h.id) {
      h.id = `heading-${headingCounter++}`;
    }
    // Add a subtle anchor link indicator
    h.classList.add('scroll-mt-20'); // offset for fixed header
  });

  // --- 3. Syntax-highlight code blocks ---
  doc.querySelectorAll('pre code, pre').forEach((block) => {
    const codeEl = block.tagName === 'PRE' ? block.querySelector('code') || block : block;
    try {
      const result = hljs.highlightAuto(codeEl.textContent);
      codeEl.innerHTML = result.value;
      codeEl.classList.add('hljs');
    } catch {
      // Silently skip unhighlightable blocks
    }
  });

  // --- 4. Make iframes responsive (YouTube embeds) ---
  doc.querySelectorAll('iframe').forEach((iframe) => {
    const parent = iframe.parentElement;
    if (!parent?.classList?.contains('iframe-wrapper')) {
      const wrapper = doc.createElement('div');
      wrapper.className = 'iframe-wrapper relative w-full my-6';
      wrapper.style.paddingBottom = '56.25%'; // 16:9
      wrapper.style.height = '0';
      wrapper.style.overflow = 'hidden';
      iframe.style.position = 'absolute';
      iframe.style.top = '0';
      iframe.style.left = '0';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      parent.insertBefore(wrapper, iframe);
      wrapper.appendChild(iframe);
    }
  });

  // --- 5. Make external links open in new tab ---
  doc.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    }
  });

  return doc.body.innerHTML;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function PostContent({ html, className = '' }) {
  const sanitizedHtml = useMemo(() => {
    if (!html) return '';
    const clean = DOMPurify.sanitize(html, PURIFY_CONFIG);
    return enhanceHtml(clean);
  }, [html]);

  return (
    <div
      className={`
        prose prose-lg dark:prose-invert max-w-none
        prose-headings:scroll-mt-20
        prose-img:rounded-lg prose-img:shadow-md
        prose-a:text-brand-green prose-a:no-underline hover:prose-a:underline
        prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-gray-900 prose-pre:rounded-lg
        post-content
        ${className}
      `}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
