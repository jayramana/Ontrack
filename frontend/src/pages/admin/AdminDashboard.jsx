import React, { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import * as signalR from "@microsoft/signalr";
import OrderDetailsModal from "./OrderDetailsModal";
import DriverDetailsModal from "./DriverDetailsModal";

import { OrdersBarChart } from "../../components/charts/OrdersBarChart";
import { OrdersPieChart } from "../../components/charts/OrdersPieChart";

/*  HELPERS  */
const normalizeStatus = (status) => {
  if (!status) return "Pending";
  const s = status.toLowerCase();
  if (s.includes("deliver")) return "Delivered";
  if (s.includes("transit") || s.includes("assign")) return "In Transit";
  if (s.includes("asr")) return "ASR";
  return "Pending";
};

/*  COMPONENT  */
export default function AdminDashboard() {
  const { user, logout } = useAuth();

  const [drivers, setDrivers] = useState([]);
  const [selectedDrivers, setSelectedDrivers] = useState({});
  const [pendingOrders, setPendingOrders] = useState([]);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [roadIssues, setRoadIssues] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    delivered: 0,
    exceptions: 0,
    asr: 0,
  });

  const [dateFilter, setDateFilter] = useState("1W");

  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);

  const [activeTab, setActiveTab] = useState("orders");
  const [roadAlert, setRoadAlert] = useState(null);

    const fetchDashboard = async () => {
    const [
      allOrdersRes,
      driversRes,
      roadIssuesRes,
      asrRes,
    ] = await Promise.all([
      api.get("/orders/admin/all"),
      api.get("/admin/drivers"),
      api.get("/roadissue/unresolved"),
      api.get("/asr/admin/list"),
    ]);

    const all = (allOrdersRes.data || []).map((o) => {
      const rawStatus = o.status || o.orderStatus;
      return {
        ...o,
        status: normalizeStatus(rawStatus),
        rawStatus,
        isASR: o.isASR || rawStatus?.toLowerCase().includes("asr"),
        createdAt: o.createdAt || o.created_at,
        driverId: o.driverId || o.driver?.userId || o.driver?.id,
      };
    });

    const pending = all.filter(o => o.status === "Pending" || o.status === "AtOriginWarehouse" || o.status === "Approved");
    const assigned = all.filter(o => o.status === "Assigned" || o.status === "In Transit" || o.status === "OutForDelivery");

    setPendingOrders(pending);
    setAssignedOrders(assigned);
    setAllOrders(all);
    setDrivers(driversRes.data || []);
    setRoadIssues(roadIssuesRes.data || []);

    /*  STATS  */
    const delivered = all.filter(o => o.status === "Delivered").length;
    const active = all.filter(o => o.status === "In Transit" || o.status === "Assigned" || o.status === "OutForDelivery").length;
    const asrCount = all.filter(o => o.isASR).length;

    setStats({
      total: all.length,
      active,
      delivered,
      exceptions: roadIssuesRes.data?.length || 0,
      asr: asrCount,
    });
  };



  
  /*  SIGNALR  */
  useEffect(() => {
    let connection;

    const init = async () => {
      connection = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:5066/hubs/logistics")
        .withAutomaticReconnect()
        .build();

      connection.on("RoadIssueReported", (data) => {
        setRoadAlert(data);
        fetchDashboard();
      });

      await connection.start();
      await connection.invoke("JoinAdminGroup");
    };

    init();
    return () => connection && connection.stop();
  }, []);

  /*  FETCH DATA  */
  useEffect(() => {
    fetchDashboard();
  }, []);



  const handleAssign = async (orderId) => {
    const driverId = selectedDrivers[orderId];
    if (!driverId) return alert("Select driver");
    await api.post(`/admin/assign-driver/${orderId}/${driverId}`);
    fetchDashboard();
  };

  const broadcastRoadIssue = async (id) => {
    await api.post(`/admin/broadcast-road-issue/${id}`);
    fetchDashboard();
  };

  const resolveRoadIssue = async (id) => {
    await api.post(`/roadissue/${id}/resolve`);
    fetchDashboard();
  };

  const navigateToASR = () => {
    window.location.href = "/admin/asr";
  };

  /* ===================== JSX ===================== */
  return (
    <div className="min-h-screen flex bg-[#0b0f14] text-white">
      <AdminSidebar active="dashboard" />

      <div className="flex-1 ml-20">
        {/* HEADER */}
        <div className="p-6 flex justify-between border-b border-white/10 items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-400">Welcome back, {user?.first_name}</p>
          </div>
          
          <div className="flex gap-4 items-center">
            {/* DATE FILTERS */}
            <div className="bg-[#141922] p-1 rounded-xl flex gap-1 border border-white/5">
                {["1W", "1M", "3M", "1Y"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setDateFilter(filter)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                        dateFilter === filter
                        ? "bg-[#f97316] text-black shadow-lg"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
            </div>

            <button
                onClick={logout}
                className="bg-red-600 px-6 py-2 rounded text-white font-semibold"
            >
                Logout
            </button>
          </div>
        </div>

        {/* CARDS */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-5 gap-6">
          {[
            ["Total Orders", stats.total],
            ["Active Shipments", stats.active],
            ["Delivered Orders", stats.delivered],
            ["Exceptions", stats.exceptions],
            ["ASR Pending", stats.asr, navigateToASR],
          ].map(([t, v, onClick], i) => (
            <div
              key={i}
              onClick={onClick}
              className={`bg-[#141922] p-6 rounded-xl cursor-${onClick ? "pointer" : "default"}`}
            >
              <p className="text-gray-400">{t}</p>
              <p className="text-3xl font-bold mt-2">{v}</p>
            </div>
          ))}
        </div>

        {/* CHARTS */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(() => {
                // Filter Logic
                const now = new Date();
                const past = new Date();
                if (dateFilter === "1Y") past.setDate(past.getDate() - 365);
                else if (dateFilter === "3M") past.setDate(past.getDate() - 90);
                else if (dateFilter === "1M") past.setDate(past.getDate() - 30);
                else past.setDate(past.getDate() - 7);

                const filteredOrders = allOrders.filter(o => {
                    if (!o.createdAt) return false;
                    const d = new Date(o.createdAt);
                    return d >= past && d <= now;
                });

                return (
                    <>
                        <OrdersPieChart data={filteredOrders} />
                        <OrdersBarChart data={filteredOrders} filterType={dateFilter} />
                    </>
                );
            })()}
        </div>

        {/* TABS */}
        <div className="p-6 flex gap-4">
          <button onClick={() => setActiveTab("orders")} className="bg-[#141922] px-4 py-2 rounded">Orders</button>
          <button onClick={() => setActiveTab("road")} className="bg-[#141922] px-4 py-2 rounded">Road Issues</button>
          <button onClick={navigateToASR} className="bg-purple-600 px-4 py-2 rounded">
            🔒 ASR ({stats.asr})
          </button>
        </div>

        {/* ORDERS */}
        {activeTab === "orders" && (
          <div className="p-6">
            {/* Unassigned */}
            <div className="bg-[#141922] p-6 rounded-xl mb-6">
              <h2 className="text-yellow-400 mb-3">⚠ Unassigned Orders</h2>
              {pendingOrders.map(o => (
                <div
                  key={o.id}
                  className="p-4 mb-2 border border-yellow-500/30 rounded cursor-pointer"
                  onClick={() => {
                    setSelectedOrderId(o.id);
                    setShowOrderModal(true);
                  }}
                >
                  <p className="font-bold">Order #{o.id}</p>

                  <select
                    className="bg-black mt-2 p-2"
                    onClick={e => e.stopPropagation()}
                    onChange={e =>
                      setSelectedDrivers({ ...selectedDrivers, [o.id]: e.target.value })
                    }
                  >
                    <option value="">Assign Driver</option>
                    {drivers.map(d => (
                      <option key={d.userId} value={d.userId}>
                        {d.userFName} {d.userLName}
                      </option>
                    ))}
                  </select>

                  <button
                    className="ml-3 bg-orange-500 px-4 py-1 text-black rounded"
                    onClick={e => {
                      e.stopPropagation();
                      handleAssign(o.id);
                    }}
                  >
                    Assign
                  </button>
                </div>
              ))}
            </div>

            {/* Assigned */}
            <div className="bg-[#141922] p-6 rounded-xl">
              <h2 className="text-green-400 mb-3">✅ Assigned Orders</h2>
              {assignedOrders.map(o => (
                <div
                  key={o.id}
                  className="p-4 mb-2 border border-white/10 rounded cursor-pointer"
                  onClick={() => {
                    setSelectedOrderId(o.id);
                    setShowOrderModal(true);
                  }}
                >
                  <p className="font-bold">Order #{o.id}</p>
                  <p className="text-gray-400">Status: {normalizeStatus(o.status)}</p>

                  <button
                    className="mt-2 bg-blue-600 px-3 py-1 rounded"
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedDriverId(o.driverId);
                      setShowDriverModal(true);
                    }}
                  >
                    View Driver
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ROAD ISSUES */}
        {activeTab === "road" && (
          <div className="p-6">
            <div className="bg-[#141922] p-6 rounded-xl">
              {roadIssues.map(r => (
                <div key={r.id} className="border-b border-white/10 py-4">
                  <p className="font-bold">{r.issueType}</p>
                  <p className="text-gray-300">Reason: {r.reason || r.description}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(r.reportedAt).toLocaleString()}
                  </p>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => broadcastRoadIssue(r.id)}
                      className="bg-orange-500 px-4 py-1 rounded text-black"
                    >
                      Broadcast
                    </button>
                    <button
                      onClick={() => resolveRoadIssue(r.id)}
                      className="bg-green-600 px-4 py-1 rounded"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showOrderModal && (
        <OrderDetailsModal
          orderId={selectedOrderId}
          onClose={() => setShowOrderModal(false)}
        />
      )}

      {showDriverModal && (
        <DriverDetailsModal
          driverId={selectedDriverId}
          onClose={() => setShowDriverModal(false)}
        />
      )}
    </div>
  );
}