// // import { useState, useEffect } from 'react';
// // import { useAuth } from '../../context/AuthContext';
// // import api from '../../services/api';
// // import { HubConnectionBuilder } from "@microsoft/signalr";
// // import * as signalR from "@microsoft/signalr";



// // const CustomerDashboard = () => {
// //     const { user, logout } = useAuth();
// //     const [orders, setOrders] = useState([]);
// //     const [selectedOrder, setSelectedOrder] = useState(null);
// //     const [trackingData, setTrackingData] = useState(null);
// //     const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
// //     const [rescheduleForm, setRescheduleForm] = useState({
// //         newDate: '',
// //         reason: ''
// //     });
// //     const [loading, setLoading] = useState(true);

// //     useEffect(() => {
// //         fetchOrders();
// //     }, []);

// //     const fetchOrders = async () => {
// //         try {
// //             const response = await api.get('/orders/my-orders');
// //             setOrders(response.data);
// //         } catch (error) {
// //             console.error('Error fetching orders:', error);
// //         } finally {
// //             setLoading(false);
// //         }
// //     };

// //     useEffect(() => {
// //     setupSignalR();
// // }, []);


// //     //new
// //     // useEffect(() => {
// //     //     if (!selectedOrder) return;

// //     //     let connection;

// //     //     const startSignalR = async () => {
// //     //         connection = new signalR.HubConnectionBuilder()
// //     //         .withUrl("http://localhost:5066/hubs/logistics", {
// //     //             withCredentials: true,
// //     //             transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
// //     //         })
// //     //         .withAutomaticReconnect()
// //     //         .build();

// //     //         // When driver sends location -> update modal live
// //     //         connection.on("ReceiveDriverLocation", (data) => {
// //     //             setTrackingData(prev => ({
// //     //                 ...prev,
// //     //                 driverLocation: {
// //     //                     latitude: data.latitude,
// //     //                     longitude: data.longitude,
// //     //                     updatedAt: data.updatedAt,
// //     //                 }
// //     //             }));
// //     //         });

// //     //         await connection.start();
// //     //         await connection.invoke("JoinOrderGroup", selectedOrder);
// //     //     };

// //     //     startSignalR();

// //     //     return () => {
// //     //         if (connection) connection.stop();
// //     //     };
// //     // }, [selectedOrder]);
// // const setupSignalR = async () => {
// //     try {
// //         const connection = new signalR.HubConnectionBuilder()
// //             .withUrl("http://localhost:5066/hubs/logistics")
// //             .withAutomaticReconnect()
// //             .build();

// //         connection.on("ReceiveRouteUpdate", (routeData) => {
// //             console.log("Received new route update:", routeData);
// //             setOptimizedRoute(routeData);
// //         });

// //         await connection.start();
// //         console.log("Driver connected to SignalR hub");

// //         await connection.invoke("JoinDriverRouteGroup", user.id);
// //         console.log("Joined route updates group");

// //     } catch (err) {
// //         console.error("SignalR Error:", err);
// //     }
// // };





// //     const trackOrder = async (orderId) => {
// //         try {
// //             const response = await api.get(`/customer/track/${orderId}`);
// //             setTrackingData(response.data);
// //             setSelectedOrder(orderId);
// //         } catch (error) {
// //             console.error('Error tracking order:', error);
// //             alert('Unable to track order');
// //         }
// //     };

// //     const openRescheduleDialog = (orderId) => {
// //         setSelectedOrder(orderId);
// //         setShowRescheduleDialog(true);
// //     };

// //     const handleReschedule = async (e) => {
// //         e.preventDefault();
// //         try {
// //             await api.post(`/customer/reschedule/${selectedOrder}`, rescheduleForm);
// //             alert('Delivery rescheduled successfully!');
// //             setShowRescheduleDialog(false);
// //             setRescheduleForm({ newDate: '', reason: '' });
// //             fetchOrders();
// //         } catch (error) {
// //             console.error('Error rescheduling:', error);
// //             alert('Failed to reschedule delivery');
// //         }
// //     };

// //     const getStatusColor = (status) => {
// //         const colors = {
// //             'PendingAssignment': 'bg-yellow-100 text-yellow-800',
// //             'AtOriginWarehouse': 'bg-blue-100 text-blue-800',
// //             'Assigned': 'bg-purple-100 text-purple-800',
// //             'InTransit': 'bg-indigo-100 text-indigo-800',
// //             'AtDestinationWarehouse': 'bg-cyan-100 text-cyan-800',
// //             'OutForDelivery': 'bg-orange-100 text-orange-800',
// //             'Delivered': 'bg-green-100 text-green-800',
// //             'DeliveryAttempted': 'bg-red-100 text-red-800'
// //         };
// //         return colors[status] || 'bg-gray-100 text-gray-800';
// //     };

