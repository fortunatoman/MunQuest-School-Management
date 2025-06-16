import React, { useState, useMemo } from 'react';
import LeadershipRolesTable from './LeadershipRolesTable';
import { useApp } from '../../contexts/AppContext';

const LeadershipRolesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { allLeadershipRoles, refreshLeadershipRolesData, isLoading } = useApp();

  // Filter leadership roles based on search term
  const filteredRoles = useMemo(() => {
    if (!allLeadershipRoles || allLeadershipRoles.length === 0) return [];

    if (!searchTerm.trim()) return allLeadershipRoles;

    const searchLower = searchTerm.toLowerCase();
    return allLeadershipRoles.filter((role) => {
      // Safely convert to string and handle different possible field names
      const id = String(role.id || '').toLowerCase();
      const abbreviation = String(role.abbr || role.abbr || '').toLowerCase();
      const title = String(role.leadership_role || role.leadership_role || '').toLowerCase();

      return id.includes(searchLower) ||
        abbreviation.includes(searchLower) ||
        title.includes(searchLower);
    });
  }, [allLeadershipRoles, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading leadership roles...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex justify-left">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-800 rounded-[10px] leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Leadership Roles Table */}
      <LeadershipRolesTable
        leadershipRoles={filteredRoles}
        onRefresh={refreshLeadershipRolesData}
      />
    </div>
  );
};

export default LeadershipRolesPage;
