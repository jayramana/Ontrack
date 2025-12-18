import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Truck, LayoutDashboard, Package, Map, Bell, AlertTriangle, CheckCircle, User, LogOut } from "lucide-react";

export default function DriverSidebar({ active }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menu = [
    { label: "Dashboard", icon: <LayoutDashboard size={20} />, key: "dashboard", path: "/driver/dashboard" },
    { label: "My Deliveries", icon: <Package size={20} />, key: "deliveries", path: "/driver/deliveries" },
    { label: "Route Planner", icon: <Map size={20} />, key: "route", path: "/driver/route" },
    { label: "Geofence Alerts", icon: <Bell size={20} />, key: "geofence", path: "/driver/geofencealerts" },
    { label: "Report Issue", icon: <AlertTriangle size={20} />, key: "issues", path: "/driver/report-issue" },
    { label: "Confirm Delivery", icon: <CheckCircle size={20} />, key: "confirm", path: "/driver/confirm" },
    { label: "Profile", icon: <User size={20} />, key: "profile", path: "/driver/profile" },
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
        DRIVER PORTAL
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
