import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { getAllUsersApi } from '../apis/Users.ts';
import { getAllOrganisersApi } from '../apis/Organisers.ts';
import { getAllLocalitiesApi } from '../apis/localities.ts';
import { getAllSchoolsApi } from '../apis/schools.ts';
import { getAllAreasApi } from '../apis/areas.ts';
import { getAllEventsApi } from '../apis/Events.ts';
import { getAllLeadershipRolesApi } from '../apis/LeadershipRoles.ts';
import { useSupabaseAuth } from './SupabaseAuthContext';
import { toast } from 'sonner';
import { getAllCommitteesApi } from '../apis/Committees.ts';
import { getAllRegistrationsByEventIdApi } from '../apis/Registerations';
import { getAllCountriesApi } from '../apis/Countries.ts';
import { useNavigate } from 'react-router-dom';

// Define the context type
interface AppContextType {
  // User data
  userType: string | null;
  isOrganiser: boolean;
  isLoading: boolean;
  loginStatus: boolean;
  allUsers: any[];
  allOrganisers: any[];
  allEvents: any[];
  allLeadershipRoles: any[];
  // Dashboard statistics
  dashboardStats: {
    eventsUpcoming: number;
    eventsCompleted: number;
    users: number;
    organisers: number;
    pendingApprovals: number;
    schools: number;
  };

  // Actions
  setUserType: (type: string | null) => void;
  setIsOrganiser: (isOrganiser: boolean) => void;
  setLoginStatus: (status: boolean) => void;
  updateDashboardStats: (stats: Partial<AppContextType['dashboardStats']>) => void;
  refreshUserData: () => Promise<void>;
  setAllUsers: (users: any[]) => void;
  setAllOrganisers: (organisers: any[]) => void;
  setAllEvents: (events: any[]) => void;
  setAllLocalities: (localities: any[]) => void;
  setAllSchools: (schools: any[]) => void;
  setAllAreas: (areas: any[]) => void;
  setAllLeadershipRoles: (leadershipRoles: any[]) => void;
  refreshEventsData: () => Promise<void>;
  refreshLocalitiesData: () => Promise<void>;
  refreshSchoolsData: () => Promise<void>;
  refreshAreasData: () => Promise<void>;
  refreshLeadershipRolesData: () => Promise<void>;
  allLocalities: any[];
  allSchools: any[];
  allAreas: any[];
  allCommittees: any[];
  refreshCommitteesData: () => Promise<void>;
  allRegistrations: any[];
  setAllRegistrations: (regs: any[]) => void;
  refreshRegistrationsData: (eventId: string) => Promise<void>;
  allCountries: any[];
  setAllCountries: (countries: any[]) => void;
  refreshCountriesData: () => Promise<void>;
}

