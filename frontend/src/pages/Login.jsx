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

        // On successful login, redirect to the appropriate dashboard
        if (result.success) {
        if (formData.role === "Customer".toLowerCase()) {
            navigate("/customer/dashboard");
        } else if (formData.role === "Driver".toLowerCase()) {
            navigate("/driver/dashboard");
        } else if (formData.role === "Admin".toLowerCase()) {
            navigate("/admin/dashboard");
        }
        else if(formData.role === "Seller".toLowerCase()){
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">ArriveNow</h1>
                    <p className="text-gray-500">Welcome back! Please sign in.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            value={formData.email}
                            name="email"
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            name="password"
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">I am a...</label>
                        <select
                            value={formData.role}
                            name="role"
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        >
<<<<<<< HEAD
                            <option value="customer">Customer</option>
                            <option value="driver">Driver</option>
                            <option value="seller">Seller</option>
                            <option value="admin">Admin</option>
=======
                            <option value="Customer">Customer</option>
                            <option value="Driver">Driver</option>
                            <option value="Sender">Sender</option>
                            <option value="Admin">Admin</option>
>>>>>>> origin/route
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-lg text-white font-semibold shadow-md transition-all ${loading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:-translate-y-0.5'
                            }`}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                {formData.role !== 'Admin' && (
                    <div className="mt-6 text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-blue-600 hover:text-blue-800 font-medium">
                            Sign up
                        </Link>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-gray-100">
                    <p className="text-xs text-center text-gray-400 mb-4">Demo Credentials</p>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className="bg-gray-50 p-2 rounded text-center cursor-pointer hover:bg-gray-100"
                            onClick={() => setFormData({ email: 'customer@test.com', password: 'password123', role: 'customer' })}>
                            <div className="font-semibold text-gray-700">Customer</div>
                            <div className="text-gray-500">customer@test.com</div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded text-center cursor-pointer hover:bg-gray-100"
<<<<<<< HEAD
                            onClick={() => setFormData({ email: 'driver@test.com', password: 'password123', role: 'driver' })}>
=======
                            onClick={() => setFormData({ email: 'sender@demo.com', password: 'password123', role: 'Sender' })}>
                            <div className="font-semibold text-gray-700">Sender</div>
                            <div className="text-gray-500">sender@demo.com</div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded text-center cursor-pointer hover:bg-gray-100"
                            onClick={() => setFormData({ email: 'driver@test.com', password: 'password123', role: 'Driver' })}>
>>>>>>> origin/route
                            <div className="font-semibold text-gray-700">Driver</div>
                            <div className="text-gray-500">driver@test.com</div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded text-center cursor-pointer hover:bg-gray-100"
                            onClick={() => setFormData({ email: 'admin@arrivenow.com', password: 'Admin@123', role: 'admin' })}>
                            <div className="font-semibold text-gray-700">Seller</div>
                            <div className="text-gray-500">seller@arrivenow.com</div>
                        </div>

                        <div className="bg-gray-50 p-2 rounded text-center cursor-pointer hover:bg-gray-100"
                            onClick={() => setFormData({ email: 'admin@arrivenow.com', password: 'Admin@123', role: 'admin' })}>
                            <div className="font-semibold text-gray-700">Admin</div>
                            <div className="text-gray-500">admin@arrivenow.com</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
