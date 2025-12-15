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
        role: 'customer',
        // Address Fields
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        sellerType: ''
    });

    const [currentStep, setCurrentStep] = useState(1);
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

    const nextStep = (e) => {
        e.preventDefault();
        setError('');

        // Step 1 Validation
        if (!formData.userFName || !formData.userLName || !formData.email || !formData.password) {
            setError('Please fill in all required fields');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!formData.phonePrimary || formData.phonePrimary.trim().length < 7) {
            setError('Please enter a valid primary phone number');
            return;
        }

        const role = formData.role.toLowerCase();
        
        // If Driver or Admin, submit immediately (no address step)
        if (role === 'driver' || role === 'admin') {
            handleSubmit(e);
        } else {
            // If Customer or Seller, go to Address step
            setCurrentStep(2);
        }
    };

    const prevStep = () => {
        setError('');
        setCurrentStep(1);
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Include all fields in payload
            const payload = {
                userFName: formData.userFName,
                userLName: formData.userLName,
                phonePrimary: formData.phonePrimary,
                phoneSecondary: formData.phoneSecondary,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                addressLine1: formData.addressLine1,
                addressLine2: formData.addressLine2,
                city: formData.city,
                state: formData.state,
                postalCode: formData.postalCode,
                country: formData.country,
                sellerType: formData.sellerType
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

                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-[#351c15] mb-2 tracking-wide">OnTrack</h1>
                    <p className="text-[#6b4f3a]">Create your OnTrack account</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center border border-red-200">
                        {error}
                    </div>
                )}

                <form className="space-y-4">

                    {/* Step 1: User Details */}
                    {currentStep === 1 && (
                        <>
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
                                onClick={nextStep}
                                type="button"
                                disabled={loading}
                                className={`w-full py-3 rounded-lg text-[#351c15] font-semibold shadow-md 
                                    ${loading
                                        ? 'bg-[#d6b36d] cursor-not-allowed'
                                        : 'bg-[#ffb500] hover:bg-[#e6a300] transform hover:-translate-y-0.5'
                                    }`}
                            >
                                {loading 
                                    ? 'Creating Account...' 
                                    : (formData.role === 'driver' || formData.role === 'admin') 
                                        ? 'Create Account' 
                                        : 'Next'}
                            </button>
                        </>
                    )}

                    {/* Step 2: Address Details */}
                    {currentStep === 2 && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-[#4b382e] mb-1">Address Line 1</label>
                                <input
                                    type="text"
                                    name="addressLine1"
                                    value={formData.addressLine1}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-[#d4c7b9] rounded-lg bg-white
                                               focus:ring-2 focus:ring-[#ffb500] outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#4b382e] mb-1">Address Line 2 (Optional)</label>
                                <input
                                    type="text"
                                    name="addressLine2"
                                    value={formData.addressLine2}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-[#d4c7b9] rounded-lg bg-white
                                               focus:ring-2 focus:ring-[#ffb500] outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#4b382e] mb-1">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-[#d4c7b9] rounded-lg bg-white
                                                   focus:ring-2 focus:ring-[#ffb500] outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#4b382e] mb-1">State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-[#d4c7b9] rounded-lg bg-white
                                                   focus:ring-2 focus:ring-[#ffb500] outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#4b382e] mb-1">Postal Code</label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        value={formData.postalCode}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-[#d4c7b9] rounded-lg bg-white
                                                   focus:ring-2 focus:ring-[#ffb500] outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#4b382e] mb-1">Country</label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-[#d4c7b9] rounded-lg bg-white
                                                   focus:ring-2 focus:ring-[#ffb500] outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Seller Specific Field */}
                            {formData.role === 'seller' && (
                                <div>
                                    <label className="block text-sm font-medium text-[#4b382e] mb-1">Seller Type</label>
                                    <select
                                        name="sellerType"
                                        value={formData.sellerType}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-[#d4c7b9] rounded-lg bg-white
                                                   focus:ring-2 focus:ring-[#ffb500] outline-none"
                                    >
                                        <option value="">Select Type</option>
                                        <option value="individual">Individual</option>
                                        <option value="company">Business</option>
                                    </select>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <button
                                    onClick={prevStep}
                                    type="button"
                                    className="w-1/3 py-3 rounded-lg text-[#351c15] font-semibold border border-[#d4c7b9] bg-white hover:bg-gray-50"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleSubmit} // Explicitly call submit here for Step 2
                                    type="button"
                                    disabled={loading}
                                    className={`w-2/3 py-3 rounded-lg text-[#351c15] font-semibold shadow-md 
                                        ${loading
                                            ? 'bg-[#d6b36d] cursor-not-allowed'
                                            : 'bg-[#ffb500] hover:bg-[#e6a300] transform hover:-translate-y-0.5'
                                        }`}
                                >
                                    {loading ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </div>
                        </>
                    )}
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
