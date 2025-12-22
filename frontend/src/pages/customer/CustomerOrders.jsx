// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import CustomerSidebar from "./CustomerSidebar";
// import api, { API_BASE_URL } from "../../services/api";
// import * as signalR from "@microsoft/signalr";
// import { useAuth } from "../../context/AuthContext";
// import CustomerASRUpload from "./CustomerASRUpload";

// export default function CustomerOrders() {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [showASRUploadModal, setShowASRUploadModal] = useState(false);
//   const [selectedASROrderId, setSelectedASROrderId] = useState(null);

//   const { user } = useAuth();
//   const navigate = useNavigate();

//   /* ---------------- FETCH + SIGNALR (UNCHANGED) ---------------- */
//   useEffect(() => {
//     fetchOrders();

//     const connection = new signalR.HubConnectionBuilder()
//       .withUrl(API_BASE_URL.replace("/api", "/hubs/logistics"), {
//         accessTokenFactory: () => localStorage.getItem("token") || "",
//       })
//       .withAutomaticReconnect()
//       .build();

//     connection.start()
//       .then(() => {
//         if (user?.userId) {
//           connection.invoke("JoinCustomerGroup", Number(user.userId));
//         }
//       })
//       .catch((err) => console.error("SignalR Connection Error: ", err));

//     connection.on("ASRVerificationRequested", (data) => {
//       setSelectedASROrderId(data.orderId);
//       setShowASRUploadModal(true);
//     });

//     connection.on("ASRVerificationCompleted", () => {
//       fetchOrders();
//     });

//     return () => connection.stop();
//   }, [user]);

//   const fetchOrders = async () => {
//     try {
//       const response = await api.get("/orders/my-orders");
//       const sortedOrders = (response.data || []).sort((a, b) => b.id - a.id);
//       setOrders(sortedOrders);
//     } catch (error) {
//       console.error("Error fetching orders:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ---------------- STATUS UI HELPERS ---------------- */
//   const getStatusBadge = (status) => {
//     const styles = {
//       PendingAssignment: "bg-slate-500/20 text-slate-300",
//       AtOriginWarehouse: "bg-blue-500/20 text-blue-300",
//       Assigned: "bg-yellow-500/20 text-yellow-300",
//       InTransit: "bg-orange-500/20 text-orange-300",
//       OutForDelivery: "bg-purple-500/20 text-purple-300",
//       AtDestinationWarehouse: "bg-indigo-500/20 text-indigo-300",
//       Delivered: "bg-green-500/20 text-green-300",
//       DeliveryAttempted: "bg-red-500/20 text-red-300",
//     };

//     return (
//       <span
//         className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
//           styles[status] || "bg-slate-500/20 text-slate-300"
//         }`}
//       >
//         {status}
//       </span>
//     );
//   };

//   const getASRStatusBadge = (order) => {
//     if (!order.isASR) return null;

//     const colors = {
//       NotStarted: "bg-slate-500/20 text-slate-300",
//       Pending: "bg-yellow-500/20 text-yellow-300",
//       InProgress: "bg-blue-500/20 text-blue-300",
//       Success: "bg-green-500/20 text-green-300",
//       Failed: "bg-red-500/20 text-red-300",
//     };

//     return (
//       <span
//         className={`px-2 py-1 rounded-full text-xs font-bold ${
//           colors[order.asrStatus] || "bg-slate-500/20 text-slate-300"
//         }`}
//       >
//         🔒 ASR: {order.asrStatus || "Required"}
//       </span>
//     );
//   };

//   /* ---------------- ORDER CARD ---------------- */
//   const renderOrderCard = (o) => (
//     <div
//       key={o.id}
//       onClick={() => navigate(`/customer/orders/${o.id}`)}
//       className="
//         bg-white/5 backdrop-blur-xl border border-white/10
//         rounded-3xl p-6 mb-6
//         hover:bg-white/10 transition
//         cursor-pointer
//       "
//     >
//       <div className="flex flex-col lg:flex-row justify-between gap-6">

//         {/* LEFT */}
//         <div className="flex-1">
//           <div className="flex flex-wrap items-center gap-3 mb-4">
//             <span className="px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-bold">
//               {o.trackingId || `ORD-${o.id}`}
//             </span>
//             {getStatusBadge(o.status)}
//             {getASRStatusBadge(o)}
//           </div>

