// // // import { useState, useEffect } from 'react';
// // // import { useAuth } from '../../context/AuthContext';
// // // import api from '../../services/api';
// // // import { useNavigate } from "react-router-dom";


// // // const DriverDashboard = () => {
// // //     const navigate = useNavigate();
// // //     const { user, logout } = useAuth();
// // //     const [orders, setOrders] = useState([]);
// // //     const [optimizedRoute, setOptimizedRoute] = useState([]);
// // //     const [warehouse, setWarehouse] = useState(null);
// // //     const [locationSharing, setLocationSharing] = useState(false);
// // //     const [loading, setLoading] = useState(true);
// // //     const [activeTab, setActiveTab] = useState('today'); // 'today' or 'optimized'

// // //     useEffect(() => {
// // //         fetchTodaysOrders();
// // //         fetchOptimizedRoute();

// // //         // Start location sharing interval if enabled
// // //         let locationInterval;
// // //         if (locationSharing) {
// // //             locationInterval = setInterval(shareLocation, 10000); // Every 10 seconds
// // //         }

// // //         return () => {
// // //             if (locationInterval) clearInterval(locationInterval);
// // //         };
// // //     }, [locationSharing]);

// // //     const fetchTodaysOrders = async () => {
// // //         try {
// // //             const response = await api.get('/driver/orders/today');
// // //             setOrders(response.data);

// // //             // Get warehouse from first order if available
// // //             if (response.data.length > 0 && response.data[0].currentWarehouse) {
// // //                 setWarehouse(response.data[0].currentWarehouse);
// // //             }
// // //         } catch (error) {
// // //             console.error('Error fetching orders:', error);
// // //         } finally {
// // //             setLoading(false);
// // //         }
// // //     };

// // //     const fetchOptimizedRoute = async () => {
// // //         try {
// // //             const response = await api.get('/driver/route/optimized');
// // //             setOptimizedRoute(response.data);
// // //         } catch (error) {
// // //             console.error('Error fetching optimized route:', error);
// // //         }
// // //     };

// // //     const shareLocation = async () => {
// // //         if (navigator.geolocation) {
// // //             navigator.geolocation.getCurrentPosition(async (position) => {
// // //                 try {
// // //                     await api.post('/driver/location', {
// // //                         latitude: position.coords.latitude,
// // //                         longitude: position.coords.longitude,
// // //                         speed: position.coords.speed || 0,
// // //                         heading: position.coords.heading || 0
// // //                     });
// // //                 } catch (error) {
// // //                     console.error('Error sharing location:', error);
// // //                 }
// // //             });
// // //         }
// // //     };

// // //     const markDelivered = async (orderId) => {
// // //         try {
// // //             await api.post(`/driver/mark-delivered/${orderId}`);
// // //             fetchTodaysOrders();
// // //             fetchOptimizedRoute();
// // //             alert('Order marked as delivered!');
// // //         } catch (error) {
// // //             console.error('Error marking delivered:', error);
// // //             alert('Failed to mark as delivered');
// // //         }
// // //     };

// // //     const markAttempted = async (orderId) => {
// // //         const reason = prompt('Enter reason for failed delivery:');
// // //         if (reason) {
// // //             try {
// // //                 await api.post(`/driver/mark-attempted/${orderId}`, { reason });
// // //                 fetchTodaysOrders();
// // //                 fetchOptimizedRoute();
// // //                 alert('Delivery attempt recorded');
// // //             } catch (error) {
// // //                 console.error('Error marking attempted:', error);
// // //             }
// // //         }
// // //     };

// // //     const getPriorityBadge = (priority) => {
// // //         switch (priority) {
// // //             case 1:
// // //                 return <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">High Priority</span>;
// // //             case 2:
// // //                 return <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">Normal</span>;
// // //             case 3:
// // //                 return <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">Low/Rescheduled</span>;
// // //             default:
// // //                 return null;
// // //         }
// // //     };

// // //     const renderOrder = (order, index) => (
// // //         <div key={order.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition">
// // //             <div className="flex justify-between items-start mb-3">
// // //                 <div>
// // //                     <div className="flex items-center gap-2 mb-1">
// // //                         <span className="text-lg font-semibold text-gray-900">#{index + 1}</span>
// // //                         {getPriorityBadge(order.priority)}
// // //                     </div>
// // //                     <p className="text-sm text-gray-600">Order ID: {order.id}</p>
// // //                 </div>
// // //                 <div className="text-right">
// // //                     <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
// // //                         order.status === 'InTransit' ? 'bg-blue-100 text-blue-800' :
// // //                             'bg-yellow-100 text-yellow-800'
// // //                         }`}>
// // //                         {order.status}
// // //                     </span>
// // //                 </div>
// // //             </div>

// // //             <div className="space-y-2 mb-4">
// // //                 <div>
// // //                     <p className="text-xs text-gray-500">Receiver</p>
// // //                     <p className="font-medium">{order.receiverName}</p>
// // //                     <p className="text-sm text-gray-600">{order.receiverPhone}</p>
// // //                 </div>
// // //                 <div>
// // //                     <p className="text-xs text-gray-500">Delivery Address</p>
// // //                     <p className="text-sm">{order.receiverAddress}</p>
// // //                 </div>
// // //                 {order.destinationWarehouse && (
// // //                     <div>
// // //                         <p className="text-xs text-gray-500">Warehouse</p>
// // //                         <p className="text-sm font-medium text-blue-600">{order.destinationWarehouse.name}</p>
// // //                         <p className="text-xs text-gray-500">{order.destinationWarehouse.city}</p>
// // //                     </div>
// // //                 )}
// // //                 {order.deliveryNotes && (
// // //                     <div>
// // //                         <p className="text-xs text-gray-500">Notes</p>
// // //                         <p className="text-sm">{order.deliveryNotes}</p>
// // //                     </div>
// // //                 )}
// // //             </div>

// // //             <div className="flex gap-2">
// // //                 <button
// // //                     onClick={() => markDelivered(order.id)}
// // //                     className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
// // //                 >
// // //                     Mark Delivered
// // //                 </button>
// // //                 <button
// // //                     onClick={() => markAttempted(order.id)}
// // //                     className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
// // //                 >
// // //                     Mark Attempted
// // //                 </button>
// // //             </div>
// // //         </div>
// // //     );

