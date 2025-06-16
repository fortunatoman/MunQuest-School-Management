import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { SearchableDropdown } from '../ui';
import ConfirmationModal from '../ui/ConfirmationModal';
import { useApp } from '../../contexts/AppContext';
import DelegatesContactInfoPage from './Delegates-ContactInfoPage';
import DelegatesFoodInfoPage from './Delegates-FoodInfoPage';
import DelegatesAllocationPage from './Delegates-AllocationPage';
import { deleteDelegateApi, assignDelegateApi, unassignDelegateApi, toggleDelegateFlagApi } from '../../apis/Registerations';

interface DelegateItem {
    id: number;
    uniqueId: string;
    registrationId: string;
    name: string;
    academicLevel: string;
    school: string;
    munExperience: number;
    preferredCommittees: string[];
    assignedCommittees: string | null;
    assignedCountry: string | null;
    flag: boolean;
    isLocked: boolean;
}

interface DelegatesPageProps {
  onSubSectionChange?: (subSection: string) => void;
  onActiveCommitteeChange?: (committee: string) => void;
  onActiveCommitteeTypeChange?: (committeeType: string) => void;
}

const DelegatesPage: React.FC<DelegatesPageProps> = ({ onSubSectionChange, onActiveCommitteeChange, onActiveCommitteeTypeChange }) => {
    const [activeSubTab, setActiveSubTab] = useState('key-info');
    const [delegates, setDelegates] = useState<DelegateItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [showDelegateMenu, setShowDelegateMenu] = useState<number | null>(null);
    // Refs for detecting clicks outside menus
    const delegateMenuRef = useRef<HTMLDivElement>(null);

    // Confirmation modal state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [delegateToDelete, setDelegateToDelete] = useState<number | null>(null);

    // Merge state
    const [isMergeMode, setIsMergeMode] = useState(false);
    const [selectedDelegatesForMerge, setSelectedDelegatesForMerge] = useState<number[]>([]);

    const { eventId } = useParams();
    const navigate = useNavigate();
    const { allRegistrations, refreshRegistrationsData, allCommittees, allCountries } = useApp();

    useEffect(() => {
        let defaultStep = localStorage.getItem("activeStep");
        if (defaultStep) localStorage.removeItem("activeStep");
    }, [])
    // Handle committee assignment update
    const handleCommitteeAssignment = async (delegateId: number, committeeId: string, committeeName: string) => {
        try {
            const delegate = delegates.find(d => d.id === delegateId);
            if (!delegate) return;

            // Update local state immediately for better UX
            setDelegates(prev => prev.map(d => 
                d.id === delegateId 
                    ? { ...d, assignedCommittees: committeeId }
                    : d
            ));

            toast.success(`Committee "${committeeName}" assigned successfully`);
        } catch (error: any) {
            toast.error(error.message || 'Failed to assign committee');
        }
    };

    // Handle country assignment update
    const handleCountryAssignment = async (delegateId: number, countryId: string, countryName: string) => {
        try {
            const delegate = delegates.find(d => d.id === delegateId);
            if (!delegate) return;

            // Update local state immediately for better UX
            setDelegates(prev => prev.map(d => 
                d.id === delegateId 
                    ? { ...d, assignedCountry: countryId }
                    : d
            ));

            toast.success(`Country "${countryName}" assigned successfully`);
        } catch (error: any) {
            toast.error(error.message || 'Failed to assign country');
        }
    };

    // Handle individual row lock/unlock toggle
    const handleToggleLock = (delegateId: number) => {
        setDelegates(prev => prev.map(d => 
            d.id === delegateId 
                ? { ...d, isLocked: !d.isLocked }
                : d
        ));
    };

    // Handle lock all delegates
    const handleLockAll = () => {
        setDelegates(prev => prev.map(d => ({ ...d, isLocked: true })));
        toast.success('All delegates locked');
    };

    // Handle unlock all delegates
    const handleUnlockAll = () => {
        setDelegates(prev => prev.map(d => ({ ...d, isLocked: false })));
        toast.success('All delegates unlocked');
    };


    const subTabs = [
        { id: 'key-info', name: 'Key Info' },
        { id: 'contact-info', name: 'Contact Info' },
        { id: 'food-info', name: 'Food Info' },
        { id: 'allocation', name: 'Focused Allocation' }
    ];

    // Load delegates when component mounts
    useEffect(() => {
        const loadDelegates = async () => {
            setIsLoading(true);
            try {
                await refreshRegistrationsData(eventId as string);
            } catch (error) {
                toast.error('Failed to load delegates');
            } finally {
                setIsLoading(false);
            }
        };

        if (eventId) {
            loadDelegates();
        }
    }, [eventId, refreshRegistrationsData]);
    // Update delegates when allRegistrations changes
    useEffect(() => {
        if (allRegistrations && allRegistrations.length > 0) {
            const mockDelegates: DelegateItem[] = allRegistrations
                .map((registration: any) => ({
                    id: registration.id || 0,
                    uniqueId: registration.user_id?.slice(0, 6) || '',
                    registrationId: String(registration.id || '').slice(0, 6) || '',
                    name: registration.user?.fullname || 'Unknown',
                    academicLevel: registration.user?.grade || 'N/A',
                    school: registration.user?.school?.name || 'N/A',
                    munExperience: registration.mun_experience || 0,
					preferredCommittees: [
						registration.pref_committee_1?.abbr,
						registration.pref_committee_2?.abbr,
						registration.pref_committee_3?.abbr
					].filter(Boolean) as string[],
                    assignedCommittees: registration.assigned_committees || null,
                    assignedCountry: registration.assigned_country || null,
                    flag: registration.flag || null,
                    isLocked: true
                }))
                .filter(delegate => delegate.name !== 'Unknown');
            setDelegates(mockDelegates);
        } else {
            setDelegates([]);
        }
    }, [allRegistrations]);

    // Notify parent component of sub-section changes
    useEffect(() => {
        if (onSubSectionChange) {
            const subTabName = subTabs.find(tab => tab.id === activeSubTab)?.name || 'Key Info';
            onSubSectionChange(subTabName);
        }
    }, [activeSubTab, onSubSectionChange, subTabs]);

    // Handle clicks outside menus
    useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (!(event.target as HTMLElement).closest('.action-menu')) {
                    setShowDelegateMenu(null);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
    }, []);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        // Implement search logic here
    };

    const handleGlobalAllocation = async () => {
        try {
            setIsLoading(true);
            
            // Filter delegates that need allocation (unassigned and not locked)
            const unassignedDelegates = delegates.filter(delegate => 
                !delegate.assignedCommittees && !delegate.isLocked
            );

            if (unassignedDelegates.length === 0) {
                toast.info('All delegates are already assigned or locked');
                return;
            }

            // Create a copy of committees and countries to track assignments
            const committeeCapacity = new Map<string, number>();
            const countryAvailability = new Map<string, boolean>();
            
            // Initialize committee capacities (assuming each committee can hold multiple delegates)
            allCommittees.forEach(committee => {
                const currentAssigned = delegates.filter(d => d.assignedCommittees === committee.id).length;
                const maxCapacity = committee.seats || 50; // Default capacity if not specified
                committeeCapacity.set(committee.id, maxCapacity - currentAssigned);
            });

            // Initialize country availability
            allCountries.forEach(country => {
                countryAvailability.set(country.id, !delegates.some(d => d.assignedCountry === country.id));
            });

            let successCount = 0;
            let errorCount = 0;

            // Sort delegates by MUN experience (higher experience gets priority)
            const sortedDelegates = [...unassignedDelegates].sort((a, b) => b.munExperience - a.munExperience);

            for (const delegate of sortedDelegates) {
                try {
                    // Step 1: Assign Committee based on preferences
                    let assignedCommittee = null;
                    
                    // Try to assign from preferred committees
                    for (const preferredCommittee of delegate.preferredCommittees) {
                        const committee = allCommittees.find(c => c.abbr === preferredCommittee);
                        if (committee && committeeCapacity.get(committee.id)! > 0) {
                            assignedCommittee = committee;
                            committeeCapacity.set(committee.id, committeeCapacity.get(committee.id)! - 1);
                            break;
                        }
                    }

                    // If no preferred committee available, assign to any available committee
                    if (!assignedCommittee) {
                        for (const [committeeId, capacity] of committeeCapacity) {
                            if (capacity > 0) {
                                assignedCommittee = allCommittees.find(c => c.id === committeeId);
                                committeeCapacity.set(committeeId, capacity - 1);
                                break;
                            }
                        }
                    }

                    if (!assignedCommittee) {
                        console.warn(`No available committee for delegate ${delegate.name}`);
                        errorCount++;
                        continue;
                    }

                    // Step 2: Assign Country based on tier eligibility
                    let assignedCountry = null;
                    const eligibleCountries = getEligibleCountries(delegate.munExperience);
                    
                    // Try to find an available country from eligible ones
                    for (const country of eligibleCountries) {
                        if (countryAvailability.get(country.id)) {
                            assignedCountry = country;
                            countryAvailability.set(country.id, false);
                            break;
                        }
                    }

                    // If no eligible country available, assign to any available country
                    if (!assignedCountry) {
                        for (const [countryId, available] of countryAvailability) {
                            if (available) {
                                assignedCountry = allCountries.find(c => c.id === countryId);
                                countryAvailability.set(countryId, false);
                                break;
                            }
                        }
                    }

                    // Step 3: Make API calls to assign committee and country
                    await assignDelegateApi(delegate.id.toString(), assignedCommittee.id, assignedCountry?.id || '');
                    
                    // Update local state
                    setDelegates(prev => prev.map(d => 
                        d.id === delegate.id 
                            ? { 
                                ...d, 
                                assignedCommittees: assignedCommittee!.id,
                                assignedCountry: assignedCountry?.id || null
                              }
                            : d
                    ));

                    successCount++;

                } catch (error) {
                    console.log(`Failed to assign delegate ${delegate.name}:`, error);
                    errorCount++;
                }
            }

            // Refresh data from backend
            if (eventId) {
                await refreshRegistrationsData(eventId);
            }

            if (successCount > 0) {
                toast.success(`Successfully allocated ${successCount} delegates`);
            }
            if (errorCount > 0) {
                toast.error(`Failed to allocate ${errorCount} delegates`);
            }

        } catch (error: any) {
            console.log('Global allocation error:', error);
            toast.error('Failed to perform global allocation');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUploadDelegates = () => {
        localStorage.setItem("activeStep", "delegates")
        if (eventId) {
            navigate(`/upload-delegates/${eventId}`);
        } else {
            toast.error('Event ID not found');
        }
    };
    

    const handleAssign = async (delegateId: number) => {
        try {
            setShowDelegateMenu(null);
            const delegate = delegates.find(d => d.id === delegateId);
            if (!delegate) {
                toast.error('Delegate not found');
                return;
            }

            // Use the currently selected committee and country from the delegate state
            const selectedCommitteeId = delegate.assignedCommittees;
            const selectedCountryId = delegate.assignedCountry;
            
            if (!selectedCommitteeId || !selectedCountryId) {
                toast.error('Please select both committee and country before assigning');
                return;
            }

            await assignDelegateApi(
                delegateId.toString(), 
                selectedCommitteeId, 
                selectedCountryId
            );

            toast.success('Delegate assigned successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to assign delegate');
        }
    };

    const handleUnassign = async (delegateId: number) => {
        try {
            setShowDelegateMenu(null);
            await unassignDelegateApi(delegateId.toString());
            
            // Update local state
            setDelegates(prev => prev.map(d => 
                d.id === delegateId 
                    ? { 
                        ...d, 
                        assignedCommittees: null,
                        assignedCountry: null,
                    }
                    : d
            ));

            toast.success('Delegate unassigned successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to unassign delegate');
        }
    };

    const handleRemoveFromEvent = async (delegateId: number) => {
        setShowDelegateMenu(null);
        await deleteDelegateApi(delegateId.toString());
        setDelegateToDelete(delegateId);
        setShowDeleteConfirm(true);
    };

    const handleViewProfile = (delegateId: number) => {
        setShowDelegateMenu(null);
        navigate(`/view-delegate-profile/${delegateId}`);
    };

    const handleFlag = async (delegateId: number) => {
        try {
            setShowDelegateMenu(null);
            const delegate = delegates.find(d => d.id === delegateId);
            if (!delegate) {
                toast.error('Delegate not found');
                return;
            }
            
            const newFlagState = !delegate.flag;
            await toggleDelegateFlagApi(delegateId.toString(), newFlagState);
            
            // Update local state immediately for better UX
            setDelegates(prev => prev.map(d => 
                d.id === delegateId 
                    ? { ...d, flag: newFlagState }
                    : d
            ));

            // Call API to update database
            toast.success(newFlagState ? 'Delegate flagged' : 'Delegate unflagged');
        } catch (error: any) {
            // Revert local state on error
            setDelegates(prev => prev.map(d => 
                d.id === delegateId 
                    ? { ...d, flag: !d.flag }
                    : d
            ));
            toast.error(error.message || 'Failed to toggle flag');
        }
    };

    const handleMerge = (_delegateId: number) => {
        setShowDelegateMenu(null);
        setIsMergeMode(true);
        setSelectedDelegatesForMerge([_delegateId]);
    };

    const handleDelegateSelectionForMerge = (delegateId: number) => {
        if (selectedDelegatesForMerge.includes(delegateId)) {
            setSelectedDelegatesForMerge(prev => prev.filter(id => id !== delegateId));
        } else {
            // Only allow selection of exactly 2 delegates
            if (selectedDelegatesForMerge.length >= 2) {
                toast.error('You can only merge exactly 2 delegates');
                return;
            }
            setSelectedDelegatesForMerge(prev => [...prev, delegateId]);
        }
    };

    const handleExecuteMerge = async () => {
        try {
            if (selectedDelegatesForMerge.length !== 2) {
                toast.error('Please select exactly 2 delegates to merge');
                return;
            }
            await deleteDelegateApi(selectedDelegatesForMerge[1].toString());
            setDelegates(prev => prev.filter(delegate => delegate.id !== selectedDelegatesForMerge[1]));
            setIsMergeMode(false);
            setDelegateToDelete(selectedDelegatesForMerge[1]);
            // setSelectedDelegatesForMerge([]);
            toast.success('Delegates merged successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to merge delegates');
        }
    };

    const handleCancelMerge = () => {
        setIsMergeMode(false);
        setSelectedDelegatesForMerge([]);
    };

    // Helper function to calculate delegate tier based on MUN experience
    const getDelegateTier = (munExperience: number): string[] => {
        if (munExperience >= 3) {
            return ['S', 'A', 'B']; // Eligible for S, A, B countries
        } else if (munExperience >= 1) {
            return ['A', 'B']; // Eligible for A, B countries
        } else {
            return ['B']; // Eligible for B countries only
        }
    };

    // Helper function to get countries eligible for a delegate based on their MUN experience
    const getEligibleCountries = (munExperience: number) => {
        const delegateTiers = getDelegateTier(munExperience);
        return allCountries.filter(country => {
            // Assuming country.tier exists and contains 'S', 'A', or 'B'
            const countryTier = country.tier || 'B'; // Default to 'B' if tier not specified
            return delegateTiers.includes(countryTier);
        });
    };


    const confirmDelete = async () => {
        if (!delegateToDelete) return;

        try {
            // Simulate API call - replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            setDelegates(prev => prev.filter(delegate => delegate.id !== delegateToDelete));
            toast.success('Delegate removed successfully');
        } catch (error) {
            console.log('Error removing delegate:', error);
            toast.error('Failed to remove delegate');
        } finally {
            setShowDeleteConfirm(false);
            setDelegateToDelete(null);
        }
    };

    const filteredDelegates = delegates.filter(delegate =>
        (delegate.name && delegate.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (delegate.registrationId && delegate.registrationId.includes(searchTerm)) ||
        (delegate.school && delegate.school.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#395579]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Sub Navigation Tabs */}
            <div className="flex space-x-2">
                {subTabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSubTab(tab.id)}
                        className={`w-[150px] h-[58px] rounded-[20px] p-[5px] opacity-100 transition-colors text-sm font-medium ${activeSubTab === tab.id
                            ? 'bg-[#6A8BAF] text-white'
                            : 'bg-white text-black border border-gray-800'
                            } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                        style={{ transform: 'rotate(0deg)' }}
                    >
                        {tab.name}
                    </button>
                ))}
            </div>

			{/* Conditional content for sub-tabs */}
			{activeSubTab === 'contact-info' ? (
				<DelegatesContactInfoPage />
			) : activeSubTab === 'food-info' ? (
				<DelegatesFoodInfoPage />
			) : activeSubTab === 'allocation' ? (
				<DelegatesAllocationPage onActiveCommitteeChange={onActiveCommitteeChange} onActiveCommitteeTypeChange={onActiveCommitteeTypeChange} />
			) : (
				<>
					{/* Search and Action Bar */}
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<div className="relative">
								<input
									type="text"
									placeholder="Search"
									value={searchTerm}
									onChange={(e) => handleSearch(e.target.value)}
									className="w-[400px] pl-10 pr-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E395D] focus:border-transparent"
								/>
								<svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
								</svg>
							</div>
						</div>

						<div className="flex items-center space-x-3">
							<button
								onClick={handleGlobalAllocation}
								className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-[20px] hover:bg-green-700 transition-colors duration-200"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
								</svg>
								<span>Global Allocation</span>
							</button>

							<button
								onClick={handleUploadDelegates}
								className="flex items-center space-x-2 bg-[#C2A46D] text-white px-4 py-2 rounded-[20px] hover:opacity-90 transition-colors duration-200"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
								</svg>
								<span>Upload Delegates</span>
							</button>
						</div>
					</div>

					{/* Delegates Table */}
					<div>
                {/* Header Row */}
                <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: '80px 80px 100px 90px 140px 80px 160px 140px 140px 135px' }}>
                    {['Unique ID', 'Registration ID', 'Name', 'Academic Level', 'School', 'MUN Experience', 'Preferred Committees', 'Assigned Committees', 'Assigned Country', ' '].map((header, index) => (
                        header === ' ' ? (
                            <div key={header}>
                            </div>
                        ) : (
                            <div
                                key={header}
                                className={`px-3 py-2 text-xs font-medium text-gray-900 uppercase tracking-wider rounded-md ${index < 4
                                    ? 'bg-[#C6DAF4] border border-[#4A5F7A] flex items-center justify-between'
                                    : 'bg-[#C6DAF4] border border-[#4A5F7A] flex items-center'
                                    }`}
                            >
                                <span style={{ width: '100%', wordWrap: 'break-word' }}>{header}</span>
                                {index < 4 && (
                                    <svg className="w-3 h-3 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                )}
                            </div>
                        )
                    ))}
                </div>

                {/* Data Rows */}
                {filteredDelegates.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        {searchTerm ? 'No delegates found matching your search' : 'No delegates found'}
                    </div>
                ) : (
                    filteredDelegates.map((delegate) => (
                        <div key={delegate.id} className="grid gap-2 mb-2" style={{ gridTemplateColumns: '80px 80px 100px 90px 140px 80px 160px 140px 140px 135px' }}>
                            {/* Merge Selection Checkbox */}
                            
                            {/* Unique ID */}
                            <div className="bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200 break-words">
                                {delegate.uniqueId}
                            </div>

                            {/* Registration ID */}
                            <div className="bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200 break-words">
                                {delegate.registrationId}
                            </div>

                            {/* Name */}
                            <div className="bg-white px-3 py-2 text-sm font-medium text-gray-900 rounded-md border border-gray-200 break-words">
                                {delegate.name}
                            </div>

                            {/* Academic Level */}
                            <div className="bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200 break-words">
                                {delegate.academicLevel}
                            </div>

                            {/* School */}
                            <div className="bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200 break-words">
                                {delegate.school}
                            </div>

                            {/* MUN Experience */}
                            <div className="bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200 break-words">
                                {delegate.munExperience}
                            </div>

                            {/* Preferred Committees */}
                            <div className="bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200 break-words">
                                {delegate.preferredCommittees.join(', ') || "-"}
                            </div>

                             {/* Assigned Committees */}
                             <SearchableDropdown
                                 options={allCommittees.map(committee => ({
                                     id: committee.id,
                                     name: committee.abbr
                                 }))}
                                 value={delegate.assignedCommittees || ''}
                                 placeholder="Committees"
                                 onSelect={(id, name) => handleCommitteeAssignment(delegate.id, id, name)}
                                 disabled={delegate.isLocked}
                                 className="w-full"
                             />

                             {/* Assigned Country */}
                             <SearchableDropdown
                                 options={allCountries.map(country => ({
                                     id: country.id,
                                     name: country.name
                                 }))}
                                 value={delegate.assignedCountry || ''}
                                 placeholder="Countries"
                                 onSelect={(id, name) => handleCountryAssignment(delegate.id, id, name)}
                                 disabled={delegate.isLocked}
                                 className="w-full"
                             />

                            {/* Actions */}
                            <div className="px-3 py-2">
                                <div className="flex items-center space-x-2" style={{ marginLeft: 'unset !important' }}>
                                    <button 
                                        onClick={() => handleToggleLock(delegate.id)}
                                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                                        title={delegate.isLocked ? 'Unlock delegate' : 'Lock delegate'}
                                    >
                                        {delegate.isLocked ? (
                                             <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                            </svg>
                                        )}
                                    </button>

                                    {isMergeMode && (
                                        <div className="flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedDelegatesForMerge.includes(delegate.id)}
                                                onChange={() => handleDelegateSelectionForMerge(delegate.id)}
                                                className="cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                        </div>
                                    )}
                                    
                                    {selectedDelegatesForMerge.includes(delegate.id) && selectedDelegatesForMerge.indexOf(delegate.id) === 0 && (
                                        <div className="ml-2 text-sm font-medium text-blue-600">
                                            1
                                        </div>
                                    )}

                                    {/* Flag Icon */}
                                    {delegate.flag && (
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M4 5V20" stroke="#FF1616" strokeWidth="2" strokeLinecap="round"/>
                                            <path d="M4 5H20V13H4" fill="#FF1616" />
                                        </svg>
                                    )}

                                    <div className="relative" style={{ marginLeft: 'unset !important' }} ref={delegateMenuRef}>
                                        <button
                                            onClick={() => setShowDelegateMenu(showDelegateMenu === delegate.id ? null : delegate.id)}
                                            className="p-1 hover:bg-gray-100 rounded"
                                        >
                                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                            </svg>
                                        </button>

                                        {showDelegateMenu === delegate.id && (
                                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                                                <button
                                                    onClick={() => handleAssign(delegate.id)}
                                                    className="action-menu w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-200"
                                                >
                                                    Assign
                                                </button>
                                                <button
                                                    onClick={() => handleUnassign(delegate.id)}
                                                    className="action-menu w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-200"
                                                >
                                                    Unassign
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveFromEvent(delegate.id)}
                                                    className="action-menu w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-200"
                                                >
                                                    Remove from Event
                                                </button>
                                                <button
                                                    onClick={() => handleViewProfile(delegate.id)}
                                                    className="action-menu w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-200"
                                                >
                                                    View Profile
                                                </button>
                                                <button
                                                    onClick={() => handleFlag(delegate.id)}
                                                    className="action-menu w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-200"
                                                >
                                                    {delegate.flag ? 'Unflag' : 'Flag'}
                                                </button>
                                                <button
                                                    onClick={() => handleMerge(delegate.id)}
                                                    className="action-menu w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    Merge
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Bottom Action Buttons */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleLockAll}
                        className="bg-[#C2A46D] text-white px-6 py-2 rounded-[20px] hover:opacity-90 transition-colors duration-200"
                    >
                        Lock All
                    </button>
                    <button
                        onClick={handleUnlockAll}
                        className="bg-[#C2A46D] text-white px-6 py-2 rounded-[20px] hover:opacity-90 transition-colors duration-200"
                    >
                        Unlock All
                    </button>
                </div>

                <div className="flex items-center space-x-4">
                    {isMergeMode && (
                        <>
                            <button
                                onClick={handleCancelMerge}
                                className="bg-[#C2A46D] text-white px-6 py-2 rounded-[20px] hover:opacity-90 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleExecuteMerge}
                                disabled={selectedDelegatesForMerge.length !== 2}
                                className={`px-6 py-2 rounded-[20px] transition-colors duration-200 ${
                                    selectedDelegatesForMerge.length === 2
                                        ? 'bg-[#C2A46D] text-white hover:opacity-90'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                Merge ({selectedDelegatesForMerge.length})
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title="Remove Delegate"
                message="Are you sure you want to remove this delegate from the event? This action cannot be undone."
                confirmText="Remove"
                cancelText="Cancel"
                confirmButtonColor="text-red-600"
            />

			</>
		)}
		</div>
	);
};

export default DelegatesPage;
