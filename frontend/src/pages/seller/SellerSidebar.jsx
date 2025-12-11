import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
// import { FiPackage, FiUser, FiPlusCircle, FiList, FiHome } from "";

export default function SellerSidebar({ active }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menu = [
    { label: "Dashboard", key: "dashboard", path: "/seller/dashboard", icon: <FiHome /> },
    { label: "Shipments", key: "shipments", path: "/seller/shipments", icon: <FiPackage /> },
    { label: "Create Shipment", key: "create", path: "/seller/create-shipment", icon: <FiPlusCircle /> },
    { label: "Orders", key: "orders", path: "/seller/senderorders", icon: <FiList /> },
    { label: "Place Order", key: "placeorder", path: "/seller/placeorder", icon: <FiPlusCircle /> },
    { label: "Profile", key: "profile", path: "/seller/sellerprofile", icon: <FiUser /> },
  ];

  return (
    <div className="w-64 bg-[#351c15] text-white min-h-screen flex flex-col p-6 shadow-xl">

      {/* LOGO */}
      <div className="flex items-center space-x-3 mb-10">
        <h1 className="text-xl font-extrabold tracking-wide text-[#f9b400]">
          OnTrack
        </h1>
      </div>

      <p className="text-gray-300 text-sm mb-4 tracking-wider">SELLER PORTAL</p>

      {/* MENU */}
      <nav className="space-y-2">
        {menu.map((item) => {
          const isActive = active === item.key;

          return (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              className={[
                "w-full flex items-center gap-3 p-3 rounded-lg font-medium transition-colors duration-200",
                isActive
                  ? "bg-[#6f4e37] text-[#f9b400]"
                  : "text-white hover:bg-[#6f4e37]/80 hover:text-[#f9b400]"
              ].join(" ")}
            >
              {/* Active Indicator Bar */}
              <span
                className={[
                  "w-1.5 h-6 rounded-r-md",
                  isActive ? "bg-[#f9b400]" : "bg-transparent"
                ].join(" ")}
              ></span>

              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>


    </div>
  );
}
