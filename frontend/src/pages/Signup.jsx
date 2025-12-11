import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
    const [formData, setFormData] = useState({
        userFName: '',
        userLName: '',
        email: '',
        phonePrimary: '',
        phoneSecondary: '',
        password: '',
        confirmPassword: '',
        role: 'customer'
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!formData.phonePrimary || formData.phonePrimary.trim().length < 7) {
            setError('Please enter a valid primary phone number');
            return;
        }

        if (formData.role === 'Admin') {
            setError('Admin registration is not allowed');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                userFName: formData.userFName,
                userLName: formData.userLName,
                phonePrimary: formData.phonePrimary,
                phoneSecondary: formData.phoneSecondary,
                email: formData.email,
                password: formData.password,
                role: formData.role
            };

            const response = await authAPI.register(payload);

            if (response?.message === 'Registration successful') {
                login(response);

                if (response.role.toLowerCase() === 'customer') {
                    navigate('/customer/dashboard');
                } else if (response.role.toLowerCase() === 'driver') {
                    navigate('/driver/dashboard');
                } else if (response.role.toLowerCase() === 'seller') {
                    navigate('/seller/dashboard');
                } else if (response.role.toLowerCase() === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/login');
                }

            } else {
                setError(response?.message || 'Unexpected server response');
            }

        } catch (err) {
            setError(err || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center 
                        bg-gradient-to-br from-[#351c15] to-[#4e2a1f] p-4">
            <div className="bg-[#f8f4ef] rounded-2xl shadow-xl w-full max-w-md p-8 border border-[#e6d8c9]">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[#351c15] mb-2 tracking-wide">OnTrack</h1>
                    <p className="text-[#6b4f3a]">Create your OnTrack account</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div>
                        <label className="block text-sm font-medium text-[#4b382e] mb-1">First Name</label>
                        <input
                            type="text"
                            name="userFName"
                            value={formData.userFName}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-[#d4c7b9] rounded-lg bg-white
                                       focus:ring-2 focus:ring-[#ffb500] outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#4b382e] mb-1">Last Name</label>
                        <input
                            type="text"
                            name="userLName"
                            value={formData.userLName}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-[#d4c7b9] rounded-lg bg-white
                                       focus:ring-2 focus:ring-[#ffb500] outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#4b382e] mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-[#d4c7b9] rounded-lg bg-white
                                       focus:ring-2 focus:ring-[#ffb500] outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#4b382e] mb-1">Primary Phone</label>
                        <input
                            type="tel"
                            name="phonePrimary"
                            value={formData.phonePrimary}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-[#d4c7b9] rounded-lg bg-white
                                       focus:ring-2 focus:ring-[#ffb500] outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#4b382e] mb-1">Secondary Phone</label>
                        <input
                            type="tel"
                            name="phoneSecondary"
                            value={formData.phoneSecondary}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-[#d4c7b9] rounded-lg bg-white
                                       focus:ring-2 focus:ring-[#ffb500] outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#4b382e] mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-[#d4c7b9] rounded-lg bg-white
                                       focus:ring-2 focus:ring-[#ffb500] outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#4b382e] mb-1">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-[#d4c7b9] rounded-lg bg-white
                                       focus:ring-2 focus:ring-[#ffb500] outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#4b382e] mb-1">Role</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-[#d4c7b9] rounded-lg bg-white
                                       focus:ring-2 focus:ring-[#ffb500] outline-none"
                        >
                            <option value="customer">Customer</option>
                            <option value="driver">Driver</option>
                            <option value="seller">Seller</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-lg text-[#351c15] font-semibold shadow-md 
                            ${loading
                                ? 'bg-[#d6b36d] cursor-not-allowed'
                                : 'bg-[#ffb500] hover:bg-[#e6a300] transform hover:-translate-y-0.5'
                            }`}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-[#6b4f3a]">
                    Already have an account?{' '}
                    <Link to="/login" className="text-[#ffb500] hover:text-[#e6a300] font-medium">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
