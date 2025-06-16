import React, { useState } from 'react';
import { Header } from '../components/ui';
import PageLoader from '../components/PageLoader';
import MasterlistsNavigation from '../components/SuperUser/MasterlistsNavigation';
import EventsPage from '../components/SuperUser/EventsPage';
import OrganisersPage from '../components/SuperUser/OrganisersPage';
import GlobalUserPage from '../components/SuperUser/GlobalUserPage';
import LeadershipRolesPage from '../components/SuperUser/LeadershipRolesPage';
import CommitteesPage from '../components/SuperUser/CommitteesPage';
import SchoolsPage from '../components/SuperUser/SchoolsPage';
import { useApp } from '../contexts/AppContext';

const SuperUser: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [usersSubSection, setUsersSubSection] = useState<boolean>(true);
  const [schoolsSubSection, setSchoolsSubSection] = useState<number>(0);

  const { allUsers, allOrganisers, allEvents, allSchools } = useApp();

  const statsDisplay = [
    { title: 'Events Upcoming', value: allEvents.filter(event => event.status === 'pending').length.toString() },
    { title: 'Events Completed', value: allEvents.filter(event => event.status === 'completed').length.toString() },
    { title: 'Users', value: allUsers.length.toString() },
    { title: 'Organisers', value: allOrganisers.filter(organiser => organiser.status === 'approved').length.toString() },  
    { title: 'Pending Approvals', value: allOrganisers.filter(organiser => organiser.status === 'pending').length.toString() },
    { title: 'Schools', value: allSchools.length.toString() },
  ];


  const getPageTitle = () => {
    if (activeTab === 'users' && usersSubSection) {
      return 'Masterlists > Users Related > Users > Students';
    } else if (activeTab === 'users' && !usersSubSection) {
      return 'Masterlists > Users Related > Users > Teachers';
    } else if (activeTab === 'superusers' && usersSubSection) {
      return 'Masterlists > Users Related > Superusers > Students';
    } else if (activeTab === 'superusers' && !usersSubSection) {
      return 'Masterlists > Users Related > Superusers > Teachers';
    } else if (activeTab === 'schools' && schoolsSubSection === 0) {
      return 'Masterlists > Schools Related > Schools > Dubai';
    } else if (activeTab === 'schools' && schoolsSubSection === 1) {
      return 'Masterlists > Schools Related > Schools > Abu Dhabi';
    } else if (activeTab === 'schools' && schoolsSubSection === 2) {
      return 'Masterlists > Schools Related > Schools > Al Ain';
    } else if (activeTab === 'schools' && schoolsSubSection === 3) {
      return 'Masterlists > Schools Related > Schools > Sharjah';
    } else if (activeTab === 'schools' && schoolsSubSection === 4) {
      return 'Masterlists > Schools Related > Schools > Ajman';
    } else if (activeTab === 'schools' && schoolsSubSection === 5) {
      return 'Masterlists > Schools Related > Schools > Ras Al Khaimah';
    } else if (activeTab === 'schools' && schoolsSubSection === 6) {
      return 'Masterlists > Schools Related > Schools > Umm Al Quwain';
    } else if (activeTab === 'schools' && schoolsSubSection === 7) {
      return 'Masterlists > Schools Related > Schools > Other';
    } else if (activeTab === 'localities' && schoolsSubSection === 0) {
      return 'Masterlists > Schools Related > Localities > Dubai';
    } else if (activeTab === 'localities' && schoolsSubSection === 1) {
      return 'Masterlists > Schools Related > Localities > Abu Dhabi';
    } else if (activeTab === 'localities' && schoolsSubSection === 2) {
      return 'Masterlists > Schools Related > Localities > Al Ain';
    }    else if (activeTab === 'localities' && schoolsSubSection === 3) {
      return 'Masterlists > Schools Related > Localities > Sharjah';
    } else if (activeTab === 'localities' && schoolsSubSection === 4) {
      return 'Masterlists > Schools Related > Localities > Ajman';
    } else if (activeTab === 'localities' && schoolsSubSection === 5) {
      return 'Masterlists > Schools Related > Localities > Ras Al Khaimah';
    } else if (activeTab === 'localities' && schoolsSubSection === 6) {
      return 'Masterlists > Schools Related > Localities > Umm Al Quwain';
    } else if (activeTab === 'localities' && schoolsSubSection === 7) {
      return 'Masterlists > Schools Related > Localities > Other';
    }
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard';
      case 'masterlists':
        return 'Masterlists';
      case 'events-related':
        return 'Masterlists > Events Related';
      case 'events':
        return 'Masterlists > Events Related > Events';
      case 'organisers':
        return 'Masterlists > Events Related > Organisers';
      case 'leadership-roles':
        return 'Masterlists > Events Related > Leadership Roles';
      case 'committees':
        return 'Masterlists > Events Related > Committees';
      case 'students':
        return 'Masterlists > Events Related > Organisers > Students';
      case 'teachers':
        return 'Masterlists > Events Related > Organisers > Teachers';
      case 'users-related':
        return 'Masterlists > Users Related';
      case 'users':
        return 'Masterlists > Users Related > Users';
      case 'superusers':
        return 'Masterlists > Users Related > Superusers';
      case 'schools-related':
        return 'Masterlists > Schools Related';
      case 'schools':
        return 'Masterlists > Schools Related > Schools';
      case 'localities':
        return 'Masterlists > Schools Related > Localities';
      default:
        return 'Dashboard';
    }
  }; 

  const renderDashboard = () => {
    return (
      <div className="space-y-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-6 gap-6">
          {statsDisplay.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="bg-[#607DA3] px-4 py-3">
                <h3 className="text-white font-semibold text-sm text-center">
                  {stat.title}
                </h3>
              </div>
              {/* Value */}
              <div className="bg-white px-4 py-6">
                <div className="text-3xl font-bold text-gray-900 text-center">
                  {stat.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMasterlists = () => {
    return (
      <div className="space-y-6">
        {activeTab === 'events' && <EventsPage />}
        
        {activeTab === 'organisers' && <OrganisersPage type="students" />}
        
        {activeTab === 'students' && <OrganisersPage type="students" />}
        
        {activeTab === 'teachers' && <OrganisersPage type="teachers" />}
        
        {activeTab === 'leadership-roles' && <LeadershipRolesPage />}
        
        {activeTab === 'committees' && <CommitteesPage />}
      </div>
    );
  };

  const renderContent = () => {
    if (activeTab === 'users' && usersSubSection) {
      return <GlobalUserPage type="students" isSuperUser={false} />
    } else if (activeTab === 'users' && !usersSubSection) {
      return <GlobalUserPage type="teachers" isSuperUser={false} />
    } else if (activeTab === 'superusers' && usersSubSection) {
      return <GlobalUserPage type="students" isSuperUser={true} />
    } else if (activeTab === 'superusers' && !usersSubSection) {
      return <GlobalUserPage type="teachers" isSuperUser={true} />
    }
    if (activeTab === 'schools') {
      return <SchoolsPage type="schools" selectedLocality={schoolsSubSection} />
    }
    if (activeTab === 'localities') {
      return <SchoolsPage type="localities" selectedLocality={schoolsSubSection} />
    }
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'masterlists':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Masterlists</h2>
            <p className="text-gray-500 mt-2">Select a category to manage...</p>
          </div>
        );
      case 'events-related':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Events Related</h2>
            <p className="text-gray-500 mt-2">Select a specific category to manage...</p>
          </div>
        );
      case 'users-related':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Users Related</h2>
            <p className="text-gray-500 mt-2">Users management coming soon...</p>
          </div>
        );
      case 'schools-related':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Schools Related</h2>
            <p className="text-gray-500 mt-2">Select a specific category to manage...</p>
          </div>
        );
      case 'events':
      case 'organisers':
      case 'students':
      case 'teachers':
      case 'leadership-roles':
      case 'committees':
        return renderMasterlists();
      default:
        return renderDashboard();
    }
  };

  return (
    <PageLoader loadingText="Loading Super User Dashboard...">
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <Header maxWidth="max-w-[88rem]" />

        {/* Main Content */}
        <div className="max-w-[85rem] mx-auto px-6 py-8" style={{ paddingLeft: '10.5rem' }}>
          {/* Page Title */}
          <div className="text-left mb-8">
            <h1 className="text-4xl font-bold text-gray-900">
              {getPageTitle()}
            </h1>
          </div>

          {/* Main Navigation */}
          <div className="flex justify-left mb-8">
            <MasterlistsNavigation 
              activeSection={activeTab}
              onSectionChange={setActiveTab}
              usersSubSection={usersSubSection}
              setUsersSubSection={setUsersSubSection}
              schoolsSubSection={schoolsSubSection}
              setSchoolsSubSection={setSchoolsSubSection}
            />
          </div>

          {/* Tab Content */}
          {renderContent()}
        </div>
      </div>
    </PageLoader>
  );
};

export default SuperUser;
