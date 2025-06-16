import React, { useState, useEffect } from 'react';
import { createLeadershipRoleApi, updateLeadershipRoleApi, deleteLeadershipRoleApi } from '../../apis/LeadershipRoles';
import { toast } from 'sonner';
import saveIcon from '../../assets/save_icon.svg';
import ConfirmationModal from '../ui/ConfirmationModal';

interface LeadershipRole {
  id: string;
  abbr: string;
  leadership_role: string;
  created_at?: Date;
  updated_at?: Date;
}

interface LeadershipRolesTableProps {
  leadershipRoles: LeadershipRole[];
  onRefresh: () => void;
}

const LeadershipRolesTable: React.FC<LeadershipRolesTableProps> = ({ leadershipRoles, onRefresh }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showContextMenu, setShowContextMenu] = useState<string | null>(null);
  const [newRole, setNewRole] = useState({ abbr: '', leadership_role: '' });
  const [editRole, setEditRole] = useState({ abbr: '', leadership_role: '' });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredRoles, setFilteredRoles] = useState<LeadershipRole[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);

  // Filter roles based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRoles(leadershipRoles);
    } else {
      const filtered = leadershipRoles.filter((role) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          role.id.toLowerCase().includes(searchLower) ||
          role.abbr.toLowerCase().includes(searchLower) ||
          role.leadership_role.toLowerCase().includes(searchLower)
        );
      });
      setFilteredRoles(filtered);
    }
  }, [searchTerm, leadershipRoles]);
  
  const handleSaveNewRole = async () => {
    if (!newRole.abbr.trim() || !newRole.leadership_role.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const response = await createLeadershipRoleApi(newRole.abbr.trim(), newRole.leadership_role.trim());
      if (response.success) {
        toast.success('Leadership role created successfully');
      } else {
        toast.error(response.message || 'Failed to create leadership role');
      }
      setNewRole({ abbr: '', leadership_role: '' });
      setIsAdding(false);
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create leadership role');
    }
  };

  const handleSave = async (roleId: string) => {
    if (!editRole.abbr.trim() || !editRole.leadership_role.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const response = await updateLeadershipRoleApi(roleId, editRole.abbr.trim(), editRole.leadership_role.trim());
      if (response.success) {
        toast.success('Leadership role updated successfully');
      } else {
        toast.error(response.message || 'Failed to update leadership role');
      }
      setEditRole({ abbr: '', leadership_role: '' });
      setEditingId(null);
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update leadership role');
    }
  };

  const handleDeleteClick = (roleId: string) => {
    setRoleToDelete(roleId);
    setShowDeleteModal(true);
    setShowContextMenu(null);
  };

  const handleDeleteConfirm = async () => {
    if (!roleToDelete) return;
    
    try {
      const response = await deleteLeadershipRoleApi(roleToDelete);
      if (response.success) {
        toast.success('Leadership role deleted successfully');
      } else {
        toast.error(response.message || 'Failed to delete leadership role');
      }
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete leadership role');
    } finally {
      setShowDeleteModal(false);
      setRoleToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setRoleToDelete(null);
  };

  const handleEdit = (role: LeadershipRole) => {
    console.log('Edit button clicked for role:', role);
    setEditRole({ abbr: role.abbr, leadership_role: role.leadership_role });
    setEditingId(role.id);
    setShowContextMenu(null);
  };

  const handleContextMenu = (roleId: string) => {
    setShowContextMenu(showContextMenu === roleId ? null : roleId);
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showContextMenu) {
        // Check if the click is outside the dropdown menu
        const target = event.target as Element;
        if (!target.closest('.context-menu')) {
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
    setEditRole({ abbr: '', leadership_role: '' });
  };

  const cancelAdd = () => {
    setIsAdding(false);
    setNewRole({ abbr: '', leadership_role: '' });
    setShowContextMenu(null);
  };

  return (
    <div>
      {/* Search Input */}
      <div className="mb-4" style={{ display: 'none' }}>
        <div className="relative">
          <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Header Row */}
      <div className="w-[600px] grid grid-cols-[0.5fr_0.5fr_2fr_1fr] gap-2 mb-2">
        {['ID', 'ABBR', 'Leadership Role', ' '].map((header) => (
          header === ' ' ? (
            <div key={header}>
            </div>
          ) : (
            <div
              key={header}
              className="px-3 py-2 text-xs font-medium text-gray-900 uppercase tracking-wider rounded-md bg-[#F0F7FF] border border-[#4A5F7A] flex items-center justify-between"
            >
              <span>{header}</span>
              <svg className="w-3 h-3 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )
        ))}
      </div>

      {/* Data Rows */}
      {filteredRoles.length === 0 && !isAdding ? (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No leadership roles found matching your search' : 'No leadership roles found'}
        </div>
      ) : filteredRoles.length > 0 ? (
        filteredRoles.map((role) => (
          <div key={role.id} className="w-[600px] grid grid-cols-[0.5fr_0.5fr_2fr_1fr] gap-2 mb-2">
            {/* ID */}
            <div className="bg-white px-3 py-2 text-sm font-medium text-gray-900 rounded-md border border-gray-200">
              {role.id}
            </div>

            {/* Abbreviation */}
            <div className="bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200">
              {editingId === role.id ? (
                <input
                  type="text"
                  value={editRole.abbr}
                  onChange={(e) => setEditRole({ ...editRole, abbr: e.target.value })}
                  className="w-full border-none outline-none text-sm bg-transparent"
                  placeholder="Abbreviation"
                />
              ) : (
                role.abbr
              )}
            </div>

            {/* Leadership Role */}
            <div className="bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200">
              {editingId === role.id ? (
                <input
                  type="text"
                  value={editRole.leadership_role}
                  onChange={(e) => setEditRole({ ...editRole, leadership_role: e.target.value })}
                  className="w-full border-none outline-none text-sm bg-transparent"
                  placeholder="Leadership Role Title"
                />
              ) : (
                role.leadership_role
              )}
            </div>

            {/* Actions */}
            <div className="w-full break-words px-3 py-2 text-sm font-medium relative">
              <div className="relative">
                {editingId === role.id ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSave(role.id)}
                      className="hover:opacity-80 transition-opacity duration-200"
                    >
                      <img src={saveIcon} alt="Save" className="w-5 h-5" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleContextMenu(role.id)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                )}

                {showContextMenu === role.id && !isAdding && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200 context-menu">
                    <div className="py-1">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleEdit(role);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm transition-colors duration-200 text-gray-700 hover:bg-[#D9C7A1] hover:text-gray-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Add button clicked from dropdown');
                          setIsAdding(true);
                          setShowContextMenu(null);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm transition-colors duration-200 text-gray-700 hover:bg-[#D9C7A1] hover:text-gray-900"
                      >
                        Add
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Delete button clicked');
                          handleDeleteClick(role.id);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm transition-colors duration-200 text-gray-700 hover:bg-[#D9C7A1] hover:text-gray-900"
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

      {/* Add New Role Input Row */}
      {isAdding && (
        <div className="w-[600px] grid grid-cols-[0.5fr_0.5fr_2fr_1fr] gap-2 mb-2">
          {/* ID */}
          <div className="bg-white px-3 py-2 text-sm rounded-md border border-gray-200">
            <input
              type="text"
              value="Auto generated"
              placeholder="Auto generated"
              className="w-full border-none outline-none text-sm text-gray-500"
              disabled
            />
          </div>

          {/* Abbreviation */}
          <div className="bg-white px-3 py-2 text-sm rounded-md border border-gray-200">
            <input
              type="text"
              value={newRole.abbr}
              onChange={(e) => setNewRole({ ...newRole, abbr: e.target.value })}
              placeholder="Add an abbreviation"
              className="w-full border-none outline-none text-sm bg-transparent"
            />
          </div>

          {/* Leadership Role */}
          <div className="bg-white px-3 py-2 text-sm rounded-md border border-gray-200">
            <input
              type="text"
              value={newRole.leadership_role}
              onChange={(e) => setNewRole({ ...newRole, leadership_role: e.target.value })}
              placeholder="Add a title"
              className="w-full border-none outline-none text-sm bg-transparent"
            />
          </div>

          {/* Actions */}
          <div className="w-full break-words px-3 py-2 text-sm font-medium relative">
            <div className="flex space-x-2">
              <button
                onClick={handleSaveNewRole}
                className="hover:opacity-80 transition-opacity duration-200"
              >
                <img src={saveIcon} alt="Save" className="w-5 h-5" />
              </button>
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

      {/* Add and Save Buttons */}
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
        <button
          onClick={handleSaveNewRole}
          disabled={!isAdding}
          className={`bg-[#C2A46D] text-white font-medium rounded-[30px] w-[105px] h-[44px] px-[10px] py-[10px] transition-colors duration-200 ${!isAdding
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-[#b89a6a]'
            }`}
        >
          Save
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Leadership Role"
        message="Are you sure you want to delete this leadership role? This action cannot be undone."
        confirmText="Yes"
        cancelText="No"
        confirmButtonColor="text-red-600"
      />
    </div>
  );
};

export default LeadershipRolesTable;
