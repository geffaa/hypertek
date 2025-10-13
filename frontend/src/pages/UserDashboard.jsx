import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

function UserDashboard() {
  const location = useLocation();

  useEffect(() => {
    // Get query params
    const params = new URLSearchParams(location.search);
    const sessionId = params.get('session_id');

    if (sessionId) {
      // Show success toast
      toast.success('Payment Successful!');

      // Optionally, you can call backend to confirm session details
      // fetch(`/api/v1/stripe/confirm-session?session_id=${sessionId}`)

      // Remove session_id from URL without reloading
      const newUrl = window.location.pathname; // just /dashboard
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
