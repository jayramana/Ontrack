// import { useState, useEffect } from 'react';
// import api from '../../services/api';

// const DriverDetailsModal = ({ driverId, onClose }) => {
//     const [driverData, setDriverData] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         const fetchDriverDetails = async () => {
//             try {
//                 setLoading(true);
//                 const response = await api.get(`/admin/driver/${driverId}`);
//                 setDriverData(response.data);
//             } catch (err) {
//                 console.error('Error fetching driver details:', err);
//                 setError('Failed to load driver details');
//             } finally {
//                 setLoading(false);
//             }
//         };

//         if (driverId) {
//             fetchDriverDetails();
//         }
//     }, [driverId]);

//     if (!driverId) return null;

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
//                 {/* Header */}
//                 <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 flex justify-between items-center rounded-t-xl">
//                     <div>
//                         <h2 className="text-2xl font-bold">Driver Details</h2>
//                         {driverData && (
//                             <p className="text-sm text-indigo-100 mt-1">
//                                 Driver ID: {driverData.driver.id}
//                             </p>
//                         )}
//                     </div>
//                     <button
//                         onClick={onClose}
//                         className="text-white hover:text-gray-200 text-3xl leading-none"
//                     >
//                         &times;
//                     </button>
//                 </div>

//                 {/* Content */}
//                 <div className="p-6">
//                     {loading ? (
//                         <div className="flex justify-center items-center py-12">
//                             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
//                         </div>
//                     ) : error ? (
//                         <div className="text-center py-12">
//                             <p className="text-red-600">{error}</p>
//                             <button
//                                 onClick={onClose}
//                                 className="mt-4 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
//                             >
//                                 Close
//                             </button>
//                         </div>
//                     ) : driverData ? (
//                         <div className="space-y-6">
//                             {/* Driver Information */}
//                             <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
//                                 <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
//                                     <span className="text-3xl mr-3">👤</span>
//                                     Driver Information
//                                 </h3>
//                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                     <div>
//                                         <p className="text-sm text-gray-600">Name</p>
//                                         <p className="text-lg font-semibold text-gray-900">{driverData.driver.name}</p>
//                                     </div>
//                                     <div>
//                                         <p className="text-sm text-gray-600">Email</p>
//                                         <p className="font-medium text-gray-700">{driverData.driver.email || 'N/A'}</p>
//                                     </div>
//                                     <div>
//                                         <p className="text-sm text-gray-600">Phone</p>
//                                         <p className="font-medium text-gray-700">{driverData.driver.phoneNumber || 'N/A'}</p>
//                                     </div>
//                                     <div>
//                                         <p className="text-sm text-gray-600">Availability</p>
//                                         <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
//                                             driverData.driver.isAvailable 
//                                                 ? 'bg-green-100 text-green-800' 
//                                                 : 'bg-red-100 text-red-800'
//                                         }`}>
//                                             {driverData.driver.isAvailable ? '✓ Available' : '✗ Busy'}
//                                         </span>
//                                     </div>
//                                     <div className="md:col-span-2">
//                                         <p className="text-sm text-gray-600">Current GPS Coordinates</p>
//                                         <p className="font-medium text-gray-700">
//                                             {driverData.driver.currentLatitude && driverData.driver.currentLongitude
//                                                 ? `${driverData.driver.currentLatitude.toFixed(4)}, ${driverData.driver.currentLongitude.toFixed(4)}`
//                                                 : 'Not available'}
//                                         </p>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Statistics */}
//                             <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-6">
//                                 <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
//                                     <span className="text-3xl mr-3">📊</span>
//                                     Performance Statistics
//                                 </h3>
//                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                                     <div className="bg-white rounded-lg p-4 shadow-sm">
//                                         <div className="flex items-center justify-between">
//                                             <div>
//                                                 <p className="text-sm text-gray-600">Total Completed</p>
//                                                 <p className="text-3xl font-bold text-blue-600 mt-1">
//                                                     {driverData.statistics.totalCompleted}
//                                                 </p>
//                                             </div>
//                                             <span className="text-4xl">📦</span>
//                                         </div>
//                                     </div>

//                                     <div className="bg-white rounded-lg p-4 shadow-sm">
//                                         <div className="flex items-center justify-between">
//                                             <div>
//                                                 <p className="text-sm text-gray-600">Completed Today</p>
//                                                 <p className="text-3xl font-bold text-green-600 mt-1">
//                                                     {driverData.statistics.todayCompleted}
//                                                 </p>
//                                             </div>
//                                             <span className="text-4xl">✅</span>
//                                         </div>
//                                     </div>

