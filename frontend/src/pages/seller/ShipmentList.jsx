import React, { useState } from "react";
import SellerSidebar from "./SellerSidebar";

export default function ShipmentList() {
  const [filter, setFilter] = useState("All");

  const shipments = [
    {
      id: "ORD-1011",
      receiver: "Lisa",
      destination: "Chennai",
      status: "Delivered",
      date: "Dec 20, 2024",
    },
    {
      id: "ORD-1012",
      receiver: "Jennie",
      destination: "Bangalore",
      status: "In Transit",
      date: "Dec 21, 2024",
    },
    {
      id: "ORD-1013",
      receiver: "Rose",
      destination: "Hyderabad",
      status: "Pending Pickup",
      date: "Dec 22, 2024",
    },
    {
      id: "ORD-1014",
      receiver: "Kiran",
      destination: "Mumbai",
      status: "Cancelled",
      date: "Dec 18, 2024",
    },
  ];

  const filteredShipments =
    filter === "All"
      ? shipments
      : shipments.filter((ship) => ship.status === filter);

  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* SIDEBAR */}
      <SellerSidebar active="shipments" />

      {/* MAIN CONTENT */}
      <div className="flex-1 p-10">

        {/* HEADER */}
        <h1 className="text-3xl font-bold mb-2">Shipments</h1>
        <p className="text-gray-500 mb-6">View and manage all your shipments</p>

        {/* FILTER BUTTONS */}
        <div className="flex gap-4 mb-8">
          {["All", "Pending Pickup", "In Transit", "Delivered", "Cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl border shadow-sm
                ${
                  filter === f
                    ? "bg-teal-500 text-white border-teal-500"
                    : "bg-white text-gray-700 hover:bg-gray-100"
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
              className="bg-white p-6 rounded-2xl shadow flex justify-between items-center"
            >
              {/* LEFT SIDE */}
              <div>
                <h2 className="font-semibold text-lg">{ship.id}</h2>
                <p className="text-gray-500 text-sm">
                  Receiver: {ship.receiver}
                </p>
                <p className="text-gray-500 text-sm">
                  Destination: {ship.destination}
                </p>
                <p className="text-gray-400 text-xs">Created on {ship.date}</p>
              </div>

              {/* RIGHT SIDE */}
              <div className="flex items-center gap-3">

                {/* STATUS */}
                <span
                  className={`px-3 py-1 rounded-lg text-sm
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

                {/* VIEW DETAILS BUTTON */}
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl">
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
