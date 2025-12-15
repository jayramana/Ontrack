// import { useState, useEffect } from "react";
// import { useAuth } from "../../context/AuthContext";
// import CustomerSidebar from "./CustomerSidebar";
// import api, { API_BASE_URL } from "../../services/api";
// import * as signalR from "@microsoft/signalr";

// const CustomerDashboard = () => {
//   const { user, logout } = useAuth();
//   const [orders, setOrders] = useState([]);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [trackingData, setTrackingData] = useState(null);
//   const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
//   const [rescheduleForm, setRescheduleForm] = useState({
//     newDate: "",
//     reason: "",
//   });
//   const [loading, setLoading] = useState(true);
//   const [useLiveDriverLoc, setUseLiveDriverLoc] = useState(false);

//   const [connection, setConnection] = useState(null);

//   useEffect(() => {
//     fetchOrders();
//     setupSignalR();
//     return () => {
//       if (connection) connection.stop().catch(() => {});
//     };
//   }, []);

//   const fetchOrders = async () => {
//     try {
//       const response = await api.get("/orders/my-orders");
//       setOrders(response.data);
//     } catch (error) {
//       console.error("Error fetching orders:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const setupSignalR = async () => {
//     try {
//       const hubUrl = API_BASE_URL.replace("/api", "/hubs/logistics");
//       const conn = new signalR.HubConnectionBuilder()
//         .withUrl(hubUrl)
//         .withAutomaticReconnect()
//         .build();

//       conn.on("ReceiveDriverLocation", (payload) => {
//         const driverId = payload?.driverId;
//         const lat = payload?.latitude;
//         const lng = payload?.longitude;

//         if (trackingData?.order?.driverId === driverId) {
//           setTrackingData((prev) => ({
//             ...prev,
//             driverLocation: {
//               latitude: lat,
//               longitude: lng,
//               updatedAt: payload?.updatedAt ?? new Date().toISOString(),
//               speed: payload?.speed ?? 0,
//             },
//           }));
//         }
//       });

//       await conn.start();
//       setConnection(conn);
//     } catch (err) {
//       console.error("SignalR Error:", err);
//     }
//   };

//   const getStatusColor = (status) => {
//     return {
//       PendingAssignment: "bg-[#f7e8d0] text-[#351c15]",
//       AtOriginWarehouse: "bg-[#fff8e7] text-[#351c15]",
//       Assigned: "bg-[#f9b400]/30 text-[#351c15]",
//       InTransit: "bg-[#f9b400]/20 text-[#351c15]",
//       OutForDelivery: "bg-[#f9b400]/20 text-[#351c15]",
//       AtDestinationWarehouse: "bg-[#fff8e7] text-[#351c15]",
//       Delivered: "bg-green-100 text-green-800",
//       DeliveryAttempted: "bg-red-100 text-red-800",
//     }[status] || "bg-gray-200 text-gray-700";
//   };

//   const trackOrder = async (orderId) => {
//     try {
//       const response = await api.get(`/customer/track/${orderId}`);
//       setTrackingData(response.data);
//       setSelectedOrder(orderId);
//     } catch {
//       alert("Unable to track this order.");
//     }
//   };

//   const openRescheduleDialog = (orderId) => {
//     setSelectedOrder(orderId);
//     setShowRescheduleDialog(true);
//   };

//   const handleReschedule = async (e) => {
//     e.preventDefault();
//     try {
//       await api.post(`/orders/${selectedOrder}/reschedule`, {
//         newDate: rescheduleForm.newDate,
//         reason: rescheduleForm.reason,
//       });

//       alert("Delivery rescheduled!");
//       setShowRescheduleDialog(false);
//       setRescheduleForm({ newDate: "", reason: "" });
//       fetchOrders();
//     } catch {
//       alert("Error updating schedule");
//     }
//   };

//   if (loading)
//     return (
//       <div className="min-h-screen flex justify-center items-center text-[#351c15]">
//         Loading Orders…
//       </div>
//     );

//   return (
//     <div className="min-h-screen flex bg-[#f7f3ef]">
//       <CustomerSidebar active="dashboard" />

//       <div className="flex-1">

