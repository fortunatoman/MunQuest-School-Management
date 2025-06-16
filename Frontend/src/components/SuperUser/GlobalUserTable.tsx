import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useApp } from '../../contexts/AppContext';
import { removeSuperUserInviteApi, sendSuperUserInviteApi, updateUserStatusApi } from '../../apis/Users';
import { ConfirmationModal } from '../ui';
import OrganiserIcon from '../../assets/organiser_icon.svg';
import { assignOrganiserToSchoolApi, removeOrganiserFromSchoolApi } from '../../apis/Organisers';

interface GlobalUser {
  id: string;
  username: string;
  fullname: string;
  global_role: string;
  school: any;
  mun_experience?: string;
  grade?: string;
  years_of_experience?: string;
  created_at?: string;
  updated_at?: string;
}

interface GlobalUserTableProps {
  users: GlobalUser[];
  onAction: (action: string, username: string, email: string) => void;
  userType?: 'students' | 'teachers';
  isSuperUser?: boolean;
}

const GlobalUserTable: React.FC<GlobalUserTableProps> = ({ users, onAction, isSuperUser = false }) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<{ username: string, email: string } | null>(null);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [showInviteForm, setShowInviteForm] = useState<boolean>(false);
  const [inviteName, setInviteName] = useState<string>('');
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSendingInvite, setIsSendingInvite] = useState<boolean>(false);
  const [showNameDropdown, setShowNameDropdown] = useState<boolean>(false);
  const [showEmailDropdown, setShowEmailDropdown] = useState<boolean>(false);
  const [filteredUsersForName, setFilteredUsersForName] = useState<any[]>([]);
  const [filteredUsersForEmail, setFilteredUsersForEmail] = useState<any[]>([]);
  const { refreshUserData, allOrganisers, allUsers } = useApp();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const nameDropdownRef = useRef<HTMLDivElement>(null);
  const emailDropdownRef = useRef<HTMLDivElement>(null);
  
  // Pagination state (match SchoolsTable styling/behavior)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(7);

  // Helper function to check if user is an organizer
  const isUserOrganiser = (userId: string) => {
    return allOrganisers.some((organiser: any) => organiser.userid === userId);
  };

  // Helper function to get user status color
  const getUserStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'text-green-600';
      case 'flagged':
        return 'text-yellow-600';
      case 'blocked':
        return 'text-red-600';
      case 'deleted':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Filter users based on search term and superuser role
  useEffect(() => {
    let filteredByRole = users;
    // If this is the superuser tab, only show users with global_role "superuser"
    if (isSuperUser) {
      filteredByRole = users.filter((user: any) => user?.global_role === 'superuser');
    }

    if (!searchTerm.trim()) {
      setFilteredUsers(filteredByRole);
    } else {
      const filtered = filteredByRole.filter((user: any) => {
        const searchLower = searchTerm.toLowerCase();
        const username = user?.username || '';
        const fullname = user?.fullname || '';
        const schoolLocation = user?.school?.code || '';
        const schoolName = user?.school?.name || '';
        const role = user?.global_role || '';

        return (
          username.toLowerCase().includes(searchLower) ||
          fullname.toLowerCase().includes(searchLower) ||
          schoolLocation.toLowerCase().includes(searchLower) ||
          schoolName.toLowerCase().includes(searchLower) ||
          role.toLowerCase().includes(searchLower)
        );
      });
      setFilteredUsers(filtered);
    }
    // Reset to first page when filters/source change
    setCurrentPage(1);
  }, [searchTerm, users, isSuperUser]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
      if (nameDropdownRef.current && !nameDropdownRef.current.contains(event.target as Node)) {
        setShowNameDropdown(false);
      }
      if (emailDropdownRef.current && !emailDropdownRef.current.contains(event.target as Node)) {
        setShowEmailDropdown(false);
      }
    };

    if (activeDropdown || showNameDropdown || showEmailDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown, showNameDropdown, showEmailDropdown]);

  const handleDropdownToggle = (userId: string) => {
    setActiveDropdown(activeDropdown === userId ? null : userId);
  };

  // Filter users for name dropdown
  const filterUsersForName = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredUsersForName([]);
      return;
    }

    const filtered = allUsers.filter((user: any) => {
      // Exclude users who are already superusers
      if (user?.global_role === 'superuser') {
        return false;
      }

      const searchLower = searchTerm.toLowerCase();
      const username = user?.username || '';
      const fullname = user?.fullname || '';

      return (
        username.toLowerCase().includes(searchLower) ||
        fullname.toLowerCase().includes(searchLower)
      );
    });

    setFilteredUsersForName(filtered.slice(0, 5)); // Limit to 5 suggestions
  };

  // Filter users for email dropdown
  const filterUsersForEmail = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredUsersForEmail([]);
      return;
    }

    const filtered = allUsers.filter((user: any) => {
      // Exclude users who are already superusers
      if (user?.global_role === 'superuser') {
        return false;
      }

      const searchLower = searchTerm.toLowerCase();
      const email = user?.email || '';
      const username = user?.username || '';

      return (
        email.toLowerCase().includes(searchLower) ||
        username.toLowerCase().includes(searchLower)
      );
    });

    setFilteredUsersForEmail(filtered.slice(0, 5)); // Limit to 5 suggestions
  };

  // Handle name input change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isSendingInvite) return;
    const value = e.target.value;
    setInviteName(value);
    filterUsersForName(value);
    setShowNameDropdown(value.trim().length > 0);
  };

  // Handle email input change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isSendingInvite) return;
    const value = e.target.value;
    setInviteEmail(value);
    filterUsersForEmail(value);
    setShowEmailDropdown(value.trim().length > 0);
  };

  // Handle user selection from name dropdown
  const handleNameSelect = (user: any) => {
    setInviteName(user.fullname || user.username);
    setInviteEmail(user.email || '');
    setShowNameDropdown(false);
    setFilteredUsersForName([]);
  };

  // Handle user selection from email dropdown
  const handleEmailSelect = (user: any) => {
    setInviteEmail(user.email || user.username);
    setInviteName(user.fullname || user.username);
    setShowEmailDropdown(false);
    setFilteredUsersForEmail([]);
  };

  // Delete confirmation handlers
  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      try {
        if (isSuperUser) {
          // For superusers section, use the original handleAction
          await handleAction('delete', userToDelete.username, userToDelete.email);
        } else {
          // For users section, use updateUserStatusApi for delete
          setUpdatingUserId(userToDelete.username);
          const response = await updateUserStatusApi(userToDelete.username, 'delete');
          if (response.success) {
            toast.success(response.message);
            await refreshUserData();
            onAction('delete', userToDelete.username, userToDelete.email);
          } else {
            toast.error(response.message);
          }
        }
      } catch (error) {
        console.log('Error deleting user:', error);
        toast.error('Failed to delete user');
      } finally {
        setUpdatingUserId(null);
        setShowDeleteModal(false);
        setUserToDelete(null);
      }
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleSendInvite = async () => {
    if (!inviteName.trim() || !inviteEmail.trim()) {
      toast.error('Please fill in both name and email fields');
      return;
    }

    setIsSendingInvite(true);
    try {
      const response = await sendSuperUserInviteApi(inviteName, inviteEmail);
      if (response.success) {
        toast.success(response.message);
        await refreshUserData();
        setInviteName('');
        setInviteEmail('');
        setShowInviteForm(false);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.log('Error sending invite:', error);
      toast.error('Failed to send invitation');
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleAction = async (action: string, username: string, email: string) => {
    setActiveDropdown(null); // Close dropdown immediately when action is triggered
    try {
      if (action === 'delete') {
        const response = await removeSuperUserInviteApi(username, email);
        if (response.success) {
          toast.success(response.message);
          await refreshUserData();
        } else {
          toast.error(response.message);
        }
      } else {
        setUpdatingUserId(username);
        const response = await updateUserStatusApi(username, action);
        if (response.success) {
          toast.success(response.message);
          await refreshUserData();
        } else {
          toast.error(response.message);
        }
      }
      onAction(action, username, email);
      setIsLoading(false);
    } catch (error) {
      console.log('Error updating user:', error);
      toast.error('Failed to update user');
    } finally {
      setUpdatingUserId(null);
      setIsLoading(false);
    }
  };

  const handleUserSectionAction = async (action: string, userId: string, email: string) => {
    try {
      if (action === 'delete') {
        setUserToDelete({ username: userId, email: email });
        setShowDeleteModal(true);
      } else {
        setUpdatingUserId(userId);
        const response = await updateUserStatusApi(userId, action);
        if (response.success) {
          toast.success(response.message);
          await refreshUserData();
          onAction(action, userId, email);
        } else {
          toast.error(response.message);
        }
      }
      setIsLoading(false);
      setActiveDropdown(null);
    } catch (error) {
      console.log('Error updating user:', error);
      toast.error('Failed to update user');
    } finally {
      setUpdatingUserId(null);
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Search Input */}
      <div className="mb-4" style={{ display: 'none' }}>
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Header Row */}
      <div className={`grid gap-2 mb-2 ${isSuperUser ? 'grid-cols-12' : 'grid-cols-10'}`}>
        {(isSuperUser ? [
          { label: 'UserID', span: 'col-span-1' },
          { label: 'Username', span: 'col-span-1' },
          { label: 'Name', span: 'col-span-2' },
          { label: 'Email', span: 'col-span-3' },
          { label: 'Global Role', span: 'col-span-1' },
          { label: ' ', span: 'col-span-1' }
        ] : [
          { label: 'Student ID', span: 'col-span-1' },
          { label: 'Username', span: 'col-span-1' },
          { label: 'Name', span: 'col-span-1' },
          { label: 'Email', span: 'col-span-1' },
          { label: 'Academic Level', span: 'col-span-1' },
          { label: 'School', span: 'col-span-1' },
          { label: 'MUN Experience', span: 'col-span-1' },
          { label: 'Global Role', span: 'col-span-1' },
          { label: 'User Status', span: 'col-span-1' },
          { label: ' ', span: 'col-span-1' }
        ]).map((header, index) => (
          header.label === ' ' ? (
            <div key={header.label} className={header.span}>
            </div>
          ) : (
            <div
              key={header.label}
              className={`${header.span} px-3 py-2 text-xs font-medium text-gray-900 uppercase tracking-wider rounded-md ${index < (isSuperUser ? 4 : 8)
                ? 'bg-[#C6DAF4] border border-[#4A5F7A] flex items-center justify-between'
                : 'bg-[#C6DAF4] border border-[#4A5F7A] flex items-center'
                }`}
            >
              <span>{header.label}</span>
              {index < (isSuperUser ? 4 : 8) && (
                <svg className="w-3 h-3 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </div>
          )
        ))}

      </div>

      {/* Data Rows */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No users found matching your search' : 'No users found'}
        </div>
      ) : filteredUsers.length > 0 ? (
        currentUsers.map((user: any) => (
          <div key={user?.id || Math.random()} className={`grid gap-2 mb-2 ${isSuperUser ? 'grid-cols-12' : 'grid-cols-10'}`}>
            {isSuperUser ? (
              // Superusers section columns
              <>
                {/* User ID */}
                <div className="col-span-1 bg-white px-3 py-2 text-sm font-medium text-gray-900 rounded-md border border-gray-200">
                  {user?.id?.split('-')[0] || 'N/A'}
                </div>

                {/* Username */}
                <div className="col-span-1 bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200">
                  {user?.username || 'N/A'}
                </div>

                {/* Name */}
                <div className="col-span-2 bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200">
                  {user?.fullname || 'N/A'}
                </div>

                {/* Email */}
                <div className="col-span-3 bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200">
                  {user?.email || 'N/A'}
                </div>

                {/* Global Role */}
                <div className="col-span-1 bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200">
                  {user?.global_role || 'N/A'}
                </div>
              </>
            ) : (
              // Users section columns
              <>
                {/* Student ID */}
                <div className="col-span-1 bg-white px-3 py-2 text-sm font-medium text-gray-900 rounded-md border border-gray-200">
                  {user?.student_id || user?.id?.split('-')[0] || 'N/A'}
                </div>

                {/* Username */}
                <div className="col-span-1 bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200">
                  {user?.username ? `@${user.username}` : 'N/A'}
                </div>

                {/* Name */}
                <div className="col-span-1 bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200">
                  {user?.fullname || 'N/A'}
                </div>

                {/* Email */}
                <div className="col-span-1 bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200 break-words">
                  {user?.email || 'N/A'}
                </div>

                {/* Academic Level */}
                <div className="col-span-1 bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200">
                  {user?.academic_level || user?.grade || 'N/A'}
                </div>

                {/* School */}
                <div className="col-span-1 bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200 break-words">
                  {user?.school?.name || 'N/A'}
                </div>

                {/* MUN Experience */}
                <div className="col-span-1 bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200">
                  {user?.mun_experience || user?.years_of_experience || 'N/A'}
                </div>

                {/* Global Role */}
                <div className="col-span-1 bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200">
                  {user?.global_role === 'superuser' ? 'Super User' : 'User'}
                </div>

                {/* User Status */}
                <div className="col-span-1 bg-white px-3 py-2 text-sm rounded-md border border-gray-200">
                  <span className={`font-medium ${getUserStatusColor(user?.user_status || user?.status || 'active')}`}>
                    {user?.user_status || user?.status || 'Active'}
                  </span>
                </div>
              </>
            )}

            {/* Actions */}
            {loadingId === user?.id && isLoading ? (
              <div className="col-span-1 px-3 py-2 text-sm font-medium relative">
                <div className="relative flex items-center justify-left">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                </div>
              </div>
            ) : (
              <div className="col-span-1 px-3 py-2 text-sm font-medium relative" >
                <div className="relative flex items-center justify-left">
                  {isUserOrganiser(user?.id) && (
                    <div className="ml-2">
                      <img
                        src={OrganiserIcon}
                        alt="Organiser"
                        className="w-5 h-5"
                        title="This user is an organizer"
                      />
                    </div>
                  )}
                  <button
                    onClick={() => handleDropdownToggle(user?.id || '')}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>

                  {activeDropdown === user?.id && (
                    <div ref={dropdownRef} className="absolute top-full right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-50 border-2">
                      <div className="py-1">
                        {isSuperUser ? (
                          // Superusers section menu options
                          <button
                            onClick={() => {
                              setActiveDropdown(null); // Close dropdown when delete modal is triggered
                              setUserToDelete({ username: user?.username || '', email: user?.email || '' });
                              setShowDeleteModal(true);
                            }}
                            disabled={updatingUserId === user?.id}
                            className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingUserId === user?.id
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-gray-700 hover:bg-[#C6DAF4] hover:text-gray-900'
                              }`}
                          >
                            Remove Super User
                          </button>
                        ) : (
                          // Regular Users section menu options - dynamic based on current status
                          <>
                            {
                              !isUserOrganiser(user?.id) ? (
                                <button
                                  onClick={async () => {
                                    setActiveDropdown(null);
                                    setIsLoading(true);
                                    setLoadingId(user?.id);
                                    const response = await assignOrganiserToSchoolApi(user?.id);
                                    if (response.success) {
                                      onAction('assign-organiser', user?.id, user?.email);
                                      toast.success(response.message);
                                      setLoadingId(null);
                                      setIsLoading(false)
                                      await refreshUserData();
                                      await refreshUserData();
                                    } else {
                                      toast.error(response.message);
                                      setLoadingId(null);
                                      setIsLoading(false)
                                    }
                                  }}
                                  disabled={updatingUserId === user?.id}
                                  className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingUserId === user?.id
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-gray-700 hover:bg-[#C6DAF4] hover:text-gray-900'
                                    }`}
                                >
                                  Assign Organiser
                                </button>
                              ) : (
                                <button
                                  onClick={async () => {
                                    setActiveDropdown(null);
                                    setIsLoading(true);
                                    setLoadingId(user?.id);
                                    const response = await removeOrganiserFromSchoolApi(user?.id);
                                    if (response.success) {
                                      toast.success(response.message);
                                      setLoadingId(null);
                                      setIsLoading(false)
                                      await refreshUserData();
                                      onAction('remove-organiser', user?.id, user?.email);
                                      await refreshUserData();
                                    } else {
                                      toast.error(response.message);
                                      setLoadingId(null);
                                      setIsLoading(false)
                                    }
                                  }}
                                  disabled={updatingUserId === user?.id}
                                  className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingUserId === user?.id
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-gray-700 hover:bg-[#C6DAF4] hover:text-gray-900'
                                    }`}
                                >
                                  Remove Organiser
                                </button>
                              )
                            }

                            {/* Show Active option if user is flagged or blocked */}
                            {(user?.user_status?.toLowerCase() === 'flagged' || user?.user_status?.toLowerCase() === 'blocked') && (
                              <button
                                onClick={() => {
                                  setActiveDropdown(null);
                                  setIsLoading(true);
                                  setLoadingId(user?.id);
                                  handleUserSectionAction('active', user?.id, user?.email);
                                }}
                                disabled={updatingUserId === user?.id}
                                className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingUserId === user?.id
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'text-gray-700 hover:bg-[#C6DAF4] hover:text-gray-900'
                                  }`}
                              >
                                Active
                              </button>
                            )}

                            {/* Show Flag option if user is not already flagged */}
                            {user?.user_status?.toLowerCase() !== 'flagged' && (
                              <button
                                onClick={() => {
                                  setActiveDropdown(null);
                                  setIsLoading(true);
                                  setLoadingId(user?.id);
                                  handleUserSectionAction('flagged', user?.id, user?.email);
                                }}
                                disabled={updatingUserId === user?.id}
                                className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingUserId === user?.id
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'text-gray-700 hover:bg-[#C6DAF4] hover:text-gray-900'
                                  }`}
                              >
                                Flag
                              </button>
                            )}

                            {/* Show Block option if user is not already blocked */}
                            {user?.user_status?.toLowerCase() !== 'blocked' && (
                              <button
                                onClick={() => {
                                  setActiveDropdown(null);
                                  setIsLoading(true);
                                  setLoadingId(user?.id);
                                  handleUserSectionAction('blocked', user?.id, user?.email);
                                }}
                                disabled={updatingUserId === user?.id}
                                className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingUserId === user?.id
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'text-gray-700 hover:bg-[#C6DAF4] hover:text-gray-900'
                                  }`}
                              >
                                Block
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setActiveDropdown(null);
                                setUserToDelete({ username: user?.username || '', email: user?.email || '' });
                                setShowDeleteModal(true);
                              }}
                              disabled={updatingUserId === user?.id}
                              className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingUserId === user?.id
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-[#C6DAF4] hover:text-gray-900'
                                }`}
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => {
                                setActiveDropdown(null);
                                setIsLoading(true);
                                setLoadingId(user?.id);
                                handleUserSectionAction('invite', user?.id, user?.email);
                                console.log('Invite non-user:', user?.id);
                              }}
                              disabled={updatingUserId === user?.id}
                              className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingUserId === user?.id
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-[#C6DAF4] hover:text-gray-900'
                                }`}
                            >
                              Invite Non-user
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))
      ) : null}

      {/* Pagination Controls */}
      {filteredUsers.length > 0 && (
        <div className="flex items-center justify-between mt-6 px-4">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} {isSuperUser ? 'users' : (isSuperUser ? 'users' : 'users')}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md border ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
              }`}
            >
              Previous
            </button>
            
            {/* Page Numbers */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded-md border ${
                        currentPage === page
                          ? 'bg-[#C2A46D] text-white border-[#C2A46D]'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  (page === currentPage - 2 && page > 1) ||
                  (page === currentPage + 2 && page < totalPages)
                ) {
                  return <span key={page} className="px-2 text-gray-400">...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md border ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Invite Superuser Section - Only show for Superusers section */}
      {isSuperUser && (
        <div className="mt-6">
          <button
            onClick={() => {
              setShowInviteForm(!showInviteForm);
              if (!showInviteForm) {
                // Reset form when opening
                setInviteName('');
                setInviteEmail('');
                setIsSendingInvite(false);
              }
            }}
            className="px-6 py-3 bg-[#C4A35A] hover:bg-[#B8973F] text-white font-medium rounded-[20px] transition-colors duration-200 shadow-md"
          >
            Invite a Superuser
          </button>

          {/* Invite Form */}
          {showInviteForm && (
            <div className="mt-6 p-6 max-w-md flex items-end justify-between">
              <div>
                {/* Name Field */}
                <div className="mb-4 relative" ref={nameDropdownRef}>
                  <label htmlFor="invite-name" className="block text-sm font-semibold text-gray-900 mb-2">
                    Name
                  </label>
                  <input
                    id="invite-name"
                    type="text"
                    value={inviteName}
                    onChange={handleNameChange}
                    placeholder="E.g. Ivy Grace Turner"
                    disabled={isSendingInvite}
                    className={`w-full px-4 py-2 border border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C4A35A] focus:border-transparent text-gray-700 ${isSendingInvite ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                  />

                  {/* Name Dropdown */}
                  {showNameDropdown && filteredUsersForName.length > 0 && !isSendingInvite && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-hidden">
                      <div className="max-h-48 overflow-y-auto">
                        {filteredUsersForName.map((user: any) => (
                          <div
                            key={user.id}
                            className="px-3 py-2 text-sm text-gray-900 cursor-pointer hover:bg-gray-100 flex items-center justify-between"
                            onClick={() => handleNameSelect(user)}
                          >
                            <div>
                              <div className="font-medium">{user.fullname || user.username}</div>
                              <div className="text-xs text-gray-500">@{user.username}</div>
                            </div>
                            <div className="text-xs text-gray-400">{user.email}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Email Field */}
                <div className="relative" ref={emailDropdownRef}>
                  <label htmlFor="invite-email" className="block text-sm font-semibold text-gray-900 mb-2">
                    Email
                  </label>
                  <input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={handleEmailChange}
                    placeholder="E.g. ivy.grace@example.com"
                    disabled={isSendingInvite}
                    className={`w-full px-4 py-2 border border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C4A35A] focus:border-transparent text-gray-700 ${isSendingInvite ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                  />

                  {/* Email Dropdown */}
                  {showEmailDropdown && filteredUsersForEmail.length > 0 && !isSendingInvite && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-hidden">
                      <div className="max-h-48 overflow-y-auto">
                        {filteredUsersForEmail.map((user: any) => (
                          <div
                            key={user.id}
                            className="px-3 py-2 text-sm text-gray-900 cursor-pointer hover:bg-gray-100 flex items-center justify-between"
                            onClick={() => handleEmailSelect(user)}
                          >
                            <div>
                              <div className="font-medium">{user.email}</div>
                              <div className="text-xs text-gray-500">{user.fullname || user.username}</div>
                            </div>
                            <div className="text-xs text-gray-400">@{user.username}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                {/* Send Invite Button */}
                <button
                  onClick={handleSendInvite}
                  disabled={isSendingInvite}
                  className={`w-[150px] px-6 py-3 text-white font-semibold rounded-[20px] transition-colors duration-200 ${isSendingInvite
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#7FB539] hover:bg-[#6FA329]'
                    }`}
                >
                  {isSendingInvite ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    'Send Invite'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Confirm Delete"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Yes"
        cancelText="No"
        confirmButtonColor="text-red-600"
      />
    </div>
  );
};

export default GlobalUserTable;
