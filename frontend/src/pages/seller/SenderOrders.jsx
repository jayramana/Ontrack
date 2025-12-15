import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import SellerSidebar from "./SellerSidebar";

export default function SenderOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders/my-sent-orders");
        setOrders(response.data);
      } catch (error) {
        console.error("Failed to fetch orders", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const [filterId, setFilterId] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const filteredAndSortedOrders = orders
    .filter((order) => {
      const matchesId = order.id.toString().includes(filterId);
      const matchesStatus =
        filterStatus === "" || order.status === filterStatus;
      return matchesId && matchesStatus;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="min-h-screen flex bg-[#f8f4ef]">

      {/* SIDEBAR */}
      <SellerSidebar active="orders" />

      {/* MAIN AREA */}
      <div className="flex-1 px-10 py-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#351c15]">My Sent Orders</h1>
            <p className="text-[#6b4f3a]">View all orders you have placed</p>
          </div>

          <Link
            to="/seller/dashboard"
            className="text-[#ffb500] font-semibold hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <div className="flex flex-col">
            <label className="text-sm text-[#6b4f3a] mb-1 font-semibold">
              Filter by Order ID
            </label>
            <input
              type="text"
              placeholder="e.g. 123"
              value={filterId}
              onChange={(e) => setFilterId(e.target.value)}
              className="p-2 border border-[#e6d8c9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffb500]"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-[#6b4f3a] mb-1 font-semibold">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-2 border border-[#e6d8c9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffb500] bg-white"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Delivered">Delivered</option>
              {/* Add other statuses as needed based on backend */}
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <p className="text-[#6b4f3a]">Loading orders...</p>
        ) : filteredAndSortedOrders.length === 0 ? (
          <p className="text-gray-500">
            {orders.length === 0
              ? "You haven't placed any orders yet."
              : "No orders match your filters."}
          </p>
        ) : (
          <div className="bg-white rounded-xl shadow border border-[#e6d8c9] overflow-hidden">

            {/* Table */}
            <table className="min-w-full">
              <thead className="bg-[#fff8e6] border-b border-[#e6d8c9]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#351c15] uppercase">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#351c15] uppercase">
                    Receiver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#351c15] uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#351c15] uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#351c15] uppercase">
                    Price
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredAndSortedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-[#e6d8c9] hover:bg-[#fdf7ed] transition"
                  >
                    <td className="px-6 py-4 font-semibold text-[#351c15]">
                      #{order.id}
                    </td>

                    <td className="px-6 py-4 text-[#4e2a1f]">
                      {order.receiverName}
                      <div className="text-xs text-gray-500">
                        {order.receiverEmail}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full
                          ${
                            order.status === "Delivered"
                              ? "bg-green-100 text-green-700"
                              : order.status === "Approved"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        `}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-[#6b4f3a]">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 font-semibold text-[#351c15]">
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