// //     if (loading) {
// //         return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
// //     }

// //     return (
// //         <div className="min-h-screen bg-gray-50">
// //             {/* Header */}
// //             <header className="bg-white shadow">
// //                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
// //                     <div className="flex justify-between items-center">
// //                         <div>
// //                             <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
// //                             <p className="text-sm text-gray-600 mt-1">Welcome, {user?.name}!</p>
// //                         </div>
// //                         <button
// //                             onClick={logout}
// //                             className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-200"
// //                         >
// //                             Logout
// //                         </button>
// //                     </div>
// //                 </div>
// //             </header>

// //             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
// //                 {/* Stats */}
// //                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
// //                     <div className="bg-white rounded-lg shadow p-6">
// //                         <p className="text-gray-500 text-sm">Total Orders</p>
// //                         <p className="text-3xl font-bold text-blue-600">{orders.length}</p>
// //                     </div>
// //                     <div className="bg-white rounded-lg shadow p-6">
// //                         <p className="text-gray-500 text-sm">In Transit</p>
// //                         <p className="text-3xl font-bold text-indigo-600">
// //                             {orders.filter(o => o.status === 'InTransit' || o.status === 'OutForDelivery').length}
// //                         </p>
// //                     </div>
// //                     <div className="bg-white rounded-lg shadow p-6">
// //                         <p className="text-gray-500 text-sm">Delivered</p>
// //                         <p className="text-3xl font-bold text-green-600">
// //                             {orders.filter(o => o.status === 'Delivered').length}
// //                         </p>
// //                     </div>
// //                 </div>

// //                 {/* Orders List */}
// //                 <div className="space-y-4">
// //                     {orders.length === 0 && (
// //                         <div className="bg-white rounded-lg shadow p-8 text-center">
// //                             <p className="text-gray-500">You don't have any orders yet</p>
// //                         </div>
// //                     )}

// //                     {orders.map(order => (
// //                         <div key={order.id} className="bg-white rounded-lg shadow p-6">
// //                             <div className="flex justify-between items-start mb-4">
// //                                 <div>
// //                                     <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
// //                                     <p className="text-sm text-gray-600">
// //                                         Created: {new Date(order.createdAt).toLocaleDateString()}
// //                                     </p>
// //                                 </div>
// //                                 <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
// //                                     {order.status}
// //                                 </span>
// //                             </div>

// //                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
// //                                 <div>
// //                                     <p className="text-xs text-gray-500 mb-1">From (Sender)</p>
// //                                     <p className="font-medium">{order.senderName || 'N/A'}</p>
// //                                     <p className="text-sm text-gray-600">{order.pickupAddress}</p>
// //                                 </div>
// //                                 <div>
// //                                     <p className="text-xs text-gray-500 mb-1">To (Receiver)</p>
// //                                     <p className="font-medium">{order.receiverName}</p>
// //                                     <p className="text-sm text-gray-600">{order.receiverAddress}</p>
// //                                 </div>
// //                             </div>

// //                             {/* Warehouse Tracking */}
// //                             <div className="bg-gray-50 rounded-lg p-4 mb-4">
// //                                 <p className="text-xs font-semibold text-gray-700 mb-2">📦 Warehouse Tracking</p>
// //                                 <div className="flex items-center justify-between text-sm">
// //                                     <div>
// //                                         <p className="text-xs text-gray-500">Origin</p>
// //                                         <p className="font-medium text-blue-600">
// //                                             {order.originWarehouse?.name || 'Pending'}
// //                                         </p>
// //                                         <p className="text-xs text-gray-500">{order.originWarehouse?.city}</p>
// //                                     </div>
// //                                     <div className="text-gray-400">→</div>
// //                                     <div>
// //                                         <p className="text-xs text-gray-500">Current</p>
// //                                         <p className="font-medium text-indigo-600">
// //                                             {order.currentWarehouse?.name || 'In Transit'}
// //                                         </p>
// //                                         <p className="text-xs text-gray-500">{order.currentWarehouse?.city}</p>
// //                                     </div>
// //                                     <div className="text-gray-400">→</div>
// //                                     <div>
// //                                         <p className="text-xs text-gray-500">Destination</p>
// //                                         <p className="font-medium text-green-600">
// //                                             {order.destinationWarehouse?.name || 'Pending'}
// //                                         </p>
// //                                         <p className="text-xs text-gray-500">{order.destinationWarehouse?.city}</p>
// //                                     </div>
// //                                 </div>
// //                             </div>

