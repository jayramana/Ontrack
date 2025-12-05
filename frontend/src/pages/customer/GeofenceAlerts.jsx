import React, { useState } from "react";
import CustomerSidebar from "./CustomerSidebar";
export default function GeofenceAlerts() {
  const [alertDistance, setAlertDistance] = useState(2);

  const recentAlerts = [
    { icon: "⚠️", title: "Driver is 5 minutes away", time: "2:50 PM" },
    { icon: "📍", title: "Driver entered your area", time: "2:48 PM" },
    { icon: "🛡️", title: "Prepare ID for verification", time: "2:48 PM" },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* REUSABLE SIDEBAR */}
      <CustomerSidebar active="alerts" />

      {/* RIGHT CONTENT */}
      <div className="flex-1 p-10">

        {/* HEADER */}
        <h1 className="text-3xl font-bold mb-1">Geofence Alerts</h1>
        <p className="text-gray-500 mb-6">Get notified when your delivery is nearby</p>

        {/* DRIVER NEAR ALERT BOX */}
        <div className="bg-white border border-teal-500 rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex items-center space-x-3">
            <div className="text-3xl text-teal-500">🔔</div>
            <h2 className="text-xl font-semibold">Driver is Nearby!</h2>
            <span className="bg-teal-100 text-teal-600 px-2 py-1 rounded-lg text-xs">Active</span>
          </div>

          <p className="text-gray-600 mt-2">
            Your driver has entered your delivery zone and will arrive in approximately 5 minutes.
          </p>

          <div className="flex items-center space-x-6 mt-3 text-sm">
            <div className="flex items-center text-gray-700">⏱ ETA: 2:55 PM</div>
            <div className="flex items-center text-yellow-700">
              🛡️ <span className="ml-1">ASR: Have your ID ready</span>
            </div>
          </div>
        </div>

        {/* GRID SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT: PREFERENCES */}
          <div className="bg-white p-6 rounded-2xl shadow ">
            <h2 className="font-bold text-lg mb-3">Alert Preferences</h2>

            {/* Push */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Push Notifications</h3>
                <p className="text-gray-500 text-sm">Receive alerts on your device</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-700"></div>
                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-5"></div>
              </label>
            </div>

            {/* SMS */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">SMS Alerts</h3>
                <p className="text-gray-500 text-sm">Get text messages</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-700"></div>
                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-5"></div>
              </label>
            </div>

            {/* Email */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold">Email Notifications</h3>
                <p className="text-gray-500 text-sm">Receive email updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-700"></div>
                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-5"></div>
              </label>
            </div>

            {/* Distance */}
            <h3 className="font-semibold mb-3">Alert Distance</h3>
            <div className="flex items-center space-x-3">
              {[1, 2, 5].map((mile) => (
                <button
                  key={mile}
                  onClick={() => setAlertDistance(mile)}
                  className={`px-4 py-2 rounded-xl border ${
                    alertDistance === mile
                      ? "bg-teal-500 text-white border-teal-500"
                      : "bg-white text-gray-700"
                  }`}
                >
                  {mile} mile{mile > 1 ? "s" : ""}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: RECENT ALERTS */}
          <div className="bg-white p-6 rounded-2xl shadow ">
            <h2 className="font-bold text-lg mb-3">Recent Alerts</h2>

            <div className="space-y-3">
              {recentAlerts.map((alert, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-100 p-4 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{alert.icon}</div>
                    <div>
                      <h3 className="font-semibold">{alert.title}</h3>
                      <p className="text-gray-500 text-sm">{alert.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
