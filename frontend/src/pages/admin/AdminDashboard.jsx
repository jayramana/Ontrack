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

    // const handleAssign = async (orderId) => {
    //     const driverId = selectedDrivers[orderId];
    //     if (!driverId) {
    //         alert("Please select a driver first.");
    //         return;
    //     }

    //     try {
    //         await api.post(`/orders/${orderId}/assign-driver`, parseInt(driverId));
    //         // Refresh pending and assigned orders
    //         const pendingRes = await api.get('/orders/pending');
    //         const assignedRes = await api.get('/orders/assigned');
    //         setPendingOrders(pendingRes.data);
    //         setAssignedOrders(assignedRes.data);
    //         alert("Order assigned successfully!");
    //     } catch (error) {
    //         console.error("Error assigning order:", error);
    //         alert("Failed to assign order.");
    //     }
    // };

    // ✅ FIXED: Correct API Endpoint
    const handleAssign = async (orderId) => {
        const driverId = selectedDrivers[orderId];
        if (!driverId) {
            alert("Please select a driver first.");
            return;
        }

        try {
            await api.post(`/admin/assign-driver/${orderId}/${driverId}`);

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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                            <p className="text-sm text-gray-600 mt-1">Welcome back, {user?.name}!</p>
                        </div>
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-200"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

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
        </div>
    );
};

export default AdminDashboard;
