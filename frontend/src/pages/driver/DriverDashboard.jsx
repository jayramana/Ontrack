// ANALYTICS DRIVER DASHBOARD
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import DriverSidebar from "./DriverSidebar";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";
import DriverChart from "../../components/charts/Driver/DriverChart"; // Pie Chart
import DriverBarChart from "../../components/charts/Driver/DriverBarChart"; // Bar Chart
import { BsCheckCircleFill, BsExclamationTriangleFill } from "react-icons/bs";
import { MdOutlinePendingActions, MdWork } from "react-icons/md";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function DriverDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    delivered: 0,
    pending: 0,
    exceptions: 0,
    highPriority: 0,
    normalPriority: 0,
  });
  const [weeklyStats, setWeeklyStats] = useState({
    delivered: 0,
    pending: 0,
    exceptions: 0
  });
  const [orders, setOrders] = useState([]); // Store full orders for Bar Chart
  const [loading, setLoading] = useState(true);
  const [warehouse, setWarehouse] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [dateFilter, setDateFilter] = useState("1W");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get("/driver/orders/today/analytics");
        const fetchedOrders = response.data || [];
        setOrders(fetchedOrders);

        if (fetchedOrders.length > 0) {
          setWarehouse(fetchedOrders[0].currentWarehouse);
        }

        // Calculate Overall Stats
        const delivered = fetchedOrders.filter((o) => o.status === "Delivered").length;
        const pending = fetchedOrders.filter((o) => o.status !== "Delivered" && o.status !== "Cancelled").length;
        const exceptions = fetchedOrders.filter((o) => o.status === "DeliveryAttempted" || o.status === "Cancelled").length;

        const highPriority = fetchedOrders.filter((o) => o.priority === 1 && o.status === "Delivered").length;
        const normalPriority = fetchedOrders.filter((o) => o.priority === 2 && o.status === "Delivered").length;

        setStats({
          total: fetchedOrders.length,
          delivered,
          pending,
          exceptions,
          highPriority,
          normalPriority,
        });

        // Calculate Weekly Stats (Last 7 Days)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const weeklyOrders = fetchedOrders.filter(o => {
          const orderDate = new Date(o.scheduledDate);
          return orderDate >= oneWeekAgo;
        });

        const weeklyDelivered = weeklyOrders.filter((o) => o.status === "Delivered").length;
        const weeklyPending = weeklyOrders.filter((o) => o.status !== "Delivered" && o.status !== "Cancelled").length;
        const weeklyExceptions = weeklyOrders.filter((o) => o.status === "DeliveryAttempted" || o.status === "Cancelled").length;

        setWeeklyStats({
          delivered: weeklyDelivered,
          pending: weeklyPending,
          exceptions: weeklyExceptions
        });

      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const [filteredOrders, setFilteredOrders] = useState([]);

  useEffect(() => {
    const now = new Date();
    const past = new Date();

    if (dateFilter === "1Y") past.setDate(past.getDate() - 365);
    else if (dateFilter === "3M") past.setDate(past.getDate() - 90);
    else if (dateFilter === "1M") past.setDate(past.getDate() - 30);
    else past.setDate(past.getDate() - 7);

    const filtered = orders.filter(o => {
      if (!o.scheduledDate) return false;
      const d = new Date(o.scheduledDate);
      return d >= past && d <= now;
    });
    setFilteredOrders(filtered);

  }, [orders, dateFilter]);

  // USING FILTERED ORDERS FOR CHARTS
  const chartDelivered = filteredOrders.filter((o) => o.status === "Delivered").length;
  const chartPending = filteredOrders.filter((o) => o.status !== "Delivered" && o.status !== "Cancelled").length;
  const chartExceptions = filteredOrders.filter((o) => o.status === "DeliveryAttempted" || o.status === "Cancelled").length;

  const pieData = [
    { status: "Delivered", count: chartDelivered },
    { status: "Pending", count: chartPending },
    { status: "Exceptions", count: chartExceptions }
  ];

  return (
    <div className="min-h-screen flex bg-[#0b0f14]" style={{ backgroundImage: 'none', backgroundColor: '#0b0f14' }}>
      <DriverSidebar active="dashboard" />

      <div
        className="flex-1 flex flex-col h-screen overflow-y-auto transition-all duration-300 custom-scrollbar"
        onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 10)}
      >
        {/* HEADER */}
        <header
          className={`sticky top-0 z-40 transition-all duration-300
              ${isScrolled
              ? "bg-[#0b0f14] border-b border-white/10"
              : "bg-transparent"
            }
            `}
        >
          <div className="px-4 md:px-8 py-5">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="md:pl-0 pl-12">
                <h1 className="text-3xl font-bold text-white">
                  Performance Dashboard
                </h1>
              </div>
              {warehouse && (
                <div className="text-right hidden md:block">
                  <p className="text-xs text-gray-500 font-bold">Base Location</p>
                  <p className="text-white font-bold">{warehouse.name}</p>
                  <p className="text-xs text-orange-500 font-bold">{warehouse.city}</p>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Completion Rate */}
              <div className="bg-[#1a1f29] p-6 rounded-xl shadow border border-[#1f2937] flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Completion Rate</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {stats.total > 0 ? Math.round((stats.delivered / stats.total) * 100) : 0}%
                  </p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-full">
                  <BsCheckCircleFill className="text-3xl text-emerald-500" />
                </div>
              </div>

              {/* Total Jobs */}
              <div className="bg-[#1a1f29] p-6 rounded-xl shadow border border-[#1f2937] flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Jobs</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {stats.total}
                  </p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <MdWork className="text-3xl text-blue-500" />
                </div>
              </div>

              {/* Pending */}
              <div className="bg-[#1a1f29] p-6 rounded-xl shadow border border-[#1f2937] flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Pending</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {stats.pending}
                  </p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-full">
                  <MdOutlinePendingActions className="text-3xl text-amber-500" />
                </div>
              </div>

              {/* Exceptions */}
              <div className="bg-[#1a1f29] p-6 rounded-xl shadow border border-[#1f2937] flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Exceptions</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {stats.exceptions}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Failed / Cancelled</p>
                </div>
                <div className="p-3 bg-red-500/10 rounded-full">
                  <BsExclamationTriangleFill className="text-3xl text-red-500" />
                </div>
              </div>
            </div>

            {/* FILTERS & CHARTS HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <BsCheckCircleFill className="text-[#ff8a3d]" size={20} /> Performance Analytics
                </h2>
              </div>

              {/* DATE FILTERS */}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

              {/* STATUS CHART - PIE */}
              <div className="bg-[#0b0f14] rounded-xl shadow-sm border border-[#1f2937]">
                <DriverChart data={pieData} />
              </div>

              {/* STATUS HISTORY CHART - BAR */}
              <div className="bg-[#0b0f14] rounded-xl shadow-sm border border-[#1f2937]">
                {/* Pass filtered orders to bar chart */}
                <DriverBarChart data={filteredOrders} />
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}