// //                             {/* Delivery Info */}
// //                             {order.estimatedDeliveryDate && (
// //                                 <div className="mb-4">
// //                                     <p className="text-xs text-gray-500">Estimated Delivery</p>
// //                                     <p className="font-medium text-gray-900">
// //                                         {new Date(order.estimatedDeliveryDate).toLocaleDateString()}
// //                                     </p>
// //                                 </div>
// //                             )}

// //                             {order.driver && (
// //                                 <div className="bg-blue-50 rounded-lg p-3 mb-4">
// //                                     <p className="text-xs text-gray-600 mb-1">🚚 Assigned Driver</p>
// //                                     <p className="font-medium">{order.driver.name}</p>
// //                                 </div>
// //                             )}

// //                             {/* Actions */}
// //                             <div className="flex gap-3">
// //                                 <button
// //                                     onClick={() => trackOrder(order.id)}
// //                                     className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
// //                                 >
// //                                     📍 Track Order
// //                                 </button>
// //                                 {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
// //                                     <button
// //                                         onClick={() => openRescheduleDialog(order.id)}
// //                                         className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
// //                                     >
// //                                         📅 Reschedule
// //                                     </button>
// //                                 )}
// //                             </div>
// //                         </div>
// //                     ))}
// //                 </div>
// //             </div>

// //             {/* Tracking Modal */}
// //             {trackingData && (
// //                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
// //                     <div className="bg-white rounded-lg max-w-2xl w-full p-6">
// //                         <div className="flex justify-between items-start mb-4">
// //                             <h3 className="text-xl font-bold">Order Tracking #{selectedOrder}</h3>
// //                             <button
// //                                 onClick={() => { setTrackingData(null); setSelectedOrder(null); }}
// //                                 className="text-gray-500 hover:text-gray-700"
// //                             >
// //                                 ✕
// //                             </button>
// //                         </div>

// //                         <div className="space-y-4">
// //                             <div>
// //                                 <p className="text-sm text-gray-600">Status</p>
// //                                 <p className="font-semibold text-lg">{trackingData.order.status}</p>
// //                             </div>

// //                             {/* {trackingData.driverLocation && (
// //                                 <div className="bg-green-50 rounded-lg p-4">
// //                                     <p className="text-sm font-semibold text-green-800 mb-2">🚗 Driver Location</p>
// //                                     <p className="text-sm">Last updated: {new Date(trackingData.driverLocation.updatedAt).toLocaleString()}</p>
// //                                     <p className="text-xs text-gray-600 mt-1">
// //                                         Lat: {trackingData.driverLocation.latitude.toFixed(4)},
// //                                         Lng: {trackingData.driverLocation.longitude.toFixed(4)}
// //                                     </p>
// //                                     {trackingData.driverLocation.speed > 0 && (
// //                                         <p className="text-xs text-gray-600">Speed: {trackingData.driverLocation.speed.toFixed(1)} km/h</p>
// //                                     )}
// //                                 </div>
// //                             )} */}

// //                             {trackingData.driverLocation && (
// //                                 <div className="bg-green-50 rounded-lg p-4">
// //                                     <p className="text-sm font-semibold text-green-800 mb-2">🚗 Live Driver Location</p>
// //                                     <p className="text-xs text-gray-600">Updated: 
// //                                         {new Date(trackingData.driverLocation.updatedAt).toLocaleTimeString()}
// //                                     </p>
// //                                     <p className="text-sm mt-1">
// //                                         Lat: {trackingData.driverLocation.latitude.toFixed(5)}, 
// //                                         Lng: {trackingData.driverLocation.longitude.toFixed(5)}
// //                                     </p>
// //                                 </div>
// //                             )}


// //                             {trackingData.estimatedDelivery && (
// //                                 <div>
// //                                     <p className="text-sm text-gray-600">Estimated Delivery</p>
// //                                     <p className="font-medium">{new Date(trackingData.estimatedDelivery).toLocaleString()}</p>
// //                                 </div>
// //                             )}

// //                             <button
// //                                 onClick={() => window.open(`https://www.openstreetmap.org/?mlat=${trackingData.driverLocation?.latitude || trackingData.order.deliveryLatitude}&mlon=${trackingData.driverLocation?.longitude || trackingData.order.deliveryLongitude}`, '_blank')}
// //                                 className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mt-4"
// //                             >
// //                                 View on Map
// //                             </button>
// //                         </div>
// //                     </div>
// //                 </div>
// //             )}

