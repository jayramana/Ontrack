import React from "react";
import { useNavigate } from "react-router-dom";
import { Truck, LayoutDashboard, Package, MapPin, Bell, Clock, User } from "lucide-react";

export default function CustomerSidebar({ active }) {
  const navigate = useNavigate();

  const menu = [
    { label: "Dashboard", icon: <LayoutDashboard size={20} />, key: "dashboard", path: "/customer/dashboard" },
    { label: "My Orders", icon: <Package size={20} />, key: "orders", path: "/customer/orders" },
    { label: "Track Package", icon: <MapPin size={20} />, key: "track", path: "/tracking" },
    { label: "Geofence Alerts", icon: <Bell size={20} />, key: "alerts", path: "/customer/geofencealerts" },
    { label: "Availability", icon: <Clock size={20} />, key: "availability", path: "/customer/availability" },
    { label: "Profile", icon: <User size={20} />, key: "profile", path: "/customer/profile" },
  ];

  return (
    <div
      className="sticky top-0 h-screen group bg-[#0b0f14] text-slate-100 shadow-xl
      w-20 hover:w-64 transition-all duration-300 flex flex-col p-4 border-r border-white/10 shrink-0"
    >
      <div className="flex items-center gap-3 mb-10 pl-2">
        <Truck size={28} className="text-[#f59e0b]" />
        <h1
          className="text-xl font-extrabold text-[#f59e0b]
          opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
        >
          OnTrack
        </h1>
      </div>

      <p
        className="text-slate-400 text-sm mb-4 opacity-0 group-hover:opacity-100 transition-opacity pl-2"
      >
        CUSTOMER PORTAL
      </p>

      <nav className="space-y-2">
        {menu.map((item) => (
          <button
            key={item.key}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors
              ${
                active === item.key
                  ? "bg-white/10 text-[#f59e0b]"
                  : "hover:bg-white/10 text-slate-300"
              }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span
              className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
            >
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
