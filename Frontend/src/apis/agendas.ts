import axios from 'axios';
import { checkAuth } from '../utils/checkAuth';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const getAllEventCommitteesAgendaApi = async (eventId: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${backendUrl}/api/v1/event-committees-agendas/get-all-event-committees-agendas/${eventId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        if (checkAuth(error)) {
            return; // Auth error handled, don't throw
        }
        throw new Error(error.response?.data?.message || 'Failed to fetch all event committees agendas');
    }
};

export const saveEventCommitteesByEventIdAgendaApi = async (eventId: string, event_committeeId: string, agenda_abbr: string, agenda_title: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${backendUrl}/api/v1/event-committees-agendas/save-agenda`, {
            eventId,
            event_committeeId,
            agenda_abbr,
            agenda_title
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
        throw new Error(error.response?.data?.message || 'Failed to save event committees agenda by event id');
    }
};

export const getEventCommitteesByEventIdAgendaApi = async (eventId: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${backendUrl}/api/v1/event-committees-agendas/get-event-committees-agendas-by-event/${eventId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        if (checkAuth(error)) {
            return; // Auth error handled, don't throw
        }
        throw new Error(error.response?.data?.message || 'Failed to fetch event committees agendas by event id');
    }
};

export const updateEventCommitteesAgendaByIdApi = async (id: string, agenda_title: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.patch(`${backendUrl}/api/v1/event-committees-agendas/update-event-committees-agendas-by-id/${id}`, {
            agenda_title
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
        throw new Error(error.response?.data?.message || 'Failed to update event committees agenda by id');
    }
};

export const deleteEventCommitteesAgendaByIdApi = async (id: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${backendUrl}/api/v1/event-committees-agendas/delete-event-committees-agendas-by-id/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        if (checkAuth(error)) {
            return; // Auth error handled, don't throw
        }
        throw new Error(error.response?.data?.message || 'Failed to delete event committees agenda by id');
    }
};



export const saveEventCommitteeDocumentApi = async (eventId: string, committeeId: string, doc_type: string, title: string, file_url: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${backendUrl}/api/v1/event-committees-agendas/save-event-committee-document`, {
            eventId,
            committeeId,
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
        if (checkAuth(error)) {
            return; // Auth error handled, don't throw
        }
        throw new Error(error.response?.data?.message || 'Failed to save event committee document');
    }
};

export const uploadAgendaDocumentApi = async (eventId: string, committeeId: string, file: File) => {
    try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('eventId', eventId);
        formData.append('committeeId', committeeId);
        formData.append('file', file);
        const response = await axios.post(`${backendUrl}/api/v1/event-committees-agendas/upload-agenda-document`, formData, {
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
        throw new Error(error.response?.data?.message || 'Failed to upload agenda document');
    }
};

export const getAgendaDocumentsApi = async (eventId: string, committeeId: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${backendUrl}/api/v1/event-committees-agendas/get-agenda-documents-by-event/${eventId}/${committeeId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        if (checkAuth(error)) {
            return; // Auth error handled, don't throw
        }
        throw new Error(error.response?.data?.message || 'Failed to fetch agenda documents');
    }
};

export const deleteEventCommitteeDocumentApi = async (documentId: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${backendUrl}/api/v1/event-committees-agendas/delete-event-committee-document/${documentId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        if (checkAuth(error)) {
            return; // Auth error handled, don't throw
        }
        throw new Error(error.response?.data?.message || 'Failed to delete event committee document');
    }
};