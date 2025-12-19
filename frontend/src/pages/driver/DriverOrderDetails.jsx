import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DriverSidebar from "./DriverSidebar";
import api from "../../services/api";

const DriverOrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        fetchOrder();
    }, [id]);

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

                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10 min-w-[120px]">
                            <span className="text-sm text-slate-300 font-medium">Tracking ID:</span>
                            <span className="text-sm font-bold text-white font-mono">{order.trackingId}</span>
                        </div>
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
                        <div className="flex justify-between items-start">
                             <h2 className="text-xl font-bold">Shipment Information</h2>
                             {order.aiPriority && (
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getPriorityBadgeColor(order.aiPriority)}`}>
                                    AI Priority: {order.aiPriority}/5
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="font-semibold text-[#ff8a3d] mb-1">Customer (Receiver)</h4>
                                <p className="text-white text-lg font-bold">{order.customerName}</p>
                                <p className="text-slate-400 text-sm mb-2">{order.receiverAddress}</p>
                                <div className="flex gap-3">
                                    <a href={`tel:${order.customerPhone}`} className="text-xs bg-white/10 px-3 py-1.5 rounded hover:bg-white/20">Call</a>
                                    <a href={`mailto:${order.customerEmail}`} className="text-xs bg-white/10 px-3 py-1.5 rounded hover:bg-white/20">Email</a>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold text-blue-400 mb-1">Sender (Pickup)</h4>
                                <p className="text-white text-lg font-bold">{order.senderName}</p>
                                <p className="text-slate-400 text-sm mb-2">{order.pickupAddress}</p>
                                <div className="flex gap-3">
                                    <a href={`tel:${order.senderPhone}`} className="text-xs bg-white/10 px-3 py-1.5 rounded hover:bg-white/20">Call</a>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 font-semibold pt-4">
                            <span>Status</span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-[#ff8a3d]/20 text-[#ff8a3d] whitespace-nowrap">
                                {order.status === "Pending" && order.rescheduledAt ? "Rescheduled" : order.status}
                            </span>
                        </div>
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

                    <div className="border-t border-white/10" />

                    {/* ACTIONS */}
                    <div className="p-8 flex gap-4">
                        <button className="px-6 py-3 rounded-xl bg-[#ff8a3d] text-black font-bold hover:bg-[#ff8a3d]/90 flex-1 md:flex-none">
                            Open Navigation
                        </button>
                        <button className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold">
                            Report Issue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverOrderDetails;
