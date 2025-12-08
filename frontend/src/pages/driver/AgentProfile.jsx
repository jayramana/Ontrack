import React, { useState } from "react";
import DriverSidebar from "./DriverSidebar"; 

export default function AgentProfile() {
  const [formData, setFormData] = useState({
    fullName: "John Driver",
    email: "driver@example.com",
    phone: "+91 9876543210",
    employeeId: "EMP1247",
    vehicleType: "Van",
    vehicleNumber: "TN-07 AB 5678",
    hub: "Chennai Central Hub",
    availability: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSave = () => {
    console.log("Updated Agent Profile:", formData);
    // TODO: Send this data to backend
  };

  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* SIDEBAR */}
      <DriverSidebar active="profile" />

      {/* CONTENT */}
      <div className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
        <p className="text-gray-500 mb-6">
          Manage your delivery information and preferences
        </p>

        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-3xl">

          {/* PROFILE HEADER */}
          <div className="flex items-center space-x-6 mb-8">
            <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-600 shadow">
              🚚
            </div>
            <div>
              <h2 className="text-xl font-semibold">{formData.fullName}</h2>
              <p className="text-gray-500">Delivery Agent</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* FULL NAME */}
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

            {/* EMAIL */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* PHONE */}
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

            {/* EMPLOYEE ID */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Employee ID</label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl bg-gray-100 cursor-not-allowed"
                disabled
              />
            </div>

            {/* VEHICLE TYPE */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Vehicle Type</label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-teal-500"
              >
                <option>Bike</option>
                <option>Scooter</option>
                <option>Van</option>
                <option>Car</option>
                <option>Truck</option>
              </select>
            </div>

            {/* VEHICLE NUMBER */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Vehicle Number</label>
              <input
                type="text"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* HUB */}
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium mb-1">Home Branch / Hub</label>
              <input
                type="text"
                name="hub"
                value={formData.hub}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-teal-500"
              />
            </div>

          </div>

          {/* AVAILABILITY TOGGLE */}
          <div className="mt-8 flex items-center space-x-3">
            <input
              type="checkbox"
              name="availability"
              checked={formData.availability}
              onChange={handleChange}
              className="h-5 w-5"
            />
            <label className="text-gray-700 font-medium">
              Available for Deliveries
            </label>
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
