import { getUserByIdApi } from '../apis/Users';

export const checkUserProfileExists = async (): Promise<boolean> => {
  try {
    const response = await getUserByIdApi();
    // Check if user has essential profile data
    return !!(response.data && response.data.fullname && response.data.username);
  } catch (error) {
    // If API call fails, assume no profile exists
    return false;
  }
};
