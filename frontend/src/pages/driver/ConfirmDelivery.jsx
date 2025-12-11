import React from "react";
import DriverSidebar from "./DriverSidebar";

export default function ConfirmDelivery() {
  return (
    <div className="min-h-screen flex bg-[#f8f4ef]">

      {/* SIDEBAR */}
      <DriverSidebar active="confirm" />

      {/* MAIN CONTENT */}
      <div className="flex-1 px-10 py-8">

        {/* PAGE HEADER */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">📦</div>
          <h1 className="text-3xl font-bold text-[#351c15]">Confirm Delivery</h1>
          <p className="text-[#6b4f3a]">DEL-2024-001</p>
        </div>

        {/* CUSTOMER INFORMATION CARD */}
        <div className="bg-white rounded-xl shadow-lg border border-[#e6d8c9] p-6 mb-8">

          <p className="text-sm text-[#6b4f3a] mb-1">Customer</p>
          <p className="text-lg font-semibold text-[#351c15] mb-4">
            John Customer
          </p>

          <p className="text-sm text-[#6b4f3a] mb-1">Address</p>
          <p className="font-medium text-[#351c15] mb-6">
            123 Main St, New York, NY 10001
          </p>

          {/* ASR Warning */}
          <div className="bg-[#fff4d0] p-4 rounded-xl border border-[#ffda8b]">
            <p className="text-[#a86900] font-bold mb-1">🛡️ ASR Package</p>
            <p className="text-sm text-[#a86900]">
              Adult signature verification is required. Verify recipient ID before delivering.
            </p>
          </div>
        </div>

        {/* ASR VERIFICATION CARD */}
        <div className="bg-white rounded-xl shadow-lg border border-[#e6d8c9] p-6 mb-8">

          <h2 className="text-2xl font-bold text-[#351c15] mb-2">
            🛡️ ASR Verification
          </h2>
          <p className="text-[#6b4f3a] mb-6">
            Complete all verification steps before confirming delivery
          </p>

          {/* CHECKBOX */}
          <label className="flex items-center gap-3 mb-6 cursor-pointer">
            <input type="checkbox" className="w-5 h-5" />
            <span className="font-medium text-[#351c15]">ID Verified</span>
          </label>

          {/* RECIPIENT NAME */}
          <div className="mb-6">
            <label className="text-[#6b4f3a] mb-1 block">
              Recipient Name (as per ID)
            </label>
            <input
              type="text"
              placeholder="Enter name exactly as shown on ID"
              className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#ffb500] outline-none"
            />
          </div>

          {/* SIGNATURE BOX */}
          <div className="mb-6">
            <p className="text-[#6b4f3a] mb-2">Signature Capture</p>

            <div className="border-2 border-dashed rounded-xl p-12 text-center text-[#6b4f3a] hover:bg-[#fffaf3] transition">
              <div className="text-4xl mb-2">✒️</div>
              Tap to capture signature
            </div>
          </div>

          {/* INCOMPLETE WARNING */}
          <div className="bg-[#fff4d0] border border-[#ffda8b] p-4 rounded-xl text-[#8c5a00] font-medium mb-6">
            ⚠️ Verification incomplete — Please complete all ASR steps.
          </div>

          {/* BUTTONS */}
          <div className="flex justify-between mt-4">
            <button className="px-6 py-2 border border-[#d7c7b8] rounded-xl text-[#351c15] hover:bg-[#f3e7dd] transition">
              Cancel
            </button>

            <button className="px-6 py-2 rounded-xl bg-gray-300 text-white cursor-not-allowed">
              ✔ Confirm Delivery
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
