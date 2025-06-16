import { getUserByIdApi } from '../apis/Users';

// Import default avatars
import StudentAvatar from '../assets/default_student.png';
import TeacherAvatar from '../assets/default_teacher.png';

export const getDefaultAvatar = (userType: string): string => {
  return userType === 'student' ? StudentAvatar : TeacherAvatar;
};

export const getUserType = (): string => {
  try {
    const userType = localStorage.getItem('userRole');
    return userType || 'student'; // Default fallback
  } catch (error) {
    console.log('Error getting user type:', error);
    return 'student'; // Default fallback
  }
};

export const clearUserAvatar = (): void => {
  localStorage.removeItem('userAvatar');
};

export const getUserAvatar = async (): Promise<string> => {
  try {
    // First try to get avatar from localStorage
    const storedAvatar = localStorage.getItem('userAvatar');
    if (storedAvatar) {
      return storedAvatar;
    }

    // If not in localStorage, get from API
    const userResponse = await getUserByIdApi();
    if (userResponse.success && userResponse.data.avatar) {
      // Store in localStorage for future use
      localStorage.setItem('userAvatar', userResponse.data.avatar);
      return userResponse.data.avatar;
    }

    // If no avatar from API, get user type from localStorage and return default
    const userRole = localStorage.getItem('userRole');
    if (userRole) {
      return getDefaultAvatar(userRole);
    }

    // Fallback to student avatar
    return StudentAvatar;
  } catch (error) {
    console.log('Error getting user avatar:', error);
    // Fallback to student avatar
    return StudentAvatar;
  }
};