// //             {/* Reschedule Dialog */}
// //             {showRescheduleDialog && (
// //                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
// //                     <div className="bg-white rounded-lg max-w-md w-full p-6">
// //                         <h3 className="text-xl font-bold mb-4">Reschedule Delivery</h3>
// //                         <form onSubmit={handleReschedule} className="space-y-4">
// //                             <div>
// //                                 <label className="block text-sm font-medium text-gray-700 mb-1">
// //                                     New Delivery Date
// //                                 </label>
// //                                 <input
// //                                     type="datetime-local"
// //                                     value={rescheduleForm.newDate}
// //                                     onChange={(e) => setRescheduleForm({ ...rescheduleForm, newDate: e.target.value })}
// //                                     className="w-full p-2 border rounded-lg"
// //                                     required
// //                                 />
// //                             </div>
// //                             <div>
// //                                 <label className="block text-sm font-medium text-gray-700 mb-1">
// //                                     Reason (Optional)
// //                                 </label>
// //                                 <textarea
// //                                     value={rescheduleForm.reason}
// //                                     onChange={(e) => setRescheduleForm({ ...rescheduleForm, reason: e.target.value })}
// //                                     className="w-full p-2 border rounded-lg"
// //                                     rows="3"
// //                                     placeholder="E.g., Not available on that date"
// //                                 />
// //                             </div>
// //                             <div className="bg-yellow-50 rounded-lg p-3">
// //                                 <p className="text-xs text-yellow-800">
// //                                     ⚠️ Rescheduling will lower the priority of your delivery
// //                                 </p>
// //                             </div>
// //                             <div className="flex gap-3">
// //                                 <button
// //                                     type="button"
// //                                     onClick={() => {
// //                                         setShowRescheduleDialog(false);
// //                                         setRescheduleForm({ newDate: '', reason: '' });
// //                                     }}
// //                                     className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
// //                                 >
// //                                     Cancel
// //                                 </button>
// //                                 <button
// //                                     type="submit"
// //                                     className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
// //                                 >
// //                                     Confirm Reschedule
// //                                 </button>
// //                             </div>
// //                         </form>
// //                     </div>
// //                 </div>
// //             )}
// //         </div>
// //     );
// // };

// // export default CustomerDashboard;

// import { useState, useEffect } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import api from '../../services/api';
// import { HubConnectionBuilder } from "@microsoft/signalr";
// import * as signalR from "@microsoft/signalr";

// const CustomerDashboard = () => {
//     const { user, logout } = useAuth();
//     const [orders, setOrders] = useState([]);
//     const [selectedOrder, setSelectedOrder] = useState(null);
//     const [trackingData, setTrackingData] = useState(null);
//     const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
//     const [rescheduleForm, setRescheduleForm] = useState({
//         newDate: '',
//         reason: ''
//     });
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         fetchOrders();
//     }, []);

//     const fetchOrders = async () => {
//         try {
//             const response = await api.get('/orders/my-orders');
//             setOrders(response.data);
//         } catch (error) {
//             console.error('Error fetching orders:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         setupSignalR();
//     }, []);

//     const setupSignalR = async () => {
//         try {
//             const connection = new signalR.HubConnectionBuilder()
//                 .withUrl("http://localhost:5066/hubs/logistics")
//                 .withAutomaticReconnect()
//                 .build();

//             connection.on("ReceiveRouteUpdate", (routeData) => {
//                 console.log("Received new route update:", routeData);
//                 setOptimizedRoute(routeData);
//             });

//             await connection.start();
//             console.log("Driver connected to SignalR hub");

//             await connection.invoke("JoinDriverRouteGroup", user.id);
//             console.log("Joined route updates group");

//         } catch (err) {
//             console.error("SignalR Error:", err);
//         }
//     };

//     const trackOrder = async (orderId) => {
//         try {
//             const response = await api.get(`/customer/track/${orderId}`);
//             setTrackingData(response.data);
//             setSelectedOrder(orderId);
//         } catch (error) {
//             console.error('Error tracking order:', error);
//             alert('Unable to track order');
//         }
//     };

//     const openRescheduleDialog = (orderId) => {
//         setSelectedOrder(orderId);
//         setShowRescheduleDialog(true);
//     };

//     const handleReschedule = async (e) => {
//         e.preventDefault();
//         try {
//             await api.post(`/customer/reschedule/${selectedOrder}`, rescheduleForm);
//             alert('Delivery rescheduled successfully!');
//             setShowRescheduleDialog(false);
//             setRescheduleForm({ newDate: '', reason: '' });
//             fetchOrders();
//         } catch (error) {
//             console.error('Error rescheduling:', error);
//             alert('Failed to reschedule delivery');
//         }
//     };

