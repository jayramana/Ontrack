import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api, { API_BASE_URL } from "../../services/api";
import * as signalR from "@microsoft/signalr";
import { formatStatus } from "@/lib/utils";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { GoPackage } from "react-icons/go";
import {
  BsTruckFlatbed,
  BsCheckCircleFill,
  BsExclamationTriangleFill,
} from "react-icons/bs";
import { Doughnut } from "react-chartjs-2";
import CustomerSidebar from "./CustomerSidebar";
import { OrdersBarChart } from "../../components/charts/OrdersBarChart";
import { OrdersPieChart } from "../../components/charts/OrdersPieChart";
import { OrdersSpendingChart } from "../../components/charts/OrdersSpendingChart";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({
    newDate: "",
    reason: "",
  });
  const [loading, setLoading] = useState(true);
  const [currDriverLoc, setcurrDriverLoc] = useState({ lat: null, lon: null });
  const [useLiveDriverLoc, setUseLiveDriverLoc] = useState(false);
  const [dateFilter, setDateFilter] = useState("1W");

  const [connection, setConnection] = useState(null);

  useEffect(() => {
    fetchOrders();
    setupSignalR();
    return () => {
      if (connection) connection.stop().catch(() => { });
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
        .withUrl(hubUrl)
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

      await conn.start();
      setConnection(conn);
    } catch (err) {
      console.error("SignalR Error:", err);
    }
  };

  const getStatusColor = (status) => {
    return (
      {
        PendingAssignment: "bg-[#f7e8d0] text-[#351c15]",
        AtOriginWarehouse: "bg-[#fff8e7] text-[#351c15]",
        Assigned: "bg-[#f9b400]/30 text-[#351c15]",
        InTransit: "bg-[#f9b400]/20 text-[#351c15]",
        OutForDelivery: "bg-[#f9b400]/20 text-[#351c15]",
        AtDestinationWarehouse: "bg-[#fff8e7] text-[#351c15]",
        Delivered: "bg-green-100 text-green-800",
        DeliveryAttempted: "bg-red-100 text-red-800",
      }[status] || "bg-gray-200 text-gray-700"
    );
  };
  const calculateEta = async (orderId) => {
    try {
      // Fetch order (contains delivery + driver info)
      const res = await api.get(`/orders/my-orders/${orderId}`);
      // The API now returns { order: {...}, latestDriverLocation: {...} }
      // We handle both old format (just order) and new format for safety, though backend is updated.
      const data = res.data;
      const order = data.order || data;
      const latestDriverLocation = data.latestDriverLocation;



      let driverLat;
      let driverLon;

      if (useLiveDriverLoc) {
        const getDriverLocation = () =>
          new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
              reject(new Error("Geolocation not supported"));
              return;
            }
            navigator.geolocation.getCurrentPosition(
              (pos) =>
                resolve({
                  lat: pos.coords.latitude,
                  lon: pos.coords.longitude,
                }),
              reject
            );
          });

        const liveLoc = await getDriverLocation();
        driverLat = liveLoc.lat;
        driverLon = liveLoc.lon;
      }

      // CASE 2: Smart Selection (Profile vs History)
      else {
        const driverProfile = order.driver;
        const driverHistory = latestDriverLocation;

        const now = new Date();
        const staleThreshold = 5 * 60 * 1000; // 5 minutes

        let isProfileFresh = false;
        if (driverProfile?.updatedAt) {
          const profileTime = new Date(driverProfile.updatedAt).getTime();
          if (now.getTime() - profileTime < staleThreshold) {
            isProfileFresh = true;
          }
        }

        // Logic: Use Profile if FRESH, otherwise fallback to HISTORY
        if (
          isProfileFresh &&
          driverProfile.currentLatitude &&
          driverProfile.currentLongitude
        ) {

          driverLat = driverProfile.currentLatitude;
          driverLon = driverProfile.currentLongitude;
        } else if (
          driverHistory &&
          driverHistory.latitude &&
          driverHistory.longitude
        ) {

          driverLat = driverHistory.latitude;
          driverLon = driverHistory.longitude;
        } else if (
          driverProfile?.currentLatitude &&
          driverProfile?.currentLongitude
        ) {
          // Last resort: Profile is stale but History is empty? Use stale profile.
          console.warn("ETA: Both sources poor. Defaulting to stale Profile.");
          driverLat = driverProfile.currentLatitude;
          driverLon = driverProfile.currentLongitude;
        } else {
          throw new Error("Driver has not reported any location updates yet.");
        }
      }

      // Call ETA API
      const etaRes = await api.post("/loc/calculate-eta", {
        driverLat,
        driverLon,
        customerLat: order.deliveryLatitude,
        customerLon: order.deliveryLongitude,
        speedKmph: 40,
      });

      const etaVal = etaRes.data.eta;
      const displayEta = typeof etaVal === 'object' ? etaVal.average : etaVal;
      alert(`ETA: ${displayEta}\nDistance: ${etaRes.data.distance_km} km`);
    } catch (error) {
      console.error("ETA error:", error);
      alert(error.message || "Failed to calculate ETA");
    }
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

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center text-[#351c15]">
        Loading Orders…
      </div>
    );

  return (
    <div className="min-h-screen flex bg-[#0b0f14] font-sans text-white">
      <CustomerSidebar active="dashboard" />

      <div className="flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300">
        {/* HEADER */}
        {/* SCROLLABLE CONTENT */}
        <main
          className="flex-1 overflow-y-auto"
          onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 10)}
        >
          {/* HEADER */}
          <header
            className={`sticky top-0 z-40 transition-all duration-300
              ${isScrolled
                ? "bg-[#0b0f14]/60 backdrop-blur-xl"
                : "bg-transparent"
              }
            `}
          >
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="md:pl-0 pl-12"> {/* Added padding for mobile menu button */}
                <h1 className="text-2xl font-extrabold">Dashboard</h1>
                <p className="text-sm text-[#64748b]">
                  Welcome back, {user?.first_name}
                </p>
              </div>
            </div>
          </header>
          <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8">
            {/* 1. METRICS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* TOTAL */}
              <div className="p-6 bg-linear-to-br from-[#1a1f29] to-[#0f141c] rounded-2xl shadow-sm  flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex gap-3 items-center">
                    <GoPackage className="text-2xl text-orange-400" />
                    <p className="text-xl font-bold text-white">
                      Total Orders
                    </p>
                  </div>
                  <h3 className="text-2xl font-black text-white mt-4">
                    {orders.length}
                  </h3>
                </div>
              </div>

              {/* IN TRANSIT */}
              {/* IN TRANSIT */}
              <div className="p-6 bg-linear-to-br from-[#1a1f29] to-[#0f141c] rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
                <div>
                  <div className="flex gap-3 items-center">
                    <BsTruckFlatbed className="text-2xl text-orange-400" />
                    <p className="text-xl font-bold text-white">
                      Active Shipments
                    </p>
                  </div>
                  <h3 className="text-3xl font-black text-white mt-4">
                    {
                      orders.filter((o) =>
                        ["InTransit", "OutForDelivery"].includes(o.status)
                      ).length
                    }
                  </h3>
                </div>
              </div>

              {/* DELIVERED */}
              <div className="p-6 bg-linear-to-br from-[#1a1f29] to-[#0f141c] rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
                <div>
                  <div className="flex gap-3 items-center">
                    <BsCheckCircleFill className="text-xl text-orange-400" />
                    <p className="text-xl font-bold text-white">
                      Delivered Orders
                    </p>
                  </div>
                  <h3 className="text-3xl font-black text-white mt-4">
                    {orders.filter((o) => o.status === "Delivered").length}
                  </h3>
                </div>
              </div>

              {/* EXCEPTIONS */}
              <div className="p-6 bg-linear-to-br from-[#1a1f29] to-[#0f141c] rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
                <div>
                  <div className="flex gap-3 items-center">
                    <BsExclamationTriangleFill className="text-xl text-orange-400" />
                    <p className="text-xl font-bold text-white">
                      Exceptions
                    </p>
                  </div>
                  <h3 className="text-3xl font-black text-white mt-4">
                    {
                      orders.filter((o) =>
                        ["Cancelled", "DeliveryAttempted"].includes(o.status)
                      ).length
                    }
                  </h3>
                </div>
              </div>
            </div>

            {/* 2. ANALYTICS SECTION */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <GoPackage className="text-[#ff8a3d]" size={20} /> Analytics Overview
                </h2>
                <p className="text-sm text-slate-400 mt-1">Track your order history and status</p>
              </div>

              {/* DATE FILTERS */}
              <div className="bg-white/5 p-1 rounded-xl flex gap-1 border border-white/10 backdrop-blur-sm overflow-x-auto max-w-full">
                {["1W", "1M", "3M", "1Y"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setDateFilter(filter)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${dateFilter === filter
                        ? "bg-[#ff8a3d]/20 text-[#ff8a3d] border border-[#ff8a3d]/50 backdrop-blur-md shadow-lg shadow-orange-500/10"
                        : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                      }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {(() => {
              // Filter Logic
              const now = new Date();
              const past = new Date();
              if (dateFilter === "1Y") past.setDate(past.getDate() - 365);
              else if (dateFilter === "3M") past.setDate(past.getDate() - 90);
              else if (dateFilter === "1M") past.setDate(past.getDate() - 30);
              else past.setDate(past.getDate() - 7);

              const filteredOrders = orders.filter(o => {
                if (!o.createdAt) return false;
                const d = new Date(o.createdAt);
                return d >= past && d <= now;
              });

              return (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-0">
                    <div className="w-full bg-[#0b0f14] rounded-xl shadow-sm border border-[#1f2937] p-1">
                      <OrdersPieChart data={filteredOrders} />
                    </div>

                    {/* CHART 2: DAILY VOLUME */}
                    <div className="w-full bg-[#0b0f14] rounded-xl shadow-sm border border-[#1f2937] p-1">
                      <OrdersBarChart data={filteredOrders} filterType={dateFilter} />
                    </div>
                  </div>
                  {/* CHART 3: SPENDING HISTORY */}
                  <div className="w-full bg-[#0b0f14] rounded-xl shadow-sm border border-[#1f2937] p-1">
                    <OrdersSpendingChart data={filteredOrders} filterType={dateFilter} />
                  </div>
                </>
              );
            })()}
          </div>
        </main>

        {/* --- MODALS (Preserved) --- */}
        {/* Tracking Modal */}
        {trackingData && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-0 max-w-2xl w-full shadow-2xl border border-[#e2e8f0] overflow-hidden">
              <div className="bg-[#0f172a] px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">
                  Live Tracking
                </h3>
                <button
                  onClick={() => {
                    setTrackingData(null);
                    setSelectedOrder(null);
                  }}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-orange-500/10 text-[#ff8a3d] flex items-center justify-center text-xl">
                    📍
                  </div>
                  <div>
                    <p className="text-xs text-[#64748b] font-bold">
                      Current Status
                    </p>
                    <p className="text-2xl font-black text-[#0f172a]">
                      {formatStatus(trackingData.order.status)}
                    </p>
                  </div>
                </div>

                {trackingData.driverLocation ? (
                  <div className="bg-[#f8fafc] p-6 rounded-xl border border-[#e2e8f0] mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-[#64748b] font-bold mb-1">
                          Latitude
                        </p>
                        <p className="font-mono text-[#0f172a] font-bold">
                          {trackingData.driverLocation.latitude.toFixed(6)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#64748b] font-bold mb-1">
                          Longitude
                        </p>
                        <p className="font-mono text-[#0f172a] font-bold">
                          {trackingData.driverLocation.longitude.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 italic">
                    Drivers location is currently unavailable.
                  </div>
                )}


                <button
                  onClick={() =>
                    window.open(
                      `https://www.openstreetmap.org/?mlat=${trackingData.driverLocation?.latitude}&mlon=${trackingData.driverLocation?.longitude}`,
                      "_blank"
                    )
                  }
                  disabled={!trackingData.driverLocation}
                  className="w-full bg-[#ff8a3d] hover:bg-[#ff9a55] text-white font-extrabold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  OPEN IN MAPS
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reschedule Modal */}
        {showRescheduleDialog && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-[#e2e8f0]">
              <h3 className="text-xl font-black text-[#0f172a] mb-6">
                Reschedule Delivery
              </h3>

              <form onSubmit={handleReschedule} className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-[#64748b] mb-2 block">
                    New Delivery Date
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:ring-2 focus:ring-[#2563eb] outline-none transition-all font-medium text-[#0f172a]"
                    value={rescheduleForm.newDate}
                    onChange={(e) =>
                      setRescheduleForm({
                        ...rescheduleForm,
                        newDate: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#64748b] mb-2 block">
                    Reason (Optional)
                  </label>
                  <textarea
                    rows="3"
                    className="w-full p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:ring-2 focus:ring-[#2563eb] outline-none transition-all font-medium text-[#0f172a]"
                    value={rescheduleForm.reason}
                    onChange={(e) =>
                      setRescheduleForm({
                        ...rescheduleForm,
                        reason: e.target.value,
                      })
                    }
                  ></textarea>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowRescheduleDialog(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>



                  <button
                    type="submit"
                    className="flex-1 bg-[#ff8a3d] hover:bg-[#ff9a55] text-white font-bold py-3 rounded-xl shadow-lg transition-transform active:scale-95"
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
