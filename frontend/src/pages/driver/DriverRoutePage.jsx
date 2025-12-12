// // // // // // import { useEffect, useState } from "react";
// // // // // // import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
// // // // // // import api from "../../services/api";
// // // // // // import "leaflet/dist/leaflet.css";
// // // // // // import L from "leaflet";

// // // // // // // FIX Leaflet marker issue
// // // // // // delete L.Icon.Default.prototype._getIconUrl;
// // // // // // L.Icon.Default.mergeOptions({
// // // // // //     iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
// // // // // //     iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
// // // // // //     shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
// // // // // // });

// // // // // // const orsApiKey = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImMyOTc5YTI5ZDc1OTQ5ZThhNDAxMTg0MjUzZjE5OWJlIiwiaCI6Im11cm11cjY0In0="; // <-- add your key here

// // // // // // export default function DriverRoutePage() {
// // // // // //     const [stops, setStops] = useState([]);
// // // // // //     const [routeCoords, setRouteCoords] = useState([]);
// // // // // //     const [loading, setLoading] = useState(true);

// // // // // //     // Fetch optimized stop list from backend
// // // // // //     const fetchRoute = async () => {
// // // // // //         try {
// // // // // //             const response = await api.get("/driver/route/optimized");
// // // // // //             setStops(response.data);
// // // // // //             return response.data;
// // // // // //         } catch (error) {
// // // // // //             console.error("Error loading route:", error);
// // // // // //         }
// // // // // //     };

// // // // // //     // Fetch real-road routing polyline from ORS
// // // // // //     const fetchPolyline = async (stops) => {
// // // // // //         if (stops.length < 2) return;

// // // // // //         const coordinates = stops.map((s) => [s.deliveryLongitude, s.deliveryLatitude]);

// // // // // //         try {
// // // // // //             const res = await fetch("https://api.openrouteservice.org/v2/directions/driving-car/geojson", {
// // // // // //                 method: "POST",
// // // // // //                 headers: {
// // // // // //                     "Authorization": orsApiKey,
// // // // // //                     "Content-Type": "application/json",
// // // // // //                 },
// // // // // //                 body: JSON.stringify({ coordinates }),
// // // // // //             });

// // // // // //             const data = await res.json();
// // // // // //             const polylineCoords = data.features[0].geometry.coordinates.map(
// // // // // //                 ([lng, lat]) => [lat, lng]
// // // // // //             );

// // // // // //             setRouteCoords(polylineCoords);
// // // // // //         } catch (error) {
// // // // // //             console.error("ORS Route Error:", error);
// // // // // //         }
// // // // // //     };

// // // // // //     useEffect(() => {
// // // // // //         (async () => {
// // // // // //             const stopsList = await fetchRoute();
// // // // // //             if (stopsList && stopsList.length > 1) {
// // // // // //                 await fetchPolyline(stopsList);
// // // // // //             }
// // // // // //             setLoading(false);
// // // // // //         })();
// // // // // //     }, []);

// // // // // //     if (loading) {
// // // // // //         return (
// // // // // //             <div className="flex justify-center items-center h-screen text-xl font-semibold">
// // // // // //                 Loading route map...
// // // // // //             </div>
// // // // // //         );
// // // // // //     }

// // // // // //     // Default center on first stop
// // // // // //     const center = stops.length > 0 
// // // // // //         ? [stops[0].deliveryLatitude, stops[0].deliveryLongitude]
// // // // // //         : [13.0827, 80.2707];

// // // // // //     return (
// // // // // //         <div className="p-6">
// // // // // //             <h1 className="text-3xl font-bold mb-4">📍 Driver Route Map</h1>

// // // // // //             <div className="w-full h-[480px] rounded-lg overflow-hidden shadow-lg">
// // // // // //                 <MapContainer center={center} zoom={13} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
// // // // // //                     <TileLayer
// // // // // //                         attribution="&copy; OpenStreetMap contributors"
// // // // // //                         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
// // // // // //                     />

// // // // // //                     {/* Polyline route */}
// // // // // //                     {routeCoords.length > 0 && (
// // // // // //                         <Polyline positions={routeCoords} color="blue" weight={4} />
// // // // // //                     )}

// // // // // //                     {/* Markers */}
// // // // // //                     {stops.map((stop, index) => (
// // // // // //                         <Marker
// // // // // //                             key={index}
// // // // // //                             position={[stop.deliveryLatitude, stop.deliveryLongitude]}
// // // // // //                         >
// // // // // //                             <Popup>
// // // // // //                                 <div className="font-semibold">Stop #{index + 1}</div>
// // // // // //                                 <div>Order ID: {stop.id}</div>
// // // // // //                                 <div>ETA: {stop.etaMinutes} mins</div>
// // // // // //                             </Popup>
// // // // // //                         </Marker>
// // // // // //                     ))}
// // // // // //                 </MapContainer>
// // // // // //             </div>

// // // // // //             {/* Stop List */}
// // // // // //             <h2 className="text-2xl font-bold mt-6 mb-2">Stops</h2>
// // // // // //             <div className="space-y-4">
// // // // // //                 {stops.map((stop, index) => (
// // // // // //                     <div key={index} className="p-4 border rounded-lg shadow bg-white">
// // // // // //                         <div className="font-semibold text-lg">
// // // // // //                             #{index + 1} — {stop.receiverAddress}
// // // // // //                         </div>
// // // // // //                         <div className="text-gray-600">ETA: {stop.etaMinutes} mins</div>
// // // // // //                     </div>
// // // // // //                 ))}
// // // // // //             </div>
// // // // // //         </div>
// // // // // //     );
// // // // // // }


// // // // // // src/pages/driver/DriverRoutePage.jsx
// // // // // import { useEffect, useMemo, useState } from "react";
// // // // // import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
// // // // // import "leaflet/dist/leaflet.css";
// // // // // import { useAuth } from "../../context/AuthContext";
// // // // // import api from "../../services/api";

// // // // // // Simple Haversine distance to approximate km between 2 points
// // // // // const haversineKm = (lat1, lon1, lat2, lon2) => {
// // // // //   const R = 6371;
// // // // //   const dLat = ((lat2 - lat1) * Math.PI) / 180;
// // // // //   const dLon = ((lon2 - lon1) * Math.PI) / 180;
// // // // //   const a =
// // // // //     Math.sin(dLat / 2) ** 2 +
// // // // //     Math.cos((lat1 * Math.PI) / 180) *
// // // // //       Math.cos((lat2 * Math.PI) / 180) *
// // // // //       Math.sin(dLon / 2) ** 2;

// // // // //   return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
// // // // // };

// // // // // // Normalize backend orders → map stops with safe coordinates
// // // // // const normalizeOrdersToStops = (orders) => {
// // // // //   if (!Array.isArray(orders)) return [];

// // // // //   return orders
// // // // //     .map((o, index) => {
// // // // //       // Try both camelCase and PascalCase just in case
// // // // //       const lat = o.deliveryLatitude ?? o.deliveryLat ?? o.DeliveryLatitude;
// // // // //       const lng = o.deliveryLongitude ?? o.deliveryLng ?? o.DeliveryLongitude;

// // // // //       if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
// // // // //         return null; // filtered out below – avoids Invalid LatLng
// // // // //       }

// // // // //       return {
// // // // //         sequence: index + 1,
// // // // //         orderId: o.id ?? o.orderId ?? o.Id,
// // // // //         receiverName: o.receiverName ?? o.ReceiverName ?? "Receiver",
// // // // //         receiverAddress: o.receiverAddress ?? o.ReceiverAddress ?? "Address not available",
// // // // //         priority: o.priority ?? o.Priority ?? 2,
// // // // //         status: o.status ?? o.Status ?? "Assigned",
// // // // //         lat,
// // // // //         lng,
// // // // //       };
// // // // //     })
// // // // //     .filter(Boolean);
// // // // // };

// // // // // // Build 3 ORION-style route options on the frontend from the base stops
// // // // // const buildRouteOptions = (stops) => {
// // // // //   if (!stops || stops.length === 0) return [];

// // // // //   const centerLat = stops.reduce((s, x) => s + x.lat, 0) / stops.length;
// // // // //   const centerLng = stops.reduce((s, x) => s + x.lng, 0) / stops.length;

// // // // //   const distanceFromCenter = (s) => haversineKm(centerLat, centerLng, s.lat, s.lng);

// // // // //   // 1) Fuel Saver – cluster stops, minimize zig-zags
// // // // //   const fuelSaverStops = [...stops].sort(
// // // // //     (a, b) => distanceFromCenter(a) - distanceFromCenter(b)
// // // // //   );

// // // // //   // 2) Fastest ETA – honor priority first, then distance from previous stop
// // // // //   const fastestStops = [...stops].sort((a, b) => {
// // // // //     if (a.priority !== b.priority) return a.priority - b.priority;
// // // // //     return distanceFromCenter(a) - distanceFromCenter(b);
// // // // //   });

// // // // //   // 3) Balanced – mix priority + distance
// // // // //   const balancedStops = [...stops].sort((a, b) => {
// // // // //     const scoreA = a.priority * 0.6 + distanceFromCenter(a) * 0.4;
// // // // //     const scoreB = b.priority * 0.6 + distanceFromCenter(b) * 0.4;
// // // // //     return scoreA - scoreB;
// // // // //   });

// // // // //   const summarizeRoute = (routeStops) => {
// // // // //     if (routeStops.length === 0) return { distanceKm: 0, etaMinutes: 0 };
// // // // //     let distanceKm = 0;
// // // // //     for (let i = 1; i < routeStops.length; i++) {
// // // // //       distanceKm += haversineKm(
// // // // //         routeStops[i - 1].lat,
// // // // //         routeStops[i - 1].lng,
// // // // //         routeStops[i].lat,
// // // // //         routeStops[i].lng
// // // // //       );
// // // // //     }
// // // // //     const etaMinutes = routeStops.length * 15; // simple 15 min per stop
// // // // //     return { distanceKm, etaMinutes };
// // // // //   };

// // // // //   const fuelStats = summarizeRoute(fuelSaverStops);
// // // // //   const fastStats = summarizeRoute(fastestStops);
// // // // //   const balancedStats = summarizeRoute(balancedStops);

// // // // //   return [
// // // // //     {
// // // // //       id: "fuelSaver",
// // // // //       label: "Fuel Saver",
// // // // //       badge: "Eco",
// // // // //       description: "Minimizes total distance and fuel usage using clustered stops.",
// // // // //       color: "#059669", // green
// // // // //       stops: fuelSaverStops,
// // // // //       stats: {
// // // // //         distanceKm: fuelStats.distanceKm,
// // // // //         etaMinutes: fuelStats.etaMinutes,
// // // // //         score: 92,
// // // // //       },
// // // // //     },
// // // // //     {
// // // // //       id: "fastestEta",
// // // // //       label: "Fastest ETA",
// // // // //       badge: "Speed",
// // // // //       description: "Prioritizes urgent and high-priority deliveries first.",
// // // // //       color: "#2563eb", // blue
// // // // //       stops: fastestStops,
// // // // //       stats: {
// // // // //         distanceKm: fastStats.distanceKm,
// // // // //         etaMinutes: fastStats.etaMinutes,
// // // // //         score: 95,
// // // // //       },
// // // // //     },
// // // // //     {
// // // // //       id: "balanced",
// // // // //       label: "Balanced",
// // // // //       badge: "Smart",
// // // // //       description: "Balances distance, priority, and spread across the city.",
// // // // //       color: "#d97706", // amber
// // // // //       stops: balancedStops,
// // // // //       stats: {
// // // // //         distanceKm: balancedStats.distanceKm,
// // // // //         etaMinutes: balancedStats.etaMinutes,
// // // // //         score: 90,
// // // // //       },
// // // // //     },
// // // // //   ];
// // // // // };

// // // // // const DriverRoutePage = () => {
// // // // //   const { user } = useAuth();
// // // // //   const [routeOptions, setRouteOptions] = useState([]);
// // // // //   const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
// // // // //   const [selectedStopId, setSelectedStopId] = useState(null);
// // // // //   const [loading, setLoading] = useState(true);
// // // // //   const [fetchError, setFetchError] = useState("");

// // // // //   // 1) Fetch base optimized route from backend once
// // // // //   useEffect(() => {
// // // // //     const fetchRoute = async () => {
// // // // //       try {
// // // // //         setLoading(true);
// // // // //         setFetchError("");
// // // // //         // ✅ Use existing endpoint that already works
// // // // //         const res = await api.get("/driver/route/optimized");
// // // // //         const baseOrders = res.data || [];
// // // // //         const stops = normalizeOrdersToStops(baseOrders);

// // // // //         if (stops.length === 0) {
// // // // //           setRouteOptions([]);
// // // // //           return;
// // // // //         }

// // // // //         const options = buildRouteOptions(stops);
// // // // //         setRouteOptions(options);
// // // // //       } catch (err) {
// // // // //         console.error("Error fetching optimized route:", err);
// // // // //         setFetchError(
// // // // //           err?.response?.data?.message ||
// // // // //             "Unable to load route. Please try again."
// // // // //         );
// // // // //       } finally {
// // // // //         setLoading(false);
// // // // //       }
// // // // //     };

// // // // //     fetchRoute();
// // // // //   }, []);

// // // // //   const selectedRoute =
// // // // //     routeOptions.length > 0 ? routeOptions[selectedRouteIndex] : null;

