import axios from "axios";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const getAllCountriesApi = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${backendUrl}/api/v1/countries/all-countries`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response.data.message);
    }
}