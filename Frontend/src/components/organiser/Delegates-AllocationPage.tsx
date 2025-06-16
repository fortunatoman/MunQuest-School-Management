import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { SearchableDropdown } from '../ui';
import ConfirmationModal from '../ui/ConfirmationModal';
import { useApp } from '../../contexts/AppContext';
import { getAllEventCommitteesApi } from '../../apis/Event_committes';
import { assignDelegateApi, unassignDelegateApi, deleteDelegateApi, toggleDelegateFlagApi } from '../../apis/Registerations';

interface DelegateItem {
    id: number;
    uniqueId: string;
    name: string;
    academicLevel: string;
    school: string;
    munExperience: number | string;
    preferredCommittees: string[];
    // store selected IDs to feed SearchableDropdown
    assignedCommittees: string | null;
    assignedCountry: string | null;
    isLocked?: boolean;
    flag?: boolean;
}

interface DelegatesAllocationPageProps {
    onActiveCommitteeChange?: (committee: string) => void;
    onActiveCommitteeTypeChange?: (committeeType: string) => void;
}

const DelegatesAllocationPage: React.FC<DelegatesAllocationPageProps> = ({onActiveCommitteeChange, onActiveCommitteeTypeChange}) => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [subTabLoading, setSubTabLoading] = useState<boolean>(false);
    const [activeCommitteeType, setActiveCommitteeType] = useState('country');
    const [activeCommittee, setActiveCommittee] = useState<string>('');
    const [allCommitteesData, setAllCommitteesData] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [showDelegateMenu, setShowDelegateMenu] = useState<number | null>(null);
    const [delegates, setDelegates] = useState<DelegateItem[]>([]);
    const [isMergeMode, setIsMergeMode] = useState<boolean>(false);
    const [selectedDelegatesForMerge, setSelectedDelegatesForMerge] = useState<number[]>([]);
    const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
    const [showMoveConfirm, setShowMoveConfirm] = useState<boolean>(false);
    const [delegateToMove, setDelegateToMove] = useState<{id: number, fromCommittee: string, toCommittee: string} | null>(null);
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { allRegistrations, refreshRegistrationsData, allCommittees, allCountries } = useApp();
    // Handle committee assignment update
    const handleCommitteeAssignment = async (delegateId: number, committeeId: string, committeeName: string) => {
        try {
            const delegate = filteredDelegates.find(d => d.id === delegateId);
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
            const delegate = filteredDelegates.find(d => d.id === delegateId);
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

    // Handle download list
    const handleDownloadList = () => {
        if (activeCommittee === 'FULL') {
            downloadFullListTemplate();
        } else {
            downloadCommitteeTemplate();
        }
    };

    // Download committee-specific template
    const downloadCommitteeTemplate = () => {
        const committeeDelegates = filteredDelegates;
        
        const committeeData = {
            title: "Committee",
            subtitle: activeCommittee,
            headers: ["Unique ID", "Name", "Academic Level", "School", "MUN Experience", "Preferred Committees", "Assigned Committees", "Assigned Country"],
            data: committeeDelegates.map(delegate => ({
                uniqueId: delegate.uniqueId || "N/A",
                name: delegate.name || "N/A",
                academicLevel: delegate.academicLevel || "N/A",
                school: delegate.school || "N/A",
                munExperience: delegate.munExperience?.toString() || "N/A",
                preferredCommittees: delegate.preferredCommittees?.join(', ') || "N/A",
                assignedCommittees: delegate.assignedCommittees || "N/A",
                assignedCountry: delegate.assignedCountry || "N/A"
            }))
        };

        const htmlContent = generateCommitteeHTML(committeeData);
        downloadHTML(htmlContent, `committee-${activeCommittee.toLowerCase().replace(/\s+/g, '-')}-template.html`);
        toast.success(`${activeCommittee} template downloaded successfully`);
    };

    // Download full list template
    const downloadFullListTemplate = () => {
        const fullListData = {
            title: "Country Committees",
            subtitle: "Full List",
            headers: ["Unique ID", "Name", "Academic Level", "School", "MUN Experience", "Preferred Committees", "Assigned Committees", "Assigned Country"],
            data: filteredDelegates.map(delegate => ({
                uniqueId: delegate.uniqueId || "N/A",
                name: delegate.name || "N/A",
                academicLevel: delegate.academicLevel || "N/A",
                school: delegate.school || "N/A",
                munExperience: delegate.munExperience?.toString() || "N/A",
                preferredCommittees: delegate.preferredCommittees?.join(', ') || "N/A",
                assignedCommittees: delegate.assignedCommittees || "N/A",
                assignedCountry: delegate.assignedCountry || "N/A"
            }))
        };

        const htmlContent = generateFullListHTML(fullListData);
        downloadHTML(htmlContent, 'full-list-template.html');
        toast.success('Full list template downloaded successfully');
    };

    // Generate committee-specific HTML template
    const generateCommitteeHTML = (data: any) => {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${data.title} ${data.subtitle}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: white;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
            color: black;
        }
        .subtitle {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 20px;
            color: black;
        }
        table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-top: 20px;
        }
        th {
            background-color: #E0F2F7;
            color: black;
            font-weight: bold;
            text-align: center;
            padding: 12px 8px;
            border: 1px solid #ddd;
            border-radius: 6px;
            margin: 2px;
        }
        td {
            background-color: white;
            color: black;
            text-align: left;
            padding: 12px 8px;
            border: 1px solid #ddd;
            white-space: pre-line;
        }
        tr:nth-child(even) td {
            background-color: #f9f9f9;
        }
        tr:first-child th:first-child {
            border-top-left-radius: 6px;
        }
        tr:first-child th:last-child {
            border-top-right-radius: 6px;
        }
    </style>
</head>
<body>
    <div class="title">${data.title}</div>
    <div class="subtitle">${data.subtitle}</div>
    <table>
        <thead>
            <tr>
                ${data.headers.map((header: string) => `<th>${header}</th>`).join('')}
            </tr>
        </thead>
        <tbody>
            ${data.data.map((row: any) => `
                <tr>
                    <td>${row.uniqueId}</td>
                    <td>${row.name}</td>
                    <td>${row.academicLevel}</td>
                    <td>${row.school}</td>
                    <td>${row.munExperience}</td>
                    <td>${row.preferredCommittees}</td>
                    <td>${row.assignedCommittees}</td>
                    <td>${row.assignedCountry}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>`;
    };

    // Generate full list HTML template
    const generateFullListHTML = (data: any) => {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${data.title} ${data.subtitle}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: white;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
            color: black;
        }
        .subtitle {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 20px;
            color: black;
        }
        table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-top: 20px;
        }
        th {
            background-color: #E0F2F7;
            color: black;
            font-weight: bold;
            text-align: center;
            padding: 12px 8px;
            border: 1px solid #ddd;
            border-radius: 6px;
            margin: 2px;
        }
        td {
            background-color: white;
            color: black;
            text-align: left;
            padding: 12px 8px;
            border: 1px solid #ddd;
            white-space: pre-line;
        }
        tr:nth-child(even) td {
            background-color: #f9f9f9;
        }
        tr:first-child th:first-child {
            border-top-left-radius: 6px;
        }
        tr:first-child th:last-child {
            border-top-right-radius: 6px;
        }
    </style>
</head>
<body>
    <div class="title">${data.title}</div>
    <div class="subtitle">${data.subtitle}</div>
    <table>
        <thead>
            <tr>
                ${data.headers.map((header: string) => `<th>${header}</th>`).join('')}
            </tr>
        </thead>
        <tbody>
            ${data.data.map((row: any) => `
                <tr>
                    <td>${row.uniqueId}</td>
                    <td>${row.name}</td>
                    <td>${row.academicLevel}</td>
                    <td>${row.school}</td>
                    <td>${row.munExperience}</td>
                    <td>${row.preferredCommittees}</td>
                    <td>${row.assignedCommittees}</td>
                    <td>${row.assignedCountry}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>`;
    };

    // Download HTML file
    const downloadHTML = (htmlContent: string, filename: string) => {
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Handle assign delegate
    const handleAssign = async (delegateId: number) => {
        try {
            setShowDelegateMenu(null);
            const delegate = delegates.find(d => d.id === delegateId);
            if (!delegate) {
                toast.error('Delegate not found');
                return;
            }

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
            // No need to change local IDs; they are already selected by the user.

            toast.success('Delegate assigned successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to assign delegate');
        }
    };

    // Handle unassign delegate
    const handleUnassign = async (delegateId: number) => {
        try {
            await unassignDelegateApi(delegateId.toString());
            
            // Update local state
            setDelegates(prev => prev.map(d => 
                d.id === delegateId 
                    ? { 
                        ...d, 
                        assignedCommittees: null,
                        assignedCountry: null
                    }
                    : d
            ));

            setShowDelegateMenu(null);
            toast.success('Delegate unassigned successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to unassign delegate');
        }
    };

    const handleRemoveFromEvent = async (delegateId: number) => {
        try {
            setShowDelegateMenu(null);
            await deleteDelegateApi(delegateId.toString());
            setDelegates(prev => prev.filter(d => d.id !== delegateId));
            toast.success('Delegate removed successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to remove delegate');
        }
    };

    const handleViewProfile = (delegateId: number) => {
        setShowDelegateMenu(null);
        navigate(`/view-delegate-profile/${delegateId}`);
    };

    const handleFlag = async (delegateId: number) => {
        try {
            setShowDelegateMenu(null);
            const target = delegates.find(d => d.id === delegateId);
            const newFlagState = !target?.flag;
            await toggleDelegateFlagApi(delegateId.toString(), newFlagState);
            setDelegates(prev => prev.map(d => d.id === delegateId ? { ...d, flag: newFlagState } : d));
            toast.success(newFlagState ? 'Delegate flagged' : 'Delegate unflagged');
        } catch (error: any) {
            toast.error(error.message || 'Failed to toggle flag');
        }
    };

    const handleMerge = (delegateId: number) => {
        setShowDelegateMenu(null);
        setIsMergeMode(true);
        setSelectedDelegatesForMerge([delegateId]);
    };

    const handleDelegateSelectionForMerge = (delegateId: number) => {
        if (selectedDelegatesForMerge.includes(delegateId)) {
            setSelectedDelegatesForMerge(prev => prev.filter(id => id !== delegateId));
        } else {
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
            setDelegates(prev => prev.filter(d => d.id !== selectedDelegatesForMerge[1]));
            setIsMergeMode(false);
            toast.success('Delegates merged successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to merge delegates');
        }
    };

    const handleCancelMerge = () => {
        setIsMergeMode(false);
        setSelectedDelegatesForMerge([]);
    };

    const handleCommitteeAllocation = async () => {
        try {
            
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
            
            // Initialize committee capacities (assuming each committee can hold multiple delegates)
            allCommittees.forEach(committee => {
                const currentAssigned = delegates.filter(d => d.assignedCommittees === committee.id).length;
                const maxCapacity = committee.seats || 50; // Default capacity if not specified
                committeeCapacity.set(committee.id, maxCapacity - currentAssigned);
            });

            let successCount = 0;
            let errorCount = 0;

            // Sort delegates by MUN experience (higher experience gets priority)
            const sortedDelegates = [...unassignedDelegates].sort((a, b) => Number(b.munExperience) - Number(a.munExperience));

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

                    // Step 3: Make API calls to assign committee and country
                    await assignDelegateApi(delegate.id.toString(), assignedCommittee.id, '');
                    
                    // Update local state
                    setDelegates(prev => prev.map(d => 
                        d.id === delegate.id 
                            ? { 
                                ...d, 
                                assignedCommittees: assignedCommittee!.id,
                                assignedCountry: null
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
        }
    }

    // Helper function to proceed with assignment
    const proceedWithAssignment = async (delegateId: number, committeeId: string, assignedCountry: string | null) => {
        try {
            // Add delegate to committee
            await assignDelegateApi(
                delegateId.toString(),
                committeeId,
                assignedCountry ? assignedCountry : ''
            );

            // Update local state
            setDelegates(prev => prev.map(d => 
                d.id === delegateId 
                    ? { 
                        ...d, 
                        assignedCommittees: committeeId,
                        assignedCountry: assignedCountry ? assignedCountry : null
                    }
                    : d
            ));

            // Clear search and hide results
            setSearchTerm('');
            setShowSearchResults(false);

            toast.success(`Delegate added to ${activeCommittee} successfully`);
        } catch (error: any) {
            toast.error(error.message || 'Failed to add delegate to committee');
        }
    };

    // Handle confirmation of moving delegate
    const handleConfirmMove = async () => {
        if (!delegateToMove) return;

        try {
            const committee = allCommittees.find(c => c.abbr === delegateToMove.toCommittee);
            if (!committee) {
                toast.error('Committee not found');
                return;
            }

            const delegate = filteredAllEventUsers.find(d => d.id === delegateToMove.id);
            if (!delegate) {
                toast.error('Delegate not found');
                return;
            }

            await proceedWithAssignment(delegateToMove.id, committee.id, delegate.assignedCountry);
        } catch (error: any) {
            toast.error(error.message || 'Failed to move delegate');
        } finally {
            setShowMoveConfirm(false);
            setDelegateToMove(null);
        }
    };

    // Handle cancellation of moving delegate
    const handleCancelMove = () => {
        setShowMoveConfirm(false);
        setDelegateToMove(null);
    };

    // Handle adding delegate to active committee
    const handleAddDelegateToCommittee = async (delegateId: number) => {
        try {
            if (activeCommittee === 'FULL') {
                toast.error('Please select a specific committee first');
                return;
            }

            const delegate = filteredAllEventUsers.find(d => d.id === delegateId);
            if (!delegate) {
                toast.error('Delegate not found');
                return;
            }

            // Check if delegate is locked
            if (delegate.isLocked) {
                toast.error('This delegate is locked and cannot be assigned');
                return;
            }

            // Find the committee ID
            const committee = allCommittees.find(c => c.abbr === activeCommittee);
            if (!committee) {
                toast.error('Committee not found');
                return;
            }

            // Check if delegate is already assigned to another committee
            if (delegate.assignedCommittees) {
                const currentCommittee = allCommittees.find(c => c.id === delegate.assignedCommittees);
                if (currentCommittee && currentCommittee.abbr !== activeCommittee) {
                    // Show confirmation modal instead of window.confirm
                    setDelegateToMove({
                        id: delegateId,
                        fromCommittee: currentCommittee.abbr,
                        toCommittee: activeCommittee
                    });
                    setShowMoveConfirm(true);
                    return;
                }
            }

            // If no reassignment needed, proceed directly
            await proceedWithAssignment(delegateId, committee.id, delegate.assignedCountry);
        } catch (error: any) {
            toast.error(error.message || 'Failed to add delegate to committee');
        }
    };

    useEffect(() => {
        if (onActiveCommitteeChange) onActiveCommitteeChange(activeCommittee);
    }, [onActiveCommitteeChange, activeCommittee])

    useEffect(() => {
        if (onActiveCommitteeTypeChange) onActiveCommitteeTypeChange(activeCommitteeType);
    }, [onActiveCommitteeTypeChange, activeCommitteeType])

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!(event.target as HTMLElement).closest('.action-menu')) {
                setShowDelegateMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Initial load
    useEffect(() => {
        const load = async () => {
            try {
                setIsLoading(true);
                if (eventId) {
                    await refreshRegistrationsData(eventId);
                    const response = await getAllEventCommitteesApi(eventId);
                    const raw = response?.data || [];
                    const normalized = raw.map((item: any) => {
                        const master = item && typeof item.committee === 'object' ? item.committee : null;
                        return {
                            id: String(item.id),
                            abbr: master ? (master.abbr ?? item.abbr ?? '') : (item.abbr ?? ''),
                            committee: master ? (master.committee ?? master.name ?? '') : (item.committee ?? ''),
                            category: master ? master.category : item.category || 'country',
                            seats: item ? item.seats : 0
                        };
                    });
                    const normalizedList = Array.isArray(normalized) ? normalized : [];
                    setAllCommitteesData(normalizedList);

                    // Set default active committee to the first committee in the current type
                    const firstOfType = normalizedList.find((c: any) => c.category === activeCommitteeType);
                    if (firstOfType) {
                        setActiveCommittee(firstOfType.abbr);
                    }
                }
            } catch (error: any) {
                toast.error(error?.message || 'Failed to load allocation data');
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [eventId, refreshRegistrationsData]);

    // Sub-tab abbreviations by committee type
    const committeeAbbreviations = useMemo(() => {
        const filtered = allCommitteesData.filter(c => c.category === activeCommitteeType);
        let totalAssigned = 0;
        // Calculate assigned counts for each committee
        const committeesWithCounts = filtered.map(committee => {
            const assignedCount = delegates.filter(delegate => {
                // Check if delegate is assigned to this committee
                const committeeAbbr = allCommittees.find(c => c.id === delegate.assignedCommittees)?.abbr;
                return committeeAbbr === committee.abbr;
            }).length;
            totalAssigned += assignedCount;
            return {
                ...committee,
                assignedCount
            };
        });
        
        // Add FULL LIST option
        // const totalAssigned = delegates.filter(d => d.assignedCommittees).length;
        return [
            ...committeesWithCounts,
            {
                id: 'FULL',
                abbr: 'FULL',
                committee: 'Full',
                category: activeCommitteeType,
                seats: filtered.reduce((sum, committee) => sum + parseInt(committee.seats || '0'), 0),
                assignedCount: totalAssigned
            }
        ];
    }, [allCommitteesData, activeCommitteeType, delegates, allCommittees, activeCommittee]);

    // Build delegates
    const builtDelegates: DelegateItem[] = useMemo(() => {
        if (!Array.isArray(allRegistrations)) return [];
        return allRegistrations.map((registration: any) => {
            const user = registration?.user || {};
            const preferred = [
                registration?.pref_committee_1?.abbr,
                registration?.pref_committee_2?.abbr,
                registration?.pref_committee_3?.abbr
            ].filter(Boolean) as string[];
            return {
                id: registration?.id || 0,
                uniqueId: String(registration?.user_id || '').slice(0, 8),
                name: user?.fullname || '',
                academicLevel: user?.grade || 'N/A',
                school: user?.school?.name || user?.school_name || '',
                munExperience: registration?.mun_experience ?? 0,
                preferredCommittees: preferred,
                assignedCommittees: registration?.assigned_committees || null,
                assignedCountry: registration?.assigned_country || null,
                isLocked: registration?.isLocked || true,
                flag: registration?.flag || false
            } as DelegateItem;
        });
    }, [allRegistrations]);
    // Update delegates state when builtDelegates changes
    useEffect(() => {
        setDelegates(builtDelegates);
    }, [builtDelegates]);

    // Filter by active sub-tab and search term
    const filteredDelegates = useMemo(() => {
        let list = delegates;
        if (activeCommittee && activeCommittee !== 'FULL') {
            const abbr = activeCommittee;
            // map selected committee id to its abbreviation for comparison
            const idToAbbr = new Map(allCommittees.map((c: any) => [c.id, c.abbr]));
            list = list.filter(d =>
                // Only show delegates who are actually ASSIGNED to this committee
                (d.assignedCommittees && idToAbbr.get(d.assignedCommittees) === abbr)
            );
        }
        return list;
        
    }, [delegates, activeCommittee, allCommittees]);

    const filteredAllEventUsers = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return [];
        return allRegistrations.filter(item => item.event_id === eventId).filter((registration: any) => {
            const user = registration?.user || {};
            const name = user?.fullname || '';
            const school = user?.school?.name || user?.school_name || '';
            const grade = user?.grade || '';
            const munExp = registration?.mun_experience || 0;
            
            return (
                name.toLowerCase().includes(term) ||
                school.toLowerCase().includes(term) ||
                grade.toLowerCase().includes(term) ||
                munExp.toString().includes(term)
            );
        }).map((registration: any) => {
            const user = registration?.user || {};
            return {
                id: registration?.id || 0,
                name: user?.fullname || '',
                school: user?.school?.name || user?.school_name || '',
                grade: user?.grade || 'N/A',
                munExperience: registration?.mun_experience || 0,
                assignedCommittees: registration?.assigned_committees || null,
                assignedCountry: registration?.assigned_country || null,
                isLocked: registration?.isLocked || false
            };
        });
    }, [searchTerm, allRegistrations, eventId]);

    const handleCommitteeTypeChange = (type: string) => {
        setActiveCommitteeType(type);
        setSubTabLoading(true);
        // Pick first committee of this type (fallback to FULL if none yet)
        const firstOfType = allCommitteesData.find((c: any) => c.category === type);
        setActiveCommittee(firstOfType ? firstOfType.abbr : 'FULL');
        setTimeout(() => setSubTabLoading(false), 200);
    };

    const handleSubTabChange = (abbr: string) => {
        setSubTabLoading(true);
        setActiveCommittee(abbr);
        setTimeout(() => setSubTabLoading(false), 150);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#395579]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Committee Type Tabs */}
            <div className="flex space-x-2">
                {[
                    { id: 'country', name: 'Country Committees' },
                    { id: 'role', name: 'Role Committees' },
                    { id: 'crisis', name: 'Crisis Committees' },
                    { id: 'open', name: 'Open Committees' }
                ].map((type) => (
                    <button
                        key={type.id}
                        onClick={() => handleCommitteeTypeChange(type.id)}
                        className={`w-[160px] h-[58px] px-[5px] py-[5px] text-sm font-medium rounded-[20px] transition-colors duration-200 ${activeCommitteeType === type.id
                            ? 'bg-[#84B5F3]'
                            : 'bg-white text-black border border-gray-800'
                            }`}
                    >
                        {type.name}
                    </button>
                ))}
            </div>

            {/* Committee Abbreviation Sub-tabs */}
            {committeeAbbreviations.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {committeeAbbreviations.map((abbr) => (
                        <button
                            key={abbr.id}
                            onClick={() => handleSubTabChange(abbr.abbr)}
                            disabled={subTabLoading}
                            className={`w-[190px] h-[58px] px-[5px] py-[5px] text-sm font-medium rounded-[20px] transition-colors duration-200 ${activeCommittee === abbr.abbr
                                ? 'bg-[#C6DAF4]'
                                : 'bg-white text-black border border-gray-800'
                                } ${subTabLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                                style={{fontSize: '14px'}}
                        >
                            {abbr.abbr === "FULL" ? "FULL LIST" : abbr.abbr}
                            <div className="text-black flex items-center justify-center gap-2" style={{ fontSize: '14px', fontWeight: 300 }}>
                                <span className='flex items-center justify-center gap-2'>
                                    Total:
                                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{abbr.seats}</span>
                                </span>
                                <span className='flex items-center justify-center gap-2'>
                                    Assigned:
                                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{abbr.assignedCount || 0}</span>
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Search + Download */}
            <div className="flex items-center justify-start p-4 rounded-lg gap-8">
                {
                    activeCommittee === "FULL" ? (<button
                                        onClick={handleCommitteeAllocation}
                                        className="w-[250px] text-white font-medium transition-colors hover:opacity-90"
                                        style={{
                                            height: '44px',
                                            borderRadius: '30px',
                                            paddingLeft: '16px',
                                            paddingRight: '16px',
                                            cursor: 'pointer',
                                            border: 'none',
                                            boxShadow: 'none',
                                            background: '#4CAF50',
                                        }}
                                    >
                                    Committee Full Allocations
                                </button>) : ""
                }
                
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by name or MUN experience or school and assign"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setShowSearchResults(e.target.value.trim().length > 0);
                            }}
                            onFocus={() => setShowSearchResults(searchTerm.trim().length > 0)}
                            onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                            className="min-w-[450px] pl-10 pr-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E395D] focus:border-transparent"
                        />
                        <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        
                        {/* Search Results Dropdown */}
                        {showSearchResults && filteredAllEventUsers.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 z-50 max-h-60 overflow-y-auto bg-white rounded-[5px]">
                                {filteredAllEventUsers.map((user) => (
                                    <div key={user.id} className="flex items-center justify-between px-1">
                                        <div className="flex-1">
                                            <div className="text-xs text-gray-500">
                                                {user.name}, {user.school}, {user.grade}, MUN {user.munExperience} Yrs
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleAddDelegateToCommittee(user.id)}
                                            disabled={user.isLocked}
                                            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                                user.isLocked 
                                                    ? 'cursor-not-allowed' 
                                                    : ''
                                            }`}
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            <span>Add</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Search + Download */}
            <div className="flex items-center justify-between p-4 mt-0 mr-16" style={{ marginTop: '0px' }}>
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <h1
                            style={{
                                fontWeight: 700,
                                fontStyle: 'normal',
                                fontSize: '30px',
                                lineHeight: '150%',
                                letterSpacing: '0%',
                                verticalAlign: 'middle',
                                margin: 0,
                            }}
                        >
                            {activeCommittee}
                        </h1>
                    </div>
                </div>

                <button
                    onClick={handleDownloadList}
                    className="text-white font-medium transition-colors hover:opacity-90"
                    style={{
                        height: '44px',
                        borderRadius: '30px',
                        paddingLeft: '16px',
                        paddingRight: '16px',
                        background: '#C2A46D',
                        cursor: 'pointer',
                        border: 'none',
                        boxShadow: 'none',
                    }}
                >
                    Download List
                </button>
            </div>

            {/* Delegates Table */}
            <div>
                {/* Header Row */}
                <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: '100px 120px 100px 140px 100px 170px 120px 100px 100px' }}>
                    {['Unique ID', 'Name', 'Academic Level', 'School', 'MUN Experience', 'Preferred Committees', 'Assigned Committees', 'Assigned Country', ' '].map((header, index) => (
                        header === ' ' ? (
                            <div key={header}></div>
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
                {subTabLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E395D]"></div>
                        <span className="ml-2 text-gray-600">Loading...</span>
                    </div>
                ) : filteredDelegates.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">{searchTerm ? 'No delegates found matching your search' : 'No delegates found'}</div>
                ) : (
                    filteredDelegates.map((delegate) => (
                        <div key={delegate.id} className="grid gap-2 mb-2" style={{ gridTemplateColumns: '100px 120px 100px 140px 100px 170px 120px 100px 100px' }}>
                            <div className="bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200 text-wrap break-words">{delegate.uniqueId}</div>
                            <div className="bg-white px-3 py-2 text-sm font-medium text-gray-900 rounded-md border border-gray-200 break-words">{delegate.name}</div>
                            <div className="bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200 text-wrap break-words">{delegate.academicLevel}</div>
                            <div className="bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200 text-wrap break-words">{delegate.school}</div>
                            <div className="bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200 text-wrap break-words">{delegate.munExperience}</div>
                            <div className="bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200 break-words">{delegate.preferredCommittees.join(', ')}</div>
                            <SearchableDropdown
                                options={allCommittees.map(committee => ({
                                    id: committee.id,
                                    name: committee.abbr,
                                }))}
                                value={delegate.assignedCommittees || ''}
                                placeholder="Committees"
                                onSelect={(id, name) => handleCommitteeAssignment(delegate.id, id, name)}
                                disabled={delegate.isLocked}
                                className="w-full"
                            />
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
                            <div className="px-2 py-3">
                                <div className="flex items-center space-x-2">
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
                                    {delegate.flag && (
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M4 5V20" stroke="#FF1616" strokeWidth="2" strokeLinecap="round"/>
                                            <path d="M4 5H20V13H4" fill="#FF1616" />
                                        </svg>
                                    )}
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
                                        <div className="ml-2 text-sm font-medium text-blue-600">1</div>
                                    )}
                                    <div className="relative">
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
                                                <button className="action-menu w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-200" onClick={() => handleAssign(delegate.id)}>
                                                    Assign
                                                </button>
                                                <button className="action-menu w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-200" onClick={() => handleUnassign(delegate.id)}>
                                                    Unassign
                                                </button>
                                                <button className="action-menu w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-200" onClick={() => handleRemoveFromEvent(delegate.id)}>
                                                    Remove from Event
                                                </button>
                                                <button className="action-menu w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-200" onClick={() => handleViewProfile(delegate.id)}>
                                                    View Profile
                                                </button>
                                                <button className="action-menu w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-200" onClick={() => handleFlag(delegate.id)}>
                                                    {delegate.flag ? 'Unflag' : 'Flag'}
                                                </button>
                                                <button className="action-menu w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100" onClick={() => handleMerge(delegate.id)}>
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

            {/* Bottom Buttons */}
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
                {isMergeMode && (
                    <div className="flex items-center space-x-4">
                        <button onClick={handleCancelMerge} className="bg-[#C2A46D] text-white px-6 py-2 rounded-[20px] hover:opacity-90 transition-colors duration-200">Cancel</button>
                        <button onClick={handleExecuteMerge} disabled={selectedDelegatesForMerge.length !== 2} className={`px-6 py-2 rounded-[20px] transition-colors duration-200 ${selectedDelegatesForMerge.length === 2 ? 'bg-[#C2A46D] text-white hover:opacity-90' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>Merge ({selectedDelegatesForMerge.length})</button>
                    </div>
                )}
            </div>

            {/* Confirmation Modal for Moving Delegate */}
            <ConfirmationModal
                isOpen={showMoveConfirm}
                onClose={handleCancelMove}
                onConfirm={handleConfirmMove}
                title="Move Delegate"
                message={delegateToMove ? `This delegate is already assigned to ${delegateToMove.fromCommittee}. Do you want to move them to ${delegateToMove.toCommittee}?` : ''}
                confirmText="Move"
                cancelText="Cancel"
                confirmButtonColor="text-blue-600"
            />
        </div>
    );
};

export default DelegatesAllocationPage;


