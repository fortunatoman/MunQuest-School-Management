import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useApp } from '../../contexts/AppContext';
import { ConfirmationModal } from '../ui';
import { updateAreaStatusApi, deleteAreaApi } from '../../apis/areas.ts';
import { mergeLocalitiesApi } from '../../apis/localities.ts';
import { deleteLocalityApi } from '../../apis/localities.ts';
interface Locality {
    id: string;
    code: string;
    name: string;
    area: {
        code: string;
        name: string;
    };
    linkedSchoolsCount?: number;
    linkedStudentsCount?: number;
    status?: string;
    created_at?: string;
    updated_at?: string;
}

interface LocalitiesTableProps {
    localities: Locality[];
    onAction: (action: string, localityId: string) => void;
    localityType?: 'localities' | 'areas';
}

const LocalitiesTable: React.FC<LocalitiesTableProps> = ({ localities, onAction }) => {
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [updatingLocalityId, setUpdatingLocalityId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [localityToDelete, setLocalityToDelete] = useState<string | null>(null);
    const [filteredLocalities, setFilteredLocalities] = useState<any[]>([]);
    const [showNewRow, setShowNewRow] = useState<boolean>(false);
    const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
    const [newRowData, setNewRowData] = useState({
        localityCode: '',
        localityName: '',
        areaCode: '',
        areaName: '',
        linkedSchools: '',
        linkedStudents: '',
        status: 'Active'
    });
    const [editingLocalityId, setEditingLocalityId] = useState<string | null>(null);
    const [editingRowData, setEditingRowData] = useState<any>(null);
    const [editValidationErrors, setEditValidationErrors] = useState<{ [key: string]: string }>({});
    
    // Merge functionality state
    const [isMergeMode, setIsMergeMode] = useState<boolean>(false);
    const [selectedLocalities, setSelectedLocalities] = useState<string[]>([]);
    const [primaryLocalityId, setPrimaryLocalityId] = useState<string | null>(null);
    const [lockedRows, setLockedRows] = useState<string[]>([]);
    const [showMergeMessage, setShowMergeMessage] = useState<string>('');
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(7);
    
    const { refreshAreasData, refreshLocalitiesData, refreshSchoolsData } = useApp();
    // Handle clicking outside dropdown to close it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            // Check if click is outside any dropdown
            if (activeDropdown && !target.closest('.dropdown-container')) {
                setActiveDropdown(null);
            }
        };

        if (activeDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeDropdown]);

    // Handle clicking outside edit mode to close it
    useEffect(() => {
        const handleClickOutsideEdit = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            // Check if click is outside any edit input fields or save/cancel buttons
            if (editingLocalityId &&
                !target.closest('.edit-row-container') &&
                !target.closest('.edit-buttons-container')) {
                handleCancelEdit();
            }
        };

        if (editingLocalityId) {
            document.addEventListener('mousedown', handleClickOutsideEdit);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutsideEdit);
        };
    }, [editingLocalityId]);
    // Filter localities based on search term
    useEffect(() => {
        if (!localities || !Array.isArray(localities)) {
            setFilteredLocalities([]);
            return;
        }

        if (!searchTerm.trim()) {
            setFilteredLocalities(localities);
        } else {
            const filtered = localities.filter((locality: any) => {
                const searchLower = searchTerm.toLowerCase();
                const localityId = locality?.id?.toString() || '';
                const localityCode = locality.locality?.code || '';
                const localityName = locality.locality?.name || '';
                const areaCode = locality.area?.code || '';
                const areaId = locality.area?.id || '';
                const areaName = locality.area?.name || '';
                const linkedSchools = locality?.linkedSchoolsCount?.toString() || '';
                const linkedStudents = locality?.linkedStudentsCount?.toString() || '';
                const status = locality?.status || '';

                return (
                    localityId.toLowerCase().includes(searchLower) ||
                    localityCode.toLowerCase().includes(searchLower) ||
                    localityName.toLowerCase().includes(searchLower) ||
                    areaCode.toLowerCase().includes(searchLower) ||
                    areaId.toLowerCase().includes(searchLower) ||
                    areaName.toLowerCase().includes(searchLower) ||
                    linkedSchools.includes(searchLower) ||
                    linkedStudents.includes(searchLower) ||
                    status.toLowerCase().includes(searchLower)
                );
            });
            setFilteredLocalities(filtered);
        }
        // Reset to first page when search changes
        setCurrentPage(1);
    }, [searchTerm, localities]);

    // Calculate pagination values
    const totalPages = Math.ceil(filteredLocalities.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentLocalities = filteredLocalities.slice(startIndex, endIndex);

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

     const handleDropdownToggle = (localityId: string) => {
        setActiveDropdown(activeDropdown === localityId ? null : localityId);
    };

    // Delete confirmation handlers
    const handleDeleteConfirm = () => {
        if (localityToDelete) {
            setActiveDropdown(null); // Close dropdown
            // Find the locality data to get both localityId and areaId
            const localityData = filteredLocalities.find(loc => (loc?.area?.id || loc?.id) === localityToDelete);
            if (localityData) {
                handleAction('delete', localityData?.id || '', localityData?.area?.id || '');
            }
            setShowDeleteModal(false);
            setLocalityToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setLocalityToDelete(null);
    };

    const handleAction = async (action: string, localityId: string, areaId: string) => {
        try {
            setActiveDropdown(null); // Close dropdown immediately when action is triggered
            setUpdatingLocalityId(areaId || localityId);

            if (action === 'delete') {
                const response = await deleteAreaApi(areaId);
                const localityResponse = await deleteLocalityApi(localityId);
                if (response.success && localityResponse.success) {
                    toast.success(response.message || 'Locality deleted successfully');
                    await Promise.all([
                        refreshAreasData(),
                        refreshLocalitiesData(),
                        refreshSchoolsData()
                    ]);
                    onAction(action, localityId);
                } else {
                    toast.error(response.message || localityResponse.message || 'Failed to delete locality');
                }
            } else {
                const response = await updateAreaStatusApi(areaId, action);
                if (response.success) {
                    toast.success(response.message || `Locality ${action} successfully`);
                    await Promise.all([
                        refreshAreasData(),
                        refreshLocalitiesData(),
                        refreshSchoolsData()
                    ]);
                    onAction(action, localityId);
                } else {
                    toast.error(response.message || 'Failed to update locality');
                }
            }
        } catch (error: any) {
            console.log('Error updating locality:', error);
            toast.error(error.message || 'Failed to update locality');
        } finally {
            setUpdatingLocalityId(null);
        }
    };

    const handleAddNewRow = () => {
        setShowNewRow(true);
        setIsAddingNew(true);
        setNewRowData({
            localityCode: 'Auto generated',
            localityName: '',
            areaCode: 'Auto generated',
            areaName: '',
            linkedSchools: '',
            linkedStudents: '',
            status: 'Active'
        });
    };

    const handleAddNew = () => {
        handleAddNewRow();
    };

    const handleNewRowInputChange = (field: string, value: string) => {
        setNewRowData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveNewRow = async () => {
        try {
            // Validate required fields
            if (!newRowData.localityName.trim() || !newRowData.areaName.trim()) {
                toast.error('Please fill in all required fields');
                return;
            }

            // Here you would typically call an API to create the new locality/area
            // For now, we'll just show a success message and close the row
            toast.success('New area added successfully');
            setShowNewRow(false);
            setIsAddingNew(false);
            setNewRowData({
                localityCode: '',
                localityName: '',
                areaCode: '',
                areaName: '',
                linkedSchools: '',
                linkedStudents: '',
                status: 'Active'
            });

            // Refresh data
            await Promise.all([
                refreshAreasData(),
                refreshLocalitiesData(),
                refreshSchoolsData()
            ]);
        } catch (error: any) {
            console.log('Error saving new row:', error);
            toast.error('Failed to save new area');
        }
    };

    const handleSaveNew = () => {
        handleSaveNewRow();
    };

    const handleEditRow = (locality: any) => {
        setEditingLocalityId(locality?.area?.id || locality?.id);
        setEditingRowData({
            id: locality?.area?.id || locality?.id,
            localityCode: locality?.locality?.code || '',
            localityName: locality?.locality?.name || '',
            areaCode: locality?.area?.code || '',
            areaName: locality?.area?.name || '',
            status: locality?.status || 'Active'
        });
        setEditValidationErrors({});
        setActiveDropdown(null);
    };

    const handleCancelEdit = () => {
        setEditingLocalityId(null);
        setEditingRowData(null);
        setEditValidationErrors({});
    };

    // Merge functionality handlers
    const handleMergeModeToggle = () => {
        if (isMergeMode) {
            // Cancel merge mode
            setIsMergeMode(false);
            setSelectedLocalities([]);
            setPrimaryLocalityId(null);
            setLockedRows([]);
            setShowMergeMessage('');
        } else {
            // Enter merge mode
            setIsMergeMode(true);
            setSelectedLocalities([]);
            setPrimaryLocalityId(null);
            setLockedRows([]);
            setShowMergeMessage('');
        }
    };

    const handleLocalitySelection = (localityId: string) => {
        if (lockedRows.includes(localityId)) {
            setShowMergeMessage('Unlock to merge');
            setTimeout(() => setShowMergeMessage(''), 3000);
            return;
        }

        if (selectedLocalities.includes(localityId)) {
            // Deselect locality
            setSelectedLocalities(prev => prev.filter(id => id !== localityId));
            if (primaryLocalityId === localityId) {
                setPrimaryLocalityId(null);
            }
        } else {
            // Check if already have 2 selected
            if (selectedLocalities.length >= 2) {
                // setShowMergeMessage('Merge happens one pair at a time.');
                toast.warning('Merge happens one pair at a time.');
                // setTimeout(() => setShowMergeMessage(''), 3000);
                return;
            }
            
            // Select locality
            setSelectedLocalities(prev => [...prev, localityId]);
            
            // Set as primary if it's the first selection or if merge was invoked from this row
            if (selectedLocalities.length === 0 || !primaryLocalityId) {
                setPrimaryLocalityId(localityId);
            }
        }
    };

    const handleMergeExecute = async () => {
        if (selectedLocalities.length !== 2 || !primaryLocalityId) {
            setShowMergeMessage('Please select exactly two localities and ensure primary is set.');
            toast.warning('Please select exactly two localities and ensure primary is set.');
            // setTimeout(() => setShowMergeMessage(''), 3000);
            return;
        }

        try {
            // Here you would call the merge API
            // For now, we'll simulate the merge
            const secondaryLocalityId = selectedLocalities.find(id => id !== primaryLocalityId);
            
            let response = await mergeLocalitiesApi(primaryLocalityId || '', secondaryLocalityId || '');
            if (response.success) {
                toast.success('Localities merged successfully');
            } else {
                toast.error(response.message || 'Failed to merge localities');
            }

            // Simulate API call
            // toast.success('Localities merged successfully');
            
            // Reset merge state
            setSelectedLocalities([]);
            setPrimaryLocalityId(null);
            setLockedRows([]);
            setShowMergeMessage('');
            
            // Refresh data
            await Promise.all([
                refreshAreasData(),
                refreshLocalitiesData(),
                refreshSchoolsData()
            ]);
            
            // Ask if user wants to merge another duplicate
            const continueMerge = window.confirm('Merge another duplicate?');
            if (!continueMerge) {
                setIsMergeMode(false);
            }
            
        } catch (error: any) {
            console.log('Error merging localities:', error);
            toast.error('Failed to merge localities');
        }
    };

    const getStatusColor = (status: string | undefined) => {
        if (!status) return 'text-gray-600';

        switch (status.toLowerCase()) {
            case 'active':
                return 'text-green-600';
            case 'blocked':
                return 'text-red-600';
            case 'flagged':
                return 'text-yellow-500';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <div>
            {/* Search Input - Hidden as search is handled in parent */}
            <div className="mb-4" style={{ display: 'none' }}>
                <input
                    type="text"
                    placeholder="Search localities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Header Row */}
            <div className="flex gap-2 mb-2 w-full">
                {/* Locality Code */}
                <div className="w-32 px-3 py-2 text-xs font-medium text-gray-900 uppercase tracking-wider rounded-md bg-[#F0F7FF] border border-[#4A5F7A] flex items-center justify-between">
                    <span>Locality Code</span>
                    <svg className="w-3 h-3 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>

                {/* Locality Name */}
                <div className="w-40 px-3 py-2 text-xs font-medium text-gray-900 uppercase tracking-wider rounded-md bg-[#F0F7FF] border border-[#4A5F7A] flex items-center justify-between">
                    <span>Locality Name</span>
                    <svg className="w-3 h-3 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>

                {/* Area Code */}
                <div className="w-32 px-3 py-2 text-xs font-medium text-gray-900 uppercase tracking-wider rounded-md bg-[#F0F7FF] border border-[#4A5F7A] flex items-center justify-between">
                    <span>Area Code</span>
                    <svg className="w-3 h-3 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>

                {/* Area Name */}
                <div className="w-40 px-3 py-2 text-xs font-medium text-gray-900 uppercase tracking-wider rounded-md bg-[#F0F7FF] border border-[#4A5F7A] flex items-center justify-between">
                    <span>Area Name</span>
                    <svg className="w-3 h-3 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>

                {/* Linked Schools (Area) */}
                <div className="w-36 px-3 py-2 text-xs font-medium text-gray-900 uppercase tracking-wider rounded-md bg-[#F0F7FF] border border-[#4A5F7A] flex items-center justify-between">
                    <span>Linked Schools (Area)</span>
                    <svg className="w-3 h-3 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>

                {/* Linked Students (Area) */}
                <div className="w-36 px-3 py-2 text-xs font-medium text-gray-900 uppercase tracking-wider rounded-md bg-[#F0F7FF] border border-[#4A5F7A] flex items-center justify-between">
                    <span>Linked Students (Area)</span>
                    <svg className="w-3 h-3 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>

                {/* Status */}
                <div className="w-24 px-3 py-2 text-xs font-medium text-gray-900 uppercase tracking-wider rounded-md bg-[#F0F7FF] border border-[#4A5F7A] flex items-center">
                    <span>Status</span>
                </div>

                {/* Actions */}
                <div className="w-16 px-3 py-2 text-xs font-medium text-gray-900 uppercase tracking-wider rounded-md flex items-center">
                    <span></span>
                </div>

                {/* Checkbox column for merge mode */}
                {isMergeMode && (
                    <div className="w-8 px-3 py-2 text-xs font-medium text-gray-900 uppercase tracking-wider">
                        <span></span>
                    </div>
                )}
            </div>

            <div className="w-full">
                {/* Data Rows */}
                {!currentLocalities || currentLocalities.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        {searchTerm ? 'No localities found matching your search' : 'No localities found'}
                    </div>
                ) : currentLocalities.length > 0 ? (
                    currentLocalities.map((locality: any) => {
                        const isEditing = editingLocalityId === (locality?.area?.id || locality?.id);
                        return (
                            <div key={locality?.id || Math.random()} className={`flex gap-2 mb-2 ${isEditing ? 'edit-row-container' : ''}`}>
                                {/* Locality Code */}
                                <div className="w-32 bg-white px-3 py-2 text-sm font-medium text-gray-900 rounded-md border border-gray-200 break-words">
                                    {locality?.locality?.code || 'N/A'}
                                </div>

                                {/* Locality Name */}
                                <div className="w-40 bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200 break-words">
                                    {isEditing ? (
                                        <div>
                                            <input
                                                type="text"
                                                value={editingRowData?.localityName || ''}
                                                className="w-full text-sm text-gray-500 focus:outline-none border-0 p-0 bg-transparent cursor-not-allowed"
                                                placeholder="Read-only"
                                                readOnly
                                                disabled
                                            />
                                        </div>
                                    ) : (
                                        locality?.locality?.name || 'N/A'
                                    )}
                                </div>

                                {/* Area Code */}
                                <div className="w-32 bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200 break-words">
                                    {locality?.area?.code || 'N/A'}
                                </div>

                                {/* Area Name */}
                                <div className="w-40 bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200 break-words">
                                    {isEditing ? (
                                        <div>
                                            <input
                                                type="text"
                                                value={editingRowData?.areaName || ''}
                                                onChange={(e) => setEditingRowData({ ...editingRowData, areaName: e.target.value })}
                                                className={`w-full text-sm text-gray-900 focus:outline-none border-0 p-0 ${editValidationErrors.areaName ? 'border-red-500' : ''}`}
                                                placeholder="Enter area name"
                                            />
                                            {editValidationErrors.areaName && (
                                                <div className="text-xs text-red-500 mt-1">{editValidationErrors.areaName}</div>
                                            )}
                                        </div>
                                    ) : (
                                        locality?.area?.name || 'N/A'
                                    )}
                                </div>

                                {/* Linked Schools (Area) */}
                                <div className="w-36 bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200 break-words">
                                    {locality?.linkedSchoolsCount || '-'}
                                </div>

                                {/* Linked Students (Area) */}
                                <div className="w-36 bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200 break-words">
                                    {locality?.linkedStudentsCount || '-'}
                                </div>

                                {/* Status */}
                                <div className="w-24 bg-white px-3 py-2 text-sm rounded-md border border-gray-200 break-words">
                                    {updatingLocalityId === (locality?.area?.id || locality?.id) ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                                            <span className="text-gray-500">Updating</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <span className={`font-medium ${getStatusColor(locality.status)}`}>
                                                {locality.status}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Checkbox column for merge mode */}
                                {isMergeMode && (
                                    <div className="w-8 px-3 py-2 text-sm font-medium text-gray-900 flex items-center justify-center">
                                        <div className="flex items-center space-x-1">
                                            <input
                                                type="checkbox"
                                                checked={selectedLocalities.includes(locality?.area?.id || locality?.id)}
                                                onChange={() => handleLocalitySelection(locality?.area?.id || locality?.id)}
                                                disabled={lockedRows.includes(locality?.area?.id || locality?.id)}
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                title={lockedRows.includes(locality?.area?.id || locality?.id) ? 'Unlock to merge' : 'Select for merge'}
                                            />
                                            {primaryLocalityId === (locality?.area?.id || locality?.id) && (
                                                <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="w-16 px-3 py-2 text-sm font-medium flex items-center justify-left">
                                    <div className="relative flex items-center justify-left dropdown-container">
                                        {isEditing ? (
                                            <div className="flex space-x-1 edit-buttons-container">
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="text-red-600 hover:text-red-800 focus:outline-none"
                                                    title="Cancel editing"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleDropdownToggle(locality?.area?.id || locality?.id || '')}
                                                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                </svg>
                                            </button>
                                        )}

                                        {activeDropdown === (locality?.area?.id || locality?.id) && !isEditing && (
                                            <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-[9999] border border-gray-300 dropdown-container">
                                                <div className="py-1">
                                                    {/* Main management options - always show for all statuses */}
                                                    <button
                                                        onClick={() => handleEditRow(locality)}
                                                        disabled={updatingLocalityId === (locality?.area?.id || locality?.id)}
                                                        className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingLocalityId === (locality?.area?.id || locality?.id)
                                                            ? 'text-gray-400 cursor-not-allowed'
                                                            : 'text-gray-700 hover:bg-[#C6DAF4] hover:text-gray-900'
                                                            }`}
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        disabled={updatingLocalityId === (locality?.area?.id || locality?.id)}
                                                        className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingLocalityId === (locality?.area?.id || locality?.id)
                                                            ? 'text-gray-400 cursor-not-allowed'
                                                            : 'text-gray-700 hover:bg-[#C6DAF4] hover:text-gray-900'
                                                            }`}
                                                    >
                                                        Add
                                                    </button>

                                                    <button
                                                        disabled={updatingLocalityId === (locality?.area?.id || locality?.id)}
                                                        className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingLocalityId === (locality?.area?.id || locality?.id)
                                                            ? 'text-gray-400 cursor-not-allowed'
                                                            : 'text-gray-700 hover:bg-[#C6DAF4] hover:text-gray-900'
                                                            }`}
                                                    >
                                                        List
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            setActiveDropdown(null);
                                                            handleMergeModeToggle();
                                                        }}
                                                        disabled={updatingLocalityId === (locality?.area?.id || locality?.id)}
                                                        className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingLocalityId === (locality?.area?.id || locality?.id)
                                                            ? 'text-gray-400 cursor-not-allowed'
                                                            : 'text-gray-700 hover:bg-[#C6DAF4] hover:text-gray-900'
                                                            }`}
                                                    >
                                                        {isMergeMode ? 'Cancel Merge' : 'Merge'}
                                                    </button>

                                                    {/* Status-specific buttons based on current status */}
                                                    {/* Show Active button when status is not active */}
                                                    {locality?.status?.toLowerCase() !== 'active' && (
                                                        <button
                                                            onClick={() => handleAction('active', locality?.id || '', locality?.area?.id || '')}
                                                            disabled={updatingLocalityId === (locality?.area?.id || locality?.id)}
                                                            className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingLocalityId === (locality?.area?.id || locality?.id)
                                                                ? 'text-gray-400 cursor-not-allowed'
                                                                : 'text-gray-700 hover:bg-[#C6DAF4] hover:text-gray-900'
                                                                }`}
                                                        >
                                                            Active
                                                        </button>
                                                    )}

                                                    {/* Show Flag button when status is not flagged */}
                                                    {locality?.status?.toLowerCase() !== 'flagged' && (
                                                        <button
                                                            onClick={() => handleAction('flagged', locality?.id || '', locality?.area?.id || '')}
                                                            disabled={updatingLocalityId === (locality?.area?.id || locality?.id)}
                                                            className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingLocalityId === (locality?.area?.id || locality?.id)
                                                                ? 'text-gray-400 cursor-not-allowed'
                                                                : 'text-gray-700 hover:bg-[#C6DAF4] hover:text-gray-900'
                                                                }`}
                                                        >
                                                            Flag
                                                        </button>
                                                    )}

                                                    {/* Show Block button when status is not blocked */}
                                                    {locality?.status?.toLowerCase() !== 'blocked' && (
                                                        <button
                                                            onClick={() => handleAction('blocked', locality?.id || '', locality?.area?.id || '')}
                                                            disabled={updatingLocalityId === (locality?.area?.id || locality?.id)}
                                                            className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingLocalityId === (locality?.area?.id || locality?.id)
                                                                ? 'text-gray-400 cursor-not-allowed'
                                                                : 'text-gray-700 hover:bg-[#C6DAF4] hover:text-gray-900'
                                                                }`}
                                                        >
                                                            Block
                                                        </button>
                                                    )}

                                                    {/* Delete button - always show */}
                                                    <button
                                                        onClick={() => {
                                                            setLocalityToDelete(locality?.area?.id || locality?.id || '');
                                                            setShowDeleteModal(true);
                                                        }}
                                                        disabled={updatingLocalityId === (locality?.area?.id || locality?.id)}
                                                        className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingLocalityId === (locality?.area?.id || locality?.id)
                                                            ? 'text-gray-400 cursor-not-allowed'
                                                            : 'text-gray-700 hover:bg-[#C6DAF4] hover:text-gray-900'
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
                        );
                    })
                ) : null}
            </div>

            {/* New Row Input */}
            {showNewRow && (
                <div className="flex gap-2 mb-2">
                    {/* Locality Code */}
                    <div className="w-32 bg-white px-3 py-2 text-sm text-gray-500 rounded-md border border-gray-200">
                        {newRowData.localityCode}
                    </div>

                    {/* Locality Name */}
                    <div className="w-40 bg-white px-3 py-2 text-sm rounded-md border border-gray-200">
                        <input
                            type="text"
                            value={newRowData.localityName}
                            onChange={(e) => handleNewRowInputChange('localityName', e.target.value)}
                            placeholder="Enter locality name"
                            className="w-full border-none outline-none text-gray-900"
                        />
                    </div>

                    {/* Area Code */}
                    <div className="w-32 bg-white px-3 py-2 text-sm text-gray-500 rounded-md border border-gray-200">
                        {newRowData.areaCode}
                    </div>

                    {/* Area Name */}
                    <div className="w-40 bg-white px-3 py-2 text-sm rounded-md border border-gray-200">
                        <input
                            type="text"
                            value={newRowData.areaName}
                            onChange={(e) => handleNewRowInputChange('areaName', e.target.value)}
                            placeholder="Add area"
                            className="w-full border-none outline-none text-gray-900"
                        />
                    </div>

                    {/* Linked Schools (Area) */}
                    <div className="w-36 bg-white px-3 py-2 text-sm text-gray-500 rounded-md border border-gray-200">
                        -
                    </div>

                    {/* Linked Students (Area) */}
                    <div className="w-36 bg-white px-3 py-2 text-sm text-gray-500 rounded-md border border-gray-200">
                        -
                    </div>

                    {/* Status */}
                    <div className="w-24 bg-white px-3 py-2 text-sm rounded-md border border-gray-200">
                        <select
                            value={newRowData.status}
                            onChange={(e) => handleNewRowInputChange('status', e.target.value)}
                            className="w-full border-none outline-none text-gray-900 bg-transparent"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>

                    {/* Actions */}
                    <div className="w-16 px-3 py-2 text-sm font-medium relative">
                        <div className="relative flex items-center justify-left">
                            <button
                                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Checkbox column for merge mode */}
                    {isMergeMode && (
                        <div className="w-8 bg-gray-100 px-3 py-2 text-sm text-gray-500 rounded-md border border-gray-200 flex items-center justify-center">
                            -
                        </div>
                    )}
                </div>
            )}

            {/* Pagination Controls */}
            {filteredLocalities.length > 0 && (
                <div className="flex items-center justify-between mt-6 px-4">
                    <div className="text-sm text-gray-600">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredLocalities.length)} of {filteredLocalities.length} localities
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
                                // Show first page, last page, current page, and pages around current
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

            {/* Merge Mode Messages */}
            {isMergeMode && showMergeMessage && (
                <div className="mt-4 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800">
                    {showMergeMessage}
                </div>
            )}

            <div className="flex justify-between items-center mt-6 mr-[110px]">
                <div className="flex space-x-4">
                    <button
                        onClick={handleAddNew}
                        disabled={isAddingNew}
                        className={`bg-[#C2A46D] text-white font-medium rounded-[30px] w-[105px] h-[44px] px-[10px] py-[10px] transition-colors duration-200 ${isAddingNew
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-[#9a7849]'
                            }`}
                    >
                        Add
                    </button>
                    <button
                        onClick={handleSaveNew}
                        disabled={!isAddingNew}
                        className={`bg-[#C2A46D] text-white font-medium rounded-[30px] w-[105px] h-[44px] px-[10px] py-[10px] transition-colors duration-200 ${!isAddingNew
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-[#b89a6a]'
                            }`}
                    >
                        Save
                    </button>
                </div>
                
                {/* Merge and Cancel buttons on the right */}
                {isMergeMode && (
                    <div className="flex space-x-4">
                        <button
                            onClick={handleMergeModeToggle}
                            className="bg-[#C2A46D] text-white font-medium rounded-[30px] w-[105px] h-[44px] px-[10px] py-[10px] transition-colors duration-200 hover:bg-[#9a7849]"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleMergeExecute}
                            disabled={selectedLocalities.length !== 2 || !primaryLocalityId}
                            className={`bg-[#C2A46D] text-white font-medium rounded-[30px] w-[105px] h-[44px] px-[10px] py-[10px] transition-colors duration-200 flex items-center justify-center ${
                                selectedLocalities.length !== 2 || !primaryLocalityId
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:bg-[#9a7849]'
                            }`}
                        >
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                            Merge
                        </button>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Confirm Delete"
                message="Are you sure you want to delete this locality? This action cannot be undone."
                confirmText="Yes"
                cancelText="No"
                confirmButtonColor="text-red-600"
            />
        </div>
    );
};

export default LocalitiesTable;
