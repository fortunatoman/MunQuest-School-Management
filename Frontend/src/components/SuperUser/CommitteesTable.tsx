import React, { useState, useEffect } from 'react';
import { createCommitteeApi, updateCommitteeApi, deleteCommitteeApi } from '../../apis/Committees';
import saveIcon from '../../assets/save_icon.svg';
import ConfirmationModal from '../ui/ConfirmationModal';
import { toast } from 'sonner';

interface CommitteesTableProps {
  committees: any[];
  onRefresh: () => void;
  committeeType: 'country' | 'role' | 'crisis' | 'open';
}

const CommitteesTable: React.FC<CommitteesTableProps> = ({ committees, onRefresh, committeeType }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showContextMenu, setShowContextMenu] = useState<string | null>(null);
  const [newCommittee, setNewCommittee] = useState({ abbr: '', committee: '' });
  const [editCommittee, setEditCommittee] = useState({ abbr: '', committee: '' });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredCommittees, setFilteredCommittees] = useState<any[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [committeeToDelete, setCommitteeToDelete] = useState<string | null>(null);
  
  // Filter committees based on committee type and search term
  useEffect(() => {
    let filtered = committees.filter((committee) => {
      // Filter by committee type (category)
      return committee.category === committeeType;
    });

    // Apply search filter if search term exists
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((committee) => {
        return (
          String(committee.id).toLowerCase().includes(searchLower) ||
          committee.abbr.toLowerCase().includes(searchLower) ||
          committee.committee.toLowerCase().includes(searchLower)
        );
      });
    }

    setFilteredCommittees(filtered);
  }, [searchTerm, committees, committeeType]);

  const handleSaveNewCommittee = async () => {
    if (!newCommittee.abbr.trim() || !newCommittee.committee.trim()) {
      return;
    }

    try {
      const response = await createCommitteeApi(newCommittee.abbr.trim(), newCommittee.committee.trim(), committeeType);
      if (response.success) {
        toast.success('Committee created successfully');
      } else {
        toast.error(response.message || 'Failed to create committee');
      }
      setNewCommittee({ abbr: '', committee: '' });
      setIsAdding(false);
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create committee');
    }
  };

  const handleSave = async (committeeId: string) => {
    if (!editCommittee.abbr.trim() || !editCommittee.committee.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const response = await updateCommitteeApi(committeeId, editCommittee.abbr.trim(), editCommittee.committee.trim(), committeeType);
      if (response.success) {
        toast.success('Committee updated successfully');
      } else {
        toast.error(response.message || 'Failed to update committee');
      }
      setEditCommittee({ abbr: '', committee: '' });
      setEditingId(null);
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update committee');
    }
  };

  const handleDeleteClick = (committeeId: string) => {
    setCommitteeToDelete(committeeId);
    setShowDeleteModal(true);
    setShowContextMenu(null);
  };

  const handleDeleteConfirm = async () => {
    if (!committeeToDelete) return;

    try {
      const response = await deleteCommitteeApi(committeeToDelete);
      if (response.success) {
        toast.success('Committee deleted successfully');
      } else {
        toast.error(response.message || 'Failed to delete committee');
      }
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete committee');
    } finally {
      setShowDeleteModal(false);
      setCommitteeToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setCommitteeToDelete(null);
  };

  const handleEdit = (committee: any) => {
    console.log('Edit button clicked for committee:', committee);
    setEditCommittee({ abbr: committee.abbr, committee: committee.committee });
    setEditingId(committee.id);
    setShowContextMenu(null);
  };

  const handleContextMenu = (committeeId: string) => {
    setShowContextMenu(showContextMenu === committeeId ? null : committeeId);
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
    setEditCommittee({ abbr: '', committee: '' });
  };

  const cancelAdd = () => {
    setIsAdding(false);
    setNewCommittee({ abbr: '', committee: '' });
    setShowContextMenu(null);
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
      <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: '70px 120px 0.5fr 60px' }}>
        {['ID', 'ABBR', 'Committee', ' '].map((header) => (
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
      {filteredCommittees.length === 0 && !isAdding ? (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No committees found matching your search' : 'No committees found'}
        </div>
      ) : filteredCommittees.length > 0 ? (
        filteredCommittees.map((committee) => (
          <div key={committee.id} className="grid gap-2 mb-2" style={{ gridTemplateColumns: '70px 120px 0.5fr 60px' }}>
            {/* ID */}
            <div className="bg-white px-3 py-2 text-sm font-medium text-gray-900 rounded-md border border-gray-200">
              {committee.id}
            </div>

            {/* Abbreviation */}
            <div className="bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200">
              {editingId === committee.id ? (
                <input
                  type="text"
                  value={editCommittee.abbr}
                  onChange={(e) => setEditCommittee({ ...editCommittee, abbr: e.target.value })}
                  className="w-full border-none outline-none text-sm bg-transparent"
                  placeholder="Abbreviation"
                />
              ) : (
                committee.abbr
              )}
            </div>

            {/* Committee Name */}
            <div className="bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200">
              {editingId === committee.id ? (
                <input
                  type="text"
                  value={editCommittee.committee}
                  onChange={(e) => setEditCommittee({ ...editCommittee, committee: e.target.value })}
                  className="w-full border-none outline-none text-sm bg-transparent"
                  placeholder="Committee Name"
                />
              ) : (
                committee.committee
              )}
            </div>

            {/* Actions */}
            <div className="px-3 py-2 text-sm font-medium relative">
              <div className="relative">
                {editingId === committee.id ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSave(committee.id)}
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
                    onClick={() => handleContextMenu(committee.id)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                )}

                {showContextMenu === committee.id && !isAdding && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200 context-menu">
                    <div className="py-1">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Edit button clicked');
                          handleEdit(committee);
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
                          handleDeleteClick(committee.id);
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

      {/* Add New Committee Input Row */}
      {isAdding && (
        <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: '70px 120px 0.5fr 60px' }}>
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
              value={newCommittee.abbr}
              onChange={(e) => setNewCommittee({ ...newCommittee, abbr: e.target.value })}
              placeholder="Add an abbreviation"
              className="w-full border-none outline-none text-sm bg-transparent"
            />
          </div>

          {/* Committee Name */}
          <div className="bg-white px-3 py-2 text-sm rounded-md border border-gray-200">
            <input
              type="text"
              value={newCommittee.committee}
              onChange={(e) => setNewCommittee({ ...newCommittee, committee: e.target.value })}
              placeholder="Add a name"
              className="w-full border-none outline-none text-sm bg-transparent"
            />
          </div>

          {/* Actions */}
          <div className="px-3 py-2 text-sm font-medium relative">
            <div className="flex space-x-2">
              <button
                onClick={handleSaveNewCommittee}
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
          onClick={handleSaveNewCommittee}
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
        title="Delete Committee"
        message="Are you sure you want to delete this committee? This action cannot be undone."
        confirmText="Yes"
        cancelText="No"
        confirmButtonColor="text-red-600"
      />
    </div>
  );
};

export default CommitteesTable;
