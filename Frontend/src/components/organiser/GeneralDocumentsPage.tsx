import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import ConfirmationModal from '../ui/ConfirmationModal';
import { deleteGeneralDocumentApi, getGeneralDocumentsApi, saveGeneralDocumentApi, uploadGeneralDocumentApi } from '../../apis/general_documents';

interface DocumentItem {
    id: number;
    title: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    uploadedAt: string;
}

const GeneralDocumentsPage: React.FC = () => {
    const [generalDocuments, setGeneralDocuments] = useState<DocumentItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [showDocumentMenu, setShowDocumentMenu] = useState<number | null>(null);
    const [editingDocument, setEditingDocument] = useState<number | null>(null);
    const [tempValue, setTempValue] = useState<string>('');
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [showUploadForm, setShowUploadForm] = useState<boolean>(false);
    const [documentTitle, setDocumentTitle] = useState<string>('');
    const [documentUrl, setDocumentUrl] = useState<string>('');
    const { eventId } = useParams();
    // Refs for detecting clicks outside menus
    const documentMenuRef = useRef<HTMLDivElement>(null);

    // Confirmation modal state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

    // File input ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Mock data for demonstration - replace with actual API calls
    useEffect(() => {
        const loadDocuments = async () => {
            setIsLoading(true);
            try {
                const response = await getGeneralDocumentsApi(eventId as string);
                if (response.success) {
                    const documentsData = response.data?.data || [];
                    setGeneralDocuments(documentsData);
                }
            } catch (error) {
                console.log('Error loading documents:', error);
                toast.error('Failed to load documents');
            } finally {
                setIsLoading(false);
            }
        };

        loadDocuments();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (documentMenuRef.current && !documentMenuRef.current.contains(event.target as Node)) {
                setShowDocumentMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = event.target.files?.[0];
            if (!file) return;

            const response = await uploadGeneralDocumentApi(eventId as string, file);
            if (response.success) {
                toast.success('Document uploaded successfully');
                setDocumentUrl(response.documentUrl);
                setDocumentTitle(file.name);
            } else {
                toast.error('Failed to upload document');
            }
        } catch (error) {
            console.log('Error uploading document:', error);
            toast.error('Failed to upload document');
        }
    };

    const saveGeneralDocumentHandler = async () => {
        if (isUploading) return; // Prevent double clicks

        if (!documentTitle.trim()) {
            toast.error('Please enter a document title');
            return;
        }

        setIsUploading(true);
        try {
            const response = await saveGeneralDocumentApi(eventId as string, 'general', documentTitle, documentUrl);
            if (response.success) {
                toast.success('Document saved successfully');
                const documentsResponse = await getGeneralDocumentsApi(eventId as string);
                if (documentsResponse.success) {
                    const documentsData = documentsResponse.data?.data || [];
                    setGeneralDocuments(documentsData);
                }
                setDocumentUrl('');
                setDocumentTitle('');
            } else {
                toast.error('Failed to save document');
            }
            // Simulate file upload - replace with actual API call
        } catch (error) {
            console.log('Error saving document:', error);
            toast.error('Failed to save document');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveEdit = async () => {
        if (!tempValue.trim()) {
            toast.error('Document title cannot be empty');
            return;
        }

        setIsSaving(true);
        try {
            // Simulate API call - replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            setGeneralDocuments(prev =>
                prev.map(doc =>
                    doc.id === editingDocument
                        ? { ...doc, title: tempValue.trim() }
                        : doc
                )
            );

            setEditingDocument(null);
            setTempValue('');
            toast.success('Document updated successfully');
        } catch (error) {
            console.log('Error updating document:', error);
            toast.error('Failed to update document');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingDocument(null);
        setTempValue('');
    };

    const handleDeleteGeneralDocument = (documentId: string) => {
        setShowDeleteConfirm(true);
        setDocumentToDelete(documentId);
        setShowDeleteConfirm(true);
        setShowDocumentMenu(null);
    };

    const confirmDelete = async () => {
        if (!documentToDelete) return;
        try {
            const response = await deleteGeneralDocumentApi(documentToDelete.toString());
            if (response.success) {
                toast.success('Document deleted successfully');
                const documentsResponse = await getGeneralDocumentsApi(eventId as string);
                if (documentsResponse.success) {
                    const documentsData = documentsResponse.data?.data || [];
                    setGeneralDocuments(documentsData);
                }
            } else {
                toast.error('Failed to delete document');
            }

            setGeneralDocuments(prev => prev.filter(doc => doc.id.toString() !== documentToDelete));
        } catch (error) {
            console.log('Error deleting document:', error);
            toast.error('Failed to delete document');
        } finally {
            setShowDeleteConfirm(false);
            setDocumentToDelete(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#395579]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* Documents List */}
            <div className="space-y-4 w-full max-w-[500px]">
                {generalDocuments.length === 0 ? (
                    // Empty State
                    <div className="text-red-500 font-medium text-[20px]">None</div>
                ) : (
                    generalDocuments.map((document) => (
                        <div key={document.id} className="rounded-[16px] p-4 border border-gray-500 ">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    {editingDocument === document.id ? (
                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="text"
                                                value={tempValue}
                                                onChange={(e) => setTempValue(e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                                                autoFocus
                                            />
                                            <button
                                                onClick={handleSaveEdit}
                                                disabled={isSaving}
                                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                                            >
                                                {isSaving ? 'Saving...' : 'Save'}
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                disabled={isSaving}
                                                className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-3">
                                            <span className="text-gray-900 font-medium">{document.title}</span>
                                        </div>
                                    )}
                                </div>

                                {editingDocument !== document.id && (
                                    <div className="relative" ref={documentMenuRef}>
                                        <button
                                            onClick={() => setShowDocumentMenu(showDocumentMenu === document.id ? null : document.id)}
                                            className="p-2 hover:bg-gray-100 rounded-md transition-colors duration-200"
                                        >
                                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                            </svg>
                                        </button>

                                        {showDocumentMenu === document.id && (
                                            <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                                                <button
                                                    onClick={() => handleDeleteGeneralDocument(document.id.toString())}
                                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Upload Section */}
            <div className="w-full max-w-[400px]">
                {!showUploadForm ? (
                    <button
                        onClick={() => setShowUploadForm(true)}
                        className={`text-white font-medium transition-colors hover:opacity-90`}
                        style={{
                            width: '200px',
                            height: '44px',
                            borderRadius: '30px',
                            gap: '10px',
                            background: '#C2A46D',
                            cursor: 'pointer',
                            border: 'none',
                            boxShadow: 'none',
                        }}
                    >
                        Upload Document
                    </button>
                ) : (
                    <div className="space-y-4">
                        {/* Input field with upload button side by side */}
                        <div className="flex items-center space-x-3">
                            <input
                                type="text"
                                placeholder="Add document title"
                                disabled
                                value={documentTitle}
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E395D] focus:border-transparent"
                            />
                            <label
                                className={`flex items-center justify-center w-12 h-12 border border-gray-300 rounded-lg transition-colors duration-200 ${isUploading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-white cursor-pointer hover:bg-gray-50'
                                    }`}
                            >
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleFileUpload}
                                    disabled={isUploading}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={saveGeneralDocumentHandler}
                                disabled={isUploading}
                                className={`text-white font-medium transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                                    }`}
                                style={{
                                    height: '44px',
                                    borderRadius: '30px',
                                    paddingLeft: '20px',
                                    paddingRight: '20px',
                                    background: isUploading ? '#bdbdbd' : '#C2A46D',
                                    cursor: isUploading ? 'not-allowed' : 'pointer',
                                    border: 'none',
                                    boxShadow: 'none',
                                }}
                            >
                                {isUploading ? 'Uploading...' : 'Save Document'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowUploadForm(false);
                                    setDocumentTitle('');
                                    setDocumentUrl('');
                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = '';
                                    }
                                }}
                                className="text-white font-medium transition-colors hover:opacity-90"
                                style={{
                                    height: '44px',
                                    borderRadius: '30px',
                                    paddingLeft: '20px',
                                    paddingRight: '20px',
                                    background: '#84B5F3',
                                    cursor: 'pointer',
                                    border: 'none',
                                    boxShadow: 'none',
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title="Delete Document"
                message="Are you sure you want to delete this document? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                confirmButtonColor="text-red-600"
            />
        </div>
    );
};

export default GeneralDocumentsPage;
