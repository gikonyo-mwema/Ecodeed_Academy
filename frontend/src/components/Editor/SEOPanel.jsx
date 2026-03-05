/**
 * SEOPanel — Collapsible sidebar / section for post SEO fields.
 *
 * Mirrors what WordPress (Yoast), Ghost, and Hashnode provide:
 *  - Meta title (separate from post title — optimised for Google)
 *  - Meta description (Google snippet text)
 *  - Canonical URL
 *  - OG image + Twitter image overrides
 *  - Live Google SERP preview
 *
 * @component
 */
import { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiSearch, FiEye } from 'react-icons/fi';

const MAX_META_TITLE = 60;
const MAX_META_DESC = 160;

function CharCount({ current, max }) {
  const over = current > max;
  return (
    <span className={`text-xs tabular-nums ${over ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
      {current}/{max}
    </span>
  );
}

/**
 * Live Google SERP preview (like Yoast).
 */
function SerpPreview({ title, description, slug }) {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ecodeedacademy.com';
  const displayUrl = `${siteUrl} › post › ${slug || 'your-post-slug'}`;

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
      <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
        <FiEye size={12} /> Google search preview
      </p>
      <p className="text-sm text-green-700 dark:text-green-400 truncate">{displayUrl}</p>
      <p className="text-lg text-blue-700 dark:text-blue-400 font-medium leading-snug line-clamp-1 hover:underline cursor-pointer">
        {title || 'Post Title — Ecodeed Academy'}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-0.5">
        {description || 'Add a meta description to control how this post appears in search results…'}
      </p>
    </div>
  );
}

export default function SEOPanel({ formData, onChange }) {
  const [open, setOpen] = useState(false);

  const update = (field, value) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
          <FiSearch size={16} />
          SEO Settings
          {(formData.meta_title || formData.meta_description) && (
            <span className="text-xs text-teal-500">● configured</span>
          )}
        </span>
        {open ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
      </button>

      {open && (
        <div className="p-4 space-y-4 bg-white dark:bg-gray-900">
          {/* SERP Preview */}
          <SerpPreview
            title={formData.meta_title || formData.title}
            description={formData.meta_description}
            slug={formData.slug}
          />

          {/* Meta title */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Meta Title
              </label>
              <CharCount current={formData.meta_title?.length || 0} max={MAX_META_TITLE} />
            </div>
            <input
              type="text"
              value={formData.meta_title || ''}
              onChange={(e) => update('meta_title', e.target.value)}
              placeholder={formData.title || 'Optimised title for search engines'}
              className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-transparent dark:text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Leave blank to use the post title. Keep under {MAX_META_TITLE} characters.
            </p>
          </div>

          {/* Meta description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Meta Description
              </label>
              <CharCount current={formData.meta_description?.length || 0} max={MAX_META_DESC} />
            </div>
            <textarea
              value={formData.meta_description || ''}
              onChange={(e) => update('meta_description', e.target.value)}
              placeholder="Compelling 1-2 sentence summary for Google results…"
              rows={3}
              className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-transparent dark:text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 resize-none"
            />
          </div>

          {/* Canonical URL */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
              Canonical URL
            </label>
            <input
              type="url"
              value={formData.canonical_url || ''}
              onChange={(e) => update('canonical_url', e.target.value)}
              placeholder="https://… (leave blank to auto-generate)"
              className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-transparent dark:text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Use if this content was first published elsewhere (prevents duplicate-content penalty).
            </p>
          </div>

          {/* OG Image */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
              Social Image (Open Graph)
            </label>
            <input
              type="url"
              value={formData.og_image || ''}
              onChange={(e) => update('og_image', e.target.value)}
              placeholder="https://… (defaults to featured image)"
              className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-transparent dark:text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          {/* Twitter Image */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
              Twitter Card Image
            </label>
            <input
              type="url"
              value={formData.twitter_image || ''}
              onChange={(e) => update('twitter_image', e.target.value)}
              placeholder="https://… (defaults to OG image)"
              className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-transparent dark:text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