//     const getStatusColor = (status) => {
//         const colors = {
//             'PendingAssignment': 'bg-yellow-100 text-yellow-800',
//             'AtOriginWarehouse': 'bg-blue-100 text-blue-800',
//             'Assigned': 'bg-purple-100 text-purple-800',
//             'InTransit': 'bg-indigo-100 text-indigo-800',
//             'AtDestinationWarehouse': 'bg-cyan-100 text-cyan-800',
//             'OutForDelivery': 'bg-orange-100 text-orange-800',
//             'Delivered': 'bg-green-100 text-green-800',
//             'DeliveryAttempted': 'bg-red-100 text-red-800'
//         };
//         return colors[status] || 'bg-gray-100 text-gray-800';
//     };

//     const copyToClipboard = (text) => {
//         navigator.clipboard.writeText(text);
//         alert('Tracking ID copied to clipboard!');
//     };

//     if (loading) {
//         return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
//     }

//     return (
//         <div className="min-h-screen bg-gray-50">
//             {/* Header */}
//             <header className="bg-white shadow">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//                     <div className="flex justify-between items-center">
//                         <div>
//                             <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
//                             <p className="text-sm text-gray-600 mt-1">Welcome, {user?.name}!</p>
//                         </div>
//                         <button
//                             onClick={logout}
//                             className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-200"
//                         >
//                             Logout
//                         </button>
//                     </div>
//                 </div>
//             </header>

//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//                 {/* Stats */}
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//                     <div className="bg-white rounded-lg shadow p-6">
//                         <p className="text-gray-500 text-sm">Total Orders</p>
//                         <p className="text-3xl font-bold text-blue-600">{orders.length}</p>
//                     </div>
//                     <div className="bg-white rounded-lg shadow p-6">
//                         <p className="text-gray-500 text-sm">In Transit</p>
//                         <p className="text-3xl font-bold text-indigo-600">
//                             {orders.filter(o => o.status === 'InTransit' || o.status === 'OutForDelivery').length}
//                         </p>
//                     </div>
//                     <div className="bg-white rounded-lg shadow p-6">
//                         <p className="text-gray-500 text-sm">Delivered</p>
//                         <p className="text-3xl font-bold text-green-600">
//                             {orders.filter(o => o.status === 'Delivered').length}
//                         </p>
//                     </div>
//                 </div>

//                 {/* Orders List */}
//                 <div className="space-y-4">
//                     {orders.length === 0 && (
//                         <div className="bg-white rounded-lg shadow p-8 text-center">
//                             <p className="text-gray-500">You don't have any orders yet</p>
//                         </div>
//                     )}

//                     {orders.map(order => (
//                         <div key={order.id} className="bg-white rounded-lg shadow p-6">
//                             <div className="flex justify-between items-start mb-4">
//                                 <div>
//                                     <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
//                                     {/* Tracking ID Display */}
//                                     {order.trackingId && (
//                                         <div className="flex items-center gap-2 mt-2">
//                                             <span className="text-xs text-gray-500">Tracking ID:</span>
//                                             <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
//                                                 {order.trackingId}
//                                             </span>
//                                             <button
//                                                 onClick={() => copyToClipboard(order.trackingId)}
//                                                 className="text-blue-600 hover:text-blue-800 text-xs"
//                                                 title="Copy Tracking ID"
//                                             >
//                                                 📋
//                                             </button>
//                                         </div>
//                                     )}
//                                     <p className="text-sm text-gray-600 mt-1">
//                                         Created: {new Date(order.createdAt).toLocaleDateString()}
//                                     </p>
//                                 </div>
//                                 <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
//                                     {order.status}
//                                 </span>
//                             </div>

//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
//                                 <div>
//                                     <p className="text-xs text-gray-500 mb-1">From (Sender)</p>
//                                     <p className="font-medium">{order.senderName || 'N/A'}</p>
//                                     <p className="text-sm text-gray-600">{order.pickupAddress}</p>
//                                 </div>
//                                 <div>
//                                     <p className="text-xs text-gray-500 mb-1">To (Receiver)</p>
//                                     <p className="font-medium">{order.receiverName}</p>
//                                     <p className="text-sm text-gray-600">{order.receiverAddress}</p>
//                                 </div>
//                             </div>

