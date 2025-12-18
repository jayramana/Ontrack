import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import SellerSidebar from "./SellerSidebar";

export default function SenderOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterId, setFilterId] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

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
      Delivered: "bg-green-500/20 text-green-400",
      Cancelled: "bg-red-500/20 text-red-400",
      DeliveryAttempted: "bg-red-500/20 text-red-400",
      Assigned: "bg-blue-500/20 text-blue-400",
      InTransit: "bg-blue-500/20 text-blue-400",
      OutForDelivery: "bg-purple-500/20 text-purple-400",
      AtOriginWarehouse: "bg-yellow-500/20 text-yellow-400",
      AtDestinationWarehouse: "bg-yellow-500/20 text-yellow-400",
      PendingAssignment: "bg-orange-500/20 text-orange-400",
    };
    return map[status] || "bg-white/10 text-slate-300";
  };

  return (
    <div className="min-h-screen flex bg-[#0b0f14] text-slate-100">
      <SellerSidebar active="orders" />

      <div className="flex-1 px-10 py-8 overflow-y-auto max-h-screen space-y-8">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black tracking-tight">
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
        <div className="flex gap-6 flex-wrap">
          <div className="flex flex-col">
            <label className="text-sm text-slate-400 mb-1 font-semibold">
              Filter by Order ID
            </label>
            <input
              type="text"
              placeholder="e.g. 123"
              value={filterId}
              onChange={(e) => setFilterId(e.target.value)}
              className="
                px-4 py-2 rounded-xl
                bg-white/5 border border-white/10
                text-slate-100 placeholder-slate-500
                focus:outline-none focus:ring-2 focus:ring-[#ff8a3d]
              "
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-slate-400 mb-1 font-semibold">
              Filter by Status
            </label>
            <select
  value={filterStatus}
  onChange={(e) => setFilterStatus(e.target.value)}
  className="
    px-4 py-2 rounded-xl
    bg-white/5 border border-white/10
    text-slate-100
    focus:outline-none focus:ring-2 focus:ring-[#ff8a3d]
  "
>
  <option className="bg-[#0b0f14] text-slate-100" value="">
    All Statuses
  </option>

  <option className="bg-[#0b0f14] text-slate-100" value="PendingAssignment">
    Pending Assignment
  </option>
  <option className="bg-[#0b0f14] text-slate-100" value="AtOriginWarehouse">
    At Origin Warehouse
  </option>
  <option className="bg-[#0b0f14] text-slate-100" value="Assigned">
    Assigned
  </option>
  <option className="bg-[#0b0f14] text-slate-100" value="InTransit">
    In Transit
  </option>
  <option className="bg-[#0b0f14] text-slate-100" value="OutForDelivery">
    Out For Delivery
  </option>
  <option className="bg-[#0b0f14] text-slate-100" value="AtDestinationWarehouse">
    At Destination Warehouse
  </option>
  <option className="bg-[#0b0f14] text-slate-100" value="Delivered">
    Delivered
  </option>
  <option className="bg-[#0b0f14] text-slate-100" value="DeliveryAttempted">
    Delivery Attempted
  </option>
  <option className="bg-[#0b0f14] text-slate-100" value="Cancelled">
    Cancelled
  </option>
</select>

          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <p className="text-slate-400">Loading orders…</p>
        ) : filteredAndSortedOrders.length === 0 ? (
          <p className="text-slate-500">
            {orders.length === 0
              ? "You haven't placed any orders yet."
              : "No orders match your filters."}
          </p>
        ) : (
          <div className="
            bg-white/5 backdrop-blur-xl
            border border-white/10
            rounded-3xl overflow-hidden
          ">
            <table className="min-w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-400">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-400">
                    Receiver
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-400">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-400">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-400">
                    Price
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredAndSortedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-white/5 hover:bg-white/5 transition"
                  >
                    <td className="px-6 py-4 font-semibold">
                      #{order.id}
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-medium">{order.receiverName}</div>
                      <div className="text-xs text-slate-500">
                        {order.receiverEmail}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 font-bold text-[#ff8a3d]">
                      ₹{order.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
