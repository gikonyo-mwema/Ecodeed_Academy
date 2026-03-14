/**
 * TermsOfService Page — Legal terms and conditions documentation
 *
 * @component
 * @purpose Display Ecodeed Consulting's terms of service and user agreement
 * @sections
 *   1. Acceptance of Terms - User agreement to ToS
 *   2. Account Registration - Account creation requirements
 *   3. Acceptable Use - Prohibited behavior and content
 *   4. Intellectual Property - Copyright and licensing
 *   5. Limitation of Liability - Legal disclaimers
 *   6. Termination - Account suspension/removal conditions
 *   7. Changes to Terms - How updates are communicated
 *   8. Contact - Support and inquiry information
 * @features
 *   - Styled prose/markdown-like formatting
 *   - Dark mode support
 *   - Responsive layout
 *   - Last updated date tracking
 *   - Internal links (e.g., to Privacy Policy)
 * @content
 *   Static HTML content (no API calls)
 *   Last updated: 5 March 2026
 * @example
 *   <Route path=\"/terms\" element={<TermsOfService />} />
 * @version 2.0.0
 * @author Gikonyo Mwema
 */
import React from 'react';
import { Link } from 'react-router-dom';

const LAST_UPDATED = '5 March 2026';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero */}
      <section className="bg-brand-blue text-white py-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl text-center">
          <h1 className="text-4xl font-bold mb-3">Terms of Service</h1>
          <p className="text-gray-300">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl prose dark:prose-invert prose-headings:text-brand-blue dark:prose-headings:text-white prose-a:text-brand-green">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using the Ecodeed platform (&ldquo;the Platform&rdquo;), you
            agree to be bound by these Terms of Service. If you do not agree, please do not use the
            Platform.
          </p>

          <h2>2. Accounts</h2>
          <ul>
            <li>You must provide accurate and complete information when creating an account.</li>
            <li>You are responsible for maintaining the security of your account credentials.</li>
            <li>You must be at least 18 years old to create an account.</li>
            <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
          </ul>

          <h2>3. Course Enrolment &amp; Payments</h2>
          <ul>
            <li>Free courses are available immediately upon enrolment.</li>
            <li>Paid courses require successful payment via our payment provider (Paystack) before access is granted.</li>
            <li>All prices are listed in Kenya Shillings (KES) unless otherwise stated.</li>
            <li>Refund requests must be submitted within 7 days of purchase and before completing more than 30% of the course content.</li>
          </ul>

          <h2>4. Intellectual Property</h2>
          <p>
            All course content, materials, logos, and trademarks on the Platform are owned by Ecodeed
            Consulting or its licensors. You may not reproduce, distribute, or create derivative works
            from any Platform content without express written permission.
          </p>

          <h2>5. User Conduct</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Share your account credentials or course access with others</li>
            <li>Download, copy, or redistribute course materials</li>
            <li>Post harmful, offensive, or misleading content in comments or forums</li>
            <li>Attempt to disrupt or compromise the Platform&rsquo;s security</li>
          </ul>

          <h2>6. Instructor Responsibilities</h2>
          <p>If you are an instructor on the Platform, you additionally agree to:</p>
          <ul>
            <li>Provide accurate, original, and high-quality course content</li>
            <li>Respond to student queries in a timely manner</li>
            <li>Not upload content that infringes on third-party intellectual property rights</li>
          </ul>

          <h2>7. Limitation of Liability</h2>
          <p>
            Ecodeed Consulting provides the Platform &ldquo;as is&rdquo;. We do not guarantee
            uninterrupted access or that the Platform will be error-free. To the fullest extent
            permitted by law, we are not liable for any indirect, incidental, or consequential damages
            arising from your use of the Platform.
          </p>

          <h2>8. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the Republic of Kenya. Any disputes shall be
            resolved in the courts of Nairobi, Kenya.
          </p>

          <h2>9. Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. Continued use of the Platform after changes
            constitutes acceptance of the updated Terms. We will notify registered users of material
            changes via email.
          </p>

          <h2>10. Contact</h2>
          <p>
            Questions about these Terms? Contact us at{' '}
            <a href="mailto:info@ecodeed.co.ke">info@ecodeed.co.ke</a> or visit our{' '}
            <Link to="/contact">Contact page</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
