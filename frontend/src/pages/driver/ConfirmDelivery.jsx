import React from "react";
import DriverSidebar from "./DriverSidebar";

export default function ConfirmDelivery() {
  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* Sidebar */}
      <DriverSidebar active="confirm" />

      {/* MAIN CONTENT */}
      <div className="flex-1 p-10">

        {/* Page Title */}
        <div className="text-center mb-10">
          <div className="text-4xl mb-2">📦</div>
          <h1 className="text-3xl font-bold">Confirm Delivery</h1>
          <p className="text-gray-500">DEL-2024-001</p>
        </div>

        {/* CUSTOMER INFO CARD */}
        <div className="bg-white p-6 rounded-xl shadow mb-8">
          
          <p className="text-sm text-gray-500 mb-1">Customer</p>
          <p className="text-lg font-medium mb-3">John Customer</p>

          <p className="text-sm text-gray-500 mb-1">Address</p>
          <p className="font-medium mb-4">123 Main St, New York, NY 10001</p>

          {/* ASR Warning */}
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
            <p className="text-yellow-700 font-semibold mb-1">🛡️ ASR Package</p>
            <p className="text-sm text-yellow-700">
              This package requires adult signature verification. Please verify the recipient's ID before delivering.
            </p>
          </div>
        </div>

        {/* ASR VERIFICATION SECTION */}
        <div className="bg-white p-6 rounded-xl shadow mb-8">
          
          <h2 className="text-xl font-semibold mb-2">🛡️ ASR Verification</h2>
          <p className="text-gray-500 mb-6">Complete all verification steps to confirm delivery</p>

          {/* Checkbox */}
          <label className="flex items-center gap-3 mb-4">
            <input type="checkbox" className="w-5 h-5" />
            <span className="font-medium">ID Verified</span>
          </label>

          {/* Recipient Name */}
          <div className="mb-6">
            <p className="text-gray-600 mb-1">Recipient Name (from ID)</p>
            <input 
              type="text"
              placeholder="Enter name exactly as shown on ID"
              className="w-full border rounded-lg p-2"
            />
          </div>

          {/* Signature Capture */}
          <div className="mb-6">
            <p className="text-gray-600 mb-2">Signature Capture</p>

            <div className="border-2 border-dashed rounded-xl p-10 text-center text-gray-500">
              <div className="text-3xl mb-2">✒️</div>
              Tap to capture signature
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-yellow-700 mb-6">
            ⚠ Incomplete Verification — Please complete all ASR steps before confirming delivery.
          </div>

          {/* Buttons */}
          <div className="flex justify-between">
            <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
              Cancel
            </button>

            <button className="px-6 py-2 bg-blue-300 text-white rounded-lg cursor-not-allowed">
              ✔ Confirm Delivery
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