// // // // //   // 2) Safe map center (avoids Invalid LatLng)
// // // // //   const mapCenter = useMemo(() => {
// // // // //     if (selectedRoute && selectedRoute.stops.length > 0) {
// // // // //       const first = selectedRoute.stops[0];
// // // // //       return [first.lat, first.lng];
// // // // //     }
// // // // //     // Default center: Chennai (you can change)
// // // // //     return [13.0827, 80.2707];
// // // // //   }, [selectedRoute]);

// // // // //   const polylinePositions = useMemo(() => {
// // // // //     if (!selectedRoute) return [];
// // // // //     return selectedRoute.stops.map((s) => [s.lat, s.lng]);
// // // // //   }, [selectedRoute]);

// // // // //   // 3) UI helpers
// // // // //   const formatMinutes = (mins) => {
// // // // //     if (!mins || mins <= 0) return "Now";
// // // // //     if (mins < 60) return `${mins} mins`;
// // // // //     const h = Math.floor(mins / 60);
// // // // //     const m = mins % 60;
// // // // //     return `${h}h ${m}m`;
// // // // //   };

// // // // //   if (loading) {
// // // // //     return (
// // // // //       <div className="min-h-screen flex items-center justify-center bg-slate-50">
// // // // //         <div className="bg-white shadow-lg rounded-2xl px-6 py-4 flex items-center gap-3">
// // // // //           <span className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
// // // // //           <span className="text-slate-700 text-sm font-medium">
// // // // //             Calculating your optimized routes…
// // // // //           </span>
// // // // //         </div>
// // // // //       </div>
// // // // //     );
// // // // //   }

// // // // //   if (fetchError) {
// // // // //     return (
// // // // //       <div className="min-h-screen flex items-center justify-center bg-slate-50">
// // // // //         <div className="bg-white shadow-lg rounded-2xl px-6 py-5 max-w-md text-center">
// // // // //           <h2 className="text-lg font-semibold text-red-600 mb-2">
// // // // //             Couldn&apos;t load routes
// // // // //           </h2>
// // // // //           <p className="text-sm text-slate-600 mb-4">{fetchError}</p>
// // // // //           <button
// // // // //             onClick={() => window.location.reload()}
// // // // //             className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
// // // // //           >
// // // // //             Retry
// // // // //           </button>
// // // // //         </div>
// // // // //       </div>
// // // // //     );
// // // // //   }

// // // // //   if (!selectedRoute) {
// // // // //     return (
// // // // //       <div className="min-h-screen flex items-center justify-center bg-slate-50">
// // // // //         <div className="bg-white shadow-lg rounded-2xl px-6 py-5 max-w-md text-center">
// // // // //           <h2 className="text-lg font-semibold text-slate-800 mb-2">
// // // // //             No deliveries scheduled
// // // // //           </h2>
// // // // //           <p className="text-sm text-slate-600">
// // // // //             Once you have stops assigned, your ORION-style optimized routes
// // // // //             will appear here.
// // // // //           </p>
// // // // //         </div>
// // // // //       </div>
// // // // //     );
// // // // //   }

// // // // //   return (
// // // // //     <div className="min-h-screen bg-slate-50 flex flex-col">
// // // // //       {/* Top Bar */}
// // // // //       <header className="bg-white shadow-sm border-b border-slate-200">
// // // // //         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
// // // // //           <div>
// // // // //             <h1 className="text-xl font-bold text-slate-900">
// // // // //               Smart Route Planner
// // // // //             </h1>
// // // // //             <p className="text-xs text-slate-500 mt-0.5">
// // // // //               Orion-style multi-objective optimization for{" "}
// // // // //               <span className="font-semibold">{user?.name}</span>
// // // // //             </p>
// // // // //           </div>
// // // // //           <div className="flex items-center gap-3">
// // // // //             <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
// // // // //               Live AI Optimization
// // // // //             </div>
// // // // //           </div>
// // // // //         </div>
// // // // //       </header>

// // // // //       {/* Main Layout */}
// // // // //       <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
// // // // //         {/* Left: Map & timeline */}
// // // // //         <section className="lg:col-span-2 flex flex-col gap-4">
// // // // //           {/* Map card */}
// // // // //           <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
// // // // //             <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100">
// // // // //               <div>
// // // // //                 <h2 className="text-sm font-semibold text-slate-900">
// // // // //                   Selected Route ·{" "}
// // // // //                   <span className="text-blue-600">
// // // // //                     {selectedRoute.label} ({selectedRoute.badge})
// // // // //                   </span>
// // // // //                 </h2>
// // // // //                 <p className="text-xs text-slate-500">
// // // // //                   {selectedRoute.description}
// // // // //                 </p>
// // // // //               </div>
// // // // //               <div className="flex items-center gap-3 text-xs">
// // // // //                 <div className="px-3 py-1 rounded-full bg-slate-50 border border-slate-200">
// // // // //                   Distance:{" "}
// // // // //                   <span className="font-semibold">
// // // // //                     {selectedRoute.stats.distanceKm.toFixed(1)} km
// // // // //                   </span>
// // // // //                 </div>
// // // // //                 <div className="px-3 py-1 rounded-full bg-slate-50 border border-slate-200">
// // // // //                   ETA:{" "}
// // // // //                   <span className="font-semibold">
// // // // //                     {formatMinutes(selectedRoute.stats.etaMinutes)}
// // // // //                   </span>
// // // // //                 </div>
// // // // //               </div>
// // // // //             </div>

// // // // //             {/* Map */}
// // // // //             <div className="h-[360px] relative">
// // // // //               <MapContainer
// // // // //                 center={mapCenter}
// // // // //                 zoom={12}
// // // // //                 style={{ height: "100%", width: "100%" }}
// // // // //               >
// // // // //                 <TileLayer
// // // // //                   attribution='&copy; OpenStreetMap'
// // // // //                   url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
// // // // //                 />
// // // // //                 {polylinePositions.length > 1 && (
// // // // //                   <Polyline
// // // // //                     positions={polylinePositions}
// // // // //                     pathOptions={{ weight: 4 }}
// // // // //                   />
// // // // //                 )}

// // // // //                 {selectedRoute.stops.map((stop, idx) => (
// // // // //                   <Marker key={stop.orderId ?? idx} position={[stop.lat, stop.lng]}>
// // // // //                     <Popup>
// // // // //                       <div className="text-xs">
// // // // //                         <p className="font-semibold mb-1">
// // // // //                           Stop #{stop.sequence} · Order {stop.orderId}
// // // // //                         </p>
// // // // //                         <p className="mb-1">{stop.receiverName}</p>
// // // // //                         <p className="text-[11px] text-slate-600">
// // // // //                           {stop.receiverAddress}
// // // // //                         </p>
// // // // //                         <p className="mt-1 text-[11px]">
// // // // //                           Priority:{" "}
// // // // //                           <span className="font-semibold">{stop.priority}</span>
// // // // //                         </p>
// // // // //                       </div>
// // // // //                     </Popup>
// // // // //                   </Marker>
// // // // //                 ))}
// // // // //               </MapContainer>

// // // // //               {/* Bottom overlay timeline bar */}
// // // // //               <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/95 via-white/80 to-transparent px-4 pb-3 pt-6">
// // // // //                 <div className="flex items-center justify-between mb-2">
// // // // //                   <p className="text-xs font-semibold text-slate-700">
// // // // //                     Timeline · {selectedRoute.stops.length} stops
// // // // //                   </p>
// // // // //                   <p className="text-[11px] text-slate-500">
// // // // //                     Tap a stop card on the right to focus it here.
// // // // //                   </p>
// // // // //                 </div>
// // // // //                 <div className="flex gap-2 overflow-x-auto pb-1">
// // // // //                   {selectedRoute.stops.map((stop) => (
// // // // //                     <button
// // // // //                       key={stop.orderId}
// // // // //                       onClick={() => setSelectedStopId(stop.orderId)}
// // // // //                       className={`flex-shrink-0 px-2.5 py-1.5 rounded-full border text-[11px] font-medium transition
// // // // //                         ${
// // // // //                           selectedStopId === stop.orderId
// // // // //                             ? "bg-blue-600 text-white border-blue-600"
// // // // //                             : "bg-white text-slate-700 border-slate-200 hover:border-blue-400"
// // // // //                         }`}
// // // // //                     >
// // // // //                       #{stop.sequence} · {stop.receiverName}
// // // // //                     </button>
// // // // //                   ))}
// // // // //                 </div>
// // // // //               </div>
// // // // //             </div>
// // // // //           </div>

// // // // //           {/* Detailed stop list */}
// // // // //           <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
// // // // //             <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
// // // // //               <h3 className="text-sm font-semibold text-slate-900">
// // // // //                 Stops in this route
// // // // //               </h3>
// // // // //               <span className="text-[11px] text-slate-500">
// // // // //                 Ordered sequence with Orion-style prioritization
// // // // //               </span>
// // // // //             </div>
// // // // //             <ul className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
// // // // //               {selectedRoute.stops.map((stop) => (
// // // // //                 <li
// // // // //                   key={stop.orderId}
// // // // //                   className={`px-4 py-3 flex items-start gap-3 ${
// // // // //                     selectedStopId === stop.orderId ? "bg-blue-50/60" : ""
// // // // //                   }`}
// // // // //                 >
// // // // //                   <div className="mt-1">
// // // // //                     <span className="h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-semibold border border-slate-300 bg-white">
// // // // //                       {stop.sequence}
// // // // //                     </span>
// // // // //                   </div>
// // // // //                   <div className="flex-1">
// // // // //                     <div className="flex items-center justify-between mb-1">
// // // // //                       <div>
// // // // //                         <p className="text-xs font-semibold text-slate-900">
// // // // //                           Order #{stop.orderId}
// // // // //                         </p>
// // // // //                         <p className="text-[11px] text-slate-500">
// // // // //                           {stop.receiverName}
// // // // //                         </p>
// // // // //                       </div>
// // // // //                       <div className="flex items-center gap-2">
// // // // //                         <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-50 border border-slate-200">
// // // // //                           Priority {stop.priority}
// // // // //                         </span>
// // // // //                         <span className="px-2 py-0.5 rounded-full text-[10px] bg-green-50 border border-green-200 text-green-700">
// // // // //                           {stop.status}
// // // // //                         </span>
// // // // //                       </div>
// // // // //                     </div>
// // // // //                     <p className="text-[11px] text-slate-600">
// // // // //                       {stop.receiverAddress}
// // // // //                     </p>
// // // // //                   </div>
// // // // //                 </li>
// // // // //               ))}
// // // // //             </ul>
// // // // //           </div>
// // // // //         </section>

// // // // //         {/* Right: Route options panel */}
// // // // //         <aside className="lg:col-span-1 flex flex-col gap-4">
// // // // //           <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
// // // // //             <div className="flex items-center justify-between mb-3">
// // // // //               <div>
// // // // //                 <h2 className="text-sm font-semibold text-slate-900">
// // // // //                   ORION-style Route Options
// // // // //                 </h2>
// // // // //                 <p className="text-[11px] text-slate-500">
// // // // //                   Choose the strategy that best fits your shift.
// // // // //                 </p>
// // // // //               </div>
// // // // //             </div>

// // // // //             <div className="space-y-3">
// // // // //               {routeOptions.map((opt, idx) => (
// // // // //                 <div
// // // // //                   key={opt.id}
// // // // //                   className={`rounded-xl border p-3 cursor-pointer transition shadow-sm
// // // // //                     ${
// // // // //                       idx === selectedRouteIndex
// // // // //                         ? "border-blue-600 ring-2 ring-blue-100 bg-blue-50/40"
// // // // //                         : "border-slate-200 hover:border-blue-400 hover:bg-slate-50"
// // // // //                     }`}
// // // // //                   onClick={() => {
// // // // //                     setSelectedRouteIndex(idx);
// // // // //                     setSelectedStopId(null);
// // // // //                   }}
// // // // //                 >
// // // // //                   <div className="flex items-start justify-between gap-2">
// // // // //                     <div>
// // // // //                       <div className="flex items-center gap-2 mb-1">
// // // // //                         <h3 className="text-sm font-semibold text-slate-900">
// // // // //                           {opt.label}
// // // // //                         </h3>
// // // // //                         <span
// // // // //                           className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
// // // // //                           style={{
// // // // //                             backgroundColor: `${opt.color}22`,
// // // // //                             color: opt.color,
// // // // //                           }}
// // // // //                         >
// // // // //                           {opt.badge}
// // // // //                         </span>
// // // // //                       </div>
// // // // //                       <p className="text-[11px] text-slate-600">
// // // // //                         {opt.description}
// // // // //                       </p>
// // // // //                     </div>
// // // // //                     <div className="text-right text-[11px]">
// // // // //                       <p className="font-semibold text-slate-900">
// // // // //                         Score {opt.stats.score}/100
// // // // //                       </p>
// // // // //                       <p className="text-slate-500">
// // // // //                         {opt.stops.length} stops ·{" "}
// // // // //                         {opt.stats.distanceKm.toFixed(1)} km
// // // // //                       </p>
// // // // //                       <p className="text-slate-500">
// // // // //                         ETA {formatMinutes(opt.stats.etaMinutes)}
// // // // //                       </p>
// // // // //                     </div>
// // // // //                   </div>

