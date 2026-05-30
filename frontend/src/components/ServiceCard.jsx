/**
 * ServiceCard Component — Individual service display card with icon and details
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════════════════════
 *
 * Renders a single service card with animated entrance, icon, title, description,
 * features list, and call-to-action link. Supports both emoji and SVG icon formats.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * FEATURES
 * ═══════════════════════════════════════════════════════════════════════════════════
 *
 * 1. **Icon Rendering**
 *    - Emoji icons (primary, Unicode regex-validated)
 *    - Legacy SVG icon fallback (EIA, audit, policy, climate)
 *    - Graceful fallback to generic box icon
 *    - Responsive sizing and styling
 *
 * 2. **Visual Design**
 *    - Framer Motion animations (entrance, hover)
 *    - Gradient top border (blue to green)
 *    - Hover shadow elevation
 *    - Icon background with gradient
 *    - Smooth transitions (500ms)
 *    - Y-axis lift on hover (-5px)
 *
 * 3. **Content Sections**
 *    - Service title (prominent heading)
 *    - Brief description text
 *    - Features list (up to 5 items)
 *    - Price/rate information (optional)
 *    - \"Learn More\" CTA link
 *
 * 4. **Theme Support**
 *    - Dark mode aware colors
 *    - Brand color consistency (blue, green, yellow)
 *    - Text color adaptation
 *
 * 5. **Responsive**
 *    - Grid-friendly container
 *    - Full height flex layout
 *    - Mobile-optimized touch targets
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * PROPS
 * ═══════════════════════════════════════════════════════════════════════════════════
 *
 * - service: object
 *   - id: unique identifier
 *   - title: service name
 *   - description: short description
 *   - icon: emoji string or legacy icon filename
 *   - features: Array<string> (feature list)
 *   - price: string (rate or pricing info)
 *   - slug: URL slug for detail page
 *
 * - className: string (optional, additional CSS classes)
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * HELPER FUNCTIONS
 * ═══════════════════════════════════════════════════════════════════════════════════
 *
 * getIconComponent(iconName: string): ReactNode
 *   Returns the appropriate icon component based on format:
 *   - Emoji regex test for Unicode emoji characters
 *   - Legacy SVG mapping for old icon filenames
 *   - Default box icon fallback
 *
 * @component
 * @version 2.0.0
 * @author Gikonyo Mwema
 * @example
 *   <ServiceCard service={serviceObj} className=\"col-span-1\" />
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiClipboard,
  FiFileText,
  FiShield,
  FiZap,
  FiBox,
} from 'react-icons/fi';

export default function ServiceCard({ service, className = '' }) {
  const getIconComponent = (iconName) => {
    const iconClass = 'w-8 h-8 text-brand-blue dark:text-brand-green';
    
    // Handle emoji icons (new format from admin dashboard)
    if (iconName && /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(iconName)) {
      return (
        <span 
          className="text-4xl leading-none" 
          style={{ 
            fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Segoe UI Symbol", "Android Emoji", "EmojiSymbols", sans-serif',
            textRendering: 'optimizeLegibility'
          }}
        >
          {iconName}
        </span>
      );
    }
    
    // Handle legacy icon names (fallback for old data)
    switch (iconName) {
      case 'eia-icon.svg':
        return <FiClipboard className={iconClass} />;
      case 'audit-icon.svg':
        return <FiFileText className={iconClass} />;
      case 'policy-icon.svg':
        return <FiShield className={iconClass} />;
      case 'climate-icon.svg':
        return <FiZap className={iconClass} />;
      default:
        return <FiBox className={iconClass} />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className={`group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl overflow-hidden transition-all duration-500 h-full flex flex-col border-0 ${className}`}
    >
      {/* Gradient top border for visual interest */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-blue to-brand-green"></div>
      
      {/* Icon with better styling */}
      <div className="relative p-8 pb-4">
        <div className="w-20 h-20 mx-auto flex items-center justify-center rounded-2xl bg-gradient-to-br from-brand-blue/10 to-brand-green/10 text-brand-blue dark:text-brand-green group-hover:from-brand-blue/20 group-hover:to-brand-green/20 transition-all duration-500 shadow-inner">
          {getIconComponent(service.icon)}
        </div>
      </div>

      {/* Content with better spacing */}
      <div className="p-8 pt-0 flex flex-col flex-grow items-center text-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-brand-green transition-colors duration-300">
          {service.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3 leading-relaxed">
          {service.shortDescription}
        </p>

        {/* Enhanced CTA button */}
        <Link
          to={`/services/${service.slug || service._id}`}
          className="mt-auto inline-flex items-center justify-center px-6 py-3 bg-transparent border-2 border-brand-blue text-brand-blue dark:border-brand-green dark:text-brand-green rounded-full font-semibold hover:bg-brand-blue hover:text-white dark:hover:bg-brand-green dark:hover:text-gray-900 transition-all duration-300 group/link transform hover:-translate-y-1"
          aria-label={`Learn more about ${service.title}`}
        >
          Learn more
          <svg
            className="w-5 h-5 ml-2 transition-transform duration-300 group-hover/link:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </motion.div>
  );
}
