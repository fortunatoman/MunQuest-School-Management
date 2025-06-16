import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner, Header } from '../components/ui';
import { checkRegistrationStatusApi, getCurrentEventsApi, getAllRegistrationApi } from '../apis/Events';
import PageLoader from '../components/PageLoader';
import { toast } from 'sonner';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [isLoading, setIsLoading] = useState(true);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [allRegistrations, setAllRegistrations] = useState<any[]>([]);

  const getRegistration = async () => {
    const registrations = await getAllRegistrationApi();
    setAllRegistrations(registrations.data);
  }

  useEffect(() => {
    getRegistration();
  }, [])
  // Log allRegistrations to console

  useEffect(() => {
    const checkEvents = async () => {
      try {
        const response = await getCurrentEventsApi();
        if (response.success && response.data && response.data.length > 0) {
          setAllEvents(response.data);
        } else {
          navigate('/home');
          return;
        }
      } catch (error) {
        console.log('Error checking events:', error);
        navigate('/home');
        return;
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
      if (!userId) return false;
      const response = await checkRegistrationStatusApi(userId as string);
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
    } catch (error) {
      console.log('Error checking registration status:', error);
      return false;
    } finally {
      setButtonLoading(false);
    }
  };

  const handleRegister = async (eventId: number) => {
    const userType = localStorage.getItem('userRole');
    if (userType === 'student') {
      navigate(`/student-registration/${eventId}`);
    } else {
      navigate(`/teacher-registration/${eventId}`);
    }
  };

  // Filter events based on active tab
  const getFilteredEvents = () => {
    const today = new Date();
    const toDate = (value: any) => (value ? new Date(value) : null);

    switch (activeTab) {
      case 'Upcoming': {
        return allEvents.filter((event: any) => {
          let filteredRegistrations = allRegistrations.filter(item => item.event_id === event.id)
          const endDate = toDate(event.end_date) || toDate(event.start_date);
          return endDate && endDate >= today && event.status !== 'cancelled' && filteredRegistrations.length <= 0;
        });
      }
      case 'Registered': {
        return allEvents.filter(event => {
          let registrations = allRegistrations.filter(item => item.event_id === event.id);
          const endDate = toDate(event.end_date) || toDate(event.start_date);
          return registrations.length > 0 && endDate && endDate >= today && event.status !== 'cancelled';
        });
      }
      case 'Past': {
        return allEvents.filter((event: any) => {
          let registeredUsers = allRegistrations.filter(item => item.event_id === event.id);
          const endDate = toDate(event.end_date) || toDate(event.start_date);
          return endDate && endDate < today && event.status !== 'cancelled' && registeredUsers.length > 0;
        });
      }
      case 'Cancelled': {
        return allEvents.filter((event: any) => {
          let registeredUsers = allRegistrations.filter(item => item.event_id === event.id);
          const endDate = toDate(event.end_date) || toDate(event.start_date);
          return (endDate && endDate < today && registeredUsers.length <= 0) || event.status === 'cancelled';
        });
      }
      default:
        return allEvents;
    }
  };

  const filteredEvents = getFilteredEvents();

  // Show loading spinner while checking events
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading events..." />
      </div>
    );
  }

  const tabs = ['Upcoming', 'Registered', 'Past', 'Cancelled'];

  return (
    <PageLoader loadingText="Loading Dashboard...">
      <div className="min-h-screen bg-white">
        {/* Header Section */}
        <Header />

        {/* Create Event Button */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={checkRegistrationStatus}
                disabled={buttonLoading}
                className="bg-[#1E395D] w-[230px] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1a2f4a] transition-colors duration-200 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {buttonLoading ? 'Checking...' : 'Register Organiser'}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors duration-200 ${activeTab === tab
                    ? 'border-[#1E395D] text-[#1E395D]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div onClick={() => handleRegister(event.id)} key={event.id} className="border border-gray-800 bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                {/* Event Image */}
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={event.cover_image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop'}
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Event Details */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{event.name}</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {event.start_date}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.locality.name}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                      {event.fees_per_delegate}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State for tabs with no events */}
          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No {activeTab.toLowerCase()} events</h3>
              <p className="text-gray-500">There are no {activeTab.toLowerCase()} events at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </PageLoader>
  );
};

export default Dashboard;
