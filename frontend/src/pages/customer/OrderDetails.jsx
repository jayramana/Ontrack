import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CustomerSidebar from "./CustomerSidebar";
import api, { API_BASE_URL } from "../../services/api";
import * as signalR from "@microsoft/signalr";
import { Copy, Check } from "lucide-react";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connection, setConnection] = useState(null);

  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (order?.trackingId) {
      navigator.clipboard.writeText(order.trackingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const [rescheduleForm, setRescheduleForm] = useState({
    newDate: "",
    reason: "",
  });

  const [eta, setEta] = useState(null);

  /* ---------------- ETA ---------------- */
  const calculateEta = async (currentOrder, locHistory) => {
    if (!currentOrder || !currentOrder.driverId) return;

    try {
      let driverLat, driverLon;
      const driverProfile = currentOrder.driver;

      if (driverProfile?.currentLatitude && driverProfile?.currentLongitude) {
        driverLat = driverProfile.currentLatitude;
        driverLon = driverProfile.currentLongitude;
      } else if (locHistory?.latitude && locHistory?.longitude) {
        driverLat = locHistory.latitude;
        driverLon = locHistory.longitude;
      } else return;

      const res = await api.post("/loc/calculate-eta", {
        driverLat,
        driverLon,
        customerLat: currentOrder.deliveryLatitude,
        customerLon: currentOrder.deliveryLongitude,
        speedKmph: 40,
      });

      setEta(res.data.eta);
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- EFFECTS ---------------- */
  useEffect(() => {
    fetchOrderDetails();
    setupSignalR();
    return () => connection?.stop();
  }, [id]);

  useEffect(() => {
    if (!order) return;
    const i = setInterval(() => calculateEta(order, driverLocation), 60000);
    return () => clearInterval(i);
  }, [order, driverLocation]);

  const fetchOrderDetails = async () => {
    try {
      const res = await api.get(`/customer/track/${id}`);
      setOrder(res.data.order);
      setDriverLocation(res.data.driverLocation);
      calculateEta(res.data.order, res.data.driverLocation);
    } finally {
      setLoading(false);
    }
  };

  const setupSignalR = async () => {
    const conn = new signalR.HubConnectionBuilder()
      .withUrl(API_BASE_URL.replace("/api", "/hubs/logistics"))
      .withAutomaticReconnect()
      .build();

    conn.on("ReceiveDriverLocation", (p) => {
      if (order && p.driverId === order.driverId) {
        setDriverLocation(p);
      }
    });

    await conn.start();
    setConnection(conn);
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    await api.post(`/customer/reschedule/${id}`, rescheduleForm);
    setShowRescheduleDialog(false);
    fetchOrderDetails();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex bg-[#0b0f14] text-slate-400">
        <CustomerSidebar active="orders" />
        <div className="flex-1 flex items-center justify-center">Loading…</div>
      </div>
    );
  }

  if (!order) return null;

  /* ---------------- TIMELINE ---------------- */
  const statusRank = {
    PendingAssignment: 0,
    Pending: 0,               
    Assigned: 10,            
    Picked: 20,
    AtOriginWarehouse: 30,
    InTransit: 40,
    AtDestinationWarehouse: 50,
    OutForDelivery: 60,
    DeliveryAttempted: 60,    
    Delivered: 70,
  };

  const currentRank = statusRank[order.status] ?? 0;

  const steps = [
    { title: "Order Placed", sub: "Order created", rank: 0 },
    { title: "Order Confirmed", sub: "Driver assigned", rank: 10 },
    { title: "Picked Up", sub: "Courier picked package", rank: 20 },
    { title: "In Transit", sub: "Package on the move", rank: 40 },
    { title: "Out for Delivery", sub: "Driver en route", rank: 60 },
    { title: "Delivered", sub: "Package delivered", rank: 70 },
  ];

  return (
    <div className="min-h-screen flex bg-[#0b0f14] text-slate-100">
      <CustomerSidebar active="orders" />

      <div className="flex-1 overflow-y-auto px-10 py-8 space-y-10">

        {/* HEADER */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/customer/orders")}
              className="text-slate-400 hover:text-[#ff8a3d]"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-black">
              Order Details
              {/* {order.trackingId && <span className="ml-3 text-lg text-slate-400 font-medium">#{order.trackingId}</span>} */}
            </h1>
          </div>

  <div className="flex flex-col items-end">


  <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10 min-w-[120px]">
    <svg className="w-4 h-4 text-[#ff8a3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <span className="text-sm text-slate-300 font-medium">ETA:</span>
    <span className="text-sm font-bold text-[#ff8a3d]">{eta}</span>
  </div>
</div>


        </header>

        {/* MAIN CARD */}
        <div className="max-w-4xl bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">

          {/* ORDER DETAILS */}
          <div className="p-8 space-y-6">
            <h2 className="text-xl font-bold">Order Details</h2>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
               <div>
                  <h4 className="font-bold text-slate-400 text-lg tracking-wider">Order Name</h4>
                  <p className="text-white font-medium text-base">Order-{order.id}</p>
               </div>
               
               <div>
                  <h4 className="font-bold text-slate-400 text-lg tracking-wider">Tracking ID</h4>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium text-base">#{order.trackingId}</p>
                    <button 
                      onClick={handleCopy}
                      className="p-1 hover:bg-white/10 rounded-md transition-colors text-slate-400 hover:text-white"
                      title="Copy Tracking ID"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
               </div>

               <div>
                  <h4 className="font-bold text-slate-400 text-lg tracking-wider">Weight</h4>
                  <p className="text-white font-medium text-base">{order.weight} kg</p>
               </div>

               <div>
                  <h4 className="font-bold text-slate-400 text-lg tracking-wider">Price</h4>
                  <p className="text-white font-medium text-base">₹{order.price}</p>
               </div>

               <div>
                  <h4 className="font-bold text-slate-400 text-lg tracking-wider">Type</h4>
                  <div className="mt-1">
                    {order.deliveryType === 'Express' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-200 to-yellow-500 text-black text-xs font-bold uppercase tracking-wide shadow-lg shadow-amber-500/20">
                         <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse"/>
                         Express
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wide border border-slate-700">
                        Normal
                      </span>
                    )}
                  </div>
               </div>

               <div>
                  <h4 className="font-bold text-slate-400 text-lg tracking-wider">ASR Required</h4>
                  <p className={`font-medium text-base ${order.isASR ? 'text-[#ff8a3d]' : 'text-slate-500'}`}>
                    {order.isASR ? 'Yes' : 'No'}
                  </p>
               </div>
            </div>
          </div>

          <div className="border-t border-white/10" />

          {/* SHIPMENT INFO */}
          <div className="p-8 space-y-6">
            <h2 className="text-xl font-bold">Shipment Information</h2>

            <div>
              <h4 className="font-semibold">From</h4>
              <p className="text-slate-400">{order.senderName}</p>
              <p className="text-slate-500 text-sm">{order.pickupAddress}</p>
            </div>

            <div>
              <h4 className="font-semibold">To</h4>
              <p className="text-slate-400">{order.receiverName}</p>
              <p className="text-slate-500 text-sm">{order.receiverAddress}</p>
            </div>
<div className="flex items-center gap-3 font-semibold">
  <span>Status</span>

  <span
    className="
      inline-flex items-center
      px-3 py-1
      rounded-full
      text-xs font-bold uppercase tracking-wide
      bg-[#ff8a3d]/20
      text-[#ff8a3d]
      whitespace-nowrap
    "
  >
    {order.status === "Pending" && order.rescheduledAt ? "Rescheduled" : order.status}
  </span>
</div>



            <div>
              <h4 className="font-semibold">
                {order.status === "Delivered"
                  ? "Delivered On"
                  : "Estimated Delivery"}
              </h4>
              <p className="text-slate-400">
                {order.status === "Delivered"
                  ? new Date(order.deliveredAt || order.createdAt).toLocaleDateString()
                  : order.deliveryDate
                  ? new Date(order.deliveryDate).toLocaleDateString()
                  : "Pending"}
              </p>
            </div>

            {eta && (
              <div className="inline-flex px-4 py-1 rounded-full bg-white/10 text-[#ff8a3d] text-sm font-bold">
                ETA: {eta}
              </div>
            )}
          </div>

          <div className="border-t border-white/10" />

          {/* TIMELINE */}
          <div className="p-8">
            <h3 className="text-sm uppercase tracking-widest text-slate-400 mb-6">
              Tracking Timeline
            </h3>

            <div className="relative space-y-10">
              {steps.map((s, i) => {
                const active = currentRank >= s.rank;
                const current =
                  active && (steps[i + 1]?.rank ?? 999) > currentRank;

                return (
                  <div key={i} className="flex gap-6 relative">

                    {i !== steps.length - 1 && (
                      <div className="absolute left-[7px] top-4 bottom-[-40px] w-[2px] bg-white/30" />
                    )}

                    <div
                      className={`relative z-10 w-4 h-4 mt-1.5 rounded-full ${
                        current
                          ? "bg-[#ff8a3d]"
                          : active
                          ? "bg-white/70"
                          : "bg-white/20"
                      }`}
                    >
                      {current && (
                        <span className="absolute -inset-2 rounded-full border border-[#ff8a3d] animate-ping" />
                      )}
                    </div>

                    <div>
                      <h4 className={`font-bold ${active ? "" : "text-slate-500"}`}>
                        {s.title}
                      </h4>
                      <p className="text-sm text-slate-400">{s.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-white/10" />

          {/* ACTIONS */}
          <div className="p-8 flex gap-4">
            {order.status !== "Delivered" && (
              <button
                onClick={() => setShowRescheduleDialog(true)}
                className="px-6 py-3 rounded-xl bg-[#ff8a3d] text-black font-bold"
              >
                Reschedule Delivery
              </button>
            )}
            <button className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20">
              Report Issue
            </button>
          </div>
        </div>
      </div>

      {/* RESCHEDULE MODAL */}
      {showRescheduleDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <form
            onSubmit={handleReschedule}
            className="bg-[#0b0f14] p-6 rounded-xl border border-white/10 space-y-4"
          >
            <h3 className="text-lg font-bold">Reschedule Delivery</h3>
            <input
              type="datetime-local"
              className="w-full p-3 bg-white/10 rounded"
              onChange={(e) =>
                setRescheduleForm({ ...rescheduleForm, newDate: e.target.value })
              }
              required
            />
            <textarea
              rows="3"
              className="w-full p-3 bg-white/10 rounded"
              placeholder="Reason (optional)"
              onChange={(e) =>
                setRescheduleForm({ ...rescheduleForm, reason: e.target.value })
              }
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowRescheduleDialog(false)}
                className="flex-1 bg-white/10 py-2 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#ff8a3d] text-black py-2 rounded font-bold"
              >
                Confirm
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
