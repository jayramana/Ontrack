import { useEffect, useState } from "react";
import api from "../../services/api";
import { X, MapPin, Package, CheckCircle, Clock } from "lucide-react";
import { formatStatus, formatDate } from "@/lib/utils";

const DriverDetailsModal = ({ driverId, onClose }) => {
  const [driverInfo, setDriverInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDriverDetails = async () => {
      try {
        const res = await api.get(`/admin/driver/${driverId}`);
        setDriverInfo(res.data);
      } catch (error) {
        console.error("Error loading driver:", error);
      } finally {
        setLoading(false);
      }
    };
    if (driverId) {
        loadDriverDetails();
    }
  }, [driverId]);

  if (!driverId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Centered Modal */}
      <div className="
        relative
        w-full max-w-4xl
        max-h-[85vh]
        bg-[#0b0f14]/95
        backdrop-blur-2xl
        border border-white/10
        shadow-2xl
        rounded-3xl
        flex flex-col
        animate-in zoom-in-95 duration-200
        overflow-hidden
      ">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 p-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#ff8a3d] mb-4"></div>
          </div>
        ) : !driverInfo ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 p-20">
                Failed to load driver details.
            </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="flex-none px-8 py-6 border-b border-white/10 flex justify-between items-center bg-[#0b0f14]/50">
              <h2 className="text-2xl font-black text-white">
                Driver Profile
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              
              {/* TOP ROW: PROFILE + LOCATION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* PROFILE CARD */}
                <div className="flex items-start gap-6 bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="
                    w-20 h-20 rounded-2xl
                    bg-gradient-to-br from-[#ff8a3d]/20 to-[#ff8a3d]/5
                    border border-[#ff8a3d]/20
                    text-[#ff8a3d]
                    flex items-center justify-center
                    text-3xl font-black
                    shadow-lg shadow-orange-500/10
                    shrink-0
                    ">
                    {driverInfo.driver.userFName?.charAt(0)?.toUpperCase()}
                    </div>

                    <div className="flex-1 pt-1 min-w-0">
                        <h3 className="text-2xl font-bold text-white mb-1 truncate">
                            {driverInfo.driver.userFName} {driverInfo.driver.userLName}
                        </h3>
                        <div className="flex flex-col gap-1 text-sm text-slate-400 mb-3">
                            <span className="truncate">{driverInfo.driver.userEmail}</span>
                            <span className="font-mono text-xs opacity-60">ID: {driverInfo.driver.userId}</span>
                        </div>

                        <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide border
                            ${
                                driverInfo.driver.isAvailable
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : "bg-red-500/10 text-red-400 border-red-500/20"
                            }
                            `}
                        >
                            <div className={`w-1.5 h-1.5 rounded-full ${driverInfo.driver.isAvailable ? "bg-green-400" : "bg-red-400"} animate-pulse`} />
                            {driverInfo.driver.isAvailable ? "Online" : "Busy/Offline"}
                        </span>
                    </div>
                </div>

                {/* LOCATION CARD */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-white flex items-center gap-2">
                            <MapPin size={18} className="text-[#ff8a3d]" /> Current Location
                        </h4>
                        {driverInfo.driver.currentLatitude && (
                             <a
                                href={`https://www.google.com/maps?q=${driverInfo.driver.currentLatitude},${driverInfo.driver.currentLongitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-[#ff8a3d] hover:text-[#ff9f63] hover:underline"
                            >
                                Open Maps ↗
                            </a>
                        )}
                    </div>
                    {driverInfo.driver.currentLatitude ? (
                        <div className="bg-black/40 rounded-xl p-3 font-mono text-xs text-slate-400 flex justify-between mt-auto">
                            <span>LAT: {driverInfo.driver.currentLatitude.toFixed(6)}</span>
                            <span className="w-px h-4 bg-white/10" />
                            <span>LNG: {driverInfo.driver.currentLongitude.toFixed(6)}</span>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                            Location data unavailable
                        </div>
                    )}
                </div>
              </div>


              {/* STATS GRID */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Completed", value: driverInfo.statistics.totalCompleted, icon: <CheckCircle size={18} />, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
                  { label: "Today", value: driverInfo.statistics.todayCompleted, icon: <Clock size={18} />, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
                  { label: "Active", value: driverInfo.statistics.activeDeliveries, icon: <Package size={18} />, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
                ].map((s) => (
                  <div key={s.label} className={`p-4 rounded-2xl border ${s.border} ${s.bg} flex flex-col items-center text-center`}>
                    <div className={`mb-2 ${s.color} opacity-80`}>{s.icon}</div>
                    <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* RECENT ORDERS LIST */}
              <div>
                <h4 className="font-bold text-white mb-4 flex items-center gap-2 text-lg">
                  Recent Activity
                </h4>
                
                {driverInfo.orders.length === 0 ? (
                  <div className="text-center py-10 border border-white/5 rounded-2xl border-dashed text-slate-500">
                    No recent orders found
                  </div>
                ) : (
                    <div className="border border-white/5 rounded-2xl overflow-hidden bg-white/5">
                         <table className="w-full text-left text-sm">
                             <thead className="bg-[#0b0f14]/50 border-b border-white/10 text-xs uppercase text-slate-400">
                                 <tr>
                                     <th className="px-5 py-3 font-bold">Tracking</th>
                                     <th className="px-5 py-3 font-bold">Status</th>
                                     <th className="px-5 py-3 font-bold">Pickup</th>
                                     <th className="px-5 py-3 font-bold">Delivery</th>
                                     <th className="px-5 py-3 font-bold">Date</th>
                                 </tr>
                             </thead>
                             <tbody className="divide-y divide-white/5">
                                {driverInfo.orders.map(order => (
                                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-5 py-3 font-bold text-[#ff8a3d]">#{order.trackingId}</td>
                                        <td className="px-5 py-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                                                order.status === 'Delivered' 
                                                ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            }`}>
                                                {formatStatus(order.status)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-slate-300 truncate max-w-[150px]">{order.pickupAddress}</td>
                                        <td className="px-5 py-3 text-slate-300 truncate max-w-[150px]">{order.receiverAddress}</td>
                                        <td className="px-5 py-3 text-slate-500">{formatDate(order.createdAt)}</td>
                                    </tr>
                                ))}
                             </tbody>
                         </table>
                    </div>
                )}
              </div>

            </div>

            {/* FOOTER ACTIONS */}
            <div className="flex-none p-6 border-t border-white/10 bg-[#0b0f14]/50 flex justify-end">
                <button
                    onClick={onClose}
                    className="px-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 transition-all"
                >
                    Close
                </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DriverDetailsModal;
