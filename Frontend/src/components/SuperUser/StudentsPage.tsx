import React, { useState, useEffect } from 'react';
import { getAllUsersApi } from '../../apis/Users';
import UsersTable from './UsersTable';
import { LoadingSpinner } from '../ui';

const StudentsPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllUsersApi();
      
      if (response.success) {
        // Filter for students only
        const students = (response.data || []).filter((user: any) => user.role === 'student');
        setUsers(students);
      } else {
        setError(response.message || 'Failed to fetch students');
      }
    } catch (error: any) {
      console.log('Error fetching students:', error);
      setError(error.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleRefresh = () => {
    fetchStudents();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="large" text="Loading students..." />
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
        userType="student"
      />
    </div>
  );
};

export default StudentsPage;
