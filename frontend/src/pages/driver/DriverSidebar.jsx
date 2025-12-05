import React from "react";
import { useNavigate } from "react-router-dom";

export default function DriverSidebar({ active }) {
  const navigate = useNavigate();

  const menu = [
    { label: "Dashboard", key: "dashboard", path: "/driver/dashboard" },
    { label: "Route Optimization", key: "route", path: "/driver/route" },
    { label: "Report Issues", key: "issues", path: "/driver/issues" },
    { label: "Confirm Delivery", key: "confirm", path: "/driver/confirm" }
  ];

  return (
    <div className="w-64 bg-[#0d1b2a] text-white p-6 flex flex-col min-h-screen">
      
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className="bg-teal-400 p-2 rounded-lg"></div>
        <h1 className="text-xl font-bold">DeliverAI</h1>
      </div>

      <p className="text-gray-400 text-sm mb-4">DRIVER PORTAL</p>

      {/* Menu */}
      <nav className="space-y-2">
        {menu.map((item) => (
          <button
            key={item.key}
            onClick={() => navigate(item.path)}
            className={`w-full text-left p-3 rounded-lg transition 
              ${active === item.key ? "bg-white/10" : "hover:bg-white/10"}
            `}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <button className="mt-auto pt-10 text-red-300 hover:text-red-400 text-left">
        Sign Out
      </button>
    </div>
  );
}
