import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { getAllRegistrationsByEventIdApi } from '../../apis/Registerations';
import { saveLeadershipRoleByEventIdApi, getLeadershipRolesByEventIdApi, updateLeadershipRoleByEventIdApi, deleteLeadershipRoleByEventIdApi, updateLeadershipRoleRankingByEventIdApi } from '../../apis/Event_leaders';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import ConfirmationModal from '../ui/ConfirmationModal';

interface LeadershipRole {
  id: number;
  users: {
    id: number;
    username: string;
    fullname: string;
  };
  name: string;
  leadership_roles: {
    abbr: string;
    leadership_role: string;
  };
  ranking?: number;
}

const LeadershipRolesPage: React.FC = () => {
  const { eventId } = useParams();
  const { allLeadershipRoles } = useApp();
  const [leadershipRoles, setLeadershipRoles] = useState<LeadershipRole[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [editingRole, setEditingRole] = useState<number | null>(null);
  const [newRoleData, setNewRoleData] = useState({
    abbr: '',
    role: '',
    username: '',
    name: '',
    selectedUserId: ''
  });
  const [editRoleData, setEditRoleData] = useState({
    abbr: '',
    role: '',
    username: '',
    name: '',
    selectedUserId: '',
    id: ''
  });
  const dropdownRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const [showRoleDropdown, setShowRoleDropdown] = useState<boolean>(false);
  const [filteredRoles, setFilteredRoles] = useState<any[]>([]);
  const [allRegistrations, setAllRegistrations] = useState<any[]>([]);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  const [showUsernameDropdown, setShowUsernameDropdown] = useState<boolean>(false);
  const [filteredUsernames, setFilteredUsernames] = useState<any[]>([]);
  const usernameDropdownRef = useRef<HTMLDivElement>(null);

  // Delete confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [roleToDelete, setRoleToDelete] = useState<number | null>(null);

  // Support toggle states
  const [supportEnabledRoles, setSupportEnabledRoles] = useState<Set<number>>(new Set());

  // Loading states for save buttons
  const [isSavingNew, setIsSavingNew] = useState<boolean>(false);
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleDropdownToggle = (roleId: number) => {
    setActiveDropdown(activeDropdown === roleId ? null : roleId);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!eventId) return;

      setIsLoading(true);
      try {
        const leadershipRolesResponse = await getLeadershipRolesByEventIdApi(eventId);
        if (leadershipRolesResponse.success) {
          const roles = leadershipRolesResponse.data || [];
          // Sort by ranking property (ascending order)
          const sortedRoles = roles.sort((a: LeadershipRole, b: LeadershipRole) => {
            const rankingA = a.ranking ?? 0;
            const rankingB = b.ranking ?? 0;
            return rankingA - rankingB;
          });
          setLeadershipRoles(sortedRoles);
        }

        const allRegistrationsResponse = await getAllRegistrationsByEventIdApi(eventId);
        if (allRegistrationsResponse.success) {
          setAllRegistrations(allRegistrationsResponse.data);
        }
      } catch (error) {
        console.log('Error fetching data:', error);
        toast.error('Failed to load leadership roles data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [eventId]);


  const handleMenuAction = (action: string, roleId: number) => {
    if (action === 'edit') {
      const roleToEdit = leadershipRoles.find(role => role.id === roleId);
      if (roleToEdit) {
        setEditRoleData({
          abbr: roleToEdit.leadership_roles?.abbr || '',
          role: roleToEdit.leadership_roles?.leadership_role || '',
          username: roleToEdit.users?.username || '',
          name: roleToEdit.users?.fullname || '',
          selectedUserId: roleToEdit.users?.id?.toString() || '',
          id: roleToEdit.id.toString()
        });
        setEditingRole(roleId);
      }
    } else if (action === 'delete') {
      setRoleToDelete(roleId);
      setShowDeleteModal(true);
    } else if (action === 'add_support') {
      // Toggle support status
      setSupportEnabledRoles(prev => {
        const newSet = new Set(prev);
        if (newSet.has(roleId)) {
          newSet.delete(roleId);
        } else {
          newSet.add(roleId);
        }
        return newSet;
      });
    }

    setActiveDropdown(null);
  };

  const handleConfirmDelete = async () => {
    if (roleToDelete) {
      try {
        setIsDeleting(true);
        console.log("roleToDelete", roleToDelete);
        const response = await deleteLeadershipRoleByEventIdApi(roleToDelete.toString());

        if (response.success) {
          toast.success('Leadership role deleted successfully');
          const updatedRolesResponse = await getLeadershipRolesByEventIdApi(eventId || '');
          if (updatedRolesResponse.success) {
            const roles = updatedRolesResponse.data || [];
            // Sort by ranking property (ascending order)
            const sortedRoles = roles.sort((a: LeadershipRole, b: LeadershipRole) => {
              const rankingA = a.ranking ?? 0;
              const rankingB = b.ranking ?? 0;
              return rankingA - rankingB;
            });
            setLeadershipRoles(sortedRoles);
          }
        } else {
          toast.error(response.message || 'Failed to delete leadership role');
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete leadership role');
      } finally {
        setIsDeleting(false);
      }
    }

    setShowDeleteModal(false);
    setRoleToDelete(null);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setRoleToDelete(null);
  };

  // Handle ranking changes (move up/down)
  const handleRankingAdjust = async (roleId: number, direction: number) => {
    try {
      const response = await updateLeadershipRoleRankingByEventIdApi(roleId.toString(), direction);
      if (response.success) {
        toast.success('Ranking updated successfully');
        const updatedRolesResponse = await getLeadershipRolesByEventIdApi(eventId || '');
        if (updatedRolesResponse.success) {
          const roles = updatedRolesResponse.data || [];
          // Sort by ranking property (ascending order)
          const sortedRoles = roles.sort((a: LeadershipRole, b: LeadershipRole) => {
            const rankingA = a.ranking ?? 0;
            const rankingB = b.ranking ?? 0;
            return rankingA - rankingB;
          });
          setLeadershipRoles(sortedRoles);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update ranking');
    }
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    setNewRoleData({
      abbr: '',
      role: '',
      username: '',
      name: '',
      selectedUserId: ''
    });
  };

  const handleNewRoleInputChange = (field: string, value: string) => {
    console.log(value, "value")
    setNewRoleData(prev => ({
      ...prev,
      [field]: value
    }));

    // If role field is being changed, show dropdown and filter roles
    if (field === 'role') {
      if (value.trim()) {
        setShowRoleDropdown(true);
        filterRolesByInput(value.trim());
      } else {
        setShowRoleDropdown(false);
        setFilteredRoles([]);
      }
    }

    // If username field is being changed, show dropdown and filter usernames
    if (field === 'username') {
      if (value.trim()) {
        setShowUsernameDropdown(true);
        filterUsernamesByInput(value.trim());
      } else {
        setShowUsernameDropdown(false);
        setFilteredUsernames([]);
        // Clear name and selectedUserId fields when username is empty
        setNewRoleData(prev => ({
          ...prev,
          name: '',
          selectedUserId: ''
        }));
      }
    }
  };

  const handleEditRoleInputChange = (field: string, value: string) => {
    setEditRoleData(prev => ({
      ...prev,
      [field]: value
    }));

    // If role field is being changed, show dropdown and filter roles
    if (field === 'role') {
      if (value.trim()) {
        setShowRoleDropdown(true);
        filterRolesByInput(value.trim());
      } else {
        setShowRoleDropdown(false);
        setFilteredRoles([]);
      }
    }

    // If username field is being changed, show dropdown and filter usernames
    if (field === 'username') {
      if (value.trim()) {
        setShowUsernameDropdown(true);
        filterUsernamesByInput(value.trim());
      } else {
        setShowUsernameDropdown(false);
        setFilteredUsernames([]);
        // Clear name and selectedUserId fields when username is empty
        setEditRoleData(prev => ({
          ...prev,
          name: '',
          selectedUserId: ''
        }));
      }
    }
  };

  // Function to filter roles by input
  const filterRolesByInput = (input: string) => {
    if (!allLeadershipRoles || allLeadershipRoles.length === 0) {
      setFilteredRoles([]);
      return;
    }

    const filtered = allLeadershipRoles.filter(role => {
      const roleName = role.leadership_role || role.role || '';
      const abbreviation = role.abbr || '';

      return (
        roleName.toLowerCase().includes(input.toLowerCase()) ||
        abbreviation.toLowerCase().includes(input.toLowerCase())
      );
    });

    setFilteredRoles(filtered);
  };

  // Function to filter usernames by input from registrations
  const filterUsernamesByInput = (input: string) => {
    if (!allRegistrations || allRegistrations.length === 0) {
      setFilteredUsernames([]);
      return;
    }

    const filtered = allRegistrations.filter(registration => {
      const user = registration.user || registration;
      const username = user.username || '';
      const fullname = user.fullname || '';

      return (
        username.toLowerCase().includes(input.toLowerCase()) ||
        fullname.toLowerCase().includes(input.toLowerCase())
      );
    });

    setFilteredUsernames(filtered);
  };

  // Handle role selection from dropdown
  const handleRoleSelect = (selectedRole: any) => {
    if (editingRole) {
      setEditRoleData(prev => ({
        ...prev,
        role: selectedRole.leadership_role || selectedRole.role || '',
        abbr: selectedRole.abbr || ''
      }));
    } else {
      setNewRoleData(prev => ({
        ...prev,
        role: selectedRole.leadership_role || selectedRole.role || '',
        abbr: selectedRole.abbr || ''
      }));
    }
    setShowRoleDropdown(false);
    setFilteredRoles([]);
  };

  // Handle username selection from dropdown
  const handleUsernameSelect = (selectedRegistration: any) => {
    const user = selectedRegistration.user || selectedRegistration;
    if (editingRole) {
      setEditRoleData(prev => ({
        ...prev,
        username: user.username || '',
        name: user.fullname || '',
        selectedUserId: user.id || ''
      }));
    } else {
      setNewRoleData(prev => ({
        ...prev,
        username: user.username || '',
        name: user.fullname || '',
        selectedUserId: user.id || ''
      }));
    }
    setShowUsernameDropdown(false);
    setFilteredUsernames([]);
  };

  const handleSaveNew = async () => {
    if (isSavingNew) return; // Prevent double-clicking
    
    try {
      setIsSavingNew(true);
      console.log(newRoleData)
      if (!newRoleData.role || !newRoleData.username || !newRoleData.selectedUserId) {
        toast.error('Please fill in all required fields');
        return;
      }
      const selectedRole = allLeadershipRoles.find(role =>
        (role.leadership_role || role.role) === newRoleData.role
      );
      if (selectedRole && newRoleData.selectedUserId) {
        const response = await saveLeadershipRoleByEventIdApi(
          eventId || '',
          newRoleData.selectedUserId,
          selectedRole.id.toString()
        );

        if (response.success) {
          toast.success('Leadership role added successfully');
          setIsAddingNew(false);
          setNewRoleData({
            abbr: '',
            role: '',
            username: '',
            name: '',
            selectedUserId: ''
          });
          const updatedRolesResponse = await getLeadershipRolesByEventIdApi(eventId || '');
          if (updatedRolesResponse.success) {
            const roles = updatedRolesResponse.data || [];
            // Sort by ranking property (ascending order)
            const sortedRoles = roles.sort((a: LeadershipRole, b: LeadershipRole) => {
              const rankingA = a.ranking ?? 0;
              const rankingB = b.ranking ?? 0;
              return rankingA - rankingB;
            });
            setLeadershipRoles(sortedRoles);
          }
        } else {
          toast.error(response.message);
        }
      } else {
        toast.error('Unable to save leadership role. Please try again.');
      }
    } catch (error: any) {
      toast.error('Failed to save leadership role: ' + error.message);
    } finally {
      setIsSavingNew(false);
    }
  };

  const handleCancelAdd = () => {
    setIsAddingNew(false);
    setNewRoleData({
      abbr: '',
      role: '',
      username: '',
      name: '',
      selectedUserId: ''
    });
    setShowRoleDropdown(false);
    setShowUsernameDropdown(false);
    setFilteredRoles([]);
    setFilteredUsernames([]);
  };

  const handleSaveEdit = async () => {
    if (isSavingEdit) return; // Prevent double-clicking
    
    try {
      setIsSavingEdit(true);
      
      // Validate required fields
      if (!editRoleData.role || !editRoleData.username || !editRoleData.selectedUserId) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Find the selected role from allLeadershipRoles
      const selectedRole = allLeadershipRoles.find(role =>
        (role.leadership_role || role.role) === editRoleData.role
      );

      if (selectedRole && editRoleData.selectedUserId) {
        console.log("eventId", eventId);
        console.log("selectedUserId", editRoleData.selectedUserId);
        console.log("roleId", selectedRole.id.toString());
        console.log("id", editRoleData.id.toString());
        const response = await updateLeadershipRoleByEventIdApi(
          editRoleData.id.toString(),
          eventId || '',
          selectedRole.id.toString(),
          editRoleData.selectedUserId
        );

        if (response.success) {
          toast.success('Leadership role updated successfully');
          setEditingRole(null);
          setEditRoleData({
            abbr: '',
            role: '',
            username: '',
            name: '',
            selectedUserId: '',
            id: ''
          });

          const updatedRolesResponse = await getLeadershipRolesByEventIdApi(eventId || '');
          if (updatedRolesResponse.success) {
            const roles = updatedRolesResponse.data || [];
            // Sort by ranking property (ascending order)
            const sortedRoles = roles.sort((a: LeadershipRole, b: LeadershipRole) => {
              const rankingA = a.ranking ?? 0;
              const rankingB = b.ranking ?? 0;
              return rankingA - rankingB;
            });
            setLeadershipRoles(sortedRoles);
          }
        } else {
          toast.error(response.message);
        }
      } else {
        toast.error('Unable to update leadership role. Please try again.');
      }
    } catch (error: any) {
      toast.error('Failed to update leadership role: ' + error.message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingRole(null);
    setEditRoleData({
      abbr: '',
      role: '',
      username: '',
      name: '',
      selectedUserId: '',
      id: ''
    });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside any dropdown menu
      const clickedOutsideAllDropdowns = Object.values(dropdownRefs.current).every(ref =>
        !ref || !ref.contains(event.target as Node)
      );

      if (clickedOutsideAllDropdowns) {
        setActiveDropdown(null);
      }

      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setShowRoleDropdown(false);
      }
      if (usernameDropdownRef.current && !usernameDropdownRef.current.contains(event.target as Node)) {
        setShowUsernameDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading leadership roles...</span>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 " style={{ marginBottom: '16px' }}>
        {/* Grid Container */}
        <div className="grid grid-cols-[100px_200px_220px_280px_60px] gap-4">
          <div className="bg-[#C6DAF4] text-grey-800 px-4 py-3 rounded-lg text-sm font-medium text-center border border-gray-800">ABBR</div>
          <div className="bg-[#C6DAF4] text-grey-800 px-4 py-3 rounded-lg text-sm font-medium text-center border border-gray-800">Leadership Role</div>
          <div className="bg-[#C6DAF4] text-grey-800 px-4 py-3 rounded-lg text-sm font-medium text-center border border-gray-800">Username</div>
          <div className="bg-[#C6DAF4] text-grey-800 px-4 py-3 rounded-lg text-sm font-medium text-center border border-gray-800">Name</div>
          <div></div>

          {/* Existing roles */}
          {leadershipRoles.map((role) => (
            <React.Fragment key={role.id}>
              {editingRole === role.id ? (
                // Edit mode
                <>
                  <div className="bg-gray-100 px-3 py-2 text-sm rounded-md border border-gray-200">
                    <input
                      type="text"
                      value={editRoleData.abbr}
                      readOnly
                      placeholder="Auto-filled"
                      className="w-full border-none outline-none text-gray-500 bg-transparent cursor-not-allowed"
                    />
                  </div>

                  <div
                    ref={roleDropdownRef}
                    className="bg-white px-3 py-2 text-sm rounded-md border border-gray-200 relative"
                  >
                    <input
                      type="text"
                      value={editRoleData.role}
                      onChange={(e) => handleEditRoleInputChange('role', e.target.value)}
                      onFocus={() => {
                        if (editRoleData.role.trim()) {
                          setShowRoleDropdown(true);
                          filterRolesByInput(editRoleData.role.trim());
                        }
                      }}
                      placeholder="Enter role name"
                      className="w-full border-none outline-none text-gray-900"
                      autoComplete="off"
                    />

                    {/* Role Dropdown */}
                    {showRoleDropdown && filteredRoles.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                        {filteredRoles.map((role, index) => (
                          <button
                            key={role.id || index}
                            type="button"
                            onClick={() => handleRoleSelect(role)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#D9C7A1] hover:text-gray-900 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium">{role.leadership_role || role.role}</div>
                            {role.abbr && (
                              <div className="text-xs text-gray-500">({role.abbr})</div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div
                    ref={usernameDropdownRef}
                    className="bg-white px-3 py-2 text-sm rounded-md border border-gray-200 relative"
                  >
                    <input
                      type="text"
                      value={editRoleData.username}
                      onChange={(e) => handleEditRoleInputChange('username', e.target.value)}
                      onFocus={() => {
                        if (editRoleData.username.trim()) {
                          setShowUsernameDropdown(true);
                          filterUsernamesByInput(editRoleData.username.trim());
                        }
                      }}
                      placeholder="Enter username"
                      className="w-full border-none outline-none text-gray-900"
                      autoComplete="off"
                    />

                    {/* Username Dropdown */}
                    {showUsernameDropdown && filteredUsernames.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                        {filteredUsernames.map((registration, index) => {
                          const user = registration.user || registration;
                          return (
                            <button
                              key={user.id || index}
                              type="button"
                              onClick={() => handleUsernameSelect(registration)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#D9C7A1] hover:text-gray-900 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium">{user.username}</div>
                              <div className="text-xs text-gray-500">{user.fullname}</div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-100 px-3 py-2 text-sm rounded-md border border-gray-200">
                    <input
                      type="text"
                      value={editRoleData.name}
                      readOnly
                      placeholder="Auto-filled"
                      className="w-full border-none outline-none text-gray-500 bg-transparent cursor-not-allowed"
                    />
                  </div>

                  
                </>
              ) : (
                // View mode
                <>
                  <div className="bg-gray-50 border border-gray-800 rounded-lg px-4 py-3 flex items-center justify-center">
                    <div className="text-sm text-gray-900 text-center w-full">
                      {role.leadership_roles?.abbr || '-'}
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-800 rounded-lg px-4 py-3 flex items-center">
                    <div className="text-sm text-gray-900 w-full">
                      {role.leadership_roles?.leadership_role || '-'}
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-800 rounded-lg px-4 py-3 flex items-center">
                    <div className="text-sm text-gray-900 w-full">
                      {role.users?.username || '-'}
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-800 rounded-lg px-4 py-3 flex items-center">
                    <div className="text-sm text-gray-900 w-full">
                      {role.users?.fullname || '-'}
                    </div>
                  </div>
                </>
              )}

              {/* Actions Column */}
              <div className="bg-gray-50 px-0 py-2 text-sm font-medium relative">
                <div className="relative flex items-center justify-center space-x-1">
                  
                  <button className="text-yellow-600 hover:text-yellow-800 p-1" title="Editing Mode">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                      </button>
                  {/* Ranking buttons - Up and Down */}
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => handleRankingAdjust(role.id, -1)}
                      disabled={leadershipRoles.findIndex(r => r.id === role.id) === 0}
                      className="text-gray-600 hover:text-gray-800 p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 15l-6-6-6 6" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleRankingAdjust(role.id, 1)}
                      disabled={leadershipRoles.findIndex(r => r.id === role.id) === leadershipRoles.length - 1}
                      className="text-gray-600 hover:text-gray-800 p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                  </div>

                  {/* Headphone icon for roles with support enabled */}
                  {supportEnabledRoles.has(role.id) && (
                    <button className="text-blue-600 hover:text-blue-800 p-1" title="Support Enabled">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                        <path d="M3 14v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3" />
                        <path d="M12 2a5 5 0 0 0-5 5v6a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5z" />
                        <path d="M8 12h8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                      </svg>
                    </button>
                  )}

                  {/* Three dots menu icon */}
                  <div ref={(el) => { dropdownRefs.current[role.id] = el; }} className="relative">
                    <button
                      onClick={() => handleDropdownToggle(role.id)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>

                    {activeDropdown === role.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                        <div className="py-1">
                          <button
                            onClick={() => handleMenuAction('edit', role.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#D9C7A1] hover:text-gray-900 transition-colors duration-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleMenuAction('delete', role.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#D9C7A1] hover:text-gray-900 transition-colors duration-200"
                          >
                            Delete
                          </button>
                          <button
                            onClick={handleAddNew}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#D9C7A1] hover:text-gray-900 transition-colors duration-200"
                          >
                            Add Role
                          </button>
                          <button
                            onClick={() => handleMenuAction('add_support', role.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#D9C7A1] hover:text-gray-900 transition-colors duration-200"
                          >
                            {supportEnabledRoles.has(role.id) ? 'Remove Support' : 'Add as Support'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}

          {/* New Role Input Row */}
          {isAddingNew && (
            <div className={`col-span-${editingRole !== null ? '6' : '5'} grid gap-4 ${editingRole !== null ? 'grid-cols-[100px_200px_220px_280px_80px_80px]' : 'grid-cols-[100px_200px_220px_280px_80px]'}`}>
              <div className="bg-gray-100 px-3 py-2 text-sm rounded-md border border-gray-200">
                <input
                  type="text"
                  value={newRoleData.abbr}
                  readOnly
                  placeholder="Auto-filled"
                  className="w-full border-none outline-none text-gray-500 bg-transparent cursor-not-allowed"
                />
              </div>

              <div
                ref={roleDropdownRef}
                className="bg-white px-3 py-2 text-sm rounded-md border border-gray-200 relative"
              >
                <input
                  type="text"
                  value={newRoleData.role}
                  onChange={(e) => handleNewRoleInputChange('role', e.target.value)}
                  onFocus={() => {
                    if (newRoleData.role.trim()) {
                      setShowRoleDropdown(true);
                      filterRolesByInput(newRoleData.role.trim());
                    }
                  }}
                  placeholder="Enter role name"
                  className="w-full border-none outline-none text-gray-900"
                  autoComplete="off"
                />

                {/* Role Dropdown */}
                {showRoleDropdown && filteredRoles.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                    {filteredRoles.map((role, index) => (
                      <button
                        key={role.id || index}
                        type="button"
                        onClick={() => handleRoleSelect(role)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#D9C7A1] hover:text-gray-900 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium">{role.leadership_role || role.role}</div>
                        {role.abbr && (
                          <div className="text-xs text-gray-500">({role.abbr})</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div
                ref={usernameDropdownRef}
                className="bg-white px-3 py-2 text-sm rounded-md border border-gray-200 relative"
              >
                <input
                  type="text"
                  value={newRoleData.username}
                  onChange={(e) => handleNewRoleInputChange('username', e.target.value)}
                  onFocus={() => {
                    if (newRoleData.username.trim()) {
                      console.log("if condition")
                      setShowUsernameDropdown(true);
                      filterUsernamesByInput(newRoleData.username.trim());
                    }
                  }}
                  placeholder="Enter username"
                  className="w-full border-none outline-none text-gray-900"
                  autoComplete="off"
                />

                {/* Username Dropdown */}
                {showUsernameDropdown && filteredUsernames.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                    {filteredUsernames.map((registration, index) => {
                      const user = registration.user || registration;
                      return (
                        <button
                          key={user.id || index}
                          type="button"
                          onClick={() => handleUsernameSelect(registration)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#D9C7A1] hover:text-gray-900 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium">{user.username}</div>
                          <div className="text-xs text-gray-500">{user.fullname}</div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-gray-100 px-3 py-2 text-sm rounded-md border border-gray-200">
                <input
                  type="text"
                  value={newRoleData.name}
                  readOnly
                  placeholder="Auto-filled"
                  className="w-full border-none outline-none text-gray-500 bg-transparent cursor-not-allowed"
                />
              </div>

              {/* Actions Column for Add New Row */}
              <div className="bg-gray-50 px-3 py-2 text-sm font-medium relative">
                <div className="relative flex items-center justify-center">
                  {/* Bookmark icon for add new mode */}
                  <button className="text-yellow-600 hover:text-yellow-800 p-1" title="Adding New Role">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  </button>
                </div>
              </div>
              {editingRole !== null && <div></div>}
            </div>
          )}
        </div>
      </div >

      <div className="w-[925px] flex justify-between">
        {editingRole !== null ? (
          // Edit mode buttons
          <>
            <button
              onClick={handleCancelEdit}
              className={`text-white font-medium transition-colors`}
              style={{
                width: '105px',
                height: '44px',
                borderRadius: '30px',
                padding: '10px',
                gap: '10px',
                opacity: 1,
                background: '#C2A46D',
                cursor: 'pointer',
                border: 'none',
                boxShadow: 'none',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={isSavingEdit}
              className={`text-white font-medium transition-colors`}
              style={{
                width: '105px',
                height: '44px',
                borderRadius: '30px',
                padding: '10px',
                gap: '10px',
                opacity: isSavingEdit ? 0.6 : 1,
                background: isSavingEdit ? '#bdbdbd' : '#607DA3',
                cursor: isSavingEdit ? 'not-allowed' : 'pointer',
                border: 'none',
                boxShadow: 'none',
              }}
            >
              {isSavingEdit ? 'Saving...' : 'Save'}
            </button>
          </>
        ) : (
          // Normal mode buttons
          <>
            {!isAddingNew ? (
              <button
                onClick={handleAddNew}
                className={`text-white font-medium transition-colors`}
                style={{
                  width: '105px',
                  height: '44px',
                  borderRadius: '30px',
                  padding: '10px',
                  gap: '10px',
                  opacity: 1,
                  background: '#C2A46D',
                  cursor: 'pointer',
                  border: 'none',
                  boxShadow: 'none',
                }}
              >
                Add Role
              </button>
            ) : (
              <button
                onClick={handleCancelAdd}
                className={`text-white font-medium transition-colors`}
                style={{
                  width: '105px',
                  height: '44px',
                  borderRadius: '30px',
                  padding: '10px',
                  gap: '10px',
                  opacity: 1,
                  background: '#C2A46D',
                  cursor: 'pointer',
                  border: 'none',
                  boxShadow: 'none',
                }}
              >
                Close
              </button>
            )}
            {isAddingNew && (
              <>
              
                <button
                  onClick={handleSaveNew}
                  disabled={isSavingNew}
                  className={`text-white font-medium transition-colors`}
                  style={{
                    width: '105px',
                    height: '44px',
                    borderRadius: '30px',
                    padding: '10px',
                    gap: '10px',
                    opacity: isSavingNew ? 0.6 : 1,
                    background: isSavingNew ? '#bdbdbd' : '#C2A46D',
                    cursor: isSavingNew ? 'not-allowed' : 'pointer',
                    border: 'none',
                    boxShadow: 'none',
                  }}
                >
                  {isSavingNew ? 'Saving...' : 'Save'}
                </button>
              </>
            )}
          </>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          title="Confirm Delete"
          message="Are you sure you want to delete this leadership role? This action cannot be undone."
          confirmText="Yes"
          cancelText="No"
          confirmButtonColor="text-red-600"
          isLoading={isDeleting}
          loadingText="Deleting..."
        />
      </div>
    </>
  );
};

export default LeadershipRolesPage;
