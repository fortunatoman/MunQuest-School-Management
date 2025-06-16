import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export const getSupabaseToken = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.log('Error getting Supabase token:', error);
    return null;
  }
};

export const getSupabaseUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.log('Error getting Supabase user:', error);
    return null;
  }
};

export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new Error(error.message);
    }

    // Clear local storage
    localStorage.clear()
    
    toast.success('Logged out successfully');
    return { success: true };
  } catch (error: any) {
    toast.error(error.message || 'Logout failed');
    return { success: false, error: error.message };
  }
};
