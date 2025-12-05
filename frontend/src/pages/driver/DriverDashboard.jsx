import { useAuth } from "../../context/AuthContext";
import React from "react";
import DriverSidebar from "./DriverSidebar";

export default function DriverDashboard() {
    const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* Sidebar */}
      <DriverSidebar active="dashboard" />

      {/* MAIN CONTENT */}
      <div className="flex-1 p-10">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Today's Route</h1>
            <p className="text-gray-500">AI-optimized delivery schedule</p>
          </div>

          <button className="px-5 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-medium">
            Start Navigation →
          </button>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          {/* Stops */}
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-gray-500">Today's Stops</p>
            <h2 className="text-4xl font-bold mt-2">12</h2>
            <p className="text-sm text-gray-400">(5 done)</p>
          </div>

          {/* ASR Deliveries */}
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-gray-500">ASR Deliveries</p>
            <h2 className="text-4xl font-bold mt-2">3</h2>
          </div>

          {/* Completion Time */}
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-gray-500">Est. Completion</p>
            <h2 className="text-4xl font-bold mt-2">4:30 PM</h2>
          </div>

        </div>

        {/* AI ROUTE OPTIMIZATION */}
        <div className="bg-white rounded-2xl shadow p-6 border border-teal-200 mb-10">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">AI Route Optimization</h2>
            <span className="px-3 py-1 bg-teal-100 text-teal-600 text-sm rounded-lg">
              Active
            </span>
          </div>

          <p className="text-gray-600 mb-4">
            Route has been optimized based on traffic, delivery windows, and ASR priorities.
            Estimated savings: <span className="font-semibold text-teal-600">23 minutes</span>
          </p>

          <div className="flex gap-4">
            <button className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200">
              View Changes
            </button>

            <button className="px-4 py-2 rounded-xl border border-red-300 text-red-500 hover:bg-red-50">
              Revert to Original
            </button>
          </div>
        </div>

        {/* DELIVERY STOPS LIST */}
        <h2 className="text-2xl font-bold mb-4">Delivery Stops</h2>

        <div className="space-y-4">

          {/* STOP #1 */}
          <div className="bg-white p-6 rounded-2xl shadow flex justify-between items-center">
            <div>
              <p className="text-lg font-semibold flex items-center gap-2">
                123 Oak Street
                <span className="px-2 py-1 text-xs bg-red-100 text-red-500 rounded-lg">Priority</span>
              </p>
              <p className="text-gray-500">John Smith</p>
            </div>

            <div className="text-right">
              <p className="text-gray-500">9:15 AM</p>
              <p className="text-green-600 text-sm font-semibold">● Done</p>
            </div>
          </div>

          {/* STOP #2 */}
          <div className="bg-white p-6 rounded-2xl shadow flex justify-between items-center">
            <div>
              <p className="text-lg font-semibold flex items-center gap-2">
                456 Maple Avenue
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-600 rounded-lg">ASR</span>
                <span className="px-2 py-1 text-xs bg-red-100 text-red-500 rounded-lg">Priority</span>
              </p>
              <p className="text-gray-500">Sarah Johnson</p>
            </div>

            <div className="text-right">
              <p className="text-gray-500">9:45 AM</p>
              <p className="text-green-600 text-sm font-semibold">● Done</p>
            </div>
          </div>

          {/* STOP #3 - CURRENT */}
          <div className="bg-teal-50 p-6 rounded-2xl shadow flex justify-between items-center border border-teal-300">
            <div>
              <p className="text-lg font-semibold">789 Pine Road</p>
              <p className="text-gray-600">Mike Wilson</p>
            </div>

            <div className="text-right">
              <p className="text-gray-600">10:15 AM</p>
              <p className="text-yellow-600 text-sm font-semibold">● Current</p>
            </div>

            <button className="ml-6 px-5 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl">
              Navigate →
            </button>
          </div>

          {/* STOP #4 */}
          <div className="bg-white p-6 rounded-2xl shadow flex justify-between items-center">
            <div>
              <p className="text-lg font-semibold flex items-center gap-2">
                321 Cedar Lane
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-600 rounded-lg">ASR</span>
                <span className="px-2 py-1 text-xs bg-red-100 text-red-500 rounded-lg">Priority</span>
              </p>
              <p className="text-gray-500">Emily Brown</p>
            </div>

            <button className="px-5 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl">
              Verify ID →
            </button>
          </div>

          {/* STOP #5 */}
          <div className="bg-white p-6 rounded-2xl shadow flex justify-between items-center">
            <div>
              <p className="text-lg font-semibold">654 Birch Street</p>
              <p className="text-gray-500">David Lee</p>
            </div>

            <button className="px-5 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl">
              Navigate →
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
