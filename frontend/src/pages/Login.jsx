// import { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { useNavigate } from "react-router-dom";

// const Login = () => {
//     const navigate = useNavigate();

//     const [formData, setFormData] = useState({
//         email: '',
//         password: '',
//         role: 'customer',
//     });
//     const [error, setError] = useState('');
//     const [loading, setLoading] = useState(false);
//     const { login } = useAuth();

//     const handleChange = (e) => {
//         setFormData({
//             ...formData,
//             [e.target.name]: e.target.value,
//         });
//         setError('');
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError('');
//         setLoading(true);

//         // const result = await login(formData.email, formData.password, formData.role);

//         // if (result.success) {
//         //     if (formData.role === "Customer".toLowerCase()) {
//         //         navigate("/customer/dashboard");
//         //     } else if (formData.role === "Driver".toLowerCase()) {
//         //         navigate("/driver/dashboard");
//         //     } else if (formData.role === "Admin".toLowerCase()) {
//         //         navigate("/admin/dashboard");
//         //     } else if (formData.role === "Seller".toLowerCase()) {
//         //         navigate("/seller/dashboard");
//         //     }
//         //     return;
//         // }

//         const result = await login(formData.email, formData.password, formData.role);




//         if (!result.success) {
//             setError(result.message);
//         }
//         setLoading(false);
//     };

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#351c15] to-[#4e2a1f] p-4">
//             <div className="bg-[#f8f4ef] rounded-2xl shadow-xl w-full max-w-md p-8 border border-[#e6d8c9]">
//                 <div className="text-center mb-8">
//                     <h1 className="text-3xl font-bold text-[#351c15] mb-2 tracking-wide">OnTrack</h1>
//                 </div>

//                 {error && (
//                     <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center border border-red-200">
//                         {error}
//                     </div>
//                 )}

//                 <form onSubmit={handleSubmit} className="space-y-6">
//                     <div>
//                         <label className="block text-sm font-medium text-[#4b382e] mb-1">Email Address</label>
//                         <input
//                             type="email"
//                             value={formData.email}
//                             name="email"
//                             onChange={handleChange}
//                             className="w-full px-4 py-2 border border-[#d4c7b9] rounded-lg focus:ring-2 focus:ring-[#ffb500] focus:border-transparent outline-none transition-all bg-white"
//                             placeholder="you@example.com"
//                             required
//                         />
//                     </div>

//                     <div>
//                         <label className="block text-sm font-medium text-[#4b382e] mb-1">Password</label>
//                         <input
//                             type="password"
//                             value={formData.password}
//                             name="password"
//                             onChange={handleChange}
//                             className="w-full px-4 py-2 border border-[#d4c7b9] rounded-lg focus:ring-2 focus:ring-[#ffb500] focus:border-transparent outline-none transition-all bg-white"
//                             placeholder="••••••••"
//                             required
//                         />
//                     </div>

//                     <div>
//                         <label className="block text-sm font-medium text-[#4b382e] mb-1">I am a...</label>
//                         <select
//                             value={formData.role}
//                             name="role"
//                             onChange={handleChange}
//                             className="w-full px-4 py-2 border border-[#d4c7b9] rounded-lg focus:ring-2 focus:ring-[#ffb500] focus:border-transparent outline-none transition-all bg-white"
//                         >
//                             <option value="customer">Customer</option>
//                             <option value="driver">Driver</option>
//                             <option value="seller">Seller</option>
//                             <option value="admin">Admin</option>
//                         </select>
//                     </div>

//                     <button
//                         type="submit"
//                         disabled={loading}
//                         className={`w-full py-3 rounded-lg text-[#351c15] font-semibold shadow-md transition-all
//                             ${loading
//                                 ? 'bg-[#d6b36d] cursor-not-allowed'
//                                 : 'bg-[#ffb500] hover:bg-[#e6a300] transform hover:-translate-y-0.5'
//                             }`}
//                     >
//                         {loading ? 'Signing In...' : 'Sign In'}
//                     </button>
//                 </form>

//                 {formData.role !== 'admin' && (
//                     <div className="mt-6 text-center text-sm text-[#6b4f3a]">
//                         Don’t have an account?{' '}
//                         <Link to="/signup" className="text-[#ffb500] hover:text-[#e6a300] font-medium">
//                             Sign up
//                         </Link>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Login;

import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "customer",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(
      formData.email,
      formData.password,
      formData.role
    );

    if (!result.success) {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f14] px-4">
      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ff8a3d22,transparent_60%)]" />

      {/* CARD */}
      <div className="relative w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8">
        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight">
            OnTrack
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Sign in to continue
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* EMAIL */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-slate-400 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="
                w-full px-4 py-3 rounded-xl
                bg-white/5 border border-white/10
                text-white placeholder-slate-500
                focus:outline-none focus:ring-2 focus:ring-[#ff8a3d]
              "
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-slate-400 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="
                w-full px-4 py-3 rounded-xl
                bg-white/5 border border-white/10
                text-white placeholder-slate-500
                focus:outline-none focus:ring-2 focus:ring-[#ff8a3d]
              "
            />
          </div>

          {/* ROLE */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-slate-400 mb-1">
              Login as
            </label>
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

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className={`
              w-full py-3 rounded-xl font-bold transition
              ${
                loading
                  ? "bg-white/10 text-slate-400 cursor-not-allowed"
                  : "bg-[#ff8a3d] text-black hover:bg-[#ff9f5d]"
              }
            `}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {/* SIGN UP */}
        {formData.role !== "admin" && (
          <p className="mt-6 text-center text-sm text-slate-400">
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className="text-[#ff8a3d] font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
