import React, { useState, useMemo } from 'react';
import EventsTable from './EventsTable';
import { useApp } from '../../contexts/AppContext';

const EventsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { allEvents } = useApp();

  // Filter events based on search term
  const filteredEvents = useMemo(() => {
    if (!allEvents || allEvents.length === 0) {
      console.log("EventsPage: No events found or empty array");
      return [];
    }
    
    if (!searchTerm.trim()) {
      return allEvents;
    }

    const searchLower = searchTerm.toLowerCase();
    return allEvents.filter((event) => {
      const name = event?.name?.toLowerCase() || '';
      const locality = event?.locality?.name?.toLowerCase() || '';
      const eventId = event?.id?.toString().toLowerCase() || '';
      
      return name.includes(searchLower) || 
             locality.includes(searchLower) || 
             eventId.includes(searchLower);
    });
  }, [allEvents, searchTerm]);

  const handleEventAction = (action: string) => {
    // Implement action logic here
    switch (action) {
      case 'flag':
        // Handle flag action
        break;
      case 'block':
        // Handle block action
        break;
      case 'delete':
        // Handle delete action
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex justify-left">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-800 rounded-[10px] leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Events Table */}
      <EventsTable
        events={filteredEvents}
        onAction={handleEventAction}
      />
    </div>
  );
};

export default EventsPage;