// // // // //                   <div className="mt-3 flex items-center justify-between">
// // // // //                     <div className="flex -space-x-1">
// // // // //                       {opt.stops.slice(0, 3).map((s) => (
// // // // //                         <div
// // // // //                           key={s.orderId}
// // // // //                           className="h-6 w-6 rounded-full border border-white bg-slate-100 flex items-center justify-center text-[10px] text-slate-700"
// // // // //                         >
// // // // //                           {s.sequence}
// // // // //                         </div>
// // // // //                       ))}
// // // // //                       {opt.stops.length > 3 && (
// // // // //                         <div className="h-6 w-6 rounded-full border border-dashed border-slate-300 bg-white flex items-center justify-center text-[10px] text-slate-400">
// // // // //                           +{opt.stops.length - 3}
// // // // //                         </div>
// // // // //                       )}
// // // // //                     </div>
// // // // //                     {idx === selectedRouteIndex ? (
// // // // //                       <span className="text-[11px] font-semibold text-blue-600">
// // // // //                         ✓ Selected
// // // // //                       </span>
// // // // //                     ) : (
// // // // //                       <button
// // // // //                         type="button"
// // // // //                         className="text-[11px] px-2.5 py-1 rounded-full border border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-600"
// // // // //                       >
// // // // //                         Preview route
// // // // //                       </button>
// // // // //                     )}
// // // // //                   </div>
// // // // //                 </div>
// // // // //               ))}
// // // // //             </div>
// // // // //           </div>

// // // // //           {/* Info card about how the system works */}
// // // // //           <div className="bg-slate-900 text-slate-50 rounded-2xl p-4 shadow-sm">
// // // // //             <h3 className="text-sm font-semibold mb-1">
// // // // //               How this optimization works
// // // // //             </h3>
// // // // //             <p className="text-[11px] text-slate-200 mb-2">
// // // // //               Inspired by UPS&apos;s ORION system, routes are calculated using:
// // // // //             </p>
// // // // //             <ul className="text-[11px] text-slate-200 space-y-1 list-disc pl-4">
// // // // //               <li>Stop priority and delivery promises.</li>
// // // // //               <li>Approximate distance between all locations.</li>
// // // // //               <li>Fuel and time trade-offs for each sequence.</li>
// // // // //             </ul>
// // // // //             <p className="text-[11px] text-slate-300 mt-2">
// // // // //               In production, you can plug in live traffic, weather, and vehicle
// // // // //               telemetry to continuously re-optimize during the day.
// // // // //             </p>
// // // // //           </div>
// // // // //         </aside>
// // // // //       </main>
// // // // //     </div>
// // // // //   );
// // // // // };

// // // // // export default DriverRoutePage;


// // // // // frontend/src/pages/driver/DriverRoutePage.jsx
// // // // import { useEffect, useState, useMemo } from "react";
// // // // import api from "../../services/api";
// // // // import { useAuth } from "../../context/AuthContext";
// // // // import { MapContainer, TileLayer, Marker, Polyline, Tooltip } from "react-leaflet";
// // // // import L from "leaflet";
// // // // import "leaflet/dist/leaflet.css";

// // // // // Fix default marker icons (Leaflet + Vite)
// // // // delete L.Icon.Default.prototype._getIconUrl;
// // // // L.Icon.Default.mergeOptions({
// // // //   iconRetinaUrl:
// // // //     "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
// // // //   iconUrl:
// // // //     "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
// // // //   shadowUrl:
// // // //     "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
// // // // });

// // // // const DEFAULT_CENTER = [13.0827, 80.2707]; // Chennai as fallback

// // // // const DriverRoutePage = () => {
// // // //   const { user } = useAuth();

// // // //   const [orders, setOrders] = useState([]);
// // // //   const [routeOptions, setRouteOptions] = useState([]);
// // // //   const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);

// // // //   const [routeCoords, setRouteCoords] = useState([]); // polyline points [lat, lng]
// // // //   const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);

// // // //   const [loading, setLoading] = useState(true);
// // // //   const [loadingRoute, setLoadingRoute] = useState(false);
// // // //   const [error, setError] = useState(null);

// // // //   // --------------------------------------------------
// // // //   // 1. Fetch optimized orders from backend
// // // //   // --------------------------------------------------
// // // //   useEffect(() => {
// // // //     const fetchOptimizedOrders = async () => {
// // // //       setLoading(true);
// // // //       setError(null);
// // // //       try {
// // // //         const res = await api.get("/driver/route/optimized"); // existing endpoint
// // // //         const data = res.data || [];

// // // //         setOrders(data);

// // // //         // Build base stops from orders
// // // //         const baseStops = data
// // // //           .map((o, idx) => {
// // // //             const lat =
// // // //               o.deliveryLatitude ??
// // // //               o.pickupLatitude ??
// // // //               null;
// // // //             const lng =
// // // //               o.deliveryLongitude ??
// // // //               o.pickupLongitude ??
// // // //               null;

// // // //             if (lat == null || lng == null) {
// // // //               return null;
// // // //             }

// // // //             return {
// // // //               id: o.id,
// // // //               orderId: o.id,
// // // //               index: idx,
// // // //               lat: Number(lat),
// // // //               lng: Number(lng),
// // // //               priority: o.priority ?? 2,
// // // //               address: o.receiverAddress || o.pickupAddress || "Unknown address",
// // // //               windowStart: o.scheduledDate || null,
// // // //             };
// // // //           })
// // // //           .filter((s) => s !== null);

// // // //         if (baseStops.length === 0) {
// // // //           setRouteOptions([]);
// // // //           setRouteCoords([]);
// // // //           setMapCenter(DEFAULT_CENTER);
// // // //           return;
// // // //         }

// // // //         // Center map on first stop
// // // //         setMapCenter([baseStops[0].lat, baseStops[0].lng]);

// // // //         // --------------------------------------------------
// // // //         // 2. Build 3 ORION-like options
// // // //         // --------------------------------------------------

// // // //         // Option 1: Priority first (High -> Normal -> Low), then near-neighbor
// // // //         const option1Stops = [...baseStops].sort((a, b) => {
// // // //           if (a.priority !== b.priority) return a.priority - b.priority;
// // // //           return a.lat - b.lat;
// // // //         });

// // // //         // Option 2: Distance-minimizing "snake" by latitude + longitude
// // // //         const option2Stops = [...baseStops].sort((a, b) => {
// // // //           if (a.lat !== b.lat) return a.lat - b.lat;
// // // //           return a.lng - b.lng;
// // // //         });

// // // //         // Option 3: "Time window" style – earlier scheduled / created first
// // // //         const option3Stops = [...baseStops].sort((a, b) => {
// // // //           if (a.windowStart && b.windowStart) {
// // // //             return new Date(a.windowStart) - new Date(b.windowStart);
// // // //           }
// // // //           return a.priority - b.priority;
// // // //         });

// // // //         const options = [
// // // //           {
// // // //             id: "orion_smart",
// // // //             label: "ORION Smart Route",
// // // //             description:
// // // //               "Balances priority, distance and sequence similar to UPS ORION.",
// // // //             stops: option1Stops,
// // // //           },
// // // //           {
// // // //             id: "shortest_miles",
// // // //             label: "Shortest Distance Route",
// // // //             description:
// // // //               "Minimizes total miles driven using a snake-style path.",
// // // //             stops: option2Stops,
// // // //           },
// // // //           {
// // // //             id: "time_window",
// // // //             label: "Time Window Route",
// // // //             description:
// // // //               "Prefers earlier time windows and high-priority deliveries.",
// // // //             stops: option3Stops,
// // // //           },
// // // //         ];

// // // //         setRouteOptions(options);
// // // //         setSelectedOptionIndex(0);

// // // //         // Auto-load first option on page load
// // // //         await previewRoute(0, options);
// // // //       } catch (err) {
// // // //         console.error("Error fetching optimized orders:", err);
// // // //         setError("Failed to load optimized route data.");
// // // //       } finally {
// // // //         setLoading(false);
// // // //       }
// // // //     };

// // // //     fetchOptimizedOrders();
// // // //     // eslint-disable-next-line react-hooks/exhaustive-deps
// // // //   }, []);

// // // //   // --------------------------------------------------
// // // //   // 3. OSRM helper: fetch road-following route
// // // //   // --------------------------------------------------
// // // //   const fetchOsrmRoute = async (stops) => {
// // // //     if (!stops || stops.length < 2) {
// // // //       return [];
// // // //     }

// // // //     const coordsStr = stops
// // // //       .map((s) => `${s.lng},${s.lat}`)
// // // //       .join(";");

// // // //     const url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`;

// // // //     const res = await fetch(url);
// // // //     const data = await res.json();

// // // //     if (!data.routes || data.routes.length === 0) {
// // // //       throw new Error("No route found from OSRM");
// // // //     }

// // // //     const geoCoords = data.routes[0].geometry.coordinates; // [lng, lat]
// // // //     const latLngs = geoCoords.map(([lng, lat]) => [lat, lng]);

// // // //     return latLngs;
// // // //   };

// // // //   // --------------------------------------------------
// // // //   // 4. Preview a selected route option (with OSRM)
// // // //   // --------------------------------------------------
// // // //   const previewRoute = async (
// // // //     optionIndex,
// // // //     optionsFromState = null
// // // //   ) => {
// // // //     const opts = optionsFromState || routeOptions;
// // // //     const option = opts[optionIndex];
// // // //     if (!option || !option.stops || option.stops.length === 0) {
// // // //       setRouteCoords([]);
// // // //       return;
// // // //     }

// // // //     try {
// // // //       setLoadingRoute(true);
// // // //       const latLngs = await fetchOsrmRoute(option.stops);

// // // //       if (latLngs.length > 0) {
// // // //         setRouteCoords(latLngs);

// // // //         // Center map roughly in the middle of the route
// // // //         const midIdx = Math.floor(latLngs.length / 2);
// // // //         setMapCenter(latLngs[midIdx]);
// // // //       } else {
// // // //         setRouteCoords([]);
// // // //       }
// // // //     } catch (err) {
// // // //       console.error("Error fetching OSRM route:", err);
// // // //       setError("Failed to get detailed road route.");
// // // //       setRouteCoords([]);
// // // //     } finally {
// // // //       setLoadingRoute(false);
// // // //     }
// // // //   };

// // // //   const selectedOption = useMemo(
// // // //     () => routeOptions[selectedOptionIndex] || null,
// // // //     [routeOptions, selectedOptionIndex]
// // // //   );

// // // //   // --------------------------------------------------
// // // //   // 5. Render
// // // //   // --------------------------------------------------
// // // //   if (loading) {
// // // //     return (
// // // //       <div className="flex items-center justify-center min-h-screen">
// // // //         Loading route map...
// // // //       </div>
// // // //     );
// // // //   }

// // // //   return (
// // // //     <div className="min-h-screen bg-gray-50 flex flex-col">
// // // //       {/* HEADER */}
// // // //       <header className="bg-white shadow">
// // // //         <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
// // // //           <div>
// // // //             <h1 className="text-2xl font-bold text-gray-900">
// // // //               Driver Route Planner
// // // //             </h1>
// // // //             <p className="text-sm text-gray-600">
// // // //               AI-assisted ORION-style route optimization
// // // //             </p>
// // // //           </div>
// // // //           <div className="text-right">
// // // //             <p className="text-sm text-gray-500">Driver</p>
// // // //             <p className="font-semibold text-gray-800">
// // // //               {user?.name || "Unknown"}
// // // //             </p>
// // // //           </div>
// // // //         </div>
// // // //       </header>

// // // //       {/* CONTENT */}
// // // //       <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
// // // //         {/* LEFT: Route options + stop list */}
// // // //         <div className="space-y-4 lg:col-span-1">
// // // //           {error && (
// // // //             <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">
// // // //               {error}
// // // //             </div>
// // // //           )}

// // // //           <div className="bg-white rounded-xl shadow p-4">
// // // //             <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
// // // //               📦 Route Options
// // // //             </h2>

// // // //             {routeOptions.length === 0 ? (
// // // //               <p className="text-sm text-gray-500">
// // // //                 No optimized deliveries assigned for today.
// // // //               </p>
// // // //             ) : (
// // // //               <div className="space-y-3">
// // // //                 {routeOptions.map((opt, idx) => (
// // // //                   <div
// // // //                     key={opt.id}
// // // //                     className={`border rounded-lg p-3 cursor-pointer transition ${
// // // //                       selectedOptionIndex === idx
// // // //                         ? "border-blue-500 bg-blue-50"
// // // //                         : "border-gray-200 hover:bg-gray-50"
// // // //                     }`}
// // // //                     onClick={() => {
// // // //                       setSelectedOptionIndex(idx);
// // // //                       previewRoute(idx);
// // // //                     }}
// // // //                   >
// // // //                     <div className="flex justify-between items-center mb-1">
// // // //                       <h3 className="font-semibold text-gray-900">
// // // //                         {opt.label}
// // // //                       </h3>
// // // //                       <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
// // // //                         {opt.stops.length} stops
// // // //                       </span>
// // // //                     </div>
// // // //                     <p className="text-xs text-gray-600">{opt.description}</p>
// // // //                     <button
// // // //                       type="button"
// // // //                       onClick={(e) => {
// // // //                         e.stopPropagation();
// // // //                         setSelectedOptionIndex(idx);
// // // //                         previewRoute(idx);
// // // //                       }}
// // // //                       className="mt-2 text-xs font-medium text-blue-600 hover:underline"
// // // //                     >
// // // //                       Preview route
// // // //                     </button>
// // // //                   </div>
// // // //                 ))}
// // // //               </div>
// // // //             )}
// // // //           </div>

