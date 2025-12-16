import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import SenderSidebar from "./SellerSidebar";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function SenderDashboard() {
    const { logout, user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/seller/analytics');
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Chart Data Preparation
    const revenueData = {
        labels: stats?.revenueChart?.map(d => d.date) || [],
        datasets: [
            {
                label: 'Revenue (₹)',
                data: stats?.revenueChart?.map(d => d.amount) || [],
                borderColor: '#ffb500',
                backgroundColor: 'rgba(255, 181, 0, 0.5)',
                tension: 0.4,
            },
        ],
    };

    const statusData = {
        labels: stats?.statusDistribution?.map(d => d.status) || [],
        datasets: [
            {
                data: stats?.statusDistribution?.map(d => d.count) || [],
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                ],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="min-h-screen flex bg-[#f8f4ef]">
            <SenderSidebar active="dashboard" />

            <div className="flex-1 flex flex-col">
                {/* HEADER */}
                <header className="bg-[#f8f4ef] shadow-sm border-b border-[#e6ddc5]">
                    <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-[#351c15]">Sender Dashboard</h1>
                            <p className="text-[#6f4e37] text-sm mt-1">
                                Welcome, {user?.first_name} {user?.last_name}!
                            </p>
                        </div>
                        <button onClick={logout} className="px-4 py-2 bg-[#351c15] text-white rounded-lg shadow hover:bg-[#4a2a21]">
                            Logout
                        </button>
                    </div>
                </header>

                {/* CONTENT */}
                <div className="flex-1 p-8 overflow-auto">
                    {loading ? (
                        <p className="text-[#6b4f3a]">Loading analytics...</p>
                    ) : (
                        <div className="max-w-7xl mx-auto">
                            
                            {/* STAT CARDS */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                <div className="bg-white p-6 rounded-xl shadow border border-[#e6d8c9]">
                                    <p className="text-sm text-gray-500 font-semibold uppercase">Total Revenue</p>
                                    <p className="text-2xl font-bold text-[#351c15] mt-1">₹{stats?.totalRevenue}</p>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow border border-[#e6d8c9]">
                                    <p className="text-sm text-gray-500 font-semibold uppercase">Total Orders</p>
                                    <p className="text-2xl font-bold text-[#351c15] mt-1">{stats?.totalOrders}</p>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow border border-[#e6d8c9]">
                                    <p className="text-sm text-gray-500 font-semibold uppercase">Pending Orders</p>
                                    <p className="text-2xl font-bold text-yellow-600 mt-1">{stats?.pendingOrders}</p>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow border border-[#e6d8c9]">
                                    <p className="text-sm text-gray-500 font-semibold uppercase">Delivered Orders</p>
                                    <p className="text-2xl font-bold text-green-600 mt-1">{stats?.deliveredOrders}</p>
                                </div>
                            </div>

                            {/* CHARTS */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Revenue Chart */}
                                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow border border-[#e6d8c9]">
                                    <h2 className="text-lg font-bold text-[#351c15] mb-4">Revenue Trend (Last 7 Days)</h2>
                                    <div className="h-64">
                                        <Line data={revenueData} options={{ maintainAspectRatio: false }} />
                                    </div>
                                </div>

                                {/* Status Chart */}
                                <div className="bg-white p-6 rounded-xl shadow border border-[#e6d8c9]">
                                    <h2 className="text-lg font-bold text-[#351c15] mb-4">Order Status</h2>
                                    <div className="h-64 flex justify-center">
                                        <Doughnut data={statusData} options={{ maintainAspectRatio: false }} />
                                    </div>
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
