
import React, { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import * as signalR from "@microsoft/signalr";

import { OrdersBarChart } from "../../components/charts/OrdersBarChart";
import { OrdersPieChart } from "../../components/charts/OrdersPieChart";

// ICONS
import {
  Package,
  Truck,
  CheckCircle,
  AlertTriangle,
  Lock,
  Map as MapIcon,
  Calendar,
  LogOut,
} from "lucide-react";

/*  COMPONENT  */
export default function AdminDashboard() {
  const { logout } = useAuth();

  const [allOrders, setAllOrders] = useState([]);
  const [roadIssues, setRoadIssues] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    delivered: 0,
    exceptions: 0,
    asr: 0,
    reverifyCount: 0,
  });

  const [dateFilter, setDateFilter] = useState("1W");
  const [roadAlert, setRoadAlert] = useState(null);

  const fetchDashboard = async () => {
    try {
        const [
            allOrdersRes,
            roadIssuesRes,
            asrRes,
          ] = await Promise.all([
            api.get("/orders/admin/all"),
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
            };
          });
      
          setAllOrders(all);
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
            reverifyCount: (asrRes.data || []).filter(a => a.customerReverifyRequested && a.aiVerifyStatus !== 'AdminOverride' && a.aiVerifyStatus !== 'Success').length,
          });
    } catch (e) {
        console.error("Dashboard fetch error", e);
    }
  };

  /*  SIGNALR  */
  useEffect(() => {
    let connection;

    const init = async () => {
      connection = new signalR.HubConnectionBuilder()
        .withUrl(`http://localhost:5066/hubs/logistics`)
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
        <div className="sticky top-0 z-30 bg-[#0b0f14]/80 backdrop-blur-md border-b border-white/10 px-4 md:px-8 py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="md:pl-0 pl-12">
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
        <div className="p-4 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
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
              className={`bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 flex justify-between items-center group ${item.onClick ? "cursor-pointer hover:border-[#ff8a3d]/30 transition-all hover:bg-white/10" : ""
                }`}
            >
              <div>
                <p className="text-slate-400 text-xs font-bold">{item.label}</p>
                <p className="text-3xl font-black text-white mt-2 group-hover:scale-105 transition-transform origin-left">{item.value}</p>
              </div>
              <div className={`p-4 rounded-xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
            </div>
          ))}
        </div>

        {/* FILTERS & CHARTS HEADER */}
        <div className="px-4 md:px-8 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CheckCircle className="text-[#ff8a3d]" size={20} /> Analytics Overview
            </h2>
            <p className="text-sm text-slate-400 mt-1">Order volume and distribution metrics</p>
          </div>

          {/* MOVED DATE FILTERS */}
          <div className="bg-white/5 p-1 rounded-xl flex gap-1 border border-white/10 backdrop-blur-sm overflow-x-auto max-w-full">
            {["1W", "1M", "3M", "1Y"].map((filter) => (
              <button
                key={filter}
                onClick={() => setDateFilter(filter)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${dateFilter === filter
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
        <div className="px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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

        {/* CONTENT AREA */}
        <div className="px-4 md:px-8 pb-12">
          
          {/* ACTION REQUIRED BANNER */}
          {stats.reverifyCount > 0 && (
            <div className="mb-8 bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl flex items-center justify-between animate-pulse-slow">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-full text-orange-500">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-orange-400 text-lg">Action Required: {stats.reverifyCount} ASR Re-verification Requests</h3>
                  <p className="text-slate-400 text-sm">Customers have appealed AI verification failures. Please review and approve manually if valid.</p>
                </div>
              </div>
              <button 
                onClick={navigateToASR}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-black font-bold rounded-lg transition shadow-lg shadow-orange-500/20"
              >
                Review Now
              </button>
            </div>
          )}

          {/* ROAD ISSUES */}
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
                          <span className="text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded border border-red-500/20 font-bold">Critical</span>
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
        </div>
      </div>
    </div>
  );
}
