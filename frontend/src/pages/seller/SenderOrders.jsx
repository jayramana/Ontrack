// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import api from "../../services/api";
// import SellerSidebar from "./SellerSidebar";

// export default function SenderOrders() {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [filterId, setFilterId] = useState("");
//   const [filterStatus, setFilterStatus] = useState("");

//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         const res = await api.get("/orders/my-sent-orders");
//         setOrders(res.data || []);
//       } catch (err) {
//         console.error("Failed to fetch orders", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchOrders();
//   }, []);

//   const filteredAndSortedOrders = orders
//     .filter((o) => {
//       const matchesId = o.id.toString().includes(filterId);
//       const matchesStatus = filterStatus === "" || o.status === filterStatus;
//       return matchesId && matchesStatus;
//     })
//     .sort((a, b) => b.id - a.id);

//   const getStatusBadge = (status) => {
//     const map = {
//       Delivered: "bg-green-500/20 text-green-400",
//       Cancelled: "bg-red-500/20 text-red-400",
//       DeliveryAttempted: "bg-red-500/20 text-red-400",
//       Assigned: "bg-blue-500/20 text-blue-400",
//       InTransit: "bg-blue-500/20 text-blue-400",
//       OutForDelivery: "bg-purple-500/20 text-purple-400",
//       AtOriginWarehouse: "bg-yellow-500/20 text-yellow-400",
//       AtDestinationWarehouse: "bg-yellow-500/20 text-yellow-400",
//       PendingAssignment: "bg-orange-500/20 text-orange-400",
//     };
//     return map[status] || "bg-white/10 text-slate-300";
//   };

//   return (
//     <div className="min-h-screen flex bg-[#0b0f14] text-slate-100">
//       <SellerSidebar active="orders" />

//       <div className="flex-1 px-10 py-8 overflow-y-auto max-h-screen space-y-8">

//         {/* HEADER */}
//         <div className="flex justify-between items-center">
//           <div>
//             <h1 className="text-3xl font-black tracking-tight">
//               My Sent Orders
//             </h1>
//             <p className="text-slate-400 mt-1">
//               View and track all shipments you’ve created
//             </p>
//           </div>

//           <Link
//             to="/seller/dashboard"
//             className="text-[#ff8a3d] font-semibold hover:underline"
//           >
//             ← Back to Dashboard
//           </Link>
//         </div>

//         {/* FILTERS */}
//         <div className="flex gap-6 flex-wrap">
//           <div className="flex flex-col">
//             <label className="text-sm text-slate-400 mb-1 font-semibold">
//               Filter by Order ID
//             </label>
//             <input
//               type="text"
//               placeholder="e.g. 123"
//               value={filterId}
//               onChange={(e) => setFilterId(e.target.value)}
//               className="
//                 px-4 py-2 rounded-xl
//                 bg-white/5 border border-white/10
//                 text-slate-100 placeholder-slate-500
//                 focus:outline-none focus:ring-2 focus:ring-[#ff8a3d]
//               "
//             />
//           </div>

//           <div className="flex flex-col">
//             <label className="text-sm text-slate-400 mb-1 font-semibold">
//               Filter by Status
//             </label>
//             <select
//   value={filterStatus}
//   onChange={(e) => setFilterStatus(e.target.value)}
//   className="
//     px-4 py-2 rounded-xl
//     bg-white/5 border border-white/10
//     text-slate-100
//     focus:outline-none focus:ring-2 focus:ring-[#ff8a3d]
//   "
// >
//   <option className="bg-[#0b0f14] text-slate-100" value="">
//     All Statuses
//   </option>

//   <option className="bg-[#0b0f14] text-slate-100" value="PendingAssignment">
//     Pending Assignment
//   </option>
//   <option className="bg-[#0b0f14] text-slate-100" value="AtOriginWarehouse">
//     At Origin Warehouse
//   </option>
//   <option className="bg-[#0b0f14] text-slate-100" value="Assigned">
//     Assigned
//   </option>
//   <option className="bg-[#0b0f14] text-slate-100" value="InTransit">
//     In Transit
//   </option>
//   <option className="bg-[#0b0f14] text-slate-100" value="OutForDelivery">
//     Out For Delivery
//   </option>
//   <option className="bg-[#0b0f14] text-slate-100" value="AtDestinationWarehouse">
//     At Destination Warehouse
//   </option>
//   <option className="bg-[#0b0f14] text-slate-100" value="Delivered">
//     Delivered
//   </option>
//   <option className="bg-[#0b0f14] text-slate-100" value="DeliveryAttempted">
//     Delivery Attempted
//   </option>
//   <option className="bg-[#0b0f14] text-slate-100" value="Cancelled">
//     Cancelled
//   </option>
// </select>

//           </div>
//         </div>

