import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, LoadingSpinner } from '../components/ui';
import { edviceDocsfileUploadApi, requestApprovalApi } from '../apis/Organisers';
import { getUserByIdApi } from '../apis/Users';
import { toast } from 'sonner';
import PageLoader from '../components/PageLoader';

const RequestApproval: React.FC = () => {
  const navigate = useNavigate();
  const [school, setSchool] = useState('');
  const [locality, setLocality] = useState('');
  const [school_id, setSchool_id] = useState('');
  const [locality_id, setLocality_id] = useState('');
  const [role, setRole] = useState('');
  const [evidenceDocs, setEvidenceDocs] = useState('');

  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingDocs, setIsUploadingDocs] = useState(false);

  useEffect(() => {
    async function getUserById() {
      const user = await getUserByIdApi();
      setSchool(user.data?.school?.name || '');
      setLocality(user.data?.school?.code || '');
      setLocality_id(user.data?.school?.locality_id || '');
      setSchool_id(user.data?.school?.id || '');
      }
    getUserById();
  }, []);



  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = event.target.files;
      if (files) {
        setIsUploadingDocs(true);
        const newFiles = Array.from(files).map(file => file.name);
        const response = await edviceDocsfileUploadApi(files[0] as File);
        if (response.success) {
          toast.success(response.message);
          setUploadedFiles(prev => [...prev, ...newFiles]);
          setEvidenceDocs(response.documentUrl);
        } else {
          toast.error(response.message);
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUploadingDocs(false);
    }
  }

  const handleRemoveFile = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(file => file !== fileName));
  };

  const requestApprovalHandler = async () => {
    if (!role.trim()) {
      toast.error('Please enter your role in event or in school');
      return;
    }

    if (!evidenceDocs.trim()) {
      toast.error('Please upload evidence documents');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await requestApprovalApi(school_id, locality_id, role, evidenceDocs);
      if (response.success) {
        toast.success(response.message);
        navigate('/request-under-verification');
      } else {
        toast.error(response.message);
        setIsSubmitting(false);
      }
    } catch (error: any) {
      toast.error(error.message);
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLoader loadingText="Loading Request Approval...">
      <div className="min-h-screen bg-white">
        <Header />

        <div className="max-w-[62rem] mx-auto px-6 py-12">
          <h1 className="font-bold text-[#C2A46D] mb-8 text-left" style={{ fontSize: '40px' }}>
            Request for Approval
          </h1>

          <div className="mb-8">
            <h2 className="font-bold text-black mb-6" style={{ fontSize: '30px' }}>Organiser Info</h2>

            <div className="space-y-6">
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
                  disabled
                  value={school}
                  className="w-[400px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#607DA3] focus:border-transparent"
                  placeholder="Enter school name"
                />
              </div>

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
                  disabled
                  value={locality}
                  className="w-[400px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#607DA3] focus:border-transparent"
                  placeholder="Enter locality"
                />
              </div>

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
                  Role in Event or in School
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-[400px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#607DA3] focus:border-transparent"
                  placeholder="Enter your role"
                />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="mb-6">
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
                Evidence
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="E.g. Letter from School or / and ID"
                  className="w-[350px] px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#607DA3] focus:border-transparent"
                  readOnly
                />
                <label className={`px-4 py-3 rounded-r-lg transition-colors duration-200 ${isUploadingDocs
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#607DA3] text-white cursor-pointer hover:bg-[#1a2f4a]'
                  }`}
                  style={{ height: "50px", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {isUploadingDocs ? (
                    <LoadingSpinner size="small" text="" />
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  )}
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    disabled={isUploadingDocs}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label
                className="block mb-2"
                style={{
                  color: 'grey',
                  fontSize: '12px',
                  fontStyle: 'normal',
                  fontWeight: 700,
                  lineHeight: '150%',
                }}
              >
                Uploaded Files
              </label>
              <div className="space-y-2">
                {uploadedFiles.map((fileName, index) => (
                  <div key={index} className="w-[400px] flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg">
                    <span className="text-sm text-gray-700">{fileName}</span>
                    <button
                      onClick={() => handleRemoveFile(fileName)}
                      className="text-red-500 hover:text-red-700 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-left">
            <button
              onClick={requestApprovalHandler}
              disabled={isSubmitting}
              style={{
                display: 'flex',
                width: '120px',
                padding: '10px',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                borderRadius: '30px',
                backgroundColor: '#D9C7A1',
                color: 'white',
                fontWeight: 500,
                transition: 'background-color 0.2s',
                opacity: isSubmitting ? 0.5 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
              onMouseOver={e => (e.currentTarget.style.background = '#B8945F')}
              onMouseOut={e => (e.currentTarget.style.background = '#C2A46D')}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </PageLoader>
  );
};

export default RequestApproval;
