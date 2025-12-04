import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomerSidebar from "./CustomerSidebar";
export default function CustomerDashboard() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // TODO: Fetch orders from backend for the logged-in customer

    setOrders([
      {
        id: "DEL-2024-001",
        name: "Electronics Package",
        status: "In Transit",
        asr: true,
        time: "Today, 2:30 PM",
        stopsAway: 3,
      },
      {
        id: "DEL-2024-002",
        name: "Premium Wine Collection",
        status: "Out for Delivery",
        asr: true,
        time: "Today, 4:15 PM",
        stopsAway: 1,
      },
      {
        id: "DEL-2024-003",
        name: "Office Supplies",
        status: "Preparing",
        asr: false,
        time: "Tomorrow, 10:00 AM",
        stopsAway: null,
      },
    ]);
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* SIDEBAR */}
      <CustomerSidebar active="dashboard" />

      {/* MAIN CONTENT */}
      <div className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-2">My Deliveries</h1>
        <p className="text-gray-500 mb-8">
          Track and manage your incoming packages
        </p>

        {/* ======= STATS CARDS ======= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-600">Active Deliveries</p>
            <h2 className="text-3xl font-bold mt-2">{orders.length}</h2>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-600">Avg. ETA Accuracy</p>
            <div className="flex items-end space-x-2">
              <h2 className="text-3xl font-bold mt-2">98%</h2>
              <span className="bg-teal-100 text-teal-600 py-1 px-2 rounded-lg text-sm">
                AI
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-600">ASR Verified</p>
            <h2 className="text-3xl font-bold mt-2">12</h2>
          </div>
        </div>

        {/* ======= ACTIVE ORDERS ======= */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-bold mb-4">Active Orders</h2>

          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex justify-between items-center p-4 border rounded-xl"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-teal-50 p-3 rounded-lg">📦</div>

                  <div>
                    <h3 className="font-semibold flex items-center space-x-3">
                      <span>{order.name}</span>
                      {order.asr && (
                        <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-lg">
                          ASR Required
                        </span>
                      )}
                    </h3>

                    <p className="text-gray-500 text-sm">{order.id}</p>

                    <p className="text-gray-500 text-sm flex items-center space-x-2 mt-1">
                      <span>
                        {order.status === "Out for Delivery" && (
                          <span className="text-green-600">●</span>
                        )}
                        {order.status === "In Transit" && (
                          <span className="text-yellow-600">●</span>
                        )}
                        {order.status === "Preparing" && (
                          <span className="text-gray-500">●</span>
                        )}
                      </span>
                      <span>{order.status}</span>
                      <span>•</span>
                      <span>{order.time}</span>
                    </p>
                  </div>
                </div>

                {/* Right Section */}
                <div className="flex flex-col items-end">
                  {order.stopsAway !== null && (
                    <p className="text-gray-500 text-sm mb-2">
                      {order.stopsAway} stops away
                    </p>
                  )}

                  <button
                    onClick={() => navigate("/customer/tracking")}
                    className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg"
                  >
                    <span>Track</span>
                    <span>→</span>
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
