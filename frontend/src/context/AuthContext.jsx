import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            setUser(JSON.parse(userData));
        }
        setLoading(false);
    }, []);

    const handleAuthSuccess = (response) => {
        // Store token and user data
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify({
            userId: response.user_id,
            first_name: response.first_name,
            last_name: response.last_name,
            email: response.email, // backend response uses email (lowercase)
            role: response.role,
        }));

        setUser({
            userId: response.user_id,
            first_name: response.first_name,
            last_name: response.last_name,
            role: response.role,
        });

        // Redirect based on role
        const roleRoutes = {
            customer: '/customer/dashboard',
            driver: '/driver/dashboard',
            admin: '/admin/dashboard',
            seller: '/seller/dashboard',
        };

        navigate(roleRoutes[response.role] || '/');
    };

    const login = async (email, password, role) => {
        try {
            const response = await authAPI.login(email, password, role);
            handleAuthSuccess(response);
            return { success: true, message: response.message };
        } catch (error) {
            return { success: false, message: error };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');
    };

    const isAuthenticated = () => {
        return !!user;
    };

    const hasRole = (role) => {
        console.log(`AuthContext check: UserRole=${user?.role}, Required=${role}`);
        if (!user || !user.role) return false;
        return user.role.toLowerCase() === role.toLowerCase();
    };

    const value = {
        user,
        login,
        logout,
        isAuthenticated,
        hasRole,
        loading,
        handleAuthSuccess,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};