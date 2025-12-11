import React, { useState } from "react";
import CustomerSidebar from "./CustomerSidebar";

export default function Profile() {
  const [formData, setFormData] = useState({
    fullName: "Lisa",
    email: "customer@example.com",
    phone: "+91 9876543210",
    address: "123 Main Street, Chennai, Tamil Nadu",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    console.log("Updated Profile:", formData);
  };

  return (
    <div className="min-h-screen flex bg-[#f7f3ef]">

      {/* SIDEBAR */}
      <CustomerSidebar active="profile" />

      {/* RIGHT CONTENT */}
      <div className="flex-1 p-10">

        {/* HEADER */}
        <h1 className="text-3xl font-bold text-[#351c15] mb-2">My Profile</h1>
        <p className="text-[#6f4e37] mb-6">Manage your personal information</p>

        {/* PROFILE CARD */}
        <div className="bg-[#fff8e7] p-8 rounded-2xl shadow border border-[#e6ddc5] max-w-3xl">

          {/* Profile Picture */}
          <div className="flex items-center space-x-6 mb-10">
            <div className="h-20 w-20 rounded-full bg-[#f9b400]/20 border border-[#f9b400] flex items-center justify-center text-3xl text-[#351c15] shadow">
              👤
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#351c15]">{formData.fullName}</h2>
              <p className="text-[#6f4e37]">Customer Account</p>
            </div>
          </div>

          {/* FORM GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Full Name */}
            <div>
              <label className="block text-[#351c15] font-medium mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full p-3 bg-white border border-[#d7cbb8] rounded-xl 
                           focus:ring-2 focus:ring-[#f9b400] text-[#351c15]"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[#351c15] font-medium mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 bg-white border border-[#d7cbb8] rounded-xl 
                           focus:ring-2 focus:ring-[#f9b400] text-[#351c15]"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[#351c15] font-medium mb-1">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-3 bg-white border border-[#d7cbb8] rounded-xl 
                           focus:ring-2 focus:ring-[#f9b400] text-[#351c15]"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-[#351c15] font-medium mb-1">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className="w-full p-3 bg-white border border-[#d7cbb8] rounded-xl 
                           focus:ring-2 focus:ring-[#f9b400] text-[#351c15]"
              ></textarea>
            </div>

          </div>

          {/* SAVE BUTTON */}
          <div className="mt-10">
            <button
              onClick={handleSave}
              className="bg-[#351c15] hover:bg-[#4a2a21] text-white py-3 px-8 rounded-xl 
                         text-lg shadow font-semibold transition"
            >
              Save Changes
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
