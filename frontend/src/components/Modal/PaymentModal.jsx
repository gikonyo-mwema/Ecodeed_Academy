/**
 * PaymentModal Component — Paystack payment processing for course enrollment
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════════════════════
 *
 * Displays a modal for processing course payments via Paystack. Handles payment
 * initialization, verification, and enrollment creation on successful transaction.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * FEATURES
 * ═══════════════════════════════════════════════════════════════════════════════════
 *
 * 1. **Email Input**
 *    - Pre-populated from currentUser.email
 *    - Editable for different payment email
 *    - Validation required before payment
 *
 * 2. **Payment Processing**
 *    - Paystack inline popup integration
 *    - Multiple payment channels: Card, Mobile Money, Bank Transfer
 *    - User selects payment method in Paystack UI
 *    - Currency: KES (Kenyan Shilling)
 *    - Amount in kobo (multiply price by 100)
 *
 * 3. **Payment Verification**
 *    - Backend verification via POST /api/v1/payments/verify
 *    - Reference number from Paystack transaction
 *    - Token-authenticated request
 *    - Creates enrollment on success
 *
 * 4. **State Management**
 *    - Email input state
 *    - Loading state during payment
 *    - Success/error feedback messages
 *    - Auto-dismiss after 2 seconds on success
 *
 * 5. **Error Handling**
 *    - Email validation
 *    - Payment cancellation handling
 *    - API error messages
 *    - User-friendly error display
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * PROPS
 * ═══════════════════════════════════════════════════════════════════════════════════
 *
 * - course: object { id, slug, title, price, ... }\n *   Required for payment amount and metadata\n *
 * - show: boolean\n *   Controls modal visibility\n *
 * - onClose: function(success: boolean) → Dismiss modal\n *   Callback when modal should close\n *   success = true if payment succeeded\n *
 * - user: object { email, id, ... }\n *   Current user for email pre-fill and user context\n *
 * - onSuccess: function() → Payment verification succeeded\n *   Called after successful payment verification\n *\n * ═══════════════════════════════════════════════════════════════════════════════════\n * PAYMENT FLOW\n * ═══════════════════════════════════════════════════════════════════════════════════\n *\n * 1. User enters/confirms email\n * 2. Click \"Pay\" button → Paystack popup opens\n * 3. User selects payment method (Card/Mobile Money/Bank)\n * 4. User completes payment in Paystack UI\n * 5. On success → reference returned to callback\n * 6. Backend POST /api/v1/payments/verify with reference\n * 7. On verification success:\n *    - Show success message (2 sec)\n *    - Call onSuccess callback\n *    - Close modal with success=true\n * 8. On error → Display error message\n *\n * ═══════════════════════════════════════════════════════════════════════════════════\n * API INTEGRATION\n * ═══════════════════════════════════════════════════════════════════════════════════\n *\n * **Paystack Integration:**\n *   - PaystackPop.newTransaction() for popup\n *   - Configuration: key, email, amount (kobo), currency, channels, metadata\n *   - Callbacks: onPaymentSuccess, onPaymentClose\n *\n * **Backend Endpoints:**\n *   POST /api/v1/payments/verify\n *     Body: { reference: string (Paystack reference) }\n *     Response: { success: boolean, enrollment: {...}, message: string }\n *\n * ═══════════════════════════════════════════════════════════════════════════════════\n *\n * @component\n * @version 2.0.0\n * @author Gikonyo Mwema\n * @example\n *   const [showPayment, setShowPayment] = useState(false);\n *   const [course, setCourse] = useState({...});\n *\n *   <PaymentModal\n *     course={course}\n *     show={showPayment}\n *     onClose={(success) => {\n *       setShowPayment(false);\n *       if (success) navigate('/dashboard');\n *     }}\n *     user={currentUser}\n *     onSuccess={() => dispatch(refreshUser())}\n *   />\n */\n\nimport { useState } from 'react';
import { Modal, Button, TextInput, Alert, Spinner } from 'flowbite-react';
import PaystackPop from '@paystack/inline-js';
import { apiFetch } from '../../utils/api';

export default function PaymentModal({ course, show, onClose, user, onSuccess }) {
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const onPaymentSuccess = async (response) => {
    setLoading(true);
    try {
      // Verify payment with backend (apiFetch adds auth token + correct base URL)
      const data = await apiFetch('/api/v1/payments/verify', {
        method: 'POST',
        body: JSON.stringify({ reference: response.reference }),
      });

      setSuccess(true);
      setTimeout(() => {
        // Call parent success handler to update UI state
        if (onSuccess) onSuccess();
        onClose(true); // Notify parent of successful payment
        resetModal();
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onPaymentClose = () => {
    setLoading(false);
    console.log('Payment modal closed by user');
  };

  const handlePayment = () => {
    setError(null);
    
    // Validate email
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);

    // Initialize Paystack payment - let Paystack handle payment method selection
    const paystack = new PaystackPop();
    paystack.newTransaction({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: email,
      amount: course?.price * 100, // Paystack uses kobo (multiply by 100)
      currency: 'KES',
      // Allow all available payment channels - Paystack UI lets user choose
      channels: ['card', 'mobile_money', 'bank'],
      metadata: {
        // backend expects the Django PK which is exposed as `id`
        courseId: course?.id || course?._id,
        userId: user?.id || user?._id,
        courseTitle: course?.title,
      },
      ref: `COURSE-${(course?.id || course?._id)?.toString().slice(-6)}-${Date.now()}`,
      onSuccess: (response) => onPaymentSuccess(response),
      onCancel: () => onPaymentClose(),
    });
  };

  const resetModal = () => {
    setError(null);
    setSuccess(false);
  };

  return (
    <Modal show={show} onClose={() => !loading && onClose(false)} size="md">
      <Modal.Header>
        {success ? 'Payment Successful!' : `Enroll in ${course?.title}`}
      </Modal.Header>
      
      <Modal.Body>
        {success ? (
          <div className="text-center py-4">
            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mt-3">Payment Confirmed!</h3>
            <p className="mt-1 text-sm text-gray-500">
              You now have full access to the course.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Course Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course
              </label>
              <TextInput
                value={course?.title || ''}
                disabled
                className="font-semibold"
              />
            </div>

            {/* Course Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <TextInput
                value={`KES ${course?.price?.toLocaleString() || '0'}`}
                disabled
                className="font-semibold"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <TextInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Payment receipt will be sent to this email
              </p>
            </div>

            {error && (
              <Alert color="failure" className="mt-2">
                {error}
              </Alert>
            )}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        {!success && (
          <>
            <Button
              color="gray"
              onClick={() => onClose(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              color="none"
              className="bg-gradient-to-r from-brand-green to-brand-yellow hover:from-brand-green/90 hover:to-brand-yellow/90 text-white border-0 focus:ring-4 focus:ring-brand-green/25 ml-2"
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  <span className="ml-2">Processing...</span>
                </>
              ) : (
                `Pay KES ${course?.price?.toLocaleString() || '0'}`
              )}
            </Button>
          </>
        )}
        {success && (
          <Button
            color="success"
            onClick={() => {
              onClose(true);
              resetModal();
            }}
            className="w-full"
          >
            Access Course
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};
