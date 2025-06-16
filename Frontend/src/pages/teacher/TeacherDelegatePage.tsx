import React, { useState, useEffect } from 'react';
import { Header, Avatar } from '../../components/ui';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventByIdApi } from '../../apis/Events';
import { toast } from 'sonner';
import DownloadIcon from '../../assets/download_icon.svg';
import PageLoader from '../../components/PageLoader';
import { getRegistrationInfoByEventIdAndUserIdApi, deleteRegistrationByEventIdAndUserIdApi } from '../../apis/Registerations';
import { getLeadershipRolesByEventIdApi } from '../../apis/Event_leaders';
import { getDocumentsByEventId } from '../../apis/general_documents';

const TeacherDelegatePage: React.FC = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('Event Info');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [locality, setLocality] = useState('');
  const [feesPerDelegate, setFeesPerDelegate] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [coverImage, setCoverImage] = useState('');

  const [participationInfoGeneralDocuments, setParticipationInfoGeneralDocuments] = useState<any[]>([]);
  const [participationInfoCommitteDocuments, setParticipationInfoCommitteDocuments] = useState<any[]>([]);
  const [leadershipRoles, setLeadershipRoles] = useState<any[]>([]);

  const [registrationInfoId, setRegistrationInfoId] = useState<any>('');
  const [registrationInfoRegistrationNo, setRegistrationInfoRegistrationNo] = useState<any>('');
  const [registrationInfoUsername, setRegistrationInfoUsername] = useState<any>('');
  const [registrationInfoName, setRegistrationInfoName] = useState<any>('');
  const [registrationInfoDateOfBirth, setRegistrationInfoDateOfBirth] = useState<any>('');
  const [registrationInfoGender, setRegistrationInfoGender] = useState<any>('');
  const [registrationInfoSchoolName, setRegistrationInfoSchoolName] = useState<any>('');
  const [registrationInfoLocalityOfSchool, setRegistrationInfoLocalityOfSchool] = useState<any>('');
  const [registrationInfoYearOfWorkingExperience, setRegistrationInfoYearOfWorkingExperience] = useState<any>('');
  const [registrationInfoEmail, setRegistrationInfoEmail] = useState<any>('');
  const [registrationInfoMobileNumber, setRegistrationInfoMobileNumber] = useState<any>('');
  const [registrationInfoMunExperience, setRegistrationInfoMunExperience] = useState<any>('');
  const [registrationInfoFoodPreference, setRegistrationInfoFoodPreference] = useState<any>('');
  const [registrationInfoFoodAllergies, setRegistrationInfoFoodAllergies] = useState<any>('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const tabs = ['Event Info', 'Support Contact', 'Participation Info', 'Registration Info'];

  useEffect(() => {
    const getRegistrationInfo = async () => {
      try {
        const response = await getRegistrationInfoByEventIdAndUserIdApi(eventId as string);
        const payload = Array.isArray(response?.data) ? response.data[0] : response?.data;
        console.log("getRegistrationInfoByEventIdAndUserIdApi", response.data);

        const user = payload.user || payload.users || {};
        const school = user.school || {};
        const schoolLocality = school.locality || {};
        setRegistrationInfoId(user.id ?? '');
        setRegistrationInfoRegistrationNo(payload.registration_no ?? '');
        setRegistrationInfoUsername(user.username ?? '');
        setRegistrationInfoName(user.fullname ?? user.name ?? '');
        setRegistrationInfoDateOfBirth(user.birthday ?? '');
        setRegistrationInfoGender(user.gender ?? '');
        setRegistrationInfoSchoolName(school.name ?? '');
        setRegistrationInfoLocalityOfSchool(schoolLocality.name ?? '');
        setRegistrationInfoYearOfWorkingExperience(user.years_of_experience ?? '');
        setRegistrationInfoEmail(user.email ?? '');
        setRegistrationInfoMobileNumber(user.phone_e164 ?? user.phone_number ?? '');
        setRegistrationInfoMunExperience(payload.mun_experience ?? '');
        setRegistrationInfoFoodPreference(payload.food_pref ?? '');
        setRegistrationInfoFoodAllergies(payload.food_allergies ?? '');
      } catch (error: any) {
        toast.error('Failed to get registration info: ' + error.message);
      }
    };

    const getEventById = async () => {
      try {
        const response = await getEventByIdApi(eventId || '');
        console.log("getEventByIdApi", response.data);
        if (response.success) {
          setName(response.data[0].name);
          setDescription(response.data[0].description);
          setStartDate(response.data[0].start_date);
          setEndDate(response.data[0].end_date);
          setLocality(response.data[0].locality.name);
          setFeesPerDelegate(response.data[0].fees_per_delegate);
          setWebsite(response.data[0].website);
          setInstagram(response.data[0].instagram);
          setCoverImage(response.data[0].cover_image);

        } else {
          toast.error('Failed to get event by id: ' + response.message);
        }
      } catch (error: any) {
        toast.error('Failed to get event by id: ' + error.message);
      }
    };

    const getEvnetLeaderShipRoles = async () => {
      try {
        const response = await getLeadershipRolesByEventIdApi(eventId || '');
        console.log("getLeadershipRolesByEventIdApi", response.data);
        if (response.success) {
          setLeadershipRoles(response.data);
        }
      } catch (error: any) {
        toast.error('Failed to get event leader ship roles: ' + error.message);
      }
    };

    const getDocumentsById = async () => {
      try {
        const response = await getDocumentsByEventId(eventId as string);
        console.log("getDocumentsByEventId", response.data);
        if (response.success) {
          const generalDocuments = response.data.filter((doc: any) => doc.doc_type === "general");
          const committeeDocuments = response.data.filter((doc: any) => doc.doc_type !== "general");
          setParticipationInfoGeneralDocuments(generalDocuments);
          setParticipationInfoCommitteDocuments(committeeDocuments);
        }
        else {
          toast.error('Failed to get documents by id: ' + response.message);
        }
      }
      catch (error: any) {
        toast.error('Failed to get documents by id: ' + error.message);
      }
    }

    getEventById();
    getDocumentsById();
    getEvnetLeaderShipRoles();
    getRegistrationInfo();
  }, [eventId]);

  const renderEventInfo = () => (
    <div className="space-y-6">
      <div className="w-[400px]">
        <img
          src={coverImage}
          alt="Event"
          className="w-[400px] h-64 object-cover rounded-lg"
        />
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-base font-bold text-gray-700 mb-2">
            Event Name
          </label>
          <input
            type="text"
            value={name}
            readOnly
            className="w-[400px] px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700"
          />
        </div>

        <div>
          <label className="block text-base font-bold text-gray-700 mb-2">
            Event Description
          </label>
          <textarea
            value={description}
            readOnly
            rows={6}
            className="w-[400px] px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700 resize-none"
          />
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-base font-bold text-gray-700 mb-2">
            Date
          </label>
          <input
            type="text"
            value={startDate + ' - ' + endDate}
            readOnly
            className="w-[400px] px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700"
          />
        </div>

        <div>
          <label className="block text-base font-bold text-gray-700 mb-2">
            Locality
          </label>
          <input
            type="text"
            value={locality}
            readOnly
            className="w-[400px] px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700"
          />
        </div>

        <div>
          <label className="block text-base font-bold text-gray-700 mb-2">
            Fees
          </label>
          <input
            type="text"
            value={feesPerDelegate}
            readOnly
            className="w-[400px] px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700"
          />
        </div>

        <div>
          <label className="block text-base font-bold text-gray-700 mb-2">
            Website
          </label>
          <input
            type="text"
            value={website}
            readOnly
            className="w-[400px] px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700"
          />
        </div>

        <div>
          <label className="block text-base font-bold text-gray-700 mb-2">
            Instagram
          </label>
          <input
            type="text"
            value={instagram}
            readOnly
            className="w-[400px] px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700"
          />
        </div>
      </div>
    </div>
  );

  const renderSupportContact = () => (
    <div className="space-y-6">
      <div >
        {/* Table Headers */}
        <div className="flex gap-4 mb-4 ">
          <div className="bg-[#E3F2FD] rounded-lg text-center border border-gray-800" style={{ width: '80px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="text-sm font-medium text-[#1976D2]">ABBR</span>
          </div>
          <div className="bg-[#E3F2FD] rounded-lg text-center border border-gray-800" style={{ width: '200px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="text-sm font-medium text-[#1976D2]">Role</span>
          </div>
          <div className="bg-[#E3F2FD] rounded-lg text-center border border-gray-800" style={{ width: '140px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="text-sm font-medium text-[#1976D2]">Username</span>
          </div>
          <div className="bg-[#E3F2FD] rounded-lg text-center border border-gray-800" style={{ width: '200px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="text-sm font-medium text-[#1976D2]">Name</span>
          </div>
          <div className="bg-[#E3F2FD] rounded-lg text-center border border-gray-800" style={{ width: '120px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="text-sm font-medium text-[#1976D2]">Mobile</span>
          </div>
          <div className="bg-[#E3F2FD] rounded-lg text-center border border-gray-800" style={{ width: '220px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="text-sm font-medium text-[#1976D2]">Email</span>
          </div>
        </div>

        {/* Contact Data Rows */}
        {leadershipRoles.map((role, index) => (
          <div className="flex gap-4 mb-3" key={index}>
            <div className="bg-white border border-gray-200 flex justify-center items-center rounded-lg text-center" style={{ width: '80px', height: '60px' }}>
              <span className="text-sm text-gray-900">{role.leadership_roles.abbr}</span>
            </div>
            <div className="bg-white border border-gray-200 flex justify-center items-center rounded-lg text-center" style={{ width: '150px', height: '60px' }}>
              <span className="text-sm text-gray-900">{role.leadership_roles.leadership_role}</span>
            </div>
            <div className="bg-white border border-gray-200 flex justify-center items-center rounded-lg text-center" style={{ width: '100px', height: '60px' }}>
              <span className="text-sm text-gray-900">{role.users.username}</span>
            </div>
            <div className="bg-white border border-gray-200 flex justify-center items-center rounded-lg text-center" style={{ width: '200px', height: '60px' }}>
              <span className="text-sm text-gray-900">{role.users.fullname}</span>
            </div>
            <div className="bg-white border border-gray-200 flex justify-center items-center rounded-lg text-center" style={{ width: '170px', height: '60px' }}>
              <span className="text-sm text-gray-900">{role.users.phone_e164}</span>
            </div>
            <div className="bg-white border border-gray-200 flex justify-center items-center rounded-lg text-center" style={{ width: '260px', height: '60px' }}>
              <span className="text-sm text-gray-900">{role.users.email}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderParticipationInfo = () => (
    <div className="space-y-8">
      {/* Committee Section */}
      <div className="flex items-center gap-6">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Committee</h3>
          <input
            type="text"
            value={""}
            readOnly
            className="w-[400px] px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700"
          />
        </div>
      </div>

      {/* Country Section */}
      <div className="flex items-center gap-6">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Country</h3>
          <input
            type="text"
            value={""}
            readOnly
            className="w-[400px] px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700"
          />
        </div>
      </div>

      {/* Documents Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-900">Documents</h3>

        {/* General Documents Sub-section */}
        <div className="flex items-start gap-6">
          <div className="flex-1">
            <h4 className="text-base font-semibold text-gray-800 mb-3">General</h4>
            <div className="space-y-3">
              {participationInfoGeneralDocuments.map((doc, index) => (
                <div key={index} className="w-[400px] w-[400px] flex items-center justify-between bg-white border border-gray-300 rounded-lg px-4 py-3">
                  <span className="text-sm text-gray-900">{doc.title}</span>
                  <button
                    onClick={() => window.open(doc.file_url, '_blank')}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <img src={DownloadIcon} alt="Download" className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Committee Related Documents Sub-section */}
        <div className="flex items-start gap-6">
          <div className="flex-1">
            <h4 className="text-base font-semibold text-gray-800 mb-3">Committee Related</h4>
            <div className="space-y-3">
              {participationInfoCommitteDocuments.map((doc, index) => (
                <div key={index} className="w-[400px] flex items-center justify-between bg-white border border-gray-300 rounded-lg px-4 py-3">
                  <span className="text-sm text-gray-900">{doc.title}</span>
                  <button
                    onClick={() => window.open(doc.file_url, '_blank')}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <img src={DownloadIcon} alt="Download" className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRegistrationInfo = () => (
    <div className="flex gap-8">
      {/* Left Column - Registration Form */}
      <div className="flex-1 space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-4 mb-8">
          <div style={{ width: '160px', height: '160px' }}>
            <Avatar
              size="large"
              className="w-[160px] h-[160px]"
            />
          </div>
        </div>

        {/* Registration Form */}
        <div className="w-[400px] gap-6" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {/* Registration No. */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Registration No.</label>
            <input
              type="text"
              value={registrationInfoRegistrationNo}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={registrationInfoUsername}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={registrationInfoName}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Date of Birth</label>
            <input
              type="text"
              value={registrationInfoDateOfBirth}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Gender</label>
            <input
              type="text"
              value={registrationInfoGender}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700"
            />
          </div>

          {/* School Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">School Name</label>
            <input
              type="text"
              value={registrationInfoSchoolName}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700"
            />
          </div>

          {/* Locality of School */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Locality of School</label>
            <input
              type="text"
              value={registrationInfoLocalityOfSchool}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700"
            />
          </div>

          {/* Year of Working Experience */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Year of Working Experience</label>
            <input
              type="text"
              value={registrationInfoYearOfWorkingExperience}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
            <input
              type="text"
              value={registrationInfoEmail}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700"
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Mobile Number</label>
            <input
              type="text"
              value={registrationInfoMobileNumber}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700"
            />
          </div>

          {/* MUN Experience in Years */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">MUN Experience in Years</label>
            <input
              type="text"
              value={registrationInfoMunExperience}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700"
            />
          </div>


          {/* Food Preference */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Food Preference</label>
            <div className="flex gap-3">
              <button
                className={`px-6 py-3 rounded-full text-sm font-medium transition-colors ${registrationInfoFoodPreference === 'Vegetarian'
                  ? 'bg-[#D9C7A1] text-gray-900'
                  : 'bg-white text-gray-600 border border-gray-300'
                  }`}
              >
                Vegetarian
              </button>
              <button
                className={`px-6 py-3 rounded-full text-sm font-medium transition-colors ${registrationInfoFoodPreference === 'Non-Vegetarian'
                  ? 'bg-[#D9C7A1] text-gray-900'
                  : 'bg-white text-gray-600 border border-gray-300'
                  }`}
              >
                Non-Vegetarian
              </button>
            </div>
          </div>

          {/* Food Allergies */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Food Allergies</label>
            <input
              type="text"
              value={registrationInfoFoodAllergies}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700"
            />
          </div>
        </div>

        {/* Cancel Registration Button */}
        <div className="mt-8 relative">
          <button
            onClick={() => setShowCancelDialog(!showCancelDialog)}
            className="bg-[#D9C7A1] text-gray-900 px-6 py-3 rounded-full font-medium hover:bg-[#C5B595] transition-colors"
          >
            Cancel Registration
          </button>

          {showCancelDialog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowCancelDialog(false)}></div>
              <div className="relative bg-white border border-gray-800 rounded-lg p-6 shadow-xl w-[320px]">
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900">Confirm Cancel</h4>
                </div>
                <div className="flex items-center justify-end gap-4">
                  <button
                    onClick={async () => {
                      try {
                        const resp = await deleteRegistrationByEventIdAndUserIdApi(registrationInfoId);
                        if (resp?.success) {
                          toast.success('Registration cancelled successfully');
                          navigate('/home');
                        } else {
                          toast.error(resp?.message || 'Failed to cancel registration');
                        }
                      } catch (err: any) {
                        toast.error(err?.message || 'Failed to cancel registration');
                      } finally {
                        setShowCancelDialog(false);
                      }
                    }}
                    className="text-red-600 font-medium hover:text-red-800 transition-colors"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowCancelDialog(false)}
                    className="text-gray-900 font-medium hover:text-gray-700 transition-colors"
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (currentStep) {
      case 'Event Info':
        return renderEventInfo();
      case 'Support Contact':
        return renderSupportContact();
      case 'Participation Info':
        return renderParticipationInfo();
      case 'Registration Info':
        return renderRegistrationInfo();
      default:
        return renderEventInfo();
    }
  };

  return (
    <PageLoader loadingText="Loading Delegate Page...">
      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="max-w-[80rem] px-6 py-8 flex flex-col items-left" style={{ marginLeft: '13rem' }}>
          <div className="flex items-center space-x-2 mb-8">
            {tabs.map((tab, index) => (
              <React.Fragment key={tab}>
                <button
                  className={`flex items-center border border-gray-800 justify-center w-[200px] h-[58px] p-[5px] rounded-[20px] text-sm font-medium transition-all ${currentStep === tab
                    ? 'bg-[#1E395D] text-white'
                    : 'bg-white text-gray-600 border border-gray-300'
                    }`}
                  onClick={() => setCurrentStep(tab)}
                >
                  {tab}
                </button>
                {index < tabs.length - 1 && (
                  <span className="mx-3 text-gray-600 text-sm">&gt;</span>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="">
            <div >
              {renderTabContent()}
            </div>
          </div>
        </div>

      </div>
    </PageLoader>
  );
};

export default TeacherDelegatePage;
