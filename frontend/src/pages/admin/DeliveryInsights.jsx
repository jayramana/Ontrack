import React from "react";
import AdminSidebar from "./AdminSidebar";

export default function DeliveryInsights() {
  return (
    <div className="min-h-screen flex bg-[#f8f4ef]">
      {/* Sidebar */}
      <AdminSidebar active="insights" />

      {/* MAIN AREA */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#351c15]">Delivery Insights</h1>
            <p className="text-[#6b4f3a]">
              Analytics and performance metrics for your delivery operations
            </p>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow border border-[#e6d8c9]">
            <div className="text-sm text-[#6b4f3a]">Total Deliveries</div>
            <div className="text-2xl font-bold text-[#351c15]">1,247</div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow border border-[#e6d8c9]">
            <div className="text-sm text-[#6b4f3a]">Success Rate</div>
            <div className="text-2xl font-bold text-green-700">
              87.3%{" "}
              <span className="text-sm text-green-600 font-semibold">+2.5%</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow border border-[#e6d8c9]">
            <div className="text-sm text-[#6b4f3a]">Avg Delivery Time</div>
            <div className="text-2xl font-bold text-[#351c15]">42 min</div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow border border-[#e6d8c9]">
            <div className="text-sm text-[#6b4f3a]">ASR Deliveries</div>
            <div className="text-2xl font-bold text-[#351c15]">312</div>
          </div>
        </div>

        {/* CHARTS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* Bar Chart Placeholder */}
          <div className="bg-white p-6 rounded-xl shadow border border-[#e6d8c9]">
            <h3 className="text-lg font-semibold text-[#351c15] mb-3">
              Weekly Delivery Performance
            </h3>
            <div className="h-56 bg-[#f8f4ef] border border-[#e6d8c9] rounded-lg flex items-center justify-center text-[#6b4f3a]">
              Bar chart placeholder
            </div>
          </div>

          {/* Pie Chart Placeholder */}
          <div className="bg-white p-6 rounded-xl shadow border border-[#e6d8c9]">
            <h3 className="text-lg font-semibold text-[#351c15] mb-3">
              Delivery Outcomes
            </h3>
            <div className="h-56 bg-[#f8f4ef] border border-[#e6d8c9] rounded-lg flex items-center justify-center text-[#6b4f3a]">
              Pie chart placeholder
            </div>
          </div>
        </div>

        {/* FAILURE REASONS */}
        <div className="bg-white p-6 rounded-xl shadow border border-[#e6d8c9]">
          <h3 className="text-lg font-semibold text-[#351c15] mb-4">
            ⚠ Common Failure Reasons
          </h3>

          <div className="space-y-4">
            {[
              { label: "Customer not available", count: 67, pct: "42.4%" },
              { label: "Wrong address", count: 34, pct: "21.5%" },
              { label: "Access issues", count: 28, pct: "17.7%" },
              { label: "Weather delays", count: 19, pct: "12.0%" },
              { label: "Vehicle issues", count: 10, pct: "6.3%" },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between">
                <div className="w-2/3">
                  <div className="text-sm font-medium text-[#351c15]">{r.label}</div>
                  <div className="w-full bg-[#f0e6d8] h-2 rounded mt-2">
                    <div
                      className="bg-red-500 h-2 rounded"
                      style={{
                        width: `${Math.min(100, (r.count / 80) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="text-sm text-[#6b4f3a] font-medium">
                  {r.count} ({r.pct})
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
