import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

function UserDashboard() {
  const location = useLocation();
  const toastShownRef = useRef(false);

  useEffect(() => {
    // Get query params
    const params = new URLSearchParams(location.search);
    const sessionId = params.get('session_id');

    if (sessionId && !toastShownRef.current) {
      // Mark toast as shown
      toastShownRef.current = true;
      
      // Show success toast
      toast.success('Payment Successful!');

      // Remove session_id from URL without reloading
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