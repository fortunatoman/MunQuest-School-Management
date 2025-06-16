import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header, UnsavedChangesModal } from '../components/ui';
import { toast } from 'sonner';
import { eventImagefileUploadApi, getEventByIdApi, updateEventApi } from '../apis/Events';
import { getAllEventCommitteesApi } from '../apis/Event_committes';
import { useApp } from '../contexts/AppContext';
import PageLoader from '../components/PageLoader';
import {
  DashboardPage,
  EventDetailsPage,
  LeadershipRolesPage,
  CommitteesPage,
  AgendaPage,
  DelegatesPage,
  GeneralDocumentsPage,
  OrganiserNavigation
} from '../components/organiser';

const OrganiserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const [activeStep, setActiveStep] = useState('dashboard');
  const [activeSubSection, setActiveSubSection] = useState<string>('');
  const [activeCommitteeType, setActiveCommitteeType] = useState<string>('');
  const [activeCommittee, setActiveCommittee] = useState<string>('');
  const [eventName, setEventName] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [locality, setLocality] = useState('');
  const [school, setSchool] = useState('');
  const [area, setArea] = useState('');
  const [feesPerDelegate, setFeesPerDelegate] = useState('');
  const [numberOfSeats, setNumberOfSeats] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [locality_id, setLocality_id] = useState('');
  const [school_id, setSchool_id] = useState('');
  const [area_id, setArea_id] = useState('');
  const [totalRevenue, setTotalRevenue] = useState('');
  const [isUploadingCoverImage, setIsUploadingCoverImage] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Committee and registration data for dashboard
  const [committees, setCommittees] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const { allRegistrations, refreshRegistrationsData } = useApp();

  useEffect(() => {
    let defaultStep = localStorage.getItem('activeStep');
    if (defaultStep) setActiveStep(defaultStep);
  }, [])

  // Fetch committee and registration data for dashboard
  const fetchDashboardData = async () => {
    if (!eventId) return;

    try {
      // Fetch committees
      const committeesResponse = await getAllEventCommitteesApi(eventId);
      if (committeesResponse.success) {
        const normalizedCommittees = committeesResponse.data.map((item: any) => {
          const master = item && typeof item.committee === 'object' ? item.committee : null;
          return {
            id: String(item.id),
            committee: master ? (master.committee ?? master.name ?? '') : (item.committee ?? ''),
            abbr: master ? (master.abbr ?? item.abbr ?? '') : (item.abbr ?? ''),
            category: master ? master.category : item.category || 'country',
            seatsTotal: String(item.seats ?? item.seatsTotal ?? '0'),
            committeeId: master ? master.id : (item.committee_id ?? item.committeeId ?? undefined)
          };
        });
        setCommittees(normalizedCommittees);
      }

      // Fetch registrations using the context
      await refreshRegistrationsData(eventId);
    } catch (error: any) {
      console.log('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  // Editing states
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Unsaved changes states
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState<boolean>(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Original values for resetting
  const [originalValues, setOriginalValues] = useState({
    eventName: '',
    eventDescription: '',
    eventStartDate: '',
    eventEndDate: '',
    school: '',
    locality: '',
    numberOfSeats: '',
    feesPerDelegate: '',
    website: '',
    instagram: '',
    coverImage: ''
  });

  // Leadership Roles state



  useEffect(() => {
    const getCurrentEvents = async () => {
      try {
        const response = await getEventByIdApi(eventId || '');
        if (response.success) {
          if (response.data && response.data.length > 0) {
            const eventData = response.data[0];
            setEventName(eventData.name);
            setCoverImage(eventData.cover_image);
            setEventDescription(eventData.description);
            setEventStartDate(eventData.start_date);
            setEventEndDate(eventData.end_date);
            setLocality(eventData.locality.name);
            setSchool(eventData.school.name);
            setArea(eventData.school.name);
            setFeesPerDelegate(eventData.fees_per_delegate);
            setNumberOfSeats(eventData.number_of_seats);
            setWebsite(eventData.website);
            setInstagram(eventData.instagram);
            setLocality_id(eventData.locality.id);
            setSchool_id(eventData.school.id);
            setArea_id(eventData.school.area_id);

            // Store original values for resetting
            setOriginalValues({
              eventName: eventData.name,
              eventDescription: eventData.description,
              eventStartDate: eventData.start_date,
              eventEndDate: eventData.end_date,
              school: eventData.school.name,
              locality: eventData.locality.name,
              numberOfSeats: eventData.number_of_seats,
              feesPerDelegate: eventData.fees_per_delegate,
              website: eventData.website,
              instagram: eventData.instagram,
              coverImage: eventData.cover_image
            });

            // Calculate total revenue
            calculateTotalRevenue(eventData.number_of_seats, eventData.fees_per_delegate);
          }
        } else {
          toast.error(response.message);
        }
      } catch (error: any) {
        console.log('Error fetching events:', error);
        toast.error(error.message);
      }
    };
    getCurrentEvents();
  }, [eventId, navigate]);

  // Fetch dashboard data when eventId changes
  useEffect(() => {
    fetchDashboardData();
  }, [eventId]);

  // Update registrations when allRegistrations changes
  useEffect(() => {
    setRegistrations(allRegistrations || []);
  }, [allRegistrations]);

  const handleStepChange = (step: string) => {
    // Check if there are unsaved changes and we're not already on the event-details page
    if (hasUnsavedChanges && activeStep === 'event-details' && step !== 'event-details') {
      setPendingNavigation(step);
      setShowUnsavedChangesModal(true);
      return;
    }
    setActiveStep(step);
  };

  // Handle field edit
  const handleEditField = (field: string, currentValue: string) => {
    setEditingField(field);
    setTempValue(currentValue);
  };

  // Auto-save field edit when value changes
  const handleFieldChange = (field: string, value: string) => {
    setTempValue(value);
    setHasUnsavedChanges(true); // Mark as having unsaved changes

    // Update the corresponding useState variable based on the field
    switch (field) {
      case 'name':
        setEventName(value);
        break;
      case 'description':
        setEventDescription(value);
        break;
      case 'date':
        // Handle date parsing if needed
        break;
      case 'school_name':
        setSchool(value);
        break;
      case 'locality':
        setLocality(value);
        break;
      case 'number_of_seats':
        setNumberOfSeats(value);
        calculateTotalRevenue(value, feesPerDelegate);
        break;
      case 'fees_per_delegate':
        setFeesPerDelegate(value);
        calculateTotalRevenue(numberOfSeats, value);
        break;
      case 'website':
        setWebsite(value);
        break;
      case 'instagram':
        setInstagram(value);
        break;
      default:
        break;
    }
  };

  // Cancel field edit
  const handleCancelEdit = () => {
    if (editingField) {
      // Reset the field value to its original state
      switch (editingField) {
        case 'name':
          setEventName(eventName);
          break;
        case 'description':
          setEventDescription(eventDescription);
          break;
        case 'date':
          // Handle date reset if needed
          break;
        case 'school_name':
          setSchool(school);
          break;
        case 'locality':
          setLocality(locality);
          break;
        case 'number_of_seats':
          setNumberOfSeats(numberOfSeats);
          calculateTotalRevenue(numberOfSeats, feesPerDelegate);
          break;
        case 'fees_per_delegate':
          setFeesPerDelegate(feesPerDelegate);
          calculateTotalRevenue(numberOfSeats, feesPerDelegate);
          break;
        case 'website':
          setWebsite(website);
          break;
        case 'instagram':
          setInstagram(instagram);
          break;
        default:
          break;
      }
    }
    setEditingField(null);
    setTempValue('');
    setShowDatePicker(false); // Close date picker when canceling edit
    setHasUnsavedChanges(false); // Reset unsaved changes flag
  };

  // Handle cover image upload (same as profile page avatar upload)
  const handleCoverImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = event.target.files;
      if (files) {
        // Set loading state based on image type
        setIsUploadingCoverImage(true);
        const response = await eventImagefileUploadApi(files?.[0] as File);
        if (response.success) {
          toast.success(response.message);
          setCoverImage(response.imageUrl);
          setHasUnsavedChanges(true); // Mark as having unsaved changes
        } else {
          toast.error(response.message);
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUploadingCoverImage(false);
    }

  };

  // Date picker handlers
  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setEventStartDate(startDate);
    setEventEndDate(endDate);
    setHasUnsavedChanges(true); // Mark as having unsaved changes
    // Keep the date picker open so user can adjust dates if needed
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

  const handleUpdateEvent = async () => {
    try {
      setIsSaving(true);
      calculateTotalRevenue(numberOfSeats, feesPerDelegate);
      const response = await updateEventApi(eventId || '', eventName, eventDescription, eventStartDate, eventEndDate, coverImage, locality_id, school_id, area_id, numberOfSeats, feesPerDelegate, totalRevenue, website, instagram);
      if (response.success) {
        // Show success message with notification info
        const notificationInfo = response.registeredUsersNotified > 0
          ? ` Notifications sent to ${response.registeredUsersNotified} registered users.`
          : '';
        toast.success(response.message + notificationInfo);
        setHasUnsavedChanges(false); // Reset unsaved changes flag after successful save

        // Update original values to current values after successful save
        setOriginalValues({
          eventName,
          eventDescription,
          eventStartDate,
          eventEndDate,
          school,
          locality,
          numberOfSeats,
          feesPerDelegate,
          website,
          instagram,
          coverImage
        });
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error('Failed to update event: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Unsaved changes modal handlers
  const handleKeepEditing = () => {
    setShowUnsavedChangesModal(false);
    setPendingNavigation(null);
  };

  const handleDiscardChanges = () => {
    // Reset all fields to their original values
    setEventName(originalValues.eventName);
    setEventDescription(originalValues.eventDescription);
    setEventStartDate(originalValues.eventStartDate);
    setEventEndDate(originalValues.eventEndDate);
    setSchool(originalValues.school);
    setLocality(originalValues.locality);
    setNumberOfSeats(originalValues.numberOfSeats);
    setFeesPerDelegate(originalValues.feesPerDelegate);
    setWebsite(originalValues.website);
    setInstagram(originalValues.instagram);
    setCoverImage(originalValues.coverImage);

    // Recalculate total revenue with original values
    calculateTotalRevenue(originalValues.numberOfSeats, originalValues.feesPerDelegate);

    // Reset editing states
    setEditingField(null);
    setTempValue('');
    setShowDatePicker(false);
    setHasUnsavedChanges(false);

    // Close modal and navigate
    setShowUnsavedChangesModal(false);
    if (pendingNavigation) {
      setActiveStep(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const steps = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'event-details', name: 'Event Details' },
    { id: 'leadership-roles', name: 'Leadership Roles' },
    { id: 'committees', name: 'Committees' },
    { id: 'agendas', name: 'Agendas' },
    { id: 'delegates', name: 'Delegates' },
    { id: 'general-documents', name: 'General Documents' }
  ];

  // Function to generate page title based on current section and sub-section
  const getPageTitle = () => {
    let committeeRole = "";
    switch (activeCommitteeType) {
      case "country":
        committeeRole = "Country Committees";
        break;
      case "role":
        committeeRole = "Role Committees";
        break;
      case "crisis":
        committeeRole = "Crisis Committees";
        break;
      default:
        committeeRole = "Open Committees";
        break;
    }
    const currentStep = steps.find(step => step.id === activeStep);
    if (activeStep === 'delegates' && activeSubSection) {
      return `Organiser > ${currentStep?.name} > ${activeSubSection} > ${committeeRole} > ${activeCommittee}`;
    }
    return `Organiser > ${currentStep?.name || 'Dashboard'}`;
  };


  // Leadership Roles component
  const renderLeadershipRoles = () => {
    return <LeadershipRolesPage />;
  };

  // Committees component
  const renderCommittees = () => {
    return <CommitteesPage />;
  };

  // Agenda component
  const renderAgenda = () => {
    return <AgendaPage />;
  };

  const renderDashboard = () => {
    return (
      <DashboardPage
        eventName={eventName}
        eventStartDate={eventStartDate}
        eventEndDate={eventEndDate}
        locality={locality}
        area={area}
        feesPerDelegate={feesPerDelegate}
        numberOfSeats={numberOfSeats}
        totalRevenue={totalRevenue}
        committees={committees}
        registrations={registrations}
      />
    );
  };

  const renderEventDetails = () => {
    return (
      <EventDetailsPage
        eventName={eventName}
        coverImage={coverImage}
        eventDescription={eventDescription}
        eventStartDate={eventStartDate}
        eventEndDate={eventEndDate}
        school={school}
        locality={locality}
        numberOfSeats={numberOfSeats}
        feesPerDelegate={feesPerDelegate}
        totalRevenue={totalRevenue}
        website={website}
        instagram={instagram}
        isUploadingCoverImage={isUploadingCoverImage}
        editingField={editingField}
        tempValue={tempValue}
        showDatePicker={showDatePicker}
        onFieldEdit={handleEditField}
        onFieldChange={handleFieldChange}
        onCancelEdit={handleCancelEdit}
        onCoverImageUpload={handleCoverImageUpload}
        onDateRangeChange={handleDateRangeChange}
        onDatePickerToggle={handleDatePickerToggle}
        onDatePickerClose={handleDatePickerClose}
        onUpdateEvent={handleUpdateEvent}
        isSaving={isSaving}
      />
    );
  };

  const renderStepContent = () => {
    let defaultStep = localStorage.getItem("activeStep")
    if (defaultStep) {
      return <DelegatesPage
        onSubSectionChange={setActiveSubSection}
        onActiveCommitteeChange={setActiveCommittee}
        onActiveCommitteeTypeChange={setActiveCommitteeType}
      />;
    }
    switch (activeStep) {
      case 'dashboard':
        return renderDashboard();
      case 'event-details':
        return renderEventDetails();
      case 'leadership-roles':
        return renderLeadershipRoles();
      case 'committees':
        return renderCommittees();
      case 'agendas':
        return renderAgenda();
      case 'delegates':
        return <DelegatesPage
          onSubSectionChange={setActiveSubSection}
          onActiveCommitteeChange={setActiveCommittee}
          onActiveCommitteeTypeChange={setActiveCommitteeType}
        />;
      case 'general-documents':
        return <GeneralDocumentsPage />;
      default:
        return renderDashboard();
    }
  };

  return (
    <PageLoader loadingText="Loading Organiser Dashboard...">
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <Header maxWidth="max-w-[88rem]" />

        {/* Main Content */}
        <div className="max-w-[85rem] mx-auto px-6 py-8" style={{ paddingLeft: '10.5rem' }}>
          {/* Page Title and Navigation */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-medium text-[#C2A46D] mb-6">
                {getPageTitle()}
              </h1>

              {/* Step Navigation */}
              <OrganiserNavigation
                steps={steps}
                activeStep={activeStep}
                onStepChange={handleStepChange}
              />
            </div>
          </div>

          {/* Step Content */}
          {renderStepContent()}
        </div>
      </div>

      {/* Unsaved Changes Modal */}
      <UnsavedChangesModal
        isOpen={showUnsavedChangesModal}
        onKeepEditing={handleKeepEditing}
        onDiscardChanges={handleDiscardChanges}
      />
    </PageLoader>
  );
};

export default OrganiserDashboard;