// // //     if (loading) {
// // //         return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
// // //     }

// // //     return (
// // //         <div className="min-h-screen bg-gray-50">
// // //             {/* Header */}
// // //             <header className="bg-white shadow">
// // //                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
// // //                     <div className="flex justify-between items-center">
// // //                         <div>
// // //                             <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard</h1>
// // //                             <p className="text-sm text-gray-600 mt-1">Welcome back, {user?.name}!</p>
// // //                             {warehouse && (
// // //                                 <p className="text-sm text-blue-600 font-medium mt-1">
// // //                                     📍 Assigned to: {warehouse.name}, {warehouse.city}
// // //                                 </p>
// // //                             )}
// // //                         </div>
// // //                         <button
// // //                             onClick={logout}
// // //                             className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-200"
// // //                         >
// // //                             Logout
// // //                         </button>
// // //                     </div>
// // //                 </div>
// // //             </header>

// // //             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
// // //                 {/* Stats Cards */}
// // //                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
// // //                     <div className="bg-white rounded-lg shadow p-6">
// // //                         <p className="text-gray-500 text-sm">Today's Deliveries</p>
// // //                         <p className="text-3xl font-bold text-blue-600">{orders.length}</p>
// // //                     </div>
// // //                     <div className="bg-white rounded-lg shadow p-6">
// // //                         <p className="text-gray-500 text-sm">High Priority</p>
// // //                         <p className="text-3xl font-bold text-red-600">{orders.filter(o => o.priority === 1).length}</p>
// // //                     </div>
// // //                     <div className="bg-white rounded-lg shadow p-6">
// // //                         <p className="text-gray-500 text-sm">Normal</p>
// // //                         <p className="text-3xl font-bold text-blue-600">{orders.filter(o => o.priority === 2).length}</p>
// // //                     </div>
// // //                     <div className="bg-white rounded-lg shadow p-6">
// // //                         <p className="text-gray-500 text-sm">Rescheduled</p>
// // //                         <p className="text-3xl font-bold text-gray-600">{orders.filter(o => o.priority === 3).length}</p>
// // //                     </div>
// // //                 </div>

// // //                 {/* Location Sharing Toggle */}
// // //                 <div className="bg-white rounded-lg shadow p-4 mb-6">
// // //                     <div className="flex items-center justify-between">
// // //                         <div>
// // //                             <h3 className="font-semibold text-gray-900">Live Location Sharing</h3>
// // //                             <p className="text-sm text-gray-600">Share your location with customers every 10 seconds</p>
// // //                         </div>
// // //                         <button
// // //                             onClick={() => setLocationSharing(!locationSharing)}
// // //                             className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${locationSharing ? 'bg-green-600' : 'bg-gray-200'
// // //                                 }`}
// // //                         >
// // //                             <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${locationSharing ? 'translate-x-6' : 'translate-x-1'
// // //                                 }`} />
// // //                         </button>
// // //                     </div>
// // //                     {locationSharing && (
// // //                         <p className="text-xs text-green-600 mt-2">🟢 Location sharing active</p>
// // //                     )}
// // //                 </div>

// // //                 {/* Tabs */}
// // //                 <div className="flex gap-4 mb-6">
// // //                     <button
// // //                         onClick={() => setActiveTab('today')}
// // //                         className={`px-6 py-2 rounded-lg font-medium transition ${activeTab === 'today'
// // //                             ? 'bg-blue-600 text-white'
// // //                             : 'bg-white text-gray-700 hover:bg-gray-50'
// // //                             }`}
// // //                     >
// // //                         Today's Orders ({orders.length})
// // //                     </button>
// // //                     <button
// // //                         onClick={() => setActiveTab('optimized')}
// // //                         className={`px-6 py-2 rounded-lg font-medium transition ${activeTab === 'optimized'
// // //                             ? 'bg-blue-600 text-white'
// // //                             : 'bg-white text-gray-700 hover:bg-gray-50'
// // //                             }`}
// // //                     >
// // //                         Optimized Route ({optimizedRoute.length})
// // //                     </button>
// // //                 </div>

// // //                 {/* Orders List */}
// // //                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// // //                     {activeTab === 'today' && orders.length === 0 && (
// // //                         <div className="col-span-2 bg-white rounded-lg shadow p-8 text-center">
// // //                             <p className="text-gray-500">No orders assigned for today</p>
// // //                         </div>
// // //                     )}
// // //                     {activeTab === 'today' && orders.map((order, index) => renderOrder(order, index))}

// // //                     {activeTab === 'optimized' && optimizedRoute.length === 0 && (
// // //                         <div className="col-span-2 bg-white rounded-lg shadow p-8 text-center">
// // //                             <p className="text-gray-500">No orders in optimized route</p>
// // //                         </div>
// // //                     )}
// // //                     {activeTab === 'optimized' && optimizedRoute.map((order, index) => renderOrder(order, index))}
// // //                 </div>

// // //                 {/* Quick Actions */}
// // //                 <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
// // //                     <button
// // //                     onClick={() => navigate('/driver/route')}
// // //                     className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 text-center font-medium transition"
// // //                     >
// // //                     📍 View Route on Map
// // //                     </button>
// // //                     <button
// // //                         onClick={() => {
// // //                             const issueType = prompt('Enter issue type (e.g., Traffic, Accident, Road Block):');
// // //                             if (issueType) {
// // //                                 const description = prompt('Enter description:');
// // //                                 if (description && navigator.geolocation) {
// // //                                     navigator.geolocation.getCurrentPosition(async (position) => {
// // //                                         try {
// // //                                             await api.post('/driver/report-issue', {
// // //                                                 issueType,
// // //                                                 description,
// // //                                                 latitude: position.coords.latitude,
// // //                                                 longitude: position.coords.longitude
// // //                                             });
// // //                                             alert('Issue reported successfully!');
// // //                                         } catch (error) {
// // //                                             console.error('Error reporting issue:', error);
// // //                                             alert('Failed to report issue');
// // //                                         }
// // //                                     });
// // //                                 }
// // //                             }
// // //                         }}
// // //                         className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg p-4 font-medium transition"
// // //                     >
// // //                         ⚠️ Report Road Issue
// // //                     </button>
// // //                 </div>
// // //             </div>
// // //         </div>
// // //     );
// // // };

