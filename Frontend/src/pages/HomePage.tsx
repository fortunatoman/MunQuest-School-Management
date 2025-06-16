import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo, LoadingSpinner, Header } from '../components/ui';
import { getCurrentEventsApi, getEventsByOrganiserApi, checkRegistrationStatusApi } from '../apis/Events';
import PageLoader from '../components/PageLoader';
import { toast } from 'sonner';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);

  useEffect(() => {
    const checkEvents = async () => {
      try {
        const organiserId = localStorage.getItem('organiserId');
        if (organiserId) {
          const response = await getEventsByOrganiserApi();
          if (response.success && response.data && response.data.length > 0) {
            navigate('/dashboard');
            return;
          }
        }else{
           const response = await getCurrentEventsApi();
          if (response.success && response.data && response.data.length > 0) {
            navigate('/dashboard');
            return;
          }
        }
      } catch (error) {
        console.log('Error checking events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkEvents();
  }, [navigate]);

    const checkRegistrationStatus = async () => {
      try {
        setButtonLoading(true);
        const userId = localStorage.getItem('userId');
        if (userId) {
          const response = await checkRegistrationStatusApi(userId);
          if (response.success && response.data) {
            if (response.data === 'cancelled') {
              toast.warning('Your registration has been cancelled by the admin');
              navigate('/request-approval');
              return false;
            }
            toast.success(`The status is ${response.data}`);
            return true;
          } else {
            toast.warning('You are not registered as an organiser');
            navigate('/request-approval');
            return false;
          }
        } else return false
      } catch (error) {
        console.log('Error checking registration status:', error);
      } finally {
        setButtonLoading(false);
      }
    };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading events..." />
      </div>
    );
  }

  return (
    <PageLoader loadingText="Loading Home...">
      <div className="min-h-screen bg-white">
        <Header />

        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={checkRegistrationStatus}
                disabled={buttonLoading}
                className="bg-[#1E395D] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1a2f4a] transition-colors duration-200 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {buttonLoading ? 'Checking...' : 'Register Organiser'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[#1E395D] min-h-[calc(100vh-200px)] flex flex-col items-center justify-center px-6">
          <div className="text-center max-w-4xl mx-auto">

            <div className="mb-8">
              <div className="bg-white rounded-lg p-8 inline-block">
                <Logo size="large" />
              </div>
            </div>

            <h2 className="text-white text-2xl md:text-3xl font-medium mb-8 leading-relaxed">
              Quest for Leadership, Quest for Change
            </h2>

            <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              "Future Leaders Start Here"
            </h1>
          </div>
        </div>

        <div className="bg-[#1E395D] py-4">
          <div className="text-center">
            <p className="text-white text-sm">
              © Iman Praveesh Hassan
            </p>
          </div>
        </div>
      </div>
    </PageLoader>
  );
};

export default HomePage;
