import { useState, useEffect } from 'react';
import api from '../../services/api';

const DriverDetailsModal = ({ driverId, onClose }) => {
    const [driverData, setDriverData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDriverDetails = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/admin/driver/${driverId}`);
                setDriverData(response.data);
            } catch (err) {
                console.error('Error fetching driver details:', err);
                setError('Failed to load driver details');
            } finally {
                setLoading(false);
            }
        };

        if (driverId) {
            fetchDriverDetails();
        }
    }, [driverId]);

    if (!driverId) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 flex justify-between items-center rounded-t-xl">
                    <div>
                        <h2 className="text-2xl font-bold">Driver Details</h2>
                        {driverData && (
                            <p className="text-sm text-indigo-100 mt-1">
                                Driver ID: {driverData.driver.id}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-200 text-3xl leading-none"
                    >
                        &times;
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-red-600">{error}</p>
                            <button
                                onClick={onClose}
                                className="mt-4 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                                Close
                            </button>
                        </div>
                    ) : driverData ? (
                        <div className="space-y-6">
                            {/* Driver Information */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <span className="text-3xl mr-3">👤</span>
                                    Driver Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Name</p>
                                        <p className="text-lg font-semibold text-gray-900">{driverData.driver.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Email</p>
                                        <p className="font-medium text-gray-700">{driverData.driver.email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Phone</p>
                                        <p className="font-medium text-gray-700">{driverData.driver.phoneNumber || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Availability</p>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                                            driverData.driver.isAvailable 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {driverData.driver.isAvailable ? '✓ Available' : '✗ Busy'}
                                        </span>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-sm text-gray-600">Current GPS Coordinates</p>
                                        <p className="font-medium text-gray-700">
                                            {driverData.driver.currentLatitude && driverData.driver.currentLongitude
                                                ? `${driverData.driver.currentLatitude.toFixed(4)}, ${driverData.driver.currentLongitude.toFixed(4)}`
                                                : 'Not available'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Statistics */}
                            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-6">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <span className="text-3xl mr-3">📊</span>
                                    Performance Statistics
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-600">Total Completed</p>
                                                <p className="text-3xl font-bold text-blue-600 mt-1">
                                                    {driverData.statistics.totalCompleted}
                                                </p>
                                            </div>
                                            <span className="text-4xl">📦</span>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-600">Completed Today</p>
                                                <p className="text-3xl font-bold text-green-600 mt-1">
                                                    {driverData.statistics.todayCompleted}
                                                </p>
                                            </div>
                                            <span className="text-4xl">✅</span>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-600">Active Deliveries</p>
                                                <p className="text-3xl font-bold text-orange-600 mt-1">
                                                    {driverData.statistics.activeDeliveries}
                                                </p>
                                            </div>
                                            <span className="text-4xl">🚚</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order History */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <span className="text-3xl mr-3">📋</span>
                                    Recent Orders
                                </h3>
                                {driverData.orders && driverData.orders.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Order ID
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Tracking ID
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Pickup
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Delivery
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Date
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {driverData.orders.map((order) => (
                                                    <tr key={order.id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            #{order.id}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                            {order.trackingId}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                                                            {order.pickupAddress}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                                                            {order.receiverAddress}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                                order.status === 'Delivered' 
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : order.status === 'Assigned' || order.status === 'InTransit'
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                            {order.deliveredAt 
                                                                ? new Date(order.deliveredAt).toLocaleDateString()
                                                                : new Date(order.createdAt).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">No orders found for this driver</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="text-center py-12 text-gray-500">No driver data available</p>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end rounded-b-xl border-t">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DriverDetailsModal;