// // // export default DriverDashboard;


// // import { useState, useEffect } from 'react';
// // import { useAuth } from '../../context/AuthContext';
// // import api from '../../services/api';
// // import { useNavigate } from "react-router-dom";
// // import * as signalR from "@microsoft/signalr";   // ✅ Step C Import


// // const DriverDashboard = () => {
// //     const navigate = useNavigate();
// //     const { user, logout } = useAuth();

// //     const [orders, setOrders] = useState([]);
// //     const [optimizedRoute, setOptimizedRoute] = useState([]);
// //     const [route, setRoute] = useState(null); // ✅ Step C New state
// //     const [warehouse, setWarehouse] = useState(null);
// //     const [locationSharing, setLocationSharing] = useState(false);
// //     const [loading, setLoading] = useState(true);
// //     const [activeTab, setActiveTab] = useState('today');

// //     // -----------------------------------------
// //     // STEP C — SIGNALR ROUTE UPDATE SETUP
// //     // -----------------------------------------
// //     const setupSignalR = async () => {
// //         try {
// //             const connection = new signalR.HubConnectionBuilder()
// //                 .withUrl("http://localhost:5066/hubs/logistics")
// //                 .withAutomaticReconnect()
// //                 .build();

// //             // Receive new optimized route
// //             connection.on("ReceiveRouteUpdate", (routeData) => {
// //                 console.log("📡 New Route Update Received:", routeData);
// //                 setRoute(routeData);
// //                 setOptimizedRoute(routeData.stops || []); // update optimized tab
// //             });

// //             await connection.start();
// //             console.log("🟢 Driver connected to SignalR hub");

// //             // Join driver group
// //             await connection.invoke("JoinDriverRouteGroup", Number(user.id));

// //             console.log("👤 Driver joined route group");

// //         } catch (err) {
// //             console.error("SignalR Error:", err);
// //         }
// //     };

// //     useEffect(() => {
// //         setupSignalR();
// //     }, []);

// //     // -----------------------------------------
// //     // FETCH ORDERS & ROUTE
// //     // -----------------------------------------
// //     useEffect(() => {
// //         fetchTodaysOrders();
// //         fetchOptimizedRoute();

// //         let locationInterval;
// //         if (locationSharing) {
// //             locationInterval = setInterval(shareLocation, 10000);
// //         }

// //         return () => {
// //             if (locationInterval) clearInterval(locationInterval);
// //         };
// //     }, [locationSharing]);


// //     const fetchTodaysOrders = async () => {
// //         try {
// //             const response = await api.get('/driver/orders/today');
// //             setOrders(response.data);

// //             if (response.data.length > 0 && response.data[0].currentWarehouse) {
// //                 setWarehouse(response.data[0].currentWarehouse);
// //             }
// //         } catch (error) {
// //             console.error('Error fetching orders:', error);
// //         } finally {
// //             setLoading(false);
// //         }
// //     };


// //     const fetchOptimizedRoute = async () => {
// //         try {
// //             const response = await api.get('/driver/route/optimized');
// //             setOptimizedRoute(response.data);
// //         } catch (error) {
// //             console.error('Error fetching optimized route:', error);
// //         }
// //     };

// //     // -----------------------------------------
// //     // SHARE LOCATION EVERY 10 SECONDS
// //     // -----------------------------------------
// //     const shareLocation = async () => {
// //         if (navigator.geolocation) {
// //             navigator.geolocation.getCurrentPosition(async (position) => {
// //                 try {
// //                     await api.post('/driver/location', {
// //                         latitude: position.coords.latitude,
// //                         longitude: position.coords.longitude,
// //                         speed: position.coords.speed || 0,
// //                         heading: position.coords.heading || 0
// //                     });
// //                 } catch (error) {
// //                     console.error('Error sharing location:', error);
// //                 }
// //             });
// //         }
// //     };

// //     // -----------------------------------------
// //     // MARK DELIVERED / ATTEMPTED
// //     // -----------------------------------------
// //     const markDelivered = async (orderId) => {
// //         try {
// //             await api.post(`/driver/mark-delivered/${orderId}`);
// //             fetchTodaysOrders();
// //             fetchOptimizedRoute();
// //             alert('Order marked as delivered!');
// //         } catch (error) {
// //             console.error('Error marking delivered:', error);
// //             alert('Failed to mark delivered');
// //         }
// //     };

// //     const markAttempted = async (orderId) => {
// //         const reason = prompt('Enter reason for failed delivery:');
// //         if (reason) {
// //             try {
// //                 await api.post(`/driver/mark-attempted/${orderId}`, { reason });
// //                 fetchTodaysOrders();
// //                 fetchOptimizedRoute();
// //                 alert('Delivery attempt recorded');
// //             } catch (error) {
// //                 console.error('Error marking attempted:', error);
// //             }
// //         }
// //     };

// //     // -----------------------------------------
// //     // UI HELPERS
// //     // -----------------------------------------
// //     const getPriorityBadge = (priority) => {
// //         switch (priority) {
// //             case 1:
// //                 return <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">High Priority</span>;
// //             case 2:
// //                 return <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">Normal</span>;
// //             case 3:
// //                 return <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">Low/Rescheduled</span>;
// //             default:
// //                 return null;
// //         }
// //     };

// //     const renderOrder = (order, index) => (
// //         <div key={order.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition">
// //             <div className="flex justify-between items-start mb-3">
// //                 <div>
// //                     <div className="flex items-center gap-2 mb-1">
// //                         <span className="text-lg font-semibold text-gray-900">#{index + 1}</span>
// //                         {getPriorityBadge(order.priority)}
// //                     </div>
// //                     <p className="text-sm text-gray-600">Order ID: {order.id}</p>
// //                 </div>
// //                 <div className="text-right">
// //                     <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
// //                             order.status === 'InTransit' ? 'bg-blue-100 text-blue-800' :
// //                                 'bg-yellow-100 text-yellow-800'
// //                         }`}>
// //                         {order.status}
// //                     </span>
// //                 </div>
// //             </div>

