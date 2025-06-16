import axios from 'axios';
const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const saveGeneralDocumentApi = async (eventId: string, doc_type: string, title: string, file_url: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${backendUrl}/api/v1/general-documents/save-general-document`, {
            eventId,
            doc_type,
            title,
            file_url
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to save general document');
    }
};

export const uploadGeneralDocumentApi = async (eventId: string, file: File) => {
    try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('eventId', eventId);
        formData.append('file', file);
        const response = await axios.post(`${backendUrl}/api/v1/general-documents/upload-general-document`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response.data.message);
    }
};

export const getGeneralDocumentsApi = async (eventId: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${backendUrl}/api/v1/general-documents/get-general-documents-by-event/${eventId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch general documents');
    }
};

export const deleteGeneralDocumentApi = async (documentId: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${backendUrl}/api/v1/general-documents/delete-general-document/${documentId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to delete general document');
    }
};


export const getDocumentsByEventId = async (eventId: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${backendUrl}/api/v1/general-documents/get-all-documents-by-event-Id/${eventId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch general documents');
    }
}