//used in all customer the pages as sidebar 
import React from "react";
import { useNavigate } from "react-router-dom";

export default function CustomerSidebar({ active }) {
  const navigate = useNavigate();

  const menuItems = [
    { label: "Dashboard", path: "/customer/customerdashboard", key: "dashboard" },
    { label: "Live Tracking", path: "/customer/tracking", key: "tracking" },
    { label: "Geofence Alerts", path: "/customer/geofencealerts", key: "alerts" },
    { label: "ID Verification", path: "/customer/idverification", key: "id" },
    { label: "Delivery Confirm", path: "/customer/deliveryconfirm", key: "confirm" },
  ];

  return (
    <div className="w-64 bg-[#0d1b2a] text-white flex flex-col p-6 min-h-screen">
      
      {/* Logo */}
      <div className="flex items-center space-x-3 mb-10">
        <div className="bg-teal-400 p-2 rounded-lg"></div>
        <h1 className="text-xl font-bold">DeliverAI</h1>
      </div>

      <p className="text-gray-400 text-sm mb-4">CUSTOMER PORTAL</p>

      {/* Menu */}
      <nav className="space-y-3">
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => navigate(item.path)}
            className={`w-full text-left p-3 rounded-lg transition
              ${
                active === item.key
                  ? "bg-white/10 text-white"
                  : "hover:bg-white/10 text-gray-300"
              }
            `}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <button className="mt-auto text-left text-red-300 hover:text-red-400">
        Sign Out
      </button>
    </div>
  );
}