// //             <div className="space-y-2 mb-4">
// //                 <div>
// //                     <p className="text-xs text-gray-500">Receiver</p>
// //                     <p className="font-medium">{order.receiverName}</p>
// //                     <p className="text-sm text-gray-600">{order.receiverPhone}</p>
// //                 </div>

// //                 <div>
// //                     <p className="text-xs text-gray-500">Delivery Address</p>
// //                     <p className="text-sm">{order.receiverAddress}</p>
// //                 </div>

// //                 {order.destinationWarehouse && (
// //                     <div>
// //                         <p className="text-xs text-gray-500">Warehouse</p>
// //                         <p className="text-sm font-medium text-blue-600">{order.destinationWarehouse.name}</p>
// //                         <p className="text-xs text-gray-500">{order.destinationWarehouse.city}</p>
// //                     </div>
// //                 )}

// //                 {order.deliveryNotes && (
// //                     <div>
// //                         <p className="text-xs text-gray-500">Notes</p>
// //                         <p className="text-sm">{order.deliveryNotes}</p>
// //                     </div>
// //                 )}
// //             </div>

// //             <div className="flex gap-2">
// //                 <button
// //                     onClick={() => markDelivered(order.id)}
// //                     className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
// //                     Mark Delivered
// //                 </button>
// //                 <button
// //                     onClick={() => markAttempted(order.id)}
// //                     className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
// //                     Mark Attempted
// //                 </button>
// //             </div>
// //         </div>
// //     );

// //     // -----------------------------------------
// //     // LOADING
// //     // -----------------------------------------
// //     if (loading) {
// //         return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
// //     }

// //     return (
// //         <div className="min-h-screen bg-gray-50">

// //             {/* HEADER */}
// //             <header className="bg-white shadow">
// //                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
// //                     <div className="flex justify-between items-center">
// //                         <div>
// //                             <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard</h1>
// //                             <p className="text-sm text-gray-600 mt-1">Welcome back, {user?.name}!</p>

// //                             {warehouse && (
// //                                 <p className="text-sm text-blue-600 font-medium mt-1">
// //                                     📍 Assigned to: {warehouse.name}, {warehouse.city}
// //                                 </p>
// //                             )}
// //                         </div>

// //                         <button
// //                             onClick={logout}
// //                             className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition">
// //                             Logout
// //                         </button>
// //                     </div>
// //                 </div>
// //             </header>

// //             {/* MAIN CONTENT */}
// //             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

// //                 {/* Route Update UI From Step C */}
// //                 {route && (
// //                     <div className="mb-8 bg-blue-50 p-4 rounded-lg shadow">
// //                         <h2 className="text-xl font-bold mb-3">🚚 Updated Route Assigned</h2>
// //                         {route.stops.map((stop, index) => (
// //                             <div key={index} className="border-b py-2">
// //                                 <p className="font-semibold">Stop {stop.sequence}</p>
// //                                 <p>Order ID: {stop.orderId}</p>
// //                                 <p>ETA: {stop.etaMinutes} mins</p>
// //                             </div>
// //                         ))}
// //                     </div>
// //                 )}

// //                 {/* Dashboard Stats */}
// //                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
// //                     <div className="bg-white rounded-lg shadow p-6">
// //                         <p className="text-gray-500 text-sm">Today's Deliveries</p>
// //                         <p className="text-3xl font-bold text-blue-600">{orders.length}</p>
// //                     </div>

// //                     <div className="bg-white rounded-lg shadow p-6">
// //                         <p className="text-gray-500 text-sm">High Priority</p>
// //                         <p className="text-3xl font-bold text-red-600">
// //                             {orders.filter(o => o.priority === 1).length}
// //                         </p>
// //                     </div>

// //                     <div className="bg-white rounded-lg shadow p-6">
// //                         <p className="text-gray-500 text-sm">Normal</p>
// //                         <p className="text-3xl font-bold text-blue-600">
// //                             {orders.filter(o => o.priority === 2).length}
// //                         </p>
// //                     </div>

// //                     <div className="bg-white rounded-lg shadow p-6">
// //                         <p className="text-gray-500 text-sm">Rescheduled</p>
// //                         <p className="text-3xl font-bold text-gray-600">
// //                             {orders.filter(o => o.priority === 3).length}
// //                         </p>
// //                     </div>
// //                 </div>

// //                 {/* Location Sharing Toggle */}
// //                 <div className="bg-white rounded-lg shadow p-4 mb-6">
// //                     <div className="flex items-center justify-between">
// //                         <div>
// //                             <h3 className="font-semibold text-gray-900">Live Location Sharing</h3>
// //                             <p className="text-sm text-gray-600">Share your location with customers every 10 seconds</p>
// //                         </div>

// //                         <button
// //                             onClick={() => setLocationSharing(!locationSharing)}
// //                             className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${locationSharing ? 'bg-green-600' : 'bg-gray-200'
// //                                 }`}>
// //                             <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${locationSharing ? 'translate-x-6' : 'translate-x-1'
// //                                 }`} />
// //                         </button>
// //                     </div>

// //                     {locationSharing && (
// //                         <p className="text-xs text-green-600 mt-2">🟢 Location sharing active</p>
// //                     )}
// //                 </div>

// //                 {/* ROUTE TAB SWITCHER */}
// //                 <div className="flex gap-4 mb-6">
// //                     <button
// //                         onClick={() => setActiveTab('today')}
// //                         className={`px-6 py-2 rounded-lg font-medium transition ${activeTab === 'today'
// //                                 ? 'bg-blue-600 text-white'
// //                                 : 'bg-white text-gray-700 hover:bg-gray-50'
// //                             }`}>
// //                         Today's Orders ({orders.length})
// //                     </button>