//           <h3 className="text-lg font-bold text-white mb-1">
//             Order #{o.id}
//           </h3>

//           <p className="text-slate-400 text-sm mb-2">
//             {o.receiverAddress}
//           </p>

//           <p className="text-xs text-slate-500">
//             Booked on {new Date(o.createdAt).toLocaleDateString()}
//           </p>

//           {/* ROUTE */}
//           <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
//             <span>{o.originWarehouse?.name || "Origin"}</span>
//             <span>→</span>
//             <span className="text-[#ff8a3d] font-bold">
//               {o.currentWarehouse?.name || "In Transit"}
//             </span>
//             <span>→</span>
//             <span>{o.destinationWarehouse?.name || "Destination"}</span>
//           </div>
//         </div>

//         {/* RIGHT */}
//         <div className="flex flex-col items-end gap-3">
//           <p className="text-2xl font-black text-white">
//             ₹{o.price || 0}
//           </p>

//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               navigate(`/customer/orders/${o.id}`);
//             }}
//             className="
//               px-6 py-2 rounded-xl
//               bg-white/10 border border-white/20
//               text-white font-bold text-sm
//               hover:bg-white/20 transition
//               w-full lg:w-auto
//             "
//           >
//             View Details
//           </button>

//           {o.isASR && ["Pending", "NotStarted"].includes(o.asrStatus) && (
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setSelectedASROrderId(o.id);
//                 setShowASRUploadModal(true);
//               }}
//               className="
//                 px-6 py-2 rounded-xl
//                 bg-red-500/20 border border-red-500/30
//                 text-red-300 font-bold text-sm
//                 hover:bg-red-500/30 transition
//                 w-full lg:w-auto
//               "
//             >
//               Upload ID
//             </button>
//           )}
//         </div>

//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen flex bg-[#0b0f14] text-slate-100">
//       <CustomerSidebar active="orders" />

//       <main className="flex-1 px-10 py-10 overflow-y-auto">

//         <div className="mb-10">
//           <h1 className="text-3xl font-black text-white">My Orders</h1>
//           <p className="text-slate-400 mt-1">
//             Track and manage your shipments
//           </p>
//         </div>

//         {loading ? (
//           <div className="text-center py-20 text-slate-400">
//             Loading orders…
//           </div>
//         ) : orders.length === 0 ? (
//           <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
//             <p className="text-slate-400">No orders found</p>
//             <button className="mt-6 px-6 py-2 rounded-xl bg-[#ff8a3d] text-black font-bold">
//               Place New Order
//             </button>
//           </div>
//         ) : (
//           <div>{orders.map(renderOrderCard)}</div>
//         )}

//         {showASRUploadModal && (
//           <CustomerASRUpload
//             orderId={selectedASROrderId}
//             onClose={() => {
//               setShowASRUploadModal(false);
//               fetchOrders();
//             }}
//           />
//         )}

