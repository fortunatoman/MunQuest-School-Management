import axios from 'axios';
const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const getAllLeadershipRolesApi = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${backendUrl}/api/v1/leadership-roles/all-leadership-roles`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        console.error('Failed to fetch leadership roles:', error);
    }
};

export const createLeadershipRoleApi = async (abbr: string, leadership_role: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${backendUrl}/api/v1/leadership-roles/add-leadership-role`, {
            abbr,
            leadership_role
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to create leadership role');
    }
};

export const updateLeadershipRoleApi = async (roleId: string, abbr: string, leadership_role: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.patch(`${backendUrl}/api/v1/leadership-roles/update-leadership-role/${roleId}`, {
            abbr,
            leadership_role
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to update leadership role');
    }
};

export const deleteLeadershipRoleApi = async (roleId: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${backendUrl}/api/v1/leadership-roles/delete-leadership-role/${roleId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to delete leadership role');
    }
};


