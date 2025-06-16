import { supabase } from '../lib/supabase';
// import { getEmailConfirmationUrl } from '../utils/env';

export const supabaseSignUp = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/email-confirmation`
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      message: 'Sign up successful! Please check your email to verify your account.',
      data: data
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Sign up failed'
    };
  }
};

export const supabaseSignIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      message: 'Login successful!',
      data: data,
      token: data.session?.access_token
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Login failed'
    };
  }
};

export const supabaseSignOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      message: 'Logged out successfully'
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Logout failed'
    };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      user: user
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to get user'
    };
  }
};

export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      session: session
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to get session'
    };
  }
};

export const updatePassword = async (newPassword: string) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      message: 'Password updated successfully!',
      data: data
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to update password'
    };
  }
};

export const resendVerificationEmail = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      message: 'Verification email sent successfully! Please check your inbox.',
      data: data
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to resend verification email'
    };
  }
};