import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function DriverSidebar({ active }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menu = [
    { label: "Dashboard", key: "dashboard", path: "/driver/dashboard" },
    { label: "My Deliveries", key: "deliveries", path: "/driver/deliveries" },
    { label: "Route Planner", key: "route", path: "/driver/route" },
    { label: "Geofence Alerts", key: "geofence", path: "/driver/geofencealerts" },
    { label: "Report Issue", key: "issues", path: "/driver/report-issue" },
    { label: "Confirm Delivery", key: "confirm", path: "/driver/confirm" },
    { label: "Profile", key: "profile", path: "/driver/profile" }
  ];

  return (
    <div className="w-64 bg-[#351c15] text-white flex flex-col p-6 min-h-screen shadow-xl">
      
      {/* Logo */}
      <div className="flex items-center space-x-3 mb-10">
        <h1 className="text-xl font-extrabold tracking-wide text-[#f9b400]">
          OnTrack
        </h1>
      </div>

      <p className="text-gray-300 text-sm mb-4 tracking-wider">DRIVER PORTAL</p>

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

      {/* Footer / Logout */}
      <div className="mt-auto pt-4 border-t border-[#6f4e37]/50">
        <button 
            onClick={logout}
            className="w-full text-left p-3 text-red-300 hover:text-red-400 hover:bg-[#6f4e37]/30 rounded-lg transition-colors font-medium flex items-center gap-2"
        >
            <span>Sign Out</span>
        </button>
      </div>

    </div>
  );
}
