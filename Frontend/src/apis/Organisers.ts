import axios from 'axios';
import { checkAuth } from '../utils/checkAuth';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const edviceDocsfileUploadApi = async (file: File) => {
    try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', file);
        const response = await axios.post(`${backendUrl}/api/v1/organisers/organiser-approval-edvince-upload`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error: any) {
        if (checkAuth(error)) {
            return; // Auth error handled, don't throw
        }
        throw new Error(error.response?.data?.message || 'API request failed');
    }
};

export const requestApprovalApi = async (school_id: string, locality_id: string, role: string, evidenceDocs: string) => {
    try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const response = await axios.post(`${backendUrl}/api/v1/organisers/organiser-approval-request/${userId}`, {
            school_id,
            locality_id,
            role,
            evidenceDocs
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
        throw new Error(error.response?.data?.message || 'API request failed');
    }
}

export const verifyOrganiserApi = async () => {
    try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const response = await axios.get(`${backendUrl}/api/v1/organisers/verify-organiser/${userId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        if (checkAuth(error)) {
            return; // Auth error handled, don't throw
        }
        throw new Error(error.response?.data?.message || 'API request failed');
    }
}

export const getAllOrganisersApi = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${backendUrl}/api/v1/organisers/all-organisers`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error: any) {
        if (checkAuth(error)) {
            return; // Auth error handled, don't throw
        }
        throw new Error(error.response?.data?.message || 'API request failed');
    }
}

export const updateOrganiserStatusApi = async (organiserId: string, status: string) => {
    try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const response = await axios.patch(`${backendUrl}/api/v1/organisers/update-organiser-status/${organiserId}`, { status, userId }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        if (checkAuth(error)) {
            return; // Auth error handled, don't throw
        }
        throw new Error(error.response?.data?.message || 'API request failed');
    }
}

export const deleteOrganiserApi = async (organiserId: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${backendUrl}/api/v1/organisers/delete-organiser/${organiserId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        if (checkAuth(error)) {
            return; // Auth error handled, don't throw
        }
        throw new Error(error.response?.data?.message || 'API request failed');
    }
}

export const addOrganiserBySuperUserApi = async (user_id: string, school_id: string, locality_id: string, role: string, evidence: string, status: string, actioned_by_user_id: string) => {
    try {
        const token = localStorage.getItem('token');

        const response = await axios.post(`${backendUrl}/api/v1/organisers/add-organiser-by-super-user`, {
            user_id,
            school_id,
            locality_id,
            role,
            evidence,
            status,
            actioned_by_user_id
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
        throw new Error(error.response?.data?.message || 'API request failed');
    }
}

export const assignOrganiserToSchoolApi = async (userId: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${backendUrl}/api/v1/organisers/assign-organiser-to-school`, { userId }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        if (checkAuth(error)) {
            return; // Auth error handled, don't throw
        }
        throw new Error(error.response?.data?.message || 'API request failed');
    }
}

export const removeOrganiserFromSchoolApi = async (userId: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${backendUrl}/api/v1/organisers/remove-organiser-from-school/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        if (checkAuth(error)) {
            return; // Auth error handled, don't throw
        }
        throw new Error(error.response?.data?.message || 'API request failed');
    }
}