//                             {/* Warehouse Tracking */}
//                             <div className="bg-gray-50 rounded-lg p-4 mb-4">
//                                 <p className="text-xs font-semibold text-gray-700 mb-2">📦 Warehouse Tracking</p>
//                                 <div className="flex items-center justify-between text-sm">
//                                     <div>
//                                         <p className="text-xs text-gray-500">Origin</p>
//                                         <p className="font-medium text-blue-600">
//                                             {order.originWarehouse?.name || 'Pending'}
//                                         </p>
//                                         <p className="text-xs text-gray-500">{order.originWarehouse?.city}</p>
//                                     </div>
//                                     <div className="text-gray-400">→</div>
//                                     <div>
//                                         <p className="text-xs text-gray-500">Current</p>
//                                         <p className="font-medium text-indigo-600">
//                                             {order.currentWarehouse?.name || 'In Transit'}
//                                         </p>
//                                         <p className="text-xs text-gray-500">{order.currentWarehouse?.city}</p>
//                                     </div>
//                                     <div className="text-gray-400">→</div>
//                                     <div>
//                                         <p className="text-xs text-gray-500">Destination</p>
//                                         <p className="font-medium text-green-600">
//                                             {order.destinationWarehouse?.name || 'Pending'}
//                                         </p>
//                                         <p className="text-xs text-gray-500">{order.destinationWarehouse?.city}</p>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Delivery Info */}
//                             {order.estimatedDeliveryDate && (
//                                 <div className="mb-4">
//                                     <p className="text-xs text-gray-500">Estimated Delivery</p>
//                                     <p className="font-medium text-gray-900">
//                                         {new Date(order.estimatedDeliveryDate).toLocaleDateString()}
//                                     </p>
//                                 </div>
//                             )}

//                             {order.driver && (
//                                 <div className="bg-blue-50 rounded-lg p-3 mb-4">
//                                     <p className="text-xs text-gray-600 mb-1">🚚 Assigned Driver</p>
//                                     <p className="font-medium">{order.driver.name}</p>
//                                 </div>
//                             )}

//                             {/* Actions */}
//                             <div className="flex gap-3">
//                                 <button
//                                     onClick={() => trackOrder(order.id)}
//                                     className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
//                                 >
//                                     📍 Track Order
//                                 </button>
//                                 {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
//                                     <button
//                                         onClick={() => openRescheduleDialog(order.id)}
//                                         className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
//                                     >
//                                         📅 Reschedule
//                                     </button>
//                                 )}
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>

//             {/* Tracking Modal */}
//             {trackingData && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//                     <div className="bg-white rounded-lg max-w-2xl w-full p-6">
//                         <div className="flex justify-between items-start mb-4">
//                             <div>
//                                 <h3 className="text-xl font-bold">Order Tracking #{selectedOrder}</h3>
//                                 {/* Tracking ID in Modal */}
//                                 {trackingData.order?.trackingId && (
//                                     <div className="flex items-center gap-2 mt-2">
//                                         <span className="text-sm text-gray-600">Tracking:</span>
//                                         <span className="text-sm font-mono bg-blue-50 px-3 py-1 rounded border border-blue-200">
//                                             {trackingData.order.trackingId}
//                                         </span>
//                                         <button
//                                             onClick={() => copyToClipboard(trackingData.order.trackingId)}
//                                             className="text-blue-600 hover:text-blue-800 text-sm"
//                                             title="Copy Tracking ID"
//                                         >
//                                             📋 Copy
//                                         </button>
//                                     </div>
//                                 )}
//                             </div>
//                             <button
//                                 onClick={() => { setTrackingData(null); setSelectedOrder(null); }}
//                                 className="text-gray-500 hover:text-gray-700"
//                             >
//                                 ✕
//                             </button>
//                         </div>

//                         <div className="space-y-4">
//                             <div>
//                                 <p className="text-sm text-gray-600">Status</p>
//                                 <p className="font-semibold text-lg">{trackingData.order.status}</p>
//                             </div>

//                             {trackingData.driverLocation && (
//                                 <div className="bg-green-50 rounded-lg p-4">
//                                     <p className="text-sm font-semibold text-green-800 mb-2">🚗 Live Driver Location</p>
//                                     <p className="text-xs text-gray-600">Updated: 
//                                         {new Date(trackingData.driverLocation.updatedAt).toLocaleTimeString()}
//                                     </p>
//                                     <p className="text-sm mt-1">
//                                         Lat: {trackingData.driverLocation.latitude.toFixed(5)}, 
//                                         Lng: {trackingData.driverLocation.longitude.toFixed(5)}
//                                     </p>
//                                 </div>
//                             )}

//                             {trackingData.estimatedDelivery && (
//                                 <div>
//                                     <p className="text-sm text-gray-600">Estimated Delivery</p>
//                                     <p className="font-medium">{new Date(trackingData.estimatedDelivery).toLocaleString()}</p>
//                                 </div>
//                             )}

