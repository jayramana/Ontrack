// src/components/CustomerSidebar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function CustomerSidebar({ active }) {
  const navigate = useNavigate();

  const menuItems = [
    { label: "Dashboard", path: "/customer/dashboard", key: "dashboard" },
    { label: "Live Tracking", path: "/customer/tracking", key: "tracking" },
    { label: "Geofence Alerts", path: "/customer/geofencealerts", key: "alerts" },
    { label: "ID Verification", path: "/customer/idverification", key: "id" },
    { label: "Delivery Confirm", path: "/customer/deliveryconfirm", key: "confirm" },
    { label: "Set Availability", path: "/customer/availability", key: "availability" },
    { label: "Profile", path: "/customer/profile", key: "profile" },
  ];

  return (
    <div className="w-64 bg-[#351c15] text-white flex flex-col p-6 min-h-screen shadow-xl">
      {/* Logo */}
      <div className="flex items-center space-x-3 mb-10">
        <h1 className="text-xl font-extrabold tracking-wide text-[#f9b400]">
          OnTrack
        </h1>
      </div>

      <p className="text-gray-300 text-sm mb-4 tracking-wider">CUSTOMER PORTAL</p>

      {/* Menu */}
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => navigate(item.path)}
              className={[
                "w-full text-left p-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2",
                // active styles
                isActive
                  ? "bg-[#6f4e37] text-[#f9b400]"
                  // hover styles when NOT active
                  : "text-white hover:bg-[#6f4e37]/80 hover:text-[#f9b400]"
              ].join(" ")}
            >
              {/* optional left indicator for active */}
              <span
                className={[
                  "w-1.5 h-6 rounded-r-md mr-2",
                  isActive ? "bg-[#f9b400] block" : "bg-transparent"
                ].join(" ")}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>


    </div>
  );
}
