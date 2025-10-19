import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

function UserDashboard() {
  const location = useLocation();
  const toastShownRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const redirectStatus = params.get('redirect_status'); // check redirect_status
    const paymentIntent = params.get('payment_intent');

    if (paymentIntent && redirectStatus === 'succeeded' && !toastShownRef.current) {
      toastShownRef.current = true;
      
      toast.success('Payment Successful! 💳');

      // Remove query params from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }

    // Optional: handle failed payment
    if (paymentIntent && redirectStatus === 'failed' && !toastShownRef.current) {
      toastShownRef.current = true;
      toast.error('Payment Failed ❌');
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [location]);

  return (
    <div className='text-white font-bold flex justify-center items-center h-screen mt-24'>
      <h1>Welcome to Dashboard</h1>
    </div>
  );
}

export default UserDashboard;
