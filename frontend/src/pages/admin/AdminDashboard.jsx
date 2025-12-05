import React from "react";
import AdminSidebar from "./AdminSidebar";

export default function AdminDashboard() {
  // static summary numbers (replace with real data later)
  const stats = {
    activeDeliveries: 3,
    failed: 1,
    activeASR: 2,
    openQueries: 2,
    successRate: "87.3%",
    avgTime: "42 min",
    total: "1,247",
  };

  const liveDeliveries = [
    { id: "DEL-2024-001", address: "123 Main St, New York, NY 10001", tag: "ASR", status: "Out for Delivery" },
    { id: "DEL-2024-002", address: "456 Oak Ave, Brooklyn, NY 11201", tag: "", status: "Pending" },
    { id: "DEL-2024-005", address: "555 Broadway, New York, NY 10012", tag: "ASR", status: "Out for Delivery" }
  ];

  const failed = [
    { id: "DEL-2024-004", name: "Jane Smith", label: "Attempted" }
  ];

  return (
    <div className="min-h-screen flex bg-gray-100">
      <AdminSidebar active="dashboard" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">🚚</div>
            <div>
              <div className="text-2xl font-bold">{stats.activeDeliveries}</div>
              <div className="text-sm text-gray-500">Active Deliveries</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow flex items-center gap-4">
            <div className="bg-red-50 p-3 rounded-lg">❌</div>
            <div>
              <div className="text-2xl font-bold">{stats.failed}</div>
              <div className="text-sm text-gray-500">Failed/Attempted</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow flex items-center gap-4">
            <div className="bg-yellow-50 p-3 rounded-lg">🛡️</div>
            <div>
              <div className="text-2xl font-bold">{stats.activeASR}</div>
              <div className="text-sm text-gray-500">Active ASR</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow flex items-center gap-4">
            <div className="bg-teal-50 p-3 rounded-lg">💬</div>
            <div>
              <div className="text-2xl font-bold">{stats.openQueries}</div>
              <div className="text-sm text-gray-500">Open Queries</div>
            </div>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 p-6 rounded-xl shadow">
            <div className="text-sm">Success Rate</div>
            <div className="text-3xl font-bold text-green-600">{stats.successRate}</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <div className="text-sm">Avg Delivery Time</div>
            <div className="text-3xl font-bold">{stats.avgTime}</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <div className="text-sm">Total Deliveries</div>
            <div className="text-3xl font-bold">{stats.total}</div>
          </div>
        </div>

        {/* Live / Failed panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Live */}
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">📦 Live Delivery Overview</h2>
              <div className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">3 Active</div>
            </div>

            <div className="space-y-3">
              {liveDeliveries.map((d) => (
                <div key={d.id} className="border rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <div className="text-xs text-gray-500">{d.id} {d.tag && <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">{d.tag}</span>}</div>
                    <div className="font-medium">{d.address}</div>
                  </div>
                  <div className="text-sm text-gray-500">{d.status && <span className="inline-block bg-blue-50 px-3 py-1 rounded text-blue-600 text-xs">{d.status}</span>}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Failed */}
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">❗ Failed Deliveries</h2>
              <div className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded">1 Issues</div>
            </div>

            <div className="space-y-3">
              {failed.map((f) => (
                <div key={f.id} className="bg-red-50 border border-red-100 rounded-lg p-3">
                  <div className="text-sm text-gray-600">{f.id}</div>
                  <div className="font-medium">{f.name}</div>
                  <div className="text-xs text-yellow-600 inline-block mt-2 bg-yellow-50 px-3 py-1 rounded">{f.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex gap-4">
          <button className="px-4 py-3 bg-blue-900 text-white rounded-lg">View Customer Queries</button>
          <button className="px-4 py-3 bg-white border rounded-lg">View Analytics</button>
          <button className="px-4 py-3 bg-white border rounded-lg">View Workflow</button>
        </div>
      </div>
    </div>
  );
}
