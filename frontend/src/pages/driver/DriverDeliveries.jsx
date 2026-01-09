import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import DriverSidebar from "./DriverSidebar";
import api from "../../services/api";
import DriverASRVerification from "./DriverASRVerification";
import { ArrowRight } from "lucide-react";
import { formatStatus, formatDate } from "@/lib/utils";

export default function DriverDeliveries() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("today");

  const [showASRModal, setShowASRModal] = useState(false);
  const [selectedASROrderId, setSelectedASROrderId] = useState(null);

  const openOrderDetails = (id) => {
    navigate(`/driver/orders/${id}`);
  };

  const fetchTodaysOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/driver/orders/all");
      const sorted = (res.data || []).sort((a, b) => b.id - a.id);
      setOrders(sorted);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodaysOrders();
  }, []);

  const acceptOrder = async (id) => {
    await api.post(`/driver/accept/${id}`);
    fetchTodaysOrders();
  };

  const rejectOrder = async (id) => {
    if (!window.confirm("Reject this assignment?")) return;
    await api.post(`/driver/reject/${id}`);
    fetchTodaysOrders();
  };

  const markDelivered = async (id) => {
    if (!window.confirm("Confirm delivery?")) return;
    await api.post(`/driver/mark-delivered/${id}`);
    fetchTodaysOrders();
  };

  const markAttempted = async (id) => {
    const reason = prompt("Reason for failed attempt:");
    if (!reason) return;
    await api.post(`/driver/mark-attempted/${id}`, { reason });
    fetchTodaysOrders();
  };

  const renderOrder = (order) => (
    <div
      key={order.id}
      onClick={() => openOrderDetails(order.id)}
      className="
        bg-white/5 backdrop-blur-xl
        border border-white/10
        rounded-2xl p-6 mb-4
        hover:bg-white/10 transition
        flex flex-col md:flex-row gap-4
        justify-between
      "
    >
      {/* LEFT */}
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-3">


          <span
            className={`px-3 py-1 rounded-full text-xs font-bold
              ${order.status === "Delivered"
                ? "bg-green-500/20 text-green-400"
                : order.status === "Cancelled" ||
                  order.status === "DeliveryAttempted"
                  ? "bg-red-500/20 text-red-400"
                  : order.status === "Assigned"
                    ? "bg-blue-500/20 text-blue-400"
                    : order.status === "Pending" && order.previousDriverId
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-orange-500/20 text-orange-400"
              }
            `}
          >
            {formatStatus(order.status === "Pending" && order.previousDriverId ? "Rescheduled" : order.status)}
          </span>
        </div>

        <h3 className="text-lg font-bold text-white mb-1">
          Order #{order.id}
        </h3>

        <p className="text-slate-400 text-sm">
          {order.receiverAddress}
        </p>

        <p className="text-xs text-slate-500 mt-2">
          Scheduled: {formatDate(order.scheduledDate)}
        </p>
      </div>

      {/* RIGHT ACTIONS */}
      <div className="flex gap-3 flex-wrap items-center">
        {order.status === "Assigned" && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                rejectOrder(order.id);
              }}
              className="px-5 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              Reject
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                acceptOrder(order.id);
              }}
              className="px-5 py-2 rounded-lg bg-[#ff8a3d] text-black font-bold hover:bg-[#ff9a55]"
            >
              Accept
            </button>
          </>
        )}



        {order.status !== "Assigned" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              openOrderDetails(order.id);
            }}
            className="flex items-center gap-2 bg-[#2a303c] hover:bg-[#374151] text-white px-4 py-2 rounded-lg transition-colors border border-gray-700 text-sm font-medium"
          >
            View Details
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  const getFilteredOrders = () => {
    // Decode driver ID from token (simple parse)
    const token = localStorage.getItem("token");
    let currentDriverId = 0;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        currentDriverId = parseInt(payload.id || payload.nameid || 0);
      } catch (e) { console.error("Token parse error", e); }
    }

    switch (activeTab) {
      case "pending":
        // Active pending (must be assigned to ME)
        return orders.filter((o) => o.status === "Assigned" && o.driverId === currentDriverId);
      case "completed":
        // Past orders (Delivered, Cancelled) OR (status=Pending due to reschedule && I was previous)
        return orders.filter((o) =>
          ["Delivered", "Cancelled", "DeliveryAttempted"].includes(o.status) ||
          (o.status === "Pending" && o.previousDriverId === currentDriverId) ||
          (o.status === "Assigned" && o.driverId !== currentDriverId && o.previousDriverId === currentDriverId) // Re-assigned to someone else
        );
      case "today":
      default:
        // Active orders for TODAY (must be assigned to ME)
        return orders.filter((o) => !["Delivered", "Cancelled"].includes(o.status) && o.driverId === currentDriverId);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#0b0f14] via-[#0f141c] to-[#0b0f14] text-slate-100">
      <DriverSidebar active="deliveries" />

      <div className="flex-1 overflow-y-auto">
        {/* HEADER */}
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-[#0b0f14]/80 border-b border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <h1 className="text-2xl font-black">My Deliveries</h1>
            <p className="text-slate-400 text-sm">
              Manage your route and update statuses
            </p>
          </div>
        </header>

        <div className="max-w-6xl mx-auto p-6">
          {/* TABS */}
          <div className="flex p-1 bg-white/5 rounded-xl w-fit mb-8 border border-white/10">
            {[
              { id: "today", label: "Today" },
              { id: "pending", label: "Pending" },
              { id: "completed", label: "History" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition
                  ${activeTab === tab.id
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-white"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-slate-400">Loading orders…</p>
          ) : getFilteredOrders().length === 0 ? (
            <p className="text-slate-500">No orders found for this tab.</p>
          ) : (
            getFilteredOrders().map(renderOrder)
          )}
        </div>
      </div>



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
