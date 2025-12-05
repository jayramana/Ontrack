import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomerSidebar from "./CustomerSidebar";
export default function CustomerTracking() {
  const [eta, setEta] = useState("20 min");
  const navigate = useNavigate();

  const routeProgress = [
    { location: "123 Oak Street", time: "1:45 PM", completed: true },
    { location: "456 Maple Avenue", time: "2:10 PM", completed: true },
    {
      location: "789 Pine Road",
      time: "2:35 PM",
      completed: false,
      inProgress: true,
    },
    { location: "Your Location", time: "2:55 PM", upcoming: true },
  ];

  const driverInfo = {
    name: "John Driver",
    vehicle: "Van #1247",
  };

  const aiInsights = {
    traffic: "Light traffic on route, ETA is accurate.",
    weather: "Clear conditions, no delays expected.",
  };

  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* REUSABLE SIDEBAR */}
      <CustomerSidebar active="tracking" />

      {/* RIGHT CONTENT */}
      <div className="flex-1 p-10">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-1">Live Tracking</h1>
            <div className="text-teal-500 bg-teal-50 inline-block px-3 py-1 rounded-xl text-sm mb-2">
              ⚡ AI Powered
            </div>
            <p className="text-gray-500">Real-time delivery location and ETA</p>
          </div>

          <button className="border px-4 py-2 rounded-xl hover:bg-gray-50 text-gray-700">
            🔄 Recalculate ETA
          </button>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">

          {/* LEFT: MAP + ETA + DRIVER */}
          <div className="lg:col-span-2">

            {/* ETA CARD */}
            <div className="bg-white p-4 rounded-xl shadow inline-block mb-4">
              <p className="text-gray-500 text-sm">Dynamic ETA</p>
              <div className="flex items-center space-x-2">
                <h2 className="text-3xl font-bold">{eta}</h2>
                <span className="bg-teal-100 text-teal-600 px-2 py-1 text-sm rounded-lg">
                  ⚡ AI
                </span>
              </div>
            </div>

            {/* MAP */}
            <div className="bg-white h-[380px] rounded-2xl shadow flex flex-col items-center justify-center">
              <div className="text-teal-500 text-5xl mb-4">📍</div>
              <p className="text-gray-600">Live map view would render here</p>
              <p className="text-gray-400 text-sm">(Mapbox / Google Maps integration)</p>
            </div>

            {/* DRIVER CARD */}
            <div className="bg-white mt-4 p-5 rounded-2xl shadow flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gray-200 h-12 w-12 flex items-center justify-center rounded-full font-bold">
                  JD
                </div>
                <div>
                  <h3 className="font-semibold">{driverInfo.name}</h3>
                  <p className="text-gray-500 text-sm">
                    Vehicle: {driverInfo.vehicle}
                  </p>
                </div>
              </div>

              <button className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-xl flex items-center space-x-2">
                <span>✉️</span>
                <span>Contact</span>
              </button>
            </div>
          </div>

          {/* RIGHT: ROUTE PROGRESS + AI INSIGHTS */}
          <div>
            <div className="bg-white p-6 rounded-2xl shadow mb-6">
              <div className="flex justify-between mb-4">
                <h2 className="font-bold text-lg">Route Progress</h2>
                <p className="text-gray-500 text-sm">1 stop remaining</p>
              </div>

              {/* TIMELINE */}
              <div className="space-y-6 relative ml-4">
                <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-300"></div>

                {routeProgress.map((stop, i) => (
                  <div key={i} className="relative flex items-start space-x-3">

                    {/* Dot */}
                    <div className="relative z-10 mt-1">
                      {stop.completed && (
                        <div className="h-3 w-3 rounded-full bg-green-600"></div>
                      )}
                      {stop.inProgress && (
                        <div className="h-3 w-3 rounded-full bg-teal-500"></div>
                      )}
                      {stop.upcoming && (
                        <div className="h-3 w-3 rounded-full bg-gray-400"></div>
                      )}
                    </div>

                    {/* Details */}
                    <div>
                      <h3 className="font-semibold">{stop.location}</h3>
                      <p className="text-gray-500 text-sm">{stop.time}</p>

                      {stop.inProgress && (
                        <span className="bg-teal-100 text-teal-600 text-xs px-2 py-1 rounded-lg">
                          In Progress
                        </span>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* AI INSIGHTS */}
            <div className="bg-white p-6 rounded-2xl shadow">
              <h2 className="font-bold text-lg mb-2">⚡ AI Insights</h2>

              <p className="text-gray-700">
                <strong>Traffic Analysis:</strong> {aiInsights.traffic}
              </p>

              <p className="text-gray-700 mt-2">
                <strong>Weather:</strong> {aiInsights.weather}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
