import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  const [role, setRole] = useState("customer");

const handleLogin = (e) => {
  e.preventDefault();

  // TODO: Replace with backend login API
  // Example:
  // const res = await loginUser({ email, password, role })

  if (role === "customer") {
    navigate("/customer/customerdashboard");
  } else if (role === "agent") {
    navigate("/agent/agentdashboard");
  } else if (role === "admin") {
    navigate("/admin/admindashboard");
  }
};


  const buttonText = {
    customer: "Sign in as Customer",
    agent: "Sign in as Delivery Agent",
    admin: "Sign in as Admin",
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* LEFT SIDE SECTION */}
      <div className="hidden lg:flex flex-col justify-center px-16 w-1/2 bg-gradient-to-br from-[#0b2344] to-[#08182e] text-white">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-teal-400 p-2 rounded-lg"></div>
          <h1 className="text-2xl font-bold">DeliverAI</h1>
        </div>

        <button className="bg-teal-500 text-sm px-4 py-1 rounded-full w-max mb-6">
          Smart Delivery Assurance
        </button>

        <h1 className="text-4xl font-bold leading-tight mb-6">
          AI-Powered Delivery Excellence
        </h1>

        <ul className="space-y-4 text-lg text-gray-300">
          <li>🚀 Real-time ETA with AI optimization</li>
          <li>📍 Smart geofence alerts</li>
          <li>🛡️ Secure Adult Signature verification</li>
          <li>🤖 24/7 AI customer support</li>
        </ul>

        <p className="mt-10 text-gray-400 text-sm">
          © 2024 DeliverAI. Enterprise-grade delivery assurance.
        </p>
      </div>

      {/* RIGHT SIDE LOGIN FORM */}
      <div className="flex justify-center items-center flex-1 p-8">
        <div className="bg-white p-10 rounded-2xl shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-2 text-center">Welcome back</h2>
          <p className="text-center text-gray-500 mb-6">
            Select your role and sign in to continue
          </p>

          {/* ROLE SELECTION */}
          <div className="flex justify-between mb-6">
            {/* Customer */}
            <button
              onClick={() => setRole("customer")}
              className={`w-1/3 p-3 border rounded-xl flex flex-col items-center 
                ${
                  role === "customer"
                    ? "border-teal-500 bg-teal-50"
                    : "border-gray-300"
                }`}
            >
              <span className="text-teal-600 text-2xl">📦</span>
              <span className="text-sm mt-1">Customer</span>
            </button>

            {/* Delivery Agent */}
            <button
              onClick={() => setRole("agent")}
              className={`w-1/3 p-3 border rounded-xl flex flex-col items-center 
                ${
                  role === "agent"
                    ? "border-teal-500 bg-teal-50"
                    : "border-gray-300"
                }`}
            >
              <span className="text-teal-600 text-2xl">🚚</span>
              <span className="text-sm mt-1">Delivery Agent</span>
            </button>

            {/* Admin */}
            <button
              onClick={() => setRole("admin")}
              className={`w-1/3 p-3 border rounded-xl flex flex-col items-center 
                ${
                  role === "admin"
                    ? "border-teal-500 bg-teal-50"
                    : "border-gray-300"
                }`}
            >
              <span className="text-teal-600 text-2xl">🛡️</span>
              <span className="text-sm mt-1">Admin</span>
            </button>
          </div>

          {/* LOGIN FORM */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="name@company.com"
                className="w-full p-3 rounded-xl border border-gray-300"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Password</label>
              <input
                type="password"
                className="w-full p-3 rounded-xl border border-gray-300"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-xl mt-4"
            >
              {buttonText[role]}
            </button>

            <p className="text-center mt-4 text-gray-600">
                New user?
                <span
                  onClick={() => navigate("/choose-role")}
                  className="text-teal-600 cursor-pointer ml-1"
                >
                  Sign up
                </span>
            </p>

          </form>

          <p className="text-center text-gray-500 mt-4 text-sm">
            Demo mode: Click sign in to explore
          </p>
        </div>
      </div>
    </div>
  );
}