//       </main>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomerSidebar from "./CustomerSidebar";
import api, { API_BASE_URL } from "../../services/api";
import * as signalR from "@microsoft/signalr";
import { useAuth } from "../../context/AuthContext";
import CustomerASRUpload from "./CustomerASRUpload";

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showASRUploadModal, setShowASRUploadModal] = useState(false);
  const [selectedASROrderId, setSelectedASROrderId] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  /* ---------------- FETCH + SIGNALR (UNCHANGED) ---------------- */
  useEffect(() => {
    fetchOrders();

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(API_BASE_URL.replace("/api", "/hubs/logistics"), {
        accessTokenFactory: () => localStorage.getItem("token") || "",
      })
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => {
        if (user?.userId) {
          connection.invoke("JoinCustomerGroup", Number(user.userId));
        }
      })
      .catch((err) => console.error("SignalR Connection Error: ", err));

    connection.on("ASRVerificationRequested", (data) => {
      setSelectedASROrderId(data.orderId);
      setShowASRUploadModal(true);
    });

    connection.on("ASRVerificationCompleted", () => {
      fetchOrders();
    });

    return () => connection.stop();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders/my-orders");
      const sortedOrders = (response.data || []).sort((a, b) => b.id - a.id);
      setOrders(sortedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- STATUS UI HELPERS ---------------- */
  const getStatusBadge = (status) => {
    const styles = {
      PendingAssignment: "bg-slate-500/20 text-slate-300",
      AtOriginWarehouse: "bg-blue-500/20 text-blue-300",
      Assigned: "bg-yellow-500/20 text-yellow-300",
      InTransit: "bg-orange-500/20 text-orange-300",
      OutForDelivery: "bg-purple-500/20 text-purple-300",
      AtDestinationWarehouse: "bg-indigo-500/20 text-indigo-300",
      Delivered: "bg-green-500/20 text-green-300",
      DeliveryAttempted: "bg-red-500/20 text-red-300",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
          styles[status] || "bg-slate-500/20 text-slate-300"
        }`}
      >
        {status}
      </span>
    );
  };

  const getASRStatusBadge = (order) => {
    if (!order.isASR) return null;

    const colors = {
      NotStarted: "bg-slate-500/20 text-slate-300",
      Pending: "bg-yellow-500/20 text-yellow-300",
      InProgress: "bg-blue-500/20 text-blue-300",
      Success: "bg-green-500/20 text-green-300",
      Failed: "bg-red-500/20 text-red-300",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-bold ${
          colors[order.asrStatus] || "bg-slate-500/20 text-slate-300"
        }`}
      >
        🔒 ASR: {order.asrStatus || "Required"}
      </span>
    );
  };

  /* ---------------- ORDER CARD ---------------- */
  const renderOrderCard = (o) => (
    <div
      key={o.id}
      onClick={() => navigate(`/customer/orders/${o.id}`)}
      className="
        bg-white/5 backdrop-blur-xl border border-white/10
        rounded-3xl p-6 mb-6
        hover:bg-white/10 transition
        cursor-pointer
      "
    >
      <div className="flex flex-col lg:flex-row justify-between gap-6">

        {/* LEFT */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-bold">
              {o.trackingId || `ORD-${o.id}`}
            </span>

          </div>

          <h3 className="text-lg font-bold text-white mb-1">
            Order #{o.id}
          </h3>

          <p className="text-slate-400 text-sm mb-2">
            {o.receiverAddress}
          </p>

          <p className="text-xs text-slate-500">
            Booked on {new Date(o.createdAt).toLocaleDateString()}
          </p>


        </div>

        {/* RIGHT */}
        <div className="flex flex-col items-end gap-3">
          <p className="text-2xl font-black text-white">
            ₹{o.price || 0}
          </p>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/customer/orders/${o.id}`);
            }}
            className="
              px-6 py-2 rounded-xl
              bg-white/10 border border-white/20
              text-white font-bold text-sm
              hover:bg-white/20 transition
              w-full lg:w-auto
            "
          >
            View Details
          </button>

          {o.isASR && ["Pending", "NotStarted"].includes(o.asrStatus) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedASROrderId(o.id);
                setShowASRUploadModal(true);
              }}
              className="
                px-6 py-2 rounded-xl
                bg-red-500/20 border border-red-500/30
                text-red-300 font-bold text-sm
                hover:bg-red-500/30 transition
                w-full lg:w-auto
              "
            >
              Upload ID
            </button>
          )}
        </div>

      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#0b0f14] text-slate-100">
      <CustomerSidebar active="orders" />

      <main className="flex-1 px-10 py-10 overflow-y-auto">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl font-black text-white">My Orders</h1>
          <p className="text-slate-400 mt-1">
            Track and manage your shipments
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400">
            Loading orders…
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
            <p className="text-slate-400">No orders found</p>
            <button className="mt-6 px-6 py-2 rounded-xl bg-[#ff8a3d] text-black font-bold">
              Place New Order
            </button>
          </div>
        ) : (
          <div>{orders.map(renderOrderCard)}</div>
        )}

        {showASRUploadModal && (
          <CustomerASRUpload
            orderId={selectedASROrderId}
            onClose={() => {
              setShowASRUploadModal(false);
              fetchOrders();
            }}
          />
        )}

      </main>
    </div>
  );
}
