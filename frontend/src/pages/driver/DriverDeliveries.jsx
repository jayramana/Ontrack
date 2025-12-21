// // // import React, { useState, useEffect } from "react";
// // // import DriverSidebar from "./DriverSidebar";
// // // import api from "../../services/api";
// // // import OrderDetailsModal from "./OrderDetailsModal";
// // // import DriverASRVerification from "./DriverASRVerification";

// // // export default function DriverDeliveries() {
// // //   const [orders, setOrders] = useState([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [activeTab, setActiveTab] = useState("today");

// // //   // Order modal
// // //   const [selectedOrderId, setSelectedOrderId] = useState(null);
// // //   const [showOrderModal, setShowOrderModal] = useState(false);

// // //   // ASR modal
// // //   const [showASRModal, setShowASRModal] = useState(false);
// // //   const [selectedASROrderId, setSelectedASROrderId] = useState(null);

// // //   const openOrderDetails = (id) => {
// // //     setSelectedOrderId(id);
// // //     setShowOrderModal(true);
// // //   };

// // //   const fetchTodaysOrders = async () => {
// // //     try {
// // //       setLoading(true);
// // //       const res = await api.get("/driver/orders/today/analytics");
// // //       const sorted = (res.data || []).sort((a, b) => b.id - a.id);
// // //       setOrders(sorted);
// // //     } catch (err) {
// // //       console.error("Failed to fetch orders", err);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     fetchTodaysOrders();
// // //   }, []);

// // //   const acceptOrder = async (id) => {
// // //     await api.post(`/driver/accept/${id}`);
// // //     fetchTodaysOrders();
// // //   };

// // //   const rejectOrder = async (id) => {
// // //     if (!window.confirm("Reject this assignment?")) return;
// // //     await api.post(`/driver/reject/${id}`);
// // //     fetchTodaysOrders();
// // //   };

// // //   const markDelivered = async (id) => {
// // //     if (!window.confirm("Confirm delivery?")) return;
// // //     await api.post(`/driver/mark-delivered/${id}`);
// // //     fetchTodaysOrders();
// // //   };

// // //   const markAttempted = async (id) => {
// // //     const reason = prompt("Reason for failed attempt:");
// // //     if (!reason) return;
// // //     await api.post(`/driver/mark-attempted/${id}`, { reason });
// // //     fetchTodaysOrders();
// // //   };

// // //   const renderOrder = (order) => (
// // //     <div
// // //       key={order.id}
// // //       onClick={() => openOrderDetails(order.id)}
// // //       className="
// // //         bg-white/5 backdrop-blur-xl
// // //         border border-white/10
// // //         rounded-2xl p-6 mb-4
// // //         hover:bg-white/10 transition
// // //         flex flex-col md:flex-row gap-4
// // //         justify-between
// // //       "
// // //     >
// // //       {/* LEFT */}
// // //       <div className="flex-1">
// // //         <div className="flex items-center gap-3 mb-3">
// // //           <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#ff8a3d]/20 text-[#ff8a3d]">
// // //             {order.trackingId || `ORD-${order.id}`}
// // //           </span>

// // //           <span
// // //             className={`px-3 py-1 rounded-full text-xs font-bold uppercase
// // //               ${
// // //                 order.status === "Delivered"
// // //                   ? "bg-green-500/20 text-green-400"
// // //                   : order.status === "Cancelled" ||
// // //                     order.status === "DeliveryAttempted"
// // //                   ? "bg-red-500/20 text-red-400"
// // //                   : order.status === "Assigned"
// // //                   ? "bg-blue-500/20 text-blue-400"
// // //                   : "bg-orange-500/20 text-orange-400"
// // //               }
// // //             `}
// // //           >
// // //             {order.status}
// // //           </span>
// // //         </div>

// // //         <h3 className="text-lg font-bold text-white mb-1">
// // //           Order #{order.id}
// // //         </h3>

// // //         <p className="text-slate-400 text-sm">
// // //           {order.receiverAddress}
// // //         </p>

// // //         <p className="text-xs text-slate-500 mt-2">
// // //           Scheduled: {new Date(order.scheduledDate).toLocaleDateString()}
// // //         </p>
// // //       </div>

