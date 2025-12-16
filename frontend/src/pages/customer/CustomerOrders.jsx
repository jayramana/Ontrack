import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomerSidebar from "./CustomerSidebar";
import api, { API_BASE_URL } from "../../services/api";
import * as signalR from "@microsoft/signalr";
import { useAuth } from "../../context/AuthContext";
import CustomerASRUpload from "./CustomerASRUpload";

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showASRUploadModal, setShowASRUploadModal] = useState(false);
  const [selectedASROrderId, setSelectedASROrderId] = useState(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(API_BASE_URL.replace("/api", "/hubs/logistics"), {
        accessTokenFactory: () => localStorage.getItem("token") || "",
      })
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => {
        if (user?.userId) {
          connection.invoke("JoinCustomerGroup", Number(user.userId));
        }
      })
      .catch((err) => console.error("SignalR Connection Error: ", err));

    connection.on("ASRVerificationRequested", (data) => {
        setSelectedASROrderId(data.orderId);
        setShowASRUploadModal(true);
    });

    connection.on("ASRVerificationCompleted", () => {
        fetchOrders();
    });

    return () => {
      connection.stop();
    };
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders/my-orders");
      const sortedOrders = (response.data || []).sort((a, b) => b.id - a.id);
      setOrders(sortedOrders);
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

  const getASRStatusBadge = (order) => {
    if (!order.isASR) return null;

    const colors = {
      NotStarted: "bg-gray-100 text-gray-800",
      Pending: "bg-yellow-100 text-yellow-800",
      InProgress: "bg-blue-100 text-blue-800",
      Success: "bg-green-100 text-green-800",
      Failed: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-bold ${
          colors[order.asrStatus] || "bg-gray-100 text-gray-800"
        }`}
      >
        🔒 ASR: {order.asrStatus || "Required"}
      </span>
    );
  };

  const renderOrderCard = (o) => (
    <div
      key={o.id}
      className="bg-white border border-gray-200 rounded-xl p-6 mb-4 flex flex-col md:flex-row items-start md:items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/customer/orders/${o.id}`)}
    >
      <div className="flex-1 w-full md:w-auto">
        <div className="flex items-center gap-3 mb-3">
          <span className="px-3 py-1 bg-[#fff8e7] text-[#351c15] text-xs font-bold rounded-full tracking-wide">
             {o.trackingId || `ORD-${o.id}`}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(o.status)}`}
          >
            {o.status}
          </span>
          {getASRStatusBadge(o)}
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-1">
          Order - #{o.id}
        </h3>
        <p className="text-gray-600 mb-1">{o.receiverAddress}</p>

        <p className="text-xs text-gray-500 font-medium mt-1 mb-3">
           Booked: {new Date(o.createdAt).toLocaleDateString()} 
        </p>

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
             onClick={() => navigate(`/customer/orders/${o.id}`)}
             className="px-6 py-2 border border-[#351c15] text-[#351c15] font-bold rounded-lg hover:bg-[#351c15] hover:text-white transition text-sm w-full md:w-auto"
           >
             View Details
           </button>
           
           {o.isASR && ["Pending", "NotStarted"].includes(o.asrStatus) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedASROrderId(o.id);
                  setShowASRUploadModal(true);
                }}
                className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition text-sm w-full md:w-auto"
              >
                Upload ID
              </button>
            )}
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
         
         {/* ASR UPLOAD MODAL */}
        {showASRUploadModal && (
          <CustomerASRUpload
            orderId={selectedASROrderId}
            onClose={() => {
              setShowASRUploadModal(false);
              fetchOrders();
            }}
          />
        )}
      </main>
    </div>
  );
}
