import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Truck, LayoutDashboard, Package, MapPin, Bell, User, Menu, X } from "lucide-react";
import NotificationBell from "../../components/NotificationBell";

export default function CustomerSidebar({ active }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const menu = [
    { label: "Dashboard", icon: <LayoutDashboard size={20} />, key: "dashboard", path: "/customer/dashboard" },
    { label: "My Orders", icon: <Package size={20} />, key: "orders", path: "/customer/orders" },
    { label: "Track Package", icon: <MapPin size={20} />, key: "track", path: "/tracking" },
    { label: "Geofence Alerts", icon: <Bell size={20} />, key: "alerts", path: "/customer/geofencealerts" },
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
          fixed inset-y-0 left-0 z-40 bg-[#0b0f14] text-slate-100 shadow-xl border-r border-white/10
          transition-all duration-300 ease-in-out md:translate-x-0 md:static
          ${isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64 md:w-20 md:hover:w-64"}
          overflow-hidden flex flex-col p-4 shrink-0 group
        `}
      >
        <div className="flex items-center gap-3 mb-10 pl-2">
          <Truck size={28} className="text-[#f59e0b] shrink-0" />
          <h1
            className="text-xl font-extrabold text-[#f59e0b]
            md:opacity-0 md:group-hover:opacity-100 transition-opacity whitespace-nowrap
            basis-auto opacity-100"
          >
            OnTrack
          </h1>
        </div>

        <p
          className="text-slate-400 text-sm mb-4 md:opacity-0 md:group-hover:opacity-100 transition-opacity pl-2 opacity-100"
        >
          CUSTOMER PORTAL
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

          <div className="pt-2 mt-2">
            <NotificationBell showLabel={isOpen} active={active === "notifications"} navigationPath="/customer/notifications" />
          </div>

          <button
            onClick={() => {
              navigate("/customer/profile");
              setIsOpen(false);
            }}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors
              ${active === "profile"
                ? "bg-white/10 text-[#f59e0b]"
                : "hover:bg-white/10 text-slate-300"
              }`}
          >
            <span className="text-lg"><User size={20} /></span>
            <span
              className="md:opacity-0 md:group-hover:opacity-100 transition-opacity whitespace-nowrap opacity-100"
            >
              Profile
            </span>
          </button>
        </nav>
      </div>
    </>
  );
}

