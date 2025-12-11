import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import CustomerSidebar from "./CustomerSidebar";
import api from "../../services/api";

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

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get(`/customer/orders`);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const trackOrder = async (id) => {
    try {
      const res = await api.get(`/customer/track/${id}`);
      setTrackingData(res.data);
      setSelectedOrder(id);
    } catch {
      alert("Unable to track order");
    }
  };

  const openRescheduleDialog = (id) => {
    setSelectedOrder(id);
    setShowRescheduleDialog(true);
  };

  const handleReschedule = async (e) => {
    e.preventDefault();

    try {
      await api.post(`/customer/reschedule/${selectedOrder}`, {
        newDate: new Date(rescheduleForm.newDate).toISOString(),
        reason: rescheduleForm.reason,
      });

      alert("Delivery rescheduled!");
      setShowRescheduleDialog(false);
      setRescheduleForm({ newDate: "", reason: "" });
      fetchOrders();
    } catch {
      alert("Unable to reschedule");
    }
  };

  const getStatusColor = (s) => {
    const base = "px-3 py-1 text-sm rounded-full font-semibold";
    const map = {
      PendingAssignment: "bg-gray-300 text-[#351c15]",
      AtOriginWarehouse: "bg-[#f7e8d0] text-[#3b241c]",
      Assigned: "bg-[#f6d8a8] text-[#3b241c]",
      InTransit: "bg-[#f9b400]/20 text-[#3b241c]",
      AtDestinationWarehouse: "bg-[#f7e8d0] text-[#3b241c]",
      OutForDelivery: "bg-[#f6d8a8] text-[#3b241c]",
      Delivered: "bg-green-100 text-green-800",
      DeliveryAttempted: "bg-red-100 text-red-800",
    };
    return `${base} ${map[s] || "bg-gray-400 text-white"}`;
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        Loading…
      </div>
    );

  return (
    <div className="min-h-screen flex bg-[#f7f3ef]">
      <CustomerSidebar active="dashboard" />

      <div className="flex-1">

        {/* HEADER */}
        <header className="bg-[#f7f3ef] shadow-sm border-b border-[#e8dfd6]">
          <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">

            <div>
              <h1 className="text-3xl font-bold text-[#351c15]">My Orders</h1>
              <p className="text-[#6f4e37] text-sm mt-1">
                Welcome, {user?.first_name} {user?.last_name}!
              </p>
            </div>

            <button
              onClick={logout}
              className="px-4 py-2 bg-[#351c15] hover:bg-[#4a2a21] text-white rounded-lg shadow"
            >
              Logout
            </button>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <div className="max-w-7xl mx-auto px-6 py-10">

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              ["Total Orders", orders.length],
              [
                "In Transit",
                orders.filter(
                  (o) => o.status === "InTransit" || o.status === "OutForDelivery"
                ).length,
              ],
              [
                "Delivered",
                orders.filter((o) => o.status === "Delivered").length,
              ],
            ].map(([label, count], i) => (
              <div
                key={i}
                className="bg-[#fff8e7] border border-[#e6ddc5] rounded-xl p-6 shadow"
              >
                <p className="text-[#6f4e37] text-sm">{label}</p>
                <p className="text-3xl font-bold text-[#351c15]">{count}</p>
              </div>
            ))}
          </div>

          {/* Orders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders.length === 0 && (
              <div className="bg-white rounded-xl p-8 text-center shadow">
                <p className="text-[#6f4e37]">No orders found</p>
              </div>
            )}

            {orders.map((o) => (
              <div
                key={o.id}
                className="bg-[#fff8e7] border border-[#e6ddc5] shadow p-6 rounded-xl"
              >
                {/* Top */}
                <div className="flex justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#351c15]">
                      Order #{o.id}
                    </h3>
                    <p className="text-sm text-[#6f4e37]">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <span className={getStatusColor(o.status)}>{o.status}</span>
                </div>

                {/* Sender / Receiver */}
                <div className="grid grid-cols-2 gap-6 mb-4">
                  <div>
                    <p className="text-xs text-[#6f4e37]">Sender</p>
                    <p className="font-medium text-[#351c15]">{o.senderName}</p>
                    <p className="text-sm">{o.pickupAddress}</p>
                  </div>

                  <div>
                    <p className="text-xs text-[#6f4e37]">Receiver</p>
                    <p className="font-medium text-[#351c15]">{o.receiverName}</p>
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
                          <p className="text-xs text-[#6f4e37]">
                            {w?.city || ""}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Estimated Delivery */}
                {o.estimatedDeliveryDate && (
                  <p className="text-sm font-medium text-[#351c15] mb-4">
                    Estimated:{" "}
                    {new Date(o.estimatedDeliveryDate).toLocaleDateString()}
                  </p>
                )}

                {/* Driver */}
                {o.driver && (
                  <div className="bg-[#f7e8d0] rounded-lg p-3 mb-4">
                    <p className="text-xs font-semibold text-[#351c15]">
                      🚚 Driver: {o.driver.name}
                    </p>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => trackOrder(o.id)}
                    className="flex-1 bg-[#351c15] hover:bg-[#4a2a21] text-white py-2 rounded-lg shadow"
                  >
                    📍 Track
                  </button>

                  {o.status !== "Delivered" && (
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
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-lg">
              <div className="flex justify-between mb-4">
                <h3 className="text-xl font-bold text-[#351c15]">
                  Tracking #{selectedOrder}
                </h3>

                <button
                  onClick={() => setTrackingData(null)}
                  className="text-gray-600 hover:text-black"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-[#6f4e37]">Status</p>
                  <p className="text-lg font-semibold text-[#351c15]">
                    {trackingData.order.status}
                  </p>
                </div>

                {trackingData.driverLocation && (
                  <div className="bg-[#fff8e7] p-4 rounded-xl border border-[#e6ddc5]">
                    <p className="font-semibold text-[#351c15] mb-1">Driver Location</p>

                    <p className="text-sm">
                      Last updated:{" "}
                      {new Date(
                        trackingData.driverLocation.updatedAt
                      ).toLocaleString()}
                    </p>

                    <p className="text-xs text-[#6f4e37]">
                      Lat: {trackingData.driverLocation.latitude.toFixed(4)}
                      {" • "}
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
                  className="w-full bg-[#351c15] hover:bg-[#4a2a21] text-white py-2 rounded-lg shadow"
                >
                  View on Map
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reschedule Modal */}
        {showRescheduleDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
              <h3 className="text-xl font-bold text-[#351c15] mb-4">
                Reschedule Delivery
              </h3>

              <form onSubmit={handleReschedule} className="space-y-4">
                <div>
                  <label className="text-sm text-[#6f4e37]">New Delivery Date</label>
                  <input
                    type="datetime-local"
                    className="w-full p-3 border rounded-xl mt-1"
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
                    className="w-full p-3 border rounded-xl mt-1"
                    value={rescheduleForm.reason}
                    onChange={(e) =>
                      setRescheduleForm({ ...rescheduleForm, reason: e.target.value })
                    }
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    ⚠️ Rescheduling reduces delivery priority.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRescheduleDialog(false)}
                    className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-2 rounded-lg"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex-1 bg-[#351c15] hover:bg-[#4a2a21] text-white py-2 rounded-lg"
                  >
                    Confirm
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CustomerDashboard;
