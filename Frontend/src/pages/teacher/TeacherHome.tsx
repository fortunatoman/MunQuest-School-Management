import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/ui';

const TeacherHome: React.FC = () => {
    const navigate = useNavigate();

    return <div className="min-h-screen" style={{ backgroundColor: '#F8F8F8' }}>
        {/* Header */}
        <Header />
        {/* Main Content */}
        <div className="flex items-center justify-center flex-1" style={{ height: '80vh' }}>
            <div className="text-center">
                {/* Success Message */}
                <h1 className="text-black text-center text-4xl font-medium leading-[150%] mb-8">
                    Your Teacher Profile is created.
                </h1>
                {/* Navigation Buttons */}
                <div className="flex gap-4 justify-center">
                    {/* Home Button */}
                    <button
                        onClick={() => {
                            navigate('/home');
                        }}
                        className="flex items-center font-medium transition-all"
                        style={{
                            width: '140px',
                            height: '60px',
                            borderRadius: '30px',
                            opacity: 1,
                            gap: '10px',
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderColor: '#C2A46D',
                            padding: '23px',
                            backgroundColor: '#C2A46D',
                            color: '#F7F7F7'
                        }}
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Home
                    </button>

                    {/* Profile Button */}
                    <button
                        onClick={() => navigate('/teacher-profile-page')}
                        className="flex items-center font-medium transition-all"
                        style={{
                            width: '140px',
                            height: '60px',
                            borderRadius: '30px',
                            opacity: 1,
                            gap: '10px',
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderColor: '#C2A46D',
                            padding: '23px',
                            backgroundColor: '#C2A46D',
                            color: '#F7F7F7'
                        }}
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                    </button>
                </div>
            </div>
        </div>
    </div>;
};

export default TeacherHome;