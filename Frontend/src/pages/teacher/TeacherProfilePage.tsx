import React from 'react';
import ProfilePage from '../ProfilePage';

const TeacherProfilePage: React.FC = () => {
  // In a real app, you would fetch this data from an API or context
  const initialData = {
    username: '@teach4567',
    name: 'Dr. Sarah Johnson',
    dateOfBirth: '1985-03-15',
    gender: 'female',
    locality: 'DU',
    schoolName: 'Oasis World School',
    gradeOrYear: 'Head of Department',
    email: 'sarah.johnson@oasis.edu',
    mobile: '+971 50 1234567'
  };

  return <ProfilePage userType="teacher" initialData={initialData} />;
};

export default TeacherProfilePage;
