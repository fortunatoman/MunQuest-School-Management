import axios from 'axios';
const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const getAllLocalitiesApi = async () => {
    try {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('Authentication token not found. Please login again.');
        }

        const response = await axios.get(`${backendUrl}/api/v1/localities/all-localities`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        } else if (error.message) {
            throw new Error(error.message);
        } else {
            throw new Error('Failed to load localities. Please try again.');
        }
    }
};

export const mergeLocalitiesApi = async (primaryLocalityId: string, secondaryLocalityId: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${backendUrl}/api/v1/localities/merge-localities`, {
            primaryLocalityId,
            secondaryLocalityId
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response.data.message);
    }
};

export const deleteLocalityApi = async (id: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${backendUrl}/api/v1/localities/delete-locality/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    }
    catch (error: any) {
        throw new Error(error.response.data.message);
    }
};