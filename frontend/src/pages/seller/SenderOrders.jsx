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
    .sort((a, b) => b.id - a.id); // Default Sort: Order ID Descending

  const getStatusColor = (status) => {
     return {
      PendingAssignment: "bg-yellow-100 text-yellow-800",
      AtOriginWarehouse: "bg-yellow-100 text-yellow-800",
      Assigned: "bg-blue-100 text-blue-800",
      InTransit: "bg-blue-50 text-blue-600",
      OutForDelivery: "bg-purple-100 text-purple-800",
      AtDestinationWarehouse: "bg-orange-100 text-orange-800",
      Delivered: "bg-green-100 text-green-800",
      DeliveryAttempted: "bg-red-100 text-red-800",
      Cancelled: "bg-red-100 text-red-800",
    }[status] || "bg-gray-200 text-gray-700";
  };

  return (
    <div className="min-h-screen flex bg-[#f8f4ef]">

      {/* SIDEBAR */}
      <SellerSidebar active="orders" />

      {/* MAIN AREA */}
      <div className="flex-1 px-10 py-8 overflow-y-auto max-h-screen">

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
              <option value="PendingAssignment">Pending Assignment</option>
              <option value="AtOriginWarehouse">At Origin Warehouse</option>
              <option value="Assigned">Assigned</option>
              <option value="InTransit">In Transit</option>
              <option value="OutForDelivery">Out For Delivery</option>
              <option value="AtDestinationWarehouse">At Destination Warehouse</option>
              <option value="Delivered">Delivered</option>
              <option value="DeliveryAttempted">Delivery Attempted</option>
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
          <div className="flex flex-col gap-4">
             {filteredAndSortedOrders.map((order) => (
                <div 
                    key={order.id} 
                    className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col md:flex-row gap-6 hover:shadow-lg transition-shadow"
                >
                    {/* LEFT: Main Info */}
                    <div className="flex-1">
                        <h3 className="text-lg font-medium text-blue-700 mb-2 cursor-pointer hover:underline">
                            {order.packageDescription || order.status === "PendingAssignment" ? "New Shipment Request" : `Shipment #${order.id}`}
                        </h3>
                        
                        {/* Status Badge (Mobile) */}
                        <div className="md:hidden mb-2">
                             <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getStatusColor(order.status)}`}>
                                {order.status.replace(/([A-Z])/g, ' $1').trim()}
                             </span>
                        </div>

                        {/* Details (No Bullets) */}
                        <div className="text-sm text-gray-600 space-y-1 mt-3">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500 w-20">Receiver:</span> 
                                <span className="font-semibold text-gray-800">{order.receiverName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500 w-20">Order ID:</span> 
                                <span className="font-mono text-gray-800">#{order.id}</span>
                            </div>
                             <div className="flex items-center gap-2">
                                <span className="text-gray-500 w-20">Placed On:</span> 
                                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Price & Status */}
                    <div className="w-full md:w-1/4 flex flex-col items-start md:pl-8 md:border-l border-gray-100">
                        <div className="text-3xl font-bold text-[#212121] mb-1">
                            ₹{order.price || '0'}
                        </div>
                        <div className="text-xs text-green-600 font-medium mb-3">
                            Free Delivery
                        </div>
                        
                        <div className="mb-4 hidden md:block">
                             <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide border ${getStatusColor(order.status)}`}>
                                {order.status.replace(/([A-Z])/g, ' $1').trim()}
                             </span>
                        </div>

                        {/* Action */}
                        <button className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline">
                            View Details
                        </button>
                    </div>
                </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}
