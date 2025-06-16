import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner, DateRangePicker, Header } from '../components/ui';
import EditIcon from '../assets/edit_icon.svg';
import { createEventApi, eventImagefileUploadApi } from '../apis/Events';
import { getUserByIdApi } from '../apis/Users';
import { toast } from 'sonner';
import PageLoader from '../components/PageLoader';

const EventCreate: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [school, setSchool] = useState('');
  const [locality, setLocality] = useState('');
  const [locality_id, setLocality_id] = useState('');
  const [school_id, setSchool_id] = useState('');
  const [area_id, setArea_id] = useState('');
  const [coverImage, setCoverImage] = useState<File | string | null>(null);
  const [eventLogo, setEventLogo] = useState<File | string | null>(null);
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [numberOfSeats, setNumberOfSeats] = useState('');
  const [feesPerDelegate, setFeesPerDelegate] = useState('');
  const [totalRevenue, setTotalRevenue] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [isUploadingCoverImage, setIsUploadingCoverImage] = useState(false);
  const [isUploadingEventLogo, setIsUploadingEventLogo] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);



  const steps = [
    { id: 1, name: 'Event Info', active: currentStep === 1 },
    { id: 2, name: 'Seats & Fees', active: currentStep === 2 },
    { id: 3, name: 'Event Links', active: currentStep === 3 }
  ];


  useEffect(() => {
    async function getUserById() {
      const user = await getUserByIdApi();
      setSchool(user.data?.school?.name || '');
      setLocality(user.data?.school?.code || '');
      setLocality_id(user.data?.school?.locality_id || '');
      setSchool_id(user.data?.school?.id || '');
      setArea_id(user.data?.school?.area_id || '');
    }
    getUserById();
  }, []);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    // Validate all required fields
    if (!coverImage) {
      errors.coverImage = 'Event cover image is required';
    }
    if (!eventLogo) {
      errors.eventLogo = 'Event logo is required';
    }
    if (!eventName.trim()) {
      errors.eventName = 'Event name is required';
    }
    if (!eventDescription.trim()) {
      errors.eventDescription = 'Event description is required';
    } else if (eventDescription.trim().length > 500) {
      errors.eventDescription = 'Event description must be upto 500 characters';
    }
    if (!eventStartDate) {
      errors.eventStartDate = 'Event start date is required';
    }
    if (!eventEndDate) {
      errors.eventEndDate = 'Event end date is required';
    }

    // Validate date logic
    if (eventStartDate && eventEndDate) {
      const startDate = new Date(eventStartDate);
      const endDate = new Date(eventEndDate);
      if (startDate >= endDate) {
        errors.eventEndDate = 'End date must be after start date';
      }
    }

    // Validate seats and fees if on step 2
    if (currentStep === 2) {
      if (!numberOfSeats.trim()) {
        errors.numberOfSeats = 'Number of seats is required';
      } else if (isNaN(Number(numberOfSeats)) || Number(numberOfSeats) <= 0) {
        errors.numberOfSeats = 'Number of seats must be a positive number';
      }

      if (!feesPerDelegate.trim()) {
        errors.feesPerDelegate = 'Fees per delegate is required';
      } else if (isNaN(Number(feesPerDelegate)) || Number(feesPerDelegate) <= 0) {
        errors.feesPerDelegate = 'Fees per delegate must be a positive number';
      }
    }

    // Validate event links if on step 3
    if (currentStep === 3) {
      if (!website.trim()) {
        errors.website = 'Website is required';
      } else if (!isValidUrl(website)) {
        errors.website = 'Please enter a valid website URL';
      }

      if (!instagram.trim()) {
        errors.instagram = 'Instagram handle is required';
      } else if (!isValidInstagramHandle(instagram)) {
        errors.instagram = 'Please enter a valid Instagram handle (e.g., @username)';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinue = async () => {
    if (currentStep === 1) {
      // Validate step 1 before proceeding
      if (!validateForm()) {
        toast.error('Please fill in all required fields and ensure description is upto 500 characters');
        return;
      }
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 2) {
      // Validate step 2 before proceeding
      if (!validateForm()) {
        toast.error('Please fill in all required fields for seats and fees');
        return;
      }
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 3) {
      // Validate step 3 before proceeding
      if (!validateForm()) {
        toast.error('Please fill in all required fields for event links');
        return;
      }

      try {
        setIsSubmitting(true);
        const organiser_id = localStorage.getItem('organiserId') as string;
        const response = await createEventApi(eventName, eventDescription, eventStartDate, eventEndDate, coverImage as string, eventLogo as string, locality_id, school_id, area_id, numberOfSeats, feesPerDelegate, totalRevenue, website, instagram , organiser_id as string);
        if (response.success) {
          toast.success(response.message);
          navigate('/event-create-success');
        } else {
          toast.error(response.message);
        }
      } catch (error: any) {
        toast.error('Failed to create event: ' + (error.message || 'Unknown error'));
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };


  const clearValidationError = (field: string) => {
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setEventStartDate(startDate);
    setEventEndDate(endDate);
    clearValidationError('eventStartDate');
    clearValidationError('eventEndDate');
  };

  const handleDatePickerToggle = () => {
    setShowDatePicker(!showDatePicker);
  };

  const handleDatePickerClose = () => {
    setShowDatePicker(false);
  };

  const calculateTotalRevenue = (seats: string, fees: string) => {
    const seatsNum = Number(seats);
    const feesNum = Number(fees);
    if (!isNaN(seatsNum) && !isNaN(feesNum) && seatsNum > 0 && feesNum > 0) {
      setTotalRevenue((seatsNum * feesNum).toString());
    } else {
      setTotalRevenue('');
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const isValidInstagramHandle = (handle: string) => {
    return /^@[a-zA-Z0-9._]+$/.test(handle);
  };

  const handleNumberInput = (value: string, setter: (value: string) => void, errorKey: string) => {
    // Check if user tried to enter non-numeric characters
    const hasNonNumeric = /[^0-9]/.test(value);
    if (hasNonNumeric) {
      toast.error('Only numbers are allowed in this field');
    }

    // Remove any non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '');
    setter(numericValue);
    clearValidationError(errorKey);
  };


  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, imageType: 'cover' | 'logo') => {
    try {
      const files = event.target.files;
      if (files) {
        // Set loading state based on image type
        if (imageType === 'cover') {
          setIsUploadingCoverImage(true);
        } else {
          setIsUploadingEventLogo(true);
        }

        const response = await eventImagefileUploadApi(files[0] as File);
        if (response.success) {
          toast.success(response.message);
          if (imageType === 'cover') {
            setCoverImage(response.imageUrl);
            clearValidationError('coverImage');
          } else {
            setEventLogo(response.imageUrl);
            clearValidationError('eventLogo');
          }
        } else {
          toast.error(response.message);
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      // Clear loading state
      if (imageType === 'cover') {
        setIsUploadingCoverImage(false);
      } else {
        setIsUploadingEventLogo(false);
      }
    }
  }

  const renderEventInfoStep = () => (
    <div className="space-y-8">
      {/* Event Cover Image */}
      <div
        style={{
          display: 'flex',
          gap: '8rem',
          alignItems: 'flex-end',
        }}
      >
        <div className="relative">
          <div
            className="flex items-center justify-center border-2 border-dashed"
            style={{
              width: '400px',
              height: '225px',
              flexShrink: 0,
              borderRadius: '20px',
              background: '#D9C7A1',
              borderColor: validationErrors.coverImage ? '#ef4444' : '#d1d5db',
            }}
          >
            {isUploadingCoverImage ? (
              <LoadingSpinner size="large" text="Uploading..." />
            ) : coverImage ? (
              <img
                src={typeof coverImage === 'string' ? coverImage : URL.createObjectURL(coverImage)}
                alt="Event Cover"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '20px',
                }}
              />
            ) : (
              <div className="text-center text-black font-medium">
                Event Cover Image
              </div>
            )}
          </div>
          <label className={`absolute bottom-0 bg-white rounded-full p-2 shadow-md ${isUploadingCoverImage ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-50'}`} style={{ right: '-2rem' }}>
            <img src={EditIcon} alt="Edit" className="w-4 h-4" />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e, 'cover')}
              disabled={isUploadingCoverImage}
              className="hidden"
            />
          </label>
        </div>

        <div>
          <div className="relative w-32 h-32">
            <div
              className="flex items-center justify-center border-2 border-dashed"
              style={{
                width: '128px',
                height: '128px',
                flexShrink: 0,
                borderRadius: '20px',
                background: '#D9C7A1',
                borderColor: validationErrors.eventLogo ? '#ef4444' : '#d1d5db',
              }}
            >
              {isUploadingEventLogo ? (
                <LoadingSpinner size="medium" text="Uploading..." />
              ) : eventLogo ? (
                <img
                  src={typeof eventLogo === 'string' ? eventLogo : URL.createObjectURL(eventLogo)}
                  alt="Event Logo"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '20px',
                  }}
                />
              ) : (
                <div className="text-center text-black font-medium text-sm">
                  Event Logo
                </div>
              )}
            </div>
            <label className={`absolute bottom-0 bg-white rounded-full p-2 shadow-md ${isUploadingEventLogo ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-50'}`} style={{ right: '-2rem' }}>
              <img src={EditIcon} alt="Edit" className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e, 'logo')}
                disabled={isUploadingEventLogo}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Image Upload Error Messages */}
      <div className="flex gap-8">
        <div>
          {validationErrors.coverImage && (
            <div className="text-red-500 text-sm mt-2">{validationErrors.coverImage}</div>
          )}
        </div>
        <div>
          {validationErrors.eventLogo && (
            <div className="text-red-500 text-sm mt-2">{validationErrors.eventLogo}</div>
          )}
        </div>
      </div>

      {/* Event Name */}
      <div>
        <label className="block mb-2"
          style={{
            color: '#000',
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: 700,
            lineHeight: '150%',
          }}
        >
          Event Name
        </label>
        <input
          type="text"
          value={eventName}
          onChange={(e) => {
            setEventName(e.target.value);
            clearValidationError('eventName');
          }}
          placeholder="E.g. Global Vision MUN 2025"
          style={{
            display: 'flex',
            width: '400px',
            height: '40px',
            padding: '10px',
            alignItems: 'flex-start',
            gap: '10px',
            borderRadius: '5px',
            border: validationErrors.eventName ? '1px solid #ef4444' : '1px solid #d1d5db',
            outline: 'none',
          }}
        />
        {validationErrors.eventName && (
          <div className="text-red-500 text-sm mt-1">{validationErrors.eventName}</div>
        )}
      </div>

      {/* Event Description */}
      <div>
        <label className="block mb-2"
          style={{
            color: '#000',
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: 700,
            lineHeight: '150%',
          }}
        >
          Event Description
        </label>
        <textarea
          value={eventDescription}
          onChange={(e) => {
            setEventDescription(e.target.value);
            clearValidationError('eventDescription');
          }}
          placeholder="E.g. Describe the event (upto 500 characters)"
          maxLength={500}
          rows={4}
          style={{
            display: 'flex',
            width: '400px',
            height: '100px',
            padding: '10px',
            alignItems: 'flex-start',
            gap: '10px',
            borderRadius: '5px',
            border: validationErrors.eventDescription ? '1px solid #ef4444' : '1px solid #d1d5db',
            outline: 'none',
          }}
        />
        <div className="flex justify-between w-[400px] text-sm mt-1">
          <div className={validationErrors.eventDescription ? 'text-red-500' : 'text-gray-500'}>
            {validationErrors.eventDescription || `${eventDescription.length}/500 maximum`}
          </div>
        </div>
      </div>

      {/* Event Dates */}
      <div>
        <label
          className="block mb-2"
          style={{
            color: '#000',
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: 700,
            lineHeight: '150%',
          }}
        >
          Event Dates
        </label>
        <div className="relative">
          {/* Date Range Input Field */}
          <div
            onClick={handleDatePickerToggle}
            className="flex items-center justify-between w-[400px] px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
            style={{
              border: validationErrors.eventStartDate || validationErrors.eventEndDate ? '1px solid #ef4444' : '1px solid #9CA3AF',
            }}
          >
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Start Date</span>
                <span className="text-sm font-medium">
                  {eventStartDate ? new Date(eventStartDate).toLocaleDateString('en-GB') : 'DD / MM / YYYY'}
                </span>
              </div>
              <div className="text-gray-400">to</div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">End Date</span>
                <span className="text-sm font-medium">
                  {eventEndDate ? new Date(eventEndDate).toLocaleDateString('en-GB') : 'DD / MM / YYYY'}
                </span>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          {/* Date Range Picker */}
          {showDatePicker && (
            <DateRangePicker
              startDate={eventStartDate}
              endDate={eventEndDate}
              onDateRangeChange={handleDateRangeChange}
              onClose={handleDatePickerClose}
              maxDays={7}
            />
          )}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          Select the start and end dates for your event
        </div>
        {(validationErrors.eventStartDate || validationErrors.eventEndDate) && (
          <div className="text-red-500 text-sm mt-1">
            {validationErrors.eventStartDate || validationErrors.eventEndDate}
          </div>
        )}
      </div>

      {/* School */}
      <div>
        <label
          className="block mb-2"
          style={{
            color: '#000',
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: 700,
            lineHeight: '150%',
          }}
        >
          School
        </label>
        <input
          type="text"
          value={school}
          disabled
          onChange={(e) => setSchool(e.target.value)}
          style={{
            display: 'flex',
            width: '400px',
            height: '40px',
            padding: '10px',
            alignItems: 'flex-start',
            gap: '10px',
            borderRadius: '5px',
            border: '1px solid #d1d5db', // matches border-gray-300
            outline: 'none',
          }}
        />
      </div>

      {/* Locality */}
      <div>
        <label
          className="block mb-2"
          style={{
            color: '#000',
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: 700,
            lineHeight: '150%',
          }}
        >
          Locality
        </label>
        <input
          type="text"
          value={locality}
          disabled
          onChange={(e) => setLocality(e.target.value)}
          style={{
            display: 'flex',
            width: '400px',
            height: '40px',
            padding: '10px',
            alignItems: 'flex-start',
            gap: '10px',
            borderRadius: '5px',
            border: '1px solid #d1d5db', // matches border-gray-300
            outline: 'none',
          }}
        />
      </div>
    </div>
  );

  const renderSeatsAndFeesStep = () => (
    <div className="space-y-8">
      {/* Number of Seats */}
      <div>
        <label className="block mb-2"
          style={{
            color: '#000',
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: 700,
            lineHeight: '150%',
          }}
        >
          No. of Seats
        </label>
        <input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          value={numberOfSeats}
          onChange={(e) => {
            handleNumberInput(e.target.value, (value) => {
              setNumberOfSeats(value);
              calculateTotalRevenue(value, feesPerDelegate);
            }, 'numberOfSeats');
          }}
          placeholder="E.g. 400"
          style={{
            display: 'flex',
            width: '400px',
            height: '40px',
            padding: '10px',
            alignItems: 'flex-start',
            gap: '10px',
            borderRadius: '5px',
            border: validationErrors.numberOfSeats ? '1px solid #ef4444' : '1px solid #d1d5db',
            outline: 'none',
          }}
        />
        {validationErrors.numberOfSeats && (
          <div className="text-red-500 text-sm mt-1">{validationErrors.numberOfSeats}</div>
        )}
      </div>

      {/* Fees per Delegate */}
      <div>
        <label className="block mb-2"
          style={{
            color: '#000',
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: 700,
            lineHeight: '150%',
          }}
        >
          Fees per Delegate
        </label>
        <div className="relative">
          <span
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#6b7280',
              fontSize: '16px',
              fontWeight: 500,
            }}
          >
            AED
          </span>
          <input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            value={feesPerDelegate}
            onChange={(e) => {
              handleNumberInput(e.target.value, (value) => {
                setFeesPerDelegate(value);
                calculateTotalRevenue(numberOfSeats, value);
              }, 'feesPerDelegate');
            }}
            placeholder="200"
            style={{
              display: 'flex',
              width: '400px',
              height: '40px',
              padding: '10px 10px 10px 50px',
              alignItems: 'flex-start',
              gap: '10px',
              borderRadius: '5px',
              border: validationErrors.feesPerDelegate ? '1px solid #ef4444' : '1px solid #d1d5db',
              outline: 'none',
            }}
          />
        </div>
        {validationErrors.feesPerDelegate && (
          <div className="text-red-500 text-sm mt-1">{validationErrors.feesPerDelegate}</div>
        )}
      </div>

      {/* Total Revenue */}
      <div>
        <label className="block mb-2"
          style={{
            color: '#000',
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: 700,
            lineHeight: '150%',
          }}
        >
          Total Revenue
        </label>
        <div className="relative">
          <span
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#6b7280',
              fontSize: '16px',
              fontWeight: 500,
            }}
          >
            AED
          </span>
          <input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            value={totalRevenue}
            readOnly
            placeholder='80000'
            style={{
              display: 'flex',
              width: '400px',
              height: '40px',
              padding: '10px 10px 10px 50px',
              alignItems: 'flex-start',
              gap: '10px',
              borderRadius: '5px',
              border: '1px solid #d1d5db',
              outline: 'none',
              backgroundColor: '#f9fafb',
              color: '#6b7280',
            }}
          />
        </div>
      </div>
    </div>
  );

  const renderEventLinksStep = () => (
    <div className="space-y-8">
      {/* Website */}
      <div>
        <label className="block mb-2"
          style={{
            color: '#000',
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: 700,
            lineHeight: '150%',
          }}
        >
          Website
        </label>
        <input
          type="text"
          value={website}
          onChange={(e) => {
            setWebsite(e.target.value);
            clearValidationError('website');
          }}
          placeholder="www.globalvisionmun.com"
          style={{
            display: 'flex',
            width: '400px',
            height: '40px',
            padding: '10px',
            alignItems: 'flex-start',
            gap: '10px',
            borderRadius: '5px',
            border: validationErrors.website ? '1px solid #ef4444' : '1px solid #d1d5db',
            outline: 'none',
          }}
        />
        {validationErrors.website && (
          <div className="text-red-500 text-sm mt-1">{validationErrors.website}</div>
        )}
      </div>

      {/* Instagram */}
      <div>
        <label className="block mb-2"
          style={{
            color: '#000',
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: 700,
            lineHeight: '150%',
          }}
        >
          Instagram
        </label>
        <input
          type="text"
          value={instagram}
          onChange={(e) => {
            setInstagram(e.target.value);
            clearValidationError('instagram');
          }}
          placeholder="@globalvisionmun"
          style={{
            display: 'flex',
            width: '400px',
            height: '40px',
            padding: '10px',
            alignItems: 'flex-start',
            gap: '10px',
            borderRadius: '5px',
            border: validationErrors.instagram ? '1px solid #ef4444' : '1px solid #d1d5db',
            outline: 'none',
          }}
        />
        {validationErrors.instagram && (
          <div className="text-red-500 text-sm mt-1">{validationErrors.instagram}</div>
        )}
      </div>
    </div>
  );

  return (
    <PageLoader loadingText="Loading Event Creation...">
      <div className="min-h-screen bg-white">
        {/* Header Section */}
        <Header />

        {/* Breadcrumb */}
        <div className="py-3">
          <div className="mx-auto px-6" style={{ maxWidth: '65rem' }}>
            <div className="flex items-center text-sm text-gray-600">
              <span
                className="cursor-pointer"
                onClick={() => navigate('/home')}
                style={{
                  color: '#C2A46D',
                  fontSize: '25px',
                  fontStyle: 'normal',
                  fontWeight: 700,
                  lineHeight: '150%',
                }}
              >
                Home
              </span>
              <span className="mx-2" style={{
                color: '#C2A46D',
                fontSize: '25px',
                fontStyle: 'normal',
                fontWeight: 700,
                lineHeight: '150%',
              }}>&gt;</span>
              <span className="text-[#1E395D] font-medium" style={{
                color: '#C2A46D',
                fontSize: '25px',
                fontStyle: 'normal',
                fontWeight: 700,
                lineHeight: '150%',
              }}>Event Info</span>
            </div>
          </div>
        </div>

        {/* Step Navigation */}
        <div className="bg-white">
          <div className="mx-auto px-6" style={{ maxWidth: '65rem' }}>
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div
                    className={`font-medium transition-colors duration-200 cursor-pointer ${step.active
                      ? 'bg-[#1E395D] text-white'
                      : 'bg-white text-gray-600 hover:text-gray-800'
                      }`}
                    style={{
                      display: 'flex',
                      width: '200px',
                      height: '58px',
                      padding: '5px',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: '20px',

                    }}
                    onClick={() => setCurrentStep(step.id)}
                  >
                    {step.name}
                  </div>
                  {index < steps.length - 1 && (
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto px-6 py-8" style={{ maxWidth: '65rem' }}>
          {currentStep === 1 && renderEventInfoStep()}
          {currentStep === 2 && renderSeatsAndFeesStep()}
          {currentStep === 3 && renderEventLinksStep()}

          {/* Continue Button */}
          <div className="mt-12 text-left">
            <button
              onClick={() => {
                if (currentStep === 3) {
                  handleContinue();
                } else {
                  if (!validateForm()) {
                    toast.error('Please fill in all required fields');
                    return;
                  }
                  setCurrentStep(currentStep + 1);
                }
              }}
              disabled={isSubmitting}
              style={{
                display: 'flex',
                width: '120px',
                padding: '10px',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                borderRadius: '30px',
                background: isSubmitting ? '#9CA3AF' : '#C2A46D',
                color: '#fff',
                fontWeight: 500,
                fontSize: '16px',
                border: 'none',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
                opacity: isSubmitting ? 0.7 : 1,
              }}
              onMouseOver={e => !isSubmitting && (e.currentTarget.style.background = '#B8945F')}
              onMouseOut={e => !isSubmitting && (e.currentTarget.style.background = '#C2A46D')}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                'Continue'
              )}
            </button>
          </div>
        </div>
      </div>
    </PageLoader>
  );
};

export default EventCreate;
