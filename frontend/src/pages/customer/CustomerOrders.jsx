import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import CustomerSidebar from "./CustomerSidebar";
import api, { API_BASE_URL } from "../../services/api";
import * as signalR from "@microsoft/signalr";
import { useAuth } from "../../context/AuthContext";
import { formatStatus, formatDate } from "@/lib/utils";



export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("Pending");
  const [loading, setLoading] = useState(true);


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

    connection.on("ASRVerificationCompleted", () => {
      fetchOrders();
    });

    return () => connection.stop();
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

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === "All") return true;
    if (filterStatus === "Delivered") {
      return o.status === "Delivered" || o.status === "DeliveryAttempted";
    }
    // Pending
    return o.status !== "Delivered" && o.status !== "DeliveryAttempted";
  });

  /* ---------------- STATUS UI HELPERS ---------------- */
  const getStatusBadge = (status) => {
    const styles = {
      PendingAssignment: "bg-slate-500/20 text-slate-300",
      AtOriginWarehouse: "bg-blue-500/20 text-blue-300",
      Assigned: "bg-yellow-500/20 text-yellow-300",
      InTransit: "bg-orange-500/20 text-orange-300",
      OutForDelivery: "bg-purple-500/20 text-purple-300",
      AtDestinationWarehouse: "bg-indigo-500/20 text-indigo-300",
      Delivered: "bg-green-500/20 text-green-300",
      DeliveryAttempted: "bg-red-500/20 text-red-300",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${styles[status] || "bg-slate-500/20 text-slate-300"
          }`}
      >
        {formatStatus(status)}
      </span>
    );
  };

  const getASRStatusBadge = (order) => {
    if (!order.isASR) return null;

    const colors = {
      NotStarted: "bg-slate-500/20 text-slate-300",
      Pending: "bg-yellow-500/20 text-yellow-300",
      InProgress: "bg-blue-500/20 text-blue-300",
      Success: "bg-green-500/20 text-green-300",
      Failed: "bg-red-500/20 text-red-300",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-bold ${colors[order.asrStatus] || "bg-slate-500/20 text-slate-300"
          }`}
      >
        🔒 ASR: {formatStatus(order.asrStatus) || "Required"}
      </span>
    );
  };

  /* ---------------- DELIVERY TYPE BADGE ---------------- */
  const getDeliveryTypeBadge = (type) => {
    const isExpress = (type || "").toLowerCase() === "express";

    if (isExpress) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-black tracking-wide bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-orange-400 border border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.2)] flex items-center gap-1">
          Express
        </span>
      );
    }

    // Normal / Standard
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-slate-500/10 text-slate-400 border border-slate-500/20">
        Normal
      </span>
    );
  };

  /* ---------------- ORDER CARD ---------------- */
  const renderOrderCard = (o) => (
    <div
      key={o.id}
      onClick={() => navigate(`/customer/orders/${o.id}`)}
      className="
        bg-white/5 backdrop-blur-xl border border-white/10
        rounded-3xl p-6 mb-6
        hover:bg-white/10 transition
        cursor-pointer
      "
    >
      <div className="flex flex-col lg:flex-row justify-between gap-6">

        {/* LEFT */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {getDeliveryTypeBadge(o.deliveryType)}
          </div>

          <h3 className="text-lg font-bold text-white mb-1">
            Order #{o.id}
          </h3>

          <p className="text-slate-400 text-sm mb-2">
            {o.receiverAddress}
          </p>

          <p className="text-xs text-slate-500">
            Booked on {formatDate(o.createdAt)}
          </p>
          {o.isASR && (
            <p className="text-xs text-[#ff8a3d] font-bold mt-1">
              ASR Enabled
            </p>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex flex-col items-end gap-3">
          <p className="text-2xl font-black text-white">
            ₹{o.price || 0}
          </p>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/customer/orders/${o.id}`);
            }}
            className="
              px-6 py-2 rounded-xl
              bg-white/10 border border-white/20
              text-white font-bold text-sm
              hover:bg-white/20 transition
              w-full lg:w-auto
            "
          >
            View Details
          </button>




        </div>

      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#0b0f14] text-slate-100">
      <CustomerSidebar active="orders" />

      <main className="flex-1 px-10 py-10 overflow-y-auto">

        <div className="mb-10">
          <div>
            <h1 className="text-3xl font-black text-white">My Orders</h1>
            <p className="text-slate-400 mt-1 mb-6">Track and manage your shipments</p>
          </div>

          {/* FILTERS */}
          <div className="bg-white/5 p-1 rounded-xl inline-flex border border-white/10">
            {["Pending", "Delivered"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                  filterStatus === status
                    ? "bg-[#ff8a3d] text-black shadow-lg shadow-orange-500/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400">
            Loading orders…
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
            <h3 className="text-xl font-bold text-white mb-2">No {filterStatus === 'All' ? '' : filterStatus.toLowerCase()} packages found</h3>
            <p className="text-slate-400">
              We will update here when you have new orders.
            </p>
          </div>
        ) : (
          <div>{filteredOrders.map(renderOrderCard)}</div>
        )}



      </main>


    </div>
  );
}
