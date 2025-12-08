import axios from 'axios';

const API_BASE_URL = 'http://localhost:5066/api';


// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
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
                email,
                password,
                role,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Login failed';
        }
    },
    register: async (name, email, password, role) => {
        try {
            const response = await api.post('/auth/register', {
                name,
                email,
                password,
                role,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Registration failed';
        }
    },
};

export default api;
