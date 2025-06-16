import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import PrivateRoute from './components/PrivateRoute';
import { AppProvider } from './contexts/AppContext';
import { SupabaseAuthProvider } from './contexts/SupabaseAuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import EmailVerification from './pages/EmailVerification';
import EmailConfirmationRedirect from './pages/EmailConfirmationRedirect';
import RootRedirect from './pages/RootRedirect';
import TestEmailConfirmation from './pages/TestEmailConfirmation';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import RequestApproval from './pages/RequestApproval';
import RequestUnderVerification from './pages/RequestUnderVerification';
import EventCreate from './pages/EventCreate';
import EventCreateSuccess from './pages/EventCreateSuccess';
import Organiser from './pages/Organiser';
import StudentProfile from './pages/student/StudentProfileCreate';
import TeacherProfile from './pages/teacher/TeacherProfileCreate';
import StudentProfilePage from './pages/student/StudentProfilePage';
import TeacherProfilePage from './pages/teacher/TeacherProfilePage';
import StudentHome from './pages/student/StudentHome';
import TeacherHome from './pages/teacher/TeacherHome';
import StudentRegistration from './pages/student/StudentRegistration';
import StudentRegistrationSuccess from './pages/student/StudentRegistrationSuccess';
import StudentDelegatePage from './pages/student/StudentDelegatePage';
import TeacherRegistration from './pages/teacher/TeacherRegistration';
import TeacherRegistrationSuccess from './pages/teacher/TeacherRegistrationSuccess';
import ProfilePage from './pages/ProfilePage';
import OrganiserDashboard from './pages/OrganiserDashboard';
import SuperUser from './pages/SuperUser';
import TeacherDelegatePage from './pages/teacher/TeacherDelegatePage';
import UploadDelegatesPage from './components/organiser/Delegates-UploadDelegatesPage';
import ViewDelegateProfile from './pages/ViewDelegateProfile';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <SupabaseAuthProvider>
      <Router>
        <AppProvider>
          <NotificationProvider>
            <div className="App">
              <Routes>
              {/* Public Routes - No authentication required */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/login" element={<Login />} />
              <Route path="/email-verification" element={<EmailVerification />} />
              <Route path="/email-confirmation" element={<EmailConfirmationRedirect />} />
              <Route path="/test-email-confirmation" element={<TestEmailConfirmation />} />
              <Route path="/profile-page" element={<PrivateRoute><ProfilePage userType="student" /></PrivateRoute>} />

              {/* Protected Routes - Authentication required */}
              <Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/request-approval" element={<PrivateRoute><RequestApproval /></PrivateRoute>} />
              <Route path="/request-under-verification" element={<PrivateRoute><RequestUnderVerification /></PrivateRoute>} />
              <Route path="/event-create" element={<PrivateRoute><EventCreate /></PrivateRoute>} />
              <Route path="/event-create-success" element={<PrivateRoute><EventCreateSuccess /></PrivateRoute>} />
              <Route path="/organiser" element={<PrivateRoute><Organiser /></PrivateRoute>} />
              <Route path="/event-dashboard/:eventId" element={<PrivateRoute><OrganiserDashboard /></PrivateRoute>} />
              <Route path="/upload-delegates/:eventId" element={<PrivateRoute><UploadDelegatesPage /></PrivateRoute>} />
              <Route path="/view-delegate-profile/:delegateId" element={<PrivateRoute><ViewDelegateProfile /></PrivateRoute>} />
              <Route path="/super-user" element={<PrivateRoute><SuperUser /></PrivateRoute>} />

              {/* Student Routes */}
              <Route path="/student-profile" element={<PrivateRoute><StudentProfile /></PrivateRoute>} />
              <Route path="/student-profile-page" element={<PrivateRoute><StudentProfilePage /></PrivateRoute>} />
              <Route path="/student-home" element={<PrivateRoute><StudentHome /></PrivateRoute>} />
              <Route path="/student-registration/:eventId" element={<PrivateRoute><StudentRegistration /> </PrivateRoute>} />
              <Route path="/student-registration-success/:eventId" element={<PrivateRoute><StudentRegistrationSuccess /></PrivateRoute>} />
              <Route path="/student-delegate-page/:eventId" element={<PrivateRoute><StudentDelegatePage /></PrivateRoute>} />

              {/* Teacher Routes */}
              <Route path="/teacher-profile" element={<PrivateRoute><TeacherProfile /></PrivateRoute>} />
              <Route path="/teacher-profile-page" element={<PrivateRoute><TeacherProfilePage /></PrivateRoute>} />
              <Route path="/teacher-home" element={<PrivateRoute><TeacherHome /></PrivateRoute>} />
              <Route path="/teacher-registration/:eventId" element={<PrivateRoute><TeacherRegistration /></PrivateRoute>} />
              <Route path="/teacher-registration-success/:eventId" element={<PrivateRoute><TeacherRegistrationSuccess /></PrivateRoute>} />
              <Route path="/teacher-delegate-page/:eventId" element={<PrivateRoute><TeacherDelegatePage /></PrivateRoute>} />
              
              {/* 404 Route - Must be last */}
              <Route path="*" element={<NotFoundPage />} />
              </Routes>
              <Toaster position="bottom-right" richColors />
            </div>
          </NotificationProvider>
        </AppProvider>
      </Router>
    </SupabaseAuthProvider>
  );
}

export default App;