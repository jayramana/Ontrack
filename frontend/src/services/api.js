import axios from 'axios';

const API_BASE_URL = 'http://localhost:5066/api';


// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth API functions
export const authAPI = {
    login: async (email, password, role) => {
        try {
            console.log('Login Payload:', { email, password, role });
            const response = await api.post('/auth/login', {
                Email : email,
                Password : password,
                Role : role,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Login failed';
        }
    },
register: async (payload) => {
    try {
        const response = await api.post('/auth/register', {
            UserFName: payload.firstName,
            UserLName: payload.lastName,
            PhonePrimary: payload.phone_primary,
            PhoneSecondary: payload.phone_secondary,
            Email: payload.email,
            Password: payload.password,
            Role: payload.role
        });

        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Registration failed';
    }
}


,
};

export default api;
