import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";

export default function CustomerQueries() {
  const [tab, setTab] = useState("open");

  const queries = [
    {
      id: "Q-001",
      title: "Delivery time question",
      customer: "John Customer",
      order: "DEL-2024-001",
      priority: "Medium",
      status: "Open",
      time: "Dec 5, 10:15 PM",
    },
  ];

  return (
    <div className="min-h-screen flex bg-[#f8f4ef]">
      {/* Sidebar */}
      <AdminSidebar active="queries" />

      {/* Main Section */}
      <div className="flex-1 px-8 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#351c15]">Customer Queries</h1>
            <p className="text-[#6b4f3a]">
              Manage and respond to customer support tickets
            </p>
          </div>
        </div>

        {/* Tabs + Search */}
        <div className="flex gap-4 mb-8 items-center">
          <div className="bg-white rounded-xl p-2 shadow border border-[#e6d8c9]">
            <button
              className={`px-4 py-2 font-medium transition ${
                tab === "open"
                  ? "bg-[#ffb500] text-[#351c15] rounded"
                  : "text-[#6b4f3a] hover:text-[#351c15]"
              }`}
              onClick={() => setTab("open")}
            >
              Open{" "}
              <span className="ml-2 inline-block bg-red-100 px-2 py-0.5 rounded text-xs text-red-700">
                1
              </span>
            </button>

            <button
              className={`px-4 py-2 font-medium transition ${
                tab === "inprogress"
                  ? "bg-[#fff4d0] text-[#351c15] rounded"
                  : "text-[#6b4f3a] hover:text-[#351c15]"
              }`}
              onClick={() => setTab("inprogress")}
            >
              In Progress{" "}
              <span className="ml-2 inline-block bg-yellow-50 px-2 py-0.5 rounded text-xs text-yellow-700">
                1
              </span>
            </button>

            <button
              className={`px-4 py-2 font-medium transition ${
                tab === "resolved"
                  ? "bg-gray-200 text-[#351c15] rounded"
                  : "text-[#6b4f3a] hover:text-[#351c15]"
              }`}
              onClick={() => setTab("resolved")}
            >
              Resolved
            </button>
          </div>

          {/* Search Bar */}
          <div className="ml-auto">
            <input
              className="border border-[#d4c7b9] rounded-lg px-3 py-2 bg-white text-[#351c15] focus:ring-2 focus:ring-[#ffb500] outline-none"
              placeholder="Search queries..."
            />
          </div>
        </div>

        {/* Layout: Query List + Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Queries List */}
          <div className="lg:col-span-2 bg-white p-4 rounded-xl shadow border border-[#e6d8c9]">
            {queries.map((q) => (
              <div
                key={q.id}
                className="border border-[#e6d8c9] rounded-lg p-4 mb-3 hover:bg-[#fdf7ed] transition cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xs text-[#6b4f3a]">
                      {q.priority} • {q.status}
                    </div>

                    <div className="font-semibold text-lg text-[#351c15]">
                      {q.title}
                    </div>

                    <div className="text-sm text-[#6b4f3a] mt-1">
                      {q.customer} • {q.order}
                    </div>
                  </div>

                  <div className="text-sm text-[#6b4f3a]">{q.time}</div>
                </div>
              </div>
            ))}

            {queries.length === 0 && (
              <p className="text-[#6b4f3a]">No queries found.</p>
            )}
          </div>

          {/* Right-side placeholder */}
          <div className="bg-white p-6 rounded-xl shadow border border-[#e6d8c9] flex items-center justify-center text-[#6b4f3a]">
            Select a query to view details
          </div>
        </div>
      </div>
    </div>
  );
}