// // //       {/* RIGHT ACTIONS */}
// // //       <div className="flex gap-3 flex-wrap items-center">
// // //         {order.status === "Assigned" && (
// // //           <>
// // //             <button
// // //               onClick={(e) => {
// // //                 e.stopPropagation();
// // //                 rejectOrder(order.id);
// // //               }}
// // //               className="px-5 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10"
// // //             >
// // //               Reject
// // //             </button>

// // //             <button
// // //               onClick={(e) => {
// // //                 e.stopPropagation();
// // //                 acceptOrder(order.id);
// // //               }}
// // //               className="px-5 py-2 rounded-lg bg-[#ff8a3d] text-black font-bold hover:bg-[#ff9a55]"
// // //             >
// // //               Accept
// // //             </button>
// // //           </>
// // //         )}

// // //         {(order.status === "OutForDelivery" ||
// // //           order.status === "Out for delivery") && (
// // //           <>
// // //             {order.isASR ? (
// // //               <button
// // //                 onClick={(e) => {
// // //                   e.stopPropagation();
// // //                   setSelectedASROrderId(order.id);
// // //                   setShowASRModal(true);
// // //                 }}
// // //                 className="px-5 py-2 rounded-lg border border-[#ff8a3d]/40 text-[#ff8a3d] hover:bg-[#ff8a3d]/10"
// // //               >
// // //                 Verify ASR
// // //               </button>
// // //             ) : (
// // //               <button
// // //                 onClick={(e) => {
// // //                   e.stopPropagation();
// // //                   markDelivered(order.id);
// // //                 }}
// // //                 className="px-5 py-2 rounded-lg border border-green-500/30 text-green-400 hover:bg-green-500/10"
// // //               >
// // //                 Delivered
// // //               </button>
// // //             )}

// // //             <button
// // //               onClick={(e) => {
// // //                 e.stopPropagation();
// // //                 markAttempted(order.id);
// // //               }}
// // //               className="px-5 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10"
// // //             >
// // //               Attempted
// // //             </button>
// // //           </>
// // //         )}

// // //         {(order.status === "Delivered" ||
// // //           order.status === "Cancelled") && (
// // //           <button className="px-5 py-2 rounded-lg border border-white/20 text-slate-400">
// // //             View Details
// // //           </button>
// // //         )}
// // //       </div>
// // //     </div>
// // //   );

// // //   const getFilteredOrders = () => {
// // //     switch (activeTab) {
// // //       case "pending":
// // //         // Orders waiting for acceptance
// // //         return orders.filter((o) => o.status === "Assigned");
// // //       case "completed":
// // //         // Past orders
// // //         return orders.filter((o) => ["Delivered", "Cancelled", "DeliveryAttempted"].includes(o.status));
// // //       case "today":
// // //       default:
// // //         // All active active tasks not in history
// // //         return orders.filter((o) => !["Delivered", "Cancelled"].includes(o.status));
// // //     }
// // //   };

// // //   return (
// // //     <div className="min-h-screen flex bg-gradient-to-br from-[#0b0f14] via-[#0f141c] to-[#0b0f14] text-slate-100">
// // //       <DriverSidebar active="deliveries" />

// // //       <div className="flex-1 overflow-y-auto">
// // //         {/* HEADER */}
// // //         <header className="sticky top-0 z-20 backdrop-blur-xl bg-[#0b0f14]/80 border-b border-white/10">
// // //           <div className="max-w-6xl mx-auto px-6 py-4">
// // //             <h1 className="text-2xl font-black">My Deliveries</h1>
// // //             <p className="text-slate-400 text-sm">
// // //               Manage your route and update statuses
// // //             </p>
// // //           </div>
// // //         </header>

