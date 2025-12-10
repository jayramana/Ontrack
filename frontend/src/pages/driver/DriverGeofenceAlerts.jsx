import React, { useState, useEffect } from "react";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function DriverGeofenceAlerts() {
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
        // 1. Fetch All Orders for Driver (includes Delivered)
        const ordersRes = await api.get("/driver/orders/all");
        const myOrders = ordersRes.data;
        console.log("DEBUG: Driver Orders:", myOrders);

        const oMap = {};
        myOrders.forEach(o => oMap[o.id] = o);
        setOrdersMap(oMap);
        
        // 2. Fetch All Geofences and filter for my orders
        const gfRes = await api.get("/geofence/list");
        const allGeofences = gfRes.data;
        console.log("DEBUG: All Geofences:", allGeofences);

        const myGeofences = allGeofences.filter(g => {
             const match = oMap[g.orderId];
             if (match) console.log(`DEBUG: Match found for Geofence ${g.geofenceId} -> Order ${g.orderId}`);
             return match;
        });
        console.log("DEBUG: Filtered My Geofences:", myGeofences);

        // 3. Process geofences
        const statuses = {};
        
        // Get MY current location once if possible, or use API to get persisted state
        // We use the same Auth API to match the customer view source of truth
        let myLocation = null;
        try {
            const meRes = await api.get(`/auth/${user.userId}`);
            myLocation = meRes.data;
        } catch(e) { console.error("Failed to fetch self location", e); }

        for (const gf of myGeofences) {
           const order = oMap[gf.orderId];
           
           if (order && order.status !== "Delivered") {
                if(myLocation && myLocation.currentLatitude) {
                     try {
                        const checkRes = await api.post("/geofence/check", {
                            DriverId: user.userId,
                            OrderId: order.id,
                            Lat: myLocation.currentLatitude,
                            Lon: myLocation.currentLongitude
                        });
                        statuses[gf.geofenceId] = {
                            driverName: "You",
                            ...checkRes.data
                        };
                     } catch(err) {
                         statuses[gf.geofenceId] = { error: "Check failed" };
                     }
                } else {
                    statuses[gf.geofenceId] = { error: "Location unavailable" };
                }
           }
        }

        setGeofences(myGeofences);
        setDriverStatuses(statuses);

      } catch (err) {
        console.error("Failed to load driver geofences:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);

  }, [user]);

  // CATEGORIZATION
  const activeGeofences = geofences.filter(gf => {
      const order = ordersMap[gf.orderId];
      return order && order.status !== "Delivered";
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
          className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 overflow-hidden"
        >
          {/* Card Header */}
          <div className="p-5 border-b border-gray-50 flex justify-between items-start bg-gray-50/50">
             <div>
                <div className="flex items-center space-x-2">
                    <span className="p-1 bg-blue-100 text-blue-600 rounded">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </span>
                    <h3 className="font-bold text-gray-800 text-lg">{gf.name}</h3>
                </div>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide font-medium ml-8">
                  Zone ID: #{gf.geofenceId}
                </p>
             </div>
             <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm ${
                gf.isActive 
                ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20' 
                : 'bg-gray-100 text-gray-600 ring-1 ring-gray-500/20'
             }`}>
                {gf.isActive ? "ACTIVE" : "INACTIVE"}
             </span>
          </div>
          
          {/* Card Body */}
          <div className="p-5 space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-600 pb-2 border-b border-gray-50">
                   <div className="flex items-center">
                        <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span>Zone Radius</span>
                   </div>
                   <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-xs">{gf.radiusMeters}m</span>
              </div>
              
              {status ? (
                  <div className={`rounded-xl p-4 border transition-colors duration-300 ${isInside ? 'bg-green-50/50 border-green-200' : 'bg-amber-50/50 border-amber-200'}`}>
                    
                    {status.error ? (
                        <p className="text-red-500 text-sm flex items-center bg-white p-3 rounded-lg border border-red-100 shadow-sm">
                             <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                             {status.error}
                        </p>
                    ) : (
                        <div className="space-y-4">
                            <div className="text-center">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Current Status</p>
                                <div className={`inline-flex items-center px-4 py-2 rounded-lg font-bold text-sm shadow-sm ${
                                    status.inside 
                                    ? "bg-green-500 text-white" 
                                    : "bg-amber-100 text-amber-700 border border-amber-200"
                                }`}>
                                    {status.inside ? (
                                        <><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> YOU ARE INSIDE</>
                                    ) : (
                                        <><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> OUTSIDE RANGE</>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm bg-white/60 p-2 rounded-lg border border-gray-100">
                                <span className="text-gray-500">Distance from Center</span>
                                <span className="font-mono font-bold text-gray-900">
                                    {Math.round(status.distanceMeters)}m
                                </span>
                            </div>
                        </div>
                    )}
                  </div>
              ) : (
                 <div className="flex items-center justify-center p-4">
                     <div className="flex items-center space-x-2 text-gray-400 animate-pulse">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span className="text-sm font-medium">Acquiring GPS...</span>
                     </div>
                 </div>
              )}
          </div>
        </div>
      );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 text-center md:text-left">
            <div>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Driver Zone Monitor</h2>
                <p className="text-gray-500 mt-2">Manage your active delivery range status.</p>
            </div>
          </div>

          {loading && geofences.length === 0 && (
             <div className="w-full flex flex-col items-center justify-center py-20">
                 <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                 <p className="text-gray-500 font-medium">Syncing assignments...</p>
             </div>
          )}

          {/* ACTIVE GEOFENCES SECTION */}
          <div className="mb-12">
              <div className="flex items-center mb-6">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 mr-3 shadow-sm font-bold text-sm">
                      {activeGeofences.length}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900">Active Assignments</h3>
              </div>
              
              {activeGeofences.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {activeGeofences.map(renderGeofenceCard)}
                  </div>
              ) : (
                  !loading && (
                      <div className="bg-white rounded-xl border border-gray-200 p-10 text-center shadow-sm">
                           <div className="inline-block p-4 rounded-full bg-blue-50 mb-4 text-blue-500">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                           </div>
                          <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
                          <p className="text-gray-500 mt-1">No active delivery zones pending.</p>
                      </div>
                  )
              )}
          </div>

          {/* EXPIRED GEOFENCES SECTION */}
          <div>
              <div className="flex items-center mb-6">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-600 mr-3 shadow-sm font-bold text-sm">
                      {expiredGeofences.length}
                  </span>
                  <h3 className="text-xl font-bold text-gray-700">Completed</h3>
              </div>
              
              {expiredGeofences.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {expiredGeofences.map(gf => (
                          <div key={gf.geofenceId} className="bg-gray-50 rounded-xl border border-gray-200 p-5 opacity-60 hover:opacity-100 transition-all duration-300">
                              <div className="flex justify-between items-center">
                                  <div>
                                      <h4 className="font-semibold text-gray-700">{gf.name}</h4>
                                      <p className="text-xs text-gray-500 mt-0.5">#{gf.geofenceId}</p>
                                  </div>
                                  <div className="flex items-center text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded border border-green-100">
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                      DONE
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              ) : (
                   <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-8 text-center">
                      <p className="text-gray-400 font-medium">No completed history yet.</p>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
}
