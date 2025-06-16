import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header, Avatar } from '../../components/ui';
import { toast } from 'sonner';
import { getUserByIdApi } from '../../apis/Users';
import PageLoader from '../../components/PageLoader';
import { eventRegistratStudentApi } from '../../apis/Registerations';
import { useApp } from '../../contexts/AppContext';
import { getAllEventCommitteesApi } from '../../apis/Event_committes';
type Step = 'personal' | 'mun' | 'food' | 'emergency';

const StudentRegistration: React.FC = () => {
  const navigate = useNavigate();
  const emergencyDropdownRef = useRef<HTMLDivElement>(null);
  const { allLocalities } = useApp();
  // Current step state
  const [currentStep, setCurrentStep] = useState<Step>('personal');
  const { eventId } = useParams();
  // Form data states
  const [username, setUsername] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [placeOfSchool, setPlaceOfSchool] = useState<string>('');
  const [schoolName, setSchoolName] = useState<string>('');
  const [schoolLocalityId, setSchoolLocalityId] = useState<string>('');
  const [gradeOrYear, setGradeOrYear] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');

  // MUN Info states
  const [munExperience, setMunExperience] = useState<string>('');
  const [preferredCommittee1, setPreferredCommittee1] = useState<string>('');
  const [preferredCommittee2, setPreferredCommittee2] = useState<string>('');
  const [preferredCommittee3, setPreferredCommittee3] = useState<string>('');

  // Food Info states
  const [foodPreference, setFoodPreference] = useState<string>('');
  const [foodAllergies, setFoodAllergies] = useState<string>('');

  // Emergency Info states
  const [emergencyContactName, setEmergencyContactName] = useState<string>('');
  const [emergencyCountryCode, setEmergencyCountryCode] = useState<string>('UAE');
  const [emergencyMobileNumber, setEmergencyMobileNumber] = useState<string>('');
  const [showEmergencyCountryDropdown, setShowEmergencyCountryDropdown] = useState(false);

  const [eventCommitteesInfo, setEventCommitteesInfo] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Country codes for emergency contact
  const countryCodes = [
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+1', country: 'USA', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
    { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
    { code: '+974', country: 'Qatar', flag: '🇶🇦' },
    { code: '+968', country: 'Oman', flag: '🇴🇲' },
    { code: '+20', country: 'Egypt', flag: '🇪🇬' },
    { code: '+90', country: 'Turkey', flag: '🇹🇷' },
    { code: '+7', country: 'Russia', flag: '🇷🇺' },
    { code: '+55', country: 'Brazil', flag: '🇧🇷' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
    { code: '+27', country: 'South Africa', flag: '🇿🇦' }
  ];

  const handleEmergencyCountryCodeSelect = (code: string) => {
    setEmergencyCountryCode(code);
    setShowEmergencyCountryDropdown(false);
  };

  useEffect(() => {
    const getUserById = async () => {
      try {
        const response = await getUserByIdApi();
        if (response.success) {
          setUsername(response.data.username || '');
          setName(response.data.fullname || '');
          setDateOfBirth(response.data.birthday || '');
          setGender(response.data.gender || '');
          setSchoolName(response.data?.school?.name || '');
          setSchoolLocalityId(response.data?.school?.locality_id || '');
          setGradeOrYear(response.data.grade || '');
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

    const getEventInfoById = async () => {
      const response = await getAllEventCommitteesApi(eventId as string);
      if (response.success) {
        setEventCommitteesInfo(response.data);
      }
    };
    getUserById();
    getEventInfoById();
  }, []);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emergencyDropdownRef.current && !emergencyDropdownRef.current.contains(event.target as Node)) {
        setShowEmergencyCountryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Step configuration
  const steps = [
    { id: 'personal', name: 'Personal Info', active: currentStep === 'personal' },
    { id: 'mun', name: 'MUN Info', active: currentStep === 'mun' },
    { id: 'food', name: 'Food Info', active: currentStep === 'food' },
    { id: 'emergency', name: 'Emergency Info', active: currentStep === 'emergency' }
  ];

  // Handle continue button
  const handleContinue = async () => {
    switch (currentStep) {
      case 'personal':
        setCurrentStep('mun');
        break;
      case 'mun':
        setCurrentStep('food');
        break;
      case 'food':
        setCurrentStep('emergency');
        break;
      case 'emergency':
        // Handle final submission
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
          await handleEventRegistration();
        } finally {
          setIsSubmitting(false);
        }
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

  // Render MUN info step
  const renderMunInfo = () => (
    <div className="space-y-6">
      {/* MUN Experience in Years */}
      <div>
        <label
          className="block text-sm font-medium text-gray-700 mb-2"
          style={{
            color: '#000',
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: 700,
            lineHeight: '150%',
          }}
        >
          MUN Experience in Years
        </label>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={munExperience}
            onChange={(e) => setMunExperience(e.target.value)}
            className="w-[400px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E395D] focus:border-transparent"
            placeholder="E.g. 5"
          />
        </div>
      </div>

      {/* Preferred Committees */}
      <div className="space-y-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{
            color: '#000',
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: 700,
            lineHeight: '150%',
          }}>Preferred Committee - Choice 1</label>
          <div className="relative">
            <select
              value={preferredCommittee1}
              onChange={(e) => setPreferredCommittee1(e.target.value)}
              className="w-[400px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E395D] focus:border-transparent appearance-none bg-white pr-10"
            >
              <option value="">Select</option>
              {Array.isArray(eventCommitteesInfo) && eventCommitteesInfo.map((committee: any, index: number) => (
                <option key={`${committee.abbr}-${committee.id}-${index}`} value={committee.id}>
                  {committee.abbr}  ({committee.committee.committee})
                </option>
              ))}
            </select>
            <div className="absolute" style={{ right: "17.75rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{
            color: '#000',
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: 700,
            lineHeight: '150%',
          }}>Preferred Committee - Choice 2</label>
          <div className="relative">
            <select
              value={preferredCommittee2}
              onChange={(e) => setPreferredCommittee2(e.target.value)}
              className="w-[400px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E395D] focus:border-transparent appearance-none bg-white pr-10"
            >
              <option value="">Select</option>
              {Array.isArray(eventCommitteesInfo) && eventCommitteesInfo.map((committee: any, index: number) => (
                <option key={`${committee.abbr}-${committee.id}-${index}`} value={committee.id}>
                  {committee.abbr}  ({committee.committee.committee})
                </option>
              ))}
            </select>
            <div className="absolute" style={{ right: "17.75rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{
            color: '#000',
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: 700,
            lineHeight: '150%',
          }}>Preferred Committee - Choice 3</label>
          <div className="relative">
            <select
              value={preferredCommittee3}
              onChange={(e) => setPreferredCommittee3(e.target.value)}
              className="w-[400px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E395D] focus:border-transparent appearance-none bg-white pr-10"
            >
              <option value="">Select</option>
              {Array.isArray(eventCommitteesInfo) && eventCommitteesInfo.map((committee: any, index: number) => (
                <option key={`${committee.abbr}-${committee.id}-${index}`} value={committee.id}>
                  {committee.abbr}  ({committee.committee.committee})
                </option>
              ))}
            </select>
            <div className="absolute" style={{ right: "17.75rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
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

  // Render emergency info step
  const renderEmergencyInfo = () => (
    <div className="space-y-6">
      {/* Emergency Contact Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2" style={{
          color: '#000',
          fontSize: '16px',
          fontStyle: 'normal',
          fontWeight: 700,
          lineHeight: '150%',
        }}>
          Emergency Contact Name
        </label>
        <input
          type="text"
          value={emergencyContactName}
          onChange={(e) => setEmergencyContactName(e.target.value)}
          className="w-[400px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E395D] focus:border-transparent"
          placeholder="E.g. Alice Lee"
        />
      </div>

      {/* Emergency Mobile Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2" style={{
          color: '#000',
          fontSize: '16px',
          fontStyle: 'normal',
          fontWeight: 700,
          lineHeight: '150%',
        }}>
          Emergency Mobile Number
        </label>
        <div className="relative w-[400px]" ref={emergencyDropdownRef}>
          <div className="flex border border-gray-300 rounded-lg bg-white">
            {/* Country Code Selector */}
            <div
              className="flex items-center px-4 py-3 border-r border-gray-300 cursor-pointer hover:bg-gray-50"
              onClick={() => setShowEmergencyCountryDropdown(!showEmergencyCountryDropdown)}
            >
              <span className="text-sm text-gray-600 mr-2">{emergencyCountryCode}</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {/* Phone Number Input */}
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9\s]*"
              placeholder="50 650 5005"
              value={emergencyMobileNumber}
              onChange={e => {
                // Check if user tried to enter invalid characters
                const hasInvalidChars = /[^0-9\s]/.test(e.target.value);
                if (hasInvalidChars) {
                  toast.error('Only numbers and spaces are allowed in phone number');
                }

                // Remove any non-numeric characters except spaces
                const phoneValue = e.target.value.replace(/[^0-9\s]/g, '');
                setEmergencyMobileNumber(phoneValue);
              }}
              className="flex-1 px-4 py-3 text-sm bg-white placeholder-gray-500 focus:outline-none focus:border-[#1E395D] focus:ring-2 focus:ring-[#1E395D] focus:ring-opacity-20 transition-all duration-200"
            />
          </div>

          {/* Country Code Dropdown */}
          {showEmergencyCountryDropdown && (
            <div className="absolute top-full left-0 z-10 w-64 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {countryCodes.map((country) => (
                <div
                  key={country.code}
                  className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleEmergencyCountryCodeSelect(country.code)}
                >
                  <span className="text-lg mr-3">{country.flag}</span>
                  <span className="text-sm text-gray-600 mr-2">{country.code}</span>
                  <span className="text-sm text-gray-800">{country.country}</span>
                </div>
              ))}
            </div>
          )}
        </div>
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
            disabled
            value={username}
            className="w-[400px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E395D] focus:border-transparent"
            placeholder="Enter username"
          />
          <p className="text-xs text-gray-500 mt-1">Username is system generated</p>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
          <div className="relative">
            <input
              type="text"
              disabled
              value={name || ''}
              onChange={(e) => setName(e.target.value)}
              className="w-[400px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E395D] focus:border-transparent pr-10"
              placeholder="Enter your name"
            />
          </div>
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
          <div className="relative">
            <input
              type="text"
              disabled
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-[400px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E395D] focus:border-transparent pr-10"
              placeholder="Enter date of birth"
            />
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
          <div className="flex space-x-4">
            {['male', 'female', 'other'].map((option) => (
              <button
                key={option}
                onClick={() => setGender(option)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${gender === option
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Place of School</label>
          <div className="relative">
            <input
              type="text"
              disabled
              value={placeOfSchool}
              onChange={(e) => setPlaceOfSchool(e.target.value)}
              className="w-[400px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E395D] focus:border-transparent pr-10"
              placeholder="Enter place of school"
            />
          </div>
        </div>

        {/* School Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">School Name</label>
          <div className="relative">
            <input
              type="text"
              disabled
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-[400px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E395D] focus:border-transparent pr-10"
              placeholder="Enter school name"
            />
          </div>
        </div>

        {/* Grade or Year */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Grade or Year</label>
          <div className="relative">
            <input
              type="text"
              disabled
              value={gradeOrYear || ''}
              onChange={(e) => setGradeOrYear(e.target.value)}
              className="w-[400px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E395D] focus:border-transparent pr-10"
              placeholder="Enter grade or year"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <div className="relative">
            <input
              type="email"
              disabled
              value={email || ''}
              onChange={(e) => setEmail(e.target.value)}
              className="w-[400px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E395D] focus:border-transparent pr-10"
              placeholder="Enter email address"
            />
          </div>
        </div>

        {/* Mobile */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mobile</label>
          <div className="relative">
            <input
              type="tel"
              disabled
              value={mobile || ''}
              onChange={(e) => setMobile(e.target.value)}
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
      const response = await eventRegistratStudentApi(eventId as string, munExperience, preferredCommittee1, preferredCommittee2, preferredCommittee3, foodPreference, foodAllergies, emergencyContactName, emergencyMobileNumber);
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
    <PageLoader loadingText="Loading Registration...">
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
            {currentStep === 'mun' && renderMunInfo()}
            {currentStep === 'food' && renderFoodInfo()}
            {currentStep === 'emergency' && renderEmergencyInfo()}
          </div>

          {/* Continue/Register Button */}
          <div className="flex justify-left mt-8">
            <button
              onClick={handleContinue}
              disabled={currentStep === 'emergency' && isSubmitting}
              className={`font-medium text-white transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed`}
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
              {currentStep === 'emergency' ? (isSubmitting ? 'Registering...' : 'Register') : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </PageLoader>
  );
};

export default StudentRegistration;
