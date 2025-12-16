import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import DriverSidebar from "./DriverSidebar";
import api from "../../services/api";
import * as signalR from "@microsoft/signalr";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

import OrderDetailsModal from "./OrderDetailsModal";
import DriverASRVerification from "./DriverASRVerification";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

export default function DriverDashboard() {
  const { user } = useAuth();

  /* =========================
     STATE
  ========================= */
  const [orders, setOrders] = useState([]);
  const [optimizedRoute, setOptimizedRoute] = useState([]);
  const [warehouse, setWarehouse] = useState(null);

  const [stats, setStats] = useState({
    total: 0,
    delivered: 0,
    pending: 0,
    exceptions: 0,
    highPriority: 0,
    normalPriority: 0,
  });

  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const [showASRModal, setShowASRModal] = useState(false);
  const [selectedASROrderId, setSelectedASROrderId] = useState(null);

  const [connection, setConnection] = useState(null);

  /* =========================
     DATA FETCH
  ========================= */
  const fetchTodaysOrders = async () => {
    try {
      const res = await api.get("/driver/orders/today");
      setOrders(res.data || []);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    }
  };

  const fetchOptimizedRoute = async () => {
    try {
      const res = await api.get("/driver/route/optimized");
      setOptimizedRoute(res.data || []);
    } catch {}
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get("/driver/orders/today/analytics");
      const data = res.data || [];

      if (data.length > 0) setWarehouse(data[0].currentWarehouse);

      const delivered = data.filter((o) => o.status === "Delivered").length;
      const pending = data.filter(
        (o) => o.status !== "Delivered" && o.status !== "Cancelled"
      ).length;
      const exceptions = data.filter(
        (o) => o.status === "DeliveryAttempted" || o.status === "Cancelled"
      ).length;

      const highPriority = data.filter(
        (o) => o.priority === 1 && o.status === "Delivered"
      ).length;
      const normalPriority = data.filter(
        (o) => o.priority === 2 && o.status === "Delivered"
      ).length;

      setStats({
        total: data.length,
        delivered,
        pending,
        exceptions,
        highPriority,
        normalPriority,
      });
    } catch (err) {
      console.error("Failed to load analytics", err);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     SIGNALR
  ========================= */
  useEffect(() => {
    if (!user?.userId) return;

    let conn;

    const setupSignalR = async () => {
      try {
        conn = new signalR.HubConnectionBuilder()
          .withUrl("http://localhost:5066/hubs/logistics", {
            accessTokenFactory: () => localStorage.getItem("token") || "",
          })
          .withAutomaticReconnect()
          .build();

        conn.on("OrderRescheduled", fetchTodaysOrders);
        conn.on("CustomerDocumentsUploaded", fetchTodaysOrders);
        conn.on("ASRVerificationCompleted", fetchTodaysOrders);
        conn.on("ASRAdminOverride", fetchTodaysOrders);

        await conn.start();
        await conn.invoke("JoinDriverGroup", Number(user.userId));
        setConnection(conn);
      } catch (err) {
        console.error("SignalR Error", err);
      }
    };

    setupSignalR();

    return () => {
      if (conn) conn.stop().catch(() => {});
    };
  }, [user]);

  /* =========================
     INITIAL LOAD
  ========================= */
  useEffect(() => {
    fetchTodaysOrders();
    fetchOptimizedRoute();
    fetchAnalytics();
  }, []);

  /* =========================
     CHART DATA
  ========================= */
  const statusData = {
    labels: ["Delivered", "Pending", "Exceptions"],
    datasets: [
      {
        data: [stats.delivered, stats.pending, stats.exceptions],
        backgroundColor: ["#15803d", "#f9b400", "#ef4444"],
      },
    ],
  };

  const priorityData = {
    labels: ["High Priority", "Normal Priority"],
    datasets: [
      {
        data: [stats.highPriority, stats.normalPriority],
        backgroundColor: ["#dc2626", "#3b82f6"],
      },
    ],
  };

  /* =========================
     ACTIONS
  ========================= */
  const markDelivered = async (id, order) => {
    if (
      order.isASR &&
      !["Success", "AdminOverride"].includes(order.asrStatus)
    ) {
      setSelectedASROrderId(id);
      setShowASRModal(true);
      return;
    }

    try {
      await api.post(`/driver/mark-delivered/${id}`);
      fetchTodaysOrders();
      fetchOptimizedRoute();
    } catch {}
  };

  const markAttempted = async (id) => {
    const reason = prompt("Reason for failed attempt:");
    if (!reason) return;
    try {
      await api.post(`/driver/mark-attempted/${id}`, { reason });
      fetchTodaysOrders();
      fetchOptimizedRoute();
    } catch {}
  };

  /* =========================
     UI HELPERS
  ========================= */
  const getASRBadge = (order) => {
    if (!order.isASR) return null;
    return (
      <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
        🔒 ASR
      </span>
    );
  };

  const renderOrder = (order, idx) => (
    <div
      key={order.id}
      className="bg-[#fff8e7] border border-[#e6ddc5] rounded-xl p-6 shadow"
    >
      <div className="flex justify-between mb-3">
        <h3 className="font-bold text-lg">
          Stop #{idx + 1} {getASRBadge(order)}
        </h3>
        <span className="text-sm font-semibold">{order.status}</span>
      </div>

      <p className="text-sm font-semibold">{order.receiverName}</p>
      <p className="text-xs text-gray-600">{order.receiverAddress}</p>

      <div className="flex gap-2 mt-4">
        {(!order.isASR ||
          ["Success", "AdminOverride"].includes(order.asrStatus)) && (
          <button
            onClick={() => markDelivered(order.id, order)}
            className="flex-1 bg-green-700 text-white py-2 rounded"
          >
            Delivered
          </button>
        )}

        <button
          onClick={() => markAttempted(order.id)}
          className="flex-1 bg-yellow-400 py-2 rounded"
        >
          Attempted
        </button>
      </div>
    </div>
  );

  /* =========================
     RENDER
  ========================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#f7f3ef]">
      <DriverSidebar active="dashboard" />

      <div className="flex-1 overflow-y-auto">
        <header className="bg-[#fff8e7] border-b p-6">
          <h1 className="text-3xl font-black">Performance Dashboard</h1>
          <p className="text-sm text-gray-600">
            Welcome back, {user?.first_name}
          </p>
        </header>

        <main className="max-w-7xl mx-auto p-8 space-y-10">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Kpi label="Total Jobs" value={stats.total} />
            <Kpi label="Delivered" value={stats.delivered} />
            <Kpi label="Pending" value={stats.pending} />
            <Kpi label="Exceptions" value={stats.exceptions} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl">
              <Doughnut data={statusData} />
            </div>
            <div className="bg-white p-6 rounded-xl">
              <Bar data={priorityData} />
            </div>
          </div>

          {/* Orders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders.map((o, i) => renderOrder(o, i))}
          </div>
        </main>
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

const Kpi = ({ label, value }) => (
  <div className="bg-white p-6 rounded-xl shadow">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-3xl font-black">{value}</p>
  </div>
);
