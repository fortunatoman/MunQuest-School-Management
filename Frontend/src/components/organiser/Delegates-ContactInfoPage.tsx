import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useApp } from '../../contexts/AppContext';

interface DelegateContactItem {
    id: number;
    uniqueId: string;
    name: string;
    mobile: string;
    email: string;
    emergencyContact: string;
}

const DelegatesContactInfoPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');

    const { eventId } = useParams();
    const { allRegistrations, refreshRegistrationsData } = useApp();

    // Initial load
    useEffect(() => {
        const load = async () => {
            try {
                setIsLoading(true);
                if (eventId) {
                    await refreshRegistrationsData(eventId);
                }
            } catch (_err) {
                toast.error('Failed to load contact info');
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [eventId, refreshRegistrationsData]);

    const contacts: DelegateContactItem[] = useMemo(() => {
        if (!Array.isArray(allRegistrations)) return [];
        return allRegistrations.map((registration: any) => {
            const user = registration?.user || {};
            return {
                id: registration?.id || 0,
                uniqueId: String(registration?.user_id || '').slice(0, 12),
                name: user?.fullname || '',
                mobile: user?.phone_e164 || '',
                email: user?.email || '',
                emergencyContact: registration?.emergency_phone || ''
            } as DelegateContactItem;
        });
    }, [allRegistrations]);

    const filtered = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return contacts;
        return contacts.filter((c) =>
            (c.name && c.name.toLowerCase().includes(term)) ||
            (c.uniqueId && c.uniqueId.includes(searchTerm)) ||
            (c.email && c.email.toLowerCase().includes(term)) ||
            (c.mobile && c.mobile.toLowerCase().includes(term))
        );
    }, [contacts, searchTerm]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#395579]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="min-w-[400px] pl-10 pr-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E395D] focus:border-transparent"
                        />
                        <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div>
                {/* Header Row */}
                <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: '100px 180px 150px 300px 170px' }}>
                    {['Unique ID', 'Name', 'Mobile', 'Email', 'Emergency Contact'].map((header) => (
                        header === ' ' ? (
                            <div key={header}></div>
                        ) : (
                            <div
                                key={header}
                                className="px-3 py-2 text-xs font-medium text-gray-900 uppercase tracking-wider rounded-md bg-[#C6DAF4] border border-[#4A5F7A] flex items-center"
                            >
                                <span style={{ width: '100%', wordWrap: 'break-word' }}>{header}</span>
                            </div>
                        )
                    ))}
                </div>

                {/* Data Rows */}
                {filtered.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">{searchTerm ? 'No delegates found matching your search' : 'No delegate contacts found'}</div>
                ) : (
                    filtered.map((row) => (
                        <div key={row.id} className="grid gap-2 mb-2" style={{ gridTemplateColumns: '100px 180px 150px 300px 170px' }}>
                            <div className="bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200">{row.uniqueId.slice(0, 8)}</div>
                            <div className="bg-white px-3 py-2 text-sm font-medium text-gray-900 rounded-md border border-gray-200">{row.name}</div>
                            <div className="bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200">{row.mobile || '-'}</div>
                            <div className="bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200">{row.email || '-'}</div>
                            <div className="bg-white px-3 py-2 text-sm text-gray-900 rounded-md border border-gray-200">{row.emergencyContact || '-'}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DelegatesContactInfoPage;