// //                     <button
// //                         onClick={() => setActiveTab('optimized')}
// //                         className={`px-6 py-2 rounded-lg font-medium transition ${activeTab === 'optimized'
// //                                 ? 'bg-blue-600 text-white'
// //                                 : 'bg-white text-gray-700 hover:bg-gray-50'
// //                             }`}>
// //                         Optimized Route ({optimizedRoute.length})
// //                     </button>
// //                 </div>

// //                 {/* ORDER LIST */}
// //                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

// //                     {activeTab === 'today' && orders.length === 0 && (
// //                         <div className="col-span-2 bg-white rounded-lg shadow p-8 text-center">
// //                             <p className="text-gray-500">No orders assigned for today</p>
// //                         </div>
// //                     )}

// //                     {activeTab === 'today' && orders.map((order, i) => renderOrder(order, i))}

// //                     {activeTab === 'optimized' && optimizedRoute.length === 0 && (
// //                         <div className="col-span-2 bg-white rounded-lg shadow p-8 text-center">
// //                             <p className="text-gray-500">No optimized route found</p>
// //                         </div>
// //                     )}

// //                     {activeTab === 'optimized' &&
// //                         optimizedRoute.map((order, i) => renderOrder(order, i))}
// //                 </div>

// //                 {/* QUICK ACTIONS */}
// //                 <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
// //                     <button
// //                         onClick={() => navigate('/driver/route')}
// //                         className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 text-center font-medium transition">
// //                         📍 View Route on Map
// //                     </button>

// //                     <button
// //                         onClick={() => {
// //                             const issueType = prompt('Enter issue type (e.g., Traffic, Accident, Road Block):');
// //                             if (issueType) {
// //                                 const description = prompt('Enter description:');
// //                                 if (description && navigator.geolocation) {
// //                                     navigator.geolocation.getCurrentPosition(async (pos) => {
// //                                         try {
// //                                             await api.post('/driver/report-issue', {
// //                                                 issueType,
// //                                                 description,
// //                                                 latitude: pos.coords.latitude,
// //                                                 longitude: pos.coords.longitude
// //                                             });
// //                                             alert('Issue reported successfully!');
// //                                         } catch (error) {
// //                                             console.error('Error reporting issue:', error);
// //                                             alert('Failed to report issue');
// //                                         }
// //                                     });
// //                                 }
// //                             }
// //                         }}
// //                         className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg p-4 font-medium transition">
// //                         ⚠️ Report Road Issue
// //                     </button>
// //                 </div>

// //             </div>
// //         </div>
// //     );
// // };

// // export default DriverDashboard;

// import { useState, useEffect } from "react";
// import { useAuth } from "../../context/AuthContext";
// import api from "../../services/api";
// import { useNavigate } from "react-router-dom";
// import * as signalR from "@microsoft/signalr";

// const DriverDashboard = () => {
//     const navigate = useNavigate();
//     const { user, logout } = useAuth();

//     const [orders, setOrders] = useState([]);
//     const [optimizedRoute, setOptimizedRoute] = useState([]);
//     const [route, setRoute] = useState(null);
//     const [warehouse, setWarehouse] = useState(null);
//     const [locationSharing, setLocationSharing] = useState(false);
//     const [loading, setLoading] = useState(true);
//     const [activeTab, setActiveTab] = useState("today");

//     // ============================================================
//     // SIGNALR - Connect Driver to Receive Live Route Updates
//     // ============================================================
//     const setupSignalR = async () => {
//         try {
//             const connection = new signalR.HubConnectionBuilder()
//                 .withUrl("http://localhost:5066/hubs/logistics")
//                 .withAutomaticReconnect()
//                 .build();

//             // When admin pushes new route
//             connection.on("ReceiveRouteUpdate", (routeData) => {
//                 console.log("📡 New Route Update Received:", routeData);
//                 setRoute(routeData);
//                 setOptimizedRoute(routeData.stops || []);
//             });

//             await connection.start();
//             console.log("🟢 Connected to SignalR Hub");

//             await connection.invoke("JoinDriverRouteGroup", Number(user.userId));
//             console.log("👤 Driver joined route group");
//         } catch (error) {
//             console.error("SignalR Setup Error:", error);
//         }
//     };

//     useEffect(() => {
//         setupSignalR();
//     }, []);

//     // ============================================================
//     // FETCH DATA
//     // ============================================================
//     const fetchTodaysOrders = async () => {
//         try {
//             const res = await api.get("/driver/orders/today");
//             setOrders(res.data);

//             if (res.data.length > 0 && res.data[0].currentWarehouse) {
//                 setWarehouse(res.data[0].currentWarehouse);
//             }
//         } catch (error) {
//             console.error("Error fetching orders:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchOptimizedRoute = async () => {
//         try {
//             const res = await api.get("/driver/route/optimized");
//             setOptimizedRoute(res.data);
//         } catch (error) {
//             console.error("Error fetching optimized route:", error);
//         }
//     };

//     useEffect(() => {
//         fetchTodaysOrders();
//         fetchOptimizedRoute();
//     }, []);

//     // ============================================================
//     // LOCATION SHARING EVERY 10s
//     // ============================================================
//     useEffect(() => {
//         let interval;
//         if (locationSharing) {
//             interval = setInterval(shareLocation, 10000);
//         }
//         return () => clearInterval(interval);
//     }, [locationSharing]);

//     const shareLocation = () => {
//         navigator.geolocation.getCurrentPosition(async (pos) => {
//             await api.post("/driver/location", {
//                 latitude: pos.coords.latitude,
//                 longitude: pos.coords.longitude,
//                 speed: pos.coords.speed || 0,
//                 heading: pos.coords.heading || 0,
//             });
//         });
//     };

//     // ============================================================
//     // ORDER ACTIONS
//     // ============================================================
//     const markDelivered = async (orderId) => {
//         await api.post(`/driver/mark-delivered/${orderId}`);
//         fetchTodaysOrders();
//         fetchOptimizedRoute();
//         alert("Order Delivered!");
//     };

//     const markAttempted = async (orderId) => {
//         const reason = prompt("Enter failed delivery reason:");
//         if (!reason) return;

