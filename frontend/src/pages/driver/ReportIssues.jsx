import React from "react";
import DriverSidebar from "./DriverSidebar";

export default function ReportIssues() {
  return (
    <div className="min-h-screen flex bg-gray-100">
      
      {/* Sidebar */}
      <DriverSidebar active="issues" />

      {/* MAIN CONTENT */}
      <div className="flex-1 p-10">

        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Report Issues</h1>
            <p className="text-gray-500">Help other drivers by reporting road conditions</p>
          </div>

          
        </div>

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT SIDE – REPORT FORM */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow">

            <h2 className="text-xl font-semibold mb-4">⚠️ Report Road Issue</h2>

            {/* Issue Type */}
            <label className="block text-gray-600 mb-1">Issue Type</label>
            <select className="w-full border rounded-lg p-2 mb-4">
              <option>Select issue type</option>
              <option>Construction</option>
              <option>Roadblock</option>
              <option>Accident</option>
            </select>

            {/* Location Input */}
            <label className="block text-gray-600 mb-1">Location</label>
            <input 
              type="text"
              placeholder="Enter location or address"
              className="w-full border rounded-lg p-2 mb-2"
            />

            <button className="w-full bg-gray-100 hover:bg-gray-200 p-2 rounded-lg mb-4">
              📍 Use Current Location
            </button>

            {/* Description */}
            <label className="block text-gray-600 mb-1">Description</label>
            <textarea 
              rows="4"
              placeholder="Describe the issue in detail..."
              className="w-full border rounded-lg p-2 mb-4"
            />

            {/* Photo Upload */}
            <label className="block text-gray-600 mb-1">Photo (Optional)</label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center text-gray-400 mb-6">
              <p className="text-3xl mb-2">📷</p>
              Tap to add a photo
            </div>

            {/* Submit Button */}
            <button className="w-full p-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800">
              Submit Report
            </button>

          </div>

          {/* RIGHT SIDE – ACTIVE ALERTS */}
          <div className="space-y-6">

            {/* Active Alerts */}
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">🔄 Active Alerts</h2>
                <span className="text-blue-600 text-sm font-medium">3 Active</span>
              </div>

              {/* ALERT CARD 1 */}
              <div className="bg-yellow-50 p-4 rounded-xl mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  🚧 Construction 
                  <span className="text-green-600 text-xs bg-green-100 px-2 py-1 rounded">Verified</span>
                </h3>
                <p className="text-gray-600">Road construction on 5th Avenue between 42nd and 45th Street</p>
                <p className="text-gray-500 text-sm">📍 5th Avenue, Manhattan</p>
                <p className="text-gray-400 text-xs mt-1">Reported 10:45 PM by Mike Driver</p>
              </div>

              {/* ALERT CARD 2 */}
              <div className="bg-yellow-50 p-4 rounded-xl mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  🚗 Accident 
                  <span className="text-green-600 text-xs bg-green-100 px-2 py-1 rounded">Verified</span>
                </h3>
                <p className="text-gray-600">Multi-vehicle accident blocking two lanes</p>
                <p className="text-gray-500 text-sm">📍 Brooklyn Bridge</p>
                <p className="text-gray-400 text-xs mt-1">Reported 11:00 PM by Sarah Driver</p>
              </div>

              {/* ALERT CARD 3 */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="font-semibold flex items-center gap-2">
                  ⚠️ Roadblock
                </h3>
                <p className="text-gray-600">Police activity causing temporary road closure</p>
                <p className="text-gray-500 text-sm">📍 Times Square Area</p>
                <p className="text-gray-400 text-xs mt-1">Reported 11:10 PM by Mike Driver</p>
              </div>
            </div>

            {/* Suggested Routes */}
            <div className="bg-green-50 p-6 rounded-xl shadow">
              <h2 className="text-lg font-semibold mb-3">🔄 Suggested Alternate Routes</h2>

              <div className="bg-white p-3 rounded-lg mb-2">
                <p className="font-semibold">Avoid 5th Avenue</p>
                <p className="text-gray-500 text-sm">Use Madison Avenue instead • Saves 12 min</p>
              </div>

              <div className="bg-white p-3 rounded-lg">
                <p className="font-semibold">Brooklyn Bridge Alternate</p>
                <p className="text-gray-500 text-sm">Use Manhattan Bridge • Saves 8 min</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
