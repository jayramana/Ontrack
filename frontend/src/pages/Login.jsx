import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'customer',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(formData.email, formData.password, formData.role);

        if (result.success) {
            if (formData.role === "Customer".toLowerCase()) {
                navigate("/customer/dashboard");
            } else if (formData.role === "Driver".toLowerCase()) {
                navigate("/driver/dashboard");
            } else if (formData.role === "Admin".toLowerCase()) {
                navigate("/admin/dashboard");
            } else if (formData.role === "Seller".toLowerCase()) {
                navigate("/seller/dashboard");
            }
            return;
        }

        if (!result.success) {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#351c15] to-[#4e2a1f] p-4">
            <div className="bg-[#f8f4ef] rounded-2xl shadow-xl w-full max-w-md p-8 border border-[#e6d8c9]">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[#351c15] mb-2 tracking-wide">OnTrack</h1>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-[#4b382e] mb-1">Email Address</label>
                        <input
                            type="email"
                            value={formData.email}
                            name="email"
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-[#d4c7b9] rounded-lg focus:ring-2 focus:ring-[#ffb500] focus:border-transparent outline-none transition-all bg-white"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#4b382e] mb-1">Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            name="password"
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-[#d4c7b9] rounded-lg focus:ring-2 focus:ring-[#ffb500] focus:border-transparent outline-none transition-all bg-white"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#4b382e] mb-1">I am a...</label>
                        <select
                            value={formData.role}
                            name="role"
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-[#d4c7b9] rounded-lg focus:ring-2 focus:ring-[#ffb500] focus:border-transparent outline-none transition-all bg-white"
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
                        className={`w-full py-3 rounded-lg text-[#351c15] font-semibold shadow-md transition-all 
                            ${loading
                                ? 'bg-[#d6b36d] cursor-not-allowed'
                                : 'bg-[#ffb500] hover:bg-[#e6a300] transform hover:-translate-y-0.5'
                            }`}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                {formData.role !== 'admin' && (
                    <div className="mt-6 text-center text-sm text-[#6b4f3a]">
                        Don’t have an account?{' '}
                        <Link to="/signup" className="text-[#ffb500] hover:text-[#e6a300] font-medium">
                            Sign up
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
