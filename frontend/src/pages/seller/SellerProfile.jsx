import React, { useState } from "react";
import SellerSidebar from "./SellerSidebar";

export default function SellerProfile() {
  const [formData, setFormData] = useState({
    businessType: "Individual",
    sellerName: "Aadhil Enterprises", 
    email: "seller@example.com",
    phone: "+91 9876543210",
    gstNumber: "",
    pickupAddress: "21, Mount Road, Chennai, TN",
    returnAddress: "21, Mount Road, Chennai, TN",
    altContact: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    console.log("Seller Profile Updated:", formData);
    // TODO: Send updated seller info to backend
  };

  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* SIDEBAR */}
      <SellerSidebar active="profile" />

      {/* MAIN CONTENT */}
      <div className="flex-1 p-10">

        {/* HEADER */}
        <h1 className="text-3xl font-bold mb-2">Seller Profile</h1>
        <p className="text-gray-500 mb-6">Manage your business information</p>

        <div className="bg-white p-8 rounded-2xl shadow max-w-4xl">

          {/* HEADER WITH ICON */}
          <div className="flex items-center gap-6 mb-8">
            <div className="h-20 w-20 bg-gray-200 rounded-full flex items-center justify-center text-3xl text-gray-600 shadow">
              🏷️
            </div>
            <div>
              <h2 className="text-xl font-semibold">{formData.sellerName}</h2>
              <p className="text-gray-500">{formData.businessType} Seller</p>
            </div>
          </div>

          {/* BUSINESS TYPE */}
          <div className="mb-6">
            <label className="font-medium text-gray-700 block mb-1">
              Business Type
            </label>
            <select
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-teal-500"
            >
              <option value="Individual">Individual</option>
              <option value="Company">Company</option>
            </select>
          </div>

          {/* PROFILE FIELDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

            {/* Seller / Business Name */}
            <div>
              <label className="font-medium text-gray-700 block mb-1">
                {formData.businessType === "Company" ? "Company Name" : "Full Name"}
              </label>
              <input
                type="text"
                name="sellerName"
                value={formData.sellerName}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="font-medium text-gray-700 block mb-1">Email</label>
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
              <label className="font-medium text-gray-700 block mb-1">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* GST NUMBER – Required Only for Business */}
            {formData.businessType === "Company" && (
              <div>
                <label className="font-medium text-gray-700 block mb-1">
                  GST Number
                </label>
                <input
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  placeholder="Enter valid GSTIN"
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>
            )}
          </div>

          {/* ADDRESSES */}
          <div className="mb-6">
            <label className="font-medium text-gray-700 block mb-1">Pickup Address</label>
            <textarea
              name="pickupAddress"
              value={formData.pickupAddress}
              onChange={handleChange}
              rows="3"
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-teal-500"
            ></textarea>
          </div>

          <div className="mb-6">
            <label className="font-medium text-gray-700 block mb-1">Return Address</label>
            <textarea
              name="returnAddress"
              value={formData.returnAddress}
              onChange={handleChange}
              rows="3"
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-teal-500"
            ></textarea>
          </div>

          {/* ALTERNATE CONTACT */}
          <div className="mb-8">
            <label className="font-medium text-gray-700 block mb-1">
              Alternate Contact (Optional)
            </label>
            <input
              type="text"
              name="altContact"
              value={formData.altContact}
              onChange={handleChange}
              placeholder="+91 XXXXX XXXXX"
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* SAVE BUTTON */}
          <div>
            <button
              onClick={handleSave}
              className="bg-teal-500 hover:bg-teal-600 text-white py-3 px-6 rounded-xl text-lg shadow"
            >
              Save Profile
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