// // //         <div className="max-w-6xl mx-auto p-6">
// // //           {/* TABS */}
// // //           <div className="flex p-1 bg-white/5 rounded-xl w-fit mb-8 border border-white/10">
// // //             {[
// // //               { id: "today", label: "Today" },
// // //               { id: "pending", label: "Pending" },
// // //               { id: "completed", label: "History" },
// // //             ].map((tab) => (
// // //               <button
// // //                 key={tab.id}
// // //                 onClick={() => setActiveTab(tab.id)}
// // //                 className={`px-4 py-2 rounded-lg text-sm font-semibold transition
// // //                   ${
// // //                     activeTab === tab.id
// // //                       ? "bg-white/10 text-white"
// // //                       : "text-slate-400 hover:text-white"
// // //                   }
// // //                 `}
// // //               >
// // //                 {tab.label}
// // //               </button>
// // //             ))}
// // //           </div>

// // //           {loading ? (
// // //             <p className="text-slate-400">Loading orders…</p>
// // //           ) : getFilteredOrders().length === 0 ? (
// // //             <p className="text-slate-500">No orders found for this tab.</p>
// // //           ) : (
// // //             getFilteredOrders().map(renderOrder)
// // //           )}
// // //         </div>
// // //       </div>

// // //       {showOrderModal && (
// // //         <OrderDetailsModal
// // //           orderId={selectedOrderId}
// // //           onClose={() => setShowOrderModal(false)}
// // //         />
// // //       )}

// // //       {showASRModal && (
// // //         <DriverASRVerification
// // //           orderId={selectedASROrderId}
// // //           onClose={() => {
// // //             setShowASRModal(false);
// // //             fetchTodaysOrders();
// // //           }}
// // //         />
// // //       )}
// // //     </div>
// // //   );
// // // }


// // import React, { useState, useEffect } from "react";
// // import { useNavigate } from "react-router-dom";
// // import DriverSidebar from "./DriverSidebar";
// // import api from "../../services/api";
// // import DriverASRVerification from "./DriverASRVerification";

// // export default function DriverDeliveries() {
// //   const navigate = useNavigate();
// //   const [orders, setOrders] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [activeTab, setActiveTab] = useState("today");

// //   // ASR modal
// //   const [showASRModal, setShowASRModal] = useState(false);
// //   const [selectedASROrderId, setSelectedASROrderId] = useState(null);

// //   const openOrderDetails = (id) => {
// //     navigate(`/driver/orders/${id}`);
// //   };

// //   const fetchTodaysOrders = async () => {
// //     try {
// //       setLoading(true);
// //       const res = await api.get("/driver/orders/today/analytics");
// //       const sorted = (res.data || []).sort((a, b) => b.id - a.id);
// //       setOrders(sorted);
// //     } catch (err) {
// //       console.error("Failed to fetch orders", err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchTodaysOrders();
// //   }, []);

// //   const acceptOrder = async (id) => {
// //     await api.post(`/driver/accept/${id}`);
// //     fetchTodaysOrders();
// //   };

// //   const rejectOrder = async (id) => {
// //     if (!window.confirm("Reject this assignment?")) return;
// //     await api.post(`/driver/reject/${id}`);
// //     fetchTodaysOrders();
// //   };

// //   const markDelivered = async (id) => {
// //     if (!window.confirm("Confirm delivery?")) return;
// //     await api.post(`/driver/mark-delivered/${id}`);
// //     fetchTodaysOrders();
// //   };

// //   const markAttempted = async (id) => {
// //     const reason = prompt("Reason for failed attempt:");
// //     if (!reason) return;
// //     await api.post(`/driver/mark-attempted/${id}`, { reason });
// //     fetchTodaysOrders();
// //   };

// //   const renderOrder = (order) => (
// //     <div
// //       key={order.id}
// //       onClick={() => openOrderDetails(order.id)}
// //       className="
// //         bg-white/5 backdrop-blur-xl
// //         border border-white/10
// //         rounded-2xl p-6 mb-4
// //         hover:bg-white/10 transition
// //         flex flex-col md:flex-row gap-4
// //         justify-between
// //       "
// //     >
// //       {/* LEFT */}
// //       <div className="flex-1">
// //         <div className="flex items-center gap-3 mb-3">
// //           <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#ff8a3d]/20 text-[#ff8a3d]">
// //             {order.trackingId || `ORD-${order.id}`}
// //           </span>

