import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomerSidebar from "./CustomerSidebar";
import api from "../../services/api";

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders/my-orders");
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    return (
      {
        PendingAssignment: "bg-[#f7e8d0] text-[#351c15]",
        AtOriginWarehouse: "bg-[#fff8e7] text-[#351c15]",
        Assigned: "bg-[#f9b400]/30 text-[#351c15]",
        InTransit: "bg-[#f9b400]/20 text-[#351c15]",
        OutForDelivery: "bg-[#f9b400]/20 text-[#351c15]",
        AtDestinationWarehouse: "bg-[#fff8e7] text-[#351c15]",
        Delivered: "bg-green-100 text-green-800",
        DeliveryAttempted: "bg-red-100 text-red-800",
      }[status] || "bg-gray-200 text-gray-700"
    );
  };

  const renderOrderCard = (o) => (
    <div
      key={o.id}
      className="bg-white border border-gray-200 rounded-xl p-6 mb-4 flex flex-col md:flex-row items-start md:items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/customer/orders/${o.id}`)}
    >
      {/* LEFT CONTENT */}
      <div className="flex-1 w-full md:w-auto">
        {/* Top Row: ID & Status */}
        <div className="flex items-center gap-3 mb-3">
          <span className="px-3 py-1 bg-[#fff8e7] text-[#351c15] text-xs font-bold rounded-full tracking-wide">
             {o.trackingId || `ORD-${o.id}`}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(o.status)}`}
          >
            {o.status}
          </span>
        </div>

        {/* Middle: Main Info */}
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          {o.receiverName} <span className="text-gray-400 mx-2">•</span> {o.receiverAddress}
        </h3>

        {/* Bottom: Meta Info */}
        <p className="text-xs text-gray-500 font-medium mt-1 mb-3">
           Booked: {new Date(o.createdAt).toLocaleDateString()} 
           <span className="ml-2 pl-2 border-l border-gray-300">
             To: {o.receiverAddress}
           </span>
        </p>

        {/* WAREHOUSE TRACKING TEXT - CLEAN */}
        <div className="text-xs text-gray-500 flex items-center gap-2 mt-2 bg-gray-50 w-fit px-3 py-1.5 rounded-lg border border-gray-100">
             <span className={!o.currentWarehouse && !o.destinationWarehouse ? "font-bold text-gray-700" : ""}>
                {o.originWarehouse?.name || 'Origin'}
             </span>
             <span className="text-gray-300">→</span>
             <span className={o.currentWarehouse ? "font-bold text-indigo-600 bg-indigo-50 px-1 rounded" : ""}>
                {o.currentWarehouse?.name || (o.status === "InTransit" ? "In Transit" : "Processing")}
             </span>
             <span className="text-gray-300">→</span>
             <span className={o.destinationWarehouse || o.status === "Delivered" ? "font-bold text-gray-700" : ""}>
                {o.destinationWarehouse?.name || 'Dest'}
             </span>
        </div>
      </div>

       {/* RIGHT ACTION */}
       <div className="mt-4 md:mt-0 flex flex-col items-end gap-2 w-full md:w-auto">
           <p className="text-xl font-bold text-[#351c15] mb-1">₹{o.price || '0'}</p>
           <button
             className="px-6 py-2 border border-[#351c15] text-[#351c15] font-bold rounded-lg hover:bg-[#351c15] hover:text-white transition text-sm w-full md:w-auto"
           >
             View Details
           </button>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#f8f9fa]">
      <CustomerSidebar active="orders" />

      <main className="flex-1 p-8 overflow-y-auto">
         <header className="mb-8 border-b border-gray-200 pb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-500 mt-1">Track and manage your shipments.</p>
         </header>

         {loading ? (
            <div className="text-center py-20 text-gray-500">Loading orders...</div>
         ) : orders.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                <p className="text-gray-500">No orders found.</p>
                <button className="mt-4 px-6 py-2 bg-[#351c15] text-white rounded-lg">Place New Order</button>
            </div>
         ) : (
            <div>
                {orders.map(renderOrderCard)}
            </div>
         )}
      </main>
    </div>
  );
}
