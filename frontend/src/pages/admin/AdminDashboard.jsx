<<<<<<< HEAD
import React from "react";
import AdminSidebar from "./AdminSidebar";

export default function AdminDashboard() {
  // static summary numbers (replace with real data later)
  const stats = {
    activeDeliveries: 3,
    failed: 1,
    activeASR: 2,
    openQueries: 2,
    successRate: "87.3%",
    avgTime: "42 min",
    total: "1,247",
  };
=======
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const [drivers, setDrivers] = useState([]);
    const [selectedDrivers, setSelectedDrivers] = useState({});
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeOrders: 0,
        drivers: 0,
        warehouses: 0
    });
    const [pendingOrders, setPendingOrders] = useState([]);
    const [assignedOrders, setAssignedOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dashboardRes, pendingRes, assignedRes, driversRes] = await Promise.all([
                    api.get('/admin/dashboard'),
                    api.get('/orders/pending'),
                    api.get('/orders/assigned'),
                    api.get('/admin/drivers')
                ]);

                setStats({
                    totalUsers: dashboardRes.data.drivers.length + 5,
                    activeOrders: dashboardRes.data.orders.length,
                    drivers: dashboardRes.data.drivers.length,
                    warehouses: 1
                });
                setPendingOrders(pendingRes.data);
                setAssignedOrders(assignedRes.data);
                setDrivers(driversRes.data);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleDriverSelect = (orderId, driverId) => {
        setSelectedDrivers(prev => ({ ...prev, [orderId]: driverId }));
    };

    const handleAssign = async (orderId) => {
        const driverId = selectedDrivers[orderId];
        if (!driverId) {
            alert("Please select a driver first.");
            return;
        }

        try {
            await api.post(`/orders/${orderId}/assign-driver`, parseInt(driverId));
            // Refresh pending and assigned orders
            const pendingRes = await api.get('/orders/pending');
            const assignedRes = await api.get('/orders/assigned');
            setPendingOrders(pendingRes.data);
            setAssignedOrders(assignedRes.data);
            alert("Order assigned successfully!");
        } catch (error) {
            console.error("Error assigning order:", error);
            alert("Failed to assign order.");
        }
    };
>>>>>>> origin/route

  const liveDeliveries = [
    { id: "DEL-2024-001", address: "123 Main St, New York, NY 10001", tag: "ASR", status: "Out for Delivery" },
    { id: "DEL-2024-002", address: "456 Oak Ave, Brooklyn, NY 11201", tag: "", status: "Pending" },
    { id: "DEL-2024-005", address: "555 Broadway, New York, NY 10012", tag: "ASR", status: "Out for Delivery" }
  ];

