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
      time: "Dec 5, 10:15 PM"
    }
  ];

  return (
    <div className="min-h-screen flex bg-gray-100">
      <AdminSidebar active="queries" />

      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Customer Queries</h1>
            <p className="text-gray-500">Manage and respond to customer support tickets</p>
          </div>

  
        </div>

        {/* Controls */}
        <div className="flex gap-4 mb-6 items-center">
          <div className="bg-white rounded-xl p-2">
            <button className={`px-4 py-2 ${tab === "open" ? "bg-blue-600 text-white rounded" : "text-gray-600"}`} onClick={() => setTab("open")}>Open <span className="ml-2 inline-block bg-red-100 px-2 py-0.5 rounded text-xs text-red-600">1</span></button>
            <button className={`px-4 py-2 ${tab === "inprogress" ? "bg-yellow-200 text-gray-800 rounded" : "text-gray-600"}`} onClick={() => setTab("inprogress")}>In Progress <span className="ml-2 inline-block bg-yellow-50 px-2 py-0.5 rounded text-xs text-yellow-800">1</span></button>
            <button className={`px-4 py-2 ${tab === "resolved" ? "bg-gray-200 text-gray-800 rounded" : "text-gray-600"}`} onClick={() => setTab("resolved")}>Resolved</button>
          </div>

          <div className="ml-auto">
            <input className="border rounded-lg px-3 py-2" placeholder="Search queries..." />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-2 bg-white p-4 rounded-xl shadow">
            {queries.map(q => (
              <div key={q.id} className="border rounded-lg p-4 mb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xs text-gray-500">{q.priority} • {q.status}</div>
                    <div className="font-medium text-lg">{q.title}</div>
                    <div className="text-sm text-gray-500 mt-1">{q.customer} • {q.order}</div>
                  </div>
                  <div className="text-sm text-gray-400">{q.time}</div>
                </div>
              </div>
            ))}

            {queries.length === 0 && <p className="text-gray-500">No queries found.</p>}
          </div>

          {/* Details placeholder */}
          <div className="bg-white p-6 rounded-xl shadow flex items-center justify-center text-gray-400">
            Select a query to view details
          </div>
        </div>
      </div>
    </div>
  );
}
