import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Truck, LayoutDashboard, Package, Map, Bell, AlertTriangle, CheckCircle, User, LogOut, Menu, X } from "lucide-react";
import NotificationBell from "../../components/NotificationBell";

export default function DriverSidebar({ active }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const menu = [
    { label: "Dashboard", icon: <LayoutDashboard size={20} />, key: "dashboard", path: "/driver/dashboard" },
    { label: "My Deliveries", icon: <Package size={20} />, key: "deliveries", path: "/driver/deliveries" },
    { label: "Route Planner", icon: <Map size={20} />, key: "route", path: "/driver/route" },
    { label: "Geofence Alerts", icon: <Bell size={20} />, key: "geofence", path: "/driver/geofencealerts" },
    { label: "Report Issue", icon: <AlertTriangle size={20} />, key: "issues", path: "/driver/report-issue" },
    { label: "Profile", icon: <User size={20} />, key: "profile", path: "/driver/profile" },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 bg-[#0b0f14] border border-white/10 rounded-lg text-slate-100 md:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-[#0b0f14] text-slate-100 shadow-xl border-r border-white/10
          transition-transform duration-300 transform md:translate-x-0 md:static md:w-20 md:hover:w-64
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          flex flex-col p-4 shrink-0 group
        `}
      >
        <div className="flex items-center gap-3 mb-10 pl-2">
          <Truck size={28} className="text-[#f59e0b] shrink-0" />
          <h1
            className="text-xl font-extrabold text-[#f59e0b]
            md:opacity-0 md:group-hover:opacity-100 transition-opacity whitespace-nowrap
            opacity-100"
          >
            OnTrack
          </h1>
        </div>

        <p
          className="text-slate-400 text-sm mb-4 md:opacity-0 md:group-hover:opacity-100 transition-opacity pl-2 opacity-100"
        >
          DRIVER PORTAL
        </p>

        <nav className="space-y-2">
          {menu.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                navigate(item.path);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors
                ${active === item.key
                  ? "bg-white/10 text-[#f59e0b]"
                  : "hover:bg-white/10 text-slate-300"
                }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span
                className="md:opacity-0 md:group-hover:opacity-100 transition-opacity whitespace-nowrap opacity-100"
              >
                {item.label}
              </span>
            </button>
          ))}

          <div className="pt-2 border-t border-white/5 mt-2">
            <NotificationBell showLabel={isOpen} />
          </div>
        </nav>
      </div>
    </>
  );
}

