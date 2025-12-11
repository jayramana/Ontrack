import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import AdminSidebar from "../admin/AdminSidebar"; // <-- Add correct path

const CapacityDashboard = () => {
    const { logout } = useAuth();
    const [capacities, setCapacities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCapacities();
        const interval = setInterval(fetchCapacities, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchCapacities = async () => {
        try {
            const res = await api.get('/warehouse/capacity/all');
            setCapacities(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching capacities:', error);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            Normal: 'bg-green-500',
            Warning: 'bg-yellow-500',
            Critical: 'bg-red-500'
        };
        return colors[status] || 'bg-gray-500';
    };

    const getStatusIcon = (status) => {
        const icons = {
            Normal: '✅',
            Warning: '⚠️',
            Critical: '🚨'
        };
        return icons[status] || '📦';
    };

    return (
        <div className="min-h-screen flex bg-[#f8f4ef]">

            {/* SIDEBAR */}
            <AdminSidebar active="capacity" />

            {/* MAIN CONTENT */}
            <div className="flex-1 px-8 py-6">

                {/* Header */}
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[#351c15]">
                            Warehouse Capacity Monitor
                        </h1>
                        <p className="text-[#6b4f3a]">
                            Live monitoring of warehouse load & usage levels
                        </p>
                    </div>

                    <button
                        onClick={logout}
                        className="px-4 py-2 bg-[#ffb500] text-[#351c15] font-semibold rounded-lg hover:bg-[#e6a300] transition"
                    >
                        Logout
                    </button>
                </header>

                {/* Content Section */}
                <main>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffb500]"></div>
                            <p className="mt-4 text-[#6b4f3a]">Loading capacity data...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {capacities.map((warehouse) => (
                                <div
                                    key={warehouse.warehouseId}
                                    className="bg-white rounded-xl shadow-lg border border-[#e6d8c9] overflow-hidden"
                                >
                                    <div className="p-6">

                                        {/* Title Row */}
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-xl font-semibold text-[#351c15]">
                                                {warehouse.warehouseName}
                                            </h3>
                                            <span className="text-3xl">{getStatusIcon(warehouse.status)}</span>
                                        </div>

                                        {/* Capacity Bar */}
                                        <div className="mb-4">
                                            <div className="flex justify-between text-sm text-[#6b4f3a] mb-2">
                                                <span>Capacity Usage</span>
                                                <span className="font-bold text-[#351c15]">
                                                    {warehouse.percentage.toFixed(1)}%
                                                </span>
                                            </div>

                                            <div className="w-full bg-[#f0e6d8] rounded-full h-4 overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-500 ${getStatusColor(
                                                        warehouse.status
                                                    )}`}
                                                    style={{ width: `${Math.min(warehouse.percentage, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Capacity Stats */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-[#fff4d0] p-3 rounded">
                                                <p className="text-xs text-[#6b4f3a] mb-1">Current Capacity</p>
                                                <p className="text-lg font-bold text-[#351c15]">
                                                    {warehouse.currentCapacity.toFixed(1)} m³
                                                </p>
                                            </div>

                                            <div className="bg-[#f8f4ef] p-3 rounded">
                                                <p className="text-xs text-[#6b4f3a] mb-1">Max Capacity</p>
                                                <p className="text-lg font-bold text-[#4e2a1f]">
                                                    {warehouse.maxCapacity.toFixed(1)} m³
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="mt-4">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold
                                                ${
                                                    warehouse.status === 'Critical'
                                                        ? 'bg-red-100 text-red-700'
                                                        : warehouse.status === 'Warning'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-green-100 text-green-700'
                                                }`}
                                            >
                                                {warehouse.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* System Overview */}
                    <div className="mt-8 bg-white p-6 rounded-lg shadow border border-[#e6d8c9]">
                        <h3 className="text-lg font-semibold mb-4 text-[#351c15]">
                            📈 System Overview
                        </h3>

                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-3xl font-bold text-green-600">
                                    {capacities.filter((c) => c.status === 'Normal').length}
                                </p>
                                <p className="text-sm text-[#6b4f3a]">Normal</p>
                            </div>

                            <div>
                                <p className="text-3xl font-bold text-yellow-600">
                                    {capacities.filter((c) => c.status === 'Warning').length}
                                </p>
                                <p className="text-sm text-[#6b4f3a]">Warning</p>
                            </div>

                            <div>
                                <p className="text-3xl font-bold text-red-600">
                                    {capacities.filter((c) => c.status === 'Critical').length}
                                </p>
                                <p className="text-sm text-[#6b4f3a]">Critical</p>
                            </div>
                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
};

export default CapacityDashboard;
