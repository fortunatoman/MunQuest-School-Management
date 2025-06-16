import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/ui';

const EventCreateSuccess: React.FC = () => {
  const navigate = useNavigate();


  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <Header />

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
        {/* Success Message */}
        <div className="text-center mb-12">
          <h1 
            className="text-4xl font-bold text-gray-900 mb-4"
            style={{
              color: '#000',
              fontSize: '48px',
              fontStyle: 'normal',
              fontWeight: 700,
              lineHeight: '150%',
            }}
          >
            Your event is created.
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-6">
          {/* App Home Button */}
          <button
            onClick={() => navigate('/home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '30px',
              background: '#C2A46D',
              color: '#fff',
              fontWeight: 500,
              fontSize: '16px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseOver={e => (e.currentTarget.style.background = '#B8945F')}
            onMouseOut={e => (e.currentTarget.style.background = '#C2A46D')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            App Home
          </button>

          {/* Organiser Home Button */}
          <button
            onClick={() => navigate('/organiser')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '30px',
              background: '#C2A46D',
              color: '#fff',
              fontWeight: 500,
              fontSize: '16px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseOver={e => (e.currentTarget.style.background = '#B8945F')}
            onMouseOut={e => (e.currentTarget.style.background = '#C2A46D')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Organiser Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCreateSuccess;
