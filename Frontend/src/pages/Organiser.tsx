import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/ui';
import { toast } from 'sonner';
import { getEventsByOrganiserApi } from '../apis/Events';
import PageLoader from '../components/PageLoader';

const Organiser: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  


  useEffect(() => {
    const getCurrentEvents = async () => {
      try {
        const response = await getEventsByOrganiserApi();
        if (response.success) {
          setEvents(response.data || []);
        } else {
          toast.error(response.message);
        }
      } catch (error: any) {
        console.log('Error fetching events:', error);
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    getCurrentEvents();
  }, []);

  const handleCreateEvent = () => {
    navigate('/event-create');
  };

  const handleEventClick = (eventId: number) => {
    navigate(`/event-dashboard/${eventId}`);
  };

  if (isLoading) {
      return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E395D] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
          </div>
        </div>
      );
    }

    return (
    <PageLoader loadingText="Loading Events...">
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <Header maxWidth="max-w-[88rem]" />

      {/* Main Content */}
      <div className="max-w-[85rem] mx-auto px-6 py-8" style={{ paddingLeft: '10.5rem' }}>
          {/* Page Title and Create Button */}
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-medium text-[#C2A46D]">
              Organiser Events
            </h1>

          {/* Create Event Button */}
          <button
            onClick={handleCreateEvent}
            style={{
              display: 'flex',
              width: '160px',
              height: '40px',
              padding: '10px',
              justifyContent: 'center',
              alignItems: 'center',
              flexShrink: 0,
              borderRadius: '30px',
              backgroundColor: '#1E395D',
              color: 'white',
              fontWeight: 500,
              transition: 'background-color 0.2s',
            }}
            className="font-medium hover:bg-[#1a2f4a]"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Event
          </button>
        </div>

          {/* Events List */}
          {events.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events available</h3>
              <p className="text-gray-500">Please create an event to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div 
                  key={event.id} 
                  onClick={() => handleEventClick(event.id)}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                >
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
                        {event.start_date} - {event.end_date}
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
                    <div className="text-sm text-[#1E395D] font-medium">
                      Click to manage event →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
    </PageLoader>
  );
};

export default Organiser;
