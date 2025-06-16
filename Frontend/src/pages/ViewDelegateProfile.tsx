import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Avatar, Header } from '../components/ui';
import PageLoader from '../components/PageLoader';
import { useApp } from '../contexts/AppContext';

interface DelegateProfileData {
  id: number;
  username: string;
  fullname: string;
  birthday: string;
  gender: string;
  school_location: string;
  school_name: string;
  grade: string;
  email: string;
  phone_number: string;
  country_code?: string;
  role?: string;
  year_of_work_experience?: number | null;
  avatar?: string;
}

const ViewDelegateProfile: React.FC = () => {
  const { delegateId } = useParams<{ delegateId: string }>();
  const navigate = useNavigate();
  const { allRegistrations } = useApp();
  const [delegateProfile, setDelegateProfile] = useState<DelegateProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadDelegateProfile = async () => {
      try {
        setIsLoading(true);
        
        if (!delegateId) {
          toast.error('Delegate ID not found');
          navigate('/organiser');
          return;
        }

        // Find the delegate in allRegistrations
        const delegate = allRegistrations?.find(reg => reg.id.toString() === delegateId);
        
        if (!delegate) {
          toast.error('Delegate not found');
          navigate('/organiser');
          return;
        }

        // Map the registration data to profile format
        const profileData: DelegateProfileData = {
          id: delegate.id,
          username: delegate.user?.username || '',
          fullname: delegate.user?.fullname || '',
          birthday: delegate.user?.birthday || '',
          gender: delegate.user?.gender || '',
          school_location: delegate.user?.school?.locality?.name || '',
          school_name: delegate.user?.school?.name || '',
          grade: delegate.user?.grade || '',
          email: delegate.user?.email || '',
          phone_number: delegate.user?.phone_number || '',
          country_code: delegate.user?.country_code || '+971',
          role: delegate.user?.role || '',
          year_of_work_experience: delegate.user?.year_of_work_experience || null,
          avatar: delegate.user?.avatar || ''
        };

        setDelegateProfile(profileData);
      } catch (error) {
        console.log('Error loading delegate profile:', error);
        toast.error('Failed to load delegate profile');
        navigate('/organiser');
      } finally {
        setIsLoading(false);
      }
    };

    loadDelegateProfile();
  }, [delegateId, allRegistrations, navigate]);

  const formatPhoneNumber = (phone: string, countryCode: string) => {
    if (!phone) return '';
    return `${countryCode} ${phone}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <PageLoader loadingText="Loading delegate profile...">
        <div></div>
      </PageLoader>
    );
  }

  if (!delegateProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Delegate Not Found</h1>
          <button
            onClick={() => navigate('/organiser')}
            className="px-4 py-2 bg-[#C2A46D] text-white rounded-lg hover:bg-[#A68B5B] transition-colors"
          >
            Back to Organiser
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="mx-auto py-8" style={{ maxWidth: "65rem" }}>
        {/* Header Section */}
        <div className="text-left mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/organiser')}
              className="flex items-center text-[#C2A46D] hover:text-[#A68B5B] transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Organiser
            </button>
          </div>
          
          <div className="relative inline-block">
            {delegateProfile.avatar ? (
              <img
                src={delegateProfile.avatar}
                alt="Delegate Avatar"
                className="w-32 h-32 border-4 border-white shadow-lg rounded-full object-cover"
              />
            ) : (
              <Avatar
                size="large"
                className="w-32 h-32 border-4 border-white shadow-lg"
                showBorder={true}
              />
            )}
          </div>
          
          <h1 className="font-bold text-gray-900 mt-4" style={{ fontSize: '30px' }}>
            {delegateProfile.role === 'teacher' ? 'Teacher' : 'Student'} Profile
          </h1>
          <p className="text-gray-600 mt-2">Viewing profile for: {delegateProfile.fullname}</p>
        </div>

        {/* Profile Information - Read Only */}
        <div className="rounded-lg shadow-sm p-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Username */}
            <div className="mb-6">
              <label className="block text-base font-bold text-black mb-2">
                Username
              </label>
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700">
                {delegateProfile.username}
              </div>
            </div>

            {/* Name */}
            <div className="mb-6">
              <label className="block text-base font-bold text-black mb-2">
                Name
              </label>
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700">
                {delegateProfile.fullname}
              </div>
            </div>

            {/* Date of Birth */}
            <div className="mb-6">
              <label className="block text-base font-bold text-black mb-2">
                Date of Birth
              </label>
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700">
                {formatDate(delegateProfile.birthday)}
              </div>
            </div>

            {/* Gender */}
            <div className="mb-6">
              <label className="block text-base font-bold text-black mb-2">
                Gender
              </label>
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700">
                {delegateProfile.gender ? delegateProfile.gender.charAt(0).toUpperCase() + delegateProfile.gender.slice(1) : ''}
              </div>
            </div>

            {/* School Location */}
            <div className="mb-6">
              <label className="block text-base font-bold text-black mb-2">
                School Location
              </label>
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700">
                {delegateProfile.school_location}
              </div>
            </div>

            {/* School Name */}
            <div className="mb-6">
              <label className="block text-base font-bold text-black mb-2">
                School Name
              </label>
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700">
                {delegateProfile.school_name}
              </div>
            </div>

            {/* Grade or Work Experience */}
            <div className="mb-6">
              <label className="block text-base font-bold text-black mb-2">
                {delegateProfile.role === 'teacher' ? 'Years of Work Experience' : 'Grade/Year/Programme'}
              </label>
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700">
                {delegateProfile.role === 'teacher' 
                  ? delegateProfile.year_of_work_experience || 'Not specified'
                  : delegateProfile.grade || 'Not specified'
                }
              </div>
            </div>

            {/* Email */}
            <div className="mb-6">
              <label className="block text-base font-bold text-black mb-2">
                Email
              </label>
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700">
                {delegateProfile.email}
              </div>
            </div>

            {/* Phone */}
            <div className="mb-6">
              <label className="block text-base font-bold text-black mb-2">
                Mobile
              </label>
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700">
                {formatPhoneNumber(delegateProfile.phone_number, delegateProfile.country_code || '+971')}
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex justify-end mt-8 space-x-4">
            <button
              onClick={() => navigate('/organiser')}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDelegateProfile;
