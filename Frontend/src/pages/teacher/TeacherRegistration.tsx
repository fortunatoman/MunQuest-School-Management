import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header, Avatar } from '../../components/ui';
import { toast } from 'sonner';
import { getUserByIdApi } from '../../apis/Users';
import PageLoader from '../../components/PageLoader';
import { eventRegistratTeacherApi } from '../../apis/Registerations';
import { useApp } from '../../contexts/AppContext';

type Step = 'personal' | 'food';

const TeacherRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { allLocalities } = useApp();
  // Current step state
  const [currentStep, setCurrentStep] = useState<Step>('personal');

  // Form data states
  const [username, setUsername] = useState<string>('');
  const [fullname, setFullname] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [placeOfSchool, setPlaceOfSchool] = useState<string>('');
  const [schoolName, setSchoolName] = useState<string>('');
  const [schoolLocalityId, setSchoolLocalityId] = useState<string>('');
  const [yearsOfWorkExperience, setYearsOfWorkExperience] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');

  // Food Info states
  const [foodPreference, setFoodPreference] = useState<string>('');
  const [foodAllergies, setFoodAllergies] = useState<string>('');


  useEffect(() => {
    const getUserById = async () => {
      try {
        const response = await getUserByIdApi();

        if (response.success) {
          setUsername(response.data.username || '');
          setFullname(response.data.fullname || '');
          setDateOfBirth(response.data.birthday || '');
          setGender(response.data.gender || '');
          setSchoolName(response.data?.school?.name || '');
          setSchoolLocalityId(response.data?.school?.locality_id || '');
          setYearsOfWorkExperience(response.data.years_of_experience || '');
          setEmail(response.data.email || '');
          setMobile(response.data.phone_number || '');
        }
        else {
          toast.error('Failed to get user by id: ' + response.message);
        }
      } catch (error: any) {
        toast.error('Failed to get user by id: ' + error.message);
      }
    };
    getUserById();
  }, []);

  // Effect to find locality name when allLocalities is loaded and we have schoolLocalityId
  useEffect(() => {
    if (allLocalities && allLocalities.length > 0 && schoolLocalityId) {
      const locality = allLocalities.find((locality: any) => {
        const localityIdStr = String(locality.id || '').toLowerCase();
        const schoolLocalityIdStr = String(schoolLocalityId || '').toLowerCase();
        return localityIdStr === schoolLocalityIdStr;
      });

      if (locality) {
        setPlaceOfSchool(locality.name || '');
      } else {
        setPlaceOfSchool('');
      }
    }
  }, [allLocalities, schoolLocalityId]);

  // Step configuration
  const steps = [
    { id: 'personal', name: 'Personal Info', active: currentStep === 'personal' },
    { id: 'food', name: 'Food Info', active: currentStep === 'food' },
  ];

  // Handle continue button
  const handleContinue = () => {
    switch (currentStep) {
      case 'personal':
        setCurrentStep('food');
        break;
      case 'food':
        handleEventRegistration()
        break;
      default:
        break;
    }
  };

  // Render progress indicator
  const renderProgressIndicator = () => (
    <div className="flex items-center justify-left mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div
            onClick={() => setCurrentStep(step.id as Step)}
            style={{
              display: 'flex',
              width: '200px',
              height: '58px',
              padding: '5px',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '20px',
              background: step.active ? '#395579' : '#fff',
              border: '1px solid #000',
            }}
            className={`text-sm font-medium transition-colors ${step.active ? 'text-white' : 'text-gray-700'}`}
          >
            {step.name}
          </div>
          {index < steps.length - 1 && (
            <div className="mx-2 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );

  // Render food info step
  const renderFoodInfo = () => (
    <div className="space-y-6">
      {/* Food Preference */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2" style={{
          color: '#000',
          fontSize: '16px',
          fontStyle: 'normal',
          fontWeight: 700,
          lineHeight: '150%',
        }}>
          Food Preference
        </label>
        <div className="flex space-x-4">
          {['Vegetarian', 'Non-Vegetarian'].map((option) => (
            <button
              key={option}
              onClick={() => setFoodPreference(option)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${foodPreference === option
                ? 'bg-[#C2A46D] text-white'
                : 'text-gray-700 hover:bg-gray-300'
                }`}
              style={{
                border: '1px solid #000',
              }}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Food Allergies */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2" style={{
          color: '#000',
          fontSize: '16px',
          fontStyle: 'normal',
          fontWeight: 700,
          lineHeight: '150%',
        }}>
          Food Allergies
        </label>
        <input
          type="text"
          value={foodAllergies}
          onChange={(e) => setFoodAllergies(e.target.value)}
          className="w-[400px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E395D] focus:border-transparent"
          placeholder="E.g. Peanut"
        />
      </div>
    </div>
  );

  // Render personal info step
  const renderPersonalInfo = () => (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex justify-left mb-8">
        <div className="relative">
          <Avatar
            size="large"
            className="w-32 h-32 border-4 border-white shadow-lg"
            showBorder={true}
          />
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{
            color: '#000',
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: 700,
            lineHeight: '150%',
          }}>Username</label>
          <input
            type="text"
            value={username}
            disabled={true}
            className="w-[400px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E395D] focus:border-transparent"
            placeholder="Enter username"
          />
          <p className="text-xs text-gray-500 mt-1">Username is system generated</p>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{
            color: '#000',
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: 700,
            lineHeight: '150%',
          }}  >Name</label>
          <div className="relative">
            <input
              type="text"
              disabled={true}
              value={fullname}
              className="w-[400px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E395D] focus:border-transparent pr-10"
              placeholder="Enter your name"
            />
          </div>
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{
            color: '#000',
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: 700,
            lineHeight: '150%',
          }}>Date of Birth</label>
          <div className="relative">
            <input
              type="text"
              disabled={true}
              value={dateOfBirth}
              className="w-[400px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E395D] focus:border-transparent pr-10"
              placeholder="Enter date of birth"
            />
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{
            color: '#000',
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: 700,
            lineHeight: '150%',
          }}>Gender</label>
          <div className="flex space-x-4">
            {['male', 'female', 'other'].map((option) => (
              <button
                key={option}
                disabled={true}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${gender.toLowerCase() === option.toLowerCase()
                  ? 'bg-[#C2A46D] text-white'
                  : ' text-gray-700 hover:bg-gray-300'
                  }`}
                style={{
                  border: '1px solid #000',
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Place of School */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{
            color: '#000',
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: 700,
            lineHeight: '150%',
          }}>Place of School</label>
          <div className="relative">
            <input
              type="text"
              disabled={true}
              value={placeOfSchool}
              className="w-[400px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E395D] focus:border-transparent pr-10"
              placeholder="Enter place of school"
            />
          </div>
        </div>

        {/* School Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{
            color: '#000',
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: 700,
            lineHeight: '150%',
          }}>School Name</label>
          <div className="relative">
            <input
              type="text"
              disabled={true}
              value={schoolName}
              className="w-[400px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E395D] focus:border-transparent pr-10"
              placeholder="Enter school name"
            />
          </div>
        </div>

        {/* Grade or Year */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{
            color: '#000',
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: 700,
            lineHeight: '150%',
          }}>Years of Work Experience</label>
          <div className="relative">
            <input
              type="text"
              disabled={true}
              value={yearsOfWorkExperience}
              className="w-[400px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E395D] focus:border-transparent pr-10"
              placeholder="Enter years of work experience"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{
            color: '#000',
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: 700,
            lineHeight: '150%',
          }}>Email</label>
          <div className="relative">
            <input
              type="email"
              disabled={true}
              value={email}
              className="w-[400px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E395D] focus:border-transparent pr-10"
              placeholder="Enter email address"
            />
          </div>
        </div>

        {/* Mobile */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{
            color: '#000',
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: 700,
            lineHeight: '150%',
          }}>Mobile</label>
          <div className="relative">
            <input
              type="tel"
              disabled={true}
              value={mobile}
              className="w-[400px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E395D] focus:border-transparent pr-10"
              placeholder="Enter mobile number"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const handleEventRegistration = async () => {
    try {
      const response = await eventRegistratTeacherApi(eventId as string, foodPreference, foodAllergies);
      if (response.success) {
        toast.success('Registration completed successfully!');
        const userRole = await localStorage.getItem('userRole');
        if (userRole === 'teacher') {
          navigate(`/teacher-registration-success/${eventId}`);
        } else {
          navigate(`/student-registration-success/${eventId}`);
        }
      } else {
        toast.error('Failed to register for event: ' + response.message);
      }
    } catch (error: any) {
      toast.error('Failed to register for event: ' + error.message);
    }
  }

  return (
    <PageLoader loadingText="Loading Teacher Registration...">
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <Header />

        {/* Main Content */}
        <div className="max-w-[85rem] mx-auto px-6 py-8" style={{ paddingLeft: '10.5rem' }}>
          {/* Page Title */}
          <div className="mb-8">
            <h1
              className="mb-6"
              style={{
                color: '#000',
                fontSize: '18px',
                fontStyle: 'normal',
                fontWeight: 700,
                lineHeight: '150%',
              }}
            >
              Review Info
            </h1>

            {/* Progress Indicator */}
            {renderProgressIndicator()}
          </div>

          {/* Form Content */}
          <div className="max-w-2xl">
            {currentStep === 'personal' && renderPersonalInfo()}
            {currentStep === 'food' && renderFoodInfo()}
          </div>

          {/* Continue/Register Button */}
          <div className="flex justify-left mt-8">
            <button
              onClick={handleContinue}
              className="font-medium text-white transition-all hover:opacity-90"
              style={{
                backgroundColor: '#C2A46D',
                borderRadius: '30px',
                display: 'flex',
                width: '160px',
                height: '50px',
                padding: '10px',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                fontSize: '16px'
              }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </PageLoader>
  );
};

export default TeacherRegistration;
