import React, { useState, useEffect } from "react";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import CustomerSidebar from "./CustomerSidebar";

export default function CustomerGeofenceAlerts() {
  const { user } = useAuth();
  const [geofences, setGeofences] = useState([]);
  const [ordersMap, setOrdersMap] = useState({});
  const [driverStatuses, setDriverStatuses] = useState({});
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const gfRes = await api.get("/geofence/list");
        // Filter: Customer only sees their own geofences
        const myGeofences = gfRes.data.filter((g) => g.ownerUserId === user.userId);

        const ordersRes = await api.get("/orders/my-orders");
        const myOrders = ordersRes.data;

        const oMap = {};
        myOrders.forEach((o) => (oMap[o.id] = o));
        setOrdersMap(oMap);

        const statuses = {};

        for (const gf of myGeofences) {
          const order = oMap[gf.orderId];

          if (order && order.status !== "Delivered" && order.driverId) {
            try {
              const driverRes = await api.get(`/auth/${order.driverId}`);
              const driver = driverRes.data;

              if (driver && driver.currentLatitude && driver.currentLongitude) {
                const checkRes = await api.post("/geofence/check", {
                  DriverId: order.driverId,
                  OrderId: order.id,
                  Lat: driver.currentLatitude,
                  Lon: driver.currentLongitude,
                });
                
                statuses[gf.geofenceId] = {
                  driverName: `${driver.userFName} ${driver.userLName}`,
                  ...checkRes.data,
                };
              } else {
                statuses[gf.geofenceId] = {
                  driverName: driver ? `${driver.userFName} ${driver.userLName}` : "Unknown",
                  error: "Driver location unavailable",
                };
              }
            } catch (err) {
              statuses[gf.geofenceId] = { error: "Status check failed" };
            }
          } else if (!order) {
            statuses[gf.geofenceId] = { error: "Order not found" };
          }
        }

        setGeofences(myGeofences);
        setDriverStatuses(statuses);
      } catch (err) {
        console.error("Failed to load geofence alerts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // 10s poll
    return () => clearInterval(interval);
  }, [user]);

  const activeGeofences = geofences.filter((gf) => {
    const order = ordersMap[gf.orderId];
    return order && order.status !== "Delivered";
  });

  const expiredGeofences = geofences.filter((gf) => {
    const order = ordersMap[gf.orderId];
    return order && order.status === "Delivered";
  });

  // --- UI RENDERERS (Copied from DriverGeofenceAlerts for consistency) ---

  const renderGeofenceCard = (gf) => {
    const status = driverStatuses[gf.geofenceId];
    const isInside = status?.inside;

    return (
      <div
        key={gf.geofenceId}
        className="bg-white border-2 border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
      >
        {/* Logistics Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center group-hover:bg-slate-100 transition">
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">{gf.name}</h3>
            <p className="text-xs text-slate-500 font-mono">ZONE ID: {gf.geofenceId}</p>
          </div>

          <div
            className={`px-3 py-1 rounded text-xs font-bold border uppercase tracking-wider ${
              gf.isActive
                ? "bg-amber-100 text-amber-900 border-amber-300"
                : "bg-gray-100 text-gray-500 border-gray-300"
            }`}
          >
            {gf.isActive ? "Active Monitoring" : "Inactive"}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5">
            <div className="flex justify-between items-center mb-5 text-sm">
                <div className="flex flex-col">
                    <span className="text-xs text-slate-400 font-bold uppercase">Geofence Radius</span>
                    <span className="font-bold text-slate-700 text-lg">{gf.radiusMeters} <span className="text-xs font-normal">meters</span></span>
                </div>
                {status && (
                    <div className="flex flex-col text-right">
                         <span className="text-xs text-slate-400 font-bold uppercase">Distance to Center</span>
                         <span className="font-mono font-bold text-slate-800 text-lg">
                             {Math.round(status.distanceMeters)}m
                         </span>
                    </div>
                )}
            </div>

            {/* Status Box */}
            {status ? (
                status.error ? (
                     <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm font-medium text-center">
                         {status.error}
                     </div>
                ) : (
                    <div className={`p-4 rounded border-l-4 transition-all duration-300 ${
                        isInside 
                        ? "bg-green-50 border-l-green-500 border-y border-r border-green-100" 
                        : "bg-slate-50 border-l-amber-500 border-y border-r border-slate-200"
                    }`}>
                         <div className="flex items-center justify-between">
                             <div className="flex items-center">
                                 <span className={`h-3 w-3 rounded-full mr-3 ${isInside ? "bg-green-500" : "bg-amber-500 apply-ping"}`}></span>
                                 <span className={`font-bold uppercase text-sm ${isInside ? "text-green-800" : "text-slate-600"}`}>
                                     {isInside ? "INSIDE ZONE" : "OUTSIDE ZONE"}
                                 </span>
                             </div>
                             {isInside && (
                                 <span className="text-xl">✅</span>
                             )}
                         </div>
                    </div>
                )
            ) : (
                <div className="text-center py-4 text-slate-400 text-sm italic">
                    Acquiring GPS Signal...
                </div>
            )}
        </div>
        <style jsx>{`
            .apply-ping {
                position: relative;
            }
            .apply-ping::after {
                content: '';
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background-color: inherit;
                opacity: 0.75;
                animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
            }
            @keyframes ping {
                75%, 100% {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        `}</style>
      </div>
    );
  };

  const renderGeofenceList = (geofences) => (
      <div className="space-y-4">
          {geofences.map(gf => {
               const status = driverStatuses[gf.geofenceId];
               const isInside = status?.inside;
               return (
                   <div key={gf.geofenceId} className="bg-white border border-slate-200 rounded-lg p-4 flex justify-between items-center shadow-sm">
                        <div className="flex flex-col">
                            <span className="text-lg font-bold text-slate-800">{gf.name}</span>
                            <span className="text-xs text-slate-500 font-mono">Radius: {gf.radiusMeters}m</span>
                        </div>

                        <div className="flex items-center gap-6">
                            {status && (
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs text-slate-400 uppercase">Distance</p>
                                    <p className="font-mono font-bold text-slate-800">{Math.round(status.distanceMeters)}m</p>
                                </div>
                            )}

                            {status ? (
                                <div className={`px-4 py-2 rounded font-bold text-sm flex items-center ${
                                    isInside ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"
                                }`}>
                                    <span className={`h-2 w-2 rounded-full mr-2 ${isInside ? "bg-green-600" : "bg-slate-400"}`}></span>
                                    {isInside ? "INSIDE" : "OUTSIDE"}
                                </div>
                            ) : (
                                <span className="text-xs text-slate-400 italic">Locating...</span>
                            )}
                        </div>
                   </div>
               )
          })}
      </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      <CustomerSidebar active="alerts" />

      <main className="flex-1 p-8 lg:p-10">
        <header className="mb-8 border-b-2 border-slate-200 pb-6 flex justify-between items-end">
            <div>
                 <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Geofence Monitor</h1>
                 <p className="text-slate-500 mt-1 font-medium">Real-time zone tracking for active deliveries.</p>
            </div>
            <div className="flex items-center gap-4">
                 {/* View Toggle */}
                 <div className="bg-white border border-slate-300 rounded flex overflow-hidden">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 ${viewMode === "grid" ? "bg-slate-200 text-slate-800" : "text-slate-400 hover:bg-slate-50"}`}
                    >
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 ${viewMode === "list" ? "bg-slate-200 text-slate-800" : "text-slate-400 hover:bg-slate-50"}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                </div>
                
                <div className="text-right hidden sm:block">
                    <p className="text-xs text-slate-400 font-bold uppercase">System Status</p>
                    <div className="flex items-center text-green-600 space-x-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-sm font-bold">ONLINE</span>
                    </div>
                </div>
            </div>
        </header>

        {loading && geofences.length === 0 && (
             <div className="text-center py-20">
                 <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-300 border-t-slate-800 rounded-full mb-4"></div>
                 <p className="text-slate-500 font-medium">Syncing Geofence Data...</p>
             </div>
        )}

        <section className="mb-10">
            <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl font-bold text-slate-800 flex items-center">
                     <span className="bg-slate-200 text-slate-700 px-2 py-1 rounded text-sm mr-3">
                         {activeGeofences.length}
                     </span>
                     Active Assignments
                 </h2>
            </div>

            {activeGeofences.length > 0 ? (
                viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {activeGeofences.map(renderGeofenceCard)}
                    </div>
                ) : (
                    renderGeofenceList(activeGeofences)
                )
            ) : (
                !loading && (
                    <div className="bg-white border-2 border-dashed border-slate-300 rounded-lg p-10 text-center">
                        <p className="text-slate-400 font-medium">No active geofences assigned.</p>
                    </div>
                )
            )}
        </section>

        <section>
             <h2 className="text-lg font-bold text-slate-500 mb-4 uppercase tracking-wider text-sm border-b border-slate-200 pb-2">
                 Completed History
             </h2>
             {expiredGeofences.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {expiredGeofences.map(gf => (
                        <div key={gf.geofenceId} className="bg-slate-100 border border-slate-200 rounded p-4 flex justify-between items-center opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition">
                             <div>
                                 <h4 className="font-bold text-slate-700 text-sm">{gf.name}</h4>
                                 <p className="text-xs text-slate-500">#{gf.geofenceId}</p>
                             </div>
                             <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded">DELIVERED</span>
                        </div>
                    ))}
                </div>
             ) : (
                 <p className="text-slate-400 text-sm italic">No history.</p>
             )}
        </section>

      </main>
    </div>
  );
}
