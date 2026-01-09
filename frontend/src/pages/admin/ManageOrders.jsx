import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import AdminSidebar from "./AdminSidebar";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import OrderDetailsModal from "./OrderDetailsModal";
import DriverDetailsModal from "./DriverDetailsModal";
import {
  ClipboardList,
  Truck,
  Calendar,
  User,
  Search,
  Filter,
  Package,
  CheckCircle,
  AlertTriangle,
  MapPin
} from "lucide-react";
import { formatStatus, formatDate } from "@/lib/utils";

export default function ManageOrders() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("unassigned"); // "unassigned" | "assigned"
  
  const [allOrders, setAllOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  
  // Derived state
  const [unassignedOrders, setUnassignedOrders] = useState([]);
  const [assignedOrders, setAssignedOrders] = useState([]);

  // UI State
  const [selectedDrivers, setSelectedDrivers] = useState({});
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, driversRes] = await Promise.all([
        api.get("/orders/admin/all"),
        api.get("/admin/drivers"),
      ]);

      const orders = (ordersRes.data || []).map((o) => {
        const rawStatus = o.status || o.orderStatus;
        return {
          ...o,
          status: rawStatus || "Pending",
          isASR: o.isASR || rawStatus?.toLowerCase().includes("asr"),
          createdAt: o.createdAt || o.created_at,
          driverId: o.driverId || o.driver?.userId || o.driver?.id,
        };
      });

      setAllOrders(orders);
      setDrivers(driversRes.data || []);

      // Filter
      const pending = orders.filter(o =>
        ["Pending", "Approved", "AtOriginWarehouse", "ReturnedToWarehouse"].includes(o.status)
      );
      const assigned = orders.filter(o =>
        ["Assigned", "In Transit", "OutForDelivery", "Out for delivery", "Delivered"].includes(o.status)
      );

      setUnassignedOrders(pending);
      setAssignedOrders(assigned);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (orderId) => {
    const driverId = selectedDrivers[orderId];
    if (!driverId) {
      toast.error("Please select a driver first");
      return;
    }
    
    try {
      await api.post(`/admin/assign-driver/${orderId}/${driverId}`);
      // Optimistic update or refetch
      fetchData(); 
      toast.success("Driver assigned successfully");
    } catch (error) {
      console.error("Assign failed", error);
      toast.error("Failed to assign driver");
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0b0f14] text-white font-sans">
      <AdminSidebar active="manage-orders" />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* HEADER */}
        <header className="flex-none bg-[#0b0f14] border-b border-white/10 px-8 py-5 flex justify-between items-center sticky top-0 z-30">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <ClipboardList className="text-[#f9b400]" size={32} />
              Manage Orders
            </h1>
            <p className="text-gray-400 mt-1">Assign drivers and track active shipments</p>
          </div>
        </header>

        {/* CONTROLS */}
        <div className="flex-none px-8 py-6">
          <div className="flex bg-[#1a1f29] p-1 rounded-xl border border-white/10 w-fit">
            <button
              onClick={() => setActiveTab("unassigned")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === "unassigned"
                  ? "bg-[#f9b400]/20 text-[#f9b400] shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <ClipboardList size={18} />
              Unassigned
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${activeTab === 'unassigned' ? 'bg-[#f9b400] text-black' : 'bg-white/10 text-gray-300'}`}>
                {unassignedOrders.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("assigned")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === "assigned"
                  ? "bg-blue-500/20 text-blue-400 shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Truck size={18} />
              Assigned
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${activeTab === 'assigned' ? 'bg-blue-500 text-white' : 'bg-white/10 text-gray-300'}`}>
                {assignedOrders.length}
              </span>
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
          {loading ? (
             <div className="flex items-center justify-center h-64">
               <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#f9b400]"></div>
             </div>
          ) : (
            <>
              {activeTab === "unassigned" && (
                <div className="flex flex-col gap-4">
                  {unassignedOrders.map(o => (
                    <div
                      key={o.id}
                      className="bg-[#161b22] p-5 rounded-xl border border-white/10 hover:border-[#f9b400]/50 transition-all group flex flex-col justify-between shadow-lg shadow-black/20"
                      onClick={() => {
                        setSelectedOrderId(o.id);
                        setShowOrderModal(true);
                      }}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                             <div className="p-2.5 bg-[#f9b400]/10 rounded-lg text-[#f9b400]">
                                <Package size={20} />
                             </div>
                             <div>
                                <h3 className="font-bold text-white text-lg group-hover:text-[#f9b400] transition-colors">Order #{o.id}</h3>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                  <Calendar size={12} /> {formatDate(o.createdAt)}
                                </p>
                             </div>
                          </div>
                          <span className="text-xs px-2.5 py-1 bg-[#f9b400]/10 text-[#f9b400] border border-[#f9b400]/20 rounded-md font-bold  tracking-wider">
                            {formatStatus(o.status)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-4 mb-4">
                            <div className="bg-white/5 p-3 rounded-lg">
                                <p className="text-xs text-gray-500  tracking-wide font-bold mb-1">Pickup</p>
                                <p className="text-sm text-gray-300 truncate">{o.pickupAddress}</p>
                            </div>
                            <div className="bg-white/5 p-3 rounded-lg">
                                <p className="text-xs text-gray-500  tracking-wide font-bold mb-1">Dropoff</p>
                                <p className="text-sm text-gray-300 truncate">{o.receiverAddress}</p>
                            </div>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-2 items-end">
                        <div className="flex-1 relative">
                          <label className="text-xs text-gray-500 font-bold mb-1.5 block">Assign Driver</label>
                          <div className="relative">
                            <select
                                className="w-full bg-[#0b0f14] text-gray-300 text-sm pl-3 pr-8 py-2.5 rounded-lg border border-white/10 appearance-none focus:border-[#f9b400] focus:ring-1 focus:ring-[#f9b400] focus:outline-none transition-all cursor-pointer hover:bg-[#1a1f29]"
                                onClick={e => e.stopPropagation()}
                                onChange={e =>
                                setSelectedDrivers({ ...selectedDrivers, [o.id]: e.target.value })
                                }
                                value={selectedDrivers[o.id] || ""}
                            >
                                <option className="bg-[#0b0f14] text-white" value="" disabled>Select a driver...</option>
                                {drivers.map(d => (
                                <option className="bg-[#0b0f14] text-white" key={d.userId} value={d.userId}>
                                    {d.userFName} {d.userLName} ({d.isOnline ? "Online" : "Offline"})
                                </option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-3 text-gray-500 pointer-events-none">
                                <User size={14} />
                            </div>
                          </div>
                        </div>

                        <button
                          className="bg-[#f9b400]/10 hover:bg-[#f9b400] text-[#f9b400] hover:text-black border border-[#f9b400]/50 px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg hover:shadow-[#f9b400]/20 h-[42px]"
                          onClick={e => {
                            e.stopPropagation();
                            handleAssign(o.id);
                          }}
                        >
                          Assign
                        </button>
                      </div>
                    </div>
                  ))}
                  {unassignedOrders.length === 0 && (
                      <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500 border border-white/5 rounded-2xl border-dashed">
                          <ClipboardList size={48} className="mb-4 opacity-20" />
                          <p className="text-lg font-medium">No unassigned orders found</p>
                          <p className="text-sm opacity-60">All orders have been assigned to drivers.</p>
                      </div>
                  )}
                </div>
              )}

              {activeTab === "assigned" && (
                <div className="flex flex-col gap-4">
                  {assignedOrders.map(o => (
                    <div
                      key={o.id}
                      className="bg-[#161b22] p-5 rounded-xl border border-white/10 hover:border-blue-500/50 transition-all cursor-pointer group flex flex-col justify-between shadow-lg shadow-black/20"
                      onClick={() => {
                        setSelectedOrderId(o.id);
                        setShowOrderModal(true);
                      }}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-400">
                              <Truck size={20} />
                            </div>
                            <div>
                              <h3 className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors">Order #{o.id}</h3>
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                {o.isASR ? (
                                    <span className="text-purple-400 flex items-center gap-1 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">ASR Secure</span>
                                ) : (
                                    <span>Standard Delivery</span>
                                )}
                              </p>
                            </div>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-md font-bold border ${
                            o.status === "Delivered" 
                            ? "bg-green-500/10 text-green-400 border-green-500/20" 
                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          }`}>
                            {formatStatus(o.status)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="bg-white/5 p-3 rounded-lg">
                                <p className="text-xs text-gray-500  tracking-wide font-bold mb-1">Driver</p>
                                <p className="text-sm text-gray-300 font-medium">
                                    {drivers.find(d => String(d.userId) === String(o.driverId))?.userFName || "Unknown"}
                                </p>
                            </div>
                            <div className="bg-white/5 p-3 rounded-lg">
                                <p className="text-xs text-gray-500  tracking-wide font-bold mb-1">Scheduled Date</p>
                                <p className="text-sm text-gray-300 font-medium truncate">
                                    {o.scheduledDate ? formatDate(o.scheduledDate) : "Not Scheduled"}
                                </p>
                            </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center bg-[#0b0f14]/50 -mx-5 -mb-5 px-5 py-3 rounded-b-xl">
                        <div className="text-xs text-gray-500 font-mono">
                          ID: {o.driverId ? `DRV-${String(o.driverId).substring(0,8)}...` : "N/A"}
                        </div>
                        <button
                          className="text-blue-400 hover:text-white text-xs font-bold flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg hover:bg-blue-500 transition-all"
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedDriverId(o.driverId);
                            setShowDriverModal(true);
                          }}
                        >
                          <User size={14} /> View Driver Profile
                        </button>
                      </div>
                    </div>
                  ))}
                  {assignedOrders.length === 0 && (
                      <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500 border border-white/5 rounded-2xl border-dashed">
                          <Truck size={48} className="mb-4 opacity-20" />
                          <p className="text-lg font-medium">No active assigned orders</p>
                          <p className="text-sm opacity-60">Assign orders from the Unassigned tab to see them here.</p>
                      </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showOrderModal && (
        <OrderDetailsModal
          orderId={selectedOrderId}
          onClose={() => setShowOrderModal(false)}
        />
      )}

      {showDriverModal && (
        <DriverDetailsModal
          driverId={selectedDriverId}
          onClose={() => setShowDriverModal(false)}
        />
      )}
    </div>
  );
}