// // // //           {/* STOP LIST FOR SELECTED OPTION */}
// // // //           {selectedOption && (
// // // //             <div className="bg-white rounded-xl shadow p-4 max-h-[320px] overflow-y-auto">
// // // //               <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
// // // //                 🗺️ Stops in Selected Route
// // // //               </h2>
// // // //               <ol className="space-y-2 text-sm">
// // // //                 {selectedOption.stops.map((stop, idx) => (
// // // //                   <li
// // // //                     key={`${selectedOption.id}-${stop.id}`}
// // // //                     className="flex items-start gap-2"
// // // //                   >
// // // //                     <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-xs">
// // // //                       {idx + 1}
// // // //                     </span>
// // // //                     <div>
// // // //                       <div className="font-medium">
// // // //                         Order #{stop.orderId} (P{stop.priority})
// // // //                       </div>
// // // //                       <div className="text-gray-600">{stop.address}</div>
// // // //                       <div className="text-[11px] text-gray-400">
// // // //                         Lat: {stop.lat.toFixed(5)}, Lng:{" "}
// // // //                         {stop.lng.toFixed(5)}
// // // //                       </div>
// // // //                     </div>
// // // //                   </li>
// // // //                 ))}
// // // //               </ol>
// // // //             </div>
// // // //           )}
// // // //         </div>

// // // //         {/* RIGHT: Map */}
// // // //         <div className="lg:col-span-2">
// // // //           <div className="bg-white rounded-xl shadow overflow-hidden h-[520px] flex flex-col">
// // // //             <div className="p-3 border-b flex justify-between items-center">
// // // //               <div>
// // // //                 <h2 className="font-semibold text-gray-900">
// // // //                   Live Route Map
// // // //                 </h2>
// // // //                 <p className="text-xs text-gray-500">
// // // //                   Road-accurate routing powered by OSRM (like ORION).
// // // //                 </p>
// // // //               </div>
// // // //               {loadingRoute && (
// // // //                 <span className="text-xs text-blue-600">
// // // //                   Calculating route…
// // // //                 </span>
// // // //               )}
// // // //             </div>

// // // //             <div className="flex-1">
// // // //               <MapContainer
// // // //                 center={mapCenter}
// // // //                 zoom={12}
// // // //                 style={{ height: "100%", width: "100%" }}
// // // //                 scrollWheelZoom={true}
// // // //               >
// // // //                 <TileLayer
// // // //                   attribution='&copy; OpenStreetMap contributors'
// // // //                   url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
// // // //                 />

// // // //                 {/* Stops as markers */}
// // // //                 {selectedOption &&
// // // //                   selectedOption.stops.map((stop, idx) => (
// // // //                     <Marker
// // // //                       key={`${selectedOption.id}-marker-${stop.id}`}
// // // //                       position={[stop.lat, stop.lng]}
// // // //                     >
// // // //                       <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
// // // //                         <div className="text-xs">
// // // //                           <div className="font-semibold">
// // // //                             Stop {idx + 1} – Order #{stop.orderId}
// // // //                           </div>
// // // //                           <div>{stop.address}</div>
// // // //                           <div className="text-[10px] text-gray-300">
// // // //                             {stop.lat.toFixed(5)}, {stop.lng.toFixed(5)}
// // // //                           </div>
// // // //                         </div>
// // // //                       </Tooltip>
// // // //                     </Marker>
// // // //                   ))}

// // // //                 {/* Road-following route polyline */}
// // // //                 {routeCoords.length > 1 && (
// // // //                   <Polyline positions={routeCoords} />
// // // //                 )}
// // // //               </MapContainer>
// // // //             </div>
// // // //           </div>
// // // //         </div>
// // // //       </main>
// // // //     </div>
// // // //   );
// // // // };

// // // // export default DriverRoutePage;

// // // // frontend/src/pages/driver/DriverRoutePage.jsx
// // // import { useEffect, useState, useMemo } from "react";
// // // import api from "../../services/api";
// // // import { useAuth } from "../../context/AuthContext";
// // // import { MapContainer, TileLayer, Marker, Polyline, Tooltip } from "react-leaflet";
// // // import L from "leaflet";
// // // import "leaflet/dist/leaflet.css";

// // // // Fix default marker icons
// // // delete L.Icon.Default.prototype._getIconUrl;
// // // L.Icon.Default.mergeOptions({
// // //   iconRetinaUrl:
// // //     "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
// // //   iconUrl:
// // //     "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
// // //   shadowUrl:
// // //     "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
// // // });

// // // const DEFAULT_CENTER = [13.0827, 80.2707]; // Chennai fallback

// // // // -------------------------
// // // // SAFE COORDINATE CHECKER
// // // // -------------------------
// // // const isValidCoord = (lat, lng) => {
// // //   return (
// // //     typeof lat === "number" &&
// // //     typeof lng === "number" &&
// // //     !isNaN(lat) &&
// // //     !isNaN(lng) &&
// // //     lat !== 0 &&
// // //     lng !== 0
// // //   );
// // // };

// // // const DriverRoutePage = () => {
// // //   const { user } = useAuth();

// // //   const [orders, setOrders] = useState([]);
// // //   const [routeOptions, setRouteOptions] = useState([]);
// // //   const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);

// // //   const [routeCoords, setRouteCoords] = useState([]);
// // //   const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);

// // //   const [loading, setLoading] = useState(true);
// // //   const [loadingRoute, setLoadingRoute] = useState(false);
// // //   const [error, setError] = useState(null);

// // //   // --------------------------------------------------
// // //   // Fetch optimized orders
// // //   // --------------------------------------------------
// // //   useEffect(() => {
// // //     const fetchOptimizedOrders = async () => {
// // //       setLoading(true);
// // //       try {
// // //         const res = await api.get("/driver/route/optimized");
// // //         const data = res.data || [];

// // //         // Convert raw orders → stops with validated coordinates
// // //         const stops = data
// // //           .map((o, idx) => {
// // //             const lat = Number(
// // //               o.deliveryLatitude ?? o.pickupLatitude ?? null
// // //             );
// // //             const lng = Number(
// // //               o.deliveryLongitude ?? o.pickupLongitude ?? null
// // //             );

// // //             if (!isValidCoord(lat, lng)) return null;

// // //             return {
// // //               id: o.id,
// // //               orderId: o.id,
// // //               index: idx,
// // //               lat,
// // //               lng,
// // //               priority: o.priority ?? 2,
// // //               address: o.receiverAddress || o.pickupAddress || "Unknown address",
// // //               windowStart: o.scheduledDate || null,
// // //             };
// // //           })
// // //           .filter((s) => s !== null);

// // //         if (stops.length === 0) {
// // //           setError("No valid stops found. Check geocoding / address input.");
// // //           setRouteOptions([]);
// // //           setRouteCoords([]);
// // //           setMapCenter(DEFAULT_CENTER);
// // //           return;
// // //         }

// // //         // Center on first valid stop
// // //         setMapCenter([stops[0].lat, stops[0].lng]);

        
// // //         // Build ORION-like options
        
// // //         const option1 = [...stops].sort((a, b) => {
// // //           if (a.priority !== b.priority) return a.priority - b.priority;
// // //           return a.lat - b.lat;
// // //         });

// // //         const option2 = [...stops].sort((a, b) => {
// // //           if (a.lat !== b.lat) return a.lat - b.lat;
// // //           return a.lng - b.lng;
// // //         });

// // //         const option3 = [...stops].sort((a, b) => {
// // //           if (a.windowStart && b.windowStart) {
// // //             return new Date(a.windowStart) - new Date(b.windowStart);
// // //           }
// // //           return a.priority - b.priority;
// // //         });

// // //         const options = [
// // //           {
// // //             id: "orion_smart",
// // //             label: "ORION Smart Route",
// // //             description: "AI balanced: priority + distance + efficiency.",
// // //             stops: option1,
// // //           },
// // //           {
// // //             id: "shortest_miles",
// // //             label: "Shortest Distance Route",
// // //             description: "Minimizes miles driven using geometric order.",
// // //             stops: option2,
// // //           },
// // //           {
// // //             id: "time_window",
// // //             label: "Time Window Route",
// // //             description: "Sorts by earliest time window or high priority.",
// // //             stops: option3,
// // //           },
// // //         ];

// // //         setRouteOptions(options);
// // //         setSelectedOptionIndex(0);

// // //         await previewRoute(0, options);
// // //       } catch (err) {
// // //         console.error("Error loading route:", err);
// // //         setError("Failed to load route data");
// // //       } finally {
// // //         setLoading(false);
// // //       }
// // //     };

// // //     fetchOptimizedOrders();
// // //   }, []);

// // //   // --------------------------------------------------
// // //   // OSRM helper
// // //   // --------------------------------------------------
// // //   const fetchOsrmRoute = async (stops) => {
// // //     // Validate all stops
// // //     const valid = stops.every((s) => isValidCoord(s.lat, s.lng));
// // //     if (!valid) throw new Error("Invalid coordinates in stops.");

// // //     const coordsStr = stops.map((s) => `${s.lng},${s.lat}`).join(";");

// // //     const url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`;

// // //     const res = await fetch(url);
// // //     const data = await res.json();

// // //     if (!data.routes || data.routes.length === 0) {
// // //       throw new Error("OSRM could not compute route.");
// // //     }

// // //     return data.routes[0].geometry.coordinates.map(([lng, lat]) => [
// // //       lat,
// // //       lng,
// // //     ]);
// // //   };

// // //   // --------------------------------------------------
// // //   // Preview selected route
// // //   // --------------------------------------------------
// // //   const previewRoute = async (optionIndex, optionsFromState = null) => {
// // //     const opts = optionsFromState || routeOptions;
// // //     const option = opts[optionIndex];

// // //     if (!option || option.stops.length === 0) {
// // //       setRouteCoords([]);
// // //       return;
// // //     }

// // //     try {
// // //       setLoadingRoute(true);
// // //       setError(null);

// // //       const latLngs = await fetchOsrmRoute(option.stops);

// // //       if (latLngs.length > 0) {
// // //         setRouteCoords(latLngs);
// // //         const mid = Math.floor(latLngs.length / 2);
// // //         setMapCenter(latLngs[mid]);
// // //       }
// // //     } catch (err) {
// // //       console.error("Route preview error:", err);
// // //       setError(err.message || "Failed to calculate route.");
// // //       setRouteCoords([]);
// // //     } finally {
// // //       setLoadingRoute(false);
// // //     }
// // //   };

// // //   const selectedOption = useMemo(
// // //     () => routeOptions[selectedOptionIndex] || null,
// // //     [routeOptions, selectedOptionIndex]
// // //   );

// // //   // --------------------------------------------------
// // //   // Render
// // //   // --------------------------------------------------
// // //   if (loading) {
// // //     return (
// // //       <div className="flex items-center justify-center min-h-screen">
// // //         Loading route map…
// // //       </div>
// // //     );
// // //   }

// // //   return (
// // //     <div className="min-h-screen bg-gray-50 flex flex-col">
// // //       {/* HEADER */}
// // //       <header className="bg-white shadow">
// // //         <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
// // //           <div>
// // //             <h1 className="text-2xl font-bold">Driver Route Planner</h1>
// // //             <p className="text-sm text-gray-600">Road-accurate routing (OSRM)</p>
// // //           </div>
// // //           <div className="text-right">
// // //             <p className="text-sm text-gray-500">Driver</p>
// // //             <p className="font-semibold">{user?.name || "Unknown"}</p>
// // //           </div>
// // //         </div>
// // //       </header>

// // //       <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
// // //         {/* LEFT PANEL */}
// // //         <div className="space-y-4">
// // //           {error && (
// // //             <div className="bg-red-100 border border-red-300 text-red-800 px-3 py-2 rounded">
// // //               {error}
// // //             </div>
// // //           )}

// // //           {/* Route options */}
// // //           <div className="bg-white shadow p-4 rounded-lg">
// // //             <h2 className="text-lg font-semibold mb-2">📦 Route Options</h2>

// // //             {routeOptions.length === 0 ? (
// // //               <p>No routes available</p>
// // //             ) : (
// // //               routeOptions.map((opt, idx) => (
// // //                 <div
// // //                   key={opt.id}
// // //                   className={`border p-3 rounded mb-2 cursor-pointer ${
// // //                     selectedOptionIndex === idx
// // //                       ? "border-blue-600 bg-blue-50"
// // //                       : "border-gray-200 hover:bg-gray-50"
// // //                   }`}
// // //                   onClick={() => {
// // //                     setSelectedOptionIndex(idx);
// // //                     previewRoute(idx);
// // //                   }}
// // //                 >
// // //                   <div className="flex justify-between">
// // //                     <p className="font-semibold">{opt.label}</p>
// // //                     <span className="text-xs bg-gray-100 px-2 rounded">
// // //                       {opt.stops.length} stops
// // //                     </span>
// // //                   </div>
// // //                   <p className="text-xs text-gray-600">{opt.description}</p>
// // //                 </div>
// // //               ))
// // //             )}
// // //           </div>

