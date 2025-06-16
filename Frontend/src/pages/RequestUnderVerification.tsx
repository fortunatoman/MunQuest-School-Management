import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/ui';

const RequestUnderVerification: React.FC = () => {
  const navigate = useNavigate();


  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <Header />

      {/* Main Content */}
      <div
        className="max-w-[75rem] mx-auto px-6 py-12"
        style={{ paddingTop: '15rem' }}
      >
        <div className="text-left">
          <h1
            style={{
              color: '#000',
              textAlign: 'center',
              fontSize: '40px',
              fontStyle: 'normal',
              fontWeight: 500,
              lineHeight: '150%',
              marginBottom: '1rem'
            }}
          >
            Your request is under verification
          </h1>
          <p
            style={{
              color: '#000',
              textAlign: 'center',
              fontSize: '30px',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: '150%',
              marginBottom: '1rem'
            }}
          >
            We will notify you soon.
          </p>
          <button
            onClick={() => navigate('/home')}
            style={{
              display: 'flex',
              width: '140px',
              height: '60px',
              padding: '10px',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
              borderRadius: '30px',
              backgroundColor: '#C2A46D',
              color: 'white',
              fontWeight: 500,
              fontSize: '16px',
              border: 'none',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              margin: 'auto',
              marginTop: '3rem',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#B8945F';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#C2A46D';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9,22 9,12 15,12 15,22" />
            </svg>
            Home
          </button>
        </div>
      </div>
    </div >
  );
};

export default RequestUnderVerification;