//                                     <div className="bg-white rounded-lg p-4 shadow-sm">
//                                         <div className="flex items-center justify-between">
//                                             <div>
//                                                 <p className="text-sm text-gray-600">Active Deliveries</p>
//                                                 <p className="text-3xl font-bold text-orange-600 mt-1">
//                                                     {driverData.statistics.activeDeliveries}
//                                                 </p>
//                                             </div>
//                                             <span className="text-4xl">🚚</span>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Order History */}
//                             <div className="bg-gray-50 rounded-lg p-6">
//                                 <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
//                                     <span className="text-3xl mr-3">📋</span>
//                                     Recent Orders
//                                 </h3>
//                                 {driverData.orders && driverData.orders.length > 0 ? (
//                                     <div className="overflow-x-auto">
//                                         <table className="min-w-full divide-y divide-gray-200">
//                                             <thead className="bg-gray-100">
//                                                 <tr>
//                                                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                                         Order ID
//                                                     </th>
//                                                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                                         Tracking ID
//                                                     </th>
//                                                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                                         Pickup
//                                                     </th>
//                                                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                                         Delivery
//                                                     </th>
//                                                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                                         Status
//                                                     </th>
//                                                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                                         Date
//                                                     </th>
//                                                 </tr>
//                                             </thead>
//                                             <tbody className="bg-white divide-y divide-gray-200">
//                                                 {driverData.orders.map((order) => (
//                                                     <tr key={order.id} className="hover:bg-gray-50">
//                                                         <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
//                                                             #{order.id}
//                                                         </td>
//                                                         <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
//                                                             {order.trackingId}
//                                                         </td>
//                                                         <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
//                                                             {order.pickupAddress}
//                                                         </td>
//                                                         <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
//                                                             {order.receiverAddress}
//                                                         </td>
//                                                         <td className="px-4 py-3 whitespace-nowrap">
//                                                             <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                                                                 order.status === 'Delivered' 
//                                                                     ? 'bg-green-100 text-green-800'
//                                                                     : order.status === 'Assigned' || order.status === 'InTransit'
//                                                                     ? 'bg-blue-100 text-blue-800'
//                                                                     : 'bg-yellow-100 text-yellow-800'
//                                                             }`}>
//                                                                 {order.status}
//                                                             </span>
//                                                         </td>
//                                                         <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
//                                                             {order.deliveredAt 
//                                                                 ? new Date(order.deliveredAt).toLocaleDateString()
//                                                                 : new Date(order.createdAt).toLocaleDateString()}
//                                                         </td>
//                                                     </tr>
//                                                 ))}
//                                             </tbody>
//                                         </table>
//                                     </div>
//                                 ) : (
//                                     <p className="text-gray-500 text-center py-8">No orders found for this driver</p>
//                                 )}
//                             </div>
//                         </div>
//                     ) : (
//                         <p className="text-center py-12 text-gray-500">No driver data available</p>
//                     )}
//                 </div>

//                 {/* Footer */}
//                 <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end rounded-b-xl border-t">
//                     <button
//                         onClick={onClose}
//                         className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
//                     >
//                         Close
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default DriverDetailsModal;

import { useEffect, useState } from "react";
import api from "../../services/api";

const DriverDetailsModal = ({ driverId, onClose }) => {
    const [driverInfo, setDriverInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDriverDetails = async () => {
            try {
                const res = await api.get(`/admin/driver/${driverId}`);
                setDriverInfo(res.data);
            } catch (error) {
                console.error("Error loading driver:", error);
            } finally {
                setLoading(false);
            }
        };
        loadDriverDetails();
    }, [driverId]);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                    <p>Loading driver details...</p>
                </div>
            </div>
        );
    }

    if (!driverInfo) return null;

    const { driver, statistics, orders } = driverInfo;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl p-6 w-full max-w-3xl shadow-lg my-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Driver Details</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Driver Info Card */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold">
                                {driver.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-800">{driver.name}</h3>
                                <p className="text-gray-600">{driver.email}</p>
                                <div className="mt-1">
                                    <span className={`px-3 py-1 rounded-full text-sm ${
                                        driver.isAvailable 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-red-100 text-red-700'
                                    }`}>
                                        {driver.isAvailable ? '🟢 Available' : '🔴 Busy'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Current Location */}
                    {driver.currentLatitude && driver.currentLongitude && (
                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                                <span className="text-xl mr-2">📍</span> Current Location
                            </h3>
                            <p className="text-sm text-gray-600">
                                Lat: {driver.currentLatitude.toFixed(6)}, Lng: {driver.currentLongitude.toFixed(6)}
                            </p>
                            <a
                                href={`https://www.google.com/maps?q=${driver.currentLatitude},${driver.currentLongitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm mt-1 inline-block"
                            >
                                View on Google Maps →
                            </a>
                        </div>
                    )}

                    {/* Statistics */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="border rounded-lg p-4 text-center">
                            <p className="text-sm text-gray-600">Total Completed</p>
                            <p className="text-3xl font-bold text-green-600">{statistics.totalCompleted}</p>
                        </div>
                        <div className="border rounded-lg p-4 text-center">
                            <p className="text-sm text-gray-600">Today Completed</p>
                            <p className="text-3xl font-bold text-blue-600">{statistics.todayCompleted}</p>
                        </div>
                        <div className="border rounded-lg p-4 text-center">
                            <p className="text-sm text-gray-600">Active Deliveries</p>
                            <p className="text-3xl font-bold text-orange-600">{statistics.activeDeliveries}</p>
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="border rounded-lg p-4">
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <span className="text-xl mr-2">📦</span> Recent Orders (Last 20)
                        </h3>
                        {orders.length === 0 ? (
                            <p className="text-gray-500 text-sm">No orders found</p>
                        ) : (
                            <div className="max-h-64 overflow-y-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tracking ID</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pickup</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Delivery</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {orders.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50">
                                                <td className="px-3 py-2 font-medium text-blue-600">
                                                    {order.trackingId}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                                        order.status === 'Delivered' 
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-gray-600 truncate max-w-xs">
                                                    {order.pickupAddress}
                                                </td>
                                                <td className="px-3 py-2 text-gray-600 truncate max-w-xs">
                                                    {order.receiverAddress}
                                                </td>
                                                <td className="px-3 py-2 text-gray-500">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6">
                    <button 
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DriverDetailsModal;