// // //           {/* Stop list */}
// // //           {selectedOption && (
// // //             <div className="bg-white shadow p-4 rounded-lg max-h-[300px] overflow-y-auto">
// // //               <h2 className="text-lg font-semibold mb-2">🗺️ Stops</h2>
// // //               <ol className="space-y-2 text-sm">
// // //                 {selectedOption.stops.map((stop, idx) => (
// // //                   <li key={stop.id} className="flex gap-2">
// // //                     <span className="bg-blue-600 text-white h-5 w-5 flex items-center justify-center rounded-full text-xs">
// // //                       {idx + 1}
// // //                     </span>
// // //                     <div>
// // //                       <p className="font-medium">Order #{stop.orderId}</p>
// // //                       <p className="text-gray-600">{stop.address}</p>
// // //                     </div>
// // //                   </li>
// // //                 ))}
// // //               </ol>
// // //             </div>
// // //           )}
// // //         </div>

// // //         {/* MAP SECTION */}
// // //         <div className="lg:col-span-2">
// // //           <div className="bg-white shadow rounded-lg overflow-hidden h-[520px]">
// // //             <MapContainer
// // //               center={mapCenter}
// // //               zoom={13}
// // //               scrollWheelZoom={true}
// // //               style={{ height: "100%", width: "100%" }}
// // //             >
// // //               <TileLayer
// // //                 attribution="&copy; OpenStreetMap contributors"
// // //                 url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
// // //               />

// // //               {/* Markers */}
// // //               {selectedOption &&
// // //                 selectedOption.stops.map((stop, idx) => (
// // //                   <Marker key={stop.id} position={[stop.lat, stop.lng]}>
// // //                     <Tooltip>
// // //                       Stop {idx + 1} – Order #{stop.orderId}
// // //                       <br />
// // //                       {stop.address}
// // //                     </Tooltip>
// // //                   </Marker>
// // //                 ))}

// // //               {/* Polyline route */}
// // //               {routeCoords.length > 1 && (
// // //                 <Polyline positions={routeCoords} color="blue" />
// // //               )}
// // //             </MapContainer>
// // //           </div>
// // //         </div>
// // //       </main>
// // //     </div>
// // //   );
// // // };

// // // export default DriverRoutePage;


// // // frontend/src/pages/driver/DriverRoutePage.jsx
// // import { useEffect, useState, useMemo } from "react";
// // import api from "../../services/api";
// // import { useAuth } from "../../context/AuthContext";
// // import { MapContainer, TileLayer, Marker, Polyline, Tooltip } from "react-leaflet";
// // import L from "leaflet";
// // import "leaflet/dist/leaflet.css";

// // // Fix default marker icons
// // delete L.Icon.Default.prototype._getIconUrl;
// // L.Icon.Default.mergeOptions({
// //   iconRetinaUrl:
// //     "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
// //   iconUrl:
// //     "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
// //   shadowUrl:
// //     "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
// // });

// // const DEFAULT_CENTER = [13.0827, 80.2707]; // Chennai fallback

// // // SAFE COORDINATE CHECKER
// // const isValidCoord = (lat, lng) => {
// //   return (
// //     typeof lat === "number" &&
// //     typeof lng === "number" &&
// //     !isNaN(lat) &&
// //     !isNaN(lng) &&
// //     lat !== 0 &&
// //     lng !== 0
// //   );
// // };

// // const DriverRoutePage = () => {
// //   const { user } = useAuth();

// //   const [orders, setOrders] = useState([]);
// //   const [routeOptions, setRouteOptions] = useState([]);
// //   const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);

// //   const [routeCoords, setRouteCoords] = useState([]);
// //   const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);

// //   const [loading, setLoading] = useState(true);
// //   const [loadingRoute, setLoadingRoute] = useState(false);
// //   const [error, setError] = useState(null);

// //   // 🆕 Road issues for map
// //   const [roadIssues, setRoadIssues] = useState([]);

// //   // --------------------------------------------------
// //   // Fetch optimized orders + active road issues
// //   // --------------------------------------------------
// //   useEffect(() => {
// //     const fetchData = async () => {
// //       setLoading(true);
// //       try {
// //         // Get optimized orders and active road issues in parallel
// //         const [routeRes, issuesRes] = await Promise.all([
// //           api.get("/driver/route/optimized"),
// //           api.get("/driver/road-issues")
// //         ]);

// //         const data = routeRes.data || [];
// //         setOrders(data);

// //         const issues = issuesRes.data || [];
// //         setRoadIssues(issues);

// //         // Convert raw orders → stops with validated coordinates
// //         const stops = data
// //           .map((o, idx) => {
// //             const lat = Number(
// //               o.deliveryLatitude ?? o.pickupLatitude ?? null
// //             );
// //             const lng = Number(
// //               o.deliveryLongitude ?? o.pickupLongitude ?? null
// //             );

// //             if (!isValidCoord(lat, lng)) return null;

// //             return {
// //               id: o.id,
// //               orderId: o.id,
// //               index: idx,
// //               lat,
// //               lng,
// //               priority: o.priority ?? 2,
// //               address: o.receiverAddress || o.pickupAddress || "Unknown address",
// //               windowStart: o.scheduledDate || null,
// //             };
// //           })
// //           .filter((s) => s !== null);

// //         if (stops.length === 0) {
// //           setError("No valid stops found. Check geocoding / address input.");
// //           setRouteOptions([]);
// //           setRouteCoords([]);
// //           setMapCenter(DEFAULT_CENTER);
// //           return;
// //         }

// //         // Center on first valid stop
// //         setMapCenter([stops[0].lat, stops[0].lng]);

// //         // Build ORION-like options
// //         const option1 = [...stops].sort((a, b) => {
// //           if (a.priority !== b.priority) return a.priority - b.priority;
// //           return a.lat - b.lat;
// //         });

// //         const option2 = [...stops].sort((a, b) => {
// //           if (a.lat !== b.lat) return a.lat - b.lat;
// //           return a.lng - b.lng;
// //         });

// //         const option3 = [...stops].sort((a, b) => {
// //           if (a.windowStart && b.windowStart) {
// //             return new Date(a.windowStart) - new Date(b.windowStart);
// //           }
// //           return a.priority - b.priority;
// //         });

// //         const options = [
// //           {
// //             id: "orion_smart",
// //             label: "ORION Smart Route",
// //             description: "AI balanced: priority + distance + efficiency.",
// //             stops: option1,
// //           },
// //           {
// //             id: "shortest_miles",
// //             label: "Shortest Distance Route",
// //             description: "Minimizes miles driven using geometric order.",
// //             stops: option2,
// //           },
// //           {
// //             id: "time_window",
// //             label: "Time Window Route",
// //             description: "Sorts by earliest time window or high priority.",
// //             stops: option3,
// //           },
// //         ];

// //         setRouteOptions(options);
// //         setSelectedOptionIndex(0);

// //         await previewRoute(0, options);
// //       } catch (err) {
// //         console.error("Error loading route:", err);
// //         setError("Failed to load route data");
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchData();
// //   }, []);

// //   // --------------------------------------------------
// //   // OSRM helper
// //   // --------------------------------------------------
// //   const fetchOsrmRoute = async (stops) => {
// //     const valid = stops.every((s) => isValidCoord(s.lat, s.lng));
// //     if (!valid) throw new Error("Invalid coordinates in stops.");

// //     const coordsStr = stops.map((s) => `${s.lng},${s.lat}`).join(";");

// //     const url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`;

// //     const res = await fetch(url);
// //     const data = await res.json();

// //     if (!data.routes || data.routes.length === 0) {
// //       throw new Error("OSRM could not compute route.");
// //     }

// //     return data.routes[0].geometry.coordinates.map(([lng, lat]) => [
// //       lat,
// //       lng,
// //     ]);
// //   };

// //   // --------------------------------------------------
// //   // Preview selected route
// //   // --------------------------------------------------
// //   const previewRoute = async (optionIndex, optionsFromState = null) => {
// //     const opts = optionsFromState || routeOptions;
// //     const option = opts[optionIndex];

// //     if (!option || option.stops.length === 0) {
// //       setRouteCoords([]);
// //       return;
// //     }

// //     try {
// //       setLoadingRoute(true);
// //       setError(null);

// //       const latLngs = await fetchOsrmRoute(option.stops);

// //       if (latLngs.length > 0) {
// //         setRouteCoords(latLngs);
// //         const mid = Math.floor(latLngs.length / 2);
// //         setMapCenter(latLngs[mid]);
// //       }
// //     } catch (err) {
// //       console.error("Route preview error:", err);
// //       setError(err.message || "Failed to calculate route.");
// //       setRouteCoords([]);
// //     } finally {
// //       setLoadingRoute(false);
// //     }
// //   };

// //   const selectedOption = useMemo(
// //     () => routeOptions[selectedOptionIndex] || null,
// //     [routeOptions, selectedOptionIndex]
// //   );

// //   // --------------------------------------------------
// //   // Render
// //   // --------------------------------------------------
// //   if (loading) {
// //     return (
// //       <div className="flex items-center justify-center min-h-screen">
// //         Loading route map…
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="min-h-screen bg-gray-50 flex flex-col">
// //       {/* HEADER */}
// //       <header className="bg-white shadow">
// //         <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
// //           <div>
// //             <h1 className="text-2xl font-bold">Driver Route Planner</h1>
// //             <p className="text-sm text-gray-600">
// //               Road-accurate routing (OSRM) + road issues
// //             </p>
// //           </div>
// //           <div className="text-right">
// //             <p className="text-sm text-gray-500">Driver</p>
// //             <p className="font-semibold">{user?.name || "Unknown"}</p>
// //           </div>
// //         </div>
// //       </header>

// //       <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
// //         {/* LEFT PANEL */}
// //         <div className="space-y-4">
// //           {error && (
// //             <div className="bg-red-100 border border-red-300 text-red-800 px-3 py-2 rounded">
// //               {error}
// //             </div>
// //           )}

// //           {/* Route options */}
// //           <div className="bg-white shadow p-4 rounded-lg">
// //             <h2 className="text-lg font-semibold mb-2">📦 Route Options</h2>

// //             {routeOptions.length === 0 ? (
// //               <p>No routes available</p>
// //             ) : (
// //               routeOptions.map((opt, idx) => (
// //                 <div
// //                   key={opt.id}
// //                   className={`border p-3 rounded mb-2 cursor-pointer ${
// //                     selectedOptionIndex === idx
// //                       ? "border-blue-600 bg-blue-50"
// //                       : "border-gray-200 hover:bg-gray-50"
// //                   }`}
// //                   onClick={() => {
// //                     setSelectedOptionIndex(idx);
// //                     previewRoute(idx);
// //                   }}
// //                 >
// //                   <div className="flex justify-between">
// //                     <p className="font-semibold">{opt.label}</p>
// //                     <span className="text-xs bg-gray-100 px-2 rounded">
// //                       {opt.stops.length} stops
// //                     </span>
// //                   </div>
// //                   <p className="text-xs text-gray-600">{opt.description}</p>
// //                 </div>
// //               ))
// //             )}
// //           </div>

// //           {/* Stop list */}
// //           {selectedOption && (
// //             <div className="bg-white shadow p-4 rounded-lg max-h-[300px] overflow-y-auto">
// //               <h2 className="text-lg font-semibold mb-2">🗺️ Stops</h2>
// //               <ol className="space-y-2 text-sm">
// //                 {selectedOption.stops.map((stop, idx) => (
// //                   <li key={stop.id} className="flex gap-2">
// //                     <span className="bg-blue-600 text-white h-5 w-5 flex items-center justify-center rounded-full text-xs">
// //                       {idx + 1}
// //                     </span>
// //                     <div>
// //                       <p className="font-medium">Order #{stop.orderId}</p>
// //                       <p className="text-gray-600">{stop.address}</p>
// //                     </div>
// //                   </li>
// //                 ))}
// //               </ol>
// //             </div>
// //           )}

// //           {/* 🆕 Road issue legend */}
// //           <div className="bg-white shadow p-4 rounded-lg">
// //             <h2 className="text-sm font-semibold mb-1">⚠️ Road Issues</h2>
// //             <p className="text-xs text-gray-600 mb-1">
// //               Any current road issues affecting your wider area are shown on the
// //               map as warning markers.
// //             </p>
// //             <p className="text-xs text-gray-700 font-medium">
// //               Active issues: {roadIssues.length}
// //             </p>
// //           </div>
// //         </div>

// //         {/* MAP SECTION */}
// //         <div className="lg:col-span-2">
// //           <div className="bg-white shadow rounded-lg overflow-hidden h-[520px]">
// //             <MapContainer
// //               center={mapCenter}
// //               zoom={13}
// //               scrollWheelZoom={true}
// //               style={{ height: "100%", width: "100%" }}
// //             >
// //               <TileLayer
// //                 attribution="&copy; OpenStreetMap contributors"
// //                 url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
// //               />

// //               {/* Stop markers */}
// //               {selectedOption &&
// //                 selectedOption.stops.map((stop, idx) => (
// //                   <Marker key={stop.id} position={[stop.lat, stop.lng]}>
// //                     <Tooltip>
// //                       Stop {idx + 1} – Order #{stop.orderId}
// //                       <br />
// //                       {stop.address}
// //                     </Tooltip>
// //                   </Marker>
// //                 ))}

// //               {/* Polyline route */}
// //               {routeCoords.length > 1 && (
// //                 <Polyline positions={routeCoords} color="blue" />
// //               )}

