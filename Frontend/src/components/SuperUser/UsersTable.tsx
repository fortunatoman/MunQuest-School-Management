import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import saveIcon from '../../assets/save_icon.svg';
import { deleteUserBySuperUserApi, updateUserStatusApi, updateUserBySuperUserApi } from '../../apis/Users';
import { useApp } from '../../contexts/AppContext';
interface UsersTableProps {
  users: any[];
  userType: 'student' | 'teacher';
}

const UsersTable: React.FC<UsersTableProps> = ({ users, userType }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showContextMenu, setShowContextMenu] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const { refreshUserData } = useApp();
  const [newUser, setNewUser] = useState({ 
    username: '', 
    fullname: '', 
    email: '', 
    academicLevel: '', 
    school: '', 
    munExperience: '', 
    globalRole: 'User' 
  });
  const [editUser, setEditUser] = useState({ 
    username: '', 
    fullname: '', 
    email: '', 
    academicLevel: '', 
    school: '', 
    munExperience: '', 
    globalRole: 'User' 
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  
  // Filter users based on user type and search term
  useEffect(() => {
    let filtered = users.filter((user) => {
      // Filter by user type (role)
      return user.role === userType;
    });

    // Apply search filter if search term exists
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((user) => {
        return (
          String(user.id).toLowerCase().includes(searchLower) ||
          user.username?.toLowerCase().includes(searchLower) ||
          user.fullname?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          (typeof user.academicLevel === 'object' ? user.academicLevel?.name?.toLowerCase().includes(searchLower) : user.academicLevel?.toLowerCase().includes(searchLower)) ||
          (typeof user.school === 'object' ? user.school?.name?.toLowerCase().includes(searchLower) : user.school?.toLowerCase().includes(searchLower)) ||
          String(user.munExperience || '').toLowerCase().includes(searchLower) ||
          user.globalRole?.toLowerCase().includes(searchLower)
        );
      });
    }

    setFilteredUsers(filtered);
  }, [searchTerm, users, userType]);

  const handleSave = async (userId: string) => {
    if (!editUser.username.trim() || !editUser.fullname.trim() || !editUser.email.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setUpdatingUserId(userId);
    try {
      const response = await updateUserBySuperUserApi(userId, {
        username: editUser.username.trim(),
        fullname: editUser.fullname.trim(),
        email: editUser.email.trim(),
        academicLevel: editUser.academicLevel.trim(),
        school: editUser.school.trim(),
        munExperience: editUser.munExperience.trim(),
        globalRole: editUser.globalRole.trim()
      });
      
      if (response.success) {
        toast.success('User updated successfully');
        setEditUser({ username: '', fullname: '', email: '', academicLevel: '', school: '', munExperience: '', globalRole: 'User' });
        setEditingId(null);
        await refreshUserData();
      } else {
        toast.error(response.message || 'Failed to update user');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDelete = async (userId: string) => {
    setUpdatingUserId(userId);
    try {
      const response = await deleteUserBySuperUserApi(userId);
      if (response.success) {
        toast.success('User deleted successfully');
        await refreshUserData();
      } else {
        toast.error(response.message || 'Failed to delete user');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleBlock = async (userId: string) => {
    setUpdatingUserId(userId);
    try {
      const response = await updateUserStatusApi(userId, 'blocked');
      if (response.success) {
        toast.success('User blocked successfully');
        await refreshUserData();
      } else {
        toast.error(response.message || 'Failed to block user');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to block user');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleUnblock = async (userId: string) => {
    setUpdatingUserId(userId);
    try {
      const response = await updateUserStatusApi(userId, 'active');
      if (response.success) {
        toast.success('User unblocked successfully');
        await refreshUserData();
      } else {
        toast.error(response.message || 'Failed to unblock user');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to unblock user');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleFlag = async (userId: string) => {
    setUpdatingUserId(userId);
    try {
      const response = await updateUserStatusApi(userId, 'flagged');
      if (response.success) {
        toast.success('User flagged successfully');
        await refreshUserData();
      } else {
        toast.error(response.message || 'Failed to flag user');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to flag user');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleAssignOrganiser = async (userId: string) => {
    setUpdatingUserId(userId);
    try {
      const response = await updateUserBySuperUserApi(userId, { globalRole: 'Organiser' });
      if (response.success) {
        toast.success('User assigned organiser role successfully');
        await refreshUserData();
      } else {
        toast.error(response.message || 'Failed to assign organiser role');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign organiser role');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleInviteNonUser = async (userId: string) => {
    setUpdatingUserId(userId);
    try {
      console.log('Inviting non-user:', userId);
      // This would typically send an invitation email or notification
      // For now, we'll just show a success message
      toast.success('Invitation sent successfully');
      await refreshUserData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send invitation');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleEdit = (user: any) => {
    console.log('Edit button clicked for user:', user);
    setEditUser({ 
      username: user.username || '', 
      fullname: user.fullname || '', 
      email: user.email || '', 
      academicLevel: user.academicLevel || '', 
      school: user.school || '', 
      munExperience: user.munExperience || '', 
      globalRole: user.globalRole || 'User' 
    });
    setEditingId(user.id);
    setShowContextMenu(null);
  };

  const handleContextMenu = (userId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setShowContextMenu(showContextMenu === userId ? null : userId);
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showContextMenu) {
        // Check if the click is outside the dropdown menu and button
        const target = event.target as Element;
        const isInsideMenu = target.closest('.context-menu');
        const isInsideButton = target.closest('[data-dropdown-button]');
        
        if (!isInsideMenu && !isInsideButton) {
          setShowContextMenu(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showContextMenu]);

  const cancelEdit = () => {
    setEditingId(null);
    setEditUser({ username: '', fullname: '', email: '', academicLevel: '', school: '', munExperience: '', globalRole: 'User' });
  };

  const cancelAdd = () => {
    setIsAdding(false);
    setNewUser({ username: '', fullname: '', email: '', academicLevel: '', school: '', munExperience: '', globalRole: 'User' });
    setShowContextMenu(null);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'text-green-600';
      case 'blocked':
        return 'text-red-600';
      case 'flagged':
        return 'text-red-600';
      case 'deleted':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div>
      {/* Search Input */}
      <div className="mb-4 w-[400px]">
        <div className="relative">
          <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Header Row */}
      <div className="grid grid-cols-8 gap-2 mb-2">
        {['Student ID', 'Username', 'Name', 'Academic Level', 'School', 'MUN Experience', 'Global Role', 'User Status'].map((header) => (
          <div
            key={header}
            className="px-3 py-2 text-xs font-medium text-gray-900 uppercase tracking-wider rounded-md bg-[#C6DAF4] border border-[#4A5F7A] flex items-center justify-between"
          >
            <span>{header}</span>
            <svg className="w-3 h-3 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        ))}
      </div>

      {/* Data Rows */}
      {filteredUsers.length === 0 && !isAdding ? (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No users found matching your search' : 'No users found'}
        </div>
      ) : filteredUsers.length > 0 ? (
        filteredUsers.map((user) => (
          <div key={user.id} className="grid grid-cols-8 gap-2 mb-2">
            {/* Student ID */}
            <div className="bg-white px-3 py-2 text-sm font-medium text-gray-900 rounded-md border border-gray-200">
              {user.id}
            </div>

            {/* Username */}
            <div className="bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200">
              {editingId === user.id ? (
                <input
                  type="text"
                  value={editUser.username}
                  onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                  className="w-full border-none outline-none text-sm bg-transparent"
                  placeholder="Username"
                />
              ) : (
                user.username || '-'
              )}
            </div>

            {/* Name */}
            <div className="bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200">
              {editingId === user.id ? (
                <input
                  type="text"
                  value={editUser.fullname}
                  onChange={(e) => setEditUser({ ...editUser, fullname: e.target.value })}
                  className="w-full border-none outline-none text-sm bg-transparent"
                  placeholder="Full Name"
                />
              ) : (
                user.fullname || '-'
              )}
            </div>

            {/* Academic Level */}
            <div className="bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200">
              {editingId === user.id ? (
                <input
                  type="text"
                  value={editUser.academicLevel}
                  onChange={(e) => setEditUser({ ...editUser, academicLevel: e.target.value })}
                  className="w-full border-none outline-none text-sm bg-transparent"
                  placeholder="Academic Level"
                />
              ) : (
                (typeof user.academicLevel === 'object' && user.academicLevel?.name) ? user.academicLevel.name : (user.academicLevel || '-')
              )}
            </div>

            {/* School */}
            <div className="bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200">
              {editingId === user.id ? (
                <input
                  type="text"
                  value={editUser.school}
                  onChange={(e) => setEditUser({ ...editUser, school: e.target.value })}
                  className="w-full border-none outline-none text-sm bg-transparent"
                  placeholder="School"
                />
              ) : (
                (typeof user.school === 'object' && user.school?.name) ? user.school.name : (user.school || '-')
              )}
            </div>

            {/* MUN Experience */}
            <div className="bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200">
              {editingId === user.id ? (
                <input
                  type="text"
                  value={editUser.munExperience}
                  onChange={(e) => setEditUser({ ...editUser, munExperience: e.target.value })}
                  className="w-full border-none outline-none text-sm bg-transparent"
                  placeholder="MUN Experience"
                />
              ) : (
                user.munExperience || '-'
              )}
            </div>

            {/* Global Role */}
            <div className="bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200">
              {editingId === user.id ? (
                <select
                  value={editUser.globalRole}
                  onChange={(e) => setEditUser({ ...editUser, globalRole: e.target.value })}
                  className="w-full border-none outline-none text-sm bg-transparent"
                >
                  <option value="User">User</option>
                  <option value="Super User">Super User</option>
                </select>
              ) : (
                user.globalRole || 'User'
              )}
            </div>

            {/* User Status */}
            <div className="bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200 flex items-center justify-between">
              <span className={getStatusColor(user.status)}>
                {user.status}
              </span>
              
              {/* Actions */}
              <div className="relative">
                {editingId === user.id ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSave(user.id)}
                      disabled={updatingUserId === user.id}
                      className={`hover:opacity-80 transition-opacity duration-200 ${updatingUserId === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <img src={saveIcon} alt="Save" className="w-5 h-5" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={updatingUserId === user.id}
                      className={`text-red-600 hover:text-red-800 text-sm ${updatingUserId === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => handleContextMenu(user.id, e)}
                    data-dropdown-button
                    className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                )}

                {showContextMenu === user.id && !isAdding && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200 context-menu">
                    <div className="py-1">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Edit button clicked');
                          handleEdit(user);
                          setShowContextMenu(null);
                        }}
                        disabled={updatingUserId === user.id}
                        className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingUserId === user.id
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-[#D9C7A1] hover:text-gray-900'
                          }`}
                      >
                        Edit
                      </button>
                      {user.status?.toLowerCase() === 'blocked' ? (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Unblock button clicked');
                            handleUnblock(user.id);
                            setShowContextMenu(null);
                          }}
                          disabled={updatingUserId === user.id}
                          className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingUserId === user.id
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-[#D9C7A1] hover:text-gray-900'
                            }`}
                        >
                          Unblock
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Block button clicked');
                            handleBlock(user.id);
                            setShowContextMenu(null);
                          }}
                          disabled={updatingUserId === user.id}
                          className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingUserId === user.id
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-[#D9C7A1] hover:text-gray-900'
                            }`}
                        >
                          Block
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Assign Organiser button clicked');
                          handleAssignOrganiser(user.id);
                          setShowContextMenu(null);
                        }}
                        disabled={updatingUserId === user.id}
                        className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingUserId === user.id
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-[#D9C7A1] hover:text-gray-900'
                          }`}
                      >
                        Assign Organiser
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Flag button clicked');
                          handleFlag(user.id);
                          setShowContextMenu(null);
                        }}
                        disabled={updatingUserId === user.id}
                        className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingUserId === user.id
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-[#D9C7A1] hover:text-gray-900'
                          }`}
                      >
                        Flag
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Invite Non-user button clicked');
                          handleInviteNonUser(user.id);
                          setShowContextMenu(null);
                        }}
                        disabled={updatingUserId === user.id}
                        className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingUserId === user.id
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-[#D9C7A1] hover:text-gray-900'
                          }`}
                      >
                        Invite Non-user
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Delete button clicked');
                          handleDelete(user.id);
                          setShowContextMenu(null);
                        }}
                        disabled={updatingUserId === user.id}
                        className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingUserId === user.id
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-[#D9C7A1] hover:text-gray-900'
                          }`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      ) : null}

      {/* Add New User Input Row */}
      {isAdding && (
        <div className="grid grid-cols-8 gap-2 mb-2">
          {/* Student ID */}
          <div className="bg-white px-3 py-2 text-sm rounded-md border border-gray-200">
            <input
              type="text"
              value="Auto generated"
              placeholder="Auto generated"
              className="w-full border-none outline-none text-sm text-gray-500"
              disabled
            />
          </div>

          {/* Username */}
          <div className="bg-white px-3 py-2 text-sm rounded-md border border-gray-200">
            <input
              type="text"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              placeholder="Add username"
              className="w-full border-none outline-none text-sm bg-transparent"
            />
          </div>

          {/* Name */}
          <div className="bg-white px-3 py-2 text-sm rounded-md border border-gray-200">
            <input
              type="text"
              value={newUser.fullname}
              onChange={(e) => setNewUser({ ...newUser, fullname: e.target.value })}
              placeholder="Add full name"
              className="w-full border-none outline-none text-sm bg-transparent"
            />
          </div>

          {/* Academic Level */}
          <div className="bg-white px-3 py-2 text-sm rounded-md border border-gray-200">
            <input
              type="text"
              value={newUser.academicLevel}
              onChange={(e) => setNewUser({ ...newUser, academicLevel: e.target.value })}
              placeholder="Add academic level"
              className="w-full border-none outline-none text-sm bg-transparent"
            />
          </div>

          {/* School */}
          <div className="bg-white px-3 py-2 text-sm rounded-md border border-gray-200">
            <input
              type="text"
              value={newUser.school}
              onChange={(e) => setNewUser({ ...newUser, school: e.target.value })}
              placeholder="Add school"
              className="w-full border-none outline-none text-sm bg-transparent"
            />
          </div>

          {/* MUN Experience */}
          <div className="bg-white px-3 py-2 text-sm rounded-md border border-gray-200">
            <input
              type="text"
              value={newUser.munExperience}
              onChange={(e) => setNewUser({ ...newUser, munExperience: e.target.value })}
              placeholder="Add MUN experience"
              className="w-full border-none outline-none text-sm bg-transparent"
            />
          </div>

          {/* Global Role */}
          <div className="bg-white px-3 py-2 text-sm rounded-md border border-gray-200">
            <select
              value={newUser.globalRole}
              onChange={(e) => setNewUser({ ...newUser, globalRole: e.target.value })}
              className="w-full border-none outline-none text-sm bg-transparent"
            >
              <option value="User">User</option>
              <option value="Super User">Super User</option>
            </select>
          </div>

          {/* Actions */}
          <div className="px-3 py-2 text-sm font-medium relative">
            <div className="flex space-x-2">
              <button
                onClick={cancelAdd}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Button */}
      <div className="flex justify-start space-x-4 mt-6">
        <button
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
          className={`bg-[#C2A46D] text-white font-medium rounded-[30px] w-[105px] h-[44px] px-[10px] py-[10px] mr-[10px] transition-colors duration-200 ${isAdding
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-[#9a7849]'
            }`}
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default UsersTable;
