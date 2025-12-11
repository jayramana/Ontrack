import React, { useState, useEffect } from "react";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

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
        
        const oMap = {};
        myOrders.forEach(o => oMap[o.id] = o);
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
                       Lon: driver.currentLongitude
                   });
                   
                   statuses[gf.geofenceId] = {
                       driverName: `${driver.userFName} ${driver.userLName}`,
                       ...checkRes.data
                   };
                } else {
                    statuses[gf.geofenceId] = {
                        driverName: driver ? `${driver.userFName} ${driver.userLName}` : "Unknown",
                        error: "Driver location not available"
                    };
                }
             } catch (err) {
                 statuses[gf.geofenceId] = { error: "Failed to check status" + err};
             }
          } else if (!order) {
              statuses[gf.geofenceId] = { error: "No active order found" };
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
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);

  }, [user]);

  const activeGeofences = geofences.filter(gf => {
      const order = ordersMap[gf.orderId];
      return order && order.status === "Assigned";
  });

  const expiredGeofences = geofences.filter(gf => {
      const order = ordersMap[gf.orderId];
      return order && order.status === "Delivered";
  });

  const renderGeofenceCard = (gf) => {
      const status = driverStatuses[gf.geofenceId];
      const isInside = status?.inside;

      return (
        <div 
          key={gf.geofenceId} 
          className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col justify-between hover:border-gray-300 transition-colors"
        >
          <div>
              <div className="flex justify-between items-start mb-4">
                 <div>
                    <h3 className="font-semibold text-gray-900 text-lg leading-tight">{gf.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">ID: {gf.geofenceId}</p>
                 </div>
                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    gf.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                 }`}>
                    {gf.isActive ? "Active" : "Inactive"}
                 </span>
              </div>
              
              <div className="text-sm text-gray-600 mb-6">
                 <p className="flex items-center">
                    <span className="w-20 font-medium text-gray-500">Radius:</span> 
                    {gf.radiusMeters} meters
                 </p>
                 {status && status.driverName && (
                     <p className="flex items-center mt-2">
                        <span className="w-20 font-medium text-gray-500">Driver:</span> 
                        {status.driverName}
                     </p>
                 )}
              </div>
          </div>
          
          <div className="border-t border-gray-100 pt-4 mt-auto">
              {status ? (
                  status.error ? (
                    <p className="text-sm text-red-600 flex items-center">
                         <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                         {status.error}
                    </p>
                  ) : (
                    <div className="flex items-center justify-between">
                        <div className={`flex items-center text-sm font-medium ${isInside ? "text-green-700" : "text-amber-600"}`}>
                            <span className={`relative flex h-2.5 w-2.5 mr-2`}>
                              {isInside && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isInside ? "bg-green-500" : "bg-amber-500"}`}></span>
                            </span>
                            {isInside ? "Inside Range" : "Outside Range"}
                        </div>
                        <span className="text-sm font-mono text-gray-500">
                            {Math.round(status.distanceMeters)}m away
                        </span>
                    </div>
                  )
              ) : (
                  <p className="text-sm text-gray-400 italic">Checking status...</p>
              )}
          </div>
        </div>
      );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Geofence Alerts</h2>
            <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded border border-gray-200">
               Auto-refresh: 10s
            </div>
          </div>

          {loading && geofences.length === 0 && (
             <p className="text-gray-500">Loading...</p>
          )}

          {/* ACTIVE GEOFENCES */}
          <div className="mb-10">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Active Deliveries</h3>
              
              {activeGeofences.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {activeGeofences.map(renderGeofenceCard)}
                  </div>
              ) : (
                  !loading && <p className="text-gray-500 text-sm italic">No active deliveries.</p>
              )}
          </div>

          {/* EXPIRED GEOFENCES */}
          <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Completed</h3>
              
              {expiredGeofences.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {expiredGeofences.map(gf => (
                          <div key={gf.geofenceId} className="bg-gray-50 rounded-lg border border-gray-200 p-6 opacity-75">
                              <div className="flex justify-between items-center">
                                  <div>
                                      <h4 className="font-medium text-gray-700">{gf.name}</h4>
                                      <p className="text-xs text-gray-500 mt-0.5">ID: {gf.geofenceId}</p>
                                  </div>
                                  <span className="text-xs font-semibold text-gray-500 bg-gray-200 px-2 py-1 rounded">
                                      Delivered
                                  </span>
                              </div>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                      <p className="text-gray-400 text-sm">No delivery history.</p>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
}