// //               {/* 🆕 Road issue markers */}
// //               {roadIssues.map((issue) =>
// //                 isValidCoord(issue.latitude, issue.longitude) ? (
// //                   <Marker
// //                     key={`road-${issue.id}`}
// //                     position={[issue.latitude, issue.longitude]}
// //                   >
// //                     <Tooltip>
// //                       ⚠️ {issue.issueType} ({issue.severity})
// //                       <br />
// //                       {issue.description}
// //                       <br />
// //                       Reported:{" "}
// //                       {issue.reportedAt
// //                         ? new Date(issue.reportedAt).toLocaleString()
// //                         : ""}
// //                     </Tooltip>
// //                   </Marker>
// //                 ) : null
// //               )}
// //             </MapContainer>
// //           </div>

// //           {loadingRoute && (
// //             <p className="text-xs text-gray-500 mt-2">
// //               Calculating route path…
// //             </p>
// //           )}
// //         </div>
// //       </main>
// //     </div>
// //   );
// // };

// // export default DriverRoutePage;


// // frontend/src/pages/driver/DriverRoutePage.jsx
// import { useEffect, useState, useMemo } from "react";
// import api from "../../services/api";
// import { useAuth } from "../../context/AuthContext";
// import { MapContainer, TileLayer, Marker, Polyline, Tooltip, Circle } from "react-leaflet";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";

// // Fix default marker icons
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
//   iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
// });

// // Custom warning icon for road issues
// const warningIcon = L.divIcon({
//   html: `<div style="
//     background-color: #dc2626;
//     border: 3px solid #fff;
//     border-radius: 50%;
//     width: 32px;
//     height: 32px;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     font-size: 18px;
//     box-shadow: 0 2px 8px rgba(0,0,0,0.3);
//   ">⚠️</div>`,
//   className: "",
//   iconSize: [32, 32],
//   iconAnchor: [16, 16],
// });

// // Custom delivery marker icons based on priority
// const createDeliveryIcon = (number, priority) => {
//   const colors = {
//     5: "#dc2626", // Critical - Red
//     4: "#ea580c", // High - Orange
//     3: "#eab308", // Medium - Yellow
//     2: "#3b82f6", // Low - Blue
//     1: "#22c55e", // Very Low - Green
//   };
  
//   const color = colors[priority] || "#6b7280";
  
//   return L.divIcon({
//     html: `<div style="
//       background-color: ${color};
//       border: 3px solid #fff;
//       border-radius: 50%;
//       width: 36px;
//       height: 36px;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       font-weight: bold;
//       color: white;
//       font-size: 14px;
//       box-shadow: 0 2px 8px rgba(0,0,0,0.3);
//     ">${number}</div>`,
//     className: "",
//     iconSize: [36, 36],
//     iconAnchor: [18, 36],
//   });
// };

// const DEFAULT_CENTER = [13.0827, 80.2707]; // Chennai fallback

// // SAFE COORDINATE CHECKER
// const isValidCoord = (lat, lng) => {
//   return (
//     typeof lat === "number" &&
//     typeof lng === "number" &&
//     !isNaN(lat) &&
//     !isNaN(lng) &&
//     lat !== 0 &&
//     lng !== 0
//   );
// };

// // Calculate distance between two points (Haversine formula)
// const calculateDistance = (lat1, lng1, lat2, lng2) => {
//   const R = 6371; // Earth's radius in km
//   const dLat = ((lat2 - lat1) * Math.PI) / 180;
//   const dLng = ((lng2 - lng1) * Math.PI) / 180;
//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos((lat1 * Math.PI) / 180) *
//       Math.cos((lat2 * Math.PI) / 180) *
//       Math.sin(dLng / 2) *
//       Math.sin(dLng / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c;
// };

// // Advanced Nearest Neighbor Algorithm with Priority
// const nearestNeighborRoute = (stops) => {
//   if (stops.length === 0) return [];
  
//   const unvisited = [...stops];
//   const route = [];
  
//   // Start with highest priority stop
//   const startIdx = unvisited.findIndex(s => s.priority === Math.max(...unvisited.map(x => x.priority)));
//   let current = unvisited.splice(startIdx, 1)[0];
//   route.push(current);
  
//   while (unvisited.length > 0) {
//     let nearestIdx = 0;
//     let minScore = Infinity;
    
//     // Find best next stop based on distance and priority
//     for (let i = 0; i < unvisited.length; i++) {
//       const distance = calculateDistance(
//         current.lat,
//         current.lng,
//         unvisited[i].lat,
//         unvisited[i].lng
//       );
      
//       // Score = distance / priority (lower is better)
//       // This favors nearby high-priority stops
//       const score = distance / (unvisited[i].priority || 1);
      
//       if (score < minScore) {
//         minScore = score;
//         nearestIdx = i;
//       }
//     }
    
//     current = unvisited.splice(nearestIdx, 1)[0];
//     route.push(current);
//   }
  
//   return route;
// };

// // 2-Opt optimization for route improvement
// const twoOptOptimization = (route) => {
//   if (route.length < 4) return route;
  
//   let improved = true;
//   let optimizedRoute = [...route];
  
//   // Preserve first stop (highest priority)
//   const firstStop = optimizedRoute[0];
//   let workingRoute = optimizedRoute.slice(1);
  
//   while (improved) {
//     improved = false;
    
//     for (let i = 0; i < workingRoute.length - 2; i++) {
//       for (let j = i + 2; j < workingRoute.length; j++) {
//         const current = calculateDistance(
//           workingRoute[i].lat,
//           workingRoute[i].lng,
//           workingRoute[i + 1].lat,
//           workingRoute[i + 1].lng
//         ) + calculateDistance(
//           workingRoute[j].lat,
//           workingRoute[j].lng,
//           workingRoute[j + 1]?.lat || workingRoute[0].lat,
//           workingRoute[j + 1]?.lng || workingRoute[0].lng
//         );
        
//         const swapped = calculateDistance(
//           workingRoute[i].lat,
//           workingRoute[i].lng,
//           workingRoute[j].lat,
//           workingRoute[j].lng
//         ) + calculateDistance(
//           workingRoute[i + 1].lat,
//           workingRoute[i + 1].lng,
//           workingRoute[j + 1]?.lat || workingRoute[0].lat,
//           workingRoute[j + 1]?.lng || workingRoute[0].lng
//         );
        
//         if (swapped < current) {
//           // Reverse the segment between i+1 and j
//           workingRoute = [
//             ...workingRoute.slice(0, i + 1),
//             ...workingRoute.slice(i + 1, j + 1).reverse(),
//             ...workingRoute.slice(j + 1),
//           ];
//           improved = true;
//         }
//       }
//     }
//   }
  
//   return [firstStop, ...workingRoute];
// };

// // Check if a stop is near any road issues
// const isNearRoadIssue = (stop, roadIssues, threshold = 2) => {
//   return roadIssues.some(issue => {
//     if (!isValidCoord(issue.latitude, issue.longitude)) return false;
//     const distance = calculateDistance(
//       stop.lat,
//       stop.lng,
//       issue.latitude,
//       issue.longitude
//     );
//     return distance < threshold; // within 2km
//   });
// };

// const DriverRoutePage = () => {
//   const { user } = useAuth();

//   const [orders, setOrders] = useState([]);
//   const [routeOptions, setRouteOptions] = useState([]);
//   const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);

//   const [routeCoords, setRouteCoords] = useState([]);
//   const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);

//   const [loading, setLoading] = useState(true);
//   const [loadingRoute, setLoadingRoute] = useState(false);
//   const [error, setError] = useState(null);

//   const [roadIssues, setRoadIssues] = useState([]);
//   const [routeStats, setRouteStats] = useState(null);

//   // Fetch optimized orders + active road issues
//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         const [routeRes, issuesRes] = await Promise.all([
//           api.get("/driver/route/optimized"),
//           api.get("/driver/road-issues")
//         ]);

//         const data = routeRes.data || [];
//         setOrders(data);

//         const issues = issuesRes.data || [];
//         setRoadIssues(issues);

//         // Convert raw orders → stops with validated coordinates
//         const stops = data
//           .map((o, idx) => {
//             const lat = Number(o.deliveryLatitude ?? o.pickupLatitude ?? null);
//             const lng = Number(o.deliveryLongitude ?? o.pickupLongitude ?? null);

//             if (!isValidCoord(lat, lng)) return null;

//             return {
//               id: o.id,
//               orderId: o.id,
//               index: idx,
//               lat,
//               lng,
//               priority: o.aiPriority || o.priority || 2,
//               address: o.receiverAddress || o.pickupAddress || "Unknown address",
//               windowStart: o.scheduledDate || null,
//               receiverName: o.receiverName || "Customer",
//             };
//           })
//           .filter((s) => s !== null);

//         if (stops.length === 0) {
//           setError("No valid stops found. Check geocoding / address input.");
//           setRouteOptions([]);
//           setRouteCoords([]);
//           setMapCenter(DEFAULT_CENTER);
//           return;
//         }

//         // Center on first valid stop
//         setMapCenter([stops[0].lat, stops[0].lng]);

//         // Build optimized route options
//         // Option 1: AI Smart Route (Nearest Neighbor + Priority + 2-Opt)
//         const nnRoute = nearestNeighborRoute([...stops]);
//         const optimizedRoute = twoOptOptimization(nnRoute);

//         // Option 2: Priority First Route
//         const priorityRoute = [...stops].sort((a, b) => {
//           if (b.priority !== a.priority) return b.priority - a.priority;
//           return calculateDistance(a.lat, a.lng, b.lat, b.lng);
//         });

//         // Option 3: Time Window Route
//         const timeWindowRoute = [...stops].sort((a, b) => {
//           if (a.windowStart && b.windowStart) {
//             return new Date(a.windowStart) - new Date(b.windowStart);
//           }
//           if (b.priority !== a.priority) return b.priority - a.priority;
//           return 0;
//         });

//         // Option 4: Avoid Road Issues Route
//         const safeStops = stops.filter(s => !isNearRoadIssue(s, issues));
//         const affectedStops = stops.filter(s => isNearRoadIssue(s, issues));
//         const avoidIssuesRoute = [
//           ...safeStops.sort((a, b) => b.priority - a.priority),
//           ...affectedStops.sort((a, b) => b.priority - a.priority)
//         ];

//         const options = [
//           {
//             id: "ai_optimized",
//             label: "🎯 AI Optimized Route",
//             description: "Best balance: priority + distance + efficiency (Recommended)",
//             stops: optimizedRoute,
//             color: "blue",
//           },
//           {
//             id: "priority_first",
//             label: "⭐ Priority First",
//             description: "Delivers highest priority orders first",
//             stops: priorityRoute,
//             color: "purple",
//           },
//           {
//             id: "time_window",
//             label: "⏰ Time Window Route",
//             description: "Respects delivery time windows",
//             stops: timeWindowRoute,
//             color: "green",
//           },
//           {
//             id: "avoid_issues",
//             label: "🚧 Avoid Road Issues",
//             description: `Delays ${affectedStops.length} stops near road problems`,
//             stops: avoidIssuesRoute,
//             color: "orange",
//           },
//         ];

//         setRouteOptions(options);
//         setSelectedOptionIndex(0);

//         await previewRoute(0, options);
//       } catch (err) {
//         console.error("Error loading route:", err);
//         setError("Failed to load route data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   // OSRM helper
//   const fetchOsrmRoute = async (stops) => {
//     const valid = stops.every((s) => isValidCoord(s.lat, s.lng));
//     if (!valid) throw new Error("Invalid coordinates in stops.");

//     const coordsStr = stops.map((s) => `${s.lng},${s.lat}`).join(";");
//     const url = `http://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`;

//     const res = await fetch(url);
//     const data = await res.json();
// //     const url = `/route/osrm?coords=${coordsStr}`;
// // const res = await api.get(url);
// // const data = res.data;


//     if (!data.routes || data.routes.length === 0) {
//       throw new Error("OSRM could not compute route.");
//     }

//     const route = data.routes[0];
//     const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    
//     // Calculate stats
//     const distanceKm = (route.distance / 1000).toFixed(1);
//     const durationMin = Math.round(route.duration / 60);
    
//     setRouteStats({ distance: distanceKm, duration: durationMin });
    
//     return coords;
//   };

//   // Preview selected route
//   const previewRoute = async (optionIndex, optionsFromState = null) => {
//     const opts = optionsFromState || routeOptions;
//     const option = opts[optionIndex];

//     if (!option || option.stops.length === 0) {
//       setRouteCoords([]);
//       return;
//     }

//     try {
//       setLoadingRoute(true);
//       setError(null);

//       const latLngs = await fetchOsrmRoute(option.stops);

//       if (latLngs.length > 0) {
//         setRouteCoords(latLngs);
//         const mid = Math.floor(latLngs.length / 2);
//         setMapCenter(latLngs[mid]);
//       }
//     } catch (err) {
//       console.error("Route preview error:", err);
//       setError(err.message || "Failed to calculate route.");
//       setRouteCoords([]);
//     } finally {
//       setLoadingRoute(false);
//     }
//   };

//   const selectedOption = useMemo(
//     () => routeOptions[selectedOptionIndex] || null,
//     [routeOptions, selectedOptionIndex]
//   );