//         {/* HEADER */}
//         <header className="bg-[#fff8e7] border-b border-[#e6ddc5] shadow-sm">
//           <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
//             <div>
//               <h1 className="text-3xl font-bold text-[#351c15]">My Orders</h1>
//               <p className="text-[#6f4e37] text-sm mt-1">
//                 Welcome, {user?.first_name} {user?.last_name}
//               </p>
//             </div>

//             <button
//               onClick={logout}
//               className="px-4 py-2 bg-[#351c15] hover:bg-[#2b160f] text-white rounded-lg shadow"
//             >
//               Logout
//             </button>
//           </div>
//         </header>

//         {/* MAIN */}
//         <div className="max-w-7xl mx-auto px-6 py-10">

//           {/* STATS */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
//             {[
//               ["Total Orders", orders.length],
//               [
//                 "In Transit",
//                 orders.filter((o) =>
//                   ["InTransit", "OutForDelivery"].includes(o.status)
//                 ).length,
//               ],
//               ["Delivered", orders.filter((o) => o.status === "Delivered").length],
//             ].map(([label, count], i) => (
//               <div
//                 key={i}
//                 className="bg-[#fff8e7] border border-[#e6ddc5] rounded-xl p-6 shadow"
//               >
//                 <p className="text-[#6f4e37] text-sm">{label}</p>
//                 <p className="text-3xl font-bold text-[#351c15]">{count}</p>
//               </div>
//             ))}
//           </div>

//           {/* ORDERS LIST */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {orders.map((o) => (
//               <div
//                 key={o.id}
//                 className="bg-[#fff8e7] border border-[#e6ddc5] rounded-xl shadow p-6"
//               >
//                 {/* Header */}
//                 <div className="flex justify-between mb-4">
//                   <div>
//                     <h3 className="text-lg font-bold text-[#351c15]">
//                       Order #{o.id}
//                     </h3>
//                     <p className="text-sm text-[#6f4e37]">
//                       {new Date(o.createdAt).toLocaleDateString()}
//                     </p>
//                   </div>

//                   <span
//                     className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center justify-center ${getStatusColor(
//                       o.status
//                     )}`}
//                   >
//                     {o.status}
//                   </span>
//                 </div>

//                 {/* Sender / Receiver */}
//                 <div className="grid grid-cols-2 gap-6 mb-4">
//                   <div>
//                     <p className="text-xs text-[#6f4e37]">Sender</p>
//                     <p className="font-medium text-[#351c15]">
//                       {o.senderName}
//                     </p>
//                     <p className="text-sm">{o.pickupAddress}</p>
//                   </div>

//                   <div>
//                     <p className="text-xs text-[#6f4e37]">Receiver</p>
//                     <p className="font-medium text-[#351c15]">
//                       {o.receiverName}
//                     </p>
//                     <p className="text-sm">{o.receiverAddress}</p>
//                   </div>
//                 </div>

//                 {/* Warehouse Tracking */}
//                 <div className="bg-white rounded-xl p-4 border border-[#e6ddc5] mb-4">
//                   <p className="text-xs font-semibold text-[#351c15] mb-2">
//                     📦 Warehouse Tracking
//                   </p>

//                   <div className="grid grid-cols-3 text-center text-sm">
//                     {[o.originWarehouse, o.currentWarehouse, o.destinationWarehouse].map(
//                       (w, i) => (
//                         <div key={i}>
//                           <p className="text-xs text-[#6f4e37]">
//                             {["Origin", "Current", "Destination"][i]}
//                           </p>
//                           <p className="font-bold text-[#351c15]">
//                             {w?.name || "—"}
//                           </p>
//                           <p className="text-xs text-[#6f4e37]">{w?.city}</p>
//                         </div>
//                       )
//                     )}
//                   </div>
//                 </div>

//                 {/* Buttons */}
//                 <div className="flex gap-3">
//                   <button
//                     onClick={() => trackOrder(o.id)}
//                     className="flex-1 bg-[#351c15] hover:bg-[#2b160f] text-white py-2 rounded-lg shadow"
//                   >
//                     📍 Track
//                   </button>

