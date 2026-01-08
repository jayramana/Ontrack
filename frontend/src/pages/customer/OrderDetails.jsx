import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useParams, useNavigate } from "react-router-dom";
import CustomerSidebar from "./CustomerSidebar";
import api, { API_BASE_URL } from "../../services/api";
import * as signalR from "@microsoft/signalr";
import { Copy, Check, ShieldCheck, Zap, Clock, Hourglass, CheckCircle } from "lucide-react";
import { formatStatus, formatDate, formatDateTime } from "@/lib/utils";
import CustomerASRUpload from "./CustomerASRUpload";

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

  const [showASRModal, setShowASRModal] = useState(false);

  const [eta, setEta] = useState(null);

  const [confirmData, setConfirmData] = useState({
    open: false,
    title: "",
    desc: "",
    action: null
  });

  const [requestingReverify, setRequestingReverify] = useState(null);

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
    DeliveryAttempted: 65,
    ReturnedToWarehouse: 65,
    Delivered: 70,
  };

  const [expandedAssigned, setExpandedAssigned] = useState(false);

  // Auto-expand if current status is within the nested group
  useEffect(() => {
    if (order && ["AtOriginWarehouse", "InTransit", "AtDestinationWarehouse", "Picked"].includes(order.status)) {
      setExpandedAssigned(true);
    }
  }, [order?.status]);

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
      setOrder({
        ...res.data.order,
        scheduledDate: res.data.scheduledDate || res.data.order.scheduledDate
      });
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

    // Listen for any ASR status changes to refresh the UI
    const refreshEvents = [
      "ASRRetryRequested",
      "ASRResetRequested",
      "ASRVerificationCompleted",
      "ASRVerificationFailed",
      "ASRRequestInitiated"
    ];

    refreshEvents.forEach(evt => {
      conn.on(evt, (data) => {
        // If we have an order loaded and this event is for us (typically these events contain orderId)
        // We can just bluntly refresh if we are on this page.
        // Or check data.orderId if available.
        if (data && data.orderId == id) {
          fetchOrderDetails();
        } else {
          // Fallback refresh for robustness
          fetchOrderDetails();
        }
      });
    });

    await conn.start();

    // Join Customer Group
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.userId) {
      await conn.invoke("JoinCustomerGroup", user.userId);
    }

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
  const currentRank = statusRank[order.status] ?? 0;

  const showASRButton = order.isASR && ["NotStarted", "Pending"].includes(order.asrStatus);

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
            </h1>
          </div>

        </header>

        {/* MAIN CARD */}
        <div className="max-w-4xl bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">

          {/* ORDER DETAILS */}
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
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-200 to-yellow-500 text-black text-xs font-bold tracking-wide shadow-lg shadow-amber-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                      Express
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold tracking-wide border border-slate-700">
                      Normal
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-400 text-lg">ASR Required</h4>
                <p className={`font-medium text-base ${order.isASR ? 'text-[#ff8a3d]' : 'text-slate-500'}`}>
                  {order.isASR ? 'Yes' : 'No'}
                </p>
              </div>

              {order.deliveredAt && (
                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <h4 className="font-semibold text-green-400">Delivered Successfully</h4>
                    <p className="text-sm text-green-300/80">
                      Package was delivered on {formatDateTime(order.deliveredAt)}
                    </p>
                  </div>
                </div>
              )}
              {eta && !["Delivered", "DeliveryAttempted"].includes(order.status) && (
                <div className="col-span-2 mt-4">
                  <h4 className="font-bold text-slate-400 text-lg mb-3">Estimated Arrival</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Earliest */}
                    <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl flex items-center gap-4">
                      <div className="p-2 bg-green-500/20 rounded-full text-green-500">
                        <Zap size={20} fill="currentColor" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-green-400/80  tracking-wider">Earliest</p>
                        <p className="text-white font-bold text-lg">{eta?.earliest || (typeof eta === 'string' ? eta : '--')}</p>
                      </div>
                    </div>

                    {/* Likely */}
                    <div className="bg-[#ff8a3d]/10 border border-[#ff8a3d]/20 p-4 rounded-xl flex items-center gap-4">
                      <div className="p-2 bg-[#ff8a3d]/20 rounded-full text-[#ff8a3d]">
                        <Clock size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-orange-400/80  tracking-wider">Likely</p>
                        <p className="text-white font-bold text-lg">{eta?.average || (typeof eta === 'string' ? eta : '--')}</p>
                      </div>
                    </div>

                    {/* Latest */}
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-4">
                      <div className="p-2 bg-red-500/20 rounded-full text-red-500">
                        <Hourglass size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-red-400/80  tracking-wider">Latest</p>
                        <p className="text-white font-bold text-lg">{eta?.latest || (typeof eta === 'string' ? eta : '--')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ASR VERIFICATION SECTION */}
          {order.isASR && order.status !== "Delivered" && (
            <div className={`mx-8 mb-8 rounded-2xl border backdrop-blur-md overflow-hidden transition-all ${order.asrStatus === 'Success'
              ? 'bg-green-500/5 border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.1)]'
              : 'bg-orange-500/5 border-orange-500/20 shadow-[0_0_30px_rgba(255,138,61,0.1)]'
              }`}>
              <div className="p-6 md:p-8">

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl flex items-center justify-center shrink-0 ${order.asrStatus === 'Success' ? 'bg-green-500/10 text-green-400' : 'bg-[#ff8a3d]/10 text-[#ff8a3d]'
                      }`}>
                      <ShieldCheck size={28} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        ASR Verification Required
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold tracking-wide border ${order.asrStatus === 'Success'
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

                  {showASRButton && (
                    <button
                      onClick={() => setShowASRModal(true)}
                      className="hidden md:flex whitespace-nowrap px-6 py-2.5 rounded-xl bg-[#ff8a3d] text-black font-bold text-sm hover:bg-[#ff9f63] hover:shadow-[0_0_20px_rgba(255,138,61,0.3)] transition-all items-center gap-2 group"
                    >
                      <ShieldCheck size={16} className="group-hover:scale-110 transition-transform" />
                      Upload ID Proof
                    </button>
                  )}
                </div>

                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  This is an Adult-signature Required package. A valid signature and a valid government-issued ID proof are required upon delivery to ensure compliance with regulations.
                </p>

                {/* Mobile Button */}
                {showASRButton && (
                  <button
                    onClick={() => setShowASRModal(true)}
                    className="md:hidden w-full mb-6 py-3 rounded-xl bg-[#ff8a3d] text-black font-bold text-sm hover:bg-[#ff9f63] shadow-[0_0_10px_rgba(255,138,61,0.2)] flex justify-center items-center gap-2"
                  >
                    <ShieldCheck size={16} />
                    Upload ID Proof
                  </button>
                )}

                {/* Status Messages */}
                {order.asrStatus === 'Success' && (
                  <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm font-bold">
                    <Check size={16} /> Verification Successful. You're all set!
                  </div>
                )}
                {order.asrStatus === 'Failed' && (
                  <div className="flex flex-col gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 font-bold">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-lg">!</span> Verification Failed. Please try uploading clearer documents.
                    </div>

                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (order.customerReverifyRequested) return;
                        
                        setConfirmData({
                          open: true,
                          title: "Request Re-verification?",
                          desc: "This will notify the admin to manually review your failed verification. Continue?",
                          action: async () => {
                            try {
                              if (!order.asrVerificationId) {
                                toast.error("Verification ID missing. Cannot request.");
                                return;
                              }
                              setRequestingReverify(order.id); // Optimistic UI
                              await api.post(`/asr/customer/request-reverify/${order.asrVerificationId}`);
                              toast.success("Request sent! Admin will review.");
                              
                              // safe reload to sync
                              window.location.reload(); 
                            } catch (err) { 
                                console.error(err);
                                toast.error(err.response?.data?.message || err.message); 
                                setRequestingReverify(null); // Reset on error
                            }
                          }
                        });
                      }}
                      disabled={order.customerReverifyRequested || (requestingReverify === order.id)}
                      className={`
                        px-6 py-2 rounded-xl border font-bold text-sm w-full lg:w-auto transition self-start
                        ${order.customerReverifyRequested
                          ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500 cursor-not-allowed"
                          : "bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-orange-500/20"}
                      `}
                    >
                      {order.customerReverifyRequested ? "Re-verification Requested" : (requestingReverify === order.id ? "Requesting..." : "Request Re-verification")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

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
          </div>

          <div className="border-t border-white/10" />

          {/* TIMELINE */}
          <div className="p-8">
            <h3 className="text-sm text-slate-400 mb-6">
              Tracking Status
            </h3>

            <div className="relative pl-4">
              {/* Step 1: Pending Assignment */}
              <TimelineStep
                title="Pending Assignment"
                sub="Waiting for driver"
                active={true} // Always active as start
                completed={currentRank >= 10}
                isFirst={true}
                color="orange"
                isCurrent={currentRank < 10}
              />

              {/* Step 2: Assigned + Nested */}
              <div className="relative z-10">
                <TimelineStep
                  title="Assigned"
                  sub="Driver has accepted the order"
                  active={currentRank >= 10}
                  completed={currentRank >= 60} // Completed when Out For Delivery
                  hasExpand={true}
                  expanded={expandedAssigned}
                  onToggle={() => setExpandedAssigned(!expandedAssigned)}
                  color="orange"
                  isCurrent={currentRank >= 10 && currentRank < 60}
                >
                  {/* Nested Steps */}
                  {expandedAssigned && (
                    <div className="space-y-6 border-l-2 border-dashed border-white/10 pl-6">
                      <NestedTimelineStep
                        title="At Origin Warehouse"
                        active={currentRank >= 30}
                        completed={currentRank > 30}
                        isCurrent={currentRank === 30}
                      />
                      <NestedTimelineStep
                        title="In Transit"
                        active={currentRank >= 40}
                        completed={currentRank > 40}
                        isCurrent={currentRank === 40}
                      />
                      <NestedTimelineStep
                        title="At Destination Warehouse"
                        active={currentRank >= 50}
                        completed={currentRank > 50}
                        isCurrent={currentRank === 50}
                      />
                    </div>
                  )}
                </TimelineStep>
              </div>

              {/* Step 3: Out For Delivery */}
              <TimelineStep
                title="Out For Delivery"
                sub="Order is on the way"
                active={currentRank >= 60}
                completed={currentRank >= 70} // Delivered is 70
                color="orange"
                isCurrent={currentRank >= 60 && currentRank < 65}
              />

              {/* Step 4: Delivered / Delivery Attempted */}
              <TimelineStep
                title={order.status === "DeliveryAttempted" ? "Delivery Attempted" : "Delivered"}
                sub={order.status === "DeliveryAttempted" ? "Delivery was attempted but failed" : "Package delivered successfully"}
                active={currentRank >= 65} // DeliveryAttempted (65) or Delivered (70)
                completed={currentRank >= 70}
                isLast={true}
                color={order.status === "DeliveryAttempted" ? "red" : "green"} // Keep green/red for final state
                date={order.deliveredAt}
                isCurrent={currentRank >= 65}
              />

            </div>
          </div>


        </div>

        {/* ACTIONS */}
        <div className="max-w-4xl mt-6 flex gap-4">
          {order.status !== "Delivered" && (
            <button
              onClick={() => setShowRescheduleDialog(true)}
              className="px-6 py-3 rounded-xl bg-[#ff8a3d] text-black font-bold"
            >
              Reschedule Delivery
            </button>
          )}
          {["Delivered", "DeliveryAttempted", "AtDestinationWarehouse"].includes(order.status) && (
            <button
              onClick={() => navigate(`/customer/report-issue/${id}`)}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300"
            >
              Report Issue
            </button>
          )}
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
            <p className="text-xs text-orange-400">
              Note: Same-day rescheduling updates the driver's route immediately. Please ensure requests are made before 5:00 PM.
            </p>
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
      {/* ASR MODAL */}
      {showASRModal && (
        <CustomerASRUpload
          orderId={order.id}
          onClose={() => {
            setShowASRModal(false);
            fetchOrderDetails();
          }}
        />
      )}
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

export default OrderDetails;

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
