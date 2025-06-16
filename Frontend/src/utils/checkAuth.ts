export const checkAuth = (error: any) => {
    if (error?.response?.status === 401 || error?.status === 401) {
        localStorage.clear();
        // Use window.location to navigate since this is called from API functions
        window.location.href = '/login';
        return true; // Return true to indicate auth error was handled
    }
    return false; // Return false to indicate no auth error
}