//         {/* CONTENT */}
//         {loading ? (
//           <p className="text-slate-400">Loading orders…</p>
//         ) : filteredAndSortedOrders.length === 0 ? (
//           <p className="text-slate-500">
//             {orders.length === 0
//               ? "You haven't placed any orders yet."
//               : "No orders match your filters."}
//           </p>
//         ) : (
//           <div className="
//             bg-white/5 backdrop-blur-xl
//             border border-white/10
//             rounded-3xl overflow-hidden
//           ">
//             <table className="min-w-full">
//               <thead className="bg-white/5 border-b border-white/10">
//                 <tr>
//                   <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-400">
//                     Order ID
//                   </th>
//                   <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-400">
//                     Receiver
//                   </th>
//                   <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-400">
//                     Status
//                   </th>
//                   <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-400">
//                     Date
//                   </th>
//                   <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-400">
//                     Price
//                   </th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {filteredAndSortedOrders.map((order) => (
//                   <tr
//                     key={order.id}
//                     className="border-b border-white/5 hover:bg-white/5 transition"
//                   >
//                     <td className="px-6 py-4 font-semibold">
//                       #{order.id}
//                     </td>

//                     <td className="px-6 py-4">
//                       <div className="font-medium">{order.receiverName}</div>
//                       <div className="text-xs text-slate-500">
//                         {order.receiverEmail}
//                       </div>
//                     </td>

//                     <td className="px-6 py-4">
//                       <span
//                         className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusBadge(
//                           order.status
//                         )}`}
//                       >
//                         {order.status}
//                       </span>
//                     </td>

//                     <td className="px-6 py-4 text-slate-400">
//                       {new Date(order.createdAt).toLocaleDateString()}
//                     </td>

//                     <td className="px-6 py-4 font-bold text-[#ff8a3d]">
//                       ₹{order.price}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import SellerSidebar from "./SellerSidebar";

export default function SenderOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterId, setFilterId] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders/my-sent-orders");
        setOrders(res.data || []);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredAndSortedOrders = orders
    .filter((o) => {
      const matchesId = o.id.toString().includes(filterId);
      const matchesStatus = filterStatus === "" || o.status === filterStatus;
      return matchesId && matchesStatus;
    })
    .sort((a, b) => b.id - a.id);

  const getStatusBadge = (status) => {
    const map = {
      Delivered: "bg-green-500/20 text-green-300",
      Cancelled: "bg-red-500/20 text-red-300",
      DeliveryAttempted: "bg-red-500/20 text-red-300",
      Assigned: "bg-blue-500/20 text-blue-300",
      InTransit: "bg-blue-500/20 text-blue-300",
      OutForDelivery: "bg-purple-500/20 text-purple-300",
      AtOriginWarehouse: "bg-yellow-500/20 text-yellow-300",
      AtDestinationWarehouse: "bg-yellow-500/20 text-yellow-300",
      PendingAssignment: "bg-orange-500/20 text-orange-300",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
          map[status] || "bg-white/10 text-slate-300"
        }`}
      >
        {status}
      </span>
    );
  };

  const renderOrderCard = (order) => (
    <div
      key={order.id}
     
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
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-bold">
              #{order.id}
            </span>
            {getStatusBadge(order.status)}
          </div>

          <h3 className="text-lg font-bold text-white mb-1">
            {order.receiverName}
          </h3>

          <p className="text-slate-400 text-sm mb-2">
            {order.receiverEmail}
          </p>

          <p className="text-xs text-slate-500">
            Created on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col items-end gap-4">
          <p className="text-2xl font-black text-white">
            ₹{order.price}
          </p>


        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#0b0f14] text-slate-100">
      <SellerSidebar active="orders" />

      <main className="flex-1 px-10 py-10 overflow-y-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-white">
              My Sent Orders
            </h1>
            <p className="text-slate-400 mt-1">
              View and track all shipments you’ve created
            </p>
          </div>

          <Link
            to="/seller/dashboard"
            className="text-[#ff8a3d] font-semibold hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap gap-6 mb-8">
          <div>
            <label className="block text-xs uppercase tracking-widest text-slate-400 mb-1">
              Filter by Order ID
            </label>
            <input
              type="text"
              placeholder="e.g. 123"
              value={filterId}
              onChange={(e) => setFilterId(e.target.value)}
              className="
                px-4 py-3 rounded-xl
                bg-white/5 border border-white/10
                text-white placeholder-slate-500
                focus:outline-none focus:ring-2 focus:ring-[#ff8a3d]
              "
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-slate-400 mb-1">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="
                px-4 py-3 rounded-xl
                bg-white/5 border border-white/10
                text-white
                focus:outline-none focus:ring-2 focus:ring-[#ff8a3d]
              "
            >
              <option value="" className="text-black">All Statuses</option>
              <option value="PendingAssignment" className="text-black">Pending Assignment</option>
              <option value="AtOriginWarehouse" className="text-black">At Origin Warehouse</option>
              <option value="Assigned" className="text-black">Assigned</option>
              <option value="InTransit" className="text-black">In Transit</option>
              <option value="OutForDelivery" className="text-black">Out For Delivery</option>
              <option value="AtDestinationWarehouse" className="text-black">At Destination Warehouse</option>
              <option value="Delivered" className="text-black">Delivered</option>
              <option value="DeliveryAttempted" className="text-black">Delivery Attempted</option>
              <option value="Cancelled" className="text-black">Cancelled</option>
            </select>
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="text-center py-20 text-slate-400">
            Loading orders…
          </div>
        ) : filteredAndSortedOrders.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
            <p className="text-slate-400">
              {orders.length === 0
                ? "You haven't placed any orders yet."
                : "No orders match your filters."}
            </p>
          </div>
        ) : (
          <div>{filteredAndSortedOrders.map(renderOrderCard)}</div>
        )}
      </main>
    </div>
  );
}
