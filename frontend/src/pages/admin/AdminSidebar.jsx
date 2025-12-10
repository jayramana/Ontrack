import React from "react";
import { useNavigate } from "react-router-dom";

export default function AdminSidebar({ active }) {
  const navigate = useNavigate();

  const menu = [
    { label: "Dashboard", key: "dashboard", path: "/admin/dashboard" },
    { label: "Customer Queries", key: "queries", path: "/admin/queries" },
    { label: "Delivery Insights", key: "insights", path: "/admin/insights" }
  ];

  return (
    <div className="w-64 bg-[#0d1b2a] text-white p-6 flex flex-col min-h-screen">
      <div className="flex items-center gap-3 mb-10">
        <div className="bg-teal-400 p-2 rounded-lg"></div>
        <h1 className="text-xl font-bold">SmartDeliver</h1>
      </div>

      <p className="text-gray-400 text-sm mb-4">Admin Portal</p>

      <nav className="space-y-2 mb-6">
        {menu.map((item) => (
          <button
            key={item.key}
            onClick={() => navigate(item.path)}
            className={`w-full text-left p-3 rounded-lg transition 
              ${active === item.key ? "bg-white/10" : "hover:bg-white/10"}`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-gray-700 w-10 h-10 rounded-full flex items-center justify-center">S</div>
          <div>
            <div className="font-medium">Sarah Admin</div>
            <div className="text-xs text-gray-400">admin@demo.com</div>
          </div>
        </div>

        <button className="w-full text-left text-red-300 hover:text-red-400">
          Sign Out
        </button>
      </div>
    </div>
  );
}