//   const getSeverityColor = (severity) => {
//     const colors = {
//       Critical: "#dc2626",
//       High: "#ea580c",
//       Medium: "#eab308",
//       Low: "#3b82f6",
//     };
//     return colors[severity] || "#6b7280";
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading route map…</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col">
//       {/* HEADER */}
//       <header className="bg-white shadow">
//         <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
//           <div>
//             <h1 className="text-2xl font-bold">🗺️ Driver Route Planner</h1>
//             <p className="text-sm text-gray-600">
//               AI-optimized routing with real-time road issue avoidance
//             </p>
//           </div>
//           <div className="text-right">
//             <p className="text-sm text-gray-500">Driver</p>
//             <p className="font-semibold">{user?.name || "Unknown"}</p>
//           </div>
//         </div>
//       </header>

//       <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* LEFT PANEL */}
//         <div className="space-y-4">
//           {error && (
//             <div className="bg-red-100 border border-red-300 text-red-800 px-3 py-2 rounded">
//               ⚠️ {error}
//             </div>
//           )}

//           {/* Route Stats */}
//           {routeStats && (
//             <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg p-4 rounded-lg">
//               <h3 className="text-sm font-semibold mb-2">Route Statistics</h3>
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <p className="text-2xl font-bold">{routeStats.distance} km</p>
//                   <p className="text-xs opacity-90">Total Distance</p>
//                 </div>
//                 <div>
//                   <p className="text-2xl font-bold">{routeStats.duration} min</p>
//                   <p className="text-xs opacity-90">Est. Duration</p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Route options */}
//           <div className="bg-white shadow p-4 rounded-lg">
//             <h2 className="text-lg font-semibold mb-3">📦 Route Options</h2>

//             {routeOptions.length === 0 ? (
//               <p className="text-gray-500">No routes available</p>
//             ) : (
//               routeOptions.map((opt, idx) => (
//                 <div
//                   key={opt.id}
//                   className={`border-2 p-3 rounded-lg mb-3 cursor-pointer transition ${
//                     selectedOptionIndex === idx
//                       ? "border-blue-600 bg-blue-50 shadow-md"
//                       : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
//                   }`}
//                   onClick={() => {
//                     setSelectedOptionIndex(idx);
//                     previewRoute(idx);
//                   }}
//                 >
//                   <div className="flex justify-between items-start">
//                     <div>
//                       <p className="font-semibold text-sm">{opt.label}</p>
//                       <p className="text-xs text-gray-600 mt-1">{opt.description}</p>
//                     </div>
//                     <span className="text-xs bg-gray-100 px-2 py-1 rounded font-medium">
//                       {opt.stops.length} stops
//                     </span>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>

//           {/* Stop list */}
//           {selectedOption && (
//             <div className="bg-white shadow p-4 rounded-lg max-h-[350px] overflow-y-auto">
//               <h2 className="text-lg font-semibold mb-3">📍 Delivery Sequence</h2>
//               <ol className="space-y-3">
//                 {selectedOption.stops.map((stop, idx) => {
//                   const nearIssue = isNearRoadIssue(stop, roadIssues);
//                   return (
//                     <li key={stop.id} className="flex gap-3 items-start">
//                       <span
//                         className="h-7 w-7 flex items-center justify-center rounded-full text-white text-xs font-bold flex-shrink-0"
//                         style={{
//                           backgroundColor:
//                             stop.priority === 5
//                               ? "#dc2626"
//                               : stop.priority === 4
//                               ? "#ea580c"
//                               : stop.priority === 3
//                               ? "#eab308"
//                               : "#3b82f6",
//                         }}
//                       >
//                         {idx + 1}
//                       </span>
//                       <div className="flex-1 min-w-0">
//                         <div className="flex items-center gap-2">
//                           <p className="font-medium text-sm">Order #{stop.orderId}</p>
//                           {nearIssue && (
//                             <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
//                               ⚠️ Near Issue
//                             </span>
//                           )}
//                         </div>
//                         <p className="text-xs text-gray-600">{stop.receiverName}</p>
//                         <p className="text-xs text-gray-500 truncate">{stop.address}</p>
//                         <p className="text-xs text-blue-600 font-medium mt-1">
//                           Priority: {stop.priority}/5
//                         </p>
//                       </div>
//                     </li>
//                   );
//                 })}
//               </ol>
//             </div>
//           )}

//           {/* Road issue legend */}
//           <div className="bg-white shadow p-4 rounded-lg">
//             <h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
//               ⚠️ Active Road Issues
//               <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-bold">
//                 {roadIssues.length}
//               </span>
//             </h2>
//             {roadIssues.length === 0 ? (
//               <p className="text-xs text-gray-600">✅ No active road issues</p>
//             ) : (
//               <div className="space-y-2">
//                 {roadIssues.slice(0, 3).map((issue) => (
//                   <div
//                     key={issue.id}
//                     className="text-xs p-2 rounded"
//                     style={{
//                       backgroundColor: `${getSeverityColor(issue.severity)}15`,
//                       borderLeft: `3px solid ${getSeverityColor(issue.severity)}`,
//                     }}
//                   >
//                     <p className="font-medium">{issue.issueType}</p>
//                     <p className="text-gray-600">{issue.description}</p>
//                   </div>
//                 ))}
//                 {roadIssues.length > 3 && (
//                   <p className="text-xs text-gray-500 text-center">
//                     +{roadIssues.length - 3} more issues
//                   </p>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* MAP SECTION */}
//         <div className="lg:col-span-2">
//           <div className="bg-white shadow rounded-lg overflow-hidden" style={{ height: "600px" }}>
//             {loadingRoute && (
//               <div className="absolute top-4 right-4 z-[1000] bg-white px-3 py-2 rounded shadow-lg">
//                 <p className="text-xs text-gray-600 flex items-center gap-2">
//                   <span className="animate-spin">🔄</span> Calculating route...
//                 </p>
//               </div>
//             )}
            
//             <MapContainer
//               center={mapCenter}
//               zoom={12}
//               scrollWheelZoom={true}
//               style={{ height: "100%", width: "100%" }}
//             >
//               <TileLayer
//                 attribution="&copy; OpenStreetMap contributors"
//                 url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//               />

//               {/* Stop markers with priority colors */}
//               {selectedOption &&
//                 selectedOption.stops.map((stop, idx) => (
//                   <Marker
//                     key={stop.id}
//                     position={[stop.lat, stop.lng]}
//                     icon={createDeliveryIcon(idx + 1, stop.priority)}
//                   >
//                     <Tooltip>
//                       <div className="text-xs">
//                         <strong>Stop {idx + 1}</strong> – Order #{stop.orderId}
//                         <br />
//                         <strong>Priority:</strong> {stop.priority}/5
//                         <br />
//                         <strong>Customer:</strong> {stop.receiverName}
//                         <br />
//                         {stop.address}
//                       </div>
//                     </Tooltip>
//                   </Marker>
//                 ))}

//               {/* Polyline route */}
//               {routeCoords.length > 1 && (
//                 <Polyline
//                   positions={routeCoords}
//                   color="#3b82f6"
//                   weight={4}
//                   opacity={0.7}
//                 />
//               )}

//               {/* Road issue markers with circles and custom icons */}
//               {roadIssues.map((issue) =>
//                 isValidCoord(issue.latitude, issue.longitude) ? (
//                   <div key={`issue-${issue.id}`}>
//                     {/* Warning circle */}
//                     <Circle
//                       center={[issue.latitude, issue.longitude]}
//                       radius={issue.severity === "Critical" ? 1500 : issue.severity === "High" ? 1000 : 500}
//                       pathOptions={{
//                         color: getSeverityColor(issue.severity),
//                         fillColor: getSeverityColor(issue.severity),
//                         fillOpacity: 0.15,
//                         weight: 2,
//                       }}
//                     />
//                     {/* Warning marker */}
//                     <Marker
//                       position={[issue.latitude, issue.longitude]}
//                       icon={warningIcon}
//                     >
//                       <Tooltip>
//                         <div className="text-xs">
//                           <strong style={{ color: getSeverityColor(issue.severity) }}>
//                             ⚠️ {issue.issueType}
//                           </strong>
//                           <br />
//                           <strong>Severity:</strong> {issue.severity}
//                           <br />
//                           {issue.description}
//                           <br />
//                           <span className="text-gray-500">
//                             Reported:{" "}
//                             {issue.reportedAt
//                               ? new Date(issue.reportedAt).toLocaleString()
//                               : "Unknown"}
//                           </span>
//                         </div>
//                       </Tooltip>
//                     </Marker>
//                   </div>
//                 ) : null
//               )}
//             </MapContainer>
//           </div>

//           {/* Map Legend */}
//           <div className="bg-white shadow rounded-lg p-3 mt-4">
//             <h3 className="text-xs font-semibold mb-2">Map Legend</h3>
//             <div className="grid grid-cols-2 gap-2 text-xs">
//               <div className="flex items-center gap-2">
//                 <div className="w-4 h-4 rounded-full bg-red-600"></div>
//                 <span>Critical Priority (5)</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-4 h-4 rounded-full bg-orange-600"></div>
//                 <span>High Priority (4)</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
//                 <span>Medium Priority (3)</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-4 h-4 rounded-full bg-blue-600"></div>
//                 <span>Low Priority (2)</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center text-white text-xs">
//                   ⚠️
//                 </div>
//                 <span>Road Issue Zone</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-4 h-1 bg-blue-600"></div>
//                 <span>Optimized Route</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default DriverRoutePage;

import { useEffect, useState, useMemo } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

