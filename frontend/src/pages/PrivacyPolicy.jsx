/**
 * PrivacyPolicy Page — Legal privacy policy documentation
 *
 * @component
 * @purpose Display Ecodeed Consulting's privacy policy and data handling practices
 * @sections
 *   1. Introduction - Company privacy commitment
 *   2. Information We Collect - Personal data and usage data
 *   3. How We Use Your Data - Purpose for data collection
 *   4. Data Security - Encryption and protection measures
 *   5. Your Rights - GDPR and data subject rights
 *   6. Third-Party Services - Integrations (Firebase, Cloudinary, Paystack)
 *   7. Contact Us - Privacy inquiry contact information
 * @features
 *   - Styled prose/markdown-like formatting
 *   - Dark mode support
 *   - Responsive layout
 *   - Last updated date tracking
 *   - Internal links (e.g., to Terms)
 * @content
 *   Static HTML content (no API calls)
 *   Last updated: 5 March 2026
 * @example
 *   <Route path=\"/privacy\" element={<PrivacyPolicy />} />
 * @version 2.0.0
 * @author Gikonyo Mwema
 */
import React from 'react';
import { Link } from 'react-router-dom';

const LAST_UPDATED = '5 March 2026';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero */}
      <section className="bg-brand-blue text-white py-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl text-center">
          <h1 className="text-4xl font-bold mb-3">Privacy Policy</h1>
          <p className="text-gray-300">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl prose dark:prose-invert prose-headings:text-brand-blue dark:prose-headings:text-white prose-a:text-brand-green">
          <h2>1. Introduction</h2>
          <p>
            Ecodeed Consulting (&ldquo;Ecodeed&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is committed to
            protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and
            safeguard your information when you visit our website and use the Ecodeed platform.
          </p>

          <h2>2. Information We Collect</h2>
          <h3>Personal Information</h3>
          <p>When you register, enrol in a course, or contact us we may collect:</p>
          <ul>
            <li>Full name, email address, and phone number</li>
            <li>Account credentials (hashed passwords &mdash; we never store plain text)</li>
            <li>Profile picture (optional)</li>
            <li>Payment information (processed securely via Paystack; we do not store card details)</li>
          </ul>

          <h3>Usage Data</h3>
          <p>We automatically collect certain information when you use the platform, including:</p>
          <ul>
            <li>IP address, browser type, and device information</li>
            <li>Pages visited and time spent</li>
            <li>Course progress and completion data</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <ul>
            <li>To provide and maintain our services</li>
            <li>To process course enrolments and payments</li>
            <li>To send transactional emails (enrolment confirmations, password resets)</li>
            <li>To send newsletters and marketing communications (only with your consent; you can unsubscribe any time)</li>
            <li>To improve our platform and user experience</li>
            <li>To comply with legal obligations</li>
          </ul>

          <h2>4. Data Sharing</h2>
          <p>
            We do not sell your personal data. We may share information with trusted third-party
            service providers (Paystack for payments, Brevo for emails, Cloudinary for media hosting)
            strictly to operate our services. Each provider is contractually bound to protect your data.
          </p>

          <h2>5. Data Retention</h2>
          <p>
            We retain your personal data for as long as your account is active or as needed to provide
            services. You may request account deletion by contacting us at{' '}
            <a href="mailto:info@ecodeed.co.ke">info@ecodeed.co.ke</a>.
          </p>

          <h2>6. Your Rights</h2>
          <p>Under the Kenya Data Protection Act 2019, you have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Withdraw consent for marketing communications</li>
          </ul>

          <h2>7. Cookies</h2>
          <p>
            We use essential cookies for authentication and session management. We do not use
            third-party advertising cookies.
          </p>

          <h2>8. Security</h2>
          <p>
            We implement industry-standard security measures including HTTPS encryption, hashed
            passwords, and secure token-based authentication to protect your data.
          </p>

          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. We will notify registered users of material
            changes via email.
          </p>

          <h2>10. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:info@ecodeed.co.ke">info@ecodeed.co.ke</a> or visit our{' '}
            <Link to="/contact">Contact page</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