<<<<<<< HEAD
  const failed = [
    { id: "DEL-2024-004", name: "Jane Smith", label: "Attempted" }
  ];

  return (
    <div className="min-h-screen flex bg-gray-100">
      <AdminSidebar active="dashboard" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
          </div>
=======
            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {/* Stats Cards */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Users</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
                            </div>
                            <div className="bg-blue-100 rounded-full p-3">
                                <span className="text-2xl">👥</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Orders</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeOrders}</p>
                            </div>
                            <div className="bg-green-100 rounded-full p-3">
                                <span className="text-2xl">📦</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Drivers</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.drivers}</p>
                            </div>
                            <div className="bg-yellow-100 rounded-full p-3">
                                <span className="text-2xl">🚚</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Warehouses</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.warehouses}</p>
                                <a href="/admin/warehouses" className="text-sm text-blue-600 hover:underline">Manage</a>
                            </div>
                            <div className="bg-purple-100 rounded-full p-3">
                                <span className="text-2xl">🏭</span>
                            </div>
                        </div>
                    </div>

                    {/* Phase 5: Quick Actions */}
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg shadow-lg p-6 text-white mt-6">
                        <h3 className="text-xl font-semibold mb-4">🚀 Advanced Features</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <a
                                href="/admin/transports"
                                className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition"
                            >
                                <div className="text-3xl mb-2">🚚</div>
                                <div className="font-semibold">Transport Scheduler</div>
                                <div className="text-sm opacity-90">Hub-to-Hub Routing</div>
                            </a>
                            <a
                                href="/admin/capacity"
                                className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition"
                            >
                                <div className="text-3xl mb-2">📊</div>
                                <div className="font-semibold">Capacity Monitor</div>
                                <div className="text-sm opacity-90">Real-time Tracking</div>
                            </a>
                            <a
                                href="/admin/warehouses"
                                className="bg-white bg-opacity-30 hover:bg-opacity-30 rounded-lg p-4 text-center transition"
                            >
                                <div className="text-3xl mb-2">🏭</div>
                                <div className="font-semibold">Warehouses</div>
                                <div className="text-sm opacity-90">Manage Hubs</div>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Pending Orders Section */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Unassigned Orders</h2>
                    {loading ? (
                        <p>Loading...</p>
                    ) : pendingOrders.length === 0 ? (
                        <p className="text-gray-500">No pending orders.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assign Driver</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {pendingOrders.map((order) => (
                                        <tr key={order.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <div className="font-medium">Pickup: {order.pickupAddress}</div>
                                                <div>Drop: {order.receiverAddress}</div>
                                                <div className="text-xs text-gray-400">Weight: {order.weight}kg</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.deliveryType === 'ASR' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                    {order.deliveryType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <select
                                                    className="border rounded p-1"
                                                    value={selectedDrivers[order.id] || ''}
                                                    onChange={(e) => handleDriverSelect(order.id, e.target.value)}
                                                >
                                                    <option value="">Select Driver</option>
                                                    {drivers.map(d => (
                                                        <option key={d.id} value={d.id}>{d.name} {d.isAvailable ? '(Avail)' : '(Busy)'}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleAssign(order.id)}
                                                    className="text-blue-600 hover:text-blue-900 font-bold disabled:opacity-50"
                                                    disabled={!selectedDrivers[order.id]}
                                                >
                                                    Assign
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Assigned Orders Section */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Assigned Orders</h2>
                    {loading ? (
                        <p>Loading...</p>
                    ) : assignedOrders.length === 0 ? (
                        <p className="text-gray-500">No assigned orders.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {assignedOrders.map((order) => (
                                        <tr key={order.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <div className="font-medium">Pickup: {order.pickupAddress}</div>
                                                <div>Drop: {order.receiverAddress}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {drivers.find(d => d.id === order.driverId)?.name || 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
>>>>>>> origin/route
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">🚚</div>
            <div>
              <div className="text-2xl font-bold">{stats.activeDeliveries}</div>
              <div className="text-sm text-gray-500">Active Deliveries</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow flex items-center gap-4">
            <div className="bg-red-50 p-3 rounded-lg">❌</div>
            <div>
              <div className="text-2xl font-bold">{stats.failed}</div>
              <div className="text-sm text-gray-500">Failed/Attempted</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow flex items-center gap-4">
            <div className="bg-yellow-50 p-3 rounded-lg">🛡️</div>
            <div>
              <div className="text-2xl font-bold">{stats.activeASR}</div>
              <div className="text-sm text-gray-500">Active ASR</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow flex items-center gap-4">
            <div className="bg-teal-50 p-3 rounded-lg">💬</div>
            <div>
              <div className="text-2xl font-bold">{stats.openQueries}</div>
              <div className="text-sm text-gray-500">Open Queries</div>
            </div>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 p-6 rounded-xl shadow">
            <div className="text-sm">Success Rate</div>
            <div className="text-3xl font-bold text-green-600">{stats.successRate}</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <div className="text-sm">Avg Delivery Time</div>
            <div className="text-3xl font-bold">{stats.avgTime}</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <div className="text-sm">Total Deliveries</div>
            <div className="text-3xl font-bold">{stats.total}</div>
          </div>
        </div>

        {/* Live / Failed panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Live */}
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">📦 Live Delivery Overview</h2>
              <div className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">3 Active</div>
            </div>

            <div className="space-y-3">
              {liveDeliveries.map((d) => (
                <div key={d.id} className="border rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <div className="text-xs text-gray-500">{d.id} {d.tag && <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">{d.tag}</span>}</div>
                    <div className="font-medium">{d.address}</div>
                  </div>
                  <div className="text-sm text-gray-500">{d.status && <span className="inline-block bg-blue-50 px-3 py-1 rounded text-blue-600 text-xs">{d.status}</span>}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Failed */}
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">❗ Failed Deliveries</h2>
              <div className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded">1 Issues</div>
            </div>

            <div className="space-y-3">
              {failed.map((f) => (
                <div key={f.id} className="bg-red-50 border border-red-100 rounded-lg p-3">
                  <div className="text-sm text-gray-600">{f.id}</div>
                  <div className="font-medium">{f.name}</div>
                  <div className="text-xs text-yellow-600 inline-block mt-2 bg-yellow-50 px-3 py-1 rounded">{f.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}
