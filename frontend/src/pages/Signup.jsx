import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Extracted to prevent focus loss, but keeping exact original layout styling
const InputField = ({ label, name, type = "text", required = false, value, onChange }) => (
    <div>
        <label className="block text-xs text-slate-400 mb-1">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className="
                w-full px-4 py-3 rounded-xl
                bg-white/5 border border-white/10
                text-white placeholder-slate-500
                focus:outline-none focus:ring-2 focus:ring-[#ff8a3d]
            "
            required={required}
        />
    </div>
);

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
        <div className="min-h-screen flex items-center justify-center bg-[#0b0f14] px-4">
             {/* BACKGROUND GLOW */}
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ff8a3d22,transparent_60%)]" />

            {/* CARD */}
            <div className="relative w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-white tracking-tight">OnTrack</h1>
                    <p className="text-slate-400 mt-1 text-sm">Create your OnTrack account</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm text-center">
                        {error}
                    </div>
                )}

                <form className="space-y-5">

                    {/* Step 1: User Details */}
                    {currentStep === 1 && (
                        <>
                            <InputField label="First Name" name="userFName" value={formData.userFName} onChange={handleChange} required />
                            <InputField label="Last Name" name="userLName" value={formData.userLName} onChange={handleChange} required />
                            <InputField label="Email" name="email" value={formData.email} onChange={handleChange} type="email" required />
                            <InputField label="Primary Phone" name="phonePrimary" value={formData.phonePrimary} onChange={handleChange} type="tel" required />
                            <InputField label="Secondary Phone" name="phoneSecondary" value={formData.phoneSecondary} onChange={handleChange} type="tel" />
                            <InputField label="Password" name="password" value={formData.password} onChange={handleChange} type="password" required />
                            <InputField label="Confirm Password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} type="password" required />

                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Role</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="
                                        w-full px-4 py-3 rounded-xl
                                        bg-white/5 border border-white/10
                                        text-white
                                        focus:outline-none focus:ring-2 focus:ring-[#ff8a3d]
                                    "
                                >
                                    <option value="customer" className="text-black">Customer</option>
                                    <option value="driver" className="text-black">Driver</option>
                                    <option value="seller" className="text-black">Seller</option>
                                    <option value="admin" className="text-black">Admin</option>
                                </select>
                            </div>

                            <button
                                onClick={nextStep}
                                type="button"
                                disabled={loading}
                                className={`
                                    w-full py-3 rounded-xl font-bold transition
                                    ${loading
                                        ? 'bg-white/10 text-slate-400 cursor-not-allowed'
                                        : 'bg-[#ff8a3d] text-black hover:bg-[#ff9f5d]'
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
                            <InputField label="Address Line 1" name="addressLine1" value={formData.addressLine1} onChange={handleChange} required />
                            <InputField label="Address Line 2 (Optional)" name="addressLine2" value={formData.addressLine2} onChange={handleChange} />

                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="City" name="city" value={formData.city} onChange={handleChange} required />
                                <InputField label="State" name="state" value={formData.state} onChange={handleChange} required />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Postal Code" name="postalCode" value={formData.postalCode} onChange={handleChange} required />
                                <InputField label="Country" name="country" value={formData.country} onChange={handleChange} required />
                            </div>

                            {/* Seller Specific Field */}
                            {formData.role === 'seller' && (
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Seller Type</label>
                                    <select
                                        name="sellerType"
                                        value={formData.sellerType}
                                        onChange={handleChange}
                                        className="
                                            w-full px-4 py-3 rounded-xl
                                            bg-white/5 border border-white/10
                                            text-white
                                            focus:outline-none focus:ring-2 focus:ring-[#ff8a3d]
                                        "
                                    >
                                        <option value="" className="text-black">Select Type</option>
                                        <option value="individual" className="text-black">Individual</option>
                                        <option value="company" className="text-black">Business</option>
                                    </select>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <button
                                    onClick={prevStep}
                                    type="button"
                                    className="w-1/3 py-3 rounded-xl text-slate-300 font-semibold border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleSubmit} // Explicitly call submit here for Step 2
                                    type="button"
                                    disabled={loading}
                                    className={`
                                        w-2/3 py-3 rounded-xl font-bold transition shadow-md
                                        ${loading
                                            ? 'bg-white/10 text-slate-400 cursor-not-allowed'
                                            : 'bg-[#ff8a3d] text-black hover:bg-[#ff9f5d]'
                                        }`}
                                >
                                    {loading ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </div>
                        </>
                    )}
                </form>

                <div className="mt-6 text-center text-sm text-slate-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-[#ff8a3d] font-semibold hover:underline">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;