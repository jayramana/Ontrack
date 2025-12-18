import React, { useState } from "react";
import SellerSidebar from "./SellerSidebar";

export default function ShipmentList() {
  const [filter, setFilter] = useState("All");

  const shipments = [
    { id: "ORD-1011", receiver: "Lisa", destination: "Chennai", status: "Delivered", date: "Dec 20, 2024" },
    { id: "ORD-1012", receiver: "Jennie", destination: "Bangalore", status: "In Transit", date: "Dec 21, 2024" },
    { id: "ORD-1013", receiver: "Rose", destination: "Hyderabad", status: "Pending Pickup", date: "Dec 22, 2024" },
    { id: "ORD-1014", receiver: "Kiran", destination: "Mumbai", status: "Cancelled", date: "Dec 18, 2024" },
  ];

  const filteredShipments =
    filter === "All" ? shipments : shipments.filter((ship) => ship.status === filter);

  return (
    <div className="min-h-screen flex bg-[#f8f4ef]">

      {/* SIDEBAR */}
      <SellerSidebar active="shipments" />

      {/* MAIN AREA */}
      <div className="flex-1 px-10 py-8 transition-all duration-300">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#351c15]">Shipments</h1>
          <p className="text-[#6b4f3a]">View and manage all your shipments</p>
        </div>

        {/* FILTER BUTTONS */}
        <div className="flex gap-4 mb-8">
          {["All", "Pending Pickup", "In Transit", "Delivered", "Cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg border text-sm font-semibold transition shadow-sm
                ${
                  filter === f
                    ? "bg-[#ffb500] text-[#351c15] border-[#ffb500]"
                    : "bg-white text-[#351c15] border-[#e6d8c9] hover:bg-[#fff5da]"
                }
              `}
            >
              {f}
            </button>
          ))}
        </div>

        {/* SHIPMENT LIST */}
        <div className="space-y-4">
          {filteredShipments.map((ship) => (
            <div
              key={ship.id}
              className="bg-white p-6 rounded-xl shadow border border-[#e6d8c9] hover:bg-[#fdf7ed] transition flex justify-between items-center"
            >
              {/* LEFT INFO */}
              <div>
                <h2 className="text-lg font-bold text-[#351c15]">{ship.id}</h2>
                <p className="text-sm text-[#4e2a1f]">Receiver: {ship.receiver}</p>
                <p className="text-sm text-[#4e2a1f]">Destination: {ship.destination}</p>
                <p className="text-xs text-[#6b4f3a] mt-1">Created on {ship.date}</p>
              </div>

              {/* RIGHT SIDE */}
              <div className="flex items-center gap-4">

                {/* STATUS BADGE */}
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full
                    ${
                      ship.status === "Delivered"
                        ? "bg-green-100 text-green-700"
                        : ship.status === "In Transit"
                        ? "bg-blue-100 text-blue-700"
                        : ship.status === "Pending Pickup"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }
                  `}
                >
                  {ship.status}
                </span>

                {/* VIEW BUTTON */}
                <button className="px-4 py-2 border border-[#d4c7b9] rounded-lg text-[#351c15] font-medium hover:bg-[#f8f1e7]">
                  View →
                </button>

              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
