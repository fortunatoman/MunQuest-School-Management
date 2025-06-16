import React, { useState, useMemo, useEffect } from 'react';
import GlobalUserTable from './GlobalUserTable';
import { useApp } from '../../contexts/AppContext';

interface GlobalUserPageProps {
  type?: 'students' | 'teachers';
  isSuperUser?: boolean;
}

const GlobalUserPage: React.FC<GlobalUserPageProps> = ({ type = 'students', isSuperUser = true }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSuperMasterlist, setIsSuperMasterlist] = useState(false);
  const { allUsers } = useApp();

  useEffect(() => {
    if (isSuperUser && type === 'students') {
      setIsSuperMasterlist(true);
    } else if (isSuperUser && type === 'teachers') {
      setIsSuperMasterlist(true);
    } else {
      setIsSuperMasterlist(false);
    }
  }, [isSuperUser, type])

  const getData = () => {
    if (isSuperMasterlist) {
      // For superusers, filter by global_role = superuser and then by role
      const superUsers = allUsers.filter(user =>
        user.global_role === 'superuser'
      ) || [];

      switch (type) {
        case 'students':
          return superUsers.filter(user => user.role === 'student') || [];
        case 'teachers':
          return superUsers.filter(user => user.role === 'teacher') || [];
        default:
          return superUsers || [];
      }
    } else {
      // For regular users, filter by global_role = user and then by role
      const regularUsers = allUsers.filter(user =>
        user.global_role === 'user' || !user.global_role // fallback for users without global_role
      ) || [];
      switch (type) {
        case 'students':
          return regularUsers.filter(user => user.role === 'student') || [];
        case 'teachers':
          return regularUsers.filter(user => user.role === 'teacher') || [];
        default:
          return regularUsers || [];
      }
    }
  };

  // Filter data based on search term
  const filteredData = useMemo(() => {
    const data = getData();
    if (!data || data.length === 0) return [];

    if (!searchTerm.trim()) return data;

    const searchLower = searchTerm.toLowerCase();
    return data.filter((item) => {
      const name = item?.fullname?.toLowerCase() || '';
      const username = item?.username?.toLowerCase() || '';
      const school = item?.school?.name?.toLowerCase() || item?.school?.toLowerCase() || '';
      const userId = item?.id?.toString().toLowerCase() || '';
      const role = item?.role?.toLowerCase() || '';
      const locality = item?.school_location?.toLowerCase() || '';

      return name.includes(searchLower) ||
        username.includes(searchLower) ||
        school.includes(searchLower) ||
        userId.includes(searchLower) ||
        role.includes(searchLower) ||
        locality.includes(searchLower);
    });
  }, [type, allUsers, searchTerm, isSuperMasterlist]);

  const handleUserAction = (action: string) => {
    // Implement action logic here
    switch (action) {
      case 'approved':
        // Handle approve action
        break;
      case 'rejected':
        // Handle reject action
        break;
      case 'flagged':
        // Handle flag action
        break;
      case 'blocked':
        // Handle block action
        break;
      case 'delete':
        // Handle delete action
        break;
      default:
        break;
    }
  };

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

      {/* Data Table */}
      <GlobalUserTable
        users={filteredData}
        onAction={handleUserAction}
        userType={type}
        isSuperUser={isSuperUser}
      />
    </div>
  );
};

export default GlobalUserPage;
