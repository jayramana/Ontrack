import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useParams, useNavigate } from "react-router-dom";
import DriverSidebar from "./DriverSidebar";
import api from "../../services/api";
import DriverASRVerification from "./DriverASRVerification";
import { Copy, Check, ShieldCheck } from "lucide-react";
import { formatStatus, formatDate, formatDateTime } from "@/lib/utils";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const DriverOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false); // For accept button
  const [showASRModal, setShowASRModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showAttemptModal, setShowAttemptModal] = useState(false);
  const [attemptReason, setAttemptReason] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Delivered");
  const [copied, setCopied] = useState(false);
  const [confirmData, setConfirmData] = useState({
        open: false,
        title: "",
        desc: "",
        action: null
    });

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
    // if (!window.confirm("Confirm delivery?")) return;
    setConfirmData({
        open: true,
        title: "Confirm Delivery",
        desc: "Are you sure you want to mark this order as Delivered? This action cannot be undone.",
        action: async () => {
            await api.post(`/driver/mark-delivered/${id}`);
            fetchOrder();
        }
    });
  };

  const markAttempted = async () => {
    setAttemptReason("");
    setShowAttemptModal(true);
  };

  const submitAttempted = async () => {
    if (!attemptReason.trim()) return toast.error("Reason is required");
    try {
        await api.post(`/driver/mark-attempted/${id}`, { reason: attemptReason });
        setShowAttemptModal(false);
        fetchOrder();
    } catch(err) {
        toast.error("Failed to update status");
    }
  };

  const handleAcceptAssignment = async () => {
     try {
        setBtnLoading(true);
        await api.post(`/driver/accept/${id}`);
        fetchOrder(); 
     } catch(err) {
        console.error(err);
        toast.error("Failed to accept order");
     } finally {
        setBtnLoading(false);
     }
  };

  const handlePickup = async () => {
     // if(!window.confirm(`Confirm you have picked up the order from ${order.currentWarehouse?.name || 'the warehouse'}?`)) return;
      setConfirmData({
        open: true,
        title: "Confirm Pickup",
        desc: `Confirm you have picked up the order from ${order.currentWarehouse?.name || 'the warehouse'}?`,
        action: async () => {
            try {
                setBtnLoading(true);
                await api.post(`/driver/pickup/${id}`);
                fetchOrder();
             } catch(err) {
                console.error(err);
                toast.error("Failed to update status");
             } finally {
                setBtnLoading(false);
             }
        }
    });
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
    ReturnedToWarehouse: 65,
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
    <div className="min-h-screen flex bg-[#0b0f14] text-slate-100" style={{ backgroundImage: 'none', backgroundColor: '#0b0f14' }}>
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
                    New Date: <span className="text-white">{formatDateTime(order.rescheduledAt)}</span>
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
        <div className="max-w-4xl bg-[#1a1f29] rounded-3xl border border-white/10 overflow-hidden">

          {/* SHIPMENT INFO */}
          <div className="p-8 space-y-6">
            <h2 className="text-xl font-bold">Order Details</h2>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <h4 className="font-bold text-slate-400 text-lg">Order Name</h4>
                <p className="text-white font-medium text-base">Order-{order.id}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-400 text-lg">Tracking ID</h4>
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
                <h4 className="font-bold text-slate-400 text-lg">Weight</h4>
                <p className="text-white font-medium text-base">{order.weight} kg</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-400 text-lg">Price</h4>
                <p className="text-white font-medium text-base">₹{order.price}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-400 text-lg">Type</h4>
                <div className="mt-1">
                  {order.deliveryType === 'Express' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-200 to-yellow-500 text-black text-xs font-bold shadow-lg shadow-amber-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                      Express
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700">
                      Normal
                    </span>
                  )}
                </div>
              </div>

               <div>
                <h4 className="font-bold text-slate-400 text-lg">Priority</h4>
                 <div className="mt-1">
                    {order.aiPriority ? (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityBadgeColor(order.aiPriority)}`}>
                            AI Priority: {order.aiPriority}/5
                        </span>
                    ) : <span className="text-slate-500 text-sm">Normal</span>}
                 </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10" />

          {/* SHIPMENT INFO */}
          <div className="p-8 space-y-6">
             <h2 className="text-xl font-bold">Shipment Information</h2>
             
             <div>
                <h4 className="font-semibold text-slate-300">From</h4>
                <p className="text-slate-400 text-lg font-medium">{order.senderName}</p>
                <p className="text-slate-500 text-sm">{order.pickupAddress}</p>
             </div>

             <div>
                <h4 className="font-semibold text-slate-300">To</h4>
                <p className="text-slate-400 text-lg font-medium">{order.customerName}</p>
                <p className="text-slate-500 text-sm">{order.receiverAddress}</p>
             </div>
          </div>


          <div className="" />

          {/* ASR VERIFICATION SECTION */}
          {order.isASR && (
            <>
              <div className={`mx-8 mb-8 rounded-2xl border backdrop-blur-md overflow-hidden transition-all ${
                 order.asrStatus === 'Success' || order.asrStatus === 'AdminOverride'
                 ? 'bg-green-500/5 border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.1)]' 
                 : 'bg-orange-500/5 border-orange-500/20 shadow-[0_0_30px_rgba(255,138,61,0.1)]'
              }`}>
                <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl flex items-center justify-center shrink-0 ${
                            order.asrStatus === 'Success' || order.asrStatus === 'AdminOverride' ? 'bg-green-500/10 text-green-400' : 'bg-[#ff8a3d]/10 text-[#ff8a3d]'
                        }`}>
                            <ShieldCheck size={28} strokeWidth={1.5} />
                        </div>
                        <div>
                             <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                ASR Verification Required
                                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                                    order.asrStatus === 'Success' || order.asrStatus === 'AdminOverride'
                                    ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                                    : (order.asrStatus === 'Failed' 
                                        ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                                        : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20')
                                }`}>
                                    {formatStatus(order.asrStatus || 'Pending')}
                                </span>
                            </h2>
                        </div>
                    </div>

                  {(order.asrStatus !== "Success" && order.asrStatus !== "AdminOverride") && (
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
                     {(order.asrStatus !== "Success" && order.asrStatus !== "AdminOverride") && (
                        <button
                          onClick={() => setShowASRModal(true)}
                          className="md:hidden w-full mb-6 py-3 rounded-xl bg-[#ff8a3d] text-black font-bold text-sm hover:bg-[#ff9f63] shadow-[0_0_10px_rgba(255,138,61,0.2)] flex justify-center items-center gap-2"
                        >
                          <ShieldCheck size={16} />
                          Verify ASR
                        </button>
                       )}

                  {(order.asrStatus === 'Success' || order.asrStatus === 'AdminOverride') ? (
                    <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm font-bold">
                        <Check size={16} /> 
                        {order.asrStatus === 'AdminOverride' 
                          ? "Verification overridden by Admin. You can proceed with delivery." 
                          : "Verification successful. You can proceed with delivery."}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {order.asrStatus === 'Failed' && (
                         <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm font-bold">
                           <span className="text-lg">!</span> Verification Failed. Please try again or check the ID document.
                         </div>
                      )}

                      <div>
                        <h4 className="font-bold text-slate-400 text-lg">Instructions</h4>
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
            <h3 className="text-sm text-slate-400 mb-6">
              Tracking Status
            </h3>

            <div className="relative pl-4">
               {/* Step 1: Assigned */}
               <TimelineStep 
                  title="Order Assigned"
                  sub="You have been assigned this order"
                  active={currentRank >= 10}
                  completed={currentRank >= 50}
                  isFirst={true}
                  color="orange"
                  isCurrent={currentRank >= 10 && currentRank < 50}
               >
                   {/* ACTION BUTTON: Accept Assignment */}
                   {order.status === 'Assigned' && (
                        <div className="mt-4 mb-4">
                            <button 
                                onClick={handleAcceptAssignment}
                                disabled={btnLoading}
                                className="px-4 py-2 rounded-lg bg-[#ff8a3d] text-black text-sm font-bold hover:bg-[#ff9a55] transition shadow-lg shadow-orange-500/20 disabled:opacity-50 flex items-center gap-2"
                            >
                                {btnLoading ? "Accepting..." : "Accept Order"}
                            </button>
                            <p className="text-xs text-slate-500 mt-2">
                                Accept this assignment to proceed.
                            </p>
                        </div>
                   )}
               </TimelineStep>

               {/* Step 2: At Destination Warehouse (Pickup) */}
               <TimelineStep 
                  title="At Destination Warehouse"
                  sub="Order needs to be picked up"
                  active={currentRank >= 50}
                  completed={currentRank >= 60}
                  color="orange"
                  isCurrent={currentRank >= 50 && currentRank < 60}
               >
                   {/* ACTION BUTTON: Picked from Warehouse */}
                   {order.status === 'AtDestinationWarehouse' && (
                        <div className="mt-4 mb-4">
                            <button 
                                onClick={handlePickup}
                                disabled={btnLoading}
                                className="px-4 py-2 rounded-lg bg-[#ff8a3d] text-black text-sm font-bold hover:bg-[#ff9a55] transition shadow-lg shadow-orange-500/20 disabled:opacity-50 flex items-center gap-2"
                            >
                                {btnLoading ? "Updating..." : "Picked from Warehouse?"}
                            </button>
                            <p className="text-xs text-slate-500 mt-2">
                                Click confirming you have collected the package.
                            </p>
                        </div>
                   )}
               </TimelineStep>

               {/* Step 3: Out For Delivery */}
               <TimelineStep 
                  title="Out For Delivery"
                  sub="You are on the way to the customer"
                  active={currentRank >= 60}
                  completed={currentRank >= 70} // Delivered is 70
                  color="orange"
                  isCurrent={currentRank >= 60 && currentRank < 65}
               />

               {/* Step 4: Delivered / Attempted */}
               <TimelineStep 
                  title={order.status === "DeliveryAttempted" ? "Delivery Attempted" : "Delivered"}
                  sub={order.status === "DeliveryAttempted" ? "Delivery was attempted but failed" : "Package delivered successfully"}
                  active={currentRank >= 65}
                  completed={currentRank >= 70}
                  isLast={true}
                  color={order.status === "DeliveryAttempted" ? "red" : "green"}
                  isCurrent={currentRank >= 65}
               />
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

      {/* ATTEMPT REASON MODAL */}
      {showAttemptModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-[#0b0f14] border border-white/10 p-8 rounded-3xl w-full max-w-sm space-y-6">
            <h3 className="text-xl font-bold text-center">Delivery Attempt Failed</h3>
            <p className="text-sm text-slate-400 text-center">Please provide a reason for the failed delivery.</p>
            
            <textarea
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-[#ff8a3d]"
                rows="3"
                placeholder="E.g., Customer not home, Wrong address..."
                value={attemptReason}
                onChange={(e) => setAttemptReason(e.target.value)}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowAttemptModal(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={submitAttempted}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition shadow-lg shadow-red-500/20"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DIALOG */}
      <AlertDialog open={confirmData.open} onOpenChange={(open) => setConfirmData(prev => ({ ...prev, open }))}>
        <AlertDialogContent className="bg-[#1a1f29] border border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">{confirmData.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              {confirmData.desc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-[#ff8a3d] text-black hover:bg-[#ff8a3d]/90 font-bold border-none"
              onClick={confirmData.action}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DriverOrderDetails;

/* ---------------- HELPERS ---------------- */

function TimelineStep({ title, sub, active, completed, isFirst, isLast, color = "green", hasExpand, expanded, onToggle, date, isCurrent, children }) {

  // Status Colors
  const getColors = () => {
    if (!active) return "bg-[#0b0f14] border-slate-600";
    if (color === "red") return "bg-red-500 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]";
    if (color === "orange") return "bg-[#ff8a3d] border-[#ff8a3d] shadow-[0_0_10px_rgba(255,138,61,0.5)]";
    return "bg-green-500 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]";
  };

  const getLineColor = () => {
    if (!completed) return "bg-white/10";
    if (color === "red") return "bg-red-500";
    if (color === "orange") return "bg-[#ff8a3d]";
    return "bg-green-500";
  }

  const getTextColor = () => {
    if (!active) return "text-slate-500";
    if (color === "red") return "text-red-400";
    if (color === "orange") return "text-[#ff8a3d]";
    return "text-white";
  }

  return (
    <div className="relative flex gap-6 z-10 min-h-[80px]">
      {/* Status Dot Column */}
      <div className="flex flex-col items-center">
        <div className="relative flex items-center justify-center">
          {/* Pulsing Effect for Current Step */}
          {isCurrent && active && (
            <div className={`absolute w-full h-full rounded-full animate-ping opacity-75 ${color === "red" ? "bg-red-500" : (color === "orange" ? "bg-[#ff8a3d]" : "bg-green-500")
              }`} />
          )}

          <div
            className={`w-4 h-4 rounded-full border-2 z-20 flex-shrink-0 transition-all duration-500 ${getColors()}`}
            onClick={hasExpand ? onToggle : undefined}
          />
        </div>

        {/* Connecting Line (Colored Segment) below */}
        {!isLast && (
          <div className={`w-[2px] flex-1 -my-1 transition-colors duration-500 ${getLineColor()}`} />
        )}
      </div>

      {/* Content Column */}
      <div className={`-mt-1.5 flex-1 ${isLast ? '' : 'pb-10'}`}>
        <div
          className={`flex items-center gap-2 ${hasExpand ? "cursor-pointer group" : ""}`}
          onClick={hasExpand ? onToggle : undefined}
        >
          <h4 className={`font-bold text-lg transition-colors duration-300 ${getTextColor()} ${hasExpand ? "group-hover:text-white" : ""}`}>
            {title}
          </h4>
          {hasExpand && (
            <span className={`text-slate-500 transition-transform duration-300 ${expanded ? "rotate-90" : ""}`}>
              ▶
            </span>
          )}
        </div>
        <TimelineParams date={date} isCompleted={completed} isCurrent={isCurrent} />
        <p className={`text-sm mt-1 ${active ? "text-slate-300" : "text-slate-600"}`}>
          {sub}
        </p>

        {/* Render Nested Children here so layout stretches and line continues */}
        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
};

function NestedTimelineStep({ title, active, completed, isCurrent }) {
  return (
    <div className="relative flex gap-4 items-center">
      <div className="relative flex items-center justify-center">
        {isCurrent && active && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-[#ff8a3d] opacity-75 animate-ping"></span>
        )}
        <div className={`w-2.5 h-2.5 rounded-full border z-10 ${active ? "bg-[#ff8a3d] border-[#ff8a3d]" : "bg-transparent border-slate-600"
          }`} />
      </div>

      <h5 className={`font-semibold text-sm ${active ? "text-white" : "text-slate-500"}`}>
        {title}
      </h5>
    </div>
  );
}

function TimelineParams({ date, isCompleted, isCurrent }) {
    if (!date && !isCompleted && !isCurrent) return null;

    if (date) {
        return (
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                {formatDateTime(date)}
            </p>
        );
    }
    
    return null;
}
