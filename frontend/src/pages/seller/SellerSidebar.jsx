import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Truck, LayoutDashboard, Package, PlusCircle, User, LogOut } from "lucide-react";

export default function SellerSidebar({ active }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menu = [
    { label: "Dashboard", icon: <LayoutDashboard size={20} />, key: "dashboard", path: "/seller/dashboard" },
    { label: "My Orders", icon: <Package size={20} />, key: "orders", path: "/sender/orders" },
    { label: "Create Shipment", icon: <PlusCircle size={20} />, key: "create", path: "/seller/create-shipment" },
    { label: "Profile", icon: <User size={20} />, key: "profile", path: "/seller/seller-profile" },
  ];

  return (
    <div className="group bg-[#351c15] text-white min-h-screen shadow-xl
      w-20 hover:w-64 transition-all duration-300 flex flex-col p-4">

      <div className="flex items-center gap-3 mb-10 pl-2">
        <Truck size={28} className="text-[#f9b400]" />
        <h1 className="text-xl font-extrabold text-[#f9b400]
          opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          OnTrack
        </h1>
      </div>

      <p className="text-gray-300 text-sm mb-4 opacity-0 group-hover:opacity-100 transition-opacity pl-2">
        SELLER PORTAL
      </p>

      <nav className="space-y-2">
        {menu.map(item => (
          <button
            key={item.key}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg
              ${active === item.key ? "bg-[#6f4e37] text-[#f9b400]" : "hover:bg-[#6f4e37]/80"}`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {item.label}
            </span>
          </button>
        ))}
      </nav>


    </div>
  );
}
