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

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const gfRes = await api.get("/geofence/list");
        const myGeofences = gfRes.data.filter((g) => g.ownerUserId === user.userId);

        const ordersRes = await api.get("/orders/my-orders");
        const myOrders = ordersRes.data;

        const map = {};
        myOrders.forEach((o) => (map[o.id] = o));
        setOrdersMap(map);

        const statuses = {};

        for (const gf of myGeofences) {
          const order = map[gf.orderId];

          if (order && order.status !== "Delivered" && order.driverId) {
            try {
              const driverRes = await api.get(`/auth/${order.driverId}`);
              const driver = driverRes.data;

              if (driver?.currentLatitude && driver?.currentLongitude) {
                const check = await api.post("/geofence/check", {
                  DriverId: order.driverId,
                  OrderId: order.id,
                  Lat: driver.currentLatitude,
                  Lon: driver.currentLongitude,
                });

                statuses[gf.geofenceId] = {
                  driverName: `${driver.userFName} ${driver.userLName}`,
                  ...check.data,
                };
              } else {
                statuses[gf.geofenceId] = { error: "Driver location unavailable" };
              }
            } catch {
              statuses[gf.geofenceId] = { error: "Status check failed" };
            }
          }
        }

        setGeofences(myGeofences);
        setDriverStatuses(statuses);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const activeGeofences = geofences.filter((g) => {
    const o = ordersMap[g.orderId];
    return o && o.status !== "Delivered";
  });

  const expiredGeofences = geofences.filter((g) => {
    const o = ordersMap[g.orderId];
    return o && o.status === "Delivered";
  });

  const renderGeofenceRow = (gf) => {
    const status = driverStatuses[gf.geofenceId];
    const inside = status?.inside;
    const order = ordersMap[gf.orderId];

    return (
      <div
        key={gf.geofenceId}
        className="bg-white border border-gray-200 rounded-lg p-6 mb-4 flex flex-col md:flex-row items-center justify-between shadow-sm hover:shadow-md transition-shadow"
      >
        {/* LEFT: Info */}
        <div className="flex-1 w-full md:w-auto mb-4 md:mb-0">
          <div className="flex items-center gap-3 mb-2">
             <div className="bg-[#fff8e7] text-[#351c15] p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
             </div>
             <div>
                <h3 className="text-lg font-bold text-gray-900">{gf.name}</h3>
                <p className="text-sm text-gray-500">Zone ID: {gf.geofenceId}</p>
             </div>
          </div>
          
          <div className="pl-0 md:pl-14">
             {order && (
                <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Order:</span> {order.trackingId || `ORD-${order.id}`} • {order.receiverName}
                </p>
             )}
            <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
               <span className="bg-gray-100 px-2 py-1 rounded">Radius: {gf.radiusMeters}m</span>
               {status && !status.error && (
                   <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                       Driver Distance: {Math.round(status.distanceMeters)}m
                   </span>
               )}
            </div>
          </div>
        </div>

        {/* RIGHT: Status Indicator */}
        <div className="md:w-64 w-full flex flex-col items-center md:items-end border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
            {status ? (
                status.error ? (
                    <div className="flex flex-col items-end">
                        <span className="text-red-600 font-bold bg-red-50 px-3 py-1 rounded text-sm mb-1">Check Failed</span>
                        <span className="text-xs text-gray-400">{status.error}</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center md:items-end text-center md:text-right">
                        {inside ? (
                            <>
                                <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-2 mb-2 animate-pulse">
                                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                                    INSIDE ZONE
                                </span>
                                <p className="text-xs text-gray-500">Driver is expected to arrive soon.</p>
                            </>
                        ) : (
                            <>
                                <span className="bg-yellow-100 text-yellow-800 px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-2 mb-2">
                                     <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                                     OUTSIDE ZONE
                                </span>
                            </>
                        )}
                    </div>
                )
            ) : (
                 <div className="flex items-center gap-2 text-gray-400 italic text-sm">
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                    Locating driver...
                 </div>
            )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      <CustomerSidebar active="alerts" />

      <main className="flex-1 p-8 overflow-y-auto h-screen">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Geofence Alerts</h1>
          <p className="text-gray-500 mt-1">
            Real-time monitoring of your delivery zones
          </p>
        </header>

        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-8 bg-[#351c15] rounded-full"></span>
              Active Zones ({activeGeofences.length})
            </h2>
          </div>

          {activeGeofences.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
               <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 text-2xl">📡</div>
              <p className="text-gray-500 font-medium">No active geofences currently being monitored.</p>
              <p className="text-gray-400 text-sm mt-1">Alerts will appear here when drivers approach.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeGeofences.map(renderGeofenceRow)}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-4 opacity-75">
            History
          </h2>

          {expiredGeofences.length === 0 ? (
            <p className="text-gray-400 text-sm italic">No completed delivery alerts yet.</p>
          ) : (
            <div className="space-y-3 opacity-70 hover:opacity-100 transition-opacity">
              {expiredGeofences.map((gf) => (
                <div
                  key={gf.geofenceId}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                     <span className="text-gray-400">🏁</span>
                     <div>
                        <h3 className="font-bold text-gray-700">{gf.name}</h3>
                        <p className="text-xs text-gray-500">ID: {gf.geofenceId}</p>
                     </div>
                  </div>
                  <span className="bg-gray-200 text-gray-600 px-3 py-1 text-xs font-bold rounded-full">
                    Completed
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
