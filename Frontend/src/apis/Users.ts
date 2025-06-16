import axios from 'axios';
import { getBackendUrl } from '../utils/env';
import { checkAuth } from '../utils/checkAuth';

const backendUrl = getBackendUrl();

export const signupApi = async (email: string, role: string, auth_id: string | null) => {
    try {
        const response = await axios.post(`${backendUrl}/api/v1/users/register`, { email, role, auth_id });
        return response.data;
    } catch (error: any) {
        if (checkAuth(error)) {
            return; // Auth error handled, don't throw
        }
        throw new Error(error.response?.data?.message || 'API request failed');
    }
};

export const loginApiHandler = async (email: string, password: string) => {
    try {
        const response = await axios.post(`${backendUrl}/api/v1/users/login`, { email, password });
        return response.data;
    } catch (error: any) {
        if (checkAuth(error)) {
            return; // Auth error handled, don't throw
        }
        throw new Error(error.response?.data?.message || 'API request failed');
    }
};

export const getUserIdByEmailApi = async (email: string) => {
    try {
        const response = await axios.post(`${backendUrl}/api/v1/users/get-userid-by-email`, { email });
        return response.data;
    } catch (error: any) {
        if (checkAuth(error)) {
            return; // Auth error handled, don't throw
        }
        throw new Error(error.response?.data?.message || 'API request failed');
    }
};

export const getUserDataByEmailApi = async (email: string) => {
    try {
        const response = await axios.post(`${backendUrl}/api/v1/users/get-userid-by-email`, { email });
        return response.data;
    } catch (error: any) {
        if (checkAuth(error)) {
            return; // Auth error handled, don't throw
        }
        throw new Error(error.response?.data?.message || 'API request failed');
    }
};

export const loginApi = async (email: string, password: string) => {
    try {
        const response = await axios.post(`${backendUrl}/api/v1/users/login`, { email, password });
        return response.data;
    } catch (error: any) {
        if (checkAuth(error)) {
            return; // Auth error handled, don't throw
        }
        throw new Error(error.response?.data?.message || 'API request failed');
    }
};

