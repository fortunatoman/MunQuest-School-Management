import axios from 'axios';
import { checkAuth } from '../utils/checkAuth';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const getAllRegistrationsByEventIdApi = async (eventId: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${backendUrl}/api/v1/registerations/get-registrations/${eventId}`, {
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

export const eventRegistratTeacherApi = async (eventId: string, foodPreference: string, foodAllergies: string) => {
    try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const response = await axios.post(`${backendUrl}/api/v1/registerations/event-registration-teacher/${userId}`, {
            eventId,
            foodPreference,
            foodAllergies,
        }, {
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

export const eventRegistratStudentApi = async (eventId: string, mun_experience: string, pref_committee_1_id: string, pref_committee_2_id: string, pref_committee_3_id: string, food_pref: string, food_allergies: string, emergency_name: string, emergency_phone: string) => {
    try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const response = await axios.post(`${backendUrl}/api/v1/registerations/event-registration-student/${userId}`, {
            eventId,
            mun_experience,
            pref_committee_1_id,
            pref_committee_2_id,
            pref_committee_3_id,
            food_pref,
            food_allergies,
            emergency_name,
            emergency_phone
        }, {
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

export const getRegistrationInfoByEventIdAndUserIdApi = async (eventId: string) => {
    try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const response = await axios.get(`${backendUrl}/api/v1/registerations/get-registration-info-by-eventId-and-userId/${eventId}/${userId}`,
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

// Cancel current user's registration for the given event
export const deleteRegistrationByEventIdAndUserIdApi = async (registrationId: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${backendUrl}/api/v1/registerations/delete-registration-by-registrationId/${registrationId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to cancel registration');
    }
}

export const deleteDelegateApi = async (delegateId: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${backendUrl}/api/v1/registerations/delete-delegate/${delegateId}`, {
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

export const assignDelegateApi = async (delegateId: string, committeeId: string, countryId: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${backendUrl}/api/v1/registerations/assign-delegate`, {
            delegateId,
            committeeId,
            countryId
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to assign delegate');
    }
}

export const unassignDelegateApi = async (delegateId: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${backendUrl}/api/v1/registerations/unassign-delegate`, {
            delegateId
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to unassign delegate');
    }
}

// Toggle delegate flag
export const toggleDelegateFlagApi = async (delegateId: string, flag: boolean) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${backendUrl}/api/v1/registerations/toggle-delegate-flag`, {
            delegateId,
            flag
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to toggle delegate flag');
    }
}

// Merge delegates
export const mergeDelegatesApi = async (selectedDelegates: number[]) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${backendUrl}/api/v1/registerations/merge-delegates`, {
            selectedDelegates
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to merge delegates');
    }
}

export const uploadDelegatesApi = async (file: File, eventId: string) => {
    try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('eventId', eventId);

        const response = await axios.post(`${backendUrl}/api/v1/registerations/upload-delegates`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to upload delegates');
    }
}