//                   {o.status !== "Delivered" && (
//                     <button
//                       onClick={() => openRescheduleDialog(o.id)}
//                       className="flex-1 bg-[#f9b400] hover:bg-[#e0a200] text-[#351c15] py-2 rounded-lg shadow"
//                     >
//                       📅 Reschedule
//                     </button>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Tracking Modal */}
//         {trackingData && (
//           <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
//             <div className="bg-[#fff8e7] rounded-xl p-6 max-w-2xl w-full shadow-xl border border-[#e6ddc5]">
//               <div className="flex justify-between mb-4">
//                 <h3 className="text-xl font-bold text-[#351c15]">
//                   Tracking #{selectedOrder}
//                 </h3>

//                 <button
//                   onClick={() => {
//                     setTrackingData(null);
//                     setSelectedOrder(null);
//                   }}
//                   className="text-[#6f4e37] hover:text-[#351c15]"
//                 >
//                   ✕
//                 </button>
//               </div>

//               <p className="font-semibold text-[#351c15] mb-2">
//                 Status: {trackingData.order.status}
//               </p>

//               {trackingData.driverLocation && (
//                 <div className="bg-[#f7e8d0] p-4 rounded-xl">
//                   <p className="font-medium text-[#351c15]">Driver Location</p>
//                   <p className="text-sm text-[#6f4e37] mt-1">
//                     Lat: {trackingData.driverLocation.latitude.toFixed(4)}  
//                     <br />
//                     Lng: {trackingData.driverLocation.longitude.toFixed(4)}
//                   </p>
//                 </div>
//               )}

//               <button
//                 onClick={() =>
//                   window.open(
//                     `https://www.openstreetmap.org/?mlat=${
//                       trackingData.driverLocation?.latitude
//                     }&mlon=${trackingData.driverLocation?.longitude}`,
//                     "_blank"
//                   )
//                 }
//                 className="w-full bg-[#351c15] hover:bg-[#2b160f] text-white py-2 rounded-lg mt-4 shadow"
//               >
//                 View on Map
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Reschedule Modal */}
//         {showRescheduleDialog && (
//           <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
//             <div className="bg-[#fff8e7] rounded-xl p-6 max-w-md w-full shadow-xl border border-[#e6ddc5]">
//               <h3 className="text-xl font-bold text-[#351c15] mb-4">
//                 Reschedule Delivery
//               </h3>

//               <form onSubmit={handleReschedule} className="space-y-4">
//                 <div>
//                   <label className="text-sm text-[#6f4e37]">New Delivery Date</label>
//                   <input
//                     type="datetime-local"
//                     className="w-full p-3 border border-[#e6ddc5] rounded-xl mt-1"
//                     value={rescheduleForm.newDate}
//                     onChange={(e) =>
//                       setRescheduleForm({ ...rescheduleForm, newDate: e.target.value })
//                     }
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="text-sm text-[#6f4e37]">Reason (Optional)</label>
//                   <textarea
//                     rows="3"
//                     className="w-full p-3 border border-[#e6ddc5] rounded-xl mt-1"
//                     value={rescheduleForm.reason}
//                     onChange={(e) =>
//                       setRescheduleForm({ ...rescheduleForm, reason: e.target.value })
//                     }
//                   ></textarea>
//                 </div>

//                 <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
//                   <p className="text-xs text-yellow-800">
//                     ⚠️ Rescheduling may delay the delivery.
//                   </p>
//                 </div>

//                 <div className="flex gap-3">
//                   <button
//                     type="button"
//                     onClick={() => setShowRescheduleDialog(false)}
//                     className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-2 rounded-xl"
//                   >
//                     Cancel
//                   </button>

//                   <button
//                     type="submit"
//                     className="flex-1 bg-[#351c15] hover:bg-[#2b160f] text-white py-2 rounded-xl"
//                   >
//                     Confirm
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}

//       </div>
//     </div>
//   );
// };

// export default CustomerDashboard;


