import React, { useState, useMemo } from 'react';
import OrganisersTable from './OrganisersTable';
import { useApp } from '../../contexts/AppContext';

interface OrganisersPageProps {
  type?: 'organisers' | 'students' | 'teachers';
}

const OrganisersPage: React.FC<OrganisersPageProps> = ({ type = 'organisers' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { allOrganisers } = useApp();

  const allOrganisersOfStudents = allOrganisers.filter((organiser) => organiser.users.role === 'student');
  const allOrganisersOfTeachers = allOrganisers.filter((organiser) => organiser.users.role === 'teacher');

  const getData = () => {
    switch (type) {
      case 'students':
        return allOrganisersOfStudents || [];
      case 'teachers':
        return allOrganisersOfTeachers || [];
      default:
        return allOrganisers || [];
    }
  };

  const filteredData = useMemo(() => {
    const data = getData();
    if (!data || data.length === 0) return [];

    if (!searchTerm.trim()) return data;

    const searchLower = searchTerm.toLowerCase();
    return data.filter((item) => {
      const name = item?.users?.fullname?.toLowerCase() || '';
      const username = item?.users?.username?.toLowerCase() || '';
      const school = item?.school?.name?.toLowerCase() || item?.school?.toLowerCase() || '';
      const organiserId = item?.users?.id?.toString().toLowerCase() || '';
      const role = item?.role?.toLowerCase() || '';
      const locality = item?.users?.school_location?.toLowerCase() || '';

      return name.includes(searchLower) ||
        username.includes(searchLower) ||
        school.includes(searchLower) ||
        organiserId.includes(searchLower) ||
        role.includes(searchLower) ||
        locality.includes(searchLower);
    });
  }, [type, allOrganisers, searchTerm]);

  const handleOrganiserAction = (action: string) => {
    switch (action) {
      case 'approved':
        break;
      case 'rejected':
        break;
      case 'flagged':
        break;
      case 'blocked':
        break;
      case 'delete':
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
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

      <OrganisersTable
        organisers={filteredData}
        onAction={handleOrganiserAction}
        organiserType={type === 'students' ? 'students' : type === 'teachers' ? 'teachers' : 'all'}
      />
    </div>
  );
};

export default OrganisersPage;
