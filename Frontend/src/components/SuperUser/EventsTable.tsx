import React, { useEffect, useRef, useState } from 'react';
import { updateEventStatusApi, deleteEventApi } from '../../apis/Events';
import { toast } from 'sonner';
import { useApp } from '../../contexts/AppContext';

interface Event {
  id: string;
  name: string;
  locality: {
    name: string;
  };
  start_date: string;
  end_date: string;
  fees_per_delegate: string;
  event_phase: string;
  status: string;
}

interface EventsTableProps {
  events: Event[];
  onAction: (action: string, eventId: string) => void;
}

const EventsTable: React.FC<EventsTableProps> = ({ events, onAction }) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [updatingEventId, setUpdatingEventId] = useState<string | null>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const { refreshEventsData } = useApp();

  const handleDropdownToggle = (eventId: string) => {
    setActiveDropdown(activeDropdown === eventId ? null : eventId);
  };

  const handleAction = async (action: string, eventId: string) => {
    setUpdatingEventId(eventId);
    try {
      if (action === 'delete') {
        const response = await deleteEventApi(eventId);
        if (response.success) {
          toast.success(response.message);
          await refreshEventsData();
        } else {
          toast.error(response.message);
        }
      } else {
        const response = await updateEventStatusApi(eventId, action);
        if (response.success) {
          toast.success(response.message);
          await refreshEventsData();
        } else {
          toast.error(response.message);
        }
      }
      onAction(action, eventId);
    } catch (error) {
      console.log('Error updating event status:', error);
      toast.error('Failed to update event status');
    } finally {
      setUpdatingEventId(null);
    }
    setActiveDropdown(null);
  };
  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'text-gray-600';

    switch (status.toLowerCase()) {
      case 'pending':
        return 'text-yellow-500';
      case 'flagged':
        return 'text-yellow-500';
      case 'blocked':
        return 'text-red-600';
      case 'approved':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

   // Close dropdown when clicking outside
   useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside any dropdown menu
      const clickedOutsideAllDropdowns = Object.values(dropdownRefs.current).every(ref =>
        !ref || !ref.contains(event.target as Node)
      );

      if (clickedOutsideAllDropdowns) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div>
      {/* Header Row */}
      <div className="grid grid-cols-8 gap-2 mb-2">
        {['Event ID', 'Event Name', 'Locality', 'Date', 'Fees', 'Event Phase', 'Event Status'].map((header, index) => (
          <div
            key={header}
            className={`px-3 py-2 text-xs font-medium text-gray-900 uppercase tracking-wider rounded-md ${index < 4
              ? 'bg-[#F0F7FF] border border-[#4A5F7A] flex items-center justify-between'
              : 'bg-[#F0F7FF] border border-[#4A5F7A] flex items-center'
              }`}
          >
            <span>{header}</span>
            {index < 4 && (
              <svg className="w-3 h-3 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Data Rows */}
      {events.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No events found
        </div>
      ) : (
        events.map((event) => (
          <div key={event?.id || Math.random()} className="grid grid-cols-8 gap-2 mb-2">
            {/* Event ID */}
            <div className="bg-white px-3 py-2 text-sm font-medium text-gray-900 rounded-md border border-gray-200 flex items-center justify-center">
              {event?.id.split('-')[0] || 'N/A'}
            </div>

            {/* Event Name */}
            <div className="bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200 flex items-center justify-center">
              {event?.name || 'N/A'}
            </div>

            {/* Locality */}
            <div className="bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200 flex items-center justify-center">
              {event?.locality?.name || 'N/A'}
            </div>

            {/* Date */}
            <div className="bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200 flex items-center justify-center">
              {event?.start_date + ' - ' + event?.end_date || 'N/A'}
            </div>

            {/* Fees */}
            <div className="bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200 flex items-center justify-center">
              {event?.fees_per_delegate || 'N/A'}
            </div>

            {/* Event Phase */}
            <div className="bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200 flex items-center justify-center">
              {event?.event_phase || 'N/A'}
            </div>

            {/* Event Status */}
            <div className="bg-white px-3 py-2 text-sm rounded-md border border-gray-200 flex items-center justify-center">
              {updatingEventId === event?.id ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  <span className="text-gray-500">Updating</span>
                </div>
              ) : (
                <span className={`font-medium ${getStatusColor(event?.status)}`}>
                  {event?.status || 'N/A'}
                </span>
              )}
            </div>

            {/* Actions */}
            <div ref={(el) => { dropdownRefs.current[event.id] = el; }} className="px-3 py-2 text-sm font-medium relative">
              <div className="relative">
                <button
                  onClick={() => handleDropdownToggle(event?.id || '')}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>

                {activeDropdown === event?.id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                     <div className="py-1">
                       {/* Show Approved button only if status is pending */}
                       {event?.status?.toLowerCase() === 'pending' && (
                         <button
                           onClick={() => handleAction('approved', event?.id || '')}
                           disabled={updatingEventId === event?.id}
                           className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingEventId === event?.id
                             ? 'text-gray-400 cursor-not-allowed'
                             : 'text-gray-700 hover:bg-[#D9C7A1] hover:text-gray-900'
                             }`}
                         >
                           Approve
                         </button>
                       )}

                       {/* Show Flag button only if status is not flagged */}
                       {event?.status?.toLowerCase() !== 'flagged' && (
                         <button
                           onClick={() => handleAction('flagged', event?.id || '')}
                           disabled={updatingEventId === event?.id}
                           className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingEventId === event?.id
                             ? 'text-gray-400 cursor-not-allowed'
                             : 'text-gray-700 hover:bg-[#D9C7A1] hover:text-gray-900'
                             }`}
                         >
                           Flag
                         </button>
                       )}

                       {/* Show Block button only if status is not blocked */}
                       {event?.status?.toLowerCase() !== 'blocked' && (
                         <button
                           onClick={() => handleAction('blocked', event?.id || '')}
                           disabled={updatingEventId === event?.id}
                           className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingEventId === event?.id
                             ? 'text-gray-400 cursor-not-allowed'
                             : 'text-gray-700 hover:bg-[#D9C7A1] hover:text-gray-900'
                             }`}
                         >
                           Block
                         </button>
                       )}

                       {/* Show Approved button if status is flagged or blocked */}
                       {(event?.status?.toLowerCase() === 'flagged' || event?.status?.toLowerCase() === 'blocked') && (
                         <button
                           onClick={() => handleAction('approved', event?.id || '')}
                           disabled={updatingEventId === event?.id}
                           className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingEventId === event?.id
                             ? 'text-gray-400 cursor-not-allowed'
                             : 'text-gray-700 hover:bg-[#D9C7A1] hover:text-gray-900'
                             }`}
                         >
                           Approve
                         </button>
                       )}

                       <button
                         onClick={() => handleAction('delete', event?.id || '')}
                         disabled={updatingEventId === event?.id}
                         className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingEventId === event?.id
                           ? 'text-gray-400 cursor-not-allowed'
                           : 'text-gray-700 hover:bg-[#D9C7A1] hover:text-gray-900'
                           }`}
                       >
                         Delete
                       </button>
                     </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default EventsTable;
