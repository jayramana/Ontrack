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
    <div className="min-h-screen flex bg-[#f8f4ef]">

      {/* SIDEBAR */}
      <SellerSidebar active="profile" />

      {/* MAIN CONTENT */}
      <div className="flex-1 px-10 py-8">

        {/* HEADER */}
        <h1 className="text-3xl font-bold text-[#351c15]">Seller Profile</h1>
        <p className="text-[#6b4f3a] mb-8">Manage your business information</p>

        <div className="bg-white p-8 rounded-2xl shadow border border-[#e6d8c9] max-w-4xl">

          {/* HEADER BLOCK */}
          <div className="flex items-center gap-6 mb-10">
            <div className="h-20 w-20 bg-[#f0e6d8] rounded-full flex items-center justify-center text-3xl text-[#6b4f3a] shadow-inner">
              🏷️
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#351c15]">
                {formData.sellerName}
              </h2>
              <p className="text-[#6b4f3a]">{formData.businessType} Seller</p>
            </div>
          </div>

          {/* BUSINESS TYPE */}
          <div className="mb-6">
            <label className="font-medium text-[#351c15] block mb-1">
              Business Type
            </label>
            <select
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              className="w-full p-3 border border-[#e6d8c9] rounded-xl focus:ring-2 focus:ring-[#ffb500]"
            >
              <option value="Individual">Individual</option>
              <option value="Company">Company</option>
            </select>
          </div>

          {/* BASIC INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

            {/* Name */}
            <div>
              <label className="font-medium text-[#351c15] block mb-1">
                {formData.businessType === "Company"
                  ? "Company Name"
                  : "Full Name"}
              </label>
              <input
                type="text"
                name="sellerName"
                value={formData.sellerName}
                onChange={handleChange}
                className="w-full p-3 border border-[#e6d8c9] rounded-xl focus:ring-2 focus:ring-[#ffb500]"
              />
            </div>

            {/* Email */}
            <div>
              <label className="font-medium text-[#351c15] block mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border border-[#e6d8c9] rounded-xl focus:ring-2 focus:ring-[#ffb500]"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="font-medium text-[#351c15] block mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-3 border border-[#e6d8c9] rounded-xl focus:ring-2 focus:ring-[#ffb500]"
              />
            </div>

            {/* GST ONLY FOR COMPANIES */}
            {formData.businessType === "Company" && (
              <div>
                <label className="font-medium text-[#351c15] block mb-1">
                  GST Number
                </label>
                <input
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  placeholder="Enter valid GSTIN"
                  className="w-full p-3 border border-[#e6d8c9] rounded-xl focus:ring-2 focus:ring-[#ffb500]"
                />
              </div>
            )}
          </div>

          {/* PICKUP ADDRESS */}
          <div className="mb-6">
            <label className="font-medium text-[#351c15] block mb-1">
              Pickup Address
            </label>
            <textarea
              name="pickupAddress"
              value={formData.pickupAddress}
              onChange={handleChange}
              rows="3"
              className="w-full p-3 border border-[#e6d8c9] rounded-xl focus:ring-2 focus:ring-[#ffb500]"
            ></textarea>
          </div>

          {/* RETURN ADDRESS */}
          <div className="mb-6">
            <label className="font-medium text-[#351c15] block mb-1">
              Return Address
            </label>
            <textarea
              name="returnAddress"
              value={formData.returnAddress}
              onChange={handleChange}
              rows="3"
              className="w-full p-3 border border-[#e6d8c9] rounded-xl focus:ring-2 focus:ring-[#ffb500]"
            ></textarea>
          </div>

          {/* ALT CONTACT */}
          <div className="mb-8">
            <label className="font-medium text-[#351c15] block mb-1">
              Alternate Contact (Optional)
            </label>
            <input
              type="text"
              name="altContact"
              value={formData.altContact}
              onChange={handleChange}
              placeholder="+91 XXXXX XXXXX"
              className="w-full p-3 border border-[#e6d8c9] rounded-xl focus:ring-2 focus:ring-[#ffb500]"
            />
          </div>

          {/* SAVE BUTTON */}
          <button
            onClick={handleSave}
            className="bg-[#ffb500] text-[#351c15] hover:bg-[#e6a300] font-semibold py-3 px-6 rounded-xl text-lg shadow"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}
