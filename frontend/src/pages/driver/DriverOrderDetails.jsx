import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DriverSidebar from "./DriverSidebar";
import api from "../../services/api";
import DriverASRVerification from "./DriverASRVerification";
import { Copy, Check, ShieldCheck } from "lucide-react";

const DriverOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showASRModal, setShowASRModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("Delivered");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (order?.trackingId) {
      navigator.clipboard.writeText(order.trackingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const saveStatus = () => {
    if (selectedStatus === "Delivered") {
      markDelivered();
    } else {
      markAttempted();
    }
    setShowCompleteModal(false);
  };

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/driver/order/${id}`);
      setOrder(res.data);
    } catch (error) {
      console.error("Error loading order:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const markDelivered = async () => {
    if (!window.confirm("Confirm delivery?")) return;
    await api.post(`/driver/mark-delivered/${id}`);
    fetchOrder();
  };

  const markAttempted = async () => {
    const reason = prompt("Reason for failed attempt:");
    if (!reason) return;
    await api.post(`/driver/mark-attempted/${id}`, { reason });
    fetchOrder();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex bg-[#0b0f14] text-slate-400">
        <DriverSidebar active="deliveries" />
        <div className="flex-1 flex items-center justify-center">Loading...</div>
      </div>
    );
  }

  if (!order) return null;

  /* ---------------- TIMELINE ---------------- */
  const statusRank = {
    PendingAssignment: 0,
    Assigned: 10,
    Picked: 20,
    AtOriginWarehouse: 30,
    InTransit: 40,
    AtDestinationWarehouse: 50,
    OutForDelivery: 60,
    Delivered: 70,
    Cancelled: 99,
  };

  const currentRank = statusRank[order.status] ?? 0;

  // Driver-centric steps
  const steps = [
    { title: "Order Assigned", sub: "Assigned to you", rank: 10 },
    { title: "Picked Up", sub: "Courier picked package", rank: 20 },
    { title: "In Transit", sub: "Package on the move", rank: 40 },
    { title: "Out for Delivery", sub: "You are en route", rank: 60 },
    { title: "Delivered", sub: "Package delivered", rank: 70 },
  ];

  /* ---------------- PRIORITY BADGE COLOR ---------------- */
  const getPriorityBadgeColor = (aiPriority) => {
    if (!aiPriority) return "bg-gray-800 text-gray-300";
    if (aiPriority === 5) return "bg-red-500/20 text-red-500";
    if (aiPriority === 4) return "bg-orange-500/20 text-orange-500";
    if (aiPriority === 3) return "bg-yellow-500/20 text-yellow-500";
    if (aiPriority === 2) return "bg-blue-500/20 text-blue-500";
    return "bg-green-500/20 text-green-500";
  };

  return (
    <div className="min-h-screen flex bg-[#0b0f14] text-slate-100">
      <DriverSidebar active="deliveries" />

      <div className="flex-1 overflow-y-auto px-10 py-8 space-y-10">

        {/* HEADER */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/driver/deliveries")}
              className="text-slate-400 hover:text-[#ff8a3d]"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-black">Order Details</h1>
          </div>
        </header>

        {/* ALERTS SECTION (Driver Specific) */}
        <div className="max-w-4xl space-y-4">
          {order.rescheduledAt && (
            <div className="w-full p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-2xl">⏳</span>
                <div>
                  <h3 className="font-bold text-yellow-500">Rescheduled Order</h3>
                  <p className="text-sm text-slate-300">
                    New Date: <span className="text-white">{new Date(order.rescheduledAt).toLocaleString()}</span>
                  </p>
                </div>
              </div>
              {order.rescheduleReason && (
                <span className="text-xs text-slate-400 bg-black/20 px-3 py-1 rounded-full">Reason: {order.rescheduleReason}</span>
              )}
            </div>
          )}
        </div>


        {/* MAIN CARD (Glassmorphism - Copied from Customer) */}
        <div className="max-w-4xl bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">

          {/* SHIPMENT INFO */}
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
                      <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
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
                <h4 className="font-bold text-slate-400 text-lg tracking-wider">Priority</h4>
                 <div className="mt-1">
                    {order.aiPriority ? (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getPriorityBadgeColor(order.aiPriority)}`}>
                            AI Priority: {order.aiPriority}/5
                        </span>
                    ) : <span className="text-slate-500 text-sm">Normal</span>}
                 </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10" />

            {/* ADDRESS INFO - Driver Specific View */}
          <div className="p-8 space-y-6">
             <h2 className="text-xl font-bold">Addresses</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                     <h4 className="font-semibold text-[#ff8a3d] mb-1 flex items-center gap-2">
                        Receiver (Customer)
                     </h4>
                     <p className="text-white text-lg font-bold">{order.customerName}</p>
                     <p className="text-slate-400 text-sm mb-4 leading-relaxed">{order.receiverAddress}</p>
                </div>

                <div>
                     <h4 className="font-semibold text-blue-400 mb-1">Sender (Pickup)</h4>
                     <p className="text-white text-lg font-bold">{order.senderName}</p>
                     <p className="text-slate-400 text-sm mb-4 leading-relaxed">{order.pickupAddress}</p>
                </div>
             </div>
          </div>


          <div className="border-t border-white/10" />

          {/* ASR VERIFICATION SECTION */}
          {order.isASR && (
            <>
              <div className={`mx-8 mb-8 rounded-2xl border backdrop-blur-md overflow-hidden transition-all ${
                 order.asrStatus === 'Success' 
                 ? 'bg-green-500/5 border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.1)]' 
                 : 'bg-orange-500/5 border-orange-500/20 shadow-[0_0_30px_rgba(255,138,61,0.1)]'
              }`}>
                <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl flex items-center justify-center shrink-0 ${
                            order.asrStatus === 'Success' ? 'bg-green-500/10 text-green-400' : 'bg-[#ff8a3d]/10 text-[#ff8a3d]'
                        }`}>
                            <ShieldCheck size={28} strokeWidth={1.5} />
                        </div>
                        <div>
                             <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                ASR Verification Required
                                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide border ${
                                    order.asrStatus === 'Success' 
                                    ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                                    : (order.asrStatus === 'Failed' 
                                        ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                                        : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20')
                                }`}>
                                    {order.asrStatus || 'Pending'}
                                </span>
                            </h2>
                        </div>
                    </div>

                  {order.asrStatus !== "Success" && (
                    <button
                      onClick={() => setShowASRModal(true)}
                       className="hidden md:flex whitespace-nowrap px-6 py-2.5 rounded-xl bg-[#ff8a3d] text-black font-bold text-sm hover:bg-[#ff9f63] hover:shadow-[0_0_20px_rgba(255,138,61,0.3)] transition-all items-center gap-2 group"
                    >
                      <ShieldCheck size={16} className="group-hover:scale-110 transition-transform"/>
                      Verify ASR
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                     <p className="text-slate-400 text-sm leading-relaxed mb-6">
                        This order contains age-restricted items. An adult signature and valid government-issued ID proof are required upon delivery to ensure compliance with local regulations.
                    </p>

                    {/* Mobile Button */}
                     {order.asrStatus !== "Success" && (
                        <button
                          onClick={() => setShowASRModal(true)}
                          className="md:hidden w-full mb-6 py-3 rounded-xl bg-[#ff8a3d] text-black font-bold text-sm hover:bg-[#ff9f63] shadow-[0_0_10px_rgba(255,138,61,0.2)] flex justify-center items-center gap-2"
                        >
                          <ShieldCheck size={16} />
                          Verify ASR
                        </button>
                       )}

                  {order.asrStatus === 'Success' ? (
                    <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm font-bold">
                        <Check size={16} /> Verification successful. You can proceed with delivery.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {order.asrStatus === 'Failed' && (
                         <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm font-bold">
                           <span className="text-lg">!</span> Verification Failed. Please try again or check the ID document.
                         </div>
                      )}

                      <div>
                        <h4 className="font-bold text-slate-400 text-lg tracking-wider">Instructions</h4>
                        <p className="text-slate-400 text-sm mt-1">
                          Check customer ID and verify age (21+). Take a clear photo of the ID.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              </div>
              <div className="border-t border-white/10" />
            </>
          )}

          {/* TIMELINE */}
          <div className="p-8">
            <h3 className="text-sm uppercase tracking-widest text-slate-400 mb-6">
              Tracking Timeline
            </h3>

            <div className="relative space-y-10">
              {steps.map((s, i) => {
                const active = currentRank >= s.rank;
                const current = active && (steps[i + 1]?.rank ?? 999) > currentRank;

                return (
                  <div key={i} className="flex gap-6 relative">
                    {i !== steps.length - 1 && (
                      <div className="absolute left-[7px] top-4 bottom-[-40px] w-[2px] bg-white/30" />
                    )}

                    <div className={`relative z-10 w-4 h-4 mt-1.5 rounded-full ${current ? "bg-[#ff8a3d]" : active ? "bg-white/70" : "bg-white/20"}`}>
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

        </div>

        {/* ACTIONS - Separated & Smaller */}
        <div className="max-w-4xl flex gap-3 flex-wrap">
          {(order.status === "OutForDelivery" || order.status === "Out for delivery") && (
            <button
              onClick={() => setShowCompleteModal(true)}
              className="px-6 py-3 rounded-xl bg-green-500/20 backdrop-blur-md border border-green-500/50 text-green-400 font-bold hover:bg-green-500/30 shadow-lg shadow-green-500/10 transition-all flex-1 md:flex-none"
            >
              Complete Delivery
            </button>
          )}

          <button className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm flex-1 md:flex-none">
            Report Issue
          </button>
        </div>
      </div>

      {/* ASR MODAL */}
      {showASRModal && (
        <DriverASRVerification
          orderId={order.id}
          onClose={() => {
            setShowASRModal(false);
            fetchOrder();
          }}
        />
      )}

      {/* COMPLETE DELIVERY MODAL */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-[#0b0f14] border border-white/10 p-8 rounded-3xl w-full max-w-sm space-y-6">
            <h3 className="text-xl font-bold text-center">Update Order Status</h3>

            <div className="space-y-4">
              <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${selectedStatus === "Delivered" ? "bg-green-500/20 border-green-500 text-white" : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"}`}>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedStatus === "Delivered" ? "border-green-500" : "border-slate-500"}`}>
                  {selectedStatus === "Delivered" && <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
                </div>
                <input
                  type="radio"
                  name="status"
                  value="Delivered"
                  checked={selectedStatus === "Delivered"}
                  onChange={() => setSelectedStatus("Delivered")}
                  className="hidden"
                />
                <span className="font-bold text-lg">Delivered</span>
              </label>

              <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${selectedStatus === "DeliveryAttempted" ? "bg-orange-500/20 border-orange-500 text-white" : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"}`}>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedStatus === "DeliveryAttempted" ? "border-orange-500" : "border-slate-500"}`}>
                  {selectedStatus === "DeliveryAttempted" && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                </div>
                <input
                  type="radio"
                  name="status"
                  value="DeliveryAttempted"
                  checked={selectedStatus === "DeliveryAttempted"}
                  onChange={() => setSelectedStatus("DeliveryAttempted")}
                  className="hidden"
                />
                <span className="font-bold text-lg">Delivery Attempted</span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={saveStatus}
                className="flex-1 py-3 rounded-xl bg-[#ff8a3d] text-black font-bold hover:bg-[#ff9a55] transition shadow-lg shadow-orange-500/20"
              >
                Save Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverOrderDetails;
