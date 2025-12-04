import React, { useState } from "react";
import CustomerSidebar from "./CustomerSidebar";
export default function IDVerification() {
  const [uploadedFile, setUploadedFile] = useState(null);

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);

      // TODO: Send file to backend
      // const res = await uploadID(file)
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* SIDEBAR */}
      <CustomerSidebar active="id" />

      {/* RIGHT CONTENT */}
      <div className="flex-1 p-10">

        {/* HEADER */}
        <h1 className="text-3xl font-bold mb-1">ID Verification (ASR)</h1>
        <div className="text-teal-500 bg-teal-50 inline-block px-3 py-1 rounded-xl text-sm mt-1">
          ⚡ AI Powered
        </div>
        <p className="text-gray-500 mt-3">
          Adult Signature Required – Verify your identity for age-restricted deliveries
        </p>

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">

          {/* LEFT: UPLOAD DOCUMENT */}
          <div className="bg-white rounded-2xl shadow p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Upload ID Document</h2>

            {/* Upload Box */}
            <label
              className="border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center h-64 cursor-pointer hover:bg-gray-50 transition"
            >
              <input
                type="file"
                className="hidden"
                accept="image/png, image/jpeg"
                onChange={handleFileUpload}
              />

              <div className="text-gray-400 text-4xl mb-2">⬆️</div>

              {!uploadedFile ? (
                <>
                  <p className="font-medium">Click to upload or drag and drop</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Driver's License, Passport, or State ID
                  </p>
                  <p className="text-gray-400 text-xs mt-1">PNG, JPG up to 10MB</p>
                </>
              ) : (
                <p className="text-gray-700 font-medium">
                  Uploaded: {uploadedFile.name}
                </p>
              )}
            </label>

            {/* Buttons */}
            <div className="flex gap-4 mt-6">
              <button
                className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl w-full"
              >
                📷 Take Photo
              </button>

              <label className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl w-full cursor-pointer">
                ⬆️ Upload File
                <input
                  type="file"
                  className="hidden"
                  accept="image/png, image/jpeg"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>

          {/* RIGHT: VERIFICATION STATUS */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Verification Status</h2>

            {/* Document Status */}
            <div className="flex items-center justify-between bg-gray-100 p-4 rounded-xl mb-3">
              <div className="flex items-center gap-3">
                <div className="text-yellow-500 text-xl">⚠️</div>
                <div>
                  <h3 className="font-semibold">Document Status</h3>
                  <p className="text-gray-500 text-sm">Pending upload</p>
                </div>
              </div>
              <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-sm">
                Pending
              </span>
            </div>

            {/* Age Verification */}
            <div className="flex items-center justify-between bg-gray-100 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="text-green-500 text-xl">🛡️</div>
                <div>
                  <h3 className="font-semibold">Age Verification</h3>
                  <p className="text-gray-500 text-sm">21+ required</p>
                </div>
              </div>
              <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm">
                Awaiting
              </span>
            </div>
          </div>
        </div>

        {/* WHY REQUIRED SECTION */}
        <div className="bg-teal-50 p-6 rounded-2xl shadow mt-8 border border-teal-100">
          <h3 className="font-semibold text-teal-700 mb-2">Why is ID verification required?</h3>
          <p className="text-teal-900">
            This delivery contains age-restricted items. We verify your identity 
            to comply with regulations and ensure safe delivery.
          </p>
        </div>

      </div>
    </div>
  );
}
