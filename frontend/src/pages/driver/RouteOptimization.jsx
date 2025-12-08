import React from "react";
import DriverSidebar from "./DriverSidebar";

export default function RouteOptimization() {
  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* Sidebar */}
      <DriverSidebar active="route" />

      {/* MAIN CONTENT */}
      <div className="flex-1 p-10">

        {/* HEADER SECTION */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Route Optimization</h1>
            <p className="text-gray-500">Optimize your delivery route for maximum efficiency</p>
          </div>

          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            <span>🔄</span> Optimize Route
          </button>
        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT SIDE – ROUTE MAP PLACEHOLDER */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow p-6 flex justify-center items-center">
            <div className="border-2 border-dashed w-full h-[450px] rounded-xl flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="text-2xl">📍</p>
                <p>Route visualization placeholder</p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE – INFO CARDS */}
          <div className="space-y-4">

            {/* Savings Card */}
            <div className="bg-white p-5 rounded-xl shadow">
              <p className="text-gray-500 text-sm">Optimize to see savings</p>
              <h2 className="text-2xl font-semibold mt-2">--</h2>
            </div>

            {/* Estimated Time */}
            <div className="bg-white p-5 rounded-xl shadow flex items-center gap-3">
              <div className="text-blue-500 text-3xl">⏱</div>
              <div>
                <h2 className="text-2xl font-bold">145 min</h2>
                <p className="text-gray-500 text-sm">Estimated Time</p>
              </div>
            </div>

            {/* Delivery Order List */}
            <div className="bg-white p-5 rounded-xl shadow">
              <h3 className="text-lg font-semibold mb-3">Delivery Order</h3>

              <div className="space-y-3">

                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div>
                    <p className="font-semibold">1. John Customer</p>
                    <p className="text-gray-500 text-sm">123 Main St, NYC</p>
                  </div>
                  <span className="text-yellow-600 text-xl">🛡️</span>
                </div>

                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div>
                    <p className="font-semibold">2. Bob Wilson</p>
                    <p className="text-gray-500 text-sm">555 Broadway, NYC</p>
                  </div>
                  <span className="text-yellow-600 text-xl">🛡️</span>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
