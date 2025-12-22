import { useState } from 'react';
import { Modal, Button, Select, TextInput, Alert, Spinner } from 'flowbite-react';
import { HiOutlinePhone } from 'react-icons/hi';
import PaystackPop from '@paystack/inline-js';

export default function PaymentModal({ course, show, onClose, user }) {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const onPaymentSuccess = async (response) => {
    setLoading(true);
    try {
      // Verify payment with backend
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: response.reference }),
      });

      if (!res.ok) throw new Error('Payment verification failed');

      setSuccess(true);
      setTimeout(() => {
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
    
    // Validate inputs
    if (!email) {
      setError('Please enter your email');
      return;
    }

    if (paymentMethod === 'mpesa' && !phoneNumber) {
      setError('Please enter your M-Pesa phone number');
      return;
    }

    setLoading(true);

    // Initialize Paystack payment
    const paystack = new PaystackPop();
    paystack.newTransaction({
      key: process.env.NEXT_PUBLIC_PAYSTACK_KEY,
      email: email,
      amount: course?.price * 100, // Paystack uses kobo (multiply by 100)
      currency: 'KES',
      channels: paymentMethod === 'mpesa' ? ['mobile_money'] : ['card'],
      metadata: {
        courseId: course?._id,
        userId: user?._id,
        courseTitle: course?.title,
      },
      ...(paymentMethod === 'mpesa' && { 
        mobile_money: { 
          phone: phoneNumber.startsWith('254') ? phoneNumber : `254${phoneNumber.slice(-9)}` 
        } 
      }),
      ref: `COURSE-${course?._id.slice(-6)}-${Date.now()}`,
      onSuccess: (response) => onPaymentSuccess(response),
      onCancel: () => onPaymentClose(),
    });
  };

  const resetModal = () => {
    setPaymentMethod('card');
    setPhoneNumber('');
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Price
              </label>
              <TextInput
                value={`KES ${course?.price?.toLocaleString() || '0'}`}
                disabled
                className="font-semibold"
              />
            </div>

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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="card">Credit/Debit Card</option>
                <option value="mpesa">M-Pesa</option>
              </Select>
            </div>

            {paymentMethod === 'mpesa' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  M-Pesa Phone Number
                </label>
                <TextInput
                  icon={HiOutlinePhone}
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 254712345678 or 0712345678"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  You'll receive an STK Push notification
                </p>
              </div>
            )}

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
