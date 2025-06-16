import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RootRedirect: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there's an access token in the URL hash
    const hash = window.location.hash;
    const hasAccessToken = hash.includes('access_token=');
    
    if (hasAccessToken) {
      // If there's an access token, redirect to email confirmation page
      console.log('🔗 Access token detected in URL, redirecting to email confirmation...');
      navigate('/email-confirmation', { replace: true });
    } else {
      // If no access token, redirect to login
      console.log('🔗 No access token, redirecting to login...');
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C2A46D] mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
};

export default RootRedirect;
