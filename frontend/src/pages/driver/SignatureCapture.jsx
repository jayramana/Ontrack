import React from "react";
import DriverSidebar from "./DriverSidebar";

export default function SignatureCapture() {
  return (
    <div className="min-h-screen flex bg-gray-100">
      
      {/* Sidebar */}
      <DriverSidebar active="signature" />

      {/* MAIN CONTENT */}
      <div className="flex-1 p-10">

        {/* Page Title */}
        <h1 className="text-3xl font-bold mb-1">Signature Capture</h1>
        <p className="text-gray-500 mb-8">Verify ID and capture customer signature</p>

        {/* CUSTOMER BANNER */}
        <div className="bg-white rounded-xl p-6 shadow flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 text-indigo-700 font-bold w-12 h-12 rounded-full flex items-center justify-center">
              EB
            </div>
            <div>
              <h2 className="text-lg font-semibold">Emily Brown</h2>
              <p className="text-gray-500">321 Cedar Lane</p>
            </div>
          </div>

          <span className="px-3 py-1 text-sm rounded-lg bg-yellow-100 text-yellow-700 font-medium">
            ASR Required
          </span>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT CARD – ID VERIFICATION */}
          <div className="bg-white p-6 rounded-xl shadow">

            <h2 className="text-xl font-semibold mb-3">ID Verification</h2>
            <p className="text-gray-500 mb-6">
              Scan or photograph the customer's ID to verify age (21+).
            </p>

            {/* Scan with camera */}
            <button className="w-full bg-gray-100 hover:bg-gray-200 p-4 rounded-xl flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-teal-100 text-teal-600 p-2 rounded-lg">
                  📷
                </div>
                <div>
                  <p className="font-medium">Scan ID with Camera</p>
                  <p className="text-gray-500 text-sm">AI-powered instant verification</p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-lg bg-teal-100 text-teal-700 text-xs font-semibold">
                AI
              </span>
            </button>

            {/* Manual Verification */}
            <button className="w-full bg-gray-100 hover:bg-gray-200 p-4 rounded-xl text-left mb-4">
              <p className="font-medium">Manual Verification</p>
              <p className="text-gray-500 text-sm">Enter ID details manually</p>
            </button>

            {/* Warning Box */}
            <div className="bg-yellow-50 text-yellow-700 p-4 rounded-xl text-sm">
              Customer must be 21+ years old. Do not deliver without verification.
            </div>
          </div>

          {/* RIGHT CARD – CAPTURE SIGNATURE */}
          <div className="bg-white p-6 rounded-xl shadow flex flex-col justify-center items-center">
            <h2 className="text-xl font-semibold mb-4">Capture Signature</h2>

            <div className="border-2 border-dashed rounded-xl w-full h-48 flex items-center justify-center text-center text-gray-500">
              <div>
                <div className="text-4xl mb-2">🛡️</div>
                <p>Complete ID verification first</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
