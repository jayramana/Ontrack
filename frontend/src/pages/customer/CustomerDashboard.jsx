import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api, { API_BASE_URL } from "../../services/api";
import * as signalR from "@microsoft/signalr";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import CustomerSidebar from "./CustomerSidebar";

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

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
  const [currDriverLoc, setcurrDriverLoc] = useState({ lat: null, lon: null });
  const [useLiveDriverLoc, setUseLiveDriverLoc] = useState(false);

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

      console.log("ETA Debug - API Response:", data);

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
        if (isProfileFresh && driverProfile.currentLatitude && driverProfile.currentLongitude) {
          console.log("ETA: Using FRESH Profile Location");
          driverLat = driverProfile.currentLatitude;
          driverLon = driverProfile.currentLongitude;
        } 
        else if (driverHistory && driverHistory.latitude && driverHistory.longitude) {
           console.log("ETA: Profile stale or empty. Using HISTORY Location.");
           driverLat = driverHistory.latitude;
           driverLon = driverHistory.longitude;
        } 
        else if (driverProfile?.currentLatitude && driverProfile?.currentLongitude) {
           // Last resort: Profile is stale but History is empty? Use stale profile.
           console.warn("ETA: Both sources poor. Defaulting to stale Profile.");
           driverLat = driverProfile.currentLatitude;
           driverLon = driverProfile.currentLongitude;
        }
        else {
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

      alert(`ETA: ${etaRes.data.eta}\nDistance: ${etaRes.data.distance_km} km`);
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
    <div className="min-h-screen flex bg-[#f8fafc] font-sans text-[#0f172a]">
      <CustomerSidebar active="dashboard" />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* HEADER */}
        <header className="bg-white/80 backdrop-blur-md border-b border-[#e2e8f0] sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#0f172a]">
                DASHBOARD
              </h1>
              <p className="text-sm text-[#64748b] font-medium mt-0.5">
                Welcome back, {user?.first_name}
              </p>
            </div>


          </div>
        </header>


        {/* SCROLLABLE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* 1. METRICS ROW */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* TOTAL */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e2e8f0] flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-[#f1f5f9] rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <p className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1">Total Orders</p>
                            <h3 className="text-4xl font-black text-[#0f172a]">{orders.length}</h3>
                        </div>
                        <div className="relative z-10 mt-4 flex items-center text-xs font-bold text-[#0f172a]">
                             <span className="w-6 h-6 rounded-full bg-[#0f172a] text-white flex items-center justify-center mr-2">📦</span>
                             All Time
                        </div>
                    </div>

                    {/* IN TRANSIT */}
                    <div className="bg-[#2563eb] p-6 rounded-2xl shadow-sm border border-[#2563eb] flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden text-white">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-[#1d4ed8] rounded-bl-full -mr-4 -mt-4"></div>
                        <div className="relative z-10">
                            <p className="text-xs font-bold text-blue-100 uppercase tracking-wider mb-1">Active Shipments</p>
                            <h3 className="text-4xl font-black text-white">
                                {orders.filter((o) => ["InTransit", "OutForDelivery"].includes(o.status)).length}
                            </h3>
                        </div>
                         <div className="relative z-10 mt-4 flex items-center text-xs font-bold text-blue-100">
                             <span className="w-6 h-6 rounded-full bg-white text-[#2563eb] flex items-center justify-center mr-2 animate-pulse">🚚</span>
                             On the road
                        </div>
                    </div>

                    {/* DELIVERED */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e2e8f0] flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-[#ecfdf5] rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <p className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1">Delivered</p>
                            <h3 className="text-4xl font-black text-[#0f172a]">
                                {orders.filter((o) => o.status === "Delivered").length}
                            </h3>
                        </div>
                        <div className="relative z-10 mt-4 flex items-center text-xs font-bold text-green-600">
                             <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-2">✅</span>
                             Completed
                        </div>
                    </div>

                     {/* EXCEPTIONS */}
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e2e8f0] flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-[#fef2f2] rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <p className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1">Exceptions</p>
                            <h3 className="text-4xl font-black text-[#0f172a]">
                                {orders.filter((o) => ["Cancelled", "DeliveryAttempted"].includes(o.status)).length}
                            </h3>
                        </div>
                        <div className="relative z-10 mt-4 flex items-center text-xs font-bold text-red-600">
                             <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-2">⚠️</span>
                             Action Needed
                        </div>
                    </div>
                </div>

                {/* 2. ANALYTICS SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* CHART 1: STATUS DISTRIBUTION */}
                      <div className="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-8 flex flex-col items-center justify-center">
                            <h3 className="font-bold text-[#0f172a] uppercase tracking-wide text-sm mb-8 w-full text-left">Order Status Distribution</h3>
                            <div className="h-64 w-full relative">
                              <Doughnut 
                                  data={{
                                      labels: [
                                          'Pending Assignment',
                                          'At Origin Warehouse', 
                                          'Assigned',
                                          'In Transit',
                                          'Out For Delivery',
                                          'At Dest Warehouse',
                                          'Delivered',
                                          'Delivery Attempted'
                                      ],
                                      datasets: [{
                                          data: [
                                              orders.filter(o => o.status === 'PendingAssignment').length,
                                              orders.filter(o => o.status === 'AtOriginWarehouse').length,
                                              orders.filter(o => o.status === 'Assigned').length,
                                              orders.filter(o => o.status === 'InTransit').length,
                                              orders.filter(o => o.status === 'OutForDelivery').length,
                                              orders.filter(o => o.status === 'AtDestinationWarehouse').length,
                                              orders.filter(o => o.status === 'Delivered').length,
                                              orders.filter(o => o.status === 'DeliveryAttempted').length
                                          ],
                                          backgroundColor: [
                                              '#94a3b8', // PendingAssignment (Gray)
                                              '#60a5fa', // AtOriginWarehouse (Blue)
                                              '#facc15', // Assigned (Yellow)
                                              '#f97316', // InTransit (Orange)
                                              '#c026d3', // OutForDelivery (Purple)
                                              '#3b82f6', // AtDestinationWarehouse (Blue)
                                              '#22c55e', // Delivered (Green)
                                              '#ef4444'  // DeliveryAttempted (Red)
                                          ],
                                          borderWidth: 0,
                                          hoverOffset: 10
                                      }]
                                  }}
                                  options={{
                                      responsive: true,
                                      maintainAspectRatio: false,
                                      cutout: '70%',
                                      plugins: { 
                                          legend: { 
                                              position: 'bottom',
                                              labels: { usePointStyle: true, padding: 20, font: { family: 'sans-serif', size: 12 } } 
                                          } 
                                      }
                                  }}
                              />
                               {/* Center Text Overlay */}
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                                  <div className="text-center">
                                      <span className="text-4xl font-black text-[#0f172a] block">{orders.length}</span>
                                      <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">Total</span>
                                  </div>
                              </div>
                            </div>
                      </div>

                      {/* CHART 2: DAILY VOLUME */}
                      <div className="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-8">
                            <h3 className="font-bold text-[#0f172a] uppercase tracking-wide text-sm mb-8">Daily Order Volume</h3>
                            <div className="h-64">
                              <Bar 
                                    data={{
                                        labels: Array.from({length: 7}, (_, i) => {
                                            const d = new Date();
                                            d.setDate(d.getDate() - (6 - i));
                                            return d.toLocaleDateString('en-US', {weekday: 'short'});
                                        }),
                                        datasets: [{
                                            label: 'Orders',
                                            data: Array.from({length: 7}, (_, i) => {
                                                const d = new Date();
                                                d.setDate(d.getDate() - (6 - i));
                                                const dateStr = d.toISOString().split('T')[0];
                                                return orders.filter(o => o.createdAt.startsWith(dateStr)).length;
                                            }),
                                            backgroundColor: '#2563eb',
                                            borderRadius: 6,
                                            barThickness: 24
                                        }]
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: { legend: { display: false } },
                                        scales: {
                                            y: { 
                                                beginAtZero: true, 
                                                grid: { color: '#f1f5f9' },
                                                ticks: { stepSize: 1, font: { size: 11 } } 
                                            },
                                            x: { 
                                                grid: { display: false }, 
                                                ticks: { font: { size: 11 } } 
                                            }
                                        }
                                    }}
                                />
                            </div>
                      </div>
                </div>
            </div>
        </main>

        {/* --- MODALS (Preserved) --- */}
        {/* Tracking Modal */}
        {trackingData && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-0 max-w-2xl w-full shadow-2xl border border-[#e2e8f0] overflow-hidden">
              <div className="bg-[#0f172a] px-6 py-4 flex justify-between items-center">
                 <h3 className="text-lg font-bold text-white uppercase tracking-wide">
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
                     <div className="w-12 h-12 rounded-full bg-blue-50 text-[#2563eb] flex items-center justify-center text-xl">📍</div>
                     <div>
                         <p className="text-xs text-[#64748b] font-bold uppercase">Current Status</p>
                         <p className="text-2xl font-black text-[#0f172a]">{trackingData.order.status}</p>
                     </div>
                 </div>

                 {trackingData.driverLocation ? (
                    <div className="bg-[#f8fafc] p-6 rounded-xl border border-[#e2e8f0] mb-6">
                       <div className="grid grid-cols-2 gap-4">
                           <div>
                                <p className="text-xs text-[#64748b] font-bold uppercase mb-1">Latitude</p>
                                <p className="font-mono text-[#0f172a] font-bold">{trackingData.driverLocation.latitude.toFixed(6)}</p>
                           </div>
                           <div>
                                <p className="text-xs text-[#64748b] font-bold uppercase mb-1">Longitude</p>
                                <p className="font-mono text-[#0f172a] font-bold">{trackingData.driverLocation.longitude.toFixed(6)}</p>
                           </div>
                       </div>
                    </div>
                 ) : (
                    <div className="text-center py-8 text-gray-400 italic">Drivers location is currently unavailable.</div>
                 )}

                 <button
                    onClick={() =>
                      window.open(
                        `https://www.openstreetmap.org/?mlat=${trackingData.driverLocation?.latitude}&mlon=${trackingData.driverLocation?.longitude}`,
                        "_blank"
                      )
                    }
                    disabled={!trackingData.driverLocation}
                    className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-extrabold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
              <h3 className="text-xl font-black text-[#0f172a] mb-6 uppercase tracking-wide">
                Reschedule Delivery
              </h3>

              <form onSubmit={handleReschedule} className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-[#64748b] uppercase mb-2 block">
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
                  <label className="text-xs font-bold text-[#64748b] uppercase mb-2 block">
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
                    className="flex-1 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold py-3 rounded-xl shadow-lg transition-transform active:scale-95"
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