// //           <span
// //             className={`px-3 py-1 rounded-full text-xs font-bold uppercase
// //               ${
// //                 order.status === "Delivered"
// //                   ? "bg-green-500/20 text-green-400"
// //                   : order.status === "Cancelled" ||
// //                     order.status === "DeliveryAttempted"
// //                   ? "bg-red-500/20 text-red-400"
// //                   : order.status === "Assigned"
// //                   ? "bg-blue-500/20 text-blue-400"
// //                   : order.status === "Pending" && order.previousDriverId
// //                   ? "bg-yellow-500/20 text-yellow-400"
// //                   : "bg-orange-500/20 text-orange-400"
// //               }
// //             `}
// //           >
// //             {order.status === "Pending" && order.previousDriverId ? "Rescheduled" : order.status}
// //           </span>
// //         </div>

// //         <h3 className="text-lg font-bold text-white mb-1">
// //           Order #{order.id}
// //         </h3>

// //         <p className="text-slate-400 text-sm">
// //           {order.receiverAddress}
// //         </p>

// //         <p className="text-xs text-slate-500 mt-2">
// //           Scheduled: {new Date(order.scheduledDate).toLocaleDateString()}
// //         </p>
// //       </div>

// //       {/* RIGHT ACTIONS */}
// //       <div className="flex gap-3 flex-wrap items-center">
// //         {order.status === "Assigned" && (
// //           <>
// //             <button
// //               onClick={(e) => {
// //                 e.stopPropagation();
// //                 rejectOrder(order.id);
// //               }}
// //               className="px-5 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10"
// //             >
// //               Reject
// //             </button>

// //             <button
// //               onClick={(e) => {
// //                 e.stopPropagation();
// //                 acceptOrder(order.id);
// //               }}
// //               className="px-5 py-2 rounded-lg bg-[#ff8a3d] text-black font-bold hover:bg-[#ff9a55]"
// //             >
// //               Accept
// //             </button>
// //           </>
// //         )}

// //         {(order.status === "OutForDelivery" ||
// //           order.status === "Out for delivery") && (
// //           <>
// //             {order.isASR ? (
// //               <button
// //                 onClick={(e) => {
// //                   e.stopPropagation();
// //                   setSelectedASROrderId(order.id);
// //                   setShowASRModal(true);
// //                 }}
// //                 className="px-5 py-2 rounded-lg border border-[#ff8a3d]/40 text-[#ff8a3d] hover:bg-[#ff8a3d]/10"
// //               >
// //                 Verify ASR
// //               </button>
// //             ) : (
// //               <button
// //                 onClick={(e) => {
// //                   e.stopPropagation();
// //                   markDelivered(order.id);
// //                 }}
// //                 className="px-5 py-2 rounded-lg border border-green-500/30 text-green-400 hover:bg-green-500/10"
// //               >
// //                 Delivered
// //               </button>
// //             )}

// //             <button
// //               onClick={(e) => {
// //                 e.stopPropagation();
// //                 markAttempted(order.id);
// //               }}
// //               className="px-5 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10"
// //             >
// //               Attempted
// //             </button>
// //           </>
// //         )}

// //         {(order.status === "Delivered" ||
// //           order.status === "Cancelled") && (
// //           <button className="px-5 py-2 rounded-lg border border-white/20 text-slate-400">
// //             View Details
// //           </button>
// //         )}
// //       </div>
// //     </div>
// //   );

// //     const getFilteredOrders = () => {
// //     // Decode driver ID from token (simple parse)
// //     const token = localStorage.getItem("token");
// //     let currentDriverId = 0;
// //     if (token) {
// //         try {
// //             const payload = JSON.parse(atob(token.split('.')[1]));
// //             currentDriverId = parseInt(payload.id || payload.nameid || 0);
// //         } catch (e) { console.error("Token parse error", e); }
// //     }

