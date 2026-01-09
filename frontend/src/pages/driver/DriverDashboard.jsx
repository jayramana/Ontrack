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
  
  // Dashboard State
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("1W");
  
  // Data State (Directly populated from Backend)
  const [stats, setStats] = useState({
    total: 0,
    delivered: 0,
    active: 0,
    exceptions: 0,
    completionRate: 0 
  });
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [warehouse, setWarehouse] = useState(null); // Assuming warehouse fetched separately or part of user context in future
                                                    // For now, removing warehouse display or fetching if critical
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        // New Endpoint with timeRange param AND timezone offset
        const offset = new Date().getTimezoneOffset(); // Returns minutes like -330 for +05:30
        const response = await api.get(`/driver/analytics?timeRange=${dateFilter}&timeZoneOffset=${offset}`);
        const data = response.data;
        console.log("Analytics Data DEBUG:", data);

        setStats(data.stats);
        setChartData(data.chartData);
        setPieData(data.pieData);

        // Warehouse info isn't in new analytics payload to keep it lean. 
        // If needed, can fetch from user profile or separate endpoint.
        // setWarehouse(...) 

      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateFilter]);

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
              {/* Warehouse info removed temporarily as it requires separate fetch in new architecture */}
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

              {/* Active (Pending) */}
              <div className="bg-[#1a1f29] p-6 rounded-xl shadow border border-[#1f2937] flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Active (Pending)</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {stats.active}
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
              <div className="bg-[#0b0f14] rounded-xl shadow-sm">
                <DriverChart data={pieData} />
              </div>

              {/* HISTORY CHART - BAR */}
              <div className="bg-[#0b0f14] rounded-xl shadow-sm border border-[#1f2937]">
                {/* Simplified Bar Chart just needs to accept 'data' and render */}
                <DriverBarChart data={chartData} filterType={dateFilter} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}