// Custom warning icon for road issues
const warningIcon = L.divIcon({
  html: `<div style="
    background-color: #dc2626;
    border: 3px solid #fff;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  ">⚠️</div>`,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Custom delivery marker icons based on priority
const createDeliveryIcon = (number, priority) => {
  const colors = {
    5: "#dc2626", // Critical - Red
    4: "#ea580c", // High - Orange
    3: "#eab308", // Medium - Yellow
    2: "#3b82f6", // Low - Blue
    1: "#22c55e", // Very Low - Green
  };
  
  const color = colors[priority] || "#6b7280";
  
  return L.divIcon({
    html: `<div style="
      background-color: ${color};
      border: 3px solid #fff;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: white;
      font-size: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">${number}</div>`,
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
};

const DEFAULT_CENTER = [13.0827, 80.2707]; // Chennai fallback

// SAFE COORDINATE CHECKER
const isValidCoord = (lat, lng) => {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat !== 0 &&
    lng !== 0
  );
};

// Calculate distance between two points (Haversine formula)
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Advanced Nearest Neighbor Algorithm with Priority
const nearestNeighborRoute = (stops) => {
  if (stops.length === 0) return [];
  
  const unvisited = [...stops];
  const route = [];
  
  // Start with highest priority stop
  const startIdx = unvisited.findIndex(s => s.priority === Math.max(...unvisited.map(x => x.priority)));
  let current = unvisited.splice(startIdx, 1)[0];
  route.push(current);
  
  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let minScore = Infinity;
    
    // Find best next stop based on distance and priority
    for (let i = 0; i < unvisited.length; i++) {
      const distance = calculateDistance(
        current.lat,
        current.lng,
        unvisited[i].lat,
        unvisited[i].lng
      );
      
      // Score = distance / priority (lower is better)
      // This favors nearby high-priority stops
      const score = distance / (unvisited[i].priority || 1);
      
      if (score < minScore) {
        minScore = score;
        nearestIdx = i;
      }
    }
    
    current = unvisited.splice(nearestIdx, 1)[0];
    route.push(current);
  }
  
  return route;
};

// 2-Opt optimization for route improvement
const twoOptOptimization = (route) => {
  if (route.length < 4) return route;
  
  let improved = true;
  let optimizedRoute = [...route];
  
  // Preserve first stop (highest priority)
  const firstStop = optimizedRoute[0];
  let workingRoute = optimizedRoute.slice(1);
  
  while (improved) {
    improved = false;
    
    for (let i = 0; i < workingRoute.length - 2; i++) {
      for (let j = i + 2; j < workingRoute.length; j++) {
        const current = calculateDistance(
          workingRoute[i].lat,
          workingRoute[i].lng,
          workingRoute[i + 1].lat,
          workingRoute[i + 1].lng
        ) + calculateDistance(
          workingRoute[j].lat,
          workingRoute[j].lng,
          workingRoute[j + 1]?.lat || workingRoute[0].lat,
          workingRoute[j + 1]?.lng || workingRoute[0].lng
        );
        
        const swapped = calculateDistance(
          workingRoute[i].lat,
          workingRoute[i].lng,
          workingRoute[j].lat,
          workingRoute[j].lng
        ) + calculateDistance(
          workingRoute[i + 1].lat,
          workingRoute[i + 1].lng,
          workingRoute[j + 1]?.lat || workingRoute[0].lat,
          workingRoute[j + 1]?.lng || workingRoute[0].lng
        );
        
        if (swapped < current) {
          // Reverse the segment between i+1 and j
          workingRoute = [
            ...workingRoute.slice(0, i + 1),
            ...workingRoute.slice(i + 1, j + 1).reverse(),
            ...workingRoute.slice(j + 1),
          ];
          improved = true;
        }
      }
    }
  }
  
  return [firstStop, ...workingRoute];
};

// Check if a stop is near any road issues
const isNearRoadIssue = (stop, roadIssues, threshold = 2) => {
  return roadIssues.some(issue => {
    if (!isValidCoord(issue.latitude, issue.longitude)) return false;
    const distance = calculateDistance(
      stop.lat,
      stop.lng,
      issue.latitude,
      issue.longitude
    );
    return distance < threshold; // within 2km
  });
};

const DriverRoutePage = () => {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [routeOptions, setRouteOptions] = useState([]);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);

  const [routeCoords, setRouteCoords] = useState([]);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);

  const [loading, setLoading] = useState(true);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [error, setError] = useState(null);

  const [roadIssues, setRoadIssues] = useState([]);
  const [routeStats, setRouteStats] = useState(null);

  // Fetch optimized orders + active road issues
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [routeRes, issuesRes] = await Promise.all([
          api.get("/driver/route/optimized"),
          api.get("/driver/road-issues")
        ]);

        const data = routeRes.data || [];
        setOrders(data);

        const issues = issuesRes.data || [];
        setRoadIssues(issues);

        // Convert raw orders → stops with validated coordinates
        const stops = data
          .map((o, idx) => {
            const lat = Number(o.deliveryLatitude ?? o.pickupLatitude ?? null);
            const lng = Number(o.deliveryLongitude ?? o.pickupLongitude ?? null);

            if (!isValidCoord(lat, lng)) return null;

            return {
              id: o.id,
              orderId: o.id,
              index: idx,
              lat,
              lng,
              priority: o.aiPriority || o.priority || 2,
              address: o.receiverAddress || o.pickupAddress || "Unknown address",
              windowStart: o.scheduledDate || null,
              receiverName: o.receiverName || "Customer",
            };
          })
          .filter((s) => s !== null);

        if (stops.length === 0) {
          setError("No valid stops found. Check geocoding / address input.");
          setRouteOptions([]);
          setRouteCoords([]);
          setMapCenter(DEFAULT_CENTER);
          return;
        }

        // Center on first valid stop
        setMapCenter([stops[0].lat, stops[0].lng]);

        // Build optimized route options
        // Option 1: AI Smart Route (Nearest Neighbor + Priority + 2-Opt)
        const nnRoute = nearestNeighborRoute([...stops]);
        const optimizedRoute = twoOptOptimization(nnRoute);

        // Option 2: Priority First Route
        const priorityRoute = [...stops].sort((a, b) => {
          if (b.priority !== a.priority) return b.priority - a.priority;
          return calculateDistance(a.lat, a.lng, b.lat, b.lng);
        });

        // Option 3: Time Window Route
        const timeWindowRoute = [...stops].sort((a, b) => {
          if (a.windowStart && b.windowStart) {
            return new Date(a.windowStart) - new Date(b.windowStart);
          }
          if (b.priority !== a.priority) return b.priority - a.priority;
          return 0;
        });

        // Option 4: Avoid Road Issues Route
        const safeStops = stops.filter(s => !isNearRoadIssue(s, issues));
        const affectedStops = stops.filter(s => isNearRoadIssue(s, issues));
        const avoidIssuesRoute = [
          ...safeStops.sort((a, b) => b.priority - a.priority),
          ...affectedStops.sort((a, b) => b.priority - a.priority)
        ];

        const options = [
          {
            id: "ai_optimized",
            label: "🎯 AI Optimized Route",
            description: "Best balance: priority + distance + efficiency (Recommended)",
            stops: optimizedRoute,
            color: "blue",
          },
          {
            id: "priority_first",
            label: "⭐ Priority First",
            description: "Delivers highest priority orders first",
            stops: priorityRoute,
            color: "purple",
          },
          {
            id: "time_window",
            label: "⏰ Time Window Route",
            description: "Respects delivery time windows",
            stops: timeWindowRoute,
            color: "green",
          },
          {
            id: "avoid_issues",
            label: "🚧 Avoid Road Issues",
            description: `Delays ${affectedStops.length} stops near road problems`,
            stops: avoidIssuesRoute,
            color: "orange",
          },
        ];

        setRouteOptions(options);
        setSelectedOptionIndex(0);

        await previewRoute(0, options);
      } catch (err) {
        console.error("Error loading route:", err);
        setError("Failed to load route data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // OSRM helper - Updated to use backend proxy
  const fetchOsrmRoute = async (stops) => {
    const valid = stops.every((s) => isValidCoord(s.lat, s.lng));
    if (!valid) throw new Error("Invalid coordinates in stops.");

    const coordsStr = stops.map((s) => `${s.lng},${s.lat}`).join(";");
    
    try {
      // Use backend proxy instead of direct OSRM call
      const res = await api.get(`/route/osrm?coords=${coordsStr}`);
      const data = res.data;

      if (!data.routes || data.routes.length === 0) {
        throw new Error("OSRM could not compute route.");
      }

      const route = data.routes[0];
      const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      
      // Calculate stats
      const distanceKm = (route.distance / 1000).toFixed(1);
      const durationMin = Math.round(route.duration / 60);
      
      setRouteStats({ distance: distanceKm, duration: durationMin });
      
      return coords;
    } catch (err) {
      console.error("OSRM route error:", err);
      throw new Error(err.response?.data?.message || "Failed to fetch route from server");
    }
  };

  // Preview selected route with fallback
  const previewRoute = async (optionIndex, optionsFromState = null) => {
    const opts = optionsFromState || routeOptions;
    const option = opts[optionIndex];

    if (!option || option.stops.length === 0) {
      setRouteCoords([]);
      return;
    }

    try {
      setLoadingRoute(true);
      setError(null);

      const latLngs = await fetchOsrmRoute(option.stops);

      if (latLngs.length > 0) {
        setRouteCoords(latLngs);
        const mid = Math.floor(latLngs.length / 2);
        setMapCenter(latLngs[mid]);
      }
    } catch (err) {
      console.error("Route preview error:", err);
      
      // Fallback: Show straight lines between stops
      const fallbackCoords = option.stops.map(s => [s.lat, s.lng]);
      setRouteCoords(fallbackCoords);
      setError(`Route calculation failed: ${err.message}. Showing direct paths instead.`);
    } finally {
      setLoadingRoute(false);
    }
  };

  const selectedOption = useMemo(
    () => routeOptions[selectedOptionIndex] || null,
    [routeOptions, selectedOptionIndex]
  );

  const getSeverityColor = (severity) => {
    const colors = {
      Critical: "#dc2626",
      High: "#ea580c",
      Medium: "#eab308",
      Low: "#3b82f6",
    };
    return colors[severity] || "#6b7280";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading route map…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* HEADER */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">🗺️ Driver Route Planner</h1>
            <p className="text-sm text-gray-600">
              AI-optimized routing with real-time road issue avoidance
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Driver</p>
            <p className="font-semibold">{user?.name || "Unknown"}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT PANEL */}
        <div className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-800 px-3 py-2 rounded relative">
              <strong className="font-bold">⚠️ </strong>
              <span className="block sm:inline">{error}</span>
              <button
                onClick={() => setError(null)}
                className="absolute top-0 bottom-0 right-0 px-4 py-3 hover:text-red-900"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
          )}

          {/* Route Stats */}
          {routeStats && (
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg p-4 rounded-lg">
              <h3 className="text-sm font-semibold mb-2">Route Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold">{routeStats.distance} km</p>
                  <p className="text-xs opacity-90">Total Distance</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{routeStats.duration} min</p>
                  <p className="text-xs opacity-90">Est. Duration</p>
                </div>
              </div>
            </div>
          )}

          {/* Route options */}
          <div className="bg-white shadow p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">📦 Route Options</h2>

            {routeOptions.length === 0 ? (
              <p className="text-gray-500">No routes available</p>
            ) : (
              routeOptions.map((opt, idx) => (
                <div
                  key={opt.id}
                  className={`border-2 p-3 rounded-lg mb-3 cursor-pointer transition ${
                    selectedOptionIndex === idx
                      ? "border-blue-600 bg-blue-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    setSelectedOptionIndex(idx);
                    previewRoute(idx);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm">{opt.label}</p>
                      <p className="text-xs text-gray-600 mt-1">{opt.description}</p>
                    </div>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded font-medium">
                      {opt.stops.length} stops
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Stop list */}
          {selectedOption && (
            <div className="bg-white shadow p-4 rounded-lg max-h-[350px] overflow-y-auto">
              <h2 className="text-lg font-semibold mb-3">📍 Delivery Sequence</h2>
              <ol className="space-y-3">
                {selectedOption.stops.map((stop, idx) => {
                  const nearIssue = isNearRoadIssue(stop, roadIssues);
                  return (
                    <li key={stop.id} className="flex gap-3 items-start">
                      <span
                        className="h-7 w-7 flex items-center justify-center rounded-full text-white text-xs font-bold flex-shrink-0"
                        style={{
                          backgroundColor:
                            stop.priority === 5
                              ? "#dc2626"
                              : stop.priority === 4
                              ? "#ea580c"
                              : stop.priority === 3
                              ? "#eab308"
                              : "#3b82f6",
                        }}
                      >
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">Order #{stop.orderId}</p>
                          {nearIssue && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                              ⚠️ Near Issue
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">{stop.receiverName}</p>
                        <p className="text-xs text-gray-500 truncate">{stop.address}</p>
                        <p className="text-xs text-blue-600 font-medium mt-1">
                          Priority: {stop.priority}/5
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          {/* Road issue legend */}
          <div className="bg-white shadow p-4 rounded-lg">
            <h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
              ⚠️ Active Road Issues
              <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-bold">
                {roadIssues.length}
              </span>
            </h2>
            {roadIssues.length === 0 ? (
              <p className="text-xs text-gray-600">✅ No active road issues</p>
            ) : (
              <div className="space-y-2">
                {roadIssues.slice(0, 3).map((issue) => (
                  <div
                    key={issue.id}
                    className="text-xs p-2 rounded"
                    style={{
                      backgroundColor: `${getSeverityColor(issue.severity)}15`,
                      borderLeft: `3px solid ${getSeverityColor(issue.severity)}`,
                    }}
                  >
                    <p className="font-medium">{issue.issueType}</p>
                    <p className="text-gray-600">{issue.description}</p>
                  </div>
                ))}
                {roadIssues.length > 3 && (
                  <p className="text-xs text-gray-500 text-center">
                    +{roadIssues.length - 3} more issues
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* MAP SECTION */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg overflow-hidden" style={{ height: "600px" }}>
            {loadingRoute && (
              <div className="absolute top-4 right-4 z-[1000] bg-white px-3 py-2 rounded shadow-lg">
                <p className="text-xs text-gray-600 flex items-center gap-2">
                  <span className="animate-spin">🔄</span> Calculating route...
                </p>
              </div>
            )}
            
            <MapContainer
              center={mapCenter}
              zoom={12}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Stop markers with priority colors */}
              {selectedOption &&
                selectedOption.stops.map((stop, idx) => (
                  <Marker
                    key={stop.id}
                    position={[stop.lat, stop.lng]}
                    icon={createDeliveryIcon(idx + 1, stop.priority)}
                  >
                    <Tooltip>
                      <div className="text-xs">
                        <strong>Stop {idx + 1}</strong> – Order #{stop.orderId}
                        <br />
                        <strong>Priority:</strong> {stop.priority}/5
                        <br />
                        <strong>Customer:</strong> {stop.receiverName}
                        <br />
                        {stop.address}
                      </div>
                    </Tooltip>
                  </Marker>
                ))}

              {/* Polyline route */}
              {routeCoords.length > 1 && (
                <Polyline
                  positions={routeCoords}
                  color="#3b82f6"
                  weight={4}
                  opacity={0.7}
                />
              )}

              {/* Road issue markers with circles and custom icons */}
              {roadIssues.map((issue) =>
                isValidCoord(issue.latitude, issue.longitude) ? (
                  <div key={`issue-${issue.id}`}>
                    {/* Warning circle */}
                    <Circle
                      center={[issue.latitude, issue.longitude]}
                      radius={issue.severity === "Critical" ? 1500 : issue.severity === "High" ? 1000 : 500}
                      pathOptions={{
                        color: getSeverityColor(issue.severity),
                        fillColor: getSeverityColor(issue.severity),
                        fillOpacity: 0.15,
                        weight: 2,
                      }}
                    />
                    {/* Warning marker */}
                    <Marker
                      position={[issue.latitude, issue.longitude]}
                      icon={warningIcon}
                    >
                      <Tooltip>
                        <div className="text-xs">
                          <strong style={{ color: getSeverityColor(issue.severity) }}>
                            ⚠️ {issue.issueType}
                          </strong>
                          <br />
                          <strong>Severity:</strong> {issue.severity}
                          <br />
                          {issue.description}
                          <br />
                          <span className="text-gray-500">
                            Reported:{" "}
                            {issue.reportedAt
                              ? new Date(issue.reportedAt).toLocaleString()
                              : "Unknown"}
                          </span>
                        </div>
                      </Tooltip>
                    </Marker>
                  </div>
                ) : null
              )}
            </MapContainer>
          </div>

          {/* Map Legend */}
          <div className="bg-white shadow rounded-lg p-3 mt-4">
            <h3 className="text-xs font-semibold mb-2">Map Legend</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-600"></div>
                <span>Critical Priority (5)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-orange-600"></div>
                <span>High Priority (4)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                <span>Medium Priority (3)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                <span>Low Priority (2)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center text-white text-xs">
                  ⚠️
                </div>
                <span>Road Issue Zone</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-blue-600"></div>
                <span>Optimized Route</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DriverRoutePage;