// //     switch (activeTab) {
// //       case "pending":
// //         // Active pending (must be assigned to ME)
// //         return orders.filter((o) => o.status === "Assigned" && o.driverId === currentDriverId);
// //       case "completed":
// //         // Past orders (Delivered, Cancelled) OR (status=Pending due to reschedule && I was previous)
// //         return orders.filter((o) => 
// //           ["Delivered", "Cancelled", "DeliveryAttempted"].includes(o.status) ||
// //           (o.status === "Pending" && o.previousDriverId === currentDriverId) ||
// //           (o.status === "Assigned" && o.driverId !== currentDriverId && o.previousDriverId === currentDriverId) // Re-assigned to someone else
// //         );
// //       case "today":
// //       default:
// //         // Active orders for TODAY (must be assigned to ME)
// //         return orders.filter((o) => !["Delivered", "Cancelled"].includes(o.status) && o.driverId === currentDriverId);
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen flex bg-gradient-to-br from-[#0b0f14] via-[#0f141c] to-[#0b0f14] text-slate-100">
// //       <DriverSidebar active="deliveries" />

// //       <div className="flex-1 overflow-y-auto">
// //         {/* HEADER */}
// //         <header className="sticky top-0 z-20 backdrop-blur-xl bg-[#0b0f14]/80 border-b border-white/10">
// //           <div className="max-w-6xl mx-auto px-6 py-4">
// //             <h1 className="text-2xl font-black">My Deliveries</h1>
// //             <p className="text-slate-400 text-sm">
// //               Manage your route and update statuses
// //             </p>
// //           </div>
// //         </header>

// //         <div className="max-w-6xl mx-auto p-6">
// //           {/* TABS */}
// //           <div className="flex p-1 bg-white/5 rounded-xl w-fit mb-8 border border-white/10">
// //             {[
// //               { id: "today", label: "Today" },
// //               { id: "pending", label: "Pending" },
// //               { id: "completed", label: "History" },
// //             ].map((tab) => (
// //               <button
// //                 key={tab.id}
// //                 onClick={() => setActiveTab(tab.id)}
// //                 className={`px-4 py-2 rounded-lg text-sm font-semibold transition
// //                   ${
// //                     activeTab === tab.id
// //                       ? "bg-white/10 text-white"
// //                       : "text-slate-400 hover:text-white"
// //                   }
// //                 `}
// //               >
// //                 {tab.label}
// //               </button>
// //             ))}
// //           </div>

// //           {loading ? (
// //             <p className="text-slate-400">Loading orders…</p>
// //           ) : getFilteredOrders().length === 0 ? (
// //             <p className="text-slate-500">No orders found for this tab.</p>
// //           ) : (
// //             getFilteredOrders().map(renderOrder)
// //           )}
// //         </div>
// //       </div>



// //       {showASRModal && (
// //         <DriverASRVerification
// //           orderId={selectedASROrderId}
// //           onClose={() => {
// //             setShowASRModal(false);
// //             fetchTodaysOrders();
// //           }}
// //         />
// //       )}
// //     </div>
// //   );
// // }

// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import DriverSidebar from "./DriverSidebar";
// import api from "../../services/api";
// import DriverASRVerification from "./DriverASRVerification";
// import { useAuth } from "../../context/AuthContext";

// export default function DriverDeliveries() {
//   const navigate = useNavigate();
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState("today");

//   // ASR modal
//   const [showASRModal, setShowASRModal] = useState(false);
//   const [selectedASROrderId, setSelectedASROrderId] = useState(null);

//   const openOrderDetails = (id) => {
//     navigate(`/driver/orders/${id}`);
//   };

//   const fetchTodaysOrders = async () => {
//     try {
//       setLoading(true);
//       const res = await api.get("/driver/orders/today/analytics");
//       const sorted = (res.data || []).sort((a, b) => b.id - a.id);
//       setOrders(sorted);
//     } catch (err) {
//       console.error("Failed to fetch orders", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTodaysOrders();
//   }, []);

//   const acceptOrder = async (id) => {
//     await api.post(`/driver/accept/${id}`);
//     fetchTodaysOrders();
//   };

//   const rejectOrder = async (id) => {
//     if (!window.confirm("Reject this assignment?")) return;
//     await api.post(`/driver/reject/${id}`);
//     fetchTodaysOrders();
//   };

//   const markDelivered = async (id) => {
//     if (!window.confirm("Confirm delivery?")) return;
//     await api.post(`/driver/mark-delivered/${id}`);
//     fetchTodaysOrders();
//   };

//   const markAttempted = async (id) => {
//     const reason = prompt("Reason for failed attempt:");
//     if (!reason) return;
//     await api.post(`/driver/mark-attempted/${id}`, { reason });
//     fetchTodaysOrders();
//   };

//   const getFilteredOrders = () => {
//     const driverId = user?.userId;

//     switch (activeTab) {
//       case "pending":
//         return orders.filter(
//           (o) => o.status === "Assigned" && o.driverId === driverId
//         );

//       case "completed":
//         return orders.filter(
//           (o) =>
//             ["Delivered", "Cancelled", "DeliveryAttempted"].includes(o.status) ||
//             (o.status === "Pending" && o.previousDriverId === driverId)
//         );

//       case "today":
//       default:
//         return orders.filter(
//           (o) =>
//             !["Delivered", "Cancelled"].includes(o.status) &&
//             o.driverId === driverId
//         );
//     }
//   };

//   const renderOrder = (order) => (
//     <div
//       key={order.id}
//       onClick={() => openOrderDetails(order.id)}
//       className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-4 hover:bg-white/10 transition cursor-pointer"
//     >
//       <div className="flex justify-between gap-4">
//         {/* LEFT */}
//         <div className="flex-1">
//           <div className="flex items-center gap-3 mb-2">
//             <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400">
//               {order.trackingId || `ORD-${order.id}`}
//             </span>

//           <span
//             className={`px-3 py-1 rounded-full text-xs font-bold uppercase
//               ${
//                 order.status === "Delivered"
//                   ? "bg-green-500/20 text-green-400"
//                   : order.status === "Cancelled" ||
//                     order.status === "DeliveryAttempted"
//                   ? "bg-red-500/20 text-red-400"
//                   : order.status === "Assigned"
//                   ? "bg-blue-500/20 text-blue-400"
//                   : order.status === "Pending" && order.previousDriverId
//                   ? "bg-yellow-500/20 text-yellow-400"
//                   : "bg-orange-500/20 text-orange-400"
//               }
//             `}
//           >
//             {order.status === "Pending" && order.previousDriverId ? "Rescheduled" : order.status}
//           </span>
//         </div>

//         {/* ACTIONS */}
//         <div className="flex gap-3 items-center flex-wrap">
//           {order.status === "Assigned" && (
//             <>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   rejectOrder(order.id);
//                 }}
//                 className="px-4 py-2 border border-red-500/30 text-red-400 rounded-lg"
//               >
//                 Reject
//               </button>

//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   acceptOrder(order.id);
//                 }}
//                 className="px-4 py-2 bg-orange-500 text-black font-bold rounded-lg"
//               >
//                 Accept
//               </button>
//             </>
//           )}

//           {order.status === "OutForDelivery" && (
//             <>
//               {order.isASR ? (
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setSelectedASROrderId(order.id);
//                     setShowASRModal(true);
//                   }}
//                   className="px-4 py-2 border border-orange-400 text-orange-400 rounded-lg"
//                 >
//                   Verify ASR
//                 </button>
//               ) : (
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     markDelivered(order.id);
//                   }}
//                   className="px-4 py-2 border border-green-500/30 text-green-400 rounded-lg"
//                 >
//                   Delivered
//                 </button>
//               )}

//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   markAttempted(order.id);
//                 }}
//                 className="px-4 py-2 border border-red-500/30 text-red-400 rounded-lg"
//               >
//                 Attempted
//               </button>
//             </>
//           )}

//           {(order.status === "Delivered" ||
//             order.status === "Cancelled") && (
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 openOrderDetails(order.id);
//               }}
//               className="px-4 py-2 border border-white/20 text-slate-400 rounded-lg"
//             >
//               View Details
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );

//     const getFilteredOrders = () => {
//     // Decode driver ID from token (simple parse)
//     const token = localStorage.getItem("token");
//     let currentDriverId = 0;
//     if (token) {
//         try {
//             const payload = JSON.parse(atob(token.split('.')[1]));
//             currentDriverId = parseInt(payload.id || payload.nameid || 0);
//         } catch (e) { console.error("Token parse error", e); }
//     }

//     switch (activeTab) {
//       case "pending":
//         // Active pending (must be assigned to ME)
//         return orders.filter((o) => o.status === "Assigned" && o.driverId === currentDriverId);
//       case "completed":
//         // Past orders (Delivered, Cancelled) OR (status=Pending due to reschedule && I was previous)
//         return orders.filter((o) => 
//           ["Delivered", "Cancelled", "DeliveryAttempted"].includes(o.status) ||
//           (o.status === "Pending" && o.previousDriverId === currentDriverId) ||
//           (o.status === "Assigned" && o.driverId !== currentDriverId && o.previousDriverId === currentDriverId) // Re-assigned to someone else
//         );
//       case "today":
//       default:
//         // Active orders for TODAY (must be assigned to ME)
//         return orders.filter((o) => !["Delivered", "Cancelled"].includes(o.status) && o.driverId === currentDriverId);
//     }
//   };

