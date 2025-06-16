export const getBackendUrl = (): string => {
  return import.meta.env.VITE_BACKEND_URL || 'http://localhost:1000';
};

// Email confirmation redirect URL
export const getEmailConfirmationUrl = (): string => {
  // Check for environment variable first
  const envUrl = import.meta.env.VITE_FRONTEND_URL;
  
  if (envUrl) {
    // If environment variable is set, use it
    const url = envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
    return `${url}/email-confirmation`;
  }
  
  // For development, detect the current URL
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    return `${origin}/email-confirmation`;
  }
  
  // Fallback for production
  return 'https://www.munquest.com/email-confirmation';
};