// Create the context with a default value to prevent undefined errors
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const { user: supabaseUser, session, loading: authLoading } = useSupabaseAuth();
  const navigate = useNavigate();
  // User state
  const [userType, setUserType] = useState<string | null>(null);
  const [isOrganiser, setIsOrganiser] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loginStatus, setLoginStatus] = useState<boolean>(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allOrganisers, setAllOrganisers] = useState<any[]>([]);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [allLocalities, setAllLocalities] = useState<any[]>([]);
  const [allSchools, setAllSchools] = useState<any[]>([]);
  const [allAreas, setAllAreas] = useState<any[]>([]);
  const [allLeadershipRoles, setAllLeadershipRoles] = useState<any[]>([]);
  const [allCommittees, setAllCommittees] = useState<any[]>([]);
  const [allCountries, setAllCountries] = useState<any[]>([]);
  const [allRegistrations, setAllRegistrations] = useState<any[]>([]);
  // Dashboard statistics state
  const [dashboardStats, setDashboardStats] = useState({
    eventsUpcoming: 5,
    eventsCompleted: 5,
    users: 900,
    organisers: 80,
    pendingApprovals: 3,
    schools: 70
  });

  // Check user type and organiser status
  const refreshUserData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Set login status based on authentication
      const isAuthenticated = !!(supabaseUser && session?.access_token);
      setLoginStatus(isAuthenticated);

      // Get user type from Supabase user metadata
      if (supabaseUser?.user_metadata?.role) {
        setUserType(supabaseUser.user_metadata.role);
      } else {
        setUserType('student'); // default
      }

      // Only make API calls if user is authenticated
      if (session?.access_token) {
        const allUsersResponse = await getAllUsersApi();
        if (allUsersResponse.success) {
          setAllUsers(allUsersResponse.data);
        }
        else {
          toast.error(allUsersResponse.message);
        }

        const allOrganisersResponse = await getAllOrganisersApi();
        setAllOrganisers(allOrganisersResponse.data);

        const allLeadershipRolesResponse = await getAllLeadershipRolesApi();
        setAllLeadershipRoles(allLeadershipRolesResponse.data);
      }
    } catch (error: any) {
      let token = localStorage.getItem('token');
      // Only show JWT expiration toast if user was logged in
      if (loginStatus && token || error?.message?.includes('expired')) {
        localStorage.clear();
        navigate('/login');
        toast.error('JWT token is expired. Please login again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [supabaseUser, session, loginStatus]);

  const refreshEventsData = useCallback(async () => {
    try {
      const allEventsResponse = await getAllEventsApi();
      if (allEventsResponse.success) {
        setAllEvents(allEventsResponse.data);
      }
      else {
        toast.error(allEventsResponse.message);
      }
    } catch (error: any) {
      let token = localStorage.getItem('token');
      // Only show JWT expiration toast if user was logged in
      if (loginStatus && token || error?.message?.includes('expired')) {
        localStorage.clear();
        navigate('/login');
        toast.error('JWT token is expired. Please login again.');
      }
    }
  }, [loginStatus]);

  const refreshLocalitiesData = useCallback(async () => {
    try {
      const allLocalitiesResponse = await getAllLocalitiesApi();
      if (allLocalitiesResponse.success) {
        setAllLocalities(allLocalitiesResponse.data);
      }
      else {
        toast.error(allLocalitiesResponse.message);
      }
    } catch (error: any) {
      let token = localStorage.getItem('token');
      // Only show JWT expiration toast if user was logged in
      if (loginStatus && token || error?.message?.includes('expired')) {
        localStorage.clear();
        navigate('/login');
        toast.error('JWT token is expired. Please login again.');
      }
    }
  }, [loginStatus]);

  const refreshSchoolsData = useCallback(async () => {
    try {
      const allSchoolsResponse = await getAllSchoolsApi();
      if (allSchoolsResponse.success) {
        setAllSchools(allSchoolsResponse.data);
      }
      else {
        toast.error(allSchoolsResponse.message);
      }
    } catch (error: any) {
      let token = localStorage.getItem('token');
      // Only show JWT expiration toast if user was logged in
      if (loginStatus && token || error?.message?.includes('expired')) {
        localStorage.clear();
        navigate('/login');
        toast.error('JWT token is expired. Please login again.');
      }
    }
  }, [loginStatus]);

  const refreshAreasData = useCallback(async () => {
    try {
      const allAreasResponse = await getAllAreasApi();
      if (allAreasResponse.success) {
        setAllAreas(allAreasResponse.data);
      }
      else {
        toast.error(allAreasResponse.message);
      }
    } catch (error: any) {
      let token = localStorage.getItem('token');
      // Only show JWT expiration toast if user was logged in
      if (loginStatus && token || error?.message?.includes('expired')) {
        localStorage.clear();
        navigate('/login');
        toast.error('JWT token is expired. Please login again.');
      }
    }
  }, [loginStatus]);

  const refreshLeadershipRolesData = useCallback(async () => {
    try {
      const allLeadershipRolesResponse = await getAllLeadershipRolesApi();
      if (allLeadershipRolesResponse.success) {
        setAllLeadershipRoles(allLeadershipRolesResponse.data);
      }
      else {
        toast.error(allLeadershipRolesResponse.message);
      }
      setAllLeadershipRoles(allLeadershipRolesResponse.data || []);
    } catch (error: any) {
      let token = localStorage.getItem('token');
      // Only show JWT expiration toast if user was logged in
      if (loginStatus && token || error?.message?.includes('expired')) {
        localStorage.clear();
        navigate('/login');
        toast.error('JWT token is expired. Please login again.');
      }
    }
  }, [loginStatus]);

  const refreshCommitteesData = useCallback(async () => {
    try {
      const allCommitteesResponse = await getAllCommitteesApi();
      if (allCommitteesResponse.success) {
        setAllCommittees(allCommitteesResponse.data);
      }
      else {
        toast.error(allCommitteesResponse.message);
      }
    } catch (error: any) {
      let token = localStorage.getItem('token');
      // Only show JWT expiration toast if user was logged in
      if (loginStatus && token || error?.message?.includes('expired')) {
        localStorage.clear();
        navigate('/login');
        toast.error('JWT token is expired. Please login again.');
      }
    }
  }, [loginStatus]);

  const refreshRegistrationsData = useCallback(async (eventId: string) => {
    try {
      if (!eventId) {
        console.log('No eventId provided to refreshRegistrationsData');
        return;
      }
      const response = await getAllRegistrationsByEventIdApi(eventId);
      if (response.success) {
        setAllRegistrations(response.data || []);
      } else {
        console.log('API response not successful:', response.message);
        toast.error(response.message);
      }
    } catch (error: any) {
      console.log('Error in refreshRegistrationsData:', error);
      let token = localStorage.getItem('token');
      if (loginStatus && token || error?.message?.includes('expired')) {
        localStorage.clear();
        navigate('/login');
        toast.error('JWT token is expired. Please login again.');
      }
    }
  }, [loginStatus]);

  const refreshCountriesData = useCallback(async () => {

    try {
      const response = await getAllCountriesApi();
      if (response.success) {
        setAllCountries(response.data);
      }
      else {
        toast.error(response.message);
      }
    } catch (error: any) {
      let token = localStorage.getItem('token');
      // Only show JWT expiration toast if user was logged in
      if (loginStatus && token || error?.message?.includes('expired')) {
        localStorage.clear();
        navigate('/login');
        toast.error('JWT token is expired. Please login again.');
      }
    }
  }, [loginStatus]);

  // Update dashboard statistics
  const updateDashboardStats = (newStats: Partial<AppContextType['dashboardStats']>) => {
    setDashboardStats(prev => ({
      ...prev,
      ...newStats
    }));
  };

  // Initialize user data when Supabase auth state changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!authLoading && token) {
      refreshUserData();
      refreshEventsData();
      refreshLeadershipRolesData();
      refreshSchoolsData();
      refreshLocalitiesData();
      refreshAreasData();
      refreshCommitteesData();
      refreshCountriesData();
    }
  }, [supabaseUser, session, authLoading, refreshUserData, refreshEventsData, refreshLeadershipRolesData, refreshSchoolsData, refreshLocalitiesData, refreshAreasData]);

  const value: AppContextType = {
    userType,
    isOrganiser,
    isLoading,
    loginStatus,
    dashboardStats,
    allUsers,
    allEvents,
    allLocalities,
    allSchools,
    allAreas,
    allLeadershipRoles,
    allCommittees,
    allRegistrations,
    setAllEvents,
    setAllLocalities,
    setAllSchools,
    setAllAreas,
    setAllLeadershipRoles,
    setAllUsers,
    setAllOrganisers,
    setAllRegistrations,
    allOrganisers,
    setUserType,
    setIsOrganiser,
    setLoginStatus,
    updateDashboardStats,
    refreshUserData,
    refreshEventsData,
    refreshLocalitiesData,
    refreshSchoolsData,
    refreshAreasData,
    refreshLeadershipRolesData,
    refreshCommitteesData,
    refreshRegistrationsData,
    allCountries,
    setAllCountries,
    refreshCountriesData,
  };


  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    console.log('useApp - Context is undefined, this should not happen if component is wrapped in AppProvider');
    console.log('Stack trace:', new Error().stack);
    // Instead of throwing an error, return a default context to prevent crashes
    return {
      userType: null,
      isOrganiser: false,
      isLoading: true,
      loginStatus: false,
      allUsers: [],
      allOrganisers: [],
      allEvents: [],
      allLocalities: [],
      allSchools: [],
      allAreas: [],
      allLeadershipRoles: [],
      allCommittees: [],
      allRegistrations: [],
      dashboardStats: {
        eventsUpcoming: 0,
        eventsCompleted: 0,
        users: 0,
        organisers: 0,
        pendingApprovals: 0,
        schools: 0
      },
      setUserType: () => { },
      setIsOrganiser: () => { },
      setLoginStatus: () => { },
      updateDashboardStats: () => { },
      refreshUserData: async () => { },
      setAllUsers: () => { },
      setAllOrganisers: () => { },
      setAllEvents: () => { },
      setAllLocalities: () => { },
      setAllSchools: () => { },
      setAllAreas: () => { },
      setAllLeadershipRoles: () => { },
      refreshEventsData: async () => { },
      refreshLocalitiesData: async () => { },
      refreshSchoolsData: async () => { },
      refreshAreasData: async () => { },
      refreshLeadershipRolesData: async () => { },
      refreshCommitteesData: async () => { },
      setAllRegistrations: () => { },
      refreshRegistrationsData: async (_eventId: string) => { },
      allCountries: [],
      setAllCountries: () => { },
      refreshCountriesData: async () => { },
    };
  }
  return context;
};

export default AppContext;
