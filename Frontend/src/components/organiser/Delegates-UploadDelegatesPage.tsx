import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Header } from '../ui';
import PageLoader from '../PageLoader';
import { uploadDelegatesApi } from '../../apis/Registerations';
import { useParams, useNavigate } from 'react-router-dom';

interface UploadResult {
    linked: number;
    created: number;
    needsReview: number;
    errors: string[];
}



const DelegatesUploadPage: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadGoogleSheets = () => {
        // Trigger file input for Google Sheets
        if (fileInputRef.current) {
            fileInputRef.current.accept = '.csv,.xlsx,.xls';
            fileInputRef.current.click();
        }
    };

    const handleUploadGoogleForm = () => {
        // Trigger file input for Google Form data
        if (fileInputRef.current) {
            fileInputRef.current.accept = '.csv,.xlsx,.xls';
            fileInputRef.current.click();
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        console.log('File selected:', file.name, 'Type:', file.type, 'Size:', file.size);
        
        setIsUploading(true);
        setUploadResult(null);

        try {
            console.log('Starting delegate upload to backend...');
            
            if (!eventId) {
                toast.error('Event ID is missing');
                return;
            }
            
            // Call the backend API to upload and process the file
            const response = await uploadDelegatesApi(file, eventId);
            console.log('Upload response:', response);
            
            if (response.success && response.data) {
                const result: UploadResult = {
                    linked: response.data.linked || 0,
                    created: response.data.created || 0,
                    needsReview: response.data.needsReview || 0,
                    errors: response.data.errors || []
                };
                
                setUploadResult(result);
                
                if (result.errors.length === 0) {
                    toast.success(`Upload completed! Linked: ${result.linked}, Created: ${result.created}, Needs Review: ${result.needsReview}`);
                    navigate(`/event-dashboard/${eventId}`)
                } else {
                    toast.error(`Upload completed with ${result.errors.length} errors. Check details below.`);
                }
            } else {
                throw new Error(response.message || 'Failed to process upload');
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(error.message || 'Failed to process upload. Please check file format and try again.');
        } finally {
            setIsUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <PageLoader loadingText="Loading Upload Delegates...">
            <div className="min-h-screen bg-gray-50">
                {/* Header Section */}
                <Header maxWidth="max-w-[88rem]" />

                {/* Main Content */}
                <div className="max-w-[85rem] mx-auto px-6 py-8" style={{ paddingLeft: '10.5rem' }}>
                    {/* Breadcrumb Navigation */}
                    <div className="flex items-center space-x-2 text-sm text-[#C2A46D] mb-6">
                        <span className='text-2xl font-medium text-[#C2A46D]'>Organiser</span>
                        <span className='text-2xl font-medium text-[#C2A46D]'>&gt;</span>
                        <span className='text-2xl font-medium text-[#C2A46D]'>Delegates</span>
                        <span className='text-2xl font-medium text-[#C2A46D]'>&gt;</span>
                        <span className='text-2xl font-medium text-[#C2A46D]'>Key Info</span>
                        <span className='text-2xl font-medium text-[#C2A46D]'>&gt;</span>
                        <span className="text-2xl font-medium text-[#C2A46D]">Upload Delegates</span>
                    </div>

                    {/* Main Title */}
                    <h1 className="text-2xl font-bold text-gray-900 mb-8">Upload Delegates</h1>

                    {/* Upload Buttons */}
                    <div className="flex items-center space-x-4 mb-8">
                        <button
                            onClick={handleUploadGoogleSheets}
                            disabled={isUploading}
                            className="bg-[#C2A46D] w-[170px] text-white px-6 py-3 rounded-lg hover:opacity-90 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div> 
                                <div>Upload</div>
                                <div>Google Sheets</div>
                            </div>
                        </button>
                        <button
                            onClick={handleUploadGoogleForm}
                            disabled={isUploading}
                            className="bg-[#C2A46D] w-[170px] text-white px-6 py-3 rounded-lg hover:opacity-90 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        > 
                            <div> 
                                <div>Upload</div>
                                <div>Google Form</div>
                            </div>
                        </button>
                    </div>

                    {/* Upload Progress */}
                    {isUploading && (
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#C2A46D] mr-3"></div>
                                <span className="text-gray-700">Processing delegate upload...</span>
                            </div>
                        </div>
                    )}

                    {/* Upload Results */}
                    {uploadResult && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Results</h2>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">{uploadResult.linked}</div>
                                    <div className="text-sm text-green-700">Linked to Existing</div>
                                </div>
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">{uploadResult.created}</div>
                                    <div className="text-sm text-blue-700">New Users Created</div>
                                </div>
                                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                    <div className="text-2xl font-bold text-yellow-600">{uploadResult.needsReview}</div>
                                    <div className="text-sm text-yellow-700">Needs Review</div>
                                </div>
                            </div>
                            
                            {uploadResult.errors.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="text-lg font-semibold text-red-600 mb-2">Errors:</h3>
                                    <ul className="list-disc list-inside text-sm text-red-600">
                                        {uploadResult.errors.map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* File Input (Hidden) */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                    />
                </div>
            </div>
        </PageLoader>
    );
};

export default DelegatesUploadPage;
