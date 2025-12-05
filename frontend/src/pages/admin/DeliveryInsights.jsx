import React from "react";
import AdminSidebar from "./AdminSidebar";

export default function DeliveryInsights() {
  // static placeholders
  return (
    <div className="min-h-screen flex bg-gray-100">
      <AdminSidebar active="insights" />

      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Delivery Insights</h1>
            <p className="text-gray-500">Analytics and performance metrics for your delivery operations</p>
          </div>

        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow">
            <div className="text-sm text-gray-500">Total Deliveries</div>
            <div className="text-2xl font-bold">1,247</div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <div className="text-sm text-gray-500">Success Rate</div>
            <div className="text-2xl font-bold text-green-600">87.3% <span className="text-sm text-green-500">+2.5%</span></div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <div className="text-sm text-gray-500">Avg Time</div>
            <div className="text-2xl font-bold">42 min</div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <div className="text-sm text-gray-500">ASR Deliveries</div>
            <div className="text-2xl font-bold">312</div>
          </div>
        </div>

        {/* Charts placeholder row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-3">Weekly Delivery Performance</h3>
            <div className="h-56 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">Bar chart placeholder</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-3">Delivery Outcomes</h3>
            <div className="h-56 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">Pie chart placeholder</div>
          </div>
        </div>

        {/* Failure reasons */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-3">⚠ Common Failure Reasons</h3>

          <div className="space-y-3">
            {[
              { label: "Customer not available", count: 67, pct: "42.4%" },
              { label: "Wrong address", count: 34, pct: "21.5%" },
              { label: "Access issues", count: 28, pct: "17.7%" },
              { label: "Weather delays", count: 19, pct: "12.0%" },
              { label: "Vehicle issues", count: 10, pct: "6.3%" }
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between">
                <div className="w-2/3">
                  <div className="text-sm">{r.label}</div>
                  <div className="w-full bg-gray-100 h-2 rounded mt-2">
                    <div className="bg-red-400 h-2 rounded" style={{ width: `${Math.min(100, (r.count / 80) * 100)}%` }} />
                  </div>
                </div>

                <div className="text-sm text-gray-500">{r.count} ({r.pct})</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
