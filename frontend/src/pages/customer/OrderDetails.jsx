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
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({
    newDate: "",
    reason: "",
  });

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
                {/* ALTERNATIVE: Status in Header */}
                <div className="flex items-center gap-4">
                    <span className={`px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider ${getStatusColor(order.status)} border border-current shadow-sm`}>
                {order.status}
                </span>
                </div>
            </div>
        </header>

        <div className="max-w-7xl mx-auto px-8 py-8">
            {/* VERTICAL STACK LAYOUT (Unified Card) */}
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-[#e6ddc5] overflow-hidden">
                
                {/* 1. Shipment Details */}
                <div>
                    <div className="bg-[#f4ebd0] px-8 py-4 border-b border-[#e6ddc5] flex justify-between items-center">
                        <h3 className="text-[#351c15] font-bold uppercase tracking-wide text-sm">Shipment Information</h3>
                        <span className="text-xs text-[#6f4e37] opacity-60 font-mono">
                            Updated: {new Date(order.updatedAt || order.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                    <div className="p-8 space-y-8">
                        {/* Status Field Alternative */}
                        <div>
                             <h4 className="text-lg font-bold text-[#351c15] mb-1">Current Status</h4>
                             <p className="text-gray-600 text-base">{order.status}</p>
                        </div>
                        
                        <div className="h-px bg-[#f1e6d6] w-full"></div>

                        <div>
                            <h4 className="text-lg font-bold text-[#351c15] mb-1">Package Details</h4>
                            <p className="text-gray-600 text-base">{order.packageDescription || "Standard Package"}</p>
                            <p className="text-sm text-gray-500 mt-0.5">Weight: {order.weight} kg</p>
                        </div>
                        
                        <div className="h-px bg-[#f1e6d6] w-full"></div>

                        <div>
                            <h4 className="text-lg font-bold text-[#351c15] mb-1">
                                {order.status === "Delivered" ? "Delivered On" : "Estimated Delivery"}
                            </h4>
                            <p className="text-gray-600 text-base">
                                {order.status === "Delivered"
                                    ? new Date(order.deliveredAt || order.createdAt).toLocaleDateString()
                                    : order.deliveryDate 
                                        ? new Date(order.deliveryDate).toLocaleDateString() 
                                        : "Pending"}
                            </p>
                            {/* ETA Display */}
                            {eta && order.status !== "Delivered" && (
                                <div className="mt-2 inline-flex items-center gap-2 bg-[#f4ebd0] px-3 py-1 rounded text-sm text-[#351c15]">
                                     <span className="font-bold">ETA:</span> {eta}
                                </div>
                            )}
                        </div>
                        
                        <div className="h-px bg-[#f1e6d6] w-full"></div>

                        <div>
                            <h4 className="text-lg font-bold text-[#351c15] mb-1">From</h4>
                            <p className="text-gray-600 text-base font-medium">{order.senderName}</p>
                            <p className="text-gray-500 text-sm mt-0.5">{order.pickupAddress}</p>
                        </div>

                        <div className="h-px bg-[#f1e6d6] w-full"></div>

                        <div>
                            <h4 className="text-lg font-bold text-[#351c15] mb-1">To</h4>
                            <p className="text-gray-600 text-base font-medium">{order.receiverName}</p>
                            <p className="text-gray-500 text-sm mt-0.5">{order.receiverAddress}</p>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-[#e6ddc5]"></div>

                {/* 2. Detailed Tracking Timeline */}
                <div>
                    <div className="bg-[#f4ebd0] px-8 py-4 border-b border-[#e6ddc5]">
                        <h3 className="text-[#351c15] font-bold uppercase tracking-wide text-sm">Tracking Timeline</h3>
                    </div>
                    <div className="p-8">
                        <div className="relative pl-2 space-y-0">
                            {(() => {
                                // LOGIC TO DETERMINE STEPS
                                // User Request: 'InTransit' -> Arrived at Origin, 'Assigned' -> Arrived at Destination
                                
                                const statusRank = {
                                  PendingAssignment: 0,        // Order confirmed
                                  Picked: 20,                 // NEW explicit status
                                  AtOriginWarehouse: 30,
                                  'In Transit': 40,
                                  AtDestinationWarehouse: 50,
                                  Assigned: 55,
                                  'OutForDelivery': 60,
                                  'Out for delivery': 60,
                                  DeliveryAttempted: 65,
                                  Delivered: 70
                                };


                                const currentRank = statusRank[order.status] || 0;
                                
                                const steps = [
                                    { 
                                        title: "Order Placed", 
                                        date: order.createdAt, 
                                        sub: "Your order has been placed.",
                                        active: true,
                                        rank: 0 
                                    },
                                    { 
                                        title: "Order Confirmed", 
                                        date: order.createdAt, 
                                        sub: "Seller has processed your order.",
                                        active: currentRank >= 10,
                                        rank: 10
                                    },
                                    {
                                        title: "Picked Up",
                                        date: order.createdAt, 
                                        sub: "Courier has picked up your package.",
                                        active: currentRank >= 20,
                                        rank: 20
                                    },
                                    { 
                                        title: `Arrived at Origin (${order.originWarehouse?.city || 'Warehouse'})`, 
                                        date: null, 
                                        sub: "Package received at facility.",
                                        active: currentRank >= 30 && !!order.originWarehouse,
                                        visible: !!order.originWarehouse,
                                        rank: 30
                                    },
                                    {
                                        title: "Shipped",
                                        date: null, 
                                        sub: `En route to ${order.destinationWarehouse?.city || 'destination'}.`,
                                        // Shows as active in transit
                                        active: currentRank >= 30,
                                        rank: 40
                                    },
                                    { 
                                        title: `Arrived at Destination (${order.destinationWarehouse?.city || 'Hub'})`, 
                                        date: null,
                                        sub: "Package assigned to delivery partner.",
                                        // Active if 'Assigned' or later
                                        active: currentRank >= 50 && !!order.destinationWarehouse,
                                        visible: !!order.destinationWarehouse,
                                        rank: 50
                                    },
                                    { 
                                        title: "Out for Delivery", 
                                        date: null, 
                                        sub: "Driver is on the way.",
                                        active: currentRank >= 60,
                                        rank: 60
                                    },
                                    { 
                                        title: "Delivered", 
                                        date: order.deliveredAt, 
                                        sub: "Package delivered successfully.",
                                        active: currentRank >= 70,
                                        rank: 70
                                    }
                                ].filter(s => s.visible !== false);

                                return steps.map((step, idx) => {
                                    const isLast = idx === steps.length - 1;
                                    const isCompleted = step.active;
                                    const isCurrent = steps[idx].active && (!steps[idx+1]?.active);

                                    return (
                                        <div key={idx} className="flex gap-6 relative min-h-[80px]">
                                            {/* Connecting Line */}
                                            {!isLast && (
                                                <div className={`absolute left-[7px] top-4 bottom-0 w-[2px] ${isCompleted && steps[idx+1]?.active ? 'bg-[#15803d]' : 'bg-gray-200'}`}></div>
                                            )}
                                            
                                            {/* Status Dot */}
                                            <div className={`relative z-10 w-4 h-4 rounded-full mt-1.5 flex-shrink-0 border-2 ${
                                                isCompleted 
                                                    ? 'bg-[#15803d] border-[#15803d]' 
                                                    : 'bg-white border-gray-300'
                                            }`}>
                                                {isCurrent && <div className="absolute -inset-1 rounded-full border border-[#15803d] animate-ping"></div>}
                                            </div>
                                            
                                            <div className={`-mt-1 pb-6 ${!isCompleted ? 'opacity-50 grayscale' : ''}`}>
                                                <h4 className={`text-base font-bold ${isCompleted ? 'text-[#351c15]' : 'text-gray-500'}`}>
                                                    {step.title}
                                                </h4>
                                                <p className="text-sm text-gray-500 mt-0.5">{step.sub}</p>
                                                {step.date && isCompleted && (
                                                    <p className="text-xs text-[#15803d] font-bold mt-1">
                                                        {new Date(step.date).toLocaleString([], { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-[#e6ddc5]"></div>

                {/* 3. Actions / Manage Delivery */}
                <div className="bg-gray-50 p-8">
                    <h3 className="text-[#351c15] font-bold uppercase tracking-wide text-sm mb-6">Manage Delivery</h3>
                    
                    <div className="flex flex-col md:flex-row gap-4">
                        {order.status !== "Delivered" && (
                            <button
                                onClick={() => setShowRescheduleDialog(true)}
                                className="flex-1 border-2 border-[#351c15] text-[#351c15] hover:bg-[#351c15] hover:text-white font-bold py-3 rounded-lg transition-colors"
                            >
                                RESCHEDULE DELIVERY
                            </button>
                        )}
                        <button className="flex-1 border border-gray-300 text-gray-600 hover:bg-white font-medium py-3 rounded-lg text-sm transition-colors">
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
