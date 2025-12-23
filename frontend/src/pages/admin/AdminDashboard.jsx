
import React, { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import * as signalR from "@microsoft/signalr";
import OrderDetailsModal from "./OrderDetailsModal";
import DriverDetailsModal from "./DriverDetailsModal";

import { OrdersBarChart } from "../../components/charts/OrdersBarChart";
import { OrdersPieChart } from "../../components/charts/OrdersPieChart";

// ICONS
import { 
  FaBox, 
  FaTruck, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaLock, 
  FaClipboardList, 
  FaRoad, 
  FaCalendarAlt,
  FaSignOutAlt,
  FaSearch,
  FaUserTie
} from "react-icons/fa";

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
        .withUrl(`${import.meta.env.VITE_API_URL}/hubs/logistics`)
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
    <div className="min-h-screen flex bg-[#0b0f14] text-white font-sans">
      <AdminSidebar active="dashboard" />

      <div className="flex-1 ml-20 transition-all duration-300">
        {/* HEADER */}
        <div className="sticky top-0 z-30 bg-[#0b0f14]/80 backdrop-blur-md border-b border-white/10 px-8 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Overview of logistics operations</p>
          </div>
          
          <div className="flex gap-4 items-center">
            {/* DATE FILTERS */}
            <div className="bg-[#141922] p-1 rounded-xl flex gap-1 border border-white/5 shadow-sm">
                {["1W", "1M", "3M", "1Y"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setDateFilter(filter)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
                className="flex items-center gap-2 bg-red-600/10 text-red-500 border border-red-600/20 px-4 py-2 rounded-lg font-semibold hover:bg-red-600 hover:text-white transition-colors text-sm"
            >
                <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>

        {/* METRICS CARDS */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-5 gap-6">
          {[
            { label: "Total Orders", value: stats.total, icon: <FaBox />, color: "text-[#f9b400]", bg: "bg-[#f9b400]/10", border: "border-[#f9b400]/20" },
            { label: "Active Shipments", value: stats.active, icon: <FaTruck />, color: "text-sky-500", bg: "bg-sky-500/10", border: "border-sky-500/20" },
            { label: "Delivered", value: stats.delivered, icon: <FaCheckCircle />, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
            { label: "Exceptions", value: stats.exceptions, icon: <FaExclamationTriangle />, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
            { label: "ASR Pending", value: stats.asr, icon: <FaLock />, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20", onClick: navigateToASR },
          ].map((item, i) => (
            <div
              key={i}
              onClick={item.onClick}
              className={`bg-linear-to-br from-[#1a1f29] to-[#0f141c] p-6 rounded-xl shadow border border-[#1f2937] flex justify-between items-center ${
                item.onClick ? "cursor-pointer hover:border-gray-500 transition-colors" : ""
              }`}
            >
              <div>
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">{item.label}</p>
                <p className="text-3xl font-bold text-white mt-2">{item.value}</p>
              </div>
              <div className={`p-3 rounded-full ${item.bg}`}>
                <span className={`text-2xl ${item.color}`}>{item.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* CHARTS */}
        <div className="px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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
                        <div className="bg-[#141922] p-6 rounded-2xl border border-white/5 shadow-sm">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <FaBox className="text-gray-500" /> Order Distribution
                            </h3>
                            <OrdersPieChart data={filteredOrders} />
                        </div>
                        <div className="bg-[#141922] p-6 rounded-2xl border border-white/5 shadow-sm">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <FaCalendarAlt className="text-gray-500" /> Orders Over Time
                            </h3>
                            <OrdersBarChart data={filteredOrders} filterType={dateFilter} />
                        </div>
                    </>
                );
            })()}
        </div>

        {/* TABS */}
        <div className="px-8 mb-6">
          <div className="flex gap-4 border-b border-white/10 pb-1">
            <button 
                onClick={() => setActiveTab("orders")} 
                className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all font-medium ${activeTab === "orders" ? "border-blue-500 text-white" : "border-transparent text-gray-400 hover:text-white"}`}
            >
                <FaClipboardList /> Orders
            </button>
            <button 
                onClick={() => setActiveTab("road")} 
                className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all font-medium ${activeTab === "road" ? "border-blue-500 text-white" : "border-transparent text-gray-400 hover:text-white"}`}
            >
                <FaRoad /> Road Issues
            </button>
            <button 
                onClick={navigateToASR} 
                className="ml-auto flex items-center gap-2 px-6 py-3 bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white rounded-t-lg transition-all border-b-2 border-transparent font-medium"
            >
                <FaLock /> ASR Verification ({stats.asr})
            </button>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="px-8 pb-12">
            {activeTab === "orders" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Unassigned */}
                <div className="bg-[#141922] rounded-2xl border border-white/5 overflow-hidden flex flex-col h-[600px]">
                    <div className="p-4 bg-yellow-500/10 border-b border-yellow-500/20 flex justify-between items-center sticky top-0 backdrop-blur-sm">
                        <h2 className="text-yellow-500 font-bold flex items-center gap-2">
                            <FaClipboardList /> Unassigned Orders 
                            <span className="text-xs bg-yellow-500/20 px-2 py-0.5 rounded text-yellow-300">{pendingOrders.length}</span>
                        </h2>
                    </div>
                
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {pendingOrders.length === 0 ? (
                             <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-50">
                                <FaClipboardList className="text-4xl mb-2" />
                                <p>No unassigned orders</p>
                            </div>
                        ) : (
                            pendingOrders.map(o => (
                            <div
                                key={o.id}
                                className="bg-[#0b0f14] p-4 rounded-xl border border-white/10 hover:border-yellow-500/30 transition-colors group"
                                onClick={() => {
                                    setSelectedOrderId(o.id);
                                    setShowOrderModal(true);
                                }}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-bold text-white group-hover:text-yellow-500 transition-colors">Order #{o.id}</p>
                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                            <FaCalendarAlt size={10} /> {new Date(o.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded font-bold">Pending</span>
                                </div>

                                <div className="flex gap-2 mt-4">
                                    <div className="flex-1 relative">
                                        <select
                                            className="w-full bg-[#1a1f29] text-gray-300 text-sm p-2 rounded-lg border border-white/10 appearance-none focus:border-yellow-500 focus:outline-none"
                                            onClick={e => e.stopPropagation()}
                                            onChange={e =>
                                                setSelectedDrivers({ ...selectedDrivers, [o.id]: e.target.value })
                                            }
                                        >
                                            <option value="">Select Driver...</option>
                                            {drivers.map(d => (
                                            <option key={d.userId} value={d.userId}>
                                                {d.userFName} {d.userLName}
                                            </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-2.5 text-gray-500 pointer-events-none">
                                            <FaUserTie size={12} />
                                        </div>
                                    </div>

                                    <button
                                        className="bg-yellow-600 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                                        onClick={e => {
                                            e.stopPropagation();
                                            handleAssign(o.id);
                                        }}
                                    >
                                        Assign
                                    </button>
                                </div>
                            </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Assigned */}
                <div className="bg-[#141922] rounded-2xl border border-white/5 overflow-hidden flex flex-col h-[600px]">
                     <div className="p-4 bg-emerald-500/10 border-b border-emerald-500/20 flex justify-between items-center sticky top-0 backdrop-blur-sm">
                        <h2 className="text-emerald-500 font-bold flex items-center gap-2">
                            <FaTruck /> Assigned Orders
                            <span className="text-xs bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300">{assignedOrders.length}</span>
                        </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {assignedOrders.length === 0 ? (
                             <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-50">
                                <FaTruck className="text-4xl mb-2" />
                                <p>No assigned orders</p>
                            </div>
                        ) : (
                            assignedOrders.map(o => (
                                <div
                                key={o.id}
                                className="bg-[#0b0f14] p-4 rounded-xl border border-white/10 hover:border-emerald-500/30 transition-colors cursor-pointer group"
                                onClick={() => {
                                    setSelectedOrderId(o.id);
                                    setShowOrderModal(true);
                                }}
                                >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                         <div className="p-2 bg-gray-800 rounded-lg text-emerald-500">
                                            <FaBox />
                                         </div>
                                         <div>
                                            <p className="font-bold text-white group-hover:text-emerald-400 transition-colors">Order #{o.id}</p>
                                            <p className="text-xs text-gray-500 capitalize">{o.isASR ? "ASR Secure" : "Standard"}</p>
                                         </div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded font-bold ${
                                        o.status === "Delivered" ? "bg-emerald-500/20 text-emerald-500" : "bg-blue-500/20 text-blue-500"
                                    }`}>
                                        {normalizeStatus(o.status)}
                                    </span>
                                </div>

                                <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
                                    <div className="text-xs text-gray-400">
                                        <p>Driver ID: {o.driverId ? `DRV-${o.driverId}` : "N/A"}</p>
                                    </div>
                                    <button
                                        className="text-blue-400 hover:text-blue-300 text-xs font-semibold flex items-center gap-1"
                                        onClick={e => {
                                        e.stopPropagation();
                                        setSelectedDriverId(o.driverId);
                                        setShowDriverModal(true);
                                        }}
                                    >
                                        <FaUserTie /> View Driver
                                    </button>
                                </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            )}

            {/* ROAD ISSUES */}
            {activeTab === "road" && (
            <div className="bg-[#141922] p-6 rounded-2xl border border-white/5 min-h-[400px]">
                <h2 className="text-red-500 font-bold mb-6 flex items-center gap-2 text-xl">
                    <FaExclamationTriangle /> Active Road Issues
                </h2>
                <div className="space-y-4">
                    {roadIssues.length === 0 ? (
                        <div className="text-center text-gray-500 py-12">
                            <FaRoad className="text-5xl mx-auto mb-3 opacity-20" />
                            <p>No active road issues reported.</p>
                        </div>
                    ) : (
                         roadIssues.map(r => (
                        <div key={r.id} className="bg-[#0b0f14] border border-white/10 p-5 rounded-xl flex flex-col md:flex-row justify-between gap-4 hover:border-red-500/30 transition-colors">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-red-500 font-bold text-lg">{r.issueType}</span>
                                    <span className="text-xs bg-red-500/20 text-red-500 px-2 py-0.5 rounded border border-red-500/20">Critical</span>
                                </div>
                                <p className="text-gray-300 mb-2">{r.reason || r.description}</p>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <FaCalendarAlt /> Reported: {new Date(r.reportedAt).toLocaleString()}
                                </p>
                            </div>

                            <div className="flex gap-3 items-center">
                            <button
                                onClick={() => broadcastRoadIssue(r.id)}
                                className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-orange-900/20"
                            >
                                Broadcast Alert
                            </button>
                            <button
                                onClick={() => resolveRoadIssue(r.id)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-emerald-900/20"
                            >
                                Mark Resolved
                            </button>
                            </div>
                        </div>
                        ))
                    )}
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
    </div>
  );
}
