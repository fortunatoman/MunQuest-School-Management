import React from 'react';
import ProfilePage from '../ProfilePage';

const StudentProfilePage: React.FC = () => {
  // In a real app, you would fetch this data from an API or context
  const initialData = {
    username: '@samm1234',
    name: 'Sam Morgan Lee',
    dateOfBirth: '2008-10-05',
    gender: 'male',
    locality: 'DU',
    schoolName: 'Oasis World School',
    gradeOrYear: 'IB DP 2',
    email: 'samlee@gmail.com',
    mobile: '+971 50 6362040'
  };

  return <ProfilePage userType="student" initialData={initialData} />;
};

export default StudentProfilePage;
