
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
  Package, 
  Truck, 
  CheckCircle, 
  AlertTriangle, 
  Lock, 
  ClipboardList, 
  Map as MapIcon, 
  Calendar,
  LogOut,
  Search,
  User,
} from "lucide-react";

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
        status: rawStatus || "Pending", // Keep raw status
        isASR: o.isASR || rawStatus?.toLowerCase().includes("asr"),
        createdAt: o.createdAt || o.created_at,
        driverId: o.driverId || o.driver?.userId || o.driver?.id,
      };
    });

    // Unassigned: Pending, Approved, AtOriginWarehouse
    const pending = all.filter(o => 
        ["Pending", "Approved", "AtOriginWarehouse"].includes(o.status)
    );
    
    // Assigned: Assigned, In Transit, OutForDelivery
    const assigned = all.filter(o => 
        ["Assigned", "In Transit", "OutForDelivery", "Out for delivery"].includes(o.status)
    );

    setPendingOrders(pending);
    setAssignedOrders(assigned);
    setAllOrders(all);
    setDrivers(driversRes.data || []);
    setRoadIssues(roadIssuesRes.data || []);

    /*  STATS  */
    const delivered = all.filter(o => o.status === "Delivered").length;
    const active = all.filter(o => ["In Transit", "Assigned", "OutForDelivery", "Out for delivery"].includes(o.status)).length;
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

      <div className="flex-1 transition-all duration-300">
        {/* HEADER */}
        <div className="sticky top-0 z-30 bg-[#0b0f14]/80 backdrop-blur-md border-b border-white/10 px-8 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Dashboard 
            </h1>
            <p className="text-slate-400 text-sm mt-1 font-medium">Overview of logistics operations</p>
          </div>
          
          <div className="flex gap-4 items-center">


            <button
                onClick={logout}
                className="flex items-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2 rounded-lg font-bold hover:bg-red-500 hover:text-white transition-all text-sm"
            >
                <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* METRICS CARDS */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-5 gap-6">
          {[
            { label: "Total Orders", value: stats.total, icon: <Package size={24} />, color: "text-[#ff8a3d]", bg: "bg-[#ff8a3d]/10", border: "border-[#ff8a3d]/20" },
            { label: "Active Shipments", value: stats.active, icon: <Truck size={24} />, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
            { label: "Delivered", value: stats.delivered, icon: <CheckCircle size={24} />, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
            { label: "Exceptions", value: stats.exceptions, icon: <AlertTriangle size={24} />, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
            { label: "ASR Pending", value: stats.asr, icon: <Lock size={24} />, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", onClick: navigateToASR },
          ].map((item, i) => (
            <div
              key={i}
              onClick={item.onClick}
              className={`bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 flex justify-between items-center group ${
                item.onClick ? "cursor-pointer hover:border-[#ff8a3d]/30 transition-all hover:bg-white/10" : ""
              }`}
            >
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{item.label}</p>
                <p className="text-3xl font-black text-white mt-2 group-hover:scale-105 transition-transform origin-left">{item.value}</p>
              </div>
              <div className={`p-4 rounded-xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
            </div>
          ))}
        </div>

        {/* FILTERS & CHARTS HEADER */}
        <div className="px-8 pb-4 flex justify-between items-end">
            <div>
                 <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <CheckCircle className="text-[#ff8a3d]" size={20} /> Analytics Overview
                 </h2>
                 <p className="text-sm text-slate-400 mt-1">Order volume and distribution metrics</p>
            </div>

            {/* MOVED DATE FILTERS */}
            <div className="bg-white/5 p-1 rounded-xl flex gap-1 border border-white/10 backdrop-blur-sm">
                {["1W", "1M", "3M", "1Y"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setDateFilter(filter)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        dateFilter === filter
                        ? "bg-[#ff8a3d]/20 text-[#ff8a3d] border border-[#ff8a3d]/50 backdrop-blur-md shadow-lg shadow-orange-500/10"
                        : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
            </div>
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
                        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
                                <Package className="text-[#ff8a3d]" /> Order Distribution
                            </h3>
                            <OrdersPieChart data={filteredOrders} />
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
                                <Calendar className="text-[#ff8a3d]" /> Orders Over Time
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
                className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all font-bold ${activeTab === "orders" ? "border-[#ff8a3d] text-[#ff8a3d]" : "border-transparent text-slate-400 hover:text-white"}`}
            >
                <ClipboardList size={18} /> Orders
            </button>
            <button 
                onClick={() => setActiveTab("road")} 
                className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all font-bold ${activeTab === "road" ? "border-red-500 text-red-500" : "border-transparent text-slate-400 hover:text-white"}`}
            >
                <AlertTriangle size={18} /> Road Issues
            </button>
            <button 
                onClick={navigateToASR} 
                className="ml-auto flex items-center gap-2 px-6 py-3 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 rounded-t-lg transition-all border-b-2 border-purple-500/50 font-bold"
            >
                <Lock size={18} /> ASR Verification ({stats.asr})
            </button>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="px-8 pb-12">
            {activeTab === "orders" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Unassigned */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden flex flex-col h-[600px]">
                    <div className="p-4 bg-yellow-500/10 border-b border-yellow-500/20 flex justify-between items-center sticky top-0 backdrop-blur-sm">
                        <h2 className="text-yellow-500 font-bold flex items-center gap-2">
                            <ClipboardList size={18} /> Unassigned Orders 
                            <span className="text-xs bg-yellow-500/20 px-2 py-0.5 rounded text-yellow-300 font-bold">{pendingOrders.length}</span>
                        </h2>
                    </div>
                
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {pendingOrders.length === 0 ? (
                             <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-50">
                                <ClipboardList className="text-4xl mb-2" />
                                <p>No unassigned orders</p>
                            </div>
                        ) : (
                            pendingOrders.map(o => (
                            <div
                                key={o.id}
                                className="bg-black/20 p-4 rounded-xl border border-white/10 hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all group"
                                onClick={() => {
                                    setSelectedOrderId(o.id);
                                    setShowOrderModal(true);
                                }}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-bold text-white group-hover:text-yellow-500 transition-colors">Order #{o.id}</p>
                                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                            <Calendar size={12} /> {new Date(o.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className="text-xs px-2 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded font-bold uppercase tracking-wider">{o.status}</span>
                                </div>

                                <div className="flex gap-2 mt-4">
                                    <div className="flex-1 relative">
                                        <select
                                            className="w-full bg-[#0b0f14] text-slate-300 text-sm p-2 rounded-lg border border-white/10 appearance-none focus:border-yellow-500 focus:outline-none"
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
                                        <div className="absolute right-3 top-2.5 text-slate-500 pointer-events-none">
                                            <User size={14} />
                                        </div>
                                    </div>

                                    <button
                                        className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 border border-yellow-500/50 backdrop-blur-md px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-yellow-500/10"
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
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden flex flex-col h-[600px]">
                     <div className="p-4 bg-blue-500/10 border-b border-blue-500/20 flex justify-between items-center sticky top-0 backdrop-blur-sm">
                        <h2 className="text-blue-400 font-bold flex items-center gap-2">
                            <Truck size={18} /> Assigned Orders
                            <span className="text-xs bg-blue-500/20 px-2 py-0.5 rounded text-blue-300 font-bold">{assignedOrders.length}</span>
                        </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {assignedOrders.length === 0 ? (
                             <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-50">
                                <Truck className="text-4xl mb-2" />
                                <p>No assigned orders</p>
                            </div>
                        ) : (
                            assignedOrders.map(o => (
                                <div
                                key={o.id}
                                className="bg-black/20 p-4 rounded-xl border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer group"
                                onClick={() => {
                                    setSelectedOrderId(o.id);
                                    setShowOrderModal(true);
                                }}
                                >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                         <div className="p-2 bg-white/5 rounded-lg text-blue-400 border border-white/5">
                                            <Package size={16} />
                                         </div>
                                         <div>
                                            <p className="font-bold text-white group-hover:text-blue-400 transition-colors">Order #{o.id}</p>
                                            <p className="text-xs text-slate-500 capitalize">{o.isASR ? "ASR Secure" : "Standard"}</p>
                                         </div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded font-bold border ${
                                        o.status === "Delivered" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                    }`}>
                                        {o.status}
                                    </span>
                                </div>

                                <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
                                    <div className="text-xs text-slate-400">
                                        <p>Driver ID: {o.driverId ? `DRV-${o.driverId}` : "N/A"}</p>
                                    </div>
                                    <button
                                        className="text-blue-400 hover:text-blue-300 text-xs font-bold flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm px-2 py-1 rounded hover:bg-blue-500/20 transition-all"
                                        onClick={e => {
                                        e.stopPropagation();
                                        setSelectedDriverId(o.driverId);
                                        setShowDriverModal(true);
                                        }}
                                    >
                                        <User size={12} /> View Driver
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
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 min-h-[400px]">
                <h2 className="text-red-500 font-bold mb-6 flex items-center gap-2 text-xl">
                    <AlertTriangle size={24} /> Active Road Issues
                </h2>
                <div className="space-y-4">
                    {roadIssues.length === 0 ? (
                        <div className="text-center text-slate-500 py-12 flex flex-col items-center">
                            <MapIcon className="text-5xl mb-3 opacity-20" />
                            <p>No active road issues reported.</p>
                        </div>
                    ) : (
                         roadIssues.map(r => (
                        <div key={r.id} className="bg-white/5 border border-white/10 p-5 rounded-xl flex flex-col md:flex-row justify-between gap-4 hover:border-red-500/30 transition-all hover:bg-white/10">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-red-500 font-bold text-lg">{r.issueType}</span>
                                    <span className="text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded border border-red-500/20 font-bold uppercase">Critical</span>
                                </div>
                                <p className="text-slate-300 mb-2">{r.reason || r.description}</p>
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                    <Calendar size={12} /> Reported: {new Date(r.reportedAt).toLocaleString()}
                                </p>
                            </div>

                            <div className="flex gap-3 items-center">
                            <button
                                onClick={() => broadcastRoadIssue(r.id)}
                                className="bg-orange-600/20 hover:bg-orange-600/30 text-orange-500 border border-orange-600/50 backdrop-blur-md px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-lg shadow-orange-600/10"
                            >
                                Broadcast Alert
                            </button>
                            <button
                                onClick={() => resolveRoadIssue(r.id)}
                                className="bg-green-600/20 hover:bg-green-600/30 text-green-500 border border-green-600/50 backdrop-blur-md px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-lg shadow-green-600/10"
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
