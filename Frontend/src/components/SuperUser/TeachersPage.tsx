import React, { useState, useEffect } from 'react';
import { getAllUsersApi } from '../../apis/Users';
import UsersTable from './UsersTable';
import { LoadingSpinner } from '../ui';

const TeachersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllUsersApi();
      
      if (response.success) {
        // Filter for teachers only
        const teachers = (response.data || []).filter((user: any) => user.role === 'teacher');
        setUsers(teachers);
      } else {
        setError(response.message || 'Failed to fetch teachers');
      }
    } catch (error: any) {
      console.log('Error fetching teachers:', error);
      setError(error.message || 'Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleRefresh = () => {
    fetchTeachers();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="large" text="Loading teachers..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-4">Error: {error}</div>
        <button
          onClick={handleRefresh}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UsersTable 
        users={users} 
        userType="teacher"
      />
    </div>
  );
};

export default TeachersPage;
