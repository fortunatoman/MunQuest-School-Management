import axios from 'axios';
import { checkAuth } from '../utils/checkAuth';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const getAllCommitteesApi = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${backendUrl}/api/v1/committees/all-committees`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        if (checkAuth(error)) {
            return; // Auth error handled, don't throw
        }
        console.log('Failed to fetch committees:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch committees');
    }
};

export const createCommitteeApi = async (abbr: string, committee: string, category: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${backendUrl}/api/v1/committees/add-committee`, {
            abbr,
            committee,
            category
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        if (checkAuth(error)) {
            return; // Auth error handled, don't throw
        }
        console.error('Failed to create committee:', error);
        throw new Error(error.response?.data?.message || 'Failed to create committee');
    }
};

export const updateCommitteeApi = async (committeeId: string, abbr: string, committee: string, category: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.patch(`${backendUrl}/api/v1/committees/update-committee/${committeeId}`, {
            abbr,
            committee,
            category
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        if (checkAuth(error)) {
            return; // Auth error handled, don't throw
        }
        console.error('Failed to update committee:', error);
        throw new Error(error.response?.data?.message || 'Failed to update committee');
    }
};

export const deleteCommitteeApi = async (committeeId: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${backendUrl}/api/v1/committees/delete-committee/${committeeId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        if (checkAuth(error)) {
            return; // Auth error handled, don't throw
        }
        console.error('Failed to delete committee:', error);
        throw new Error(error.response?.data?.message || 'Failed to delete committee');
    }
};
