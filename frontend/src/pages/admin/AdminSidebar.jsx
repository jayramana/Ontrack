import React from "react";
import { useNavigate } from "react-router-dom";
import { Truck, LayoutDashboard, Warehouse, Map } from "lucide-react";

export default function AdminSidebar({ active }) {
  const navigate = useNavigate();

  const menu = [
    { label: "Dashboard", icon: <LayoutDashboard size={20} />, key: "dashboard", path: "/admin/dashboard" },
    { label: "Warehouse Management", icon: <Warehouse size={20} />, key: "warehouses", path: "/admin/warehouses" },
    { label: "Live Map", icon: <Map size={20} />, key: "live-map", path: "/admin/live-map" },
  ];

  return (
    <div className="
      group bg-[#351c15] text-white min-h-screen shadow-xl
      w-20 hover:w-64 transition-all duration-300
      flex flex-col p-4
    ">

      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 pl-2">
        <Truck size={28} className="text-[#f9b400]" />
        <h1 className="text-xl font-extrabold text-[#f9b400]
          opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
          OnTrack
        </h1>
      </div>

      <p className="text-gray-300 text-sm mb-4 tracking-wider
        opacity-0 group-hover:opacity-100 transition-opacity pl-2">
        ADMIN PORTAL
      </p>

      <nav className="space-y-2">
        {menu.map(item => {
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors
                ${isActive ? "bg-[#6f4e37] text-[#f9b400]" : "hover:bg-[#6f4e37]/80"}`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
