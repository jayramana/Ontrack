import React, { useState, useEffect } from "react";
import DriverSidebar from "./DriverSidebar";
import api from "../../services/api";
import { Link } from "react-router-dom";
import OrderDetailsModal from "./OrderDetailsModal";
import DriverASRVerification from "./DriverASRVerification";

export default function DriverDeliveries() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("today");

  // Modal
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // ASR Modal
  const [showASRModal, setShowASRModal] = useState(false);
  const [selectedASROrderId, setSelectedASROrderId] = useState(null);

  const openOrderDetails = (id) => {
    setSelectedOrderId(id);
    setShowOrderModal(true);
  };

  const fetchTodaysOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get("/driver/orders/today/analytics");
      setOrders(response.data || []);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodaysOrders();
  }, []);

  // ---------------------------------------------
  // ORDER ACTIONS
  // ---------------------------------------------
  const markDelivered = async (id) => {
    if(!window.confirm("Confirm delivery?")) return;
    try {
      await api.post(`/driver/mark-delivered/${id}`);
      fetchTodaysOrders();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const markAttempted = async (id) => {
    const reason = prompt("Reason for failed attempt:");
    if (!reason) return;
    try {
      await api.post(`/driver/mark-attempted/${id}`, { reason });
      fetchTodaysOrders();
    } catch (err) {
        alert("Failed to update status");
    }
  };

  // ---------------------------------------------
  // UPS BADGES
  // ---------------------------------------------
  const getPriorityBadge = (p) => {
    const styles = {
      1: "bg-red-100 text-red-800",
      2: "bg-[#f9b400]/30 text-[#351c15]",
      3: "bg-gray-200 text-gray-700",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[p]}`}>
        {p === 1 ? "High Priority" : p === 2 ? "Normal" : "Rescheduled"}
      </span>
    );
  };



  const acceptOrder = async (id) => {
    try {
        await api.post(`/driver/accept/${id}`);
        fetchTodaysOrders(); // Refresh list to move it to Active
    } catch (err) {
        alert("Failed to accept order");
    }
  };

  const rejectOrder = async (id) => {
    if(!window.confirm("Are you sure you want to reject this assignment? It will be removed from your list.")) return;
    try {
        await api.post(`/driver/reject/${id}`);
        fetchTodaysOrders(); // Refresh list to remove it
    } catch (err) {
        alert("Failed to reject order");
    }
  };


  const renderOrder = (order, idx) => (
    <div
      key={order.id}
      className="bg-white border border-gray-200 rounded-xl p-6 mb-4 flex flex-col md:flex-row items-start md:items-center justify-between hover:shadow-md transition-shadow"
      onClick={() => openOrderDetails(order.id)}
    >
      {/* LEFT CONTENT */}
      <div className="flex-1 w-full md:w-auto">
        {/* Top Row: ID & Status */}
        <div className="flex items-center gap-3 mb-3">
          <span className="px-3 py-1 bg-[#fff8e7] text-[#351c15] text-xs font-bold rounded-full tracking-wide">
             {order.trackingId || `ORD-${order.id}`}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                order.status === "Delivered"
                ? "bg-green-100 text-green-700"
                : order.status === "Cancelled"
                ? "bg-red-100 text-red-700"
                : order.status === "Assigned"
                ? "bg-blue-100 text-blue-700"
                : "bg-orange-100 text-orange-700"
            }`}
          >
            {order.status}
          </span>
        </div>

        {/* Middle: Main Info */}
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          {order.receiverName} <span className="text-gray-400 mx-2">•</span> {order.receiverAddress}
        </h3>

        {/* Bottom: Meta Info */}
        <p className="text-xs text-gray-500 font-medium mt-1">
           Scheduled: {new Date(order.scheduledDate).toLocaleDateString()} 
           {order.deliveryNotes && <span className="ml-2 pl-2 border-l border-gray-300">📝 {order.deliveryNotes}</span>}
        </p>

        {order.rescheduledAt && (
             <div className="mt-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded inline-block">
                 ⚠️ Rescheduled: {order.rescheduleReason}
             </div>
        )}
      </div>

      {/* RIGHT ACTION: CONDITIONAL BUTTONS */}
      <div className="mt-4 md:mt-0 flex gap-3 w-full md:w-auto">
        
        {/* CASE 1: ASSIGNED (Needs Acceptance) */}
        {order.status === "Assigned" && (
            <>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        rejectOrder(order.id);
                    }}
                    className="px-6 py-2 border border-red-200 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition text-sm"
                >
                    Reject
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        acceptOrder(order.id);
                    }}
                    className="px-6 py-2 bg-[#351c15] text-white font-bold rounded-lg hover:bg-[#4a2c23] transition text-sm shadow-sm"
                >
                    Accept
                </button>
            </>
        )}

        {/* CASE 2: OUT FOR DELIVERY (Active Actions) */}
        {(order.status === "OutForDelivery" || order.status === "Out for delivery") && (
            <>
                {order.isASR ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedASROrderId(order.id);
                      setShowASRModal(true);
                    }}
                    className="px-6 py-2 border border-[#351c15] text-[#351c15] font-bold rounded-lg hover:bg-[#351c15] hover:text-white transition text-sm"
                  >
                    Verify ASR
                  </button>
                ) : (
                  <button
                      onClick={(e) => {
                          e.stopPropagation();
                          markDelivered(order.id);
                      }}
                      className="px-6 py-2 border border-[#351c15] text-[#351c15] font-bold rounded-lg hover:bg-[#351c15] hover:text-white transition text-sm"
                  >
                      Mark Delivered
                  </button>
                )}

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        markAttempted(order.id);
                    }}
                    className="px-6 py-2 border border-red-200 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition text-sm"
                >
                    Failed
                </button>
            </>
        )}

        {/* CASE 3: COMPLETED */}
        {(order.status === "Delivered" || order.status === "Cancelled") && (
             <button
                className="px-6 py-2 border border-gray-300 text-gray-600 font-semibold rounded-lg hover:bg-gray-50 transition text-sm"
            >
                View Details
            </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#f8f9fa]">
      <DriverSidebar active="deliveries" />

      <div className="flex-1 overflow-y-auto">
        {/* HEADER */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                My Deliveries
              </h1>
              <p className="text-gray-500 text-sm">Manage your route and update statuses.</p>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto p-6">
            {/* TABS */}
           <div className="flex p-1 bg-gray-100 rounded-lg w-fit mb-8 border border-gray-200">
                {[
                    { id: 'today', label: `Today (${orders.length})` },
                    { id: 'pending', label: `Pending (${orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length})` },
                    { id: 'completed', label: `History` }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            activeTab === tab.id 
                            ? "bg-white text-gray-900 shadow-sm" 
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
           </div>

           {loading ? (
             <div className="py-12 text-center">
                 <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-[#351c15]"></div>
                 <p className="mt-2 text-gray-500 text-sm">Loading orders...</p>
             </div>
           ) : orders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                    <p className="text-gray-400 text-lg">No orders found.</p>
                </div>
           ) : (
             // SPLIT UI: NEW ASSIGNMENTS vs ACTIVE DELIVERIES
             activeTab === 'today' ? (
                <div className="space-y-8">
                    {/* 1. NEW ASSIGNMENTS (Status: Assigned) */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-700 p-1.5 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0 1 1 0 002 0z" />
                                </svg>
                            </span>
                            New Assignments
                        </h2>
                        {orders.filter(o => o.status === 'Assigned').length === 0 ? (
                             <p className="text-gray-400 text-sm italic ml-2">No new assignments.</p>
                        ) : (
                             orders.filter(o => o.status === 'Assigned').map((order, i) => renderOrder(order, i))
                        )}
                    </div>

                    {/* 2. ACTIVE DELIVERIES (Status: OutForDelivery / Out for delivery) */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="bg-green-100 text-green-700 p-1.5 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                            </span>
                             Active Deliveries
                        </h2>
                        {orders.filter(o => o.status === 'OutForDelivery' || o.status === 'Out for delivery').length === 0 ? (
                             <p className="text-gray-400 text-sm italic ml-2">No active deliveries.</p>
                        ) : (
                             orders.filter(o => o.status === 'OutForDelivery' || o.status === 'Out for delivery').map((order, i) => renderOrder(order, i))
                        )}
                    </div>
                </div>
             ) : (
                 <div className="flex flex-col pb-20">
                    {orders
                        .filter(o => {
                            if (activeTab === "pending") return o.status !== "Delivered" && o.status !== "Cancelled";
                            if (activeTab === "completed") return o.status === "Delivered";
                            return true; 
                        })
                        .map((order, i) => renderOrder(order, i))}
                 </div>
             )
           )}
        </div>
      </div>

      {showOrderModal && (
        <OrderDetailsModal
          orderId={selectedOrderId}
          onClose={() => setShowOrderModal(false)}
        />
      )}

      {showASRModal && (
        <DriverASRVerification
          orderId={selectedASROrderId}
          onClose={() => {
            setShowASRModal(false);
            fetchTodaysOrders();
          }}
        />
      )}
    </div>
  );
}
