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
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-slate-300">
          Loading driver details…
        </div>
      </div>
    );
  }

  if (!driverInfo) return null;

  const { driver, statistics, orders } = driverInfo;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="
        bg-[#0f141c]
        border border-white/10
        backdrop-blur-xl
        rounded-3xl
        p-6
        w-full max-w-4xl
        shadow-2xl
      ">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-white">
            Driver Details
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">

          {/* DRIVER INFO */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-5">
            <div className="
              w-16 h-16 rounded-full
              bg-[#ff8a3d]/20
              text-[#ff8a3d]
              flex items-center justify-center
              text-2xl font-black
            ">
              {driver.userFName?.charAt(0)?.toUpperCase()}
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-bold text-white">
                {driver.userFName} {driver.userLName}
              </h3>
              <p className="text-slate-400 text-sm">{driver.userEmail}</p>

              <span
                className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold
                  ${
                    driver.isAvailable
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }
                `}
              >
                {driver.isAvailable ? "Available" : "Busy"}
              </span>
            </div>
          </div>

          {/* LOCATION */}
          {driver.currentLatitude && driver.currentLongitude && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                📍 Current Location
              </h4>

              <p className="text-sm text-slate-400">
                Lat: {driver.currentLatitude.toFixed(6)} | Lng:{" "}
                {driver.currentLongitude.toFixed(6)}
              </p>

              <a
                href={`https://www.google.com/maps?q=${driver.currentLatitude},${driver.currentLongitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ff8a3d] text-sm font-semibold hover:underline mt-1 inline-block"
              >
                View on Google Maps →
              </a>
            </div>
          )}

          {/* STATISTICS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                label: "Total Completed",
                value: statistics.totalCompleted,
                color: "text-green-400",
              },
              {
                label: "Today Completed",
                value: statistics.todayCompleted,
                color: "text-blue-400",
              },
              {
                label: "Active Deliveries",
                value: statistics.activeDeliveries,
                color: "text-orange-400",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center"
              >
                <p className="text-sm text-slate-400">{s.label}</p>
                <p className={`text-3xl font-black ${s.color}`}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* RECENT ORDERS */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
              📦 Recent Orders (Last 20)
            </h4>

            {orders.length === 0 ? (
              <p className="text-slate-500 text-sm">No orders found</p>
            ) : (
              <div className="max-h-72 overflow-y-auto rounded-xl border border-white/10">
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 bg-[#0b0f14]">
                    <tr className="text-slate-400 text-xs uppercase">
                      <th className="px-4 py-3 text-left">Tracking</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Pickup</th>
                      <th className="px-4 py-3 text-left">Delivery</th>
                      <th className="px-4 py-3 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-white/5 transition"
                      >
                        <td className="px-4 py-3 text-[#ff8a3d] font-semibold">
                          {order.trackingId}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold
                              ${
                                order.status === "Delivered"
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-yellow-500/20 text-yellow-400"
                              }
                            `}
                          >
                            {order.status}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-slate-400 truncate max-w-xs">
                          {order.pickupAddress}
                        </td>

                        <td className="px-4 py-3 text-slate-400 truncate max-w-xs">
                          {order.receiverAddress}
                        </td>

                        <td className="px-4 py-3 text-slate-500">
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

        {/* FOOTER */}
        <div className="mt-6">
          <button
            onClick={onClose}
            className="
              w-full py-3 rounded-xl
              bg-[#ff8a3d]
              text-black font-bold
              hover:opacity-90 transition
            "
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverDetailsModal;
