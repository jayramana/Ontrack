import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
import SenderSidebar from "./SellerSidebar";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

import { BsCheckCircleFill } from "react-icons/bs";
import { MdCurrencyRupee, MdOutlinePendingActions } from "react-icons/md";
import { GoPackage } from "react-icons/go";
import SenderChart from "../../components/charts/Sender/SenderChart";
import SenderRevenueChart from "../../components/charts/Sender/SenderRevenueChart";

function SenderDashboard() {
  const { logout, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [dateFilter, setDateFilter] = useState("1W");

  useEffect(() => {
    const fetchStats = async () => {
      let days = 7;
      if (dateFilter === "1M") days = 30;
      if (dateFilter === "3M") days = 90;
      if (dateFilter === "1Y") days = 365;

      try {
        const response = await api.get(`/seller/analytics?days=${days}`);
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [dateFilter]);

  return (
    <div className="min-h-screen flex bg-[#0b0f14]">
      <SenderSidebar active="dashboard" />

      <div
        className="flex-1 flex flex-col h-screen overflow-y-auto transition-all duration-300"
        onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 10)}
      >
        <header
          className={`sticky top-0 z-40 transition-all duration-300
              ${isScrolled
              ? "bg-[#0b0f14]/60 backdrop-blur-xl"
              : "bg-transparent"
            }
            `}
        >
          <div className="px-4 md:px-8 py-5">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="md:pl-0 pl-12">
                <h1 className="text-3xl font-bold text-white">
                  Sender Dashboard
                </h1>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 p-4 md:p-8">
          {loading ? (
            <p className="text-[#6b4f3a]">Loading analytics...</p>
          ) : (
            <div className="max-w-7xl mx-auto">
              {/* STAT CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Revenue */}
                <div className="bg-linear-to-br from-[#1a1f29] to-[#0f141c] p-6 rounded-xl shadow border border-[#1f2937] flex justify-between items-center">
                  <div>
                    <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                      Total Revenue
                    </p>
                    <p className="text-3xl font-bold text-white mt-2">
                      ₹ {stats?.totalRevenue}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-500/10 rounded-full">
                    <MdCurrencyRupee className="text-3xl text-orange-500" />
                  </div>
                </div>

                {/* Total Orders */}
                <div className="bg-linear-to-br from-[#1a1f29] to-[#0f141c] p-6 rounded-xl shadow border border-[#1f2937] flex justify-between items-center">
                  <div>
                    <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                      Total Orders
                    </p>
                    <p className="text-3xl font-bold text-white mt-2">
                      {stats?.totalOrders}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-full">
                    <GoPackage className="text-3xl text-blue-500" />
                  </div>
                </div>

                {/* Pending Orders */}
                <div className="bg-linear-to-br from-[#1a1f29] to-[#0f141c] p-6 rounded-xl shadow border border-[#1f2937] flex justify-between items-center">
                  <div>
                    <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                      Pending Orders
                    </p>
                    <p className="text-3xl font-bold text-white mt-2">
                      {stats?.pendingOrders}
                    </p>
                  </div>
                  <div className="p-3 bg-amber-500/10 rounded-full">
                    <MdOutlinePendingActions className="text-3xl text-amber-500" />
                  </div>
                </div>

                {/* Delivered Orders */}
                <div className="bg-linear-to-br from-[#1a1f29] to-[#0f141c] p-6 rounded-xl shadow border border-[#1f2937] flex justify-between items-center">
                  <div>
                    <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                      Delivered Orders
                    </p>
                    <p className="text-3xl font-bold text-white mt-2">
                      {stats?.deliveredOrders}
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-500/10 rounded-full">
                    <BsCheckCircleFill className="text-3xl text-emerald-500" />
                  </div>
                </div>
              </div>

              {/* CHARTS */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
                <h2 className="text-xl font-bold text-white">Analytics Overview</h2>

                {/* DATE FILTERS */}
                <div className="bg-[#1a1f29] p-1 rounded-xl flex gap-1 border border-white/5 overflow-x-auto max-w-full">
                  {["1W", "1M", "3M", "1Y"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setDateFilter(filter)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${dateFilter === filter
                        ? "bg-[#ff8a3d]/20 text-[#ff8a3d] border border-[#ff8a3d]/50 shadow-lg shadow-orange-500/10"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-[#0b0f14] rounded-xl shadow border border-[#1f2937]">
                  <SenderRevenueChart data={stats?.revenueChart} />
                </div>

                {/* Status Chart */}
                <div className="bg-[#0b0f14] rounded-xl shadow border border-[#1f2937]">
                  <SenderChart data={stats?.statusDistribution} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SenderDashboard;
