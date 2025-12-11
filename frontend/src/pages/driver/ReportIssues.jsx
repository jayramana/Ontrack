import React from "react";
import DriverSidebar from "./DriverSidebar";

export default function ReportIssues() {
  return (
    <div className="min-h-screen flex bg-[#f8f4ef]">

      {/* SIDEBAR */}
      <DriverSidebar active="issues" />

      {/* MAIN CONTENT */}
      <div className="flex-1 p-10">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-[#351c15]">Report Road Issues</h1>
          <p className="text-gray-600 mt-1">
            Help other drivers by reporting on-ground conditions
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT — FORM */}
          <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-[#e2d6c6] shadow-md">

            <h2 className="text-xl font-bold text-[#351c15] mb-6 flex items-center gap-2">
              ⚠️ Report Road Issue
            </h2>

            {/* ISSUE TYPE */}
            <label className="text-[#351c15] font-medium">Issue Type</label>
            <select className="w-full border border-[#dacab2] rounded-lg p-3 mt-1 mb-5 focus:ring-[#ffb500] focus:border-[#ffb500]">
              <option>Select issue type</option>
              <option>Construction</option>
              <option>Roadblock</option>
              <option>Accident</option>
            </select>

            {/* LOCATION INPUT */}
            <label className="text-[#351c15] font-medium">Location</label>
            <input
              type="text"
              placeholder="Enter location or address"
              className="w-full border border-[#dacab2] rounded-lg p-3 mt-1 mb-3 focus:ring-[#ffb500] focus:border-[#ffb500]"
            />

            <button className="w-full bg-[#ffb500] text-[#351c15] font-semibold py-2 rounded-lg hover:bg-[#e5a400] mb-6 shadow-sm">
              📍 Use Current Location
            </button>

            {/* DESCRIPTION */}
            <label className="text-[#351c15] font-medium">Description</label>
            <textarea
              rows="4"
              placeholder="Describe the issue in detail..."
              className="w-full border border-[#dacab2] rounded-lg p-3 mt-1 mb-6 focus:ring-[#ffb500] focus:border-[#ffb500]"
            />

            {/* PHOTO UPLOAD */}
            <label className="text-[#351c15] font-medium">Photo (Optional)</label>
            <div className="border-2 border-dashed border-[#dacab2] rounded-lg p-6 text-center text-gray-500 mt-2 mb-6 hover:bg-[#f8f4ef] cursor-pointer transition">
              <p className="text-3xl mb-2">📷</p>
              Tap to upload a photo
            </div>

            {/* SUBMIT */}
            <button className="w-full py-3 rounded-lg bg-[#351c15] text-white font-semibold hover:bg-[#2b1711] transition shadow">
              Submit Report
            </button>
          </div>

          {/* RIGHT — ALERTS + ROUTES */}
          <div className="space-y-6">

            {/* ACTIVE ALERTS */}
            <div className="bg-white p-6 rounded-xl border border-[#e2d6c6] shadow-md">
              <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold text-[#351c15]">🔄 Active Alerts</h2>
                <span className="text-[#ffb500] font-bold">3 Active</span>
              </div>

              {/* ALERT 1 */}
              <div className="bg-[#fff8e6] border border-[#ffe1a6] p-4 rounded-xl mb-4 shadow-sm">
                <h3 className="font-semibold flex items-center gap-2 text-[#351c15]">
                  🚧 Construction
                  <span className="text-green-700 text-xs bg-green-100 px-2 py-1 rounded">
                    Verified
                  </span>
                </h3>
                <p className="text-gray-600">
                  Road construction between 42nd and 45th Street
                </p>
                <p className="text-gray-500 text-sm">📍 5th Avenue, Manhattan</p>
                <p className="text-gray-400 text-xs mt-1">
                  Reported 10:45 PM by Mike Driver
                </p>
              </div>

              {/* ALERT 2 */}
              <div className="bg-[#fff8e6] border border-[#ffe1a6] p-4 rounded-xl mb-4 shadow-sm">
                <h3 className="font-semibold flex items-center gap-2 text-[#351c15]">
                  🚗 Accident
                  <span className="text-green-700 text-xs bg-green-100 px-2 py-1 rounded">
                    Verified
                  </span>
                </h3>
                <p className="text-gray-600">Multi-vehicle accident blocking lanes</p>
                <p className="text-gray-500 text-sm">📍 Brooklyn Bridge</p>
                <p className="text-gray-400 text-xs mt-1">
                  Reported 11:00 PM by Sarah Driver
                </p>
              </div>

              {/* ALERT 3 */}
              <div className="bg-[#f7f7f7] border border-[#e2d6c6] p-4 rounded-xl shadow-sm">
                <h3 className="font-semibold flex items-center gap-2 text-[#351c15]">
                  ⚠️ Roadblock
                </h3>
                <p className="text-gray-600">Police activity causing road closure</p>
                <p className="text-gray-500 text-sm">📍 Times Square Area</p>
                <p className="text-gray-400 text-xs mt-1">
                  Reported 11:10 PM by Mike Driver
                </p>
              </div>
            </div>

            {/* SUGGESTED ROUTES */}
            <div className="bg-[#f1faee] p-6 rounded-xl border border-green-200 shadow-md">
              <h2 className="text-lg font-bold text-[#351c15] mb-4">🛣 Suggested Alternate Routes</h2>

              <div className="bg-white border border-green-200 p-3 rounded-lg mb-3">
                <p className="font-semibold text-[#351c15]">Avoid 5th Avenue</p>
                <p className="text-gray-600 text-sm">Use Madison Avenue • Saves 12 min</p>
              </div>

              <div className="bg-white border border-green-200 p-3 rounded-lg">
                <p className="font-semibold text-[#351c15]">Brooklyn Bridge Alternate</p>
                <p className="text-gray-600 text-sm">Use Manhattan Bridge • Saves 8 min</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
