import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

function UserDashboard() {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const discordLogin = params.get('discordLogin');
    console.log("your params in dashboard :",params);

    if (discordLogin) {
      toast.success('Discord login successful!');

      // Remove query param from URL without remounting
      const newUrl = window.location.pathname; // just /dashboard
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [location]);

  return (
    <div>
      <h1>Welcome to Dashboard</h1>
    </div>
  );
}

export default UserDashboard;