//                             <button
//                                 onClick={() => window.open(`https://www.openstreetmap.org/?mlat=${trackingData.driverLocation?.latitude || trackingData.order.deliveryLatitude}&mlon=${trackingData.driverLocation?.longitude || trackingData.order.deliveryLongitude}`, '_blank')}
//                                 className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mt-4"
//                             >
//                                 View on Map
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Reschedule Dialog */}
//             {showRescheduleDialog && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//                     <div className="bg-white rounded-lg max-w-md w-full p-6">
//                         <h3 className="text-xl font-bold mb-4">Reschedule Delivery</h3>
//                         <form onSubmit={handleReschedule} className="space-y-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     New Delivery Date
//                                 </label>
//                                 <input
//                                     type="datetime-local"
//                                     value={rescheduleForm.newDate}
//                                     onChange={(e) => setRescheduleForm({ ...rescheduleForm, newDate: e.target.value })}
//                                     className="w-full p-2 border rounded-lg"
//                                     required
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     Reason (Optional)
//                                 </label>
//                                 <textarea
//                                     value={rescheduleForm.reason}
//                                     onChange={(e) => setRescheduleForm({ ...rescheduleForm, reason: e.target.value })}
//                                     className="w-full p-2 border rounded-lg"
//                                     rows="3"
//                                     placeholder="E.g., Not available on that date"
//                                 />
//                             </div>
//                             <div className="bg-yellow-50 rounded-lg p-3">
//                                 <p className="text-xs text-yellow-800">
//                                     ⚠️ Rescheduling will lower the priority of your delivery
//                                 </p>
//                             </div>
//                             <div className="flex gap-3">
//                                 <button
//                                     type="button"
//                                     onClick={() => {
//                                         setShowRescheduleDialog(false);
//                                         setRescheduleForm({ newDate: '', reason: '' });
//                                     }}
//                                     className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     type="submit"
//                                     className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
//                                 >
//                                     Confirm Reschedule
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default CustomerDashboard;

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import * as signalR from "@microsoft/signalr";

