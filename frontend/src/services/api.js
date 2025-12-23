import axios from 'axios';

export const API_BASE_URL = `https://ontrack-t99t.onrender.com/api`;


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
            UserFName: payload.userFName,
            UserLName: payload.userLName,
            PhonePrimary: payload.phonePrimary,
            PhoneSecondary: payload.phoneSecondary,
            Email: payload.email,
            Password: payload.password,
            Role: payload.role,
            // Address Fields
            AddressLine1: payload.addressLine1,
            AddressLine2: payload.addressLine2,
            City: payload.city,
            State: payload.state,
            PostalCode: payload.postalCode,
            Country: payload.country,
            SellerType: payload.sellerType
        });

        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Registration failed';
    }
}
};

export default api;
