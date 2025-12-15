import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CustomerSidebar from "./CustomerSidebar";
import api, { API_BASE_URL } from "../../services/api";
import * as signalR from "@microsoft/signalr";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connection, setConnection] = useState(null);

  // Reschedule state
  // Reschedule state
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({
    newDate: "",
    reason: "",
  });

  // ETA State
  const [eta, setEta] = useState(null);
  const [etaDistance, setEtaDistance] = useState(null);

  const calculateEta = async (currentOrder, locHistory) => {
    if (!currentOrder || !currentOrder.driverId) return;

    try {
        let driverLat, driverLon;
        const driverProfile = currentOrder.driver;
        const driverHistory = locHistory;

        const now = new Date();
        const staleThreshold = 5 * 60 * 1000; // 5 minutes

        let isProfileFresh = false;
        if (driverProfile?.updatedAt) {
          const profileTime = new Date(driverProfile.updatedAt).getTime();
          if (now.getTime() - profileTime < staleThreshold) {
            isProfileFresh = true;
          }
        }

        if (isProfileFresh && driverProfile.currentLatitude && driverProfile.currentLongitude) {
           driverLat = driverProfile.currentLatitude;
           driverLon = driverProfile.currentLongitude;
        } 
        else if (driverHistory && driverHistory.latitude && driverHistory.longitude) {
           driverLat = driverHistory.latitude;
           driverLon = driverHistory.longitude;
        } 
        else if (driverProfile?.currentLatitude && driverProfile?.currentLongitude) {
           driverLat = driverProfile.currentLatitude;
           driverLon = driverProfile.currentLongitude;
        }
        else {
           return; // Cannot calculate
        }

        const etaRes = await api.post("/loc/calculate-eta", {
            driverLat,
            driverLon,
            customerLat: currentOrder.deliveryLatitude,
            customerLon: currentOrder.deliveryLongitude,
            speedKmph: 40,
        });

        setEta(etaRes.data.eta);
        setEtaDistance(etaRes.data.distance_km);

    } catch (error) {
        console.error("ETA Calc Error:", error);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
    setupSignalR();

    return () => {
      if (connection) connection.stop().catch(() => {});
    };
  }, [id]);

  // ETA Update Interval (1 minute)
  useEffect(() => {
    let intervalId;
    if (order && order.status !== 'Delivered' && order.status !== 'Cancelled') {
        intervalId = setInterval(() => {
            calculateEta(order, driverLocation);
        }, 60 * 1000);
    }
    return () => {
        if(intervalId) clearInterval(intervalId);
    }
  }, [order, driverLocation]);

  const fetchOrderDetails = async () => {
    try {
      const response = await api.get(`/customer/track/${id}`);
      setOrder(response.data.order);
      if (response.data.driverLocation) {
        setDriverLocation(response.data.driverLocation);
      }
      // Initial ETA calc
      calculateEta(response.data.order, response.data.driverLocation);
    } catch (error) {
      console.error("Error fetching order details:", error);
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
        if (order && payload?.driverId === order.driverId) {
             setDriverLocation({
              latitude: payload.latitude,
              longitude: payload.longitude,
              updatedAt: payload.updatedAt || new Date().toISOString(),
              speed: payload.speed || 0,
            });
        }
      });

      await conn.start();
      setConnection(conn);
    } catch (err) {
      console.error("SignalR Error:", err);
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/orders/${id}/reschedule`, {
        newDate: rescheduleForm.newDate,
        reason: rescheduleForm.reason,
      });
      alert("Delivery rescheduled!");
      setShowRescheduleDialog(false);
      fetchOrderDetails();
    } catch {
      alert("Error updating schedule");
    }
  };

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

  if (loading) return (
       <div className="min-h-screen flex bg-[#f7f3ef]">
         <CustomerSidebar active="orders" />
         <div className="flex-1 flex justify-center items-center text-[#351c15]">Loading...</div>
       </div>
  );

  if (!order) return (
      <div className="min-h-screen flex bg-[#f7f3ef]">
        <CustomerSidebar active="orders" />
        <div className="flex-1 flex justify-center items-center text-[#351c15]">Order not found</div>
      </div>
  );

  return (
    <div className="min-h-screen flex bg-[#f7f3ef]">
      <CustomerSidebar active="orders" />
      
      <div className="flex-1 overflow-y-auto max-h-screen">
        {/* HEADER MATCHING IMAGE */}
        <header className="bg-[#351c15] text-[#f9b400] sticky top-0 z-40 shadow-md">
            <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/customer/orders')} 
                        className="text-[#f9b400] hover:text-white font-medium transition-colors text-sm flex items-center gap-1"
                    >
                        <span>← Back</span>
                    </button>
                    <h1 className="text-xl font-bold tracking-wide text-[#fca311]">ORDER DETAILS</h1>
                </div>
                <div className="text-sm text-[#f7f3ef] opacity-80 font-mono">
                    Order #{order.id}
                </div>
            </div>
        </header>

        <div className="max-w-7xl mx-auto px-8 py-8">
            {/* Top Status Banner */}
            <div className="bg-white rounded-xl shadow-sm border border-[#e6ddc5] p-8 mb-8 flex justify-between items-center relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-xs text-[#6f4e37] uppercase font-bold tracking-wider mb-2 opacity-80">Current Status</p>
                    <h2 className="text-4xl font-extrabold text-[#351c15] mb-2">{order.status}</h2>
                    <p className="text-sm text-[#6f4e37] opacity-80">
                        Updated: {new Date(order.updatedAt || order.createdAt).toLocaleString()}
                    </p>
                </div>
                <div className={`px-6 py-2 rounded-full font-bold text-sm ${getStatusColor(order.status)}`}>
                    {order.status}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Shipment Details */}
                    <div className="bg-white rounded-xl shadow-sm border border-[#e6ddc5] overflow-hidden">
                        <div className="bg-[#f4ebd0] px-6 py-4 border-b border-[#e6ddc5]">
                            <h3 className="text-[#351c15] font-bold uppercase tracking-wide text-sm">Shipment Information</h3>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                            <div>
                                <h4 className="text-xs font-bold text-[#6f4e37] uppercase mb-2 opacity-70">Package Details</h4>
                                <p className="text-[#351c15] font-bold text-lg">{order.packageDescription || "Standard Package"}</p>
                                <p className="text-sm text-[#6f4e37] mt-1">Weight: {order.weight} kg</p>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-[#6f4e37] uppercase mb-2 opacity-70">
                                    {order.status === "Delivered" ? "Delivered On" : "Estimated Delivery"}
                                </h4>
                                <p className="text-[#351c15] font-bold text-lg">
                                    {order.status === "Delivered"
                                        ? new Date(order.deliveredAt || order.createdAt).toLocaleDateString()
                                        : order.deliveryDate 
                                            ? new Date(order.deliveryDate).toLocaleDateString() 
                                            : "Pending"}
                                </p>
                                {eta && order.status !== "Delivered" && (
                                    <div className="mt-3 bg-[#e6ddc5] rounded px-3 py-2 animate-pulse">
                                         <p className="text-xs text-[#6f4e37] font-bold uppercase">Live ETA</p>
                                         <p className="text-[#351c15] font-bold text-base">{eta}</p>
                                         <p className="text-xs text-[#6f4e37] opacity-80">{etaDistance?.toFixed(1)} km away</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="md:col-span-2 h-px bg-[#f1e6d6] my-2"></div>

                            <div>
                                <h4 className="text-xs font-bold text-[#6f4e37] uppercase mb-2 opacity-70">From</h4>
                                <p className="text-[#351c15] font-bold text-lg">{order.senderName}</p>
                                <p className="text-sm text-[#555] mt-1 leading-relaxed">{order.pickupAddress}</p>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-[#6f4e37] uppercase mb-2 opacity-70">To</h4>
                                <p className="text-[#351c15] font-bold text-lg">{order.receiverName}</p>
                                <p className="text-sm text-[#555] mt-1 leading-relaxed">{order.receiverAddress}</p>
                            </div>
                        </div>
                    </div>

                    {/* Warehouse Progress */}
                    <div className="bg-white rounded-xl shadow-sm border border-[#e6ddc5] overflow-hidden">
                         <div className="bg-[#f4ebd0] px-6 py-4 border-b border-[#e6ddc5]">
                            <h3 className="text-[#351c15] font-bold uppercase tracking-wide text-sm">Tracking History</h3>
                        </div>
                        <div className="p-8">
                             <div className="relative pl-2">
                                {/* Vertical Timeline */}
                                <div className="space-y-0">
                                    {[
                                        { label: "Origin", val: order.originWarehouse, active: true },
                                        { label: "Current", val: order.currentWarehouse, active: !!order.currentWarehouse },
                                        { label: "Destination", val: order.destinationWarehouse, active: !!order.destinationWarehouse || order.status === 'Delivered' }
                                    ].map((item, idx, arr) => (
                                        <div key={idx} className="flex gap-6 relative min-h-[80px] last:min-h-0">
                                            {/* Line */}
                                            {idx !== arr.length - 1 && (
                                                <div className={`absolute left-[7px] top-4 bottom-0 w-[2px] ${item.val && arr[idx+1].val ? 'bg-[#351c15]' : 'bg-gray-200'}`}></div>
                                            )}
                                            
                                            {/* Dot */}
                                            <div className={`relative z-10 w-4 h-4 rounded-full mt-1.5 flex-shrink-0 ${item.val ? 'bg-[#351c15] ring-4 ring-[#f4ebd0]' : 'bg-gray-200'}`}></div>
                                            
                                            <div className="-mt-1">
                                                <p className="text-xs font-bold text-[#6f4e37] uppercase tracking-wide mb-1">{item.label}</p>
                                                <p className="text-[#351c15] font-bold text-lg">{item.val?.name || "Pending"}</p>
                                                {item.val && <p className="text-sm text-gray-500 mt-1">{item.val.city}, {item.val.state}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                             </div>
                        </div>
                    </div>

                </div>

                {/* Sidebar / Actions */}
                <div className="space-y-8">
                    {/* Live Tracking Map Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-[#e6ddc5] overflow-hidden">
                         <div className="bg-[#351c15] px-6 py-4">
                            <h3 className="text-[#f9b400] font-bold uppercase tracking-wide text-sm">Live Location</h3>
                        </div>
                        <div className="p-6">
                            {driverLocation ? (
                                <div>
                                    <div className="bg-[#f9f5f0] p-4 rounded-lg mb-4 border border-[#eee6da]">
                                        <p className="text-xs text-[#6f4e37] uppercase font-bold mb-2">Driver Coordinates</p>
                                        <p className="text-[#351c15] font-mono text-lg font-bold">
                                            {driverLocation.latitude.toFixed(4)}, {driverLocation.longitude.toFixed(4)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() =>
                                            window.open(
                                                `https://www.openstreetmap.org/?mlat=${driverLocation.latitude}&mlon=${driverLocation.longitude}`,
                                                "_blank"
                                            )
                                        }
                                        className="w-full bg-[#f9b400] hover:bg-[#ffc107] text-[#351c15] font-bold py-3 rounded-lg shadow-sm transition-all transform hover:-translate-y-0.5"
                                    >
                                        VIEW ON MAP
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-gray-400 text-sm italic">Live tracking unavailable.</p>
                                    <p className="text-xs text-gray-400 mt-1">Driver not yet assigned or offline.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                     <div className="bg-white rounded-xl shadow-sm border border-[#e6ddc5] p-6">
                        <h3 className="text-[#351c15] font-bold uppercase tracking-wide text-sm mb-6">Manage Delivery</h3>
                        
                        {order.status !== "Delivered" && (
                            <button
                                onClick={() => setShowRescheduleDialog(true)}
                                className="w-full border-2 border-[#351c15] text-[#351c15] hover:bg-[#351c15] hover:text-white font-bold py-3 rounded-lg transition-colors mb-3"
                            >
                                RESCHEDULE DELIVERY
                            </button>
                        )}
                        <button className="w-full border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium py-3 rounded-lg text-sm transition-colors">
                            Report a Problem
                        </button>
                    </div>
                </div>
            </div>
        </div>

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
                    className="w-full p-3 border border-[#e6ddc5] rounded-xl mt-1 focus:ring-2 focus:ring-[#f9b400] focus:border-[#f9b400]"
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
                    className="w-full p-3 border border-[#e6ddc5] rounded-xl mt-1 focus:ring-2 focus:ring-[#f9b400] focus:border-[#f9b400]"
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
                    className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-2 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex-1 bg-[#351c15] hover:bg-[#2b160f] text-white py-2 rounded-xl transition-colors font-bold"
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

export default OrderDetails;
