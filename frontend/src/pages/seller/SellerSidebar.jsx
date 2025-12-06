import React from "react";
import { useNavigate } from "react-router-dom";

export default function SellerSidebar({ active }) {
  const navigate = useNavigate();

  const menu = [
    { label: "Dashboard", key: "dashboard", path: "/seller/dashboard" },
    { label: "Shipments", key: "shipments", path: "/seller/shipments" },
    { label: "Create Shipment", key: "create", path: "/seller/create-shipment" },
    { label: "Profile", key: "profile", path: "/seller/sellerprofile" },
  ];

  return (
    <div className="w-64 bg-[#0d1b2a] text-white min-h-screen flex flex-col p-6">

      {/* Logo */}
      <div className="flex items-center space-x-3 mb-10">
        <div className="bg-teal-400 p-2 rounded-lg"></div>
        <h1 className="text-xl font-bold">DeliverAI Seller</h1>
      </div>

      <p className="text-gray-400 text-sm mb-4">SELLER PORTAL</p>

      {/* Menu Items */}
      <nav className="space-y-3">
        {menu.map((item) => (
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

      <button className="mt-auto text-left text-red-300 hover:text-red-400">
        Sign Out
      </button>
    </div>
  );
}
