import React, { useState } from "react";
import SellerSidebar from "./SellerSidebar";

export default function CreateShipment() {
  const [formData, setFormData] = useState({
    senderName: "",
    senderPhone: "",
    senderAddress: "",
    receiverName: "",
    receiverPhone: "",
    receiverAddress: "",
    packageWeight: "",
    packageType: "",
    codAmount: "",
    pickupDate: "",
    pickupTime: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    console.log("Shipment Created:", formData);
    // TODO: send to backend
  };

  return (
    <div className="min-h-screen flex bg-[#f8f4ef]">

      {/* SIDEBAR */}
      <SellerSidebar active="create" />

      {/* MAIN CONTENT */}
      <div className="flex-1 px-10 py-8">

        {/* HEADER */}
        <h1 className="text-3xl font-bold text-[#351c15] mb-2">Create Shipment</h1>
        <p className="text-[#6b4f3a] mb-8">
          Fill in accurate shipment details for smooth pickup & delivery
        </p>

        {/* FORM CARD */}
        <div className="bg-white p-8 rounded-2xl shadow border border-[#e6d8c9] max-w-4xl">

          {/* SENDER INFO */}
          <h2 className="text-xl font-semibold text-[#351c15] mb-4">Sender Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

            <div>
              <label className="font-medium text-[#6b4f3a] mb-1 block">Full Name</label>
              <input
                type="text"
                name="senderName"
                value={formData.senderName}
                onChange={handleChange}
                placeholder="Sender full name"
                className="w-full p-3 border border-[#d4c7b9] rounded-xl focus:ring-2 focus:ring-[#ffb500]"
              />
            </div>

            <div>
              <label className="font-medium text-[#6b4f3a] mb-1 block">Phone Number</label>
              <input
                type="text"
                name="senderPhone"
                value={formData.senderPhone}
                onChange={handleChange}
                placeholder="+91 XXXXX XXXXX"
                className="w-full p-3 border border-[#d4c7b9] rounded-xl focus:ring-2 focus:ring-[#ffb500]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-medium text-[#6b4f3a] mb-1 block">Address</label>
              <textarea
                name="senderAddress"
                value={formData.senderAddress}
                onChange={handleChange}
                rows="3"
                placeholder="Street, City, State, Pincode"
                className="w-full p-3 border border-[#d4c7b9] rounded-xl focus:ring-2 focus:ring-[#ffb500]"
              />
            </div>
          </div>

          {/* RECEIVER INFO */}
          <h2 className="text-xl font-semibold text-[#351c15] mb-4">Receiver Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

            <div>
              <label className="font-medium text-[#6b4f3a] mb-1 block">Full Name</label>
              <input
                type="text"
                name="receiverName"
                value={formData.receiverName}
                onChange={handleChange}
                placeholder="Receiver full name"
                className="w-full p-3 border border-[#d4c7b9] rounded-xl focus:ring-2 focus:ring-[#ffb500]"
              />
            </div>

            <div>
              <label className="font-medium text-[#6b4f3a] mb-1 block">Phone Number</label>
              <input
                type="text"
                name="receiverPhone"
                value={formData.receiverPhone}
                onChange={handleChange}
                placeholder="+91 XXXXX XXXXX"
                className="w-full p-3 border border-[#d4c7b9] rounded-xl focus:ring-2 focus:ring-[#ffb500]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-medium text-[#6b4f3a] mb-1 block">Address</label>
              <textarea
                name="receiverAddress"
                value={formData.receiverAddress}
                onChange={handleChange}
                rows="3"
                placeholder="Street, City, State, Pincode"
                className="w-full p-3 border border-[#d4c7b9] rounded-xl focus:ring-2 focus:ring-[#ffb500]"
              />
            </div>
          </div>

          {/* PACKAGE INFORMATION */}
          <h2 className="text-xl font-semibold text-[#351c15] mb-4">Package Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            <div>
              <label className="font-medium text-[#6b4f3a] mb-1 block">Weight (kg)</label>
              <input
                type="number"
                name="packageWeight"
                value={formData.packageWeight}
                min="0"
                step="0.1"
                onChange={handleChange}
                placeholder="e.g. 2.5"
                className="w-full p-3 border border-[#d4c7b9] rounded-xl focus:ring-2 focus:ring-[#ffb500]"
              />
            </div>

            <div>
              <label className="font-medium text-[#6b4f3a] mb-1 block">Package Type</label>
              <select
                name="packageType"
                value={formData.packageType}
                onChange={handleChange}
                className="w-full p-3 border border-[#d4c7b9] rounded-xl focus:ring-2 focus:ring-[#ffb500]"
              >
                <option value="">Select</option>
                <option value="Box">Box</option>
                <option value="Envelope">Envelope</option>
                <option value="Fragile">Fragile</option>
                <option value="Liquid">Liquid</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-[#6b4f3a] mb-1 block">COD Amount (optional)</label>
              <input
                type="number"
                name="codAmount"
                value={formData.codAmount}
                onChange={handleChange}
                placeholder="₹ Amount"
                className="w-full p-3 border border-[#d4c7b9] rounded-xl focus:ring-2 focus:ring-[#ffb500]"
              />
            </div>

          </div>

          {/* PICKUP SCHEDULING */}
          <h2 className="text-xl font-semibold text-[#351c15] mb-4">Pickup Scheduling</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            
            <div>
              <label className="font-medium text-[#6b4f3a] mb-1 block">Pickup Date</label>
              <input
                type="date"
                name="pickupDate"
                value={formData.pickupDate}
                onChange={handleChange}
                className="w-full p-3 border border-[#d4c7b9] rounded-xl focus:ring-2 focus:ring-[#ffb500]"
              />
            </div>

            <div>
              <label className="font-medium text-[#6b4f3a] mb-1 block">Pickup Time</label>
              <input
                type="time"
                name="pickupTime"
                value={formData.pickupTime}
                onChange={handleChange}
                className="w-full p-3 border border-[#d4c7b9] rounded-xl focus:ring-2 focus:ring-[#ffb500]"
              />
            </div>

          </div>

          {/* SUBMIT BUTTON */}
          <button
            onClick={handleSubmit}
            className="w-full bg-[#ffb500] hover:bg-[#e6a300] text-[#351c15] py-3 rounded-xl text-lg font-semibold shadow"
          >
            Create Shipment
          </button>

        </div>
      </div>
    </div>
  );
}
