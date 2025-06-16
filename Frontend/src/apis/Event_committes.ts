import axios from 'axios';
const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const getAllEventCommitteesApi = async (eventId: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${backendUrl}/api/v1/event-committees/get-all-event-committees/${eventId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch all event committees');
    }
};

export const saveEventCommitteesByEventIdApi = async (committeeId: string, eventId: string, category: string, abbr: string, seats: string,
    chair_username: string, chair_fullname: string, deputy_chair1_username: string, deputy_chair1_fullname: string,
    deputy_chair2_username: string, deputy_chair2_fullname: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${backendUrl}/api/v1/event-committees/save-event-committees-by-event`, {
            committeeId,
            eventId,
            category,
            abbr,
            seats,
            chair_username,
            chair_fullname,
            deputy_chair1_username,
            deputy_chair1_fullname,
            deputy_chair2_username,
            deputy_chair2_fullname
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to save event committees by event id');
    }
};

export const getEventCommitteesByEventIdApi = async (eventId: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${backendUrl}/api/v1/event-committees/get-event-committees-by-event/${eventId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch event committees by event id');
    }
};

export const updateEventCommitteesByEventIdApi = async (id: string, eventId: string, committeeId: string, category: string, seats: string,
    chair_username: string, chair_fullname: string, deputy_chair1_username: string, deputy_chair1_fullname: string,
    deputy_chair2_username: string, deputy_chair2_fullname: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.patch(`${backendUrl}/api/v1/event-committees/update-event-committees-by-event/${id}`, {
            committeeId,
            eventId,
            category,
            seats,
            chair_username,
            chair_fullname,
            deputy_chair1_username,
            deputy_chair1_fullname,
            deputy_chair2_username,
            deputy_chair2_fullname
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to update event committees by event id');
    }
};

export const deleteEventCommitteesByEventIdApi = async (id: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${backendUrl}/api/v1/event-committees/delete-event-committees-by-event/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to delete event committees by event id');
    }
};