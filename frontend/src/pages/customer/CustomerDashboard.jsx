import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api, { API_BASE_URL } from "../../services/api";
import * as signalR from "@microsoft/signalr";
import CustomerASRUpload from "./CustomerASRUpload";
import CustomerSidebar from "./CustomerSidebar";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const CustomerDashboard = () => {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingData, setTrackingData] = useState(null);

  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({
    newDate: "",
    reason: "",
  });

  const [loading, setLoading] = useState(true);
  const [useLiveDriverLoc, setUseLiveDriverLoc] = useState(false);

  // ASR
  const [showASRUploadModal, setShowASRUploadModal] = useState(false);
  const [selectedASROrderId, setSelectedASROrderId] = useState(null);

  const [connection, setConnection] = useState(null);


  useEffect(() => {
    fetchOrders();

    let conn;
    setupSignalR().then((c) => (conn = c));

    return () => {
      if (conn) conn.stop().catch(() => {});
    };
  }, []);


  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders/my-orders");
      setOrders(res.data);
    } catch (err) {
      console.error("Fetch orders failed", err);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     SIGNALR
  ========================= */
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
        if (trackingData?.order?.driverId !== payload?.driverId) return;

        setTrackingData((prev) => ({
          ...prev,
          driverLocation: {
            latitude: payload.latitude,
            longitude: payload.longitude,
            updatedAt: payload.updatedAt ?? new Date().toISOString(),
            speed: payload.speed ?? 0,
          },
        }));
      });

      conn.on("ASRVerificationRequested", (data) => {
        setSelectedASROrderId(data.orderId);
        setShowASRUploadModal(true);
      });

      conn.on("ASRVerificationCompleted", () => {
        fetchOrders();
      });

      await conn.start();

      if (user?.userId) {
        await conn.invoke("JoinCustomerGroup", Number(user.userId));
      }

      setConnection(conn);
      return conn;
    } catch (err) {
      console.error("SignalR error", err);
    }
  };

  /* =========================
     HELPERS
  ========================= */
  const getStatusColor = (status) =>
    ({
      PendingAssignment: "bg-yellow-100 text-yellow-800",
      AtOriginWarehouse: "bg-blue-100 text-blue-800",
      Assigned: "bg-indigo-100 text-indigo-800",
      InTransit: "bg-orange-100 text-orange-800",
      OutForDelivery: "bg-orange-200 text-orange-900",
      Delivered: "bg-green-100 text-green-800",
      DeliveryAttempted: "bg-red-100 text-red-800",
    }[status] || "bg-gray-100 text-gray-700");

  const getASRStatusBadge = (order) => {
    if (!order.isASR) return null;

    const colors = {
      NotStarted: "bg-gray-100 text-gray-800",
      Pending: "bg-yellow-100 text-yellow-800",
      InProgress: "bg-blue-100 text-blue-800",
      Success: "bg-green-100 text-green-800",
      Failed: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-bold ${
          colors[order.asrStatus] || "bg-gray-100 text-gray-800"
        }`}
      >
        🔒 ASR: {order.asrStatus || "Required"}
      </span>
    );
  };

  /* =========================
     ACTIONS
  ========================= */
  const trackOrder = async (orderId) => {
    try {
      const res = await api.get(`/customer/track/${orderId}`);
      setTrackingData(res.data);
      setSelectedOrder(orderId);
    } catch {
      alert("Unable to track order");
    }
  };

  const openRescheduleDialog = (orderId) => {
    setSelectedOrder(orderId);
    setShowRescheduleDialog(true);
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/orders/${selectedOrder}/reschedule`, rescheduleForm);
      setShowRescheduleDialog(false);
      fetchOrders();
    } catch {
      alert("Reschedule failed");
    }
  };

  /* =========================
     RENDER
  ========================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#f8fafc]">
      <CustomerSidebar active="dashboard" />

      <div className="flex-1 overflow-y-auto">
        {/* HEADER */}
        <header className="bg-white border-b p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black">Dashboard</h1>
            <p className="text-sm text-gray-500">
              Welcome back, {user?.first_name}
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={useLiveDriverLoc}
              onChange={(e) => setUseLiveDriverLoc(e.target.checked)}
            />
            Simulate Driver Location
          </label>
        </header>

        <main className="max-w-7xl mx-auto p-6 space-y-10">
          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard label="Total Orders" value={orders.length} />
            <StatCard
              label="In Transit"
              value={orders.filter((o) =>
                ["InTransit", "OutForDelivery"].includes(o.status)
              ).length}
            />
            <StatCard
              label="Delivered"
              value={orders.filter((o) => o.status === "Delivered").length}
            />
            <StatCard
              label="ASR Orders"
              value={orders.filter((o) => o.isASR).length}
              highlight
            />
          </div>

          {/* ORDERS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders.map((o) => (
              <div
                key={o.id}
                className={`bg-white p-6 rounded-xl shadow border ${
                  o.isASR ? "border-red-300" : ""
                }`}
              >
                <div className="flex justify-between mb-4">
                  <div>
                    <h3 className="font-bold flex items-center gap-2">
                      {o.isASR && "🔒"} Order #{o.id}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                        o.status
                      )}`}
                    >
                      {o.status}
                    </span>
                    {getASRStatusBadge(o)}
                  </div>
                </div>

                <div className="flex gap-3">
                  {o.isASR &&
                    ["Pending", "NotStarted"].includes(o.asrStatus) && (
                      <button
                        onClick={() => {
                          setSelectedASROrderId(o.id);
                          setShowASRUploadModal(true);
                        }}
                        className="flex-1 bg-red-600 text-white py-2 rounded"
                      >
                        Upload ID
                      </button>
                    )}

                  <button
                    onClick={() => trackOrder(o.id)}
                    className="flex-1 bg-black text-white py-2 rounded"
                  >
                    Track
                  </button>

                  {o.status !== "Delivered" && !o.isASR && (
                    <button
                      onClick={() => openRescheduleDialog(o.id)}
                      className="flex-1 bg-yellow-400 py-2 rounded"
                    >
                      Reschedule
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* CHARTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="font-bold mb-4">Order Status</h3>
              <div className="h-64">
                <Doughnut
                  data={{
                    labels: ["Delivered", "On Route", "Pending", "Issues"],
                    datasets: [
                      {
                        data: [
                          orders.filter((o) => o.status === "Delivered").length,
                          orders.filter((o) =>
                            ["InTransit", "OutForDelivery"].includes(o.status)
                          ).length,
                          orders.filter((o) =>
                            ["PendingAssignment", "Assigned"].includes(o.status)
                          ).length,
                          orders.filter((o) =>
                            ["Cancelled", "DeliveryAttempted"].includes(
                              o.status
                            )
                          ).length,
                        ],
                      },
                    ],
                  }}
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="font-bold mb-4">Daily Volume</h3>
              <div className="h-64">
                <Bar
                  data={{
                    labels: Array.from({ length: 7 }, (_, i) => {
                      const d = new Date();
                      d.setDate(d.getDate() - (6 - i));
                      return d.toLocaleDateString("en-US", {
                        weekday: "short",
                      });
                    }),
                    datasets: [
                      {
                        data: Array.from({ length: 7 }, (_, i) => {
                          const d = new Date();
                          d.setDate(d.getDate() - (6 - i));
                          const ds = d.toISOString().split("T")[0];
                          return orders.filter((o) =>
                            o.createdAt.startsWith(ds)
                          ).length;
                        }),
                      },
                    ],
                  }}
                />
              </div>
            </div>
          </div>
        </main>

        {/* TRACKING MODAL */}
        {trackingData && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-lg">
              <h3 className="font-bold mb-4">Live Tracking</h3>

              {trackingData.driverLocation ? (
                <>
                  <p>
                    Lat: {trackingData.driverLocation.latitude.toFixed(6)}
                  </p>
                  <p>
                    Lon: {trackingData.driverLocation.longitude.toFixed(6)}
                  </p>
                </>
              ) : (
                <p className="italic text-gray-400">
                  Location unavailable
                </p>
              )}

              <button
                onClick={() => setTrackingData(null)}
                className="mt-4 w-full bg-black text-white py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* RESCHEDULE MODAL */}
        {showRescheduleDialog && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <form
              onSubmit={handleReschedule}
              className="bg-white p-6 rounded-xl w-full max-w-md"
            >
              <h3 className="font-bold mb-4">Reschedule</h3>

              <input
                type="datetime-local"
                className="w-full mb-4 border p-2"
                value={rescheduleForm.newDate}
                onChange={(e) =>
                  setRescheduleForm({
                    ...rescheduleForm,
                    newDate: e.target.value,
                  })
                }
                required
              />

              <textarea
                className="w-full border p-2 mb-4"
                placeholder="Reason"
                value={rescheduleForm.reason}
                onChange={(e) =>
                  setRescheduleForm({
                    ...rescheduleForm,
                    reason: e.target.value,
                  })
                }
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowRescheduleDialog(false)}
                  className="flex-1 bg-gray-200 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ASR UPLOAD MODAL */}
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

const StatCard = ({ label, value, highlight }) => (
  <div
    className={`bg-white p-6 rounded-xl shadow border ${
      highlight ? "border-red-300" : ""
    }`}
  >
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-3xl font-black">{value}</p>
  </div>
);

export default CustomerDashboard;
