import React, { useState } from "react";
import { useParams } from "react-router-dom";

export default function SignupPage() {
  const { role } = useParams(); // role = customer | agent | admin

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    employeeId: "",
    adminCode: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = (e) => {
    e.preventDefault();

    // TODO: backend signup API
    // await signupUser({ ...formData, role })

    console.log("Signing up:", role, formData);
  };

  const RoleTitle = {
    customer: "Customer Signup",
    agent: "Delivery Agent Signup",
    admin: "Admin Signup",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center">{RoleTitle[role]}</h2>
        <p className="text-center text-gray-500 mb-6">Create a new account</p>

        <form onSubmit={handleSignup} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block mb-1 text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              placeholder="name@company.com"
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-xl"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block mb-1 text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              placeholder="Your username"
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-xl"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-xl"
            />
          </div>

          {/* Delivery Agent ONLY */}
          {role === "agent" && (
            <div>
              <label className="block mb-1 text-gray-700">Employee ID</label>
              <input
                type="text"
                name="employeeId"
                placeholder="Enter employee ID"
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-xl"
              />
            </div>
          )}

          {/* Admin ONLY */}
          {role === "admin" && (
            <div>
              <label className="block mb-1 text-gray-700">Admin Passcode</label>
              <input
                type="password"
                name="adminCode"
                placeholder="Enter admin passcode"
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-xl"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-xl"
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}