const CustomerDashboard = () => {
    const { user, logout } = useAuth();
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [trackingData, setTrackingData] = useState(null);
    const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
    const [rescheduleForm, setRescheduleForm] = useState({
        newDate: '',
        reason: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
        setupSignalR();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders/my-orders');
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const setupSignalR = async () => {
        try {
            const connection = new signalR.HubConnectionBuilder()
                .withUrl("http://localhost:5066/hubs/logistics")
                .withAutomaticReconnect()
                .build();

            connection.on("ReceiveRouteUpdate", (routeData) => {
                console.log("Received route update:", routeData);
            });

            await connection.start();
            console.log("Customer connected to SignalR hub");
        } catch (err) {
            console.error("SignalR Error:", err);
        }
    };

    const trackOrder = async (orderId) => {
        try {
            const response = await api.get(`/customer/track/${orderId}`);
            setTrackingData(response.data);
            setSelectedOrder(orderId);
        } catch (error) {
            console.error('Error tracking order:', error);
            alert('Unable to track order');
        }
    };

    const openRescheduleDialog = (orderId) => {
        setSelectedOrder(orderId);
        setShowRescheduleDialog(true);
    };

    const handleReschedule = async () => {
        if (!rescheduleForm.newDate) {
            alert('Please select a new date');
            return;
        }

        try {
            await api.post(`/orders/${selectedOrder}/reschedule`, {
                newDate: rescheduleForm.newDate,
                reason: rescheduleForm.reason
            });
            
            alert('✅ Delivery rescheduled successfully! Driver has been notified.');
            setShowRescheduleDialog(false);
            setRescheduleForm({ newDate: '', reason: '' });
            fetchOrders();
        } catch (error) {
            console.error('Error rescheduling:', error);
            alert('❌ Failed to reschedule: ' + (error.response?.data?.message || 'Unknown error'));
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'PendingAssignment': 'bg-yellow-100 text-yellow-800',
            'AtOriginWarehouse': 'bg-blue-100 text-blue-800',
            'Assigned': 'bg-purple-100 text-purple-800',
            'InTransit': 'bg-indigo-100 text-indigo-800',
            'AtDestinationWarehouse': 'bg-cyan-100 text-cyan-800',
            'OutForDelivery': 'bg-orange-100 text-orange-800',
            'Delivered': 'bg-green-100 text-green-800',
            'DeliveryAttempted': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Tracking ID copied!');
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                            <p className="text-sm text-gray-600 mt-1">Welcome, {user?.name}!</p>
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="text-gray-500 text-sm">Total Orders</p>
                        <p className="text-3xl font-bold text-blue-600">{orders.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="text-gray-500 text-sm">In Transit</p>
                        <p className="text-3xl font-bold text-indigo-600">
                            {orders.filter(o => o.status === 'InTransit' || o.status === 'OutForDelivery').length}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="text-gray-500 text-sm">Delivered</p>
                        <p className="text-3xl font-bold text-green-600">
                            {orders.filter(o => o.status === 'Delivered').length}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    {orders.length === 0 && (
                        <div className="bg-white rounded-lg shadow p-8 text-center">
                            <p className="text-gray-500">You don't have any orders yet</p>
                        </div>
                    )}

                    {orders.map(order => (
                        <div key={order.id} className="bg-white rounded-lg shadow p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                                    {order.trackingId && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-xs text-gray-500">Tracking:</span>
                                            <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                                {order.trackingId}
                                            </span>
                                            <button
                                                onClick={() => copyToClipboard(order.trackingId)}
                                                className="text-blue-600 hover:text-blue-800 text-xs"
                                            >
                                                📋
                                            </button>
                                        </div>
                                    )}
                                    <p className="text-sm text-gray-600 mt-1">
                                        Created: {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                    {order.rescheduledAt && (
                                        <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded p-2">
                                            <p className="text-xs text-yellow-800">
                                                🔄 Rescheduled on {new Date(order.rescheduledAt).toLocaleDateString()}
                                            </p>
                                            {order.rescheduleReason && (
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Reason: {order.rescheduleReason}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">From</p>
                                    <p className="font-medium">{order.senderName || 'N/A'}</p>
                                    <p className="text-sm text-gray-600">{order.pickupAddress}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">To</p>
                                    <p className="font-medium">{order.receiverName}</p>
                                    <p className="text-sm text-gray-600">{order.receiverAddress}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <p className="text-xs font-semibold text-gray-700 mb-2">📦 Warehouse Tracking</p>
                                <div className="flex items-center justify-between text-sm">
                                    <div>
                                        <p className="text-xs text-gray-500">Origin</p>
                                        <p className="font-medium text-blue-600">
                                            {order.originWarehouse?.name || 'Pending'}
                                        </p>
                                    </div>
                                    <div className="text-gray-400">→</div>
                                    <div>
                                        <p className="text-xs text-gray-500">Current</p>
                                        <p className="font-medium text-indigo-600">
                                            {order.currentWarehouse?.name || 'In Transit'}
                                        </p>
                                    </div>
                                    <div className="text-gray-400">→</div>
                                    <div>
                                        <p className="text-xs text-gray-500">Destination</p>
                                        <p className="font-medium text-green-600">
                                            {order.destinationWarehouse?.name || 'Pending'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => trackOrder(order.id)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                                >
                                    📍 Track
                                </button>
                                {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                                    <button
                                        onClick={() => openRescheduleDialog(order.id)}
                                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                                    >
                                        📅 Reschedule
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {trackingData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold">Order #{selectedOrder}</h3>
                            <button
                                onClick={() => { setTrackingData(null); setSelectedOrder(null); }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600">Status</p>
                                <p className="font-semibold text-lg">{trackingData.order.status}</p>
                            </div>
                            {trackingData.driverLocation && (
                                <div className="bg-green-50 rounded-lg p-4">
                                    <p className="text-sm font-semibold text-green-800 mb-2">🚗 Live Driver Location</p>
                                    <p className="text-sm">
                                        Lat: {trackingData.driverLocation.latitude.toFixed(5)}, 
                                        Lng: {trackingData.driverLocation.longitude.toFixed(5)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showRescheduleDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-xl font-bold mb-4">Reschedule Delivery</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    New Delivery Date & Time *
                                </label>
                                <input
                                    type="datetime-local"
                                    value={rescheduleForm.newDate}
                                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, newDate: e.target.value })}
                                    className="w-full p-2 border rounded-lg"
                                    min={new Date().toISOString().slice(0, 16)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Reason (Optional)
                                </label>
                                <textarea
                                    value={rescheduleForm.reason}
                                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, reason: e.target.value })}
                                    className="w-full p-2 border rounded-lg"
                                    rows={3}
                                    placeholder="E.g., Not available"
                                />
                            </div>
                            <div className="bg-yellow-50 rounded-lg p-3">
                                <p className="text-xs text-yellow-800">
                                    ⚠️ Driver will be notified immediately
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowRescheduleDialog(false);
                                        setRescheduleForm({ newDate: '', reason: '' });
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReschedule}
                                    className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerDashboard;