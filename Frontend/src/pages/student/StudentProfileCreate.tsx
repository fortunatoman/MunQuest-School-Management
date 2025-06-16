import React, { useState, useEffect, useRef } from 'react';
import { Header } from '../../components/ui';
import { useNavigate } from 'react-router-dom';
import { studentProfileApi, updateStudentProfileAndCustomLocalityApi, updateStudentProfileCustomSchoolNameApi } from '../../apis/Users';
import { toast } from 'sonner';
import { generateUsername } from '../../utils/usernameGenerator';
import PageLoader from '../../components/PageLoader';
import { useApp } from '../../contexts/AppContext';

type Step = 'personal' | 'school' | 'contact' | 'success';

const StudentProfile: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('personal');
  const navigate = useNavigate();
  const { allLocalities, allSchools, refreshLocalitiesData, refreshSchoolsData, refreshAreasData } = useApp();

  // Debug: Log context data whenever it changes
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [fullname, setFullname] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [generatedUsername, setGeneratedUsername] = useState<string>('');
  const [birthday, setBirthday] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [locality, setLocality] = useState<string>('');
  const [customLocality, setCustomLocality] = useState<string>('');
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [customSchool, setCustomSchool] = useState<string>('');
  const [school_id, setSchool_id] = useState<string>('');
  const [gradeType, setGradeType] = useState<string>('');
  const [grade, setGrade] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [phone_e164, setPhone_e164] = useState<string>('');
  const [countryCode, setCountryCode] = useState<string>('+971');
  const [filteredSchools, setFilteredSchools] = useState<any[]>([]);
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const [schoolSearchTerm, setSchoolSearchTerm] = useState<string>('');

  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleNameChange = (fullName: string) => {
    setFullname(fullName);
    setUsername(fullName);
    const generated = generateUsername(fullName);
    setGeneratedUsername(generated);
  };

  const handleGenderSelect = (gender: 'male' | 'female' | 'other') => {
    setGender(gender);
  };

  const handleGradeTypeSelect = (gradeType: 'grade' | 'year' | 'programme' | 'other') => {
    setGradeType(gradeType);
  };

  const generatePhoneE164 = (phone: string, countryCode: string): string => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const phoneE164 = `${countryCode}${cleanPhone}`;
    console.log('Generating phone_e164:', { phone, countryCode, cleanPhone, phoneE164 });
    return phoneE164;
  };

  const handleCountryCodeSelect = (code: string) => {
    setCountryCode(code);
    setShowCountryDropdown(false);
    if (phone) {
      const phoneE164 = generatePhoneE164(phone, code);
      setPhone_e164(phoneE164);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          refreshLocalitiesData(),
          refreshSchoolsData(),
          refreshAreasData()
        ]);
      } catch (error) {
        console.log('Error loading data:', error);
        toast.error('Failed to load profile data. Please refresh the page.');
      }
    };
    loadData();
  }, []); // Empty dependency array to run only once on mount

  const handleCityChange = (cityCode: string) => {
    setLocality(cityCode);
    setSelectedSchool(null);
    setSchool_id('');
    setSchoolSearchTerm('');
    setCustomSchool('');

    // Clear custom locality when selecting a predefined locality
    if (cityCode !== 'Other') {
      setCustomLocality('');
    }

    if (cityCode && cityCode !== 'Other') {
      const schoolsInLocality = allSchools.filter(school => school.locality.code === cityCode);
      setFilteredSchools(schoolsInLocality);
    } else {
      setFilteredSchools([]);
    }
  };

  const handleCustomLocalityChange = (value: string) => {
    setCustomLocality(value);
    setSelectedSchool(null);
    setSchool_id('');
    setSchoolSearchTerm('');
    setCustomSchool('');
    setFilteredSchools([]);
  };

  const handleSchoolSearch = (searchTerm: string) => {
    setSchoolSearchTerm(searchTerm);
    if (searchTerm.trim() === '') {
      const schoolsInLocality = allSchools.filter(school => school.locality.code === locality);
      setFilteredSchools(schoolsInLocality);
    } else {
      const schoolsInLocality = allSchools.filter(school => school.locality.code === locality);
      const filtered = schoolsInLocality.filter(school =>
        school.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.locality.code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSchools(filtered);
    }
  };

  const handleSchoolSelect = (school: any) => {
    console.log('handleSchoolSelect', school);
    const schoolLabel = school.name;
    setSelectedSchool(school);
    setSchool_id(school.id);
    setSchoolSearchTerm(schoolLabel);
    setShowSchoolDropdown(false);

    if (school.id !== 'UNLISTED') {
      setCustomSchool('');
    }
  };

  const handleCustomSchoolChange = (value: string) => {
    setCustomSchool(value);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
        setShowSchoolDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const renderStepIndicator = () => {
    const steps = [
      { key: 'personal', label: 'Personal Info' },
      { key: 'school', label: 'School Info' },
      { key: 'contact', label: 'Contact Info' }
    ];

    return (
      <div className="flex items-center justify-start mb-8">
        {steps.map((step, index) => (
          <React.Fragment key={step.key}>
            <button
              className={`flex items-center justify-center w-[200px] h-[58px] p-[5px] rounded-[20px] text-sm font-medium transition-all ${currentStep === step.key
                ? 'bg-[#1E395D] text-white'
                : 'bg-white text-gray-600 border border-gray-300'
                }`}
              onClick={() => setCurrentStep(step.key as Step)}
            >
              {step.label}
            </button>
            {index < steps.length - 1 && (
              <span className="mx-3 text-gray-600 text-sm">&gt;</span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-base font-bold text-black mb-2">
          Name
        </label>
        <input
          type="text"
          name="name"
          placeholder="E.g. Sam Morgan Lee"
          value={username}
          onChange={e => handleNameChange(e.target.value)}
          className={`w-[400px] px-4 py-4 border rounded-lg text-sm bg-white placeholder-gray-500 focus:outline-none focus:border-[#1E395D] focus:ring-2 focus:ring-[#1E395D] focus:ring-opacity-20 transition-all duration-200 ${errors?.name ? 'border-red-500' : 'border-gray-300'
            }`}
        />
        {errors?.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}

        {/* Generated Username Display */}
        {generatedUsername && (
          <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-600">Generated Username:</span>
                <span className="ml-2 font-mono text-sm font-medium text-[#1E395D]">{generatedUsername}</span>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Date of Birth */}
      <div>
        <label className="block text-base font-bold text-black mb-2">
          Date of Birth
        </label>
        <div className="relative">
          <input
            type="date"
            name="dateOfBirth"
            value={birthday}
            onChange={e => setBirthday(e.target.value)}
            className={`w-[400px] px-4 py-4 pl-12 border rounded-lg text-sm bg-white focus:outline-none focus:border-[#1E395D] focus:ring-2 focus:ring-[#1E395D] focus:ring-opacity-20 transition-all duration-200 ${errors?.dateOfBirth ? 'border-red-500' : 'border-gray-300'
              }`}
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        {errors?.dateOfBirth && <p className="mt-1 text-xs text-red-600">{errors.dateOfBirth}</p>}
      </div>

      {/* Gender */}
      <div>
        <label className="block text-base font-bold text-black mb-2">
          Gender
        </label>
        <div className="flex gap-2">
          {(['male', 'female', 'other'] as const).map((genderOption) => (
            <button
              key={genderOption}
              type="button"
              onClick={() => handleGenderSelect(genderOption)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all flex items-center justify-center w-[200px] ${gender === genderOption
                ? 'bg-[#D9C7A1] text-black border-[#D9C7A1]'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
            >
              {genderOption.charAt(0).toUpperCase() + genderOption.slice(1)}
            </button>
          ))}
        </div>
        {errors?.gender && <p className="mt-1 text-xs text-red-600">{errors.gender}</p>}
      </div>
    </div>
  );

  const renderSchoolInfo = () => (
    <div className="space-y-6">
      {/* Locality of School */}
      <div>
        <label className="block text-base font-bold text-black mb-2">
          Locality of School <span className="text-[#7E7E7E] text-base font-normal leading-[150%]">(City or Town)</span>
        </label>
        <div className="relative">
          <select
            name="locality"
            value={locality}
            onChange={(e) => handleCityChange(e.target.value)}
            className={`w-[400px] px-4 py-4 pr-10 border rounded-lg text-sm bg-white focus:outline-none focus:border-[#1E395D] focus:ring-2 focus:ring-[#1E395D] focus:ring-opacity-20 transition-all duration-200 appearance-none ${errors?.locality ? 'border-red-500' : 'border-gray-300'
              }`}
          >
            <option value="">Select a locality...</option>
            {allLocalities.length > 0 ? (
              allLocalities.map((localityItem) => {
                return (
                  <option key={localityItem.id} value={localityItem.code}>
                    {localityItem.name}
                  </option>
                );
              })
            ) : (
              <option value="" disabled>No localities loaded</option>
            )}
          </select>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {errors?.locality && <p className="mt-1 text-xs text-red-600">{errors.locality}</p>}

        {/* Custom Locality Input - appears when "Other" is selected */}
        {locality === 'Other' && (
          <div className="mt-4">
            <label className="block text-base font-bold text-black mb-2">
              Enter Custom Locality
            </label>
            <input
              type="text"
              name="customLocality"
              placeholder="Enter your locality name..."
              value={customLocality}
              onChange={(e) => handleCustomLocalityChange(e.target.value)}
              className={`w-[400px] px-4 py-4 border rounded-lg text-sm bg-white focus:outline-none focus:border-[#1E395D] focus:ring-2 focus:ring-[#1E395D] focus:ring-opacity-20 transition-all duration-200 ${errors?.customLocality ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors?.customLocality && <p className="mt-1 text-xs text-red-600">{errors.customLocality}</p>}
          </div>
        )}
      </div>

      {/* School Name */}
      <div>
        <label className="block text-base font-bold text-black mb-2">
          School Name
        </label>
        <div className="relative" ref={dropdownRef}>
          <input
            type="text"
            name="schoolName"
            placeholder={locality === 'Other' ? "School selection not available for custom locality" : locality ? "Search by school name or code..." : "Please select a city first"}
            value={schoolSearchTerm}
            onChange={e => handleSchoolSearch(e.target.value)}
            onFocus={() => setShowSchoolDropdown(true)}
            disabled={!locality || locality === 'Other'}
            className={`w-[400px] px-4 py-4 pl-12 pr-12 border rounded-lg text-sm bg-white placeholder-gray-500 focus:outline-none focus:border-[#1E395D] focus:ring-2 focus:ring-[#1E395D] focus:ring-opacity-20 transition-all duration-200 ${errors?.schoolName ? 'border-red-500' : 'border-gray-300'} ${!locality || locality === 'Other' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedSchool(null);
              setSchool_id('');
              setSchoolSearchTerm('');
              setShowSchoolDropdown(false);
            }}
            disabled={!locality || locality === 'Other'}
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${!locality || locality === 'Other' ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-300 hover:bg-gray-400'}`}
          >
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* School Dropdown */}
          {showSchoolDropdown && locality && locality !== 'Other' && filteredSchools.length > 0 && (
            <div className="absolute top-full left-0 z-10 w-[400px] mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredSchools.map((school, index) => (
                <div
                  key={`${school.code}-${index}`}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleSchoolSelect(school)}
                >
                  <div className="font-medium text-sm text-gray-900">
                    {school.name}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    Code: {school.code}
                  </div>
                  {(school.area && school.area.name !== '-') && (
                    <div className="text-xs text-gray-500 mt-1">
                      {school.area.name}
                    </div>
                  )}
                  {school.locality.name && (
                    <div className="text-xs text-gray-500 mt-1">
                      {school.locality.name}
                    </div>
                  )}
                </div>
              ))}
              <div
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => handleSchoolSelect({ id: 'UNLISTED', name: 'Unlisted / Not in the list / Other', code: 'UNLISTED', locality: { name: 'Unlisted / Not in the list / Other' } })}
              >
                <div className="font-medium text-sm text-gray-900">
                  Unlisted / Not in the list / Other
                </div>
              </div>
              {filteredSchools.length === 0 && schoolSearchTerm && (
                <div className="px-4 py-3 text-sm text-gray-500">
                  No schools found matching "{schoolSearchTerm}"
                </div>
              )}
            </div>
          )}
        </div>
        {errors?.schoolName && <p className="mt-1 text-xs text-red-600">{errors.schoolName}</p>}

        {/* Custom School Input - appears when "Unlisted / Not in the list / Other" is selected OR when locality is "Other" */}
        {((selectedSchool && selectedSchool.id === 'UNLISTED') || locality === 'Other') && (
          <div className="mt-4">
            <label className="block text-base font-bold text-black mb-2">
              Enter School Name
            </label>
            <input
              type="text"
              name="customSchool"
              placeholder="Enter your school name..."
              value={customSchool}
              onChange={(e) => handleCustomSchoolChange(e.target.value)}
              className={`w-[400px] px-4 py-4 border rounded-lg text-sm bg-white focus:outline-none focus:border-[#1E395D] focus:ring-2 focus:ring-[#1E395D] focus:ring-opacity-20 transition-all duration-200 ${errors?.customSchool ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors?.customSchool && <p className="mt-1 text-xs text-red-600">{errors.customSchool}</p>}
          </div>
        )}
      </div>

      {/* Grade Type Selection */}
      <div>
        <label className="block text-base font-bold text-black mb-2">
          Grade or Year or Programme
        </label>
        <div className="w-[400px] border border-gray-300 rounded-lg p-4 mb-4">
          <div className="flex gap-4 bg-white">
            {(['grade', 'year', 'programme', 'other'] as const).map((type) => (
              <label key={type} className="flex items-center">
                <input
                  type="radio"
                  name="gradeType"
                  value={type}
                  checked={gradeType === type}
                  onChange={() => handleGradeTypeSelect(type)}
                  className="mr-3 w-5 h-5 text-[#1E395D] focus:ring-[#1E395D]"
                />
                <span className={`text-sm capitalize ${gradeType === type ? 'text-black' : 'text-gray-500'
                  }`}>{type}</span>
              </label>
            ))}
          </div>
        </div>
        {errors?.gradeType && <p className="mt-1 text-xs text-red-600">{errors.gradeType}</p>}
      </div>

      {/* Grade Selection */}
      <div>
        <div className="relative">
          <select
            name="grade"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className={`w-full px-4 py-4 pr-10 border rounded-lg text-sm bg-white focus:outline-none focus:border-[#1E395D] focus:ring-2 focus:ring-[#1E395D] focus:ring-opacity-20 transition-all duration-200 appearance-none ${errors?.grade ? 'border-red-500' : 'border-gray-300'
              }`}
          >
            {gradeType === 'grade' && (
              <>
                <option value="">Select Grade</option>
                <option value="grade-5">Grade 5</option>
                <option value="grade-6">Grade 6</option>
                <option value="grade-7">Grade 7</option>
                <option value="grade-8">Grade 8</option>
                <option value="grade-9">Grade 9</option>
                <option value="grade-10">Grade 10</option>
                <option value="grade-11">Grade 11</option>
                <option value="grade-12">Grade 12</option>
              </>
            )}
            {gradeType === 'year' && (
              <>
                <option value="">Select Year</option>
                <option value="year-6">Year 6</option>
                <option value="year-7">Year 7</option>
                <option value="year-8">Year 8</option>
                <option value="year-9">Year 9</option>
                <option value="year-10">Year 10</option>
                <option value="year-11">Year 11</option>
                <option value="year-12">Year 12</option>
                <option value="year-13">Year 13</option>
              </>
            )}
            {gradeType === 'programme' && (
              <>
                <option value="">Select Programme</option>
                <option value="PYP-5">PYP 5</option>
                <option value="MYP-1">MYP 1</option>
                <option value="MYP-2">MYP 2</option>
                <option value="MYP-3">MYP 3</option>
                <option value="MYP-4">MYP 4</option>
                <option value="MYP-5">MYP 5</option>
                <option value="IB-DP-1">IB DP 1</option>
                <option value="IB-DP-2">IB DP 2</option>
              </>
            )}
            {gradeType === 'other' && (
              <>
                <option value="">Select Other</option>
                <option value="other-1">Other 1</option>
                <option value="other-2">Other 2</option>
                <option value="other-3">Other 3</option>
                <option value="other-4">Other 4</option>
                <option value="other-5">Other 5</option>
                <option value="other-6">Other 6</option>
                <option value="other-7">Other 7</option>
                <option value="other-8">Other 8</option>
              </>
            )}
          </select>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {errors?.grade && <p className="mt-1 text-xs text-red-600">{errors.grade}</p>}
      </div>
    </div>
  );

  const renderContactInfo = () => (
    <div className="space-y-6">
      {/* Mobile */}
      <div>
        <label className="block text-base font-bold text-black mb-2">
          Mobile
        </label>
        <div className="relative" ref={dropdownRef}>
          <div className="flex border rounded-lg bg-white">
            {/* Country Code Selector */}
            <div
              className="flex items-center px-4 py-4 border-r border-gray-300 cursor-pointer hover:bg-gray-50"
              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
            >
              <span className="text-sm text-gray-600 mr-2">{countryCode}</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {/* Phone Number Input */}
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9\s]*"
              name="phone"
              placeholder="50 6362040"
              value={phone}
              onChange={e => {
                // Check if user tried to enter invalid characters
                const hasInvalidChars = /[^0-9\s]/.test(e.target.value);
                if (hasInvalidChars) {
                  toast.error('Only numbers and spaces are allowed in phone number');
                }

                // Remove any non-numeric characters except spaces
                const phoneValue = e.target.value.replace(/[^0-9\s]/g, '');
                setPhone(phoneValue);
                // Generate phone_e164 format
                const phoneE164 = generatePhoneE164(phoneValue, countryCode);
                setPhone_e164(phoneE164);
              }}
              className={`flex-1 px-4 py-4 text-sm bg-white placeholder-gray-500 focus:outline-none focus:border-[#1E395D] focus:ring-2 focus:ring-[#1E395D] focus:ring-opacity-20 transition-all duration-200 ${errors?.phone ? 'border-red-500' : 'border-gray-300'
                }`}
            />
          </div>

          {/* Country Code Dropdown */}
          {showCountryDropdown && (
            <div className="absolute top-full left-0 z-10 w-64 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {countryCodes.map((country) => (
                <div
                  key={country.code}
                  className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleCountryCodeSelect(country.code)}
                >
                  <span className="text-lg mr-3">{country.flag}</span>
                  <span className="text-sm text-gray-600 mr-2">{country.code}</span>
                  <span className="text-sm text-gray-800">{country.country}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {errors?.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
      </div>
    </div>
  );

  const StudentProfileHandler = async (fullName: string, generatedUsername: string, birthday: string,
     gender: string, school_id: string, grade: string, phone: string, phone_e164: string) => {
    try {
      let finalSchoolId = school_id;

      let response;
      if (locality === 'Other') {
        response = await updateStudentProfileAndCustomLocalityApi(fullName, generatedUsername, birthday, gender, customLocality, customSchool, grade, phone, phone_e164);
      } else if (selectedSchool && selectedSchool.id === 'UNLISTED') {
        response = await updateStudentProfileCustomSchoolNameApi(fullName, generatedUsername, birthday, gender, locality, customSchool, grade, phone, phone_e164);
      } else {
        response = await studentProfileApi(fullName, generatedUsername, birthday, gender, finalSchoolId, grade, phone, phone_e164);
      }
      if (response.success) {
        toast.success('Student profile created successfully');
        navigate('/student-home');
      } else {
        setErrors(response.errors);
        toast.error(response.errors.message);
      }
    } catch (error: any) {
      const errorData = error?.errors || error || { message: 'An unexpected error occurred' };
      setErrors(errorData);
      toast.error(errorData.message || 'An unexpected error occurred');
    }
  }


  return (
    <PageLoader loadingText="Loading Student Profile...">
      <div className="min-h-screen" style={{ backgroundColor: '#F8F8F8' }}>
        {/* Header */}
        <Header />

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 text-left">Student Signup</h1>
            {renderStepIndicator()}
          </div>

          {/* Form Content */}
          <div className="w-[400px] rounded-lg shadow-sm mb-8" style={{ padding: '2rem 0.5rem' }}>
            {currentStep === 'personal' && renderPersonalInfo()}
            {currentStep === 'school' && renderSchoolInfo()}
            {currentStep === 'contact' && renderContactInfo()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-start">
            <button
              type="button"
              onClick={() => {
                if (currentStep === 'personal') {
                  // Validate personal info
                  if (username && generatedUsername && birthday && gender) {
                    setCurrentStep('school');
                  } else {
                    toast.error('Please fill in all personal information fields');
                  }
                } else if (currentStep === 'school') {
                  // Validate school info
                  if (locality === 'Other') {
                    // For custom locality, check if custom locality and custom school are filled and grade is selected
                    if (customLocality.trim() && customSchool.trim() && grade) {
                      setCurrentStep('contact');
                    } else {
                      toast.error('Please fill in all school information fields');
                    }
                  } else {
                    // For predefined localities, check if locality, school, and grade are selected
                    if (selectedSchool && selectedSchool.id === 'UNLISTED') {
                      // For unlisted school, check if custom school is filled and grade is selected
                      if (customSchool.trim() && grade) {
                        setCurrentStep('contact');
                      } else {
                        toast.error('Please fill in all school information fields');
                      }
                    } else {
                      // For predefined schools, check if locality, school, and grade are selected
                      if (locality && selectedSchool && grade) {
                        setCurrentStep('contact');
                      } else {
                        toast.error('Please fill in all school information fields');
                      }
                    }
                  }
                } else if (currentStep === 'contact') {
                  // Validate contact info and submit
                  if (phone && phone_e164) {
                    StudentProfileHandler(fullname, generatedUsername, birthday, gender, school_id, grade, phone, phone_e164);
                  } else {
                    toast.error('Please fill in all contact information fields');
                  }
                }
              }}
              className="font-medium text-white transition-all"
              style={{
                backgroundColor: '#C2A46D',
                borderRadius: '30px',
                display: 'flex',
                width: '120px',
                padding: '10px',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={e => (e.currentTarget.style.backgroundColor = '#C2A46D')}
              onMouseOut={e => (e.currentTarget.style.backgroundColor = '#D9C7A1')}
            >
              Continue
            </button>
          </div>
        </div>
      </div >
    </PageLoader>
  );
};

export default StudentProfile;
