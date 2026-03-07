import { useState } from 'react';
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
              gradientDuoTone="greenToBlue"
              onClick={handlePayment}
              disabled={loading}
              className="ml-2"
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
