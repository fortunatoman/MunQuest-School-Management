import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useApp } from '../../contexts/AppContext';
import { ConfirmationModal } from '../ui';
import { updateSchoolStatusApi, deleteSchoolApi, createSchoolApi, updateSchoolApi, mergeSchoolsApi } from '../../apis/schools.ts';
import { generateSchoolCode } from '../../utils/schoolCodeGenerator';
import saveIcon from '../../assets/save_icon.svg'

interface School {
    id: string;
    code: string;
    name: string;
    locality: {
        name: string;
    };
    area: {
        name: string;
    };
    status?: string;
    created_at?: string;
    updated_at?: string;
}

interface SchoolsTableProps {
    schools: School[];
    onAction: (action: string, schoolId: string) => void;
    schoolType?: 'schools' | 'localities';
}

const SchoolsTable: React.FC<SchoolsTableProps> = ({ schools, onAction }) => {
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [updatingSchoolId, setUpdatingSchoolId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [schoolToDelete, setSchoolToDelete] = useState<string | null>(null);
    const [filteredSchools, setFilteredSchools] = useState<any[]>([]);
    const [showNewRow, setShowNewRow] = useState<boolean>(false);
    const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
    const [newRowData, setNewRowData] = useState({
        schoolCode: '',
        schoolName: '',
        locality: '',
        locality_id: '',
        area: '',
        area_id: '',
        status: 'Active'
    });
    const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null);
    const [editingRowData, setEditingRowData] = useState<any>(null);
    const [editValidationErrors, setEditValidationErrors] = useState<{ [key: string]: string }>({});
    const [filteredAreas, setFilteredAreas] = useState<any[]>([]);
    const [filteredAreasForEdit, setFilteredAreasForEdit] = useState<any[]>([]);
    const { allSchools } = useApp();

    // Merge functionality state
    const [isMergeMode, setIsMergeMode] = useState<boolean>(false);
    const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
    const [primarySchoolId, setPrimarySchoolId] = useState<string | null>(null);
    const [lockedRows, setLockedRows] = useState<string[]>([]);
    const [showMergeMessage, setShowMergeMessage] = useState<string>('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(7);

    const { refreshSchoolsData, allLocalities, allAreas, refreshLocalitiesData, refreshAreasData } = useApp();
    const dropdownRef = useRef<HTMLDivElement>(null);
    // Fetch localities and areas data when component mounts
    useEffect(() => {
        if (allLocalities.length === 0) {
            refreshLocalitiesData();
        }
        if (allAreas.length === 0) {
            refreshAreasData();
        }
    }, [allLocalities.length, allAreas.length, refreshLocalitiesData, refreshAreasData]);

    // Generate school code when all required fields are filled
    useEffect(() => {
        if (showNewRow && newRowData.schoolName && newRowData.locality_id && newRowData.area_id) {
            const selectedLocality = allLocalities.find(loc => loc.id === Number(newRowData.locality_id));
            const selectedArea = filteredAreas.find(area => area.id === Number(newRowData.area_id));
            if (selectedLocality && selectedArea) {
                const existingCodes = allSchools.map(school => school.code).filter(Boolean);

                const generatedCode = generateSchoolCode(
                    newRowData.schoolName,
                    selectedLocality,
                    selectedArea,
                    existingCodes
                );

                setNewRowData(prev => ({
                    ...prev,
                    schoolCode: generatedCode
                }));
            }
        }
    }, [newRowData.schoolName, newRowData.locality_id, newRowData.area_id, allLocalities, filteredAreas, allSchools, showNewRow]);

    // Function to filter areas based on selected locality
    const filterAreasByLocality = (localityId: string) => {
        if (!localityId) {
            setFilteredAreas([]);
            return;
        }

        const areasInLocality = allAreas.filter(area => {
            return area.locality_id == localityId; // Use == for type coercion
        });

        setFilteredAreas(areasInLocality);
    };

    // Function to filter areas for edit mode based on selected locality
    const filterAreasForEditByLocality = (localityId: string) => {

        if (!localityId) {
            setFilteredAreasForEdit([]);
            return;
        }

        const areasInLocality = allAreas.filter(area => {
            return area.locality_id == localityId; // Use == for type coercion
        });

        setFilteredAreasForEdit(areasInLocality);
    };

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredSchools(schools);
        } else {
            const filtered = schools.filter((school: any) => {
                const searchLower = searchTerm.toLowerCase();
                const schoolId = school?.id?.toString() || '';
                const schoolCode = school?.code || '';
                const schoolName = school?.name || '';
                const locality = school?.locality?.name || '';
                const area = school?.area?.name || '';
                const status = school?.status || '';

                return (
                    schoolId.toLowerCase().includes(searchLower) ||
                    schoolCode.toLowerCase().includes(searchLower) ||
                    schoolName.toLowerCase().includes(searchLower) ||
                    locality.toLowerCase().includes(searchLower) ||
                    area.toLowerCase().includes(searchLower) ||
                    status.toLowerCase().includes(searchLower)
                );
            });
            setFilteredSchools(filtered);
        }
        // Reset to first page when search changes
        setCurrentPage(1);
    }, [searchTerm, schools]);

    // Calculate pagination values
    const totalPages = Math.ceil(filteredSchools.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentSchools = filteredSchools.slice(startIndex, endIndex);

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
            if (editingSchoolId &&
                !target.closest('.edit-row-container') &&
                !target.closest('.edit-buttons-container')) {
                handleCancelEdit();
            }
        };

        if (editingSchoolId) {
            document.addEventListener('mousedown', handleClickOutsideEdit);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutsideEdit);
        };
    }, [editingSchoolId]);

    const handleDropdownToggle = (schoolId: string) => {
        setActiveDropdown(activeDropdown === schoolId ? null : schoolId);
    };

    // Delete confirmation handlers
    const handleDeleteConfirm = () => {
        if (schoolToDelete) {
            handleAction('delete', schoolToDelete);
            setShowDeleteModal(false);
            setSchoolToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setSchoolToDelete(null);
    };

    const handleAction = async (action: string, schoolId: string) => {
        try {
            setActiveDropdown(null); // Close dropdown immediately when action is triggered
            setUpdatingSchoolId(schoolId);
            if (action === 'delete') {
                const response = await deleteSchoolApi(schoolId);
                if (response.success) {
                    toast.success(response.message || 'School deleted successfully');
                    await refreshSchoolsData();
                    onAction(action, schoolId);
                } else {
                    toast.error(response.message || 'Failed to delete school');
                }
            } else {
                const response = await updateSchoolStatusApi(schoolId, action);
                if (response.success) {
                    toast.success(response.message || `School ${action} successfully`);
                    await refreshSchoolsData();
                    onAction(action, schoolId);
                } else {
                    toast.error(response.message || 'Failed to update school');
                }
            }
        } catch (error: any) {
            console.log('Error updating school:', error);
            toast.error(error.message || 'Failed to update school');
        } finally {
            setUpdatingSchoolId(null);
        }
    };

    const handleSaveNewRow = async () => {
        try {
            if (!newRowData.schoolCode.trim() || !newRowData.schoolName.trim() || !newRowData.locality_id.trim() || !newRowData.area_id.trim()) {
                toast.error('Please fill in all required fields');
                return;
            }
            const response = await createSchoolApi(newRowData.schoolCode.trim(), newRowData.schoolName.trim(), newRowData.locality_id.trim(), newRowData.area_id.trim());
            if (response.success) {
                toast.success('New school added successfully');
                setShowNewRow(false);
                setIsAddingNew(false);
                setNewRowData({
                    schoolCode: '',
                    schoolName: '',
                    locality: '',
                    locality_id: '',
                    area: '',
                    area_id: '',
                    status: 'Active'
                });
                await refreshSchoolsData();
            } else {
                toast.error(response.message || 'Failed to save new school');
            }
        } catch (error: any) {
            console.log('Error saving new school:', error);
            toast.error(error.message || 'Failed to save new school');
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
            case 'unlisted':
                return 'text-red-500';
            default:
                return 'text-gray-600';
        }
    };

    const handleAddNewRow = () => {
        setShowNewRow(true);
        setIsAddingNew(true);
        setNewRowData({
            schoolCode: '',
            schoolName: '',
            locality: '',
            locality_id: '',
            area: '',
            area_id: '',
            status: 'Active'
        });
    };

    const handleEditRow = (school: any) => {
        setEditingSchoolId(school?.id);
        setEditingRowData({
            id: school?.id,
            code: school?.code || '',
            name: school?.name || '',
            locality: school?.locality?.name || '',
            locality_id: school?.locality_id || '',
            area: school?.area?.name || '',
            area_id: school?.area_id || '',
            status: school?.status || 'Active'
        });
        setEditValidationErrors({});
        setActiveDropdown(null);
        // Filter areas for edit mode based on the school's locality
        filterAreasForEditByLocality(school?.locality_id || '');
    };

    const handleSaveEdit = async () => {
        try {
            const response = await updateSchoolApi(editingRowData?.id, editingRowData?.code, editingRowData?.name, editingRowData?.locality_id, editingRowData?.area_id)
            if (response.success) {
                toast.success('School updated successfully');
                setEditingSchoolId(null);
                setEditingRowData(null);
                setEditValidationErrors({});
                await refreshSchoolsData();
            } else {
                toast.error(response.message || 'Failed to update school');
            }
        } catch (error: any) {
            console.log('Error updating school:', error);
            toast.error(error.message || 'Failed to update school');
        }
    };

    const handleCancelEdit = () => {
        setEditingSchoolId(null);
        setEditingRowData(null);
        setEditValidationErrors({});
    };

    // Merge functionality handlers
    const handleMergeModeToggle = () => {
        if (isMergeMode) {
            // Cancel merge mode
            setIsMergeMode(false);
            setSelectedSchools([]);
            setPrimarySchoolId(null);
            setLockedRows([]);
            setShowMergeMessage('');
        } else {
            // Enter merge mode
            setIsMergeMode(true);
            setSelectedSchools([]);
            setPrimarySchoolId(null);
            setLockedRows([]);
            setShowMergeMessage('');
        }
    };

    const handleSchoolSelection = (schoolId: string) => {
        if (lockedRows.includes(schoolId)) {
            setShowMergeMessage('Unlock to merge');
            setTimeout(() => setShowMergeMessage(''), 3000);
            return;
        }

        if (selectedSchools.includes(schoolId)) {
            // Deselect school
            setSelectedSchools(prev => prev.filter(id => id !== schoolId));
            if (primarySchoolId === schoolId) {
                setPrimarySchoolId(null);
            }
        } else {
            // Check if already have 2 selected
            if (selectedSchools.length >= 2) {
                // setShowMergeMessage('Merge happens one pair at a time.');
                toast.warning('Merge happens one pair at a time.');
                // setTimeout(() => setShowMergeMessage(''), 3000);
                return;
            }

            // Select school
            setSelectedSchools(prev => [...prev, schoolId]);

            // Set as primary if it's the first selection or if merge was invoked from this row
            if (selectedSchools.length === 0 || !primarySchoolId) {
                setPrimarySchoolId(schoolId);
            }
        }
    };

    const handleMergeExecute = async () => {
        if (selectedSchools.length !== 2 || !primarySchoolId) {
            // setShowMergeMessage('Please select exactly two schools and ensure primary is set.');
            toast.warning('Please select exactly two schools and ensure primary is set.');
            // setTimeout(() => setShowMergeMessage(''), 3000);
            return;
        }

        try {
            // Here you would call the merge API
            // For now, we'll simulate the merge
            const secondarySchoolId = selectedSchools.find(id => id !== primarySchoolId);

            let response = await mergeSchoolsApi(primarySchoolId || '', secondarySchoolId || '');
            if (response.success) {
                toast.success('Schools merged successfully');
            } else {
                toast.error(response.message || 'Failed to merge schools');
            }
            // Simulate API call
            // toast.success('Schools merged successfully');

            // Reset merge state
            setSelectedSchools([]);
            setPrimarySchoolId(null);
            setLockedRows([]);
            setShowMergeMessage('');

            // Refresh data
            await refreshSchoolsData();

            // Ask if user wants to merge another duplicate
            const continueMerge = window.confirm('Merge another duplicate?');
            if (!continueMerge) {
                setIsMergeMode(false);
            }

        } catch (error: any) {
            console.log('Error merging schools:', error);
            toast.error('Failed to merge schools');
        }
    };

    return (
        <div>
            <div className="mb-4" style={{ display: 'none' }}>
                <input
                    type="text"
                    placeholder="Search schools..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="flex gap-2 mb-2 w-full">
                <div className="w-24 px-3 py-2 text-xs font-medium text-gray-900 uppercase tracking-wider rounded-md bg-[#F0F7FF] border border-[#4A5F7A] flex items-center justify-between">
                    <span>School ID</span>
                    <svg className="w-3 h-3 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>

                {/* School Code */}
                <div className="w-32 px-3 py-2 text-xs font-medium text-gray-900 uppercase tracking-wider rounded-md bg-[#F0F7FF] border border-[#4A5F7A] flex items-center justify-between">
                    <span>School Code</span>
                    <svg className="w-3 h-3 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>

                {/* School Name */}
                <div className="flex-1 px-3 py-2 text-xs font-medium text-gray-900 uppercase tracking-wider rounded-md bg-[#F0F7FF] border border-[#4A5F7A] flex items-center justify-between">
                    <span>School Name</span>
                    <svg className="w-3 h-3 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>

                {/* Locality */}
                <div className="w-28 px-3 py-2 text-xs font-medium text-gray-900 uppercase tracking-wider rounded-md bg-[#F0F7FF] border border-[#4A5F7A] flex items-center">
                    <span>Locality</span>
                </div>

                {/* Area */}
                <div className="w-28 px-3 py-2 text-xs font-medium text-gray-900 uppercase tracking-wider rounded-md bg-[#F0F7FF] border border-[#4A5F7A] flex items-center">
                    <span>Area</span>
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
                {currentSchools.length > 0 ? (
                    currentSchools.map((school: any) => {
                        const isEditing = editingSchoolId === school?.id;

                        return (
                            <div key={school?.id || Math.random()} className={`flex gap-2 mb-2 ${isEditing ? 'edit-row-container' : ''}`}>
                                {/* School ID */}
                                <div className="w-24 bg-white px-3 py-2 text-sm font-medium text-gray-900 rounded-md border border-gray-200 break-words">
                                    {school?.id ? String(school.id).split('-')[0] : 'N/A'}
                                </div>

                                {/* School Code */}
                                <div className="w-32 bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200 break-words">
                                    {isEditing ? (
                                        <div>
                                            <input
                                                type="text"
                                                value={editingRowData?.code || ''}
                                                className="w-full text-sm text-gray-500 focus:outline-none border-0 p-0 bg-transparent cursor-not-allowed"
                                                placeholder="Auto-generated"
                                                readOnly
                                                disabled
                                            />
                                        </div>
                                    ) : (
                                        school?.code || 'N/A'
                                    )}
                                </div>

                                {/* School Name */}
                                <div className="flex-1 bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200 break-words">
                                    {isEditing ? (
                                        <div>
                                            <input
                                                type="text"
                                                value={editingRowData?.name || ''}
                                                onChange={(e) => setEditingRowData({ ...editingRowData, name: e.target.value })}
                                                className={`w-full text-sm text-gray-900 focus:outline-none border-0 p-0 ${editValidationErrors.name ? 'border-red-500' : ''}`}
                                                placeholder="Enter school name"
                                            />
                                            {editValidationErrors.name && (
                                                <div className="text-xs text-red-500 mt-1">{editValidationErrors.name}</div>
                                            )}
                                        </div>
                                    ) : (
                                        school?.name || 'N/A'
                                    )}
                                </div>

                                {/* Locality */}
                                <div className="w-28 bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200 break-words">
                                    {isEditing ? (
                                        <div>
                                            <select
                                                value={editingRowData?.locality_id || ''}
                                                onChange={(e) => {
                                                    const selectedLocality = allLocalities.find(loc => loc.id === e.target.value);
                                                    setEditingRowData({
                                                        ...editingRowData,
                                                        locality_id: e.target.value,
                                                        locality: selectedLocality?.locality?.name || selectedLocality?.name || '',
                                                        area_id: '', // Reset area when locality changes
                                                        area: '' // Reset area name when locality changes
                                                    });
                                                    // Filter areas for edit mode based on selected locality
                                                    filterAreasForEditByLocality(e.target.value);
                                                }}
                                                className={`w-full text-sm text-gray-900 focus:outline-none border-0 p-0 ${editValidationErrors.locality_id ? 'border-red-500' : ''}`}
                                            >
                                                <option value="">Select locality</option>
                                                {allLocalities.map((locality) => (
                                                    <option key={locality.id} value={locality.id}>
                                                        {locality.locality?.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {editValidationErrors.locality_id && (
                                                <div className="text-xs text-red-500 mt-1">{editValidationErrors.locality_id}</div>
                                            )}
                                        </div>
                                    ) : (
                                        school?.locality?.name || 'N/A'
                                    )}
                                </div>

                                {/* Area */}
                                <div className="w-28 bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200 break-words">
                                    {isEditing ? (
                                        <div>
                                            <select
                                                value={editingRowData?.area_id || ''}
                                                onChange={(e) => {
                                                    const selectedArea = filteredAreasForEdit.find(area => area.id === e.target.value);
                                                    setEditingRowData({ ...editingRowData, area_id: e.target.value, area: selectedArea?.area?.name || selectedArea?.name || '' });
                                                }}
                                                className={`w-full text-sm text-gray-900 focus:outline-none border-0 p-0 ${editValidationErrors.area_id ? 'border-red-500' : ''}`}
                                                disabled={!editingRowData?.locality_id} // Disable if no locality selected
                                            >
                                                <option value="">Select area</option>
                                                {filteredAreasForEdit.map((area) => (
                                                    <option key={area.id} value={area.id}>
                                                        {area.area?.name || area.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {editValidationErrors.area_id && (
                                                <div className="text-xs text-red-500 mt-1">{editValidationErrors.area_id}</div>
                                            )}
                                        </div>
                                    ) : (
                                        school?.area?.code || 'N/A'
                                    )}
                                </div>

                                {/* Status */}
                                <div className="w-24 bg-white px-3 py-2 text-sm rounded-md border border-gray-200 break-words">
                                    {updatingSchoolId === school?.id ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                                            <span className="text-gray-500">Updating</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <span className={`font-medium ${getStatusColor(school.status)}`}>
                                                {school.status}
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
                                                checked={selectedSchools.includes(school?.id)}
                                                onChange={() => handleSchoolSelection(school?.id)}
                                                disabled={lockedRows.includes(school?.id)}
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                title={lockedRows.includes(school?.id) ? 'Unlock to merge' : 'Select for merge'}
                                            />
                                            {primarySchoolId === school?.id && (
                                                <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="w-16 px-3 py-2 text-sm font-medium flex items-center justify-left">
                                    <div className="relative flex items-center justify-left">
                                        {isEditing ? (
                                            <div className="flex space-x-1 edit-buttons-container">
                                                <button
                                                    onClick={handleSaveEdit}
                                                    className="text-green-600 hover:text-green-800 focus:outline-none"
                                                    title="Save changes"
                                                >
                                                    <img src={saveIcon} />
                                                </button>
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
                                                onClick={() => handleDropdownToggle(school?.id || '')}
                                                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                </svg>
                                            </button>
                                        )}

                                        {activeDropdown === school?.id && !isEditing && (
                                            <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-50 border-2">
                                                <div className="py-1">
                                                    {/* Main management options - always show for all statuses */}
                                                    <button
                                                        onClick={() => handleEditRow(school)}
                                                        disabled={updatingSchoolId === school?.id}
                                                        className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingSchoolId === school?.id
                                                            ? 'text-gray-400 cursor-not-allowed'
                                                            : 'text-gray-700 hover:bg-[#C6DAF4] hover:text-gray-900'
                                                            }`}
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            setActiveDropdown(null);
                                                            handleAddNewRow();
                                                        }}
                                                        disabled={updatingSchoolId === school?.id}
                                                        className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingSchoolId === school?.id
                                                            ? 'text-gray-400 cursor-not-allowed'
                                                            : 'text-gray-700 hover:bg-[#C6DAF4] hover:text-gray-900'
                                                            }`}
                                                    >
                                                        Add
                                                    </button>

                                                    <button
                                                        disabled={updatingSchoolId === school?.id}
                                                        className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingSchoolId === school?.id
                                                            ? 'text-gray-400 cursor-not-allowed'
                                                            : 'text-gray-700 hover:bg-[#C6DAF4] hover:text-gray-900'
                                                            }`}
                                                        onClick={() => { handleAction('active', school?.id || ''); }}
                                                    >
                                                        List
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            setActiveDropdown(null);
                                                            handleMergeModeToggle();
                                                        }}
                                                        disabled={updatingSchoolId === school?.id}
                                                        className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingSchoolId === school?.id
                                                            ? 'text-gray-400 cursor-not-allowed'
                                                            : 'text-gray-700 hover:bg-[#C6DAF4] hover:text-gray-900'
                                                            }`}
                                                    >
                                                        {isMergeMode ? 'Cancel Merge' : 'Merge'}
                                                    </button>

                                                    {/* Status-specific buttons based on current status */}
                                                    {/* Show Active button when status is not active */}
                                                    {school?.status?.toLowerCase() !== 'active' && (
                                                        <button
                                                            onClick={() => handleAction('active', school?.id || '')}
                                                            disabled={updatingSchoolId === school?.id}
                                                            className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingSchoolId === school?.id
                                                                ? 'text-gray-400 cursor-not-allowed'
                                                                : 'text-gray-700 hover:bg-[#C6DAF4] hover:text-gray-900'
                                                                }`}
                                                        >
                                                            Active
                                                        </button>
                                                    )}

                                                    {/* Show Flag button when status is not flagged */}
                                                    {school?.status?.toLowerCase() !== 'flagged' && (
                                                        <button
                                                            onClick={() => handleAction('flagged', school?.id || '')}
                                                            disabled={updatingSchoolId === school?.id}
                                                            className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingSchoolId === school?.id
                                                                ? 'text-gray-400 cursor-not-allowed'
                                                                : 'text-gray-700 hover:bg-[#C6DAF4] hover:text-gray-900'
                                                                }`}
                                                        >
                                                            Flag
                                                        </button>
                                                    )}

                                                    {/* Show Block button when status is not blocked */}
                                                    {school?.status?.toLowerCase() !== 'blocked' && (
                                                        <button
                                                            onClick={() => handleAction('blocked', school?.id || '')}
                                                            disabled={updatingSchoolId === school?.id}
                                                            className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingSchoolId === school?.id
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
                                                            setSchoolToDelete(school?.id || '');
                                                            setShowDeleteModal(true);
                                                        }}
                                                        disabled={updatingSchoolId === school?.id}
                                                        className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${updatingSchoolId === school?.id
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
                ) : !showNewRow ? (
                    <div className="text-center py-8 text-gray-500">
                        {searchTerm ? 'No schools found matching your search' : 'No schools found'}
                    </div>
                ) : null}
            </div>

            {/* New Row Input Fields */}
            {showNewRow && (
                <div className="flex gap-2 mb-2">
                    {/* School ID - Auto generated */}
                    <div className="w-24 bg-gray-100 px-3 py-2 text-sm text-gray-500 rounded-md border border-gray-200">
                        {allSchools.length + 1}
                    </div>

                    {/* School Code - Auto-generated and read-only */}
                    <div className="w-32 bg-gray-100 px-3 py-2 text-sm text-gray-500 rounded-md border border-gray-200">
                        <input
                            type="text"
                            value={newRowData.schoolCode}
                            readOnly
                            placeholder="Auto-generated"
                            className="w-full text-sm text-gray-500 focus:outline-none bg-transparent"
                        />
                    </div>

                    {/* School Name */}
                    <div className="flex-1 bg-white px-3 py-2 rounded-md border border-gray-200">
                        <input
                            type="text"
                            value={newRowData.schoolName}
                            onChange={(e) => setNewRowData({ ...newRowData, schoolName: e.target.value })}
                            placeholder="Enter school name"
                            className="w-full text-sm text-gray-900 focus:outline-none"
                        />
                    </div>

                    {/* Locality */}
                    <div className="w-28 bg-white px-3 py-2 rounded-md border border-gray-200">
                        <select
                            value={newRowData.locality_id || ''}
                            onChange={(e) => {
                                const selectedLocality = allLocalities.find(loc => loc.id === e.target.value);
                                setNewRowData({
                                    ...newRowData,
                                    locality_id: e.target.value,
                                    locality: selectedLocality?.locality?.name || selectedLocality?.name || '',
                                    area_id: '', // Reset area when locality changes
                                    area: '' // Reset area name when locality changes
                                });
                                // Filter areas based on selected locality
                                filterAreasByLocality(e.target.value);
                            }}
                            className="w-full text-sm text-gray-900 focus:outline-none"
                        >
                            <option value="" >Select locality</option>
                            {allLocalities.map((locality) => (
                                <option key={locality.id} value={locality.id}>
                                    {locality.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Area */}
                    <div className="w-28 bg-white px-3 py-2 rounded-md border border-gray-200">
                        <select
                            value={newRowData.area_id || ''}
                            onChange={(e) => {
                                const selectedArea = filteredAreas.find(area => area.id === e.target.value);
                                setNewRowData({ ...newRowData, area_id: e.target.value, area: selectedArea?.area?.name || selectedArea?.name || '' });
                            }}
                            className="w-full text-sm text-gray-900 focus:outline-none"
                            disabled={!newRowData.locality_id} // Disable if no locality selected
                        >
                            <option value="">Select area</option>
                            {filteredAreas.map((area) => (
                                <option key={area.id} value={area.id}>
                                    {area.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status */}
                    <div className="w-24 bg-white px-3 py-2 rounded-md border border-gray-200">
                        <input
                            type="text"
                            value={"Active"}
                            placeholder="Enter status"
                            className="w-full text-sm text-gray-900 focus:outline-none"
                            readOnly
                        />
                    </div>

                    {/* Actions - Empty for new row */}
                    <div className="w-16 px-3 py-2 text-sm font-medium">
                        <span></span>
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
            {filteredSchools.length > 0 && (
                <div className="flex items-center justify-between mt-6 px-4">
                    <div className="text-sm text-gray-600">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredSchools.length)} of {filteredSchools.length} schools
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
                        onClick={handleAddNewRow}
                        disabled={isAddingNew}
                        className={`bg-[#C2A46D] text-white font-medium rounded-[30px] w-[105px] h-[44px] px-[10px] py-[10px] transition-colors duration-200 ${isAddingNew
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-[#9a7849]'
                            }`}
                    >
                        Add
                    </button>
                    <button
                        onClick={handleSaveNewRow}
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
                            onClick={() => handleMergeModeToggle()}
                            className="bg-[#C2A46D] text-white font-medium rounded-[30px] w-[105px] h-[44px] px-[10px] py-[10px] transition-colors duration-200 hover:bg-[#9a7849]"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleMergeExecute}
                            disabled={selectedSchools.length !== 2 || !primarySchoolId}
                            className={`bg-[#C2A46D] text-white font-medium rounded-[30px] w-[105px] h-[44px] px-[10px] py-[10px] transition-colors duration-200 flex items-center justify-center ${selectedSchools.length !== 2 || !primarySchoolId
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
                message="Are you sure you want to delete this school? This action cannot be undone."
                confirmText="Yes"
                cancelText="No"
                confirmButtonColor="text-red-600"
            />
        </div>
    );
};

export default SchoolsTable;
