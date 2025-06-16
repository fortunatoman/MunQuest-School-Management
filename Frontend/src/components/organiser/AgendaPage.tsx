import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getAllEventCommitteesApi } from '../../apis/Event_committes';
import { toast } from 'sonner';
import {
  saveEventCommitteesByEventIdAgendaApi, getEventCommitteesByEventIdAgendaApi, updateEventCommitteesAgendaByIdApi,
  deleteEventCommitteesAgendaByIdApi, uploadAgendaDocumentApi, getAgendaDocumentsApi, saveEventCommitteeDocumentApi, deleteEventCommitteeDocumentApi
} from '../../apis/agendas';
import ConfirmationModal from '../ui/ConfirmationModal';

interface AgendaItem {
  id: number;
  title: string;
}

interface DocumentItem {
  id: number;
  title: string;
}

const AgendaPage: React.FC = () => {
  const [showAgendaMenu, setShowAgendaMenu] = useState<number | null>(null);
  const [showDocumentMenu, setShowDocumentMenu] = useState<number | null>(null);
  const [allCommitteesData, setAllCommitteesData] = useState<any[]>([]);
  const [filteredCommittees, setFilteredCommittees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [subTabLoading, setSubTabLoading] = useState<boolean>(false);

  // Internal state management for agendas and documents
  const [activeCommitteeType, setActiveCommitteeType] = useState('country');
  const [activeCommittee, setActiveCommittee] = useState('');
  const [allAgendas, setAllAgendas] = useState<any[]>([]); 
  const [filteredAgendas, setFilteredAgendas] = useState<AgendaItem[]>([]); 
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [editingAgenda, setEditingAgenda] = useState<number | null>(null);
  const [editingDocument, setEditingDocument] = useState<number | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isUploadingFile, setIsUploadingFile] = useState<boolean>(false); // For file upload (cloud button)
  const [isSavingDocument, setIsSavingDocument] = useState<boolean>(false); // For document save (Upload Document button)
  const [documentUrl, setDocumentUrl] = useState<string>('');
  const [documentName, setDocumentName] = useState<string>('');
  // Refs for detecting clicks outside menus
  const agendaMenuRef = useRef<HTMLDivElement>(null);
  const documentMenuRef = useRef<HTMLDivElement>(null);

  // Confirmation modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [agendaToDelete, setAgendaToDelete] = useState<number | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);

  const { eventId } = useParams();

  const committeeTypes = [
    { id: 'country', name: 'Country Committees' },
    { id: 'role', name: 'Role Committees' },
    { id: 'crisis', name: 'Crisis Committees' },
    { id: 'open', name: 'Open Committees' }
  ];

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (agendaMenuRef.current && !agendaMenuRef.current.contains(event.target as Node)) {
        setShowAgendaMenu(null);
      }
      if (documentMenuRef.current && !documentMenuRef.current.contains(event.target as Node)) {
        setShowDocumentMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch event committees data and initial agendas
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!eventId) return;

      try {
        setIsLoading(true);
        
        // Fetch committees
        const response = await getAllEventCommitteesApi(eventId);
        const raw = response.data || [];

        const normalized = raw.map((item: any) => {
          const master = item && typeof item.committee === 'object' ? item.committee : null;
          const committeeText = master
            ? (master.committee ?? master.name ?? '')
            : (typeof item.committee === 'string' ? item.committee : '');
          const abbreviation = master ? (master.abbr ?? item.abbr ?? '') : (item.abbr ?? '');
          const masterId = master ? master.id : (item.committee_id ?? item.committeeId ?? undefined);
          const category = master ? master.category : item.category;

          return {
            id: String(item.id),
            committee: committeeText,
            abbr: abbreviation,
            committeeId: masterId,
            seatsTotal: String(item.seats ?? item.seatsTotal ?? ''),
            chairUsername: item.chair_username ?? '',
            chairName: item.chair_name ?? '',
            deputyChair1Username: item.deputy_chair_1_username ?? '',
            deputyChair1Name: item.deputy_chair_1_name ?? '',
            deputyChair2Username: item.deputy_chair_2_username ?? '',
            deputyChair2Name: item.deputy_chair_2_name ?? '',
            category: category || 'country'
          };
        });

        setAllCommitteesData(Array.isArray(normalized) ? normalized : []);

        // Fetch agendas
        const agendasResponse = await getEventCommitteesByEventIdAgendaApi(eventId);
        if (agendasResponse.success) {
          const agendasData = agendasResponse.data || [];
          setAllAgendas(agendasData);
        }
      } catch (error: any) {
        console.log('Error fetching initial data:', error);
        toast.error(error.message || 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [eventId]);

  // Fetch documents when active committee changes
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!eventId || !activeCommittee) {
        setDocuments([]);
        setSubTabLoading(false);
        return;
      }
      
      const currentCommittee = filteredCommittees.find(committee => committee.abbr === activeCommittee);
      const committeeId = currentCommittee?.id;
      if (!committeeId) {
        setSubTabLoading(false);
        return;
      }
      
      try {
        const response = await getAgendaDocumentsApi(eventId, committeeId);
        if (response.success) {
          const documentsData = response.data?.data || [];
          if (Array.isArray(documentsData)) {
            const filteredDocuments = documentsData
              .filter((doc: any) => doc.doc_type === activeCommittee)
              .map((doc: any) => ({
                id: doc.id,
                title: doc.title
              }));

            setDocuments(filteredDocuments);
          } else {
            console.warn('Documents data is not an array:', documentsData);
            setDocuments([]);
          }
        } else {
          console.log('Failed to fetch documents:', response.error);
          setDocuments([]);
        }
      } catch (error: any) {
        console.log('Error fetching documents:', error);
        setDocuments([]);
      } finally {
        // Always set loading to false after fetch completes
        setSubTabLoading(false);
      }
    };

    fetchDocuments();
  }, [eventId, activeCommittee, filteredCommittees]);

  // Filter committees based on active category
  useEffect(() => {
    const filtered = allCommitteesData.filter(committee =>
      committee.category === activeCommitteeType
    );
    setFilteredCommittees(filtered);

    // Set first committee as active when category changes
    if (filtered.length > 0) {
      const abbrs = filtered.map(committee => committee.abbr).filter(Boolean);
      const uniqueAbbrs = [...new Set(abbrs)];
      if (uniqueAbbrs.length > 0) {
        setActiveCommittee(uniqueAbbrs[0]);
      }
    }
  }, [allCommitteesData, activeCommitteeType]);

  // Filter agendas based on active committee
  useEffect(() => {
    if (!activeCommittee) {
      setFilteredAgendas([]);
      return;
    }

    const filtered = allAgendas
      .filter((item: any) => item.agenda_abbr === activeCommittee)
      .map((item: any) => ({
        id: item.id,
        title: item.agenda_title || ''
      }));

    setFilteredAgendas(filtered);
  }, [allAgendas, activeCommittee]);

  // Get unique committee abbreviations for sub-tabs
  const getCommitteeAbbreviations = () => {
    const abbrs = filteredCommittees.map(committee => committee.abbr).filter(Boolean);
    return [...new Set(abbrs)];
  };

  const handleSubTabChange = async (abbr: string) => {
    setSubTabLoading(true);
    // Clear documents immediately to show loading state
    setDocuments([]);
    setActiveCommittee(abbr);
    // Loading state will be set to false in fetchDocuments after data is loaded
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (file) {
        setIsUploadingFile(true); // Set loading state for file upload only
        const currentCommittee = filteredCommittees.find(committee => committee.abbr === activeCommittee);
        const committeeId = currentCommittee?.id;
        const response = await uploadAgendaDocumentApi(eventId || '', committeeId || '', file);
        if (response.success) {
          toast.success('Document uploaded successfully');
          setDocumentUrl(response.documentUrl);
          setDocumentName(file.name);
          // Refresh documents from API
          const documentsResponse = await getAgendaDocumentsApi(eventId || '', committeeId || '');
          if (documentsResponse.success) {
            const documentsData = documentsResponse.data?.data || [];
            const filteredDocuments = documentsData
              .filter((doc: any) => doc.doc_type === activeCommittee)
              .map((doc: any) => ({
                id: doc.id,
                title: doc.title,
              }));
            setDocuments(filteredDocuments);
          }
          setSubTabLoading(false);
        } else {
          toast.error(response.message);
          setSubTabLoading(false);
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUploadingFile(false); // Reset file upload loading state
    }
    // Reset the file input
    event.target.value = '';
  };

  // Agenda handlers
  const handleAgendaCommitteeTypeChange = (type: string) => {
    setActiveCommitteeType(type);
  };


  const handleAgendaEdit = (agendaId: number, currentValue: string) => {
    setEditingAgenda(agendaId);
    setTempValue(currentValue);
  };

  const handleAgendaUpdate = async (agendaId: number, newTitle: string) => {
    if (editingAgenda && !isUpdating) {
      try {
        if (!newTitle.trim()) {
          toast.error('Agenda title cannot be empty');
          return;
        }

        setIsUpdating(true);
        const response = await updateEventCommitteesAgendaByIdApi(agendaId.toString(), newTitle);
        if (response.success) {
          toast.success('Agenda updated successfully');

          // Refresh all agendas from API
          const agendasResponse = await getEventCommitteesByEventIdAgendaApi(eventId || '');
          if (agendasResponse.success) {
            const agendasData = agendasResponse.data || [];
            setAllAgendas(agendasData);
          }
        } else {
          toast.error(response.message || 'Failed to update agenda');
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to update agenda');
      } finally {
        setIsUpdating(false);
      }
    }
    setEditingAgenda(null);
    setTempValue('');
  };

  const handleAgendaChange = (value: string) => {
    setTempValue(value);
  };

  const handleAgendaSave = async () => {
    if (editingAgenda && !isSaving) {
      try {
        // Find the current committee data
        const currentCommittee = filteredCommittees.find(committee => committee.abbr === activeCommittee);
        const event_committeeId = currentCommittee?.id;
        const agenda_abbr = activeCommittee;
        const agenda_title = tempValue;

        if (!agenda_title.trim()) {
          toast.error('Agenda title cannot be empty');
          return;
        }

        setIsSaving(true);
        const response = await saveEventCommitteesByEventIdAgendaApi(eventId || '', event_committeeId, agenda_abbr, agenda_title);
        if (response.success) {
          toast.success('Agenda saved successfully');

          // Refresh all agendas from API
          const agendasResponse = await getEventCommitteesByEventIdAgendaApi(eventId || '');
          if (agendasResponse.success) {
            const agendasData = agendasResponse.data || [];
            setAllAgendas(agendasData);
          }
        } else {
          toast.error(response.message || 'Failed to save agenda');
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to save agenda');
      } finally {
        setIsSaving(false);
      }
    }
    setEditingAgenda(null);
    setTempValue('');
  };

  const handleAgendaCancel = () => {
    // If canceling a new agenda item, remove it from the list
    if (editingAgenda && filteredAgendas.find(agenda => agenda.id === editingAgenda)?.title === 'New Agenda Item') {
      setFilteredAgendas(prev => prev.filter(agenda => agenda.id !== editingAgenda));
    }
    setEditingAgenda(null);
    setTempValue('');
  };

  const handleAgendaDeleteClick = (agendaId: number) => {
    setAgendaToDelete(agendaId);
    setShowDeleteConfirm(true);
    setShowAgendaMenu(null);
  };

  const handleAgendaDelete = async () => {
    if (agendaToDelete === null || isDeleting) return;

    try {
      setIsDeleting(true);
      const response = await deleteEventCommitteesAgendaByIdApi(agendaToDelete.toString());
      if (response.success) {
        toast.success('Agenda deleted successfully');

        // Refresh all agendas from API
        const agendasResponse = await getEventCommitteesByEventIdAgendaApi(eventId || '');
        if (agendasResponse.success) {
          const agendasData = agendasResponse.data || [];
          setAllAgendas(agendasData);
        }
      } else {
        toast.error(response.message || 'Failed to delete agenda');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete agenda');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setAgendaToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setAgendaToDelete(null);
    setDocumentToDelete(null);
  };

  const handleAddAgenda = () => {
    const tempId = -Date.now();

    const newAgenda = {
      id: tempId,
      title: 'New Agenda Item'
    };
    setFilteredAgendas([...filteredAgendas, newAgenda]);
    setEditingAgenda(tempId);
    setTempValue('New Agenda Item');
  };

  const handleDocumentChange = (value: string) => {
    setTempValue(value);
  };

  const handleDocumentSave = () => {
    if (editingDocument) {
      setDocuments(prev => prev.map(document =>
        document.id === editingDocument
          ? { ...document, name: tempValue }
          : document
      ));
    }
    setEditingDocument(null);
    setTempValue('');
  };

  const handleDocumentCancel = () => {
    setEditingDocument(null);
    setTempValue('');
  };


  const handleDocumentDelete = async () => {
    if (documentToDelete === null || isDeleting) return;

    try {
      setIsDeleting(true);
      const response = await deleteEventCommitteeDocumentApi(documentToDelete.toString());
      if (response.success) {
        toast.success('Document deleted successfully');
        // Refresh documents from API
        const currentCommittee = filteredCommittees.find(committee => committee.abbr === activeCommittee);
        const committeeId = currentCommittee?.id;
        if (committeeId) {
          const documentsResponse = await getAgendaDocumentsApi(eventId || '', committeeId);
          if (documentsResponse.success) {
            const documentsData = documentsResponse.data?.data || [];
            const filteredDocuments = documentsData
              .filter((doc: any) => doc.doc_type === activeCommittee)
              .map((doc: any) => ({
                id: doc.id,
                title: doc.title,
              }));
            setDocuments(filteredDocuments);
          }
        }
        setSubTabLoading(false);
      } else {
        toast.error(response.message || 'Failed to delete document');
        setSubTabLoading(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete document');
      setSubTabLoading(false);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setDocumentToDelete(null);
    }
  };

  const handleUploadDocument = async () => {
    if (isSavingDocument) return; // Prevent double clicks

    // Validate all required data before uploading
    if (!eventId) {
      toast.error('Event ID is missing. Please refresh the page and try again.');
      return;
    }

    if (!activeCommittee) {
      toast.error('Please select a committee first.');
      return;
    }

    if (!documentName || documentName.trim() === '') {
      toast.error('Please enter a document name.');
      return;
    }

    if (!documentUrl || documentUrl.trim() === '') {
      toast.error('Please select a file to upload.');
      return;
    }

    const currentCommittee = filteredCommittees.find(committee => committee.abbr === activeCommittee);
    const committeeId = currentCommittee?.id;

    if (!committeeId) {
      toast.error('Committee ID not found. Please select a valid committee.');
      return;
    }

    try {
      setIsSavingDocument(true); // Set loading state for document save only
      const response = await saveEventCommitteeDocumentApi(eventId, committeeId, activeCommittee, documentName.trim(), documentUrl.trim());
      if (response.success) {
        toast.success('Document uploaded successfully');
        // Refresh documents from API
        const documentsResponse = await getAgendaDocumentsApi(eventId, committeeId);
        if (documentsResponse.success) {
          const documentsData = documentsResponse.data?.data || [];
          const filteredDocuments = documentsData
            .filter((doc: any) => doc.doc_type === activeCommittee)
            .map((doc: any) => ({
              id: doc.id,
              title: doc.title,
            }));
          setDocuments(filteredDocuments);
        }
        setSubTabLoading(false);
        setShowDocumentMenu(null);
        setEditingDocument(null);
        setTempValue('');
        // Clear the form after successful upload
        setDocumentName('');
        setDocumentUrl('');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload document. Please try again.');
      setSubTabLoading(false);
    } finally {
      setIsSavingDocument(false); // Reset document save loading state
    }
  };


  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading data...</span>
      </div>
    );
  }

  const committeeAbbreviations = getCommitteeAbbreviations();

  return (
    <>
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={handleDeleteCancel}
        onConfirm={agendaToDelete !== null ? handleAgendaDelete : handleDocumentDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete this ${agendaToDelete !== null ? 'agenda' : 'document'}? This action cannot be undone.`}
        confirmText="Yes"
        cancelText="No"
        confirmButtonColor="text-red-600"
        isLoading={isDeleting}
        loadingText="Deleting..."
      />

      <div className="space-y-6">
        {/* Committee Type Filters */}
        <div className="flex space-x-2">
          {committeeTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handleAgendaCommitteeTypeChange(type.id)}
              className={`w-[160px] h-[58px] px-[5px] py-[5px] text-sm font-medium rounded-[20px] transition-colors duration-200 ${activeCommitteeType === type.id
                ? 'bg-[#607DA3] text-white'
                : 'bg-white text-black border border-gray-800'
                }`}
            >
              {type.name}
            </button>
          ))}
        </div>

        {/* Committee Sub-tabs based on abbreviations */}
        {committeeAbbreviations.length > 0 && (
          <div className="flex space-x-2">
            {committeeAbbreviations.map((abbr) => (
              <button
                key={abbr}
                onClick={() => handleSubTabChange(abbr)}
                disabled={subTabLoading}
                className={`w-[160px] h-[58px] px-[5px] py-[5px] text-sm font-medium rounded-[20px] transition-colors duration-200 ${activeCommittee === abbr
                  ? 'bg-[#84B5F3] text-white'
                  : 'bg-white text-black border border-gray-800'
                  } ${subTabLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {abbr}
              </button>
            ))}
          </div>
        )}

        {/* Show message if no committees */}
        {filteredCommittees.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No committees available</h3>
            <p className="text-gray-500 mb-4">No committees found for the selected category.</p>
          </div>
        )}

        {/* Committee Agendas Section - Only show when there are committees */}
        {filteredCommittees.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Committee Agendas</h2>

          {/* Existing Agendas */}
          {filteredAgendas.length === 0 ? (
            <div className="text-red-500 font-medium text-sm">None</div>
          ) : (
            filteredAgendas.map((agenda) => (
              <div key={agenda.id} className="w-[400px] flex items-center">
                <div className="flex-1">
                  {editingAgenda === agenda.id ? (
                    <input
                      type="text"
                      value={tempValue}
                      onChange={(e) => handleAgendaChange(e.target.value)}
                      className="w-[400px] px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E395D] focus:border-transparent"
                      placeholder="Enter agenda title"
                      autoFocus
                    />
                  ) : (
                    <input
                      type="text"
                      value={agenda.title}
                      readOnly
                      className="w-[400px] px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50"
                    />
                  )}
                </div>


                {/* Three-dot menu - hide when editing */}
                {editingAgenda !== agenda.id && (
                  <div className="relative" ref={showAgendaMenu === agenda.id ? agendaMenuRef : null}>
                    <button
                      onClick={() => setShowAgendaMenu(showAgendaMenu === agenda.id ? null : agenda.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>

                    {showAgendaMenu === agenda.id && (
                      <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
                        <div className="py-2">
                          <button
                            onClick={() => {
                              handleAgendaEdit(agenda.id, agenda.title);
                              setShowAgendaMenu(null);
                            }}
                            className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleAgendaDeleteClick(agenda.id)}
                            className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}

          {/* Add Agenda Button OR Save/Cancel Buttons OR Update/Cancel Buttons*/}
          <div className="flex space-x-2">
            {editingAgenda !== null && filteredAgendas.find(agenda => agenda.id === editingAgenda)?.title === 'New Agenda Item' ? (
              <>
                {/* Save Button - replaces Add button when editing new agenda */}
                <button
                  onClick={handleAgendaSave}
                  disabled={isSaving}
                  className="text-white font-medium transition-colors hover:opacity-90"
                  style={{
                    width: '120px',
                    height: '44px',
                    borderRadius: '30px',
                    padding: '10px',
                    gap: '10px',
                    background: isSaving ? '#bdbdbd' : '#C2A46D',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    border: 'none',
                    boxShadow: 'none',
                    opacity: isSaving ? 0.6 : 1,
                  }}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                {/* Cancel Button - next to Save button */}
                <button
                  onClick={() => {
                    handleAgendaCancel();
                    setShowAgendaMenu(null);
                  }}
                  className="text-white font-medium transition-colors hover:opacity-90"
                  style={{
                    width: '120px',
                    height: '44px',
                    borderRadius: '30px',
                    padding: '10px',
                    gap: '10px',
                    background: '#84B5F3',
                    cursor: 'pointer',
                    border: 'none',
                    boxShadow: 'none',
                  }}
                >
                  Cancel
                </button>
              </>
            ) :
              editingAgenda !== null && filteredAgendas.find(a => a.id === editingAgenda)?.title !== 'New Agenda Item' ? (
                <>
                  <button
                    onClick={() => handleAgendaUpdate(editingAgenda, tempValue)}
                    disabled={isUpdating}
                    className="text-white font-medium transition-colors hover:opacity-90"
                    style={{
                      width: '120px',
                      height: '44px',
                      borderRadius: '30px',
                      padding: '10px',
                      gap: '10px',
                      background: isUpdating ? '#bdbdbd' : '#C2A46D',
                      cursor: isUpdating ? 'not-allowed' : 'pointer',
                      border: 'none',
                      boxShadow: 'none',
                      opacity: isUpdating ? 0.6 : 1,
                    }}
                  >
                    {isUpdating ? 'Updating...' : 'Update'}
                  </button>
                  <button
                    onClick={() => {
                      handleAgendaCancel();
                      setShowAgendaMenu(null);
                    }}
                    className="text-white font-medium transition-colors hover:opacity-90"
                    style={{
                      width: '120px',
                      height: '44px',
                      borderRadius: '30px',
                      padding: '10px',
                      gap: '10px',
                      background: '#84B5F3',
                      cursor: 'pointer',
                      border: 'none',
                      boxShadow: 'none',
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleAddAgenda}
                    className={`text-white font-medium transition-colors ${isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                      }`}
                    style={{
                      width: '140px',
                      height: '44px',
                      borderRadius: '30px',
                      padding: '10px',
                      gap: '10px',
                      opacity: isSaving ? 0.5 : 1,
                      background: isSaving ? '#bdbdbd' : '#C2A46D',
                      cursor: isSaving ? 'not-allowed' : 'pointer',
                      border: 'none',
                      boxShadow: 'none',
                    }}
                    disabled={isSaving}
                  >
                    Add Agenda
                  </button>
                </>
              )}
          </div>
          </div>
        )}

        {/* Committee Documents Section - Only show when there are committees */}
        {filteredCommittees.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Committee Documents</h2>

          {/* Document List Container */}
          <div className="space-y-3">
            {/* Loading State */}
            {subTabLoading ? (
              <div className="w-[400px] flex items-center justify-center py-8 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E395D]"></div>
                <span className="ml-3 text-gray-600">Loading documents...</span>
              </div>
            ) : !Array.isArray(documents) || documents.length === 0 ? (
              <div className="w-[400px] text-red-500 font-medium text-sm py-3">None</div>
            ) : (
              documents.map((document) => (
                <div key={document.id} className="w-[400px] flex items-center">
                  <div className="flex-1">
                    {editingDocument === document.id ? (
                      <input
                        type="text"
                        value={tempValue}
                        onChange={(e) => handleDocumentChange(e.target.value)}
                        className="w-[400px] px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E395D] focus:border-transparent"
                        placeholder="Enter document name"
                        autoFocus
                      />
                    ) : (
                      <input
                        type="text"
                        value={document.title}
                        readOnly
                        className="w-[400px] px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50"
                      />
                    )}
                  </div>

                  {/* Update and Cancel buttons when editing existing document */}
                  {editingDocument === document.id && (
                    <>
                      <button
                        onClick={handleDocumentSave}
                        className="text-white font-medium transition-colors hover:opacity-90"
                        style={{
                          width: '120px',
                          height: '44px',
                          borderRadius: '30px',
                          padding: '10px',
                          gap: '10px',
                          background: '#C2A46D',
                          cursor: 'pointer',
                          border: 'none',
                          boxShadow: 'none',
                        }}
                      >
                        Update
                      </button>
                      <button
                        onClick={() => {
                          handleDocumentCancel();
                          setShowDocumentMenu(null);
                        }}
                        className="text-white font-medium transition-colors hover:opacity-90"
                        style={{
                          width: '120px',
                          height: '44px',
                          borderRadius: '30px',
                          padding: '10px',
                          gap: '10px',
                          background: '#84B5F3',
                          cursor: 'pointer',
                          border: 'none',
                          boxShadow: 'none',
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {/* Three-dot menu */}
                  {editingDocument !== document.id && (
                    <div className="relative" ref={showDocumentMenu === document.id ? documentMenuRef : null}>
                      <button
                        onClick={() => setShowDocumentMenu(showDocumentMenu === document.id ? null : document.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>

                      {showDocumentMenu === document.id && (
                        <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
                          <div className="py-2">
                            <button
                              onClick={() => {
                                setDocumentToDelete(document.id);
                                setShowDeleteConfirm(true);
                                setShowDocumentMenu(null);
                              }}
                              className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Upload Document Section */}
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="text"
                placeholder={documentName}
                className="w-[350px] px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#1E395D] focus:border-transparent"
                readOnly
              />
              <label className={`ml-0 px-4 py-3 rounded-r-lg transition-colors duration-200 ${isUploadingFile
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#C2A46D] text-white cursor-pointer hover:opacity-90'
                }`}
                style={{ height: "50px", display: "flex", alignItems: "center", justifyContent: "center", marginLeft: "0px !important" }}
              >
                {isUploadingFile ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                )}
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={isUploadingFile}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                />
              </label>
            </div>
            <button
              onClick={handleUploadDocument}
              className={`text-white font-medium transition-colors ${isSavingDocument ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                }`}
              style={{
                width: '200px',
                height: '44px',
                borderRadius: '30px',
                paddingLeft: '10px',
                paddingRight: '10px',
                gap: '10px',
                opacity: isSavingDocument ? 0.5 : 1,
                background: isSavingDocument ? '#bdbdbd' : '#C2A46D',
                cursor: isSavingDocument ? 'not-allowed' : 'pointer',
                border: 'none',
                boxShadow: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              disabled={isSavingDocument}
            >
              {isSavingDocument ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                'Upload Document'
              )}
            </button>
          </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AgendaPage;
