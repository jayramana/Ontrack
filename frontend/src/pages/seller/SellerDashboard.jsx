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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/seller/analytics");
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen flex bg-[#0b0f14]">
      <SenderSidebar active="dashboard" />

      <div
        className="flex-1 flex flex-col h-screen overflow-y-auto transition-all duration-300"
        onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 10)}
      >
        <header
          className={`sticky top-0 z-40 transition-all duration-300
              ${
                isScrolled
                  ? "bg-[#0b0f14]/60 backdrop-blur-xl"
                  : "bg-transparent"
              }
            `}
        >
          <div className="px-8 py-5">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Sender Dashboard
                </h1>
                {/* <p className="text-sm mt-1">
                  Welcome, {user?.first_name} {user?.last_name}!
                </p> */}
              </div>
              {/* <button
                onClick={logout}
                className="px-4 py-2 bg-[#351c15] text-white rounded-lg shadow hover:bg-[#4a2a21]"
              >
                Logout
              </button> */}
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 p-8">
          {loading ? (
            <p className="text-[#6b4f3a]">Loading analytics...</p>
          ) : (
            <div className="max-w-7xl mx-auto">
              {/* STAT CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
