// ANALYTICS DRIVER DASHBOARD
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import DriverSidebar from "./DriverSidebar";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
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
  const [loading, setLoading] = useState(true);
  const [warehouse, setWarehouse] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch ALL orders (history + today) for better analytics
        // Using the new dedicated analytics endpoint
        const response = await api.get("/driver/orders/today/analytics");
        const orders = response.data || [];

        if (orders.length > 0) {
            setWarehouse(orders[0].currentWarehouse);
        }

        // Calculate Stats
        const delivered = orders.filter((o) => o.status === "Delivered").length;
        const pending = orders.filter((o) => o.status !== "Delivered" && o.status !== "Cancelled").length;
        const exceptions = orders.filter((o) => o.status === "DeliveryAttempted" || o.status === "Cancelled").length;
        
        const highPriority = orders.filter((o) => o.priority === 1 && o.status === "Delivered").length;
        const normalPriority = orders.filter((o) => o.priority === 2 && o.status === "Delivered").length;

        setStats({
          total: orders.length,
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

    fetchAnalytics();
  }, []);

  // CHART DATA
  const statusData = {
    labels: ["Delivered", "Pending", "Exceptions"],
    datasets: [
      {
        data: [stats.delivered, stats.pending, stats.exceptions],
        backgroundColor: ["#15803d", "#f9b400", "#ef4444"], // Green, Yellow, Red
        borderColor: ["#14532d", "#b45309", "#7f1d1d"],
        borderWidth: 1,
      },
    ],
  };

  const priorityData = {
    labels: ["High Priority", "Normal Priority"],
    datasets: [
      {
        label: "Completed Deliveries",
        data: [stats.highPriority, stats.normalPriority],
        backgroundColor: ["#dc2626", "#3b82f6"], // Red, Blue
      },
    ],
  };

  
  return (
    <div className="min-h-screen flex bg-[#f7f3ef]">
      <DriverSidebar active="dashboard" />

      <div className="flex-1 overflow-y-auto">
        {/* HEADER */}
        <header className="bg-[#fff8e7] border-b border-[#e6ddc5] shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black text-[#351c15]">
                Performance Dashboard
              </h1>
              <p className="text-[#6f4e37]">
                Welcome back, {user?.first_name}. Here is your performance overview.
              </p>
            </div>
             {warehouse && (
                <div className="text-right">
                  <p className="text-xs text-[#6f4e37] uppercase font-bold">Base Location</p>
                  <p className="text-[#351c15] font-bold">{warehouse.name}</p>
                  <p className="text-xs text-[#f9b400] font-bold">{warehouse.city}</p>
                </div>
              )}
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-8">
            
            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-6 rounded-xl border border-[#e6ddc5] shadow-sm">
                    <p className="text-[#6f4e37] font-bold text-sm uppercase">Completion Rate</p>
                    <p className="text-4xl font-black text-[#351c15] mt-2">
                        {stats.total > 0 ? Math.round((stats.delivered / stats.total) * 100) : 0}%
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Daily Target: 95%</p>
                </div>

                 <div className="bg-white p-6 rounded-xl border border-[#e6ddc5] shadow-sm">
                    <p className="text-[#6f4e37] font-bold text-sm uppercase">Total Jobs</p>
                    <p className="text-4xl font-black text-[#351c15] mt-2">{stats.total}</p>
                    <p className="text-xs text-gray-400 mt-1">Assigned Today</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-[#e6ddc5] shadow-sm">
                    <p className="text-[#6f4e37] font-bold text-sm uppercase">Pending</p>
                    <p className="text-4xl font-black text-[#f9b400] mt-2">{stats.pending}</p>
                    <p className="text-xs text-gray-400 mt-1">Remaining Stops</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-[#e6ddc5] shadow-sm">
                    <p className="text-[#6f4e37] font-bold text-sm uppercase">Exceptions</p>
                    <p className="text-4xl font-black text-red-600 mt-2">{stats.exceptions}</p>
                    <p className="text-xs text-gray-400 mt-1">Failed / Cancelled</p>
                </div>
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                
                {/* STATUS CHART */}
                <div className="bg-white p-8 rounded-xl border border-[#e6ddc5] shadow-sm">
                    <h3 className="text-xl font-bold text-[#351c15] mb-6 border-b border-[#eee] pb-4">
                        Delivery Status Breakdown
                    </h3>
                    <div className="h-64 flex justify-center">
                        <Doughnut data={statusData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>

                {/* PRIORITY CHART */}
                <div className="bg-white p-8 rounded-xl border border-[#e6ddc5] shadow-sm">
                    <h3 className="text-xl font-bold text-[#351c15] mb-6 border-b border-[#eee] pb-4">
                        Completed by Priority
                    </h3>
                    <div className="h-64">
                         <Bar 
                            data={priorityData} 
                            options={{ 
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } }
                            }} 
                        />
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
}
