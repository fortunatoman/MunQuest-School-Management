import React, { useState, useEffect, useRef } from 'react';
import { updateOrganiserStatusApi, deleteOrganiserApi, addOrganiserBySuperUserApi } from '../../apis/Organisers';
import { toast } from 'sonner';
import { useApp } from '../../contexts/AppContext';
import { ConfirmationModal } from '../ui';
import saveIcon from '../../assets/save_icon.svg';

interface Organiser {
  id: string;
  organiser_id: string;
  username: string;
  name: string;
  academic_level: string;
  school: string;
  role_in_event: string;
  evidence: string;
  date_received: string;
  date_actioned: string;
  status: string;
}

interface OrganisersTableProps {
  organisers: Organiser[];
  onAction: (action: string, organiserId: string) => void;
  organiserType?: 'students' | 'teachers' | 'all';
}

const OrganisersTable: React.FC<OrganisersTableProps> = ({ organisers, onAction, organiserType = 'all' }) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [updatingOrganiserId, setUpdatingOrganiserId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredOrganisers, setFilteredOrganisers] = useState<any[]>([]);
  const [newOrganiser, setNewOrganiser] = useState<any>(null);
  const [userFound, setUserFound] = useState<boolean | null>(null);
  const [showUsernameDropdown, setShowUsernameDropdown] = useState<boolean>(false);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [organiserToDelete, setOrganiserToDelete] = useState<string | null>(null);
  const usernameDropdownRef = useRef<HTMLDivElement>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const { refreshUserData, allUsers } = useApp();
  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedOutsideAllDropdowns = Object.values(dropdownRefs.current).every(ref =>
        !ref || !ref.contains(event.target as Node)
      );
      if (clickedOutsideAllDropdowns) {
        setActiveDropdown(null);
      }
      if (usernameDropdownRef.current && !usernameDropdownRef.current.contains(event.target as Node)) {
        setShowUsernameDropdown(false);
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter organisers based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredOrganisers(organisers);
    } else {
      const filtered = organisers.filter((organiser: any) => {
        const searchLower = searchTerm.toLowerCase();
        const username = organiser?.users?.username || '';
        const fullname = organiser?.users?.fullname || '';
        const schoolLocation = organiser?.users?.school_location || '';
        const schoolName = organiser?.school?.name || organiser?.school || '';
        const role = organiser?.role || '';

        return (
          username.toLowerCase().includes(searchLower) ||
          fullname.toLowerCase().includes(searchLower) ||
          schoolLocation.toLowerCase().includes(searchLower) ||
          schoolName.toLowerCase().includes(searchLower) ||
          role.toLowerCase().includes(searchLower)
        );
      });
      setFilteredOrganisers(filtered);
    }
  }, [searchTerm, organisers]);

  const handleDropdownToggle = (organiserId: string) => {
    setActiveDropdown(activeDropdown === organiserId ? null : organiserId);
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    setUserFound(null);
    setShowUsernameDropdown(false);
    setFilteredUsers([]);
    setNewOrganiser({
      id: '',
      username: '',
      locality: '',
      fullname: '',
      school: '',
      role: '',
      evidence: '',
      status: 'pending',
      users: {
        id: ''
      },
      created_at: null,
      actioned_at: null
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setNewOrganiser((prev: any) => ({
      ...prev,
      [field]: value
    }));

    // If username is being changed, show dropdown and filter users
    if (field === 'username') {
      if (value.trim()) {
        setShowUsernameDropdown(true);
        setUserFound(null); // Reset user found state when typing
        filterUsersByUsername(value.trim());
      } else {
        setShowUsernameDropdown(false);
        setUserFound(null);
        setFilteredUsers([]);
        // Clear fields if username is empty
        setNewOrganiser((prev: any) => ({
          ...prev,
          fullname: '',
          locality: '',
          school: '',
          role: '',
          evidence: ''
        }));
      }
    }
  };
  // Function to filter users by username
  const filterUsersByUsername = (username: string) => {
    const organiserUserIds = new Set(organisers.map((org: any) => org.users?.id || org.id));

    const filtered = allUsers.filter(user => {
      const matchesUsername = user.username?.toLowerCase().includes(username.toLowerCase());
      const notAlreadyOrganiser = !organiserUserIds.has(user.id);

      let matchesRole = true;
      if (organiserType === 'students') {
        matchesRole = user.role === 'student';
      } else if (organiserType === 'teachers') {
        matchesRole = user.role === 'teacher';
      }

      return matchesUsername && notAlreadyOrganiser && matchesRole;
    });

    setFilteredUsers(filtered);
  };

  const handleUsernameSelect = (selectedUser: any) => {

    setNewOrganiser((prev: any) => ({
      ...prev,
      user_id: selectedUser.id || '',
      school_id: selectedUser.school_id || '',
      locality_id: selectedUser.school.locality_id || '',
      username: selectedUser.username || '',
      fullname: selectedUser.fullname || '',
      locality: selectedUser.school.code || '',
      school: selectedUser.school?.name || '',
      role: selectedUser.role_in_event || selectedUser.role || '',
      evidence: selectedUser.evidence || 'Internal',
      users: {
        id: selectedUser.id || ''
      },
      ...(organiserType === 'students'
        ? { grade: selectedUser.grade || '' }
        : { years_of_experience: selectedUser.years_of_experience || '' }
      )
    }));

    setUserFound(true);
    setShowUsernameDropdown(false);
    setFilteredUsers([]);
  };


  const handleSaveNew = async () => {
    try {
      if (!newOrganiser.username || !newOrganiser.fullname || !newOrganiser.school) {
        toast.error('Please fill in all required fields (Username, Name, School)');
        return;
      }

      setIsSaving(true);
      const actioned_by_user_id = localStorage.getItem('userId');
      const response = await addOrganiserBySuperUserApi(
        newOrganiser.user_id || '',
        newOrganiser.school_id || '',
        newOrganiser.locality_id || '',
        newOrganiser.role,
        newOrganiser.evidence,
        'pending',
        actioned_by_user_id || ''
      );

      if (response.success) {
        toast.success('New organiser added successfully!');
        setIsAddingNew(false);
        setUserFound(null);
        setShowUsernameDropdown(false);
        setFilteredUsers([]);
        setNewOrganiser({
          id: '',
          username: '',
          fullname: '',
          locality: '',
          school: '',
          role: '',
          evidence: '',
          status: 'pending',
          users: {
            id: ''
          },
          created_at: null,
          actioned_at: null
        });

        await refreshUserData();

      } else {
        toast.error(response.message || 'Failed to save new organiser');
      }
    } catch (error: any) {
      console.log('Error saving new organiser:', error);
      toast.error(error.message || 'Failed to save new organiser');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (organiserId: string) => {
    setOrganiserToDelete(organiserId);
    setShowDeleteModal(true);
    setActiveDropdown(null);
  };

  const handleDeleteConfirm = async () => {
    if (!organiserToDelete) return;
    setShowDeleteModal(false);

    setUpdatingOrganiserId(organiserToDelete);
    try {
      const response = await deleteOrganiserApi(organiserToDelete);
      if (response.success) {
        toast.success(response.message);
        await refreshUserData();
        onAction('delete', organiserToDelete);
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      console.log('Error deleting organiser:', error);
      toast.error(error.message);
    } finally {
      setUpdatingOrganiserId(null);
      setOrganiserToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setOrganiserToDelete(null);
  };

  const handleAction = async (action: string, organiserId: string) => {
    setUpdatingOrganiserId(organiserId);
    try {
      const response = await updateOrganiserStatusApi(organiserId, action);
      if (response.success) {
        toast.success(response.message);
        await refreshUserData();
      } else {
        toast.error(response.message);
      }
      onAction(action, organiserId);
    } catch (error) {
      console.log('Error updating organiser status:', error);
      toast.error('Failed to update organiser status');
    } finally {
      setUpdatingOrganiserId(null);
    }
    setActiveDropdown(null);
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'text-gray-600';

    switch (status.toLowerCase()) {
      case 'approved':
        return 'text-green-600';
      case 'pending':
        return 'text-orange-500';
      case 'rejected':
        return 'text-red-600';
      case 'flagged':
        return 'text-yellow-500';
      case 'blocked':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div>
      {/* Search Input */}
      <div className="mb-4" style={{ display: 'none' }}>
        <input
          type="text"
          placeholder="Search organisers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Header Row */}
      <div className="grid grid-cols-12 gap-2 mb-2">
        {['UserID', 'Organiser ID', 'Username', 'Name', organiserType === 'students' ? 'Academic Level' : 'Teaching Experience', 'School', 'Role in Event', 'Evidence', 'Date Received', 'Date Actioned', 'Status', ' '].map((header, index) => (
          header === ' ' ? (
            <div key={header}>
            </div>
          ) : (
            <div
              key={header}
              className={`px-3 py-2 text-xs font-medium text-gray-900 uppercase tracking-wider rounded-md ${index < 4
                ? 'bg-[#F0F7FF] border border-[#4A5F7A] flex items-center justify-between'
                : 'bg-[#F0F7FF] border border-[#4A5F7A] flex items-center'
                }`}
            >
              <span>{header}</span>
              {index < 4 && (
                <svg className="w-3 h-3 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </div>
          )
        )
        )}

      </div>

      {/* Data Rows */}
      {filteredOrganisers.length === 0 && !isAddingNew ? (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No organisers found matching your search' : 'No organisers found'}
        </div>
      ) : filteredOrganisers.length > 0 ? (
        filteredOrganisers.map((organiser: any) => (
          <div key={organiser?.id || Math.random()} className={`grid grid-cols-12 gap-2 mb-2 ${updatingOrganiserId === organiser?.id ? 'opacity-60 pointer-events-none' : ''}`}>
            {/* User ID */}
            <div className="bg-white px-3 py-2 text-sm font-medium text-gray-900 rounded-md border border-gray-200 flex items-center justify-center">
              {organiser?.users.id.split('-')[0] || 'N/A'}
            </div>
            {/* Organiser ID */}
            <div className="bg-white px-3 py-2 text-sm font-medium text-gray-900 rounded-md border border-gray-200 flex items-center justify-center">
              {organiser?.id.split('-')[0] || 'N/A'}
            </div>

            {/* Username */}
            <div className="w-full break-words bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200 flex items-center justify-center">
              {organiser?.users.username || 'N/A'}
            </div>

            {/* Name */}
            <div className="w-full break-words bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200 flex items-center justify-center">
              {organiser?.users.fullname || 'N/A'}
            </div>

            {/* Academic Level/Teaching Experience */}
            <div className="w-full break-words bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200 flex items-center justify-center">
              {organiserType === 'students'
                ? (organiser?.users?.grade || 'N/A')
                : (organiser?.users?.years_of_experience || 'N/A')
              }
            </div>

            {/* School */}
            <div className="w-full break-words bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200 flex items-center justify-center">
              {organiser?.school?.name || organiser?.school || 'N/A'}
            </div>

            {/* Role in Event */}
            <div className="w-full break-words bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200 flex items-center justify-center">
              {organiser?.role || 'N/A'}
            </div>

            {/* Evidence */}
            <div className="w-full break-words bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200 flex items-center justify-center">
              {organiser?.evidence ? (
                typeof organiser.evidence === 'object' && organiser.evidence.file_url ? (
                  <div className="flex items-center justify-center">
                    {
                      organiser.evidence.file_url === "Internal" ? (
                        <span>{organiser.evidence.file_url}</span>
                      ) : (
                        <button
                          onClick={() => window.open(organiser.evidence.file_url, '_blank')}
                          className="flex flex-wrap items-center justify-center p-1 rounded hover:bg-gray-100 transition-colors duration-200"
                          title="Click to open document"
                          disabled={updatingOrganiserId === organiser?.id}
                        >
                          Document
                          <svg className="w-5 h-5 text-blue-600 hover:text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      )
                    }
                  </div>
                ) : (
                  <span>{typeof organiser.evidence === 'string' ? organiser.evidence : 'Document'}</span>
                )
              ) : (
                'N/A'
              )}
            </div>

            {/* Date Received */}
            <div className="w-full break-words bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200 flex items-center justify-center">
              {organiser?.created_at?.split('T')[0] || 'N/A'}
            </div>

            {/* Date Actioned */}
            <div className="w-full break-words bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200 flex items-center justify-center">
              {organiser?.actioned_at?.split('T')[0] || 'N/A'}
            </div>

            {/* Status */}
            <div className="bg-white px-3 py-2 text-sm rounded-md border border-gray-200 flex items-center justify-center">
              {updatingOrganiserId === organiser?.id ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  <span className="text-gray-500">Deleting...</span>
                </div>
              ) : (
                <span className={`font-medium ${getStatusColor(organiser?.status)}`}>
                  {organiser?.status || 'N/A'}
                </span>
              )}
            </div>

            {/* Actions */}
            <div ref={(el) => { dropdownRefs.current[organiser?.id || ''] = el; }} className="px-3 py-2 text-sm font-medium relative">
              <div className="relative">
                {updatingOrganiserId === organiser?.id ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleDropdownToggle(organiser?.id || '')}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>

                    {activeDropdown === organiser?.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                        <div className="py-1">
                          {/* Show Approve button only if status is not approved */}
                          {organiser?.status?.toLowerCase() !== 'approved' && (
                            <button
                              onClick={() => handleAction('approved', organiser?.id || '')}
                              disabled={updatingOrganiserId === organiser?.id}
                              className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingOrganiserId === organiser?.id
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-[#D9C7A1] hover:text-gray-900'
                                }`}
                            >
                              Approve
                            </button>
                          )}

                          {/* Show Reject button only if status is not rejected */}
                          {organiser?.status?.toLowerCase() !== 'rejected' && (
                            <button
                              onClick={() => handleAction('rejected', organiser?.id || '')}
                              disabled={updatingOrganiserId === organiser?.id}
                              className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingOrganiserId === organiser?.id
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-[#D9C7A1] hover:text-gray-900'
                                }`}
                            >
                              Reject
                            </button>
                          )}

                          {/* Show Flag button only if status is not flagged */}
                          {organiser?.status?.toLowerCase() !== 'flagged' && (
                            <button
                              onClick={() => handleAction('flagged', organiser?.id || '')}
                              disabled={updatingOrganiserId === organiser?.id}
                              className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingOrganiserId === organiser?.id
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-[#D9C7A1] hover:text-gray-900'
                                }`}
                            >
                              Flag
                            </button>
                          )}

                          {/* Show Block button only if status is not blocked */}
                          {organiser?.status?.toLowerCase() !== 'blocked' && (
                            <button
                              onClick={() => handleAction('blocked', organiser?.id || '')}
                              disabled={updatingOrganiserId === organiser?.id}
                              className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingOrganiserId === organiser?.id
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-[#D9C7A1] hover:text-gray-900'
                                }`}
                            >
                              Block
                            </button>
                          )}

                          {/* Show Activate button if status is flagged or blocked */}
                          {(organiser?.status?.toLowerCase() === 'flagged' || organiser?.status?.toLowerCase() === 'blocked') && (
                            <button
                              onClick={() => handleAction('approved', organiser?.id || '')}
                              disabled={updatingOrganiserId === organiser?.id}
                              className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingOrganiserId === organiser?.id
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-[#D9C7A1] hover:text-gray-900'
                                }`}
                            >
                              Activate
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteClick(organiser?.id || '')}
                            disabled={updatingOrganiserId === organiser?.id}
                            className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingOrganiserId === organiser?.id
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-gray-700 hover:bg-[#D9C7A1] hover:text-gray-900'
                              }`}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))
      ) : null}

      {/* New Organiser Input Row */}
      {isAddingNew && (
        <div className={`grid grid-cols-12 gap-2 mb-2 ${isSaving ? 'opacity-60 pointer-events-none' : ''}`}>
          {/*User ID */}
          <div className="bg-white px-3 py-2 text-sm rounded-md border border-gray-200">
            <input
              type="text"
              value={newOrganiser.users?.id?.split('-')[0]}
              placeholder="Auto populated"
              className="w-full border-none outline-none text-sm"
              disabled
            />
          </div>
          {/* Organiser ID */}
          <div className="bg-white px-3 py-2 text-sm rounded-md border border-gray-200">
            <input
              type="text"
              value={newOrganiser.organiser_id || "N/A"}
              placeholder="Auto populated"
              className="w-full border-none outline-none text-sm"
              disabled
            />
          </div>

          {/* Username */}
          <div
            ref={usernameDropdownRef}
            className={`px-3 py-2 text-sm rounded-md border relative ${userFound === true ? 'bg-green-50 border-green-300' :
              userFound === false ? 'bg-red-50 border-red-300' :
                'bg-white border-gray-200'
              }`}
          >
            <div className="flex items-center">
              <input
                type="text"
                value={newOrganiser.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                onFocus={() => {
                  if (newOrganiser.username.trim()) {
                    setShowUsernameDropdown(true);
                    filterUsersByUsername(newOrganiser.username.trim());
                  }
                }}
                placeholder="Enter username to populate fields"
                className="w-full border-none outline-none text-sm bg-transparent"
                autoComplete="off"
                disabled={isSaving}
              />
              {userFound === true && (
                <svg className="w-4 h-4 text-green-600 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {userFound === false && (
                <svg className="w-4 h-4 text-red-600 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>

            {/* Username Dropdown */}
            {showUsernameDropdown && filteredUsers.length > 0 && !isSaving && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                {filteredUsers.map((user, index) => (
                  <div
                    key={user.id || index}
                    onClick={() => handleUsernameSelect(user)}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{user.username}</div>
                    <div className="text-xs text-gray-500">{user.fullname}</div>
                    <div className="text-xs text-gray-400">
                      {user.school?.name || user.school_name || user.schoolName || user.school || 'No school'} • {user.locality?.name || user.school_location || user.locality || 'No location'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showUsernameDropdown && filteredUsers.length === 0 && newOrganiser.username.trim() && !isSaving && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50">
                <div className="px-3 py-2 text-sm text-gray-500">
                  No available users found
                </div>
              </div>
            )}
          </div>

          {/* Name */}
          <div className="bg-white px-3 py-2 text-sm rounded-md border border-gray-200">
            <input
              type="text"
              value={newOrganiser.fullname}
              disabled
              placeholder="Auto populated"
              className="w-full border-none outline-none text-sm"
            />
          </div>

          {/* Grade/Teaching Experience */}
          <div className="bg-white px-3 py-2 text-sm rounded-md border border-gray-200">
            <input
              type="text"
              value={organiserType === 'students' ? (newOrganiser.grade || '') : (newOrganiser.years_of_experience || '')}
              disabled
              placeholder="Auto populated"
              className="w-full border-none outline-none text-sm"
            />
          </div>

          {/* School */}
          <div className="bg-white px-3 py-2 text-sm rounded-md border border-gray-200">
            <input
              type="text"
              value={newOrganiser.school}
              disabled
              placeholder="Auto populated"
              className="w-full border-none outline-none text-sm"
            />
          </div>

          {/* Role in Event */}
          <div className="bg-white px-3 py-2 text-sm rounded-md border border-gray-200">
            <input
              type="text"
              value={newOrganiser.role}
              disabled
              placeholder="Auto populated"
              className="w-full border-none outline-none text-sm"
            />
          </div>

          {/* Evidence */}
          <div className="bg-white px-3 py-2 text-sm rounded-md border border-gray-200">
            <input
              type="text"
              value={newOrganiser.evidence}
              disabled
              placeholder="Auto populated"
              className="w-full border-none outline-none text-sm"
            />
          </div>

          {/* Date Received */}
          <div className="bg-white px-3 py-2 text-sm rounded-md border border-gray-200">
            <input
              type="text"
              value={newOrganiser.created_at?.split('T')[0] || 'N/A'}
              className="w-full border-none outline-none text-sm"
              disabled
            />
          </div>

          {/* Date Actioned */}
          <div className="bg-white px-3 py-2 text-sm rounded-md border border-gray-200">
            <input
              type="text"
              value={newOrganiser.actioned_at?.split('T')[0] || 'N/A'}
              className="w-full border-none outline-none text-sm"
              disabled
            />
          </div>

          {/* Status */}
          <div className="bg-white px-3 py-2 text-sm rounded-md border border-gray-200">
            {isSaving ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                <span className="text-gray-500">Saving...</span>
              </div>
            ) : (
              <span className="font-medium text-orange-500">Pending</span>
            )}
          </div>

          {/* Actions */}
          <div className="px-3 py-2 text-sm font-medium relative">
            {isSaving ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className="flex space-x-2">
                <img src={saveIcon} alt="Save" className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add and Save Buttons */}
      <div className="flex justify-start space-x-4 mt-6">
        <button
          onClick={handleAddNew}
          disabled={isAddingNew || isSaving}
          className={`bg-[#C2A46D] text-white font-medium rounded-[30px] w-[105px] h-[44px] px-[10px] py-[10px] mr-[10px] transition-colors duration-200 ${isAddingNew || isSaving
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-[#9a7849]'
            }`}
        >
          Add
        </button>
        <button
          onClick={handleSaveNew}
          disabled={!isAddingNew || isSaving}
          className={`bg-[#C2A46D] text-white font-medium rounded-[30px] w-[105px] h-[44px] px-[10px] py-[10px] transition-colors duration-200 flex items-center justify-center ${!isAddingNew || isSaving
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-[#b89a6a]'
            }`}
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              <span>Saving...</span>
            </>
          ) : (
            'Save'
          )}
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Confirm Delete"
        message="Are you sure you want to delete this organiser? This action cannot be undone."
        confirmText="Yes"
        cancelText="No"
        confirmButtonColor="text-red-600"
      />
    </div>
  );
};

export default OrganisersTable;
