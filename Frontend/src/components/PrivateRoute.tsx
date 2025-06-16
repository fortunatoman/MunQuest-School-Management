import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const location = useLocation();

  // 1) Authentication check
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2) Role-based access control
  const pathname = location.pathname || '';
  const organiserId = localStorage.getItem('organiserId');
  const userRole = (localStorage.getItem('userRole') || '').toLowerCase(); // 'student' | 'teacher' | 'organizer'
  const globalRole = (localStorage.getItem('global_role') || '').toLowerCase(); // 'superuser' | 'user'

  const roleHome = (role: string) => {
    if (role === 'student') return '/home';
    if (role === 'teacher') return '/home';
    if (role === 'organizer') return '/organiser';
    return '/home';
  };

  const requiresStudent = pathname.startsWith('/student');
  const requiresTeacher = pathname.startsWith('/teacher');
  const requiresOrganiser =
    pathname.startsWith('/organiser') ||
    pathname.startsWith('/event-dashboard') ||
    pathname.startsWith('/upload-delegates');

  const isSuperUserPage = pathname.startsWith('/super-user');

  // Superuser-only pages
  if (isSuperUserPage && globalRole !== 'superuser') {
    return <Navigate to={roleHome(userRole)} replace />;
  }

  // Per-role gated pages
  if (requiresStudent && userRole !== 'student') {
    return <Navigate to={roleHome(userRole)} replace />;
  }
  if (requiresTeacher && userRole !== 'teacher') {
    return <Navigate to={roleHome(userRole)} replace />;
  }
  if (requiresOrganiser && !organiserId) {
    return <Navigate to={roleHome(userRole)} replace />;
  }
  // 3) If authenticated and authorized, render the protected component
  return <>{children}</>;
};

export default PrivateRoute;