export const deleteAccountApi = async () => {
    try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const response = await axios.delete(`${backendUrl}/api/v1/users/delete-account/${userId}`, {
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

export const teacherProfileApi = async (fullname: string, username: string, birthday: string, gender: string, school_id: string, yearsOfExperience: string, phone: string, phone_e164: string) => {
    try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        if (!token) {
            throw new Error('Authentication token not found. Please login again.');
        }

        if (!userId) {
            throw new Error('User ID not found. Please login again.');
        }

        const response = await axios.patch(`${backendUrl}/api/v1/users/teacher-profile/${userId}`, {
            fullname,
            username,
            birthday,
            gender,
            school_id,
            yearsOfExperience,
            phone,
            phone_e164
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
        console.log('Teacher profile API error:', error);
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        } else if (error.message) {
            throw new Error(error.message);
        } else {
            throw new Error('Failed to create teacher profile. Please try again.');
        }
    }
};

export const studentProfileApi = async (fullname: string, username: string, birthday: string, gender: string, school_id: string, grade: string, phone: string, phone_e164: string) => {
    try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        if (!token) {
            throw new Error('Authentication token not found. Please login again.');
        }

        if (!userId) {
            throw new Error('User ID not found. Please login again.');
        }

        const response = await axios.patch(`${backendUrl}/api/v1/users/student-profile/${userId}`, {
            fullname,
            username,
            birthday,
            gender,
            school_id,
            grade,
            phone,
            phone_e164,
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
        console.log('Student profile API error:', error);
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        } else if (error.message) {
            throw new Error(error.message);
        } else {
            throw new Error('Failed to create student profile. Please try again.');
        }
    }
};

export const getUserByIdApi = async () => {
    try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const response = await axios.get(`${backendUrl}/api/v1/users/user-profile/${userId}`, {
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

export const updateStudentProfileApi = async (fullname: string, username: string, birthday: string, gender: string, school_id: string, grade: string, yearsOfExperience: string, phone: string, email: string, avatar?: string, phone_e164?: string) => {
    try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const response = await axios.patch(`${backendUrl}/api/v1/users/student-profile-update/${userId}`, {
            fullname,
            username,
            birthday,
            gender,
            school_id,
            grade,
            yearsOfExperience,
            phone,
            email,
            avatar,
            phone_e164
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

export const updateTeacherProfileApi = async (fullname: string, username: string, birthday: string, gender: string, school_id: string, yearsOfExperience: string, phone: string, email: string, avatar?: string, phone_e164?: string) => {
    try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const response = await axios.patch(`${backendUrl}/api/v1/users/teacher-profile-update/${userId}`, {
            fullname,
            username,
            birthday,
            gender,
            school_id,
            yearsOfExperience,
            phone,
            email,
            avatar,
            phone_e164
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

export const uploadAvatarApi = async (avatarFile: File) => {
    try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const formData = new FormData();
        formData.append('avatar', avatarFile);

        const response = await axios.post(`${backendUrl}/api/v1/users/upload-avatar/${userId}`, formData, {
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

export const changePasswordApi = async (newPassword: string) => {
    try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const response = await axios.patch(`${backendUrl}/api/v1/users/change-password/${userId}`, { newPassword }, {
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

export const getAllUsersApi = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${backendUrl}/api/v1/users/all-users`, {
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

export const deleteUserBySuperUserApi = async (userId: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${backendUrl}/api/v1/users/delete-user-by-super-user/${userId}`, {
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

export const updateUserStatusApi = async (userId: string, status: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.patch(`${backendUrl}/api/v1/users/update-user-status/${userId}`, { status }, {
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

export const updateUserBySuperUserApi = async (userId: string, userData: {
    username?: string;
    fullname?: string;
    email?: string;
    academicLevel?: string;
    school?: string;
    munExperience?: string;
    globalRole?: string;
}) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.patch(`${backendUrl}/api/v1/users/update-user-by-super-user/${userId}`, userData, {
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

export const updateTeacherProfileAndCustomLocalityApi = async (fullname: string, username: string, birthday: string,
    gender: string, custom_locality_name: string, custom_school_name: string, yearsOfExperience: string, phone: string,
    email: string, avatar?: string, phone_e164?: string) => {
    try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const response = await axios.patch(`${backendUrl}/api/v1/users/teacher-profile-and-custom-locality/${userId}`, {
            fullname,
            username,
            birthday,
            gender,
            custom_locality_name,
            custom_school_name,
            yearsOfExperience,
            phone,
            email,
            avatar,
            phone_e164
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

export const updateTeacherProfileCustomSchoolNameApi = async (
    fullname: string, username: string, birthday: string, gender: string, locality: string,
    custom_school_name: string, yearsOfExperience: string, phone: string, phone_e164?: string) => {
    try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const response = await axios.patch(`${backendUrl}/api/v1/users/teacher-profile-custom-school-name/${userId}`, {
            fullname,
            username,
            birthday,
            gender,
            locality,
            custom_school_name,
            yearsOfExperience,
            phone,
            phone_e164
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

export const updateStudentProfileAndCustomLocalityApi = async (fullname: string, username: string, birthday: string,
    gender: string, custom_locality_name: string, custom_school_name: string, grade: string, phone: string,
    phone_e164?: string) => {
    try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const response = await axios.patch(`${backendUrl}/api/v1/users/student-profile-and-custom-locality/${userId}`, {
            fullname,
            username,
            birthday,
            gender,
            custom_locality_name,
            custom_school_name,
            grade,
            phone,
            phone_e164
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

export const updateStudentProfileCustomSchoolNameApi = async (
    fullname: string, username: string, birthday: string, gender: string, locality: string,
    custom_school_name: string, grade: string, phone: string, phone_e164?: string) => {
    try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const response = await axios.patch(`${backendUrl}/api/v1/users/student-profile-custom-school-name/${userId}`, {
            fullname,
            username,
            birthday,
            gender,
            locality,
            custom_school_name,
            grade,
            phone,
            phone_e164
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

export const sendSuperUserInviteApi = async (username: string, email: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.patch(`${backendUrl}/api/v1/users/send-superuser-invite`, { username, email }, {
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

export const removeSuperUserInviteApi = async (username: string, email: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.patch(`${backendUrl}/api/v1/users/remove-superuser-invite`, { username, email }, {
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