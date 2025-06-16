import axios from 'axios';
import { checkAuth } from '../utils/checkAuth';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const eventImagefileUploadApi = async (file: File) => {
    try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', file);
        const response = await axios.post(`${backendUrl}/api/v1/events/create-event-images-upload`, formData, {
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

export const createEventApi = async (name: string, description: string, start_date: string, end_date: string, cover_image: string, logo_image: string, locality_id: string, school_id: string, area_id: string, number_of_seats: string, fees_per_delegate: string, total_revenue: string, website: string, instagram: string, organiser_id: string) => {
    try {
        const token = localStorage.getItem('token');
        const organiserId = localStorage.getItem('organiserId');
        const response = await axios.post(`${backendUrl}/api/v1/events/create-event/${organiserId}`, {
            name,
            description,
            start_date,
            end_date,
            cover_image,
            logo_image,
            locality_id,
            school_id,
            area_id,
            number_of_seats,
            fees_per_delegate,
            total_revenue,
            website,
            instagram,
            organiser_id
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
};

export const getCurrentEventsApi = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${backendUrl}/api/v1/events/get-events`, {
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

export const getEventsByOrganiserApi = async () => {
    try {
        const token = localStorage.getItem('token');
        const organiserId = localStorage.getItem('organiserId');
        const response = await axios.get(`${backendUrl}/api/v1/events/get-events-of-organiser/${organiserId}`, {
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

export const getEventByIdApi = async (eventId: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${backendUrl}/api/v1/events/get-event-by-id/${eventId}`, {
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


export const updateEventApi = async (eventId: string, name: string, description: string, start_date: string, end_date: string, cover_image: string, locality_id: string, school_id: string, area_id: string, number_of_seats: string, fees_per_delegate: string, total_revenue: string, website: string, instagram: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.patch(`${backendUrl}/api/v1/events/update-event/${eventId}`, {
            name,
            description,
            start_date,
            end_date,
            cover_image,
            locality_id,
            school_id,
            area_id,
            number_of_seats,
            fees_per_delegate,
            total_revenue,
            website,
            instagram
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

export const getAllEventsApi = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${backendUrl}/api/v1/events/all-events`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        console.error('Failed to fetch events:', error);
    }
}

export const updateEventStatusApi = async (eventId: string, status: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.patch(`${backendUrl}/api/v1/events/update-event-status/${eventId}`,
            {
                status
            },
            {
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

export const deleteEventApi = async (eventId: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${backendUrl}/api/v1/events/delete-event/${eventId}`, {
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

export const checkRegistrationStatusApi = async (userId: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${backendUrl}/api/v1/events/check-registration-status/${userId}`, {
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

export const getAllRegistrationApi = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${backendUrl}/api/v1/registerations/get-all-registrations`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        return response.data;
    } catch (error: any) {
        if (checkAuth(error)) {
            return;
        }
        throw new Error(error.response?.data?.message || 'API request failed');
    }
}