//         await api.post(`/driver/mark-attempted/${orderId}`, { reason });
//         fetchTodaysOrders();
//         fetchOptimizedRoute();
//         alert("Attempt recorded.");
//     };

//     // ============================================================
//     // UI - Order Card Renderer
//     // ============================================================
//     const renderOrderCard = (order, index) => (
//         <div key={order.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition">
//             <div className="flex justify-between mb-3">
//                 <h2 className="font-bold text-lg">#{index + 1}</h2>
//                 <span className="text-sm px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
//                     {order.status}
//                 </span>
//             </div>

//             <p className="font-medium text-gray-800">{order.receiverName}</p>
//             <p className="text-sm text-gray-600">{order.receiverAddress}</p>

//             <div className="flex gap-2 mt-4">
//                 <button
//                     onClick={() => markDelivered(order.id)}
//                     className="flex-1 bg-green-600 text-white rounded-lg py-2">
//                     Delivered
//                 </button>
//                 <button
//                     onClick={() => markAttempted(order.id)}
//                     className="flex-1 bg-orange-600 text-white rounded-lg py-2">
//                     Attempted
//                 </button>
//             </div>
//         </div>
//     );

//     if (loading) return <div className="h-screen flex justify-center items-center">Loading...</div>;

//     return (
//         <div className="min-h-screen bg-gray-50">

//             {/* ============================================================
//                HEADER
//             ============================================================ */}
//             <header className="bg-white shadow">
//                 <div className="max-w-7xl mx-auto p-4 flex justify-between">
//                     <div>
//                         <h1 className="text-2xl font-bold">Driver Dashboard</h1>
//                         <p className="text-gray-600 mt-1">Welcome, {user?.name}</p>

//                         {warehouse && (
//                             <p className="text-blue-600 text-sm">
//                                 📦 Assigned Warehouse: {warehouse.name}, {warehouse.city}
//                             </p>
//                         )}
//                     </div>
//                     <button
//                         onClick={logout}
//                         className="px-4 py-2 bg-red-600 text-white rounded-lg">
//                         Logout
//                     </button>
//                 </div>
//             </header>

//             {/* ============================================================
//                MAIN CONTENT
//             ============================================================ */}
//             <div className="max-w-7xl mx-auto p-6">

//                 {/* LIVE ROUTE UPDATE BANNER */}
//                 {route && (
//                     <div className="bg-blue-50 border p-4 rounded-lg shadow mb-6">
//                         <h2 className="text-xl font-bold mb-3">🚚 Updated Route Received</h2>

//                         {route.stops.map((stop, i) => (
//                             <div key={i} className="py-2 border-b">
//                                 <p className="font-semibold">Stop {stop.sequence}</p>
//                                 <p>Order ID: {stop.orderId}</p>
//                                 <p>ETA: {stop.etaMinutes} mins</p>
//                             </div>
//                         ))}
//                     </div>
//                 )}

//                 {/* TOP STATS */}
//                 <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
//                     <div className="bg-white shadow rounded-lg p-6">
//                         <p className="text-gray-500 text-sm">Total Orders Today</p>
//                         <p className="text-3xl font-bold text-blue-600">{orders.length}</p>
//                     </div>
//                     <div className="bg-white shadow rounded-lg p-6">
//                         <p className="text-gray-500 text-sm">Optimized Stops</p>
//                         <p className="text-3xl font-bold text-green-600">{optimizedRoute.length}</p>
//                     </div>
//                 </div>

//                 {/* LOCATION SHARING TOGGLE */}
//                 <div className="bg-white p-4 rounded-lg shadow mb-8">
//                     <div className="flex justify-between">
//                         <div>
//                             <h3 className="font-semibold">Live Location Sharing</h3>
//                             <p className="text-sm text-gray-500">Updates every 10 seconds</p>
//                         </div>

//                         <button
//                             onClick={() => setLocationSharing(!locationSharing)}
//                             className={`relative inline-flex h-6 w-12 items-center rounded-full transition ${
//                                 locationSharing ? "bg-green-600" : "bg-gray-300"
//                             }`}>
//                             <span
//                                 className={`h-5 w-5 bg-white rounded-full transform transition ${
//                                     locationSharing ? "translate-x-6" : "translate-x-1"
//                                 }`}
//                             />
//                         </button>
//                     </div>

//                     {locationSharing && (
//                         <p className="text-sm text-green-700 mt-2">🟢 Location sharing active</p>
//                     )}
//                 </div>

//                 {/* TAB SWITCHER */}
//                 <div className="flex gap-4 mb-6">
//                     <button
//                         onClick={() => setActiveTab("today")}
//                         className={`px-6 py-2 rounded-lg ${
//                             activeTab === "today"
//                                 ? "bg-blue-600 text-white"
//                                 : "bg-white shadow"
//                         }`}>
//                         Today's Orders ({orders.length})
//                     </button>

//                     <button
//                         onClick={() => setActiveTab("optimized")}
//                         className={`px-6 py-2 rounded-lg ${
//                             activeTab === "optimized"
//                                 ? "bg-blue-600 text-white"
//                                 : "bg-white shadow"
//                         }`}>
//                         Optimized Route ({optimizedRoute.length})
//                     </button>
//                 </div>

//                 {/* ORDER LIST */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     {activeTab === "today" &&
//                         orders.map((o, i) => renderOrderCard(o, i))}

//                     {activeTab === "optimized" &&
//                         optimizedRoute.map((o, i) => renderOrderCard(o, i))}
//                 </div>

//                 {/* QUICK ACTIONS */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
//                     <button
//                         onClick={() => navigate("/driver/route")}
//                         className="bg-blue-600 text-white rounded-lg p-4">
//                         📍 View Route Map
//                     </button>

//                     <button
//                         onClick={() => {
//                             const type = prompt("Issue Type (Traffic / Accident / Road Block):");
//                             if (!type) return;

//                             const desc = prompt("Description:");
//                             if (!desc) return;

