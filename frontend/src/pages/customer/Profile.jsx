import React, { useState } from "react";
import CustomerSidebar from "./CustomerSidebar";

export default function Profile() {
  const [formData, setFormData] = useState({
    fullName: "Lisa", // demo values
    email: "customer@example.com",
    phone: "+91 9876543210",
    address: "123 Main Street, Chennai, Tamil Nadu",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  // TODO: Send updated profile data to backend
  const handleSave = () => {
    console.log("Updated Profile:", formData);
  };

  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* SIDEBAR */}
      <CustomerSidebar active="profile" />

      {/* RIGHT CONTENT */}
      <div className="flex-1 p-10">

        {/* HEADER */}
        <h1 className="text-3xl font-bold mb-2">Profile </h1>
        <p className="text-gray-500 mb-6">Manage your personal information</p>

        {/* PROFILE CARD */}
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-3xl">

          {/* Profile Picture */}
          <div className="flex items-center space-x-6 mb-8">
            <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-600 shadow">
              👤
            </div>
            <div>
              <h2 className="text-xl font-semibold">{formData.fullName}</h2>
              <p className="text-gray-500">Customer Account</p>
            </div>
          </div>

          {/* FORM GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Full Name */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-teal-500"
              ></textarea>
            </div>

          </div>

         

          {/* SAVE BUTTON */}
          <div className="mt-8">
            <button
              onClick={handleSave}
              className="bg-teal-500 hover:bg-teal-600 text-white py-3 px-6 rounded-xl text-lg shadow-md"
            >
              Save Changes
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
