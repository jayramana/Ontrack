import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const WarehouseDashboard = () => {
    const { user, logout } = useAuth();
    const [warehouses, setWarehouses] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [orders, setOrders] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                const res = await api.get('/warehouse');
                setWarehouses(res.data);
                if (res.data.length > 0) {
                    setSelectedWarehouse(res.data[0].id);
                }
            } catch (error) {
                console.error("Error fetching warehouses:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchWarehouses();
    }, []);

    useEffect(() => {
        if (!selectedWarehouse) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch orders
                const ordersRes = await api.get(`/warehouse/${selectedWarehouse}/orders`);
                setOrders(ordersRes.data);

                // Fetch statistics
                const statsRes = await api.get(`/warehouse/${selectedWarehouse}/statistics`);
                setStatistics(statsRes.data);
            } catch (error) {
                console.error("Error fetching warehouse data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedWarehouse]);

    const selectedWarehouseData = warehouses.find(w => w.id === selectedWarehouse);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Warehouse Dashboard</h1>
                            <p className="text-sm text-gray-600 mt-1">Manage Tamil Nadu District Warehouses</p>
                        </div>
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Warehouse Selector */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select District Warehouse
                    </label>
                    <select
                        value={selectedWarehouse || ''}
                        onChange={(e) => setSelectedWarehouse(Number(e.target.value))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="">-- Select a Warehouse --</option>
                        {warehouses.map(warehouse => (
                            <option key={warehouse.id} value={warehouse.id}>
                                {warehouse.name} - {warehouse.city} ({warehouse.pincode})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Warehouse Info & Statistics */}
                {selectedWarehouseData && statistics && (
                    <div className="mb-6">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg shadow-lg p-6 mb-6">
                            <h2 className="text-2xl font-bold mb-2">{statistics.warehouseName}</h2>
                            <p className="text-blue-100">{statistics.city}, Tamil Nadu - {statistics.pincode}</p>
                        </div>

                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            {/* Pickups from this district */}
                            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Orders from District</p>
                                        <p className="text-xs text-gray-500 mt-1">Pickup / Sent</p>
                                        <p className="text-3xl font-bold text-green-600 mt-2">
                                            {statistics.statistics.totalPickups}
                                        </p>
                                    </div>
                                    <div className="text-green-500 text-4xl">📤</div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Senders placed from {statistics.city}</p>
                            </div>

                            {/* Deliveries to this district */}
                            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Orders to District</p>
                                        <p className="text-xs text-gray-500 mt-1">Delivery / Receive</p>
                                        <p className="text-3xl font-bold text-blue-600 mt-2">
                                            {statistics.statistics.totalDeliveries}
                                        </p>
                                    </div>
                                    <div className="text-blue-500 text-4xl">📥</div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Customers in {statistics.city}</p>
                            </div>

                            {/* Currently at warehouse */}
                            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">At Warehouse</p>
                                        <p className="text-xs text-gray-500 mt-1">Current Stock</p>
                                        <p className="text-3xl font-bold text-orange-600 mt-2">
                                            {statistics.statistics.currentlyAtWarehouse}
                                        </p>
                                    </div>
                                    <div className="text-orange-500 text-4xl">📦</div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Packages at facility</p>
                            </div>
                        </div>

                        {/* Secondary Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="bg-white rounded-lg shadow p-4">
                                <p className="text-sm text-gray-600">Pending Assignment</p>
                                <p className="text-2xl font-bold text-yellow-600">{statistics.statistics.pendingAssignment}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-4">
                                <p className="text-sm text-gray-600">In Transit</p>
                                <p className="text-2xl font-bold text-indigo-600">{statistics.statistics.inTransit}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-4">
                                <p className="text-sm text-gray-600">Delivered</p>
                                <p className="text-2xl font-bold text-green-600">{statistics.statistics.delivered}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Orders List */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Orders ({orders.length})
                        </h3>
                    </div>
                    <div className="p-6">
                        {loading && <p className="text-gray-500 text-center py-8">Loading...</p>}

                        {!loading && orders.length === 0 && (
                            <p className="text-gray-500 text-center py-8">
                                No orders found for this warehouse
                            </p>
                        )}

                        {!loading && orders.length > 0 && (
                            <div className="space-y-4">
                                {orders.map(order => (
                                    <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="font-semibold text-gray-900">Order #{order.id}</p>
                                                <p className="text-sm text-gray-600">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'InTransit' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-500">From</p>
                                                <p className="font-medium">{order.pickupAddress}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">To</p>
                                                <p className="font-medium">{order.receiverAddress}</p>
                                            </div>
                                        </div>
                                        {order.driver && (
                                            <div className="mt-2 text-sm">
                                                <span className="text-gray-500">Driver:</span>
                                                <span className="ml-2 font-medium">{order.driver.name}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WarehouseDashboard;
