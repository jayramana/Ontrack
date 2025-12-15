import React from "react";
import { useNavigate } from "react-router-dom";

export default function AdminSidebar({ active }) {
  const navigate = useNavigate();

  const menu = [
    { label: "Dashboard", key: "dashboard", path: "/admin/dashboard" },
    // { label: "Customer Queries", key: "queries", path: "/admin/queries" },
    // { label: "Delivery Insights", key: "insights", path: "/admin/insights" },
    { label: "Warehouse Management", key: "warehouses", path: "/admin/warehouses" },
    { label: "Live Map", key: "live-map", path: "/admin/live-map" },
  ];

  return (
    <div className="w-64 bg-[#351c15] text-white flex flex-col p-6 min-h-screen shadow-xl">

      {/* Logo */}
      <div className="flex items-center space-x-3 mb-10">
        <h1 className="text-xl font-extrabold tracking-wide text-[#f9b400]">
          OnTrack
        </h1>
      </div>

      <p className="text-gray-300 text-sm mb-4 tracking-wider">ADMIN PORTAL</p>

      {/* Menu */}
      <nav className="space-y-2">
        {menu.map((item) => {
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => navigate(item.path)}
              className={[
                "w-full text-left p-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2",
                isActive
                  ? "bg-[#6f4e37] text-[#f9b400]"
                  : "text-white hover:bg-[#6f4e37]/80 hover:text-[#f9b400]"
              ].join(" ")}
            >
              {/* Active left highlight bar */}
              <span
                className={[
                  "w-1.5 h-6 rounded-r-md mr-2",
                  isActive ? "bg-[#f9b400]" : "bg-transparent"
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