//   return (
//     <div className="min-h-screen flex bg-[#0b0f14] text-white">
//       <DriverSidebar active="deliveries" />

//       <div className="flex-1 p-6">
//         <h1 className="text-2xl font-bold mb-6">My Deliveries</h1>

//         {/* TABS */}
//         <div className="flex gap-3 mb-6">
//           {["today", "pending", "completed"].map((t) => (
//             <button
//               key={t}
//               onClick={() => setActiveTab(t)}
//               className={`px-4 py-2 rounded-lg ${
//                 activeTab === t ? "bg-white/10" : "text-slate-400"
//               }`}
//             >
//               {t.toUpperCase()}
//             </button>
//           ))}
//         </div>


//       {showASRModal && (
//         <DriverASRVerification
//           orderId={selectedASROrderId}
//           onClose={() => {
//             setShowASRModal(false);
//             fetchTodaysOrders();
//           }}
//         />
//       )}
//     </div>
//   );
// }


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DriverSidebar from "./DriverSidebar";
import api from "../../services/api";
import DriverASRVerification from "./DriverASRVerification";

export default function DriverDeliveries() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("today");

  const [showASRModal, setShowASRModal] = useState(false);
  const [selectedASROrderId, setSelectedASROrderId] = useState(null);

  const openOrderDetails = (id) => {
    navigate(`/driver/orders/${id}`);
  };

  const fetchTodaysOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/driver/orders/today/analytics");
      const sorted = (res.data || []).sort((a, b) => b.id - a.id);
      setOrders(sorted);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodaysOrders();
  }, []);

  const acceptOrder = async (id) => {
    await api.post(`/driver/accept/${id}`);
    fetchTodaysOrders();
  };

  const rejectOrder = async (id) => {
    if (!window.confirm("Reject this assignment?")) return;
    await api.post(`/driver/reject/${id}`);
    fetchTodaysOrders();
  };

  const markDelivered = async (id) => {
    if (!window.confirm("Confirm delivery?")) return;
    await api.post(`/driver/mark-delivered/${id}`);
    fetchTodaysOrders();
  };

  const markAttempted = async (id) => {
    const reason = prompt("Reason for failed attempt:");
    if (!reason) return;
    await api.post(`/driver/mark-attempted/${id}`, { reason });
    fetchTodaysOrders();
  };

  const renderOrder = (order) => (
    <div
      key={order.id}
      onClick={() => openOrderDetails(order.id)}
      className="
        bg-white/5 backdrop-blur-xl
        border border-white/10
        rounded-2xl p-6 mb-4
        hover:bg-white/10 transition
        flex flex-col md:flex-row gap-4
        justify-between
      "
    >
      {/* LEFT */}
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#ff8a3d]/20 text-[#ff8a3d]">
            {order.trackingId || `ORD-${order.id}`}
          </span>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase
              ${
                order.status === "Delivered"
                  ? "bg-green-500/20 text-green-400"
                  : order.status === "Cancelled" ||
                    order.status === "DeliveryAttempted"
                  ? "bg-red-500/20 text-red-400"
                  : order.status === "Assigned"
                  ? "bg-blue-500/20 text-blue-400"
                  : order.status === "Pending" && order.previousDriverId
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-orange-500/20 text-orange-400"
              }
            `}
          >
            {order.status === "Pending" && order.previousDriverId ? "Rescheduled" : order.status}
          </span>
        </div>

        <h3 className="text-lg font-bold text-white mb-1">
          Order #{order.id}
        </h3>

        <p className="text-slate-400 text-sm">
          {order.receiverAddress}
        </p>

        <p className="text-xs text-slate-500 mt-2">
          Scheduled: {new Date(order.scheduledDate).toLocaleDateString()}
        </p>
      </div>

      {/* RIGHT ACTIONS */}
      <div className="flex gap-3 flex-wrap items-center">
        {order.status === "Assigned" && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                rejectOrder(order.id);
              }}
              className="px-5 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              Reject
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                acceptOrder(order.id);
              }}
              className="px-5 py-2 rounded-lg bg-[#ff8a3d] text-black font-bold hover:bg-[#ff9a55]"
            >
              Accept
            </button>
          </>
        )}

        {(order.status === "OutForDelivery" ||
          order.status === "Out for delivery") && (
          <>
            {order.isASR ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedASROrderId(order.id);
                  setShowASRModal(true);
                }}
                className="px-5 py-2 rounded-lg border border-[#ff8a3d]/40 text-[#ff8a3d] hover:bg-[#ff8a3d]/10"
              >
                Verify ASR
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  markDelivered(order.id);
                }}
                className="px-5 py-2 rounded-lg border border-green-500/30 text-green-400 hover:bg-green-500/10"
              >
                Delivered
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                markAttempted(order.id);
              }}
              className="px-5 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              Attempted
            </button>
          </>
        )}

        {(order.status === "Delivered" ||
          order.status === "Cancelled") && (
          <button className="px-5 py-2 rounded-lg border border-white/20 text-slate-400">
            View Details
          </button>
        )}
      </div>
    </div>
  );

    const getFilteredOrders = () => {
    // Decode driver ID from token (simple parse)
    const token = localStorage.getItem("token");
    let currentDriverId = 0;
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            currentDriverId = parseInt(payload.id || payload.nameid || 0);
        } catch (e) { console.error("Token parse error", e); }
    }

    switch (activeTab) {
      case "pending":
        // Active pending (must be assigned to ME)
        return orders.filter((o) => o.status === "Assigned" && o.driverId === currentDriverId);
      case "completed":
        // Past orders (Delivered, Cancelled) OR (status=Pending due to reschedule && I was previous)
        return orders.filter((o) => 
          ["Delivered", "Cancelled", "DeliveryAttempted"].includes(o.status) ||
          (o.status === "Pending" && o.previousDriverId === currentDriverId) ||
          (o.status === "Assigned" && o.driverId !== currentDriverId && o.previousDriverId === currentDriverId) // Re-assigned to someone else
        );
      case "today":
      default:
        // Active orders for TODAY (must be assigned to ME)
        return orders.filter((o) => !["Delivered", "Cancelled"].includes(o.status) && o.driverId === currentDriverId);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#0b0f14] via-[#0f141c] to-[#0b0f14] text-slate-100">
      <DriverSidebar active="deliveries" />

      <div className="flex-1 overflow-y-auto">
        {/* HEADER */}
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-[#0b0f14]/80 border-b border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <h1 className="text-2xl font-black">My Deliveries</h1>
            <p className="text-slate-400 text-sm">
              Manage your route and update statuses
            </p>
          </div>
        </header>

        <div className="max-w-6xl mx-auto p-6">
          {/* TABS */}
          <div className="flex p-1 bg-white/5 rounded-xl w-fit mb-8 border border-white/10">
            {[
              { id: "today", label: "Today" },
              { id: "pending", label: "Pending" },
              { id: "completed", label: "History" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition
                  ${
                    activeTab === tab.id
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:text-white"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-slate-400">Loading orders…</p>
          ) : getFilteredOrders().length === 0 ? (
            <p className="text-slate-500">No orders found for this tab.</p>
          ) : (
            getFilteredOrders().map(renderOrder)
          )}
        </div>
      </div>



      {showASRModal && (
        <DriverASRVerification
          orderId={selectedASROrderId}
          onClose={() => {
            setShowASRModal(false);
            fetchTodaysOrders();
          }}
        />
      )}
    </div>
  );
}
