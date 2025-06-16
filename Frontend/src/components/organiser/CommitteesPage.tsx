import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { useApp } from '../../contexts/AppContext';
import { getAllEventCommitteesApi } from '../../apis/Event_committes';
import { deleteEventCommitteesByEventIdApi } from '../../apis/Event_committes';
import { useParams } from 'react-router-dom';
import { saveEventCommitteesByEventIdApi, updateEventCommitteesByEventIdApi } from '../../apis/Event_committes';
// import { updateCommitteeApi } from '../../apis/Committees';
import ConfirmationModal from '../ui/ConfirmationModal';

interface Committee {
  id: string;
  abbr: string;
  committee: string;
  // The selected master committee id from dropdown selection
  committeeId?: number;
  seatsTotal: string;
  chairUsername: string;
  chairName: string;
  deputyChair1Username: string;
  deputyChair1Name: string;
  deputyChair2Username: string;
  deputyChair2Name: string;
  // Local-only flag to prevent multiple unsaved rows
  isNew?: boolean;
  // Category to filter by tabs
  category?: string;
}

const CommitteesPage: React.FC = () => {

  // State variables
  const [activeCommitteeType, setActiveCommitteeType] = useState('country');
  const [allCommitteesData, setAllCommitteesData] = useState<any[]>([]);
  const [committees, setCommittees] = useState<any[]>([]);
  const [editingCommittee, setEditingCommittee] = useState<string | null>(null);
  const [editingCommitteeField, setEditingCommitteeField] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isUpdateMode, setIsUpdateMode] = useState<boolean>(false);
  const [showContextMenu, setShowContextMenu] = useState<boolean>(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [contextMenuCommitteeId, setContextMenuCommitteeId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  // Initial loading state to track data fetching
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  // Loading state for tab switching
  const [isTabLoading, setIsTabLoading] = useState<boolean>(false);
  // Keep a ref in sync with hasUnsavedChanges to avoid stale closures in async effects
  const hasUnsavedChangesRef = useRef<boolean>(false);

  // Committee autocomplete states
  const [showCommitteeDropdown, setShowCommitteeDropdown] = useState<boolean>(false);
  const [filteredCommittees, setFilteredCommittees] = useState<any[]>([]);
  const [activeCommitteeDropdown, setActiveCommitteeDropdown] = useState<string | null>(null);
  const committeeDropdownRef = useRef<HTMLDivElement>(null);

  // User autocomplete states
  const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [activeUserDropdown, setActiveUserDropdown] = useState<string | null>(null);
  const [activeUserField, setActiveUserField] = useState<string | null>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const committeeTypes = [
    { id: 'country', name: 'Country Committees' },
    { id: 'role', name: 'Role Committees' },
    { id: 'crisis', name: 'Crisis Committees' },
    { id: 'open', name: 'Open Committees' }
  ];


  const { eventId } = useParams();
  const { allCommittees, allRegistrations, refreshCommitteesData, refreshRegistrationsData, isLoading } = useApp();

  useEffect(() => {
    refreshCommitteesData();
  }, []);

  // Load registrations for this event
  useEffect(() => {
    if (eventId) {
      refreshRegistrationsData(eventId);
    }
  }, [eventId]);

  // Keep ref synced with state
  useEffect(() => {
    hasUnsavedChangesRef.current = hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  // Filter committees based on active tab category
  useEffect(() => {
    // Only filter if we don't have unsaved changes to avoid overwriting new committees
    if (!hasUnsavedChanges) {
      // Get committees from allCommitteesData that match the active category
      const filteredFromAll = allCommitteesData.filter((committee: any) => {
        return committee.category === activeCommitteeType;
      });
      setCommittees(filteredFromAll);
    }
  }, [allCommitteesData, activeCommitteeType, hasUnsavedChanges]);

  // Fetch committees for event and active type. Avoid overwriting local edits.
  useEffect(() => {
    const fetchEventCommittees = async () => {
      try {
        setIsInitialLoading(true);
        const response = await getAllEventCommitteesApi(eventId as string);
        // Only update if we don't have unsaved changes at response time
        if (!hasUnsavedChanges) {
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
              isNew: false,
              category: category || 'country' // Default to 'country' if no category
            };
          });
          setAllCommitteesData(Array.isArray(normalized) ? normalized : []);
        }
      } catch (error: any) {
        console.log('Error fetching event committees:', error);
        toast.error(error.message || 'Failed to fetch event committees');
      } finally {
        setIsInitialLoading(false);
      }
    };

    if (eventId) {
      fetchEventCommittees();
    }
  }, [eventId, activeCommitteeType, hasUnsavedChanges]);
  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (committeeDropdownRef.current && !committeeDropdownRef.current.contains(event.target as Node)) {
        setShowCommitteeDropdown(false);
        setFilteredCommittees([]);
        setActiveCommitteeDropdown(null);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
        setFilteredUsers([]);
        setActiveUserDropdown(null);
        setActiveUserField(null);
      }
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setShowContextMenu(false);
        setContextMenuCommitteeId(null);
        setIsUpdateMode(false); // Reset update mode when clicking outside
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handler functions
  const handleCommitteeTypeChange = async (type: string) => {
    setIsTabLoading(true);
    setActiveCommitteeType(type);
    // Clear dropdown states when switching tabs
    setShowCommitteeDropdown(false);
    setFilteredCommittees([]);
    setActiveCommitteeDropdown(null);
    setShowUserDropdown(false);
    setFilteredUsers([]);
    setActiveUserDropdown(null);
    setActiveUserField(null);
    setShowContextMenu(false);
    setContextMenuCommitteeId(null);
    setEditingCommittee(null);
    setEditingCommitteeField(null);
    setIsUpdateMode(false); // Reset update mode when switching tabs
    
    // Check if there are any new unsaved rows before resetting unsaved changes
    const hasNewRows = committees.some((c: any) => c.isNew);
    
    if (!hasNewRows) {
      // No new rows, safe to reset and filter from backend data
      setHasUnsavedChanges(false);
      
      // Filter committees for the new tab from backend data
      const filteredFromAll = allCommitteesData.filter((committee: any) => {
        return committee.category === type;
      });
      setCommittees(filteredFromAll);
    } else {
      // There are new rows, preserve them and only filter existing ones
      setCommittees(prev => prev.filter((committee: any) => {
        return committee.category === type;
      }));
    }
    
    // Add a small delay to show loading state
    setTimeout(() => {
      setIsTabLoading(false);
    }, 500);
  };

  const handleCommitteeFieldEdit = (committeeId: string, fieldType: string) => {
    // Define which fields are editable in edit mode
    const editableFields = ['committee', 'seatsTotal', 'chairUsername', 'deputyChair1Username', 'deputyChair2Username'];
    
    // Only allow editing if it's a new committee or if the field is in the editable list
    const committee = committees.find((c: any) => c.id === committeeId);
    const isNewCommittee = committee?.isNew;
    
    if (!isNewCommittee && !editableFields.includes(fieldType)) {
      // Field is not editable in edit mode, don't allow editing
      return;
    }
    
    setEditingCommittee(committeeId);
    setEditingCommitteeField(fieldType);

    // Prepare user dropdown state if editing a username field
    if (
      fieldType === 'chairUsername' ||
      fieldType === 'deputyChair1Username' ||
      fieldType === 'deputyChair2Username'
    ) {
      setActiveUserDropdown(committeeId);
      setActiveUserField(fieldType);
      setShowUserDropdown(false);
      setFilteredUsers([]);
    } else {
      setShowUserDropdown(false);
      setFilteredUsers([]);
      setActiveUserDropdown(null);
      setActiveUserField(null);
    }
    setShowContextMenu(false);
    setContextMenuCommitteeId(null);
  };

  const handleCommitteeFieldChange = (value: string, committeeId?: string) => {
    // Update the committee data directly
    if (editingCommittee && editingCommitteeField && committeeId) {
      setCommittees(prev => prev.map((committee: any) =>
        committee.id === committeeId
          ? { ...committee, [editingCommitteeField]: value }
          : committee
      ));
      setHasUnsavedChanges(true);
    }

    // If committee field is being changed, show dropdown and filter committees
    if (editingCommitteeField === 'committee') {
      if (value.trim()) {
        setShowCommitteeDropdown(true);
        setActiveCommitteeDropdown(committeeId || null);
        filterCommitteesByInput(value.trim());
      } else {
        setShowCommitteeDropdown(false);
        setFilteredCommittees([]);
        setActiveCommitteeDropdown(null);
      }
    }

    // If username field is being changed, show dropdown and filter users
    if (
      editingCommitteeField === 'chairUsername' ||
      editingCommitteeField === 'deputyChair1Username' ||
      editingCommitteeField === 'deputyChair2Username'
    ) {
      if (value.trim()) {
        setShowUserDropdown(true);
        setActiveUserDropdown(committeeId || null);
        setActiveUserField(editingCommitteeField);
        filterUsersByInput(value.trim());
      } else {
        setShowUserDropdown(false);
        setFilteredUsers([]);
        setActiveUserDropdown(null);
        setActiveUserField(null);
      }
    }
  };

  // Function to filter committees by input and current tab category
  const filterCommitteesByInput = (input: string) => {

    if (!allCommittees || allCommittees.length === 0) {
      setFilteredCommittees([]);
      return;
    }

    // Filter committees by current active tab category
    const filteredByCategory = allCommittees.filter((committee: any) => {
      return committee.category === activeCommitteeType;
    });


    // Then filter by input text
    const filtered = filteredByCategory.filter((committee: any) => {
      const committeeName = committee.committee || '';
      const abbreviation = committee.abbr || '';

      return (
        committeeName.toLowerCase().includes(input.toLowerCase()) ||
        abbreviation.toLowerCase().includes(input.toLowerCase())
      );
    });

    setFilteredCommittees(filtered);
  };

  // Function to filter users by input
  const filterUsersByInput = (input: string) => {
    if (!allRegistrations || allRegistrations.length === 0) {
      setFilteredUsers([]);
      return;
    }

    // Filter registrations by username or fullname
    const filtered = allRegistrations.filter((registration: any) => {
      const user = registration.user || registration;
      const username = user.username || '';
      const fullname = user.fullname || '';

      return (
        username.toLowerCase().includes(input.toLowerCase()) ||
        fullname.toLowerCase().includes(input.toLowerCase())
      );
    });

    setFilteredUsers(filtered);
  };

  // Handle committee selection from dropdown
  const handleCommitteeSelect = (selectedCommittee: any) => {
    if (editingCommittee && editingCommitteeField === 'committee') {
      setCommittees(prev => prev.map((committee: any) =>
        committee.id === editingCommittee
          ? {
            ...committee,
            committee: selectedCommittee.committee || selectedCommittee.name || '',
            abbr: selectedCommittee.abbr || 'Auto',
            // store actual committee id from master list
            committeeId: selectedCommittee.id
          }
          : committee
      ));
      // Mark as having unsaved changes after committee selection
      setHasUnsavedChanges(true);
    }
    setShowCommitteeDropdown(false);
    setFilteredCommittees([]);
    setActiveCommitteeDropdown(null);
    // Keep row in edit mode; advance to seats for continued input
    if (editingCommittee) {
      setEditingCommitteeField('seatsTotal');
    }
  };

  // Handle user selection from dropdown
  const handleUserSelect = (selectedUser: any) => {
    const selected = selectedUser && selectedUser.user ? selectedUser.user : selectedUser;
    if (editingCommittee && activeUserField) {
      setCommittees(prev => prev.map((committee: any) => {
        if (committee.id !== editingCommittee) return committee;
        // If editing a Username field, set both username and corresponding Name
        if (
          activeUserField === 'chairUsername' ||
          activeUserField === 'deputyChair1Username' ||
          activeUserField === 'deputyChair2Username'
        ) {
          const nameField = activeUserField.replace('Username', 'Name');
          return {
            ...committee,
            [activeUserField]: selected?.username || '',
            [nameField]: selected?.fullname || ''
          };
        }
        // If editing a Name field, set both name and corresponding Username
        if (
          activeUserField === 'chairName' ||
          activeUserField === 'deputyChair1Name' ||
          activeUserField === 'deputyChair2Name'
        ) {
          const usernameField = activeUserField.replace('Name', 'Username');
          return {
            ...committee,
            [activeUserField]: selected?.fullname || '',
            [usernameField]: selected?.username || ''
          };
        }
        return committee;
      }));
      // Mark as having unsaved changes after user selection
      setHasUnsavedChanges(true);
    }
    setShowUserDropdown(false);
    setFilteredUsers([]);
    setActiveUserDropdown(null);
    setActiveUserField(null);
    // Keep row in edit mode to continue editing other fields
  };

  const handleContextMenuClick = (event: React.MouseEvent, committeeId: string) => {
    event.preventDefault();
    event.stopPropagation();

    const rect = event.currentTarget.getBoundingClientRect();
    setContextMenuPosition({
      x: rect.left,
      y: rect.bottom
    });
    setContextMenuCommitteeId(committeeId);
    setShowContextMenu(true);
  };

  const handleAddCommittee = () => {
    // Prevent generating another row if one unsaved new row already exists
    const hasPendingNewRow = committees.some((c: any) => c.isNew);
    if (hasPendingNewRow) {
      return;
    }
    
    // Generate a unique UUID for the new committee
    const newId = uuidv4();
    const newCommittee: Committee = {
      id: newId,
      abbr: 'Auto',
      committee: '',
      committeeId: undefined,
      seatsTotal: '',
      chairUsername: '',
      chairName: '',
      deputyChair1Username: '',
      deputyChair1Name: '',
      deputyChair2Username: '',
      deputyChair2Name: '',
      isNew: true,
      category: activeCommitteeType
    };
    
    // Clear any existing editing states first
    setEditingCommittee(null);
    setEditingCommitteeField(null);
    setIsUpdateMode(false); // Reset update mode for new committees
    
    // Mark as having unsaved changes FIRST to prevent filtering effect from running
    setHasUnsavedChanges(true);
    
    // Add the new committee
    setCommittees(prev => [...prev, newCommittee as any]);
    
    // Use setTimeout to ensure state updates are processed before setting editing state
    setTimeout(() => {
      // Enable editing for the committee field on the newly added row
      setEditingCommittee(newId);
      setEditingCommitteeField('committee');

      // Clear any existing dropdown states
      setShowCommitteeDropdown(false);
      setFilteredCommittees([]);
      setActiveCommitteeDropdown(null);
      setShowUserDropdown(false);
      setFilteredUsers([]);
      setActiveUserDropdown(null);
      setActiveUserField(null);
      setShowContextMenu(false);
      setContextMenuCommitteeId(null);
    }, 0);
  };

  const handleDeleteCommittee = async () => {
    try {
      setIsDeleting(true);
      if (!contextMenuCommitteeId) return;
      const target = committees.find((c: any) => c.id === contextMenuCommitteeId);
      if (!target) return;

      // If it's a new unsaved row, just remove locally
      if (target.isNew) {
        setCommittees(prev => prev.filter((c: any) => c.id !== contextMenuCommitteeId));
        setShowContextMenu(false);
        setContextMenuCommitteeId(null);
        return;
      }

      const response = await deleteEventCommitteesByEventIdApi(String(contextMenuCommitteeId));
      if (!response.success) {
        toast.error('Failed to delete committee');
        return;
      }
      // After successful delete, refresh from backend to reflect latest data
      try {
        const refreshed = await getAllEventCommitteesApi(eventId as string);
        const raw = refreshed.data || [];
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
            isNew: false,
            category: category || 'country'
          };
        });
        setAllCommitteesData(Array.isArray(normalized) ? normalized : []);
      } catch (refreshErr) {
        // Fallback to local removal if refresh fails
        setCommittees(prev => prev.filter((c: any) => c.id !== contextMenuCommitteeId));
      }
      toast.success('Committee deleted');
    } catch (error: any) {
      console.log('Error deleting committee:', error);
      toast.error(error.message || 'Failed to delete committee');
    } finally {
      setIsDeleting(false);
      setShowContextMenu(false);
      setContextMenuCommitteeId(null);
    }
  };

  const handleEditCommittee = () => {
    if (contextMenuCommitteeId) {
      const committee = committees.find((c: any) => c.id === contextMenuCommitteeId);
      if (committee) {
        // Set update mode for existing committees
        setIsUpdateMode(true);
        setEditingCommittee(contextMenuCommitteeId);
        setEditingCommitteeField('committee');
        setHasUnsavedChanges(true);
      }
    }
    setShowContextMenu(false);
    setContextMenuCommitteeId(null);
  };

  const handleSaveCommittees = async () => {
    try {
      setIsSaving(true);
      // Only save the currently editing row (or the new pending row if present)
      const target =
        (editingCommittee && committees.find((c: any) => c.id === editingCommittee)) ||
        committees.find((c: any) => c.isNew) ||
        null;

      if (!target) {
        toast.error('No row selected to save');
        return;
      }

      if (!target.committee || target.committee === '') {
        toast.error('Please select a committee before saving');
        return;
      }
      if (!target.seatsTotal || target.seatsTotal === '') {
        toast.error('Please enter a number of seats before saving');
        return;
      }

      // Require a selected master committee id; do not fallback to local row id
      const committeeIdentifier = (target as any).committeeId;
      if (!committeeIdentifier) {
        toast.error('Please select a committee from the dropdown before saving');
        return;
      }
      const response = await saveEventCommitteesByEventIdApi(
        committeeIdentifier.toString(),
        eventId as string,
        activeCommitteeType,
        target.abbr,
        target.seatsTotal,
        target.chairUsername,
        target.chairName,
        target.deputyChair1Username,
        target.deputyChair1Name,
        target.deputyChair2Username,
        target.deputyChair2Name
      );

      if (!response.success) {
        toast.error(`Failed to save committee: ${target.committee}`);
        return;
      }

      // Clear isNew flag after successful save
      setCommittees(prev => prev.map((c: any) => (c.id === target.id ? { ...c, isNew: false } : c)));
      toast.success('Committees saved successfully');
      // Reset unsaved changes flag after successful save
      setHasUnsavedChanges(false);
    } catch (error: any) {
      console.log('Error saving committees:', error);
      toast.error(error.message || 'Failed to save committees');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateCommittees = async () => {
    try {
      setIsUpdating(true);
      // Only update the currently editing row
      const target = editingCommittee && committees.find((c: any) => c.id === editingCommittee);

      if (!target) {
        toast.error('No row selected to update');
        return;
      }

      if (!target.committee || target.committee === '') {
        toast.error('Please select a committee before updating');
        return;
      }

      // Require a selected master committee id
      const committeeIdentifier = (target as any).committeeId;
      if (!committeeIdentifier) {
        toast.error('Please select a committee from the dropdown before updating');
        return;
      }

      console.log('[CommitteesPage] Updating committee with ID:', target.id, 'identifier:', committeeIdentifier);
      const response = await updateEventCommitteesByEventIdApi(
        target.id, // Use the committee's ID for updating
        eventId as string,
        committeeIdentifier.toString(),
        activeCommitteeType,
        target.seatsTotal,
        target.chairUsername,
        target.chairName,
        target.deputyChair1Username,
        target.deputyChair1Name,
        target.deputyChair2Username,
        target.deputyChair2Name
      );

      if (!response.success) {
        toast.error(`Failed to update committee: ${target.committee}`);
        return;
      }

      toast.success('Committee updated successfully');
      // Reset unsaved changes flag after successful update
      setHasUnsavedChanges(false);
      setIsUpdateMode(false);
    } catch (error: any) {
      console.log('Error updating committees:', error);
      toast.error(error.message || 'Failed to update committees');
    } finally {
      setIsUpdating(false);
    }
  };

  // Show loading state while fetching data
  if (isInitialLoading || isTabLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">
          {isTabLoading ? 'Loading committee data...' : 'Loading committees...'}
        </span>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex space-x-2">
        {committeeTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleCommitteeTypeChange(type.id)}
            disabled={isTabLoading}
            className={`w-[200px] h-[58px] rounded-[20px] p-[5px] opacity-100 transition-colors text-sm font-medium ${activeCommitteeType === type.id
              ? 'bg-[#6A8BAF] text-white'
              : 'bg-white text-black border border-gray-800'
              } ${isTabLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
            style={{ transform: 'rotate(0deg)' }}
          >
            {isTabLoading && activeCommitteeType === type.id ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Loading...
              </div>
            ) : (
              type.name
            )}
          </button>
        ))}
      </div>

      {/* Show message if no committees */}
      {committees.length === 0 && !isLoading && !isTabLoading && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No committees available</h3>
          <p className="text-gray-500 mb-4">Click "Add Committee" to create your first committee.</p>
        </div>
      )}

      {/* Only show table if there are committees */}
      {committees.length > 0 && (
        <div className="space-y-6 " style={{ marginBottom: '16px' }}>
          {/* Grid Container */}
          <div className="grid grid-cols-[80px_200px_70px_100px_100px_100px_100px_100px_100px_0px] gap-4">
            <div className="bg-[#C6DAF4] text-grey-800 px-3 py-2 rounded-lg text-sm font-medium text-center border border-gray-800">ABBR</div>
            <div className="bg-[#C6DAF4] text-grey-800 px-3 py-2 rounded-lg text-sm font-medium text-center border border-gray-800">Committee</div>
            <div className="bg-[#C6DAF4] text-grey-800 px-3 py-2 rounded-lg text-sm font-medium text-center border border-gray-800">Seats Total</div>
            <div className="bg-[#C6DAF4] text-grey-800 px-3 py-2 rounded-lg text-sm font-medium text-center border border-gray-800">Chair Username</div>
            <div className="bg-[#C6DAF4] text-grey-800 px-3 py-2 rounded-lg text-sm font-medium text-center border border-gray-800">Chair Name</div>
            <div className="bg-[#C6DAF4] text-grey-800 px-3 py-2 rounded-lg text-sm font-medium text-center border border-gray-800">Deputy Chair 1 Username</div>
            <div className="bg-[#C6DAF4] text-grey-800 px-3 py-2 rounded-lg text-sm font-medium text-center border border-gray-800">Deputy Chair 1 Name</div>
            <div className="bg-[#C6DAF4] text-grey-800 px-3 py-2 rounded-lg text-sm font-medium text-center border border-gray-800">Deputy Chair 2 Username</div>
            <div className="bg-[#C6DAF4] text-grey-800 px-3 py-2 rounded-lg text-sm font-medium text-center border border-gray-800">Deputy Chair 2 Name</div>
            <div></div>

            {committees.map((committee: any) => (
              <React.Fragment key={committee.id}>
                <div className="bg-gray-50 border border-gray-800 rounded-lg px-3 py-2 flex items-center justify-center">
                  <div className="text-sm text-gray-900 text-center w-full">
                    {committee.abbr}
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-800 rounded-lg px-3 py-2 flex items-center">
                  {editingCommittee === committee.id && editingCommitteeField === 'committee' ? (
                    <div className=" text-sm rounded-md relative w-full" ref={committeeDropdownRef}>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                          type="text"
                          value={committee.committee || ''}
                          onChange={(e) => handleCommitteeFieldChange(e.target.value, committee.id)}
                          placeholder="E.g. United Nations Security Council"
                          className="w-full border-none outline-none text-gray-900"
                          autoFocus
                          autoComplete="off"
                        />
                        {committee.committee && (
                          <button
                            onClick={() => {
                              handleCommitteeFieldChange('', committee.id);
                              setShowCommitteeDropdown(false);
                              setFilteredCommittees([]);
                              setActiveCommitteeDropdown(null);
                            }}
                            className="text-gray-400 hover:text-gray-600 ml-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Committee Dropdown */}
                      {showCommitteeDropdown && activeCommitteeDropdown === committee.id && filteredCommittees.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                          {filteredCommittees.map((committeeOption, index) => (
                            <button
                              key={committeeOption.id || index}
                              type="button"
                              onClick={() => handleCommitteeSelect(committeeOption)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#D9C7A1] hover:text-gray-900 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium">{committeeOption.committee || committeeOption.name}</div>
                              {committeeOption.abbr && (
                                <div className="text-xs text-gray-500">ABBR: {committeeOption.abbr}</div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className="text-sm text-gray-900 w-full"
                      onClick={editingCommittee === committee.id ? () => handleCommitteeFieldEdit(committee.id, 'committee') : undefined}
                    >
                      {committee.committee || 'E.g. United Nations Security Council'}
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 border border-gray-800 rounded-lg px-3 py-2 flex items-center">
                  {editingCommittee === committee.id && editingCommitteeField === 'seatsTotal' ? (
                    <div className="text-sm relative w-full">
                      <input
                        type="text"
                        value={committee.seatsTotal || ''}
                        onChange={(e) => handleCommitteeFieldChange(e.target.value, committee.id)}
                        placeholder="Enter number of seats"
                        className="w-full border-none outline-none text-gray-900"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <div
                      className="text-sm text-gray-900 w-full"
                      onClick={editingCommittee === committee.id ? () => handleCommitteeFieldEdit(committee.id, 'seatsTotal') : undefined}
                    >
                      {committee.seatsTotal}
                    </div>
                  )}
                </div>

                {/* Chair Username */}
                <div className="bg-gray-50 border border-gray-800 rounded-lg px-3 py-2 flex items-center">
                  {editingCommittee === committee.id && editingCommitteeField === 'chairUsername' ? (
                    <div className="bg-white px-3 py-2 text-sm rounded-md border border-gray-200 relative w-full" ref={userDropdownRef}>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                          type="text"
                          value={committee.chairUsername || ''}
                          onChange={(e) => handleCommitteeFieldChange(e.target.value, committee.id)}
                          placeholder="@username"
                          className="w-full border-none outline-none text-gray-900"
                          autoFocus
                          autoComplete="off"
                        />
                        {committee.chairUsername && (
                          <button
                            onClick={() => {
                              handleCommitteeFieldChange('', committee.id);
                              setShowUserDropdown(false);
                              setFilteredUsers([]);
                              setActiveUserDropdown(null);
                              setActiveUserField(null);
                            }}
                            className="text-gray-400 hover:text-gray-600 ml-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* User Dropdown */}
                      {showUserDropdown && activeUserDropdown === committee.id && activeUserField === 'chairUsername' && filteredUsers.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                          {filteredUsers.map((user, index) => {
                            const u = user && user.user ? user.user : user;
                            return (
                              <button
                                key={u?.id || index}
                                type="button"
                                onClick={() => handleUserSelect(user)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#D9C7A1] hover:text-gray-900 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                              >
                                <div className="font-medium">@{u?.username}</div>
                                <div className="text-xs text-gray-500">{u?.fullname}</div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className="text-sm text-gray-900 w-full"
                      onClick={editingCommittee === committee.id ? () => handleCommitteeFieldEdit(committee.id, 'chairUsername') : undefined}
                    >
                      {committee.chairUsername || '-'}
                    </div>
                  )}
                </div>

                {/* Chair Name */}
                <div className="bg-gray-50 border border-gray-800 rounded-lg px-3 py-2 flex items-center">
                  <div className="text-sm text-gray-900 w-full">
                    {committee.chairName || '-'}
                  </div>
                </div>

                {/* Deputy Chair 1 Username */}
                <div className="bg-gray-50 border border-gray-800 rounded-lg px-3 py-2 flex items-center">
                  {editingCommittee === committee.id && editingCommitteeField === 'deputyChair1Username' ? (
                    <div className="bg-white px-3 py-2 text-sm rounded-md border border-gray-200 relative w-full" ref={userDropdownRef}>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                          type="text"
                          value={committee.deputyChair1Username || ''}
                          onChange={(e) => handleCommitteeFieldChange(e.target.value, committee.id)}
                          placeholder="@username"
                          className="w-full border-none outline-none text-gray-900"
                          autoFocus
                          autoComplete="off"
                        />
                        {committee.deputyChair1Username && (
                          <button
                            onClick={() => {
                              handleCommitteeFieldChange('', committee.id);
                              setShowUserDropdown(false);
                              setFilteredUsers([]);
                              setActiveUserDropdown(null);
                              setActiveUserField(null);
                            }}
                            className="text-gray-400 hover:text-gray-600 ml-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* User Dropdown */}
                      {showUserDropdown && activeUserDropdown === committee.id && activeUserField === 'deputyChair1Username' && filteredUsers.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                          {filteredUsers.map((user, index) => {
                            const u = user && user.user ? user.user : user;
                            return (
                              <button
                                key={u?.id || index}
                                type="button"
                                onClick={() => handleUserSelect(user)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#D9C7A1] hover:text-gray-900 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                              >
                                <div className="font-medium">@{u?.username}</div>
                                <div className="text-xs text-gray-500">{u?.fullname}</div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className="text-sm text-gray-900 w-full"
                      onClick={editingCommittee === committee.id ? () => handleCommitteeFieldEdit(committee.id, 'deputyChair1Username') : undefined}
                    >
                      {committee.deputyChair1Username || '-'}
                    </div>
                  )}
                </div>

                {/* Deputy Chair 1 Name */}
                <div className="bg-gray-50 border border-gray-800 rounded-lg px-3 py-2 flex items-center">
                  <div className="text-sm text-gray-900 w-full">
                    {committee.deputyChair1Name || '-'}
                  </div>
                </div>

                {/* Deputy Chair 2 Username */}
                <div className="bg-gray-50 border border-gray-800 rounded-lg px-3 py-2 flex items-center">
                  {editingCommittee === committee.id && editingCommitteeField === 'deputyChair2Username' ? (
                    <div className="bg-white px-3 py-2 text-sm rounded-md border border-gray-200 relative w-full" ref={userDropdownRef}>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                          type="text"
                          value={committee.deputyChair2Username || ''}
                          onChange={(e) => handleCommitteeFieldChange(e.target.value, committee.id)}
                          placeholder="@username"
                          className="w-full border-none outline-none text-gray-900"
                          autoFocus
                          autoComplete="off"
                        />
                        {committee.deputyChair2Username && (
                          <button
                            onClick={() => {
                              handleCommitteeFieldChange('', committee.id);
                              setShowUserDropdown(false);
                              setFilteredUsers([]);
                              setActiveUserDropdown(null);
                              setActiveUserField(null);
                            }}
                            className="text-gray-400 hover:text-gray-600 ml-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* User Dropdown */}
                      {showUserDropdown && activeUserDropdown === committee.id && activeUserField === 'deputyChair2Username' && filteredUsers.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                          {filteredUsers.map((user, index) => {
                            const u = user && user.user ? user.user : user;
                            return (
                              <button
                                key={u?.id || index}
                                type="button"
                                onClick={() => handleUserSelect(user)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#D9C7A1] hover:text-gray-900 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                              >
                                <div className="font-medium">@{u?.username}</div>
                                <div className="text-xs text-gray-500">{u?.fullname}</div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className="text-sm text-gray-900 w-full"
                      onClick={editingCommittee === committee.id ? () => handleCommitteeFieldEdit(committee.id, 'deputyChair2Username') : undefined}
                    >
                      {committee.deputyChair2Username || '-'}
                    </div>
                  )}
                </div>

                {/* Deputy Chair 2 Name */}
                <div className="bg-gray-50 border border-gray-800 rounded-lg px-3 py-2 flex items-center">
                  <div className="text-sm text-gray-900 w-full">
                    {committee.deputyChair2Name || '-'}
                  </div>
                </div>

                {/* Actions Column */}
                <div className="bg-gray-50 px-3 py-2 text-sm font-medium relative">
                  <div className="relative flex items-center justify-center space-x-3">
                    {!committee.isNew && (
                      <button
                        onClick={(e) => handleContextMenuClick(e, committee.id)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Actions"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Context Menu */}
      {showContextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed bg-gray-100 border border-black rounded-lg shadow-lg z-50 w-40"
          style={{
            left: `${contextMenuPosition.x - 100}px`,
            top: `${contextMenuPosition.y}px`,
            minWidth: '150px',
            marginTop: '0px'
          }}
        >
          <div className="py-1">
            <button
              onClick={handleEditCommittee}
              className="w-full px-4 py-2 text-left text-sm text-black hover:bg-yellow-200 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => { setShowDeleteConfirm(true); setShowContextMenu(false); }}
              className="w-full px-4 py-2 text-left text-sm text-black hover:bg-yellow-200 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={handleAddCommittee}
              className="w-full px-4 py-2 text-left text-sm text-black hover:bg-yellow-200 transition-colors"
            >
              Add Committee
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={async () => {
          await handleDeleteCommittee();
          setShowDeleteConfirm(false);
        }}
        title="Delete committee?"
        message="Are you sure you want to delete this committee from this event?"
        confirmText="Yes"
        cancelText="No"
        confirmButtonColor="text-red-600"
        isLoading={isDeleting}
        loadingText="Deleting..."
      />

      <div className="w-[925px] flex justify-between">
        <button
          onClick={handleAddCommittee}
          className={`text-white font-medium transition-colors`}
          style={{
            width: '105px',
            height: '44px',
            borderRadius: '30px',
            padding: '10px',
            gap: '10px',
            opacity: 1,
            background: isSaving ? '#bdbdbd' : '#C2A46D',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            border: 'none',
            boxShadow: 'none',
          }}
        >
          Add
        </button>
        {/* Only show Save/Update button when there's a new committee or in update mode, and not currently saving/updating */}
        {(committees.some((c: any) => c.isNew) || isUpdateMode) && !isSaving && !isUpdating && (
          <button
            onClick={isUpdateMode ? handleUpdateCommittees : handleSaveCommittees}
            className={`text-white font-medium transition-colors`}
            style={{
              width: '105px',
              height: '44px',
              borderRadius: '30px',
              padding: '10px',
              gap: '10px',
              opacity: 1,
              background: '#607DA3',
              cursor: 'pointer',
              border: 'none',
              boxShadow: 'none',
            }}
          >
            {isUpdateMode ? 'Update' : 'Save'}
          </button>
        )}
        {/* Show loading state when saving/updating */}
        {(isSaving || isUpdating) && (
          <div className="flex items-center justify-center" style={{
            width: '105px',
            height: '44px',
            borderRadius: '30px',
            background: '#bdbdbd',
            color: '#666',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {isSaving ? 'Saving...' : 'Updating...'}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommitteesPage;
