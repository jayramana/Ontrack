import React, { useState } from "react";
import CustomerSidebar from "./CustomerSidebar";

export default function IDVerification() {
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) setUploadedFile(file);
  };

  return (
    <div className="min-h-screen flex bg-[#f7f3ef]">

      {/* SIDEBAR */}
      <CustomerSidebar active="id" />

      {/* RIGHT CONTENT */}
      <div className="flex-1 p-10">

        {/* HEADER */}
        <h1 className="text-3xl font-bold text-[#351c15] mb-2">
          ID Verification (ASR)
        </h1>

        <div className="inline-block px-3 py-1 rounded-xl text-sm font-medium 
                        bg-[#f9b400]/20 text-[#8a6a00] border border-[#f9b400]/40">
          ⚡ AI Powered
        </div>

        <p className="text-[#6f4e37] mt-3">
          Adult Signature Required – Verify your identity for age-restricted deliveries.
        </p>

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">

          {/* LEFT: UPLOAD DOCUMENT */}
          <div className="bg-[#fff8e7] rounded-2xl shadow p-6 border border-[#e6ddc5] lg:col-span-2">
            <h2 className="text-xl font-semibold text-[#351c15] mb-4">
              Upload ID Document
            </h2>

            {/* Upload Box */}
            <label
              className="border-2 border-dashed border-[#c6b8a3] rounded-2xl 
                         h-64 bg-white hover:bg-[#fff5db] transition
                         flex flex-col items-center justify-center cursor-pointer"
            >
              <input
                type="file"
                className="hidden"
                accept="image/png, image/jpeg"
                onChange={handleFileUpload}
              />

              <div className="text-[#351c15] text-4xl mb-2">⬆️</div>

              {!uploadedFile ? (
                <>
                  <p className="font-medium text-[#351c15]">
                    Click to upload or drag & drop
                  </p>
                  <p className="text-[#6f4e37] text-sm mt-1">
                    Driver's License, Passport, or State ID
                  </p>
                  <p className="text-[#6f4e37] text-xs mt-1">PNG, JPG up to 10MB</p>
                </>
              ) : (
                <p className="text-[#351c15] font-medium">
                  Uploaded: {uploadedFile.name}
                </p>
              )}
            </label>

            {/* Buttons */}
            <div className="flex gap-4 mt-6">
              <button
                className="flex items-center justify-center gap-2 
                           bg-[#6f4e37] hover:bg-[#5d3f2d] 
                           text-white px-4 py-2 rounded-xl w-full shadow"
              >
                📷 Take Photo
              </button>

              <label
                className="flex items-center justify-center gap-2 
                           bg-[#351c15] hover:bg-[#4a2a21] 
                           text-white px-4 py-2 rounded-xl w-full cursor-pointer shadow"
              >
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
          <div className="bg-[#fff8e7] rounded-2xl shadow p-6 border border-[#e6ddc5]">
            <h2 className="text-xl font-semibold text-[#351c15] mb-4">
              Verification Status
            </h2>

            {/* Document Status */}
            <div className="flex items-center justify-between bg-[#fff5db] p-4 rounded-xl mb-3 border border-[#e6ddc5]">
              <div className="flex items-center gap-3">
                <div className="text-yellow-600 text-xl">⚠️</div>
                <div>
                  <h3 className="font-semibold text-[#351c15]">Document Status</h3>
                  <p className="text-[#6f4e37] text-sm">Pending upload</p>
                </div>
              </div>
              <span className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-lg text-sm font-semibold">
                Pending
              </span>
            </div>

            {/* Age Verification */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-[#e6ddc5]">
              <div className="flex items-center gap-3">
                <div className="text-green-600 text-xl">🛡️</div>
                <div>
                  <h3 className="font-semibold text-[#351c15]">Age Verification</h3>
                  <p className="text-[#6f4e37] text-sm">21+ required</p>
                </div>
              </div>
              <span className="bg-gray-300 text-[#351c15] px-3 py-1 rounded-lg text-sm font-medium">
                Awaiting
              </span>
            </div>
          </div>
        </div>

        {/* WHY REQUIRED SECTION */}
        <div className="mt-8 p-6 rounded-2xl shadow 
                        bg-[#fff5db] border border-[#e6ddc5]">
          <h3 className="font-semibold text-[#351c15] mb-2">
            Why is ID verification required?
          </h3>
          <p className="text-[#6f4e37]">
            This delivery contains age-restricted items. We verify your identity 
            to comply with regulations and ensure safe delivery.
          </p>
        </div>

      </div>
    </div>
  );
}
