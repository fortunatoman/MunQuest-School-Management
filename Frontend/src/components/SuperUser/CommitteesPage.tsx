import React, { useState, useEffect } from 'react';
import { getAllCommitteesApi } from '../../apis/Committees';
import { LoadingSpinner } from '../ui';
import CommitteesTable from './CommitteesTable';

const CommitteesPage: React.FC = () => {
  const [activeCommitteeType, setActiveCommitteeType] = useState<'country' | 'role' | 'crisis' | 'open'>('country');
  const [committees, setCommittees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const committeeTypes = [
    { id: 'country', name: 'Country Committees', label: 'Country Committees' },
    { id: 'role', name: 'Role Committees', label: 'Role Committees' },
    { id: 'crisis', name: 'Crisis Committees', label: 'Crisis Committees' },
    { id: 'open', name: 'Open Committees', label: 'Open Committees' }
  ];

  const fetchCommittees = async () => {
    try {
      setIsLoading(true);
      const response = await getAllCommitteesApi();
      setCommittees(response.data || []);
    } catch (error: any) {
      console.log('Error fetching committees:', error);
      setCommittees([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommitteeTypeChange = (type: 'country' | 'role' | 'crisis' | 'open') => {
    setActiveCommitteeType(type);
  };

  const handleRefresh = () => {
    fetchCommittees();
  };

  useEffect(() => {
    fetchCommittees();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="large" text="Loading committees..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Committee Type Navigation */}
      <div className="flex space-x-2">
        {committeeTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleCommitteeTypeChange(type.id as 'country' | 'role' | 'crisis' | 'open')}
            className={`text-sm font-medium transition-colors ${activeCommitteeType === type.id
              ? 'bg-[#C6DAF4] text-white'
              : 'bg-white text-black border border-gray-800'
              }`}
            style={{
              width: '200px',
              height: '58px',
              borderRadius: '20px',
              padding: '5px'
            }}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Committees Table */}
      <CommitteesTable
        committees={committees}
        onRefresh={handleRefresh}
        committeeType={activeCommitteeType}
      />
    </div>
  );
};

export default CommitteesPage;