//                             navigator.geolocation.getCurrentPosition(async (pos) => {
//                                 await api.post("/driver/report-issue", {
//                                     issueType: type,
//                                     description: desc,
//                                     latitude: pos.coords.latitude,
//                                     longitude: pos.coords.longitude,
//                                 });
//                                 alert("Issue reported successfully!");
//                             });
//                         }}
//                         className="bg-orange-600 text-white rounded-lg p-4">
//                         ⚠️ Report Road Issue
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default DriverDashboard;


import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import * as signalR from "@microsoft/signalr";
import OrderDetailsModal from "./OrderDetailsModal";


const DriverDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [orders, setOrders] = useState([]);
    const [optimizedRoute, setOptimizedRoute] = useState([]);
    const [route, setRoute] = useState(null);
    const [warehouse, setWarehouse] = useState(null);
    const [locationSharing, setLocationSharing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("today");
    const [showRescheduleAlert, setShowRescheduleAlert] = useState(false);
    const [rescheduleInfo, setRescheduleInfo] = useState(null);

    const [selectedOrderId, setSelectedOrderId] = useState(null);
const [showOrderModal, setShowOrderModal] = useState(false);

const openOrderDetails = (id) => {
    setSelectedOrderId(id);
    setShowOrderModal(true);
};


    const setupSignalR = async () => {
        try {
            const connection = new signalR.HubConnectionBuilder()
                .withUrl("http://localhost:5066/hubs/logistics")
                .withAutomaticReconnect()
                .build();

            connection.on("ReceiveRouteUpdate", (routeData) => {
                console.log("📡 New Route Update:", routeData);
                setRoute(routeData);
                setOptimizedRoute(routeData.stops || []);
            });

            // 🆕 FEATURE 2: LISTEN FOR RESCHEDULE NOTIFICATIONS
            connection.on("OrderRescheduled", (data) => {
                console.log("🔔 Order Rescheduled:", data);
                setRescheduleInfo(data);
                setShowRescheduleAlert(true);

                // Refresh orders and route
                fetchTodaysOrders();
                fetchOptimizedRoute();
            });

            await connection.start();
            console.log("🟢 Driver connected to SignalR");

            await connection.invoke("JoinDriverRouteGroup", Number(user.userId));
            await connection.invoke("JoinDriverGroup", Number(user.userId));
            console.log("✅ Joined driver groups");
        } catch (error) {
            console.error("SignalR Error:", error);
        }
    };

    useEffect(() => {
        setupSignalR();
    }, []);

    const fetchTodaysOrders = async () => {
        try {
            const res = await api.get("/driver/orders/today");
            setOrders(res.data);

            if (res.data.length > 0 && res.data[0].currentWarehouse) {
                setWarehouse(res.data[0].currentWarehouse);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOptimizedRoute = async () => {
        try {
            const res = await api.get("/driver/route/optimized");
            setOptimizedRoute(res.data);
        } catch (error) {
            console.error("Error fetching route:", error);
        }
    };

    useEffect(() => {
        fetchTodaysOrders();
        fetchOptimizedRoute();
    }, []);

    useEffect(() => {
        let interval;
        if (locationSharing) {
            interval = setInterval(shareLocation, 10000);
        }
        return () => clearInterval(interval);
    }, [locationSharing]);

    const shareLocation = () => {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            await api.post("/driver/location", {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                speed: pos.coords.speed || 0,
                heading: pos.coords.heading || 0,
            });
        });
    };

    const markDelivered = async (orderId) => {
        await api.post(`/driver/mark-delivered/${orderId}`);
        fetchTodaysOrders();
        fetchOptimizedRoute();
        alert("✅ Order Delivered!");
    };

    const markAttempted = async (orderId) => {
        const reason = prompt("Reason for failed delivery:");
        if (!reason) return;

        await api.post(`/driver/mark-attempted/${orderId}`, { reason });
        fetchTodaysOrders();
        fetchOptimizedRoute();
        alert("⚠️ Attempt recorded");
    };

    // 🆕 FEATURE 3: REPORT ROAD ISSUE
    const reportIssue = () => {
        const type = prompt("Issue Type (Traffic / Accident / RoadClosed / Flooding):");
        if (!type) return;

        const desc = prompt("Description:");
        if (!desc) return;

        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                await api.post("/roadissue/report", {
                    issueType: type,
                    description: desc,
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                });
                alert("✅ Road issue reported! Admin has been notified.");
            } catch (error) {
                alert("❌ Failed to report issue");
                console.error(error);
            }
        });
    };

    // const renderOrderCard = (order, index) => (
    //     <div key={order.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition cursor-pointer"onClick={() => openOrderDetails(order.id)}>

    //         <div className="flex justify-between mb-3">
    //             <h2 className="font-bold text-lg">#{index + 1}</h2>
    //             <span className="text-sm px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
    //                 {order.status}
    //             </span>
    //         </div>

    //         <p className="font-medium text-gray-800">{order.receiverName}</p>
    //         {/* 🆕 SHOW RESCHEDULE INFO */}
    //         {order.rescheduledAt && (
    //             <div className="bg-yellow-100 text-yellow-800 p-2 rounded mb-2 text-sm">
    //                 <p className="font-semibold">⏳ Rescheduled</p>
    //                 <p>New Date: {new Date(order.rescheduledAt).toLocaleString()}</p>
    //                 {order.rescheduleReason && (
    //                     <p>Reason: {order.rescheduleReason}</p>
    //                 )}
    //             </div>
    //         )}
    //         <p className="text-sm text-gray-500">Tracking ID: {order.trackingId}</p>
    //         <p className="text-sm text-gray-700 font-medium">{order.receiverName}</p>

    //         <p className="text-sm text-gray-600">{order.receiverAddress}</p>

    //         <div className="flex gap-2 mt-4">
    //             <button
    //                 onClick={() => markDelivered(order.id)}
    //                 className="flex-1 bg-green-600 text-white rounded-lg py-2"
    //             >
    //                 Delivered
    //             </button>
    //             <button
    //                 onClick={() => markAttempted(order.id)}
    //                 className="flex-1 bg-orange-600 text-white rounded-lg py-2"
    //             >
    //                 Attempted
    //             </button>
    //         </div>
            

    //     </div>
        
    // );

    const renderOrderCard = (order, index) => (
  <div
    key={order.id}
    className="bg-white rounded-lg shadow p-4 hover:shadow-md transition cursor-pointer"
    onClick={() => openOrderDetails(order.id)}
  >
    <div className="flex justify-between mb-3 items-center">
      <h2 className="font-bold text-lg">#{index + 1}</h2>

      <div className="flex items-center gap-2">
        {/* Reschedule badge (small) */}
        {order.rescheduledAt && (
          <div className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
            Rescheduled
          </div>
        )}
        <span className="text-sm px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
          {order.status}
        </span>
      </div>
    </div>

    <p className="font-medium text-gray-800">{order.receiverName}</p>

    {/* show short reschedule summary inline (optional) */}
    {order.rescheduledAt && (
      <div className="bg-yellow-50 border-l-4 border-yellow-300 p-2 rounded mt-2 text-sm">
        <div><strong>New:</strong> {new Date(order.rescheduledAt).toLocaleString()}</div>
        {order.rescheduleReason && <div><strong>Why:</strong> {order.rescheduleReason}</div>}
      </div>
    )}

    <p className="text-sm text-gray-500 mt-2">Tracking ID: {order.trackingId}</p>
    <p className="text-sm text-gray-600 mt-1">{order.receiverAddress}</p>

    <div className="flex gap-2 mt-4">
      <button
        onClick={(e) => { e.stopPropagation(); markDelivered(order.id); }}
        className="flex-1 bg-green-600 text-white rounded-lg py-2"
      >
        Delivered
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); markAttempted(order.id); }}
        className="flex-1 bg-orange-600 text-white rounded-lg py-2"
      >
        Attempted
      </button>
    </div>
  </div>
);


    if (loading) return <div className="h-screen flex justify-center items-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto p-4 flex justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Driver Dashboard</h1>
                        <p className="text-gray-600 mt-1">Welcome, {user?.name}</p>

                        {warehouse && (
                            <p className="text-blue-600 text-sm">
                                📦 Warehouse: {warehouse.name}, {warehouse.city}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={logout}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-6">
                {/* 🆕 RESCHEDULE ALERT BANNER */}
                {showRescheduleAlert && rescheduleInfo && (
                    <div className="bg-orange-100 border-l-4 border-orange-500 p-4 mb-6 rounded shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-orange-800 mb-2">
                                    🔔 Order Rescheduled
                                </h3>
                                <p className="text-sm text-orange-700">
                                    Order #{rescheduleInfo.orderId} ({rescheduleInfo.trackingId})
                                </p>
                                <p className="text-sm text-orange-700">
                                    Customer: {rescheduleInfo.customerName}
                                </p>
                                <p className="text-sm text-orange-700">
                                    New Date: {new Date(rescheduleInfo.newDate).toLocaleString()}
                                </p>
                                {rescheduleInfo.reason && (
                                    <p className="text-sm text-orange-700 mt-1">
                                        Reason: {rescheduleInfo.reason}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => setShowRescheduleAlert(false)}
                                className="text-orange-800 hover:text-orange-900 font-bold"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}

                {route && (
                    <div className="bg-blue-50 border p-4 rounded-lg shadow mb-6">
                        <h2 className="text-xl font-bold mb-3">🚚 Updated Route</h2>
                        {route.stops.map((stop, i) => (
                            <div key={i} className="py-2 border-b">
                                <p className="font-semibold">Stop {stop.sequence}</p>
                                <p>Order #{stop.orderId}</p>
                                <p>ETA: {stop.etaMinutes} mins</p>
                            </div>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white shadow rounded-lg p-6">
                        <p className="text-gray-500 text-sm">Today's Orders</p>
                        <p className="text-3xl font-bold text-blue-600">{orders.length}</p>
                    </div>
                    <div className="bg-white shadow rounded-lg p-6">
                        <p className="text-gray-500 text-sm">Optimized Stops</p>
                        <p className="text-3xl font-bold text-green-600">{optimizedRoute.length}</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow mb-8">
                    <div className="flex justify-between">
                        <div>
                            <h3 className="font-semibold">Live Location Sharing</h3>
                            <p className="text-sm text-gray-500">Updates every 10s</p>
                        </div>

                        <button
                            onClick={() => setLocationSharing(!locationSharing)}
                            className={`relative inline-flex h-6 w-12 items-center rounded-full transition ${locationSharing ? "bg-green-600" : "bg-gray-300"
                                }`}
                        >
                            <span
                                className={`h-5 w-5 bg-white rounded-full transform transition ${locationSharing ? "translate-x-6" : "translate-x-1"
                                    }`}
                            />
                        </button>
                    </div>

                    {locationSharing && (
                        <p className="text-sm text-green-700 mt-2">🟢 Location active</p>
                    )}
                </div>

                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab("today")}
                        className={`px-6 py-2 rounded-lg ${activeTab === "today"
                            ? "bg-blue-600 text-white"
                            : "bg-white shadow"
                            }`}
                    >
                        Today's Orders ({orders.length})
                    </button>

                    <button
                        onClick={() => setActiveTab("optimized")}
                        className={`px-6 py-2 rounded-lg ${activeTab === "optimized"
                            ? "bg-blue-600 text-white"
                            : "bg-white shadow"
                            }`}
                    >
                        Optimized Route ({optimizedRoute.length})
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeTab === "today" &&
                        orders.map((o, i) => renderOrderCard(o, i))}

                    {activeTab === "optimized" &&
                        optimizedRoute.map((o, i) => renderOrderCard(o, i))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    <button
                        onClick={() => navigate("/driver/route")}
                        className="bg-blue-600 text-white rounded-lg p-4"
                    >
                        📍 View Route Map
                    </button>

                    <button
                        onClick={reportIssue}
                        className="bg-orange-600 text-white rounded-lg p-4"
                    >
                        ⚠️ Report Road Issue
                    </button>
                </div>
            </div>
            {showOrderModal && (
    <OrderDetailsModal 
        orderId={selectedOrderId}
        onClose={() => setShowOrderModal(false)}
    />
)}

        </div>
        
    );
};

export default DriverDashboard;