import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import CustomerSidebar from "./CustomerSidebar";
import api, { API_BASE_URL } from "../../services/api";
import * as signalR from "@microsoft/signalr";
import CustomerASRUpload from "./CustomerASRUpload";

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({
    newDate: "",
    reason: "",
  });
  const [loading, setLoading] = useState(true);

  // 🆕 ASR States
  const [showASRUploadModal, setShowASRUploadModal] = useState(false);
  const [selectedASROrderId, setSelectedASROrderId] = useState(null);

  const [connection, setConnection] = useState(null);

  useEffect(() => {
    fetchOrders();
    setupSignalR();
    return () => {
      if (connection) connection.stop().catch(() => {});
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders/my-orders");
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const setupSignalR = async () => {
    try {
      const hubUrl = API_BASE_URL.replace("/api", "/hubs/logistics");
      const conn = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => localStorage.getItem("token") || "",
        })
        .withAutomaticReconnect()
        .build();

      conn.on("ReceiveDriverLocation", (payload) => {
        const driverId = payload?.driverId;
        const lat = payload?.latitude;
        const lng = payload?.longitude;

        if (trackingData?.order?.driverId === driverId) {
          setTrackingData((prev) => ({
            ...prev,
            driverLocation: {
              latitude: lat,
              longitude: lng,
              updatedAt: payload?.updatedAt ?? new Date().toISOString(),
              speed: payload?.speed ?? 0,
            },
          }));
        }
      });

      // 🆕 ASR SignalR Events
      conn.on("ASRVerificationRequested", (data) => {
        setSelectedASROrderId(data.orderId);
        setShowASRUploadModal(true);
        alert(`🔒 ASR Verification Required for Order #${data.orderId}. Please upload your ID documents.`);
      });

      conn.on("ASRVerificationCompleted", (data) => {
        if (data.status === "Success") {
          alert(`✅ ASR Verification Successful for Order #${data.orderId}!`);
        } else {
          alert(`❌ ASR Verification Failed for Order #${data.orderId}. Please retry.`);
        }
        fetchOrders();
      });

      await conn.start();
      
      // Join customer group
      if (user?.userId) {
        await conn.invoke("JoinCustomerGroup", Number(user.userId));
      }

      setConnection(conn);
    } catch (err) {
      console.error("SignalR Error:", err);
    }
  };

  const getStatusColor = (status) => {
    return {
      PendingAssignment: "bg-[#f7e8d0] text-[#351c15]",
      AtOriginWarehouse: "bg-[#fff8e7] text-[#351c15]",
      Assigned: "bg-[#f9b400]/30 text-[#351c15]",
      InTransit: "bg-[#f9b400]/20 text-[#351c15]",
      OutForDelivery: "bg-[#f9b400]/20 text-[#351c15]",
      AtDestinationWarehouse: "bg-[#fff8e7] text-[#351c15]",
      Delivered: "bg-green-100 text-green-800",
      DeliveryAttempted: "bg-red-100 text-red-800",
    }[status] || "bg-gray-200 text-gray-700";
  };

  // 🆕 ASR Status Badge
  const getASRStatusBadge = (order) => {
    if (!order.isASR) return null;

    const statusColors = {
      "NotStarted": "bg-gray-100 text-gray-800",
      "Pending": "bg-yellow-100 text-yellow-800",
      "InProgress": "bg-blue-100 text-blue-800",
      "Success": "bg-green-100 text-green-800",
      "Failed": "bg-red-100 text-red-800",
      "AdminOverride": "bg-purple-100 text-purple-800"
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColors[order.asrStatus] || "bg-gray-100 text-gray-800"}`}>
        🔒 ASR: {order.asrStatus || "Required"}
      </span>
    );
  };

  const trackOrder = async (orderId) => {
    try {
      const response = await api.get(`/customer/track/${orderId}`);
      setTrackingData(response.data);
      setSelectedOrder(orderId);
    } catch {
      alert("Unable to track this order.");
    }
  };

  const openRescheduleDialog = (orderId) => {
    setSelectedOrder(orderId);
    setShowRescheduleDialog(true);
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/orders/${selectedOrder}/reschedule`, {
        newDate: rescheduleForm.newDate,
        reason: rescheduleForm.reason,
      });

      alert("Delivery rescheduled!");
      setShowRescheduleDialog(false);
      setRescheduleForm({ newDate: "", reason: "" });
      fetchOrders();
    } catch {
      alert("Error updating schedule");
    }
  };

  // 🆕 Open ASR Upload Modal
  const openASRUpload = (orderId) => {
    setSelectedASROrderId(orderId);
    setShowASRUploadModal(true);
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center text-[#351c15]">
        Loading Orders…
      </div>
    );

  return (
    <div className="min-h-screen flex bg-[#f7f3ef]">
      <CustomerSidebar active="dashboard" />

      <div className="flex-1">

        {/* HEADER */}
        <header className="bg-[#fff8e7] border-b border-[#e6ddc5] shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-[#351c15]">My Orders</h1>
              <p className="text-[#6f4e37] text-sm mt-1">
                Welcome, {user?.first_name} {user?.last_name}
              </p>
            </div>

            <button
              onClick={logout}
              className="px-4 py-2 bg-[#351c15] hover:bg-[#2b160f] text-white rounded-lg shadow"
            >
              Logout
            </button>
          </div>
        </header>

        {/* MAIN */}
        <div className="max-w-7xl mx-auto px-6 py-10">

          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            {[
              ["Total Orders", orders.length],
              [
                "In Transit",
                orders.filter((o) =>
                  ["InTransit", "OutForDelivery"].includes(o.status)
                ).length,
              ],
              ["Delivered", orders.filter((o) => o.status === "Delivered").length],
              ["🔒 ASR Orders", orders.filter((o) => o.isASR).length],
            ].map(([label, count], i) => (
              <div
                key={i}
                className={`bg-[#fff8e7] border rounded-xl p-6 shadow ${
                  label.includes("ASR") ? "border-red-300 border-2" : "border-[#e6ddc5]"
                }`}
              >
                <p className="text-[#6f4e37] text-sm">{label}</p>
                <p className={`text-3xl font-bold ${label.includes("ASR") ? "text-red-600" : "text-[#351c15]"}`}>
                  {count}
                </p>
              </div>
            ))}
          </div>

          {/* ORDERS LIST */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders.map((o) => (
              <div
                key={o.id}
                className={`bg-[#fff8e7] border rounded-xl shadow p-6 ${
                  o.isASR ? "border-red-300 border-2" : "border-[#e6ddc5]"
                }`}
              >
                {/* Header */}
                <div className="flex justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#351c15] flex items-center gap-2">
                      {o.isASR && <span className="text-red-600">🔒</span>}
                      Order #{o.id}
                    </h3>
                    <p className="text-sm text-[#6f4e37]">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 items-end">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center justify-center ${getStatusColor(
                        o.status
                      )}`}
                    >
                      {o.status}
                    </span>
                    {getASRStatusBadge(o)}
                  </div>
                </div>

                {/* 🆕 ASR Alert */}
                {o.isASR && (o.asrStatus === "Pending" || o.asrStatus === "NotStarted") && (
                  <div className="mb-4 bg-red-50 border border-red-200 p-3 rounded-lg">
                    <p className="text-xs text-red-800 font-semibold">
                      ⚠️ ASR Verification Required - You may be asked to upload ID
                    </p>
                  </div>
                )}

                {/* Sender / Receiver */}
                <div className="grid grid-cols-2 gap-6 mb-4">
                  <div>
                    <p className="text-xs text-[#6f4e37]">Sender</p>
                    <p className="font-medium text-[#351c15]">
                      {o.senderName}
                    </p>
                    <p className="text-sm">{o.pickupAddress}</p>
                  </div>

                  <div>
                    <p className="text-xs text-[#6f4e37]">Receiver</p>
                    <p className="font-medium text-[#351c15]">
                      {o.receiverName}
                    </p>
                    <p className="text-sm">{o.receiverAddress}</p>
                  </div>
                </div>

                {/* Warehouse Tracking */}
                <div className="bg-white rounded-xl p-4 border border-[#e6ddc5] mb-4">
                  <p className="text-xs font-semibold text-[#351c15] mb-2">
                    📦 Warehouse Tracking
                  </p>

                  <div className="grid grid-cols-3 text-center text-sm">
                    {[o.originWarehouse, o.currentWarehouse, o.destinationWarehouse].map(
                      (w, i) => (
                        <div key={i}>
                          <p className="text-xs text-[#6f4e37]">
                            {["Origin", "Current", "Destination"][i]}
                          </p>
                          <p className="font-bold text-[#351c15]">
                            {w?.name || "—"}
                          </p>
                          <p className="text-xs text-[#6f4e37]">{w?.city}</p>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  {/* 🆕 ASR Upload Button */}
                  {o.isASR && (o.asrStatus === "Pending" || o.asrStatus === "NotStarted") && (
                    <button
                      onClick={() => openASRUpload(o.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg shadow font-semibold"
                    >
                      🔒 Upload ID
                    </button>
                  )}

                  <button
                    onClick={() => trackOrder(o.id)}
                    className="flex-1 bg-[#351c15] hover:bg-[#2b160f] text-white py-2 rounded-lg shadow"
                  >
                    📍 Track
                  </button>

                  {o.status !== "Delivered" && !o.isASR && (
                    <button
                      onClick={() => openRescheduleDialog(o.id)}
                      className="flex-1 bg-[#f9b400] hover:bg-[#e0a200] text-[#351c15] py-2 rounded-lg shadow"
                    >
                      📅 Reschedule
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tracking Modal */}
        {trackingData && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-[#fff8e7] rounded-xl p-6 max-w-2xl w-full shadow-xl border border-[#e6ddc5]">
              <div className="flex justify-between mb-4">
                <h3 className="text-xl font-bold text-[#351c15]">
                  Tracking #{selectedOrder}
                </h3>

                <button
                  onClick={() => {
                    setTrackingData(null);
                    setSelectedOrder(null);
                  }}
                  className="text-[#6f4e37] hover:text-[#351c15]"
                >
                  ✕
                </button>
              </div>

              <p className="font-semibold text-[#351c15] mb-2">
                Status: {trackingData.order.status}
              </p>

              {trackingData.driverLocation && (
                <div className="bg-[#f7e8d0] p-4 rounded-xl">
                  <p className="font-medium text-[#351c15]">Driver Location</p>
                  <p className="text-sm text-[#6f4e37] mt-1">
                    Lat: {trackingData.driverLocation.latitude.toFixed(4)}  
                    <br />
                    Lng: {trackingData.driverLocation.longitude.toFixed(4)}
                  </p>
                </div>
              )}

              <button
                onClick={() =>
                  window.open(
                    `https://www.openstreetmap.org/?mlat=${
                      trackingData.driverLocation?.latitude
                    }&mlon=${trackingData.driverLocation?.longitude}`,
                    "_blank"
                  )
                }
                className="w-full bg-[#351c15] hover:bg-[#2b160f] text-white py-2 rounded-lg mt-4 shadow"
              >
                View on Map
              </button>
            </div>
          </div>
        )}

        {/* Reschedule Modal */}
        {showRescheduleDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-[#fff8e7] rounded-xl p-6 max-w-md w-full shadow-xl border border-[#e6ddc5]">
              <h3 className="text-xl font-bold text-[#351c15] mb-4">
                Reschedule Delivery
              </h3>

              <form onSubmit={handleReschedule} className="space-y-4">
                <div>
                  <label className="text-sm text-[#6f4e37]">New Delivery Date</label>
                  <input
                    type="datetime-local"
                    className="w-full p-3 border border-[#e6ddc5] rounded-xl mt-1"
                    value={rescheduleForm.newDate}
                    onChange={(e) =>
                      setRescheduleForm({ ...rescheduleForm, newDate: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-[#6f4e37]">Reason (Optional)</label>
                  <textarea
                    rows="3"
                    className="w-full p-3 border border-[#e6ddc5] rounded-xl mt-1"
                    value={rescheduleForm.reason}
                    onChange={(e) =>
                      setRescheduleForm({ ...rescheduleForm, reason: e.target.value })
                    }
                  ></textarea>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    ⚠️ Rescheduling may delay the delivery.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRescheduleDialog(false)}
                    className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-2 rounded-xl"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex-1 bg-[#351c15] hover:bg-[#2b160f] text-white py-2 rounded-xl"
                  >
                    Confirm
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 🆕 ASR Upload Modal */}
        {showASRUploadModal && (
          <CustomerASRUpload
            orderId={selectedASROrderId}
            onClose={() => {
              setShowASRUploadModal(false);
              fetchOrders();
            }}
          />
        )}

      </div>
    </div>
  );
};

export default CustomerDashboard;