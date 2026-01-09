import React from "react";
import DriverSidebar from "./DriverSidebar";

export default function SignatureCapture() {
  return (
    <div className="min-h-screen flex bg-[#f8f4ef]">
      
      {/* Sidebar */}
      <DriverSidebar active="signature" />

      {/* MAIN CONTENT */}
      <div className="flex-1 p-10 transition-all duration-300">

        {/* Page Title */}
        <h1 className="text-3xl font-extrabold text-[#351c15] mb-1">
          Signature Capture
        </h1>
        <p className="text-gray-600 mb-8">
          Verify ID and capture customer signature
        </p>

        {/* CUSTOMER INFO BANNER */}
        <div className="bg-white border border-[#e2d6c6] rounded-xl p-6 shadow-sm flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            {/* Customer Avatar */}
            <div className="bg-[#ffb500]/20 text-[#6f4e37] font-bold w-12 h-12 rounded-full flex items-center justify-center">
              EB
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#351c15]">
                Emily Brown
              </h2>
              <p className="text-gray-600">321 Cedar Lane</p>
            </div>
          </div>

          {/* ASR Badge */}
          <span className="px-3 py-1 text-sm rounded-lg bg-yellow-100 text-yellow-700 font-semibold">
            ASR REQUIRED
          </span>
        </div>

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT CARD – ID Verification */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e2d6c6]">
            <h2 className="text-xl font-bold text-[#351c15] mb-3">
              ID Verification
            </h2>
            <p className="text-gray-600 mb-6">
              Scan or photograph the customer's ID to verify age (21+).
            </p>

            {/* Scan with camera */}
            <button className="w-full bg-[#fdfbf7] hover:bg-[#f7f3ec] border border-[#e2d6c6] p-4 rounded-xl flex justify-between items-center mb-4 transition">
              <div className="flex items-center gap-3">
                <div className="bg-[#ffb500]/20 text-[#6f4e37] p-2 rounded-lg">
                  📷
                </div>
                <div>
                  <p className="font-semibold text-[#351c15]">Scan ID with Camera</p>
                  <p className="text-gray-600 text-sm">AI-powered instant verification</p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-lg bg-[#ffb500]/20 text-[#6f4e37] text-xs font-semibold">
                AI
              </span>
            </button>

            {/* Manual Verification */}
            <button className="w-full bg-[#fdfbf7] hover:bg-[#f7f3ec] border border-[#e2d6c6] p-4 rounded-xl text-left mb-4 transition">
              <p className="font-semibold text-[#351c15]">Manual Verification</p>
              <p className="text-gray-600 text-sm">Enter ID details manually</p>
            </button>

            {/* Warning */}
            <div className="bg-yellow-50 text-yellow-700 p-4 rounded-xl border border-yellow-200 text-sm">
              Customer must be 21+ years old.  
              <span className="font-semibold"> Do NOT deliver without verification.</span>
            </div>
          </div>

          {/* RIGHT CARD – Signature Capture */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e2d6c6] flex flex-col justify-center items-center">
            <h2 className="text-xl font-bold text-[#351c15] mb-4">
              Capture Signature
            </h2>

            <div className="border-2 border-dashed border-[#d8c9b8] rounded-xl w-full h-48 flex items-center justify-center text-center text-gray-600 bg-[#faf7f3]">
              <div>
                <div className="text-4xl mb-2">🛡️</div>
                <p className="font-medium text-[#351c15]">
                  Complete ID verification first
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
