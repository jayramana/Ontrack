import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DriverSidebar from "./DriverSidebar";
import { ArrowLeft, MapPin, Package, User, Clock, Phone, Mail, Calendar } from "lucide-react";
import { MapContainer, TileLayer, Circle, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import api from "../../services/api";
import L from "leaflet";
import { useAuth } from "../../context/AuthContext";

// Fix for default marker icon in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function DriverGeofenceDetails() {
  const { geofenceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [geofence, setGeofence] = useState(null);
  const [order, setOrder] = useState(null);
  const [myLoc, setMyLoc] = useState(null);
  const [insideZone, setInsideZone] = useState(false);
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper: Haversine Distance
  const haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const toRad = (val) => (val * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Geofence List
        const gfRes = await api.get("/geofence/list");
        const foundGf = gfRes.data.find(g => String(g.geofenceId) === String(geofenceId));
        
        if (foundGf) {
            setGeofence(foundGf);
            
            // 2. Fetch Order Info
            if(foundGf.orderId) {
                // Fetching from driver orders endpoint to ensure access
                // Alternatively, could fetch specific order if endpoint exists
                const ordersRes = await api.get("/driver/orders/all");
                const foundOrder = ordersRes.data.find(o => o.id === foundGf.orderId);

                if (foundOrder) {
                    setOrder(foundOrder);
                }
            }

            // 3. Get My Location (Driver)
            if (user?.userId) {
                 const meRes = await api.get(`/auth/${user.userId}`);
                 const me = meRes.data;
                 
                 if (me && me.currentLatitude && me.currentLongitude) {
                     setMyLoc({ lat: me.currentLatitude, lon: me.currentLongitude });
                     
                     const dist = haversine(
                         me.currentLatitude, me.currentLongitude,
                         foundGf.centerLat, foundGf.centerLon
                     );
                     setDistance(dist);
                     setInsideZone(dist <= foundGf.radiusMeters);
                 }
            }
        }
      } catch (err) {
        console.error("Failed to load details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Poll for updates every 10s
    const interval = setInterval(fetchData, 10000); 
    return () => clearInterval(interval);

  }, [geofenceId, user]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      <DriverSidebar active="geofence" />

      <main className="flex-1 bg-[#0b0f14] min-h-screen text-white p-8 overflow-y-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Alerts
        </button>

        <header className="mb-8 flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-bold mb-2">Geofence - #{geofenceId}</h1>
            </div>
        </header>

        {loading ? (
           <div className="flex items-center justify-center h-64 bg-[#1a1f29] rounded-xl border border-white/5">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-white/10 border-t-[#ea580c]"></div>
           </div>
        ) : geofence ? (
            <div className="space-y-8">
                {/* Map Card */}
                <div className="bg-[#1a1f29] rounded-xl border border-white/5 overflow-hidden shadow-2xl">
                    <div className="h-[500px] w-full relative z-0">
                        <MapContainer 
                            key={geofence.geofenceId} // Force re-render on load
                            center={[geofence.centerLat, geofence.centerLon]} 
                            zoom={14} 
                            scrollWheelZoom={true}
                            style={{ height: "100%", width: "100%" }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                            />
                            
                            {/* Geofence Zone */}
                            <Circle 
                                center={[geofence.centerLat, geofence.centerLon]} 
                                radius={geofence.radiusMeters} 
                                pathOptions={{ 
                                    color: insideZone ? '#22c55e' : '#ef4444', 
                                    fillColor: insideZone ? '#22c55e' : '#ef4444', 
                                    fillOpacity: 0.1,
                                    weight: 2,
                                    dashArray: '5, 10' 
                                }} 
                            />

                            {/* Center Marker (Destination/Customer) */}
                            <Marker position={[geofence.centerLat, geofence.centerLon]}>
                                <Popup>
                                    <div className="text-gray-900 font-bold">
                                        Geofence Center<br/>
                                        <span className="font-normal text-xs text-gray-600">Radius: {geofence.radiusMeters}m</span>
                                    </div>
                                </Popup>
                            </Marker>

                            {/* Driver Marker (Me) */}
                            {myLoc && (
                                <Marker position={[myLoc.lat, myLoc.lon]}>
                                    <Popup>
                                        <div className="text-center">
                                            <p className="font-bold text-gray-800 mb-0">Your Location</p>
                                            <p className="text-xs text-gray-500 m-0">
                                                {distance ? `${(distance/1000).toFixed(2)}km away` : 'Locating...'}
                                            </p>
                                        </div>
                                    </Popup>
                                </Marker>
                            )}
                        </MapContainer>
                    </div>
                    {/* Status Bar */}
                    <div className="bg-[#151921] p-4 flex justify-between items-center text-sm border-t border-white/5">
                        <p className="text-gray-400 text-xs">
                            Auto-updating every 10s
                        </p>
                    </div>
                </div>

                {/* Details Grid - Unified Vertical */}
                <div className="bg-[#1a1f29] rounded-xl border border-white/5 p-6 space-y-6">
                    
                    {/* 1. Geofence Details */}
                    <div>
                         <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-white">Geofence Details</h3>
                        </div>
                        <div className="space-y-0">
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-gray-400 text-sm">Geofence Name</span>
                                <span className="text-white text-xs">{geofence.name}</span>
                            </div>
                             <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-gray-400 text-sm">Radius</span>
                                <span className="text-white text-xs">{geofence.radiusMeters} m</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. Order Details */}
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-white">Order Details</h3>
                        </div>
                        
                        <div className="space-y-0">
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-gray-400 text-sm">Order ID</span>
                                <span className="text-white text-xs">#{geofence.orderId}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-gray-400 text-sm">Type</span>
                                <span className="text-white text-xs capitalize">{order?.deliveryType || "Normal"}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-gray-400 text-sm">Status</span>
                                <span className="bg-blue-500/20 text-blue-300 text-[10px] px-2 py-1 rounded font-bold uppercase">
                                    {order?.status || "Loading..."}
                                </span>
                            </div>
                             <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-gray-400 text-sm">Parcel</span>
                                <span className="text-white text-xs">{order?.parcelSize || "-"}</span>
                            </div>
                        </div>
                    </div>

                    {/* 3. Customer Details */}
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-white">Customer Details</h3>
                        </div>

                         {order ? (
                            <div className="space-y-0">
                                <div className="flex items-center gap-3 py-3 border-b border-white/5">
                                     <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-gray-300">
                                         <User className="w-4 h-4" />
                                     </div>
                                     <div>
                                         <p className="text-white font-bold text-sm">
                                             {order.receiverName || "Guest Customer"}
                                         </p>
                                         <p className="text-gray-500 text-[10px] uppercase tracking-wider">Receiver</p>
                                     </div>
                                </div>

                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-gray-400 text-sm">Phone</span>
                                    <span className="text-white text-xs flex items-center gap-2">
                                        <Phone className="w-3 h-3 text-gray-500" />
                                        {order.receiverPhone || "N/A"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-gray-400 text-sm">Email</span>
                                    <span className="text-white text-xs flex items-center gap-2">
                                        <Mail className="w-3 h-3 text-gray-500" />
                                        {order.receiverEmail || "N/A"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-gray-400 text-sm">Scheduled</span>
                                    <span className="text-white text-xs flex items-center gap-2">
                                        <Calendar className="w-3 h-3 text-gray-500" />
                                        {order.scheduledDate ? new Date(order.scheduledDate).toLocaleDateString() : "Not Scheduled"}
                                    </span>
                                </div>
                            </div>
                         ) : (
                             <div className="text-center py-4 text-gray-500 italic text-sm">
                                 Customer info unavailable.
                             </div>
                         )}
                    </div>
                </div>


            </div>
        ) : (
             <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-xl text-center">
                <p className="text-red-400 font-bold">Geofence not found</p>
             </div>
        )}
      </main>
    </div>
  );
}
