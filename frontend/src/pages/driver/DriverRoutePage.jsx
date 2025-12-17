// // // // // // import { useEffect, useState, useMemo } from "react";
// // // // // // import api from "../../services/api";
// // // // // // import { useAuth } from "../../context/AuthContext";
// // // // // // import {
// // // // // //   MapContainer,
// // // // // //   TileLayer,
// // // // // //   Marker,
// // // // // //   Polyline,
// // // // // //   Tooltip,
// // // // // //   Circle,
// // // // // //   useMap,
// // // // // // } from "react-leaflet";
// // // // // // import L from "leaflet";
// // // // // // import "leaflet/dist/leaflet.css";
// // // // // // import DriverSidebar from "./DriverSidebar";

// // // // // // // Fix default marker icons
// // // // // // delete L.Icon.Default.prototype._getIconUrl;
// // // // // // L.Icon.Default.mergeOptions({
// // // // // //   iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
// // // // // //   iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
// // // // // //   shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
// // // // // // });

// // // // // // const warningIcon = L.divIcon({
// // // // // //   html: `<div style="
// // // // // //     background-color: #dc2626;
// // // // // //     border: 3px solid #fff;
// // // // // //     border-radius: 50%;
// // // // // //     width: 32px;
// // // // // //     height: 32px;
// // // // // //     display: flex;
// // // // // //     align-items: center;
// // // // // //     justify-content: center;
// // // // // //     font-size: 18px;
// // // // // //     box-shadow: 0 2px 8px rgba(0,0,0,0.3);
// // // // // //   ">⚠️</div>`,
// // // // // //   className: "",
// // // // // //   iconSize: [32, 32],
// // // // // //   iconAnchor: [16, 16],
// // // // // // });

// // // // // // const createDeliveryIcon = (number, priority) => {
// // // // // //   const colors = {
// // // // // //     5: "#dc2626",
// // // // // //     4: "#ea580c",
// // // // // //     3: "#eab308",
// // // // // //     2: "#3b82f6",
// // // // // //     1: "#22c55e",
// // // // // //   };

// // // // // //   const color = colors[priority] || "#6b7280";

// // // // // //   return L.divIcon({
// // // // // //     html: `<div style="
// // // // // //       background-color: ${color};
// // // // // //       border: 3px solid #fff;
// // // // // //       border-radius: 50%;
// // // // // //       width: 36px;
// // // // // //       height: 36px;
// // // // // //       display: flex;
// // // // // //       align-items: center;
// // // // // //       justify-content: center;
// // // // // //       font-weight: bold;
// // // // // //       color: white;
// // // // // //       font-size: 14px;
// // // // // //       box-shadow: 0 2px 8px rgba(0,0,0,0.3);
// // // // // //     ">${number}</div>`,
// // // // // //     className: "",
// // // // // //     iconSize: [36, 36],
// // // // // //     iconAnchor: [18, 36],
// // // // // //   });
// // // // // // };

// // // // // // // Component to fit map bounds
// // // // // // function MapBoundsFitter({ coords, stops }) {
// // // // // //   const map = useMap();

// // // // // //   useEffect(() => {
// // // // // //     // Collect all points to include in bounds (route points + stops)
// // // // // //     const points = [];

// // // // // //     if (coords && coords.length > 0) {
// // // // // //       points.push(...coords);
// // // // // //     }

// // // // // //     if (stops && stops.length > 0) {
// // // // // //       stops.forEach(stop => points.push([stop.lat, stop.lng]));
// // // // // //     }

// // // // // //     if (points.length > 0) {
// // // // // //       try {
// // // // // //         const bounds = L.latLngBounds(points);
// // // // // //         console.log("📍 Fitting map bounds:", points.length, "points");
// // // // // //         map.fitBounds(bounds, { padding: [50, 50] });
// // // // // //       } catch (err) {
// // // // // //         console.error("❌ Map bounds error:", err);
// // // // // //       }
// // // // // //     }
// // // // // //   }, [coords, stops, map]);

// // // // // //   return null;
// // // // // // }

// // // // // // const DEFAULT_CENTER = [11.1271, 78.6569]; // Tamil Nadu Center

// // // // // // const isValidCoord = (lat, lng) =>
// // // // // //   typeof lat === "number" &&
// // // // // //   typeof lng === "number" &&
// // // // // //   !isNaN(lat) &&
// // // // // //   !isNaN(lng) &&
// // // // // //   lat !== 0 &&
// // // // // //   lng !== 0;

// // // // // // const calculateDistance = (lat1, lng1, lat2, lng2) => {
// // // // // //   const R = 6371;
// // // // // //   const dLat = ((lat2 - lat1) * Math.PI) / 180;
// // // // // //   const dLng = ((lng2 - lng1) * Math.PI) / 180;
// // // // // //   const a =
// // // // // //     Math.sin(dLat / 2) ** 2 +
// // // // // //     Math.cos(lat1 * (Math.PI / 180)) *
// // // // // //     Math.cos(lat2 * (Math.PI / 180)) *
// // // // // //     Math.sin(dLng / 2) ** 2;

// // // // // //   return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
// // // // // // };

// // // // // // const nearestNeighborRoute = (stops) => {
// // // // // //   if (!stops.length) return [];

// // // // // //   const unvisited = [...stops];
// // // // // //   const route = [];

// // // // // //   const startIdx = unvisited.findIndex(
// // // // // //     (s) => s.priority === Math.max(...unvisited.map((x) => x.priority))
// // // // // //   );

// // // // // //   let current = unvisited.splice(startIdx >= 0 ? startIdx : 0, 1)[0];
// // // // // //   route.push(current);

// // // // // //   while (unvisited.length) {
// // // // // //     let best = 0;
// // // // // //     let minScore = Infinity;

// // // // // //     for (let i = 0; i < unvisited.length; i++) {
// // // // // //       const d = calculateDistance(
// // // // // //         current.lat,
// // // // // //         current.lng,
// // // // // //         unvisited[i].lat,
// // // // // //         unvisited[i].lng
// // // // // //       );

// // // // // //       const score = d / (unvisited[i].priority || 1);

// // // // // //       if (score < minScore) {
// // // // // //         minScore = score;
// // // // // //         best = i;
// // // // // //       }
// // // // // //     }

// // // // // //     current = unvisited.splice(best, 1)[0];
// // // // // //     route.push(current);
// // // // // //   }

// // // // // //   return route;
// // // // // // };

// // // // // // const twoOptOptimization = (route) => {
// // // // // //   if (route.length < 4) return route;

// // // // // //   let improved = true;
// // // // // //   const firstStop = route[0];
// // // // // //   let working = route.slice(1);

// // // // // //   while (improved) {
// // // // // //     improved = false;

// // // // // //     for (let i = 0; i < working.length - 2; i++) {
// // // // // //       for (let j = i + 2; j < working.length; j++) {
// // // // // //         const A = working[i];
// // // // // //         const B = working[i + 1];
// // // // // //         const C = working[j];
// // // // // //         const D = working[j + 1] || working[0];

// // // // // //         const current =
// // // // // //           calculateDistance(A.lat, A.lng, B.lat, B.lng) +
// // // // // //           calculateDistance(C.lat, C.lng, D.lat, D.lng);

// // // // // //         const swapped =
// // // // // //           calculateDistance(A.lat, A.lng, C.lat, C.lng) +
// // // // // //           calculateDistance(B.lat, B.lng, D.lat, D.lng);

// // // // // //         if (swapped < current) {
// // // // // //           working = [
// // // // // //             ...working.slice(0, i + 1),
// // // // // //             ...working.slice(i + 1, j + 1).reverse(),
// // // // // //             ...working.slice(j + 1),
// // // // // //           ];
// // // // // //           improved = true;
// // // // // //         }
// // // // // //       }
// // // // // //     }
// // // // // //   }

// // // // // //   return [firstStop, ...working];
// // // // // // };

// // // // // // const isNearRoadIssue = (stop, issues, threshold = 2) =>
// // // // // //   issues.some((i) => {
// // // // // //     if (!isValidCoord(i.latitude, i.longitude)) return false;
// // // // // //     const d = calculateDistance(stop.lat, stop.lng, i.latitude, i.longitude);
// // // // // //     return d < threshold;
// // // // // //   });

// // // // // // const generateStraightLineRoute = (stops) => {
// // // // // //   const allPoints = [];

// // // // // //   for (let i = 0; i < stops.length - 1; i++) {
// // // // // //     const start = stops[i];
// // // // // //     const end = stops[i + 1];

// // // // // //     allPoints.push([start.lat, start.lng]);

// // // // // //     for (let j = 1; j <= 3; j++) {
// // // // // //       const ratio = j / 4;
// // // // // //       const lat = start.lat + (end.lat - start.lat) * ratio;
// // // // // //       const lng = start.lng + (end.lng - start.lng) * ratio;
// // // // // //       allPoints.push([lat, lng]);
// // // // // //     }
// // // // // //   }

// // // // // //   const lastStop = stops[stops.length - 1];
// // // // // //   allPoints.push([lastStop.lat, lastStop.lng]);

// // // // // //   let totalDistance = 0;
// // // // // //   for (let i = 0; i < stops.length - 1; i++) {
// // // // // //     totalDistance += calculateDistance(
// // // // // //       stops[i].lat,
// // // // // //       stops[i].lng,
// // // // // //       stops[i + 1].lat,
// // // // // //       stops[i + 1].lng
// // // // // //     );
// // // // // //   }

// // // // // //   return {
// // // // // //     coords: allPoints,
// // // // // //     stats: {
// // // // // //       distance: totalDistance.toFixed(1),
// // // // // //       duration: Math.round(totalDistance * 3),
// // // // // //     },
// // // // // //   };
// // // // // // };

// // // // // // // Use backend proxy to avoid CORS
// // // // // // const fetchOsrmRoute = async (stops) => {
// // // // // //   if (!stops || stops.length < 2) {
// // // // // //     throw new Error("At least 2 stops required");
// // // // // //   }

// // // // // //   try {
// // // // // //     console.log("🔄 Fetching route via backend proxy...");

// // // // // //     // Build coordinates string: lng,lat;lng,lat
// // // // // //     const coordinates = stops.map((s) => `${s.lng},${s.lat}`).join(";");

// // // // // //     // Call backend
// // // // // //     const url = `http://localhost:5066/api/route/osrm?coordinates=${encodeURIComponent(coordinates)}`;

// // // // // //     const response = await fetch(url);

// // // // // //     if (response.ok) {
// // // // // //       const data = await response.json();

// // // // // //       // Backend returns structure with routes array
// // // // // //       const route = data.routes?.[0];

// // // // // //       if (route) {
// // // // // //         // Backend returns [lng, lat] (GeoJSON), Leaflet needs [lat, lng]
// // // // // //         const coords = route.geometry.coordinates.map(([lng, lat]) => [
// // // // // //           lat,
// // // // // //           lng,
// // // // // //         ]);

// // // // // //         console.log("✅ Backend routing successful");
// // // // // //         return {
// // // // // //           coords,
// // // // // //           stats: {
// // // // // //             distance: (route.distance / 1000).toFixed(1), // meters to km
// // // // // //             duration: Math.round(route.duration / 60),    // seconds to min
// // // // // //           },
// // // // // //         };
// // // // // //       }
// // // // // //     } else {
// // // // // //       console.warn("Backend routing failed:", await response.text());
// // // // // //     }
// // // // // //   } catch (err) {
// // // // // //     console.error("❌ Backend routing error:", err.message);
// // // // // //   }

// // // // // //   console.log("⚠️ Routing failed, using straight-line fallback");
// // // // // //   return generateStraightLineRoute(stops);
// // // // // // };

// // // // // // const DriverRoutePage = () => {
// // // // // //   const { user } = useAuth();

// // // // // //   const [orders, setOrders] = useState([]);
// // // // // //   const [routeOptions, setRouteOptions] = useState([]);
// // // // // //   const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);

// // // // // //   const [routeCoords, setRouteCoords] = useState([]);
// // // // // //   const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);

// // // // // //   const [loading, setLoading] = useState(true);
// // // // // //   const [loadingRoute, setLoadingRoute] = useState(false);
// // // // // //   const [error, setError] = useState(null);

// // // // // //   const [roadIssues, setRoadIssues] = useState([]);
// // // // // //   const [routeStats, setRouteStats] = useState(null);

// // // // // //   useEffect(() => {
// // // // // //     const load = async () => {
// // // // // //       try {
// // // // // //         const [routeRes, issuesRes] = await Promise.all([
// // // // // //           api.get("/driver/route/optimized"),
// // // // // //           api.get("/driver/road-issues"),
// // // // // //         ]);

// // // // // //         const orders = routeRes.data || [];
// // // // // //         setOrders(orders);

// // // // // //         const issues = issuesRes.data || [];
// // // // // //         setRoadIssues(issues);

// // // // // //         console.log("📦 Loaded orders:", orders.length);
// // // // // //         console.log("🚧 Loaded road issues:", issues.length);

// // // // // //         const stops = orders
// // // // // //           .map((o) => {
// // // // // //             const lat = Number(o.deliveryLatitude ?? o.pickupLatitude);
// // // // // //             const lng = Number(o.deliveryLongitude ?? o.pickupLongitude);

// // // // // //             if (!isValidCoord(lat, lng)) {
// // // // // //               console.warn("❌ Invalid coordinates for order:", o.id);
// // // // // //               return null;
// // // // // //             }

// // // // // //             return {
// // // // // //               id: o.id,
// // // // // //               orderId: o.id,
// // // // // //               lat,
// // // // // //               lng,
// // // // // //               index: o.index,
// // // // // //               priority: o.aiPriority || o.priority || 2,
// // // // // //               address: o.receiverAddress || o.pickupAddress,
// // // // // //               windowStart: o.scheduledDate,
// // // // // //               receiverName: o.receiverName || "Customer",
// // // // // //             };
// // // // // //           })
// // // // // //           .filter(Boolean);

// // // // // //         console.log("✅ Valid stops:", stops.length);

// // // // // //         if (!stops.length) {
// // // // // //           setError("No valid stops found");
// // // // // //           setLoading(false);
// // // // // //           return;
// // // // // //         }

// // // // // //         setMapCenter([stops[0].lat, stops[0].lng]);

// // // // // //         const nn = nearestNeighborRoute([...stops]);
// // // // // //         const optimized = twoOptOptimization(nn);

// // // // // //         const priorityRoute = [...stops].sort((a, b) => b.priority - a.priority);

// // // // // //         const timeWindowRoute = [...stops].sort((a, b) => {
// // // // // //           if (a.windowStart && b.windowStart)
// // // // // //             return new Date(a.windowStart) - new Date(b.windowStart);
// // // // // //           return b.priority - a.priority;
// // // // // //         });

// // // // // //         const safe = stops.filter((s) => !isNearRoadIssue(s, issues));
// // // // // //         const risky = stops.filter((s) => isNearRoadIssue(s, issues));

// // // // // //         const avoidIssuesRoute = [...safe, ...risky];

// // // // // //         const options = [
// // // // // //           {
// // // // // //             id: "ai",
// // // // // //             label: "🎯 AI Optimized Route",
// // // // // //             description: "Best balance of distance + priority",
// // // // // //             stops: optimized,
// // // // // //           },
// // // // // //           {
// // // // // //             id: "priority",
// // // // // //             label: "⭐ Priority First",
// // // // // //             description: "Deliver high priority first",
// // // // // //             stops: priorityRoute,
// // // // // //           },
// // // // // //           {
// // // // // //             id: "time",
// // // // // //             label: "⏰ Time Windows",
// // // // // //             description: "Schedules first",
// // // // // //             stops: timeWindowRoute,
// // // // // //           },
// // // // // //           {
// // // // // //             id: "issues",
// // // // // //             label: "🚧 Avoid Road Issues",
// // // // // //             description: "Skips blocked areas first",
// // // // // //             stops: avoidIssuesRoute,
// // // // // //           },
// // // // // //         ];

// // // // // //         setRouteOptions(options);

// // // // // //         await previewRoute(0, options);
// // // // // //       } catch (err) {
// // // // // //         console.error("Load error:", err);
// // // // // //         setError("Failed to load route: " + err.message);
// // // // // //       } finally {
// // // // // //         setLoading(false);
// // // // // //       }
// // // // // //     };

// // // // // //     load();
// // // // // //   }, []);

// // // // // //   const previewRoute = async (index, opts = null) => {
// // // // // //     try {
// // // // // //       setLoadingRoute(true);
// // // // // //       setError(null);

// // // // // //       const option = (opts || routeOptions)[index];

// // // // // //       if (!option || !option.stops || option.stops.length < 2) {
// // // // // //         setError("Not enough stops to calculate route");
// // // // // //         setRouteCoords([]);
// // // // // //         return;
// // // // // //       }

// // // // // //       console.log("🗺️ Calculating route for", option.stops.length, "stops");

// // // // // //       const { coords, stats } = await fetchOsrmRoute(option.stops);

// // // // // //       console.log("✅ Route calculated:", coords.length, "points");

// // // // // //       setRouteCoords(coords);
// // // // // //       if (stats) {
// // // // // //         setRouteStats(stats);
// // // // // //       }

// // // // // //       // Map bounds will be handled by MapBoundsFitter
// // // // // //     } catch (err) {
// // // // // //       console.error("Route preview error:", err);
// // // // // //       // Fallback to straight line if backend fails completely
// // // // // //       if (routeCoords.length === 0) {
// // // // // //         setError("Route calculation failed: " + err.message);
// // // // // //       }
// // // // // //     } finally {
// // // // // //       setLoadingRoute(false);
// // // // // //     }
// // // // // //   };

// // // // // //   const selectedOption = useMemo(
// // // // // //     () => routeOptions[selectedOptionIndex],
// // // // // //     [routeOptions, selectedOptionIndex]
// // // // // //   );

// // // // // //   const getSeverityColor = (s) =>
// // // // // //   ({
// // // // // //     Critical: "#dc2626",
// // // // // //     High: "#ea580c",
// // // // // //     Medium: "#eab308",
// // // // // //     Low: "#3b82f6",
// // // // // //   }[s] || "#6b7280");

// // // // // //   if (loading) {
// // // // // //     return (
// // // // // //       <div className="flex justify-center items-center h-screen text-[#351c15]">
// // // // // //         <div className="text-center">
// // // // // //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#351c15] mx-auto mb-4"></div>
// // // // // //           <p>Loading route…</p>
// // // // // //         </div>
// // // // // //       </div>
// // // // // //     );
// // // // // //   }

// // // // // //   return (
// // // // // //     <div className="flex min-h-screen bg-[#f7f3ef]">
// // // // // //       <DriverSidebar active="route" />

// // // // // //       <div className="flex-1 flex flex-col">
// // // // // //         <header className="bg-[#fff8e7] border-b border-[#e6ddc5] p-5 flex justify-between items-center shadow-sm">
// // // // // //           <div>
// // // // // //             <h1 className="text-2xl font-bold text-[#351c15]">
// // // // // //               🗺️ Driver Route Planner
// // // // // //             </h1>
// // // // // //             <p className="text-[#6f4e37] text-sm">
// // // // // //               AI routing + real-time road issue avoidance
// // // // // //             </p>
// // // // // //           </div>

// // // // // //           <div className="text-right">
// // // // // //             <p className="text-sm text-[#6f4e37]">Driver</p>
// // // // // //             <p className="font-semibold text-[#351c15]">
// // // // // //               {user?.first_name} {user?.last_name}
// // // // // //             </p>
// // // // // //           </div>
// // // // // //         </header>

// // // // // //         <main className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
// // // // // //           <div className="space-y-6">
// // // // // //             {error && (
// // // // // //               <div className="bg-red-100 border border-red-300 text-red-800 p-3 rounded-lg text-sm">
// // // // // //                 ⚠️ {error}
// // // // // //               </div>
// // // // // //             )}

// // // // // //             {routeStats && (
// // // // // //               <div className="bg-[#fff8e7] border border-[#e6ddc5] p-5 rounded-xl shadow">
// // // // // //                 <h3 className="text-sm font-semibold text-[#351c15] mb-3">
// // // // // //                   Route Summary
// // // // // //                 </h3>

// // // // // //                 <div className="grid grid-cols-2 gap-4">
// // // // // //                   <div>
// // // // // //                     <p className="text-2xl font-bold text-[#351c15]">
// // // // // //                       {routeStats.distance} km
// // // // // //                     </p>
// // // // // //                     <p className="text-xs text-[#6f4e37]">Distance</p>
// // // // // //                   </div>

// // // // // //                   <div>
// // // // // //                     <p className="text-2xl font-bold text-[#351c15]">
// // // // // //                       {routeStats.duration} min
// // // // // //                     </p>
// // // // // //                     <p className="text-xs text-[#6f4e37]">Duration</p>
// // // // // //                   </div>
// // // // // //                 </div>
// // // // // //               </div>
// // // // // //             )}

// // // // // //             <div className="bg-[#fff8e7] border border-[#e6ddc5] p-5 rounded-xl shadow">
// // // // // //               <h2 className="text-lg font-semibold text-[#351c15] mb-3">
// // // // // //                 📦 Route Options
// // // // // //               </h2>

// // // // // //               {routeOptions.map((opt, idx) => (
// // // // // //                 <div
// // // // // //                   key={opt.id}
// // // // // //                   onClick={() => {
// // // // // //                     setSelectedOptionIndex(idx);
// // // // // //                     previewRoute(idx);
// // // // // //                   }}
// // // // // //                   className={`border-2 rounded-lg p-4 mb-3 cursor-pointer transition ${selectedOptionIndex === idx
// // // // // //                     ? "border-[#f9b400] bg-[#f9b400]/20"
// // // // // //                     : "border-[#e6ddc5] bg-white hover:bg-[#fff8e7]"
// // // // // //                     }`}
// // // // // //                 >
// // // // // //                   <div className="flex justify-between">
// // // // // //                     <div>
// // // // // //                       <p className="font-semibold text-[#351c15]">
// // // // // //                         {opt.label}
// // // // // //                       </p>
// // // // // //                       <p className="text-xs text-[#6f4e37]">
// // // // // //                         {opt.description}
// // // // // //                       </p>
// // // // // //                     </div>

// // // // // //                     <span className="text-xs bg-[#fff8e7] border border-[#e6ddc5] px-2 py-1 rounded">
// // // // // //                       {opt.stops.length} stops
// // // // // //                     </span>
// // // // // //                   </div>
// // // // // //                 </div>
// // // // // //               ))}
// // // // // //             </div>

// // // // // //             {selectedOption && (
// // // // // //               <div className="bg-[#fff8e7] border border-[#e6ddc5] p-5 rounded-xl shadow max-h-[350px] overflow-y-auto">
// // // // // //                 <h2 className="text-lg font-semibold text-[#351c15] mb-3">
// // // // // //                   📍 Delivery Sequence
// // // // // //                 </h2>

// // // // // //                 <ol className="space-y-4">
// // // // // //                   {selectedOption.stops.map((stop, i) => {
// // // // // //                     const near = isNearRoadIssue(stop, roadIssues);

// // // // // //                     return (
// // // // // //                       <li key={stop.id} className="flex gap-3">
// // // // // //                         <span
// // // // // //                           className="h-7 w-7 flex items-center justify-center rounded-full text-white text-xs font-bold flex-shrink-0"
// // // // // //                           style={{
// // // // // //                             background:
// // // // // //                               stop.priority === 5
// // // // // //                                 ? "#dc2626"
// // // // // //                                 : stop.priority === 4
// // // // // //                                   ? "#ea580c"
// // // // // //                                   : stop.priority === 3
// // // // // //                                     ? "#eab308"
// // // // // //                                     : "#3b82f6",
// // // // // //                           }}
// // // // // //                         >
// // // // // //                           {i + 1}
// // // // // //                         </span>

// // // // // //                         <div className="flex-1">
// // // // // //                           <p className="font-medium text-sm text-[#351c15]">
// // // // // //                             Order #{stop.orderId}
// // // // // //                           </p>

// // // // // //                           {near && (
// // // // // //                             <span className="text-xs bg-red-100 text-red-700 px-2 rounded inline-block mt-1">
// // // // // //                               ⚠️ Near Issue
// // // // // //                             </span>
// // // // // //                           )}

// // // // // //                           <p className="text-xs text-[#6f4e37]">
// // // // // //                             {stop.receiverName}
// // // // // //                           </p>

// // // // // //                           <p className="text-xs text-[#6f4e37] truncate">
// // // // // //                             {stop.address}
// // // // // //                           </p>

// // // // // //                           <p className="text-xs text-[#351c15] font-medium">
// // // // // //                             Priority: {stop.priority}/5
// // // // // //                           </p>
// // // // // //                         </div>
// // // // // //                       </li>
// // // // // //                     );
// // // // // //                   })}
// // // // // //                 </ol>
// // // // // //               </div>
// // // // // //             )}
// // // // // //           </div>

// // // // // //           <div className="lg:col-span-2">
// // // // // //             <div
// // // // // //               className="bg-[#fff8e7] border border-[#e6ddc5] rounded-xl shadow overflow-hidden relative"
// // // // // //               style={{ height: "600px" }}
// // // // // //             >
// // // // // //               {loadingRoute && (
// // // // // //                 <div className="absolute top-4 right-4 bg-white shadow px-3 py-2 rounded text-xs z-[1000]">
// // // // // //                   🔄 Calculating route…
// // // // // //                 </div>
// // // // // //               )}

// // // // // //               <MapContainer
// // // // // //                 center={mapCenter}
// // // // // //                 zoom={12}
// // // // // //                 style={{ height: "100%", width: "100%" }}
// // // // // //                 key={`map-${selectedOptionIndex}`}
// // // // // //               >
// // // // // //                 <TileLayer
// // // // // //                   url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
// // // // // //                   attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
// // // // // //                 />

// // // // // //                 <MapBoundsFitter
// // // // // //                   coords={routeCoords}
// // // // // //                   stops={selectedOption?.stops}
// // // // // //                 />

// // // // // //                 {selectedOption?.stops.map((stop, i) => (
// // // // // //                   <Marker
// // // // // //                     key={`stop-${stop.id}-${i}`}
// // // // // //                     position={[stop.lat, stop.lng]}
// // // // // //                     icon={createDeliveryIcon(i + 1, stop.priority)}
// // // // // //                   >
// // // // // //                     <Tooltip permanent={false} direction="top">
// // // // // //                       <div className="text-xs">
// // // // // //                         <strong>Stop {i + 1}</strong> — Order #{stop.orderId}
// // // // // //                         <br />
// // // // // //                         Priority: {stop.priority}
// // // // // //                         <br />
// // // // // //                         {stop.receiverName}
// // // // // //                         <br />
// // // // // //                         {stop.address}
// // // // // //                       </div>
// // // // // //                     </Tooltip>
// // // // // //                   </Marker>
// // // // // //                 ))}

// // // // // //                 {routeCoords.length > 1 && (
// // // // // //                   <Polyline
// // // // // //                     key={`route-${selectedOptionIndex}`}
// // // // // //                     positions={routeCoords}
// // // // // //                     color="#351c15"
// // // // // //                     weight={4}
// // // // // //                     opacity={0.8}
// // // // // //                   />
// // // // // //                 )}

// // // // // //                 {roadIssues.map((issue, idx) =>
// // // // // //                   isValidCoord(issue.latitude, issue.longitude) ? (
// // // // // //                     <div key={`issue-${issue.id || idx}`}>
// // // // // //                       <Circle
// // // // // //                         center={[issue.latitude, issue.longitude]}
// // // // // //                         radius={
// // // // // //                           issue.severity === "Critical"
// // // // // //                             ? 1500
// // // // // //                             : issue.severity === "High"
// // // // // //                               ? 1000
// // // // // //                               : 500
// // // // // //                         }
// // // // // //                         pathOptions={{
// // // // // //                           color: getSeverityColor(issue.severity),
// // // // // //                           fillColor: getSeverityColor(issue.severity),
// // // // // //                           fillOpacity: 0.15,
// // // // // //                         }}
// // // // // //                       />

// // // // // //                       <Marker
// // // // // //                         position={[issue.latitude, issue.longitude]}
// // // // // //                         icon={warningIcon}
// // // // // //                       >
// // // // // //                         <Tooltip permanent={false} direction="top">
// // // // // //                           <div className="text-xs">
// // // // // //                             <strong
// // // // // //                               style={{
// // // // // //                                 color: getSeverityColor(issue.severity),
// // // // // //                               }}
// // // // // //                             >
// // // // // //                               ⚠️ {issue.issueType}
// // // // // //                             </strong>
// // // // // //                             <br />
// // // // // //                             Severity: {issue.severity}
// // // // // //                             <br />
// // // // // //                             {issue.description}
// // // // // //                           </div>
// // // // // //                         </Tooltip>
// // // // // //                       </Marker>
// // // // // //                     </div>
// // // // // //                   ) : null
// // // // // //                 )}
// // // // // //               </MapContainer>
// // // // // //             </div>

// // // // // //             <div className="bg-[#fff8e7] border border-[#e6ddc5] rounded-xl shadow p-5 mt-6 text-xs">
// // // // // //               <h3 className="font-semibold text-[#351c15] mb-3">Legend</h3>

// // // // // //               <div className="grid grid-cols-2 gap-3 text-[#6f4e37]">
// // // // // //                 <div className="flex items-center gap-2">
// // // // // //                   <div className="w-4 h-4 rounded-full bg-red-600"></div>
// // // // // //                   Critical Priority / Issue
// // // // // //                 </div>

// // // // // //                 <div className="flex items-center gap-2">
// // // // // //                   <div className="w-4 h-4 rounded-full bg-orange-600"></div>
// // // // // //                   High Priority / Issue
// // // // // //                 </div>

// // // // // //                 <div className="flex items-center gap-2">
// // // // // //                   <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
// // // // // //                   Medium Priority / Issue
// // // // // //                 </div>

// // // // // //                 <div className="flex items-center gap-2">
// // // // // //                   <div className="w-4 h-4 rounded-full bg-blue-600"></div>
// // // // // //                   Low Priority / Issue
// // // // // //                 </div>
// // // // // //               </div>

// // // // // //               <div className="mt-3 pt-3 border-t border-[#e6ddc5]">
// // // // // //                 <p className="text-[#6f4e37]">
// // // // // //                   📍 {selectedOption?.stops.length || 0} delivery stops
// // // // // //                   {" • "}
// // // // // //                   🚧 {roadIssues.length} road issues
// // // // // //                 </p>
// // // // // //               </div>
// // // // // //             </div>
// // // // // //           </div>
// // // // // //         </main>
// // // // // //       </div>
// // // // // //     </div>
// // // // // //   );
// // // // // // };

// // // // // // export default DriverRoutePage;

// // // // // import { useEffect, useMemo, useRef, useState } from "react";
// // // // // import api from "../../services/api";
// // // // // import { useAuth } from "../../context/AuthContext";
// // // // // import {
// // // // //   MapContainer,
// // // // //   TileLayer,
// // // // //   Marker,
// // // // //   Polyline,
// // // // //   Tooltip,
// // // // //   Circle,
// // // // //   useMap,
// // // // // } from "react-leaflet";
// // // // // import L from "leaflet";
// // // // // import "leaflet/dist/leaflet.css";
// // // // // import DriverSidebar from "./DriverSidebar";

// // // // // // Leaflet marker fix
// // // // // delete L.Icon.Default.prototype._getIconUrl;
// // // // // L.Icon.Default.mergeOptions({
// // // // //   iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
// // // // //   iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
// // // // //   shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
// // // // // });

// // // // // // Tamil Nadu bounds
// // // // // const TN_BOUNDS = L.latLngBounds([8.0, 76.0], [13.6, 80.4]);
// // // // // const DEFAULT_CENTER = [11.1271, 78.6569];

// // // // // const isFiniteNumber = (n) => typeof n === "number" && Number.isFinite(n);

// // // // // const isValidTamilNaduCoord = (lat, lng) =>
// // // // //   isFiniteNumber(lat) &&
// // // // //   isFiniteNumber(lng) &&
// // // // //   lat >= 8.0 &&
// // // // //   lat <= 13.6 &&
// // // // //   lng >= 76.0 &&
// // // // //   lng <= 80.4;

// // // // // const haversineKm = (lat1, lng1, lat2, lng2) => {
// // // // //   const R = 6371;
// // // // //   const dLat = ((lat2 - lat1) * Math.PI) / 180;
// // // // //   const dLng = ((lng2 - lng1) * Math.PI) / 180;
// // // // //   const a =
// // // // //     Math.sin(dLat / 2) ** 2 +
// // // // //     Math.cos((lat1 * Math.PI) / 180) *
// // // // //     Math.cos((lat2 * Math.PI) / 180) *
// // // // //     Math.sin(dLng / 2) ** 2;

// // // // //   return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
// // // // // };

// // // // // const isNearRoadIssue = (stop, issues, thresholdKm = 2) =>
// // // // //   issues.some((i) => {
// // // // //     const lat = Number(i.latitude);
// // // // //     const lng = Number(i.longitude);
// // // // //     if (!isValidTamilNaduCoord(lat, lng)) return false;
// // // // //     const d = haversineKm(stop.lat, stop.lng, lat, lng);
// // // // //     return d < thresholdKm;
// // // // //   });

// // // // // const warningIcon = L.divIcon({
// // // // //   html: `<div style="
// // // // //     background-color: #dc2626;
// // // // //     border: 3px solid #fff;
// // // // //     border-radius: 50%;
// // // // //     width: 32px;
// // // // //     height: 32px;
// // // // //     display: flex;
// // // // //     align-items: center;
// // // // //     justify-content: center;
// // // // //     font-size: 18px;
// // // // //     box-shadow: 0 2px 8px rgba(0,0,0,0.3);
// // // // //   ">⚠</div>`,
// // // // //   className: "",
// // // // //   iconSize: [32, 32],
// // // // //   iconAnchor: [16, 16],
// // // // // });

// // // // // const createDeliveryIcon = (number, priority) => {
// // // // //   const colors = {
// // // // //     5: "#dc2626",
// // // // //     4: "#ea580c",
// // // // //     3: "#eab308",
// // // // //     2: "#3b82f6",
// // // // //     1: "#22c55e",
// // // // //   };
// // // // //   const color = colors[priority] || "#6b7280";

// // // // //   return L.divIcon({
// // // // //     html: `<div style="
// // // // //       background-color: ${color};
// // // // //       border: 3px solid #fff;
// // // // //       border-radius: 50%;
// // // // //       width: 36px;
// // // // //       height: 36px;
// // // // //       display: flex;
// // // // //       align-items: center;
// // // // //       justify-content: center;
// // // // //       font-weight: bold;
// // // // //       color: white;
// // // // //       font-size: 14px;
// // // // //       box-shadow: 0 2px 8px rgba(0,0,0,0.3);
// // // // //     ">${number}</div>`,
// // // // //     className: "",
// // // // //     iconSize: [36, 36],
// // // // //     iconAnchor: [18, 36],
// // // // //   });
// // // // // };

// // // // // function MapBoundsFitter({ routeCoords, stops }) {
// // // // //   const map = useMap();

// // // // //   useEffect(() => {
// // // // //     const pts = [];

// // // // //     if (Array.isArray(routeCoords) && routeCoords.length > 1) {
// // // // //       for (const p of routeCoords) {
// // // // //         const lat = p?.[0];
// // // // //         const lng = p?.[1];
// // // // //         if (isValidTamilNaduCoord(lat, lng)) pts.push([lat, lng]);
// // // // //       }
// // // // //     }

// // // // //     if (Array.isArray(stops) && stops.length) {
// // // // //       for (const s of stops) {
// // // // //         if (isValidTamilNaduCoord(s.lat, s.lng)) pts.push([s.lat, s.lng]);
// // // // //       }
// // // // //     }

// // // // //     if (pts.length < 2) return;

// // // // //     try {
// // // // //       const bounds = L.latLngBounds(pts).pad(0.15);
// // // // //       const clamped = bounds.intersects(TN_BOUNDS) ? bounds : TN_BOUNDS;
// // // // //       map.fitBounds(clamped, { padding: [50, 50] });
// // // // //     } catch (e) {
// // // // //       console.error("fitBounds error:", e);
// // // // //     }
// // // // //   }, [routeCoords, stops, map]);

// // // // //   return null;
// // // // // }

// // // // // // ✅ Option A: POST /api/route/optimize
// // // // // async function fetchOptimizedOsrmRoute(stops, roadIssues, { signal } = {}) {
// // // // //   if (!Array.isArray(stops) || stops.length < 2) {
// // // // //     throw new Error("At least 2 stops required");
// // // // //   }

// // // // //   for (const s of stops) {
// // // // //     if (!isValidTamilNaduCoord(s.lat, s.lng)) {
// // // // //       throw new Error("Invalid stop coordinates (must be inside Tamil Nadu bounds)");
// // // // //     }
// // // // //   }

// // // // //   const payload = {
// // // // //     stops: stops.map((s) => ({
// // // // //       lat: s.lat,
// // // // //       lng: s.lng,
// // // // //       priority: s.priority ?? 2,
// // // // //       windowStart: s.windowStart ?? null,
// // // // //       windowEnd: null,
// // // // //     })),
// // // // //     roadIssues: (roadIssues || []).map((i) => ({
// // // // //       latitude: Number(i.latitude),
// // // // //       longitude: Number(i.longitude),
// // // // //       severity: i.severity,
// // // // //     })),
// // // // //     driverLocation: null,
// // // // //   };

// // // // //   const res = await fetch("http://localhost:5066/api/route/optimize", {
// // // // //     method: "POST",
// // // // //     headers: { "Content-Type": "application/json" },
// // // // //     body: JSON.stringify(payload),
// // // // //     signal,
// // // // //   });

// // // // //   if (!res.ok) {
// // // // //     const txt = await res.text().catch(() => "");
// // // // //     throw new Error(`Routing failed(${res.status}): ${txt}`);
// // // // //   }

// // // // //   const data = await res.json();
// // // // //   const route = data.routes?.[0];

// // // // //   if (!route?.geometry?.coordinates?.length) {
// // // // //     throw new Error("OSRM returned no geometry (NoRoute/NoSegment or empty)");
// // // // //   }

// // // // //   // OSRM gives [lng,lat] -> Leaflet needs [lat,lng]
// // // // //   const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

// // // // //   return {
// // // // //     coords,
// // // // //     stats: {
// // // // //       distanceKm: (route.distance / 1000).toFixed(1),
// // // // //       durationMin: Math.round(route.duration / 60),
// // // // //     },
// // // // //   };
// // // // // }

// // // // // const DriverRoutePage = () => {
// // // // //   const { user } = useAuth();

// // // // //   const [orders, setOrders] = useState([]);
// // // // //   const [roadIssues, setRoadIssues] = useState([]);
// // // // //   const [routeOptions, setRouteOptions] = useState([]);
// // // // //   const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);

// // // // //   const [routeCoords, setRouteCoords] = useState([]);
// // // // //   const [routeStats, setRouteStats] = useState(null);
// // // // //   const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);

// // // // //   const [loading, setLoading] = useState(true);
// // // // //   const [loadingRoute, setLoadingRoute] = useState(false);
// // // // //   const [error, setError] = useState(null);

// // // // //   const abortRef = useRef(null);

// // // // //   const getSeverityColor = (s) =>
// // // // //   ({
// // // // //     Critical: "#dc2626",
// // // // //     High: "#ea580c",
// // // // //     Medium: "#eab308",
// // // // //     Low: "#3b82f6",
// // // // //   }[s] || "#6b7280");

// // // // //   useEffect(() => {
// // // // //     const load = async () => {
// // // // //       try {
// // // // //         setLoading(true);

// // // // //         const [routeRes, issuesRes] = await Promise.all([
// // // // //           api.get("/driver/route/optimized"),
// // // // //           api.get("/driver/road-issues"),
// // // // //         ]);

// // // // //         const ords = routeRes.data || [];
// // // // //         const issues = issuesRes.data || [];

// // // // //         setOrders(ords);
// // // // //         setRoadIssues(issues);

// // // // //         const stops = ords
// // // // //           .map((o) => {
// // // // //             const lat = Number(o.deliveryLatitude ?? o.pickupLatitude);
// // // // //             const lng = Number(o.deliveryLongitude ?? o.pickupLongitude);
// // // // //             if (!isValidTamilNaduCoord(lat, lng)) return null;

// // // // //             return {
// // // // //               id: o.id,
// // // // //               orderId: o.id,
// // // // //               lat,
// // // // //               lng,
// // // // //               priority: Number(o.aiPriority || o.priority || 2),
// // // // //               address: o.receiverAddress || o.pickupAddress || "",
// // // // //               windowStart: o.scheduledDate || null,
// // // // //               receiverName: o.receiverName || "Customer",
// // // // //             };
// // // // //           })
// // // // //           .filter(Boolean);

// // // // //         if (stops.length < 2) {
// // // // //           setError("Need at least 2 valid delivery stops inside Tamil Nadu.");
// // // // //           return;
// // // // //         }

// // // // //         setMapCenter([stops[0].lat, stops[0].lng]);

// // // // //         // For Option A backend does ordering anyway.
// // // // //         // Still keep a single option UI.
// // // // //         const options = [
// // // // //           {
// // // // //             id: "optimized",
// // // // //             label: "🎯 Optimized Route",
// // // // //             description: "Priority + road-efficient OSRM optimized",
// // // // //             stops,
// // // // //           },
// // // // //         ];

// // // // //         setRouteOptions(options);
// // // // //         await previewRoute(0, options, issues);
// // // // //       } catch (e) {
// // // // //         console.error(e);
// // // // //         setError(`Failed to load route data: ${e.message}`);
// // // // //       } finally {
// // // // //         setLoading(false);
// // // // //       }
// // // // //     };

// // // // //     load();

// // // // //     return () => {
// // // // //       abortRef.current?.abort?.();
// // // // //     };
// // // // //   }, []);

// // // // //   const previewRoute = async (index, opts = null, issues = null) => {
// // // // //     const option = (opts || routeOptions)?.[index];
// // // // //     if (!option?.stops || option.stops.length < 2) return;

// // // // //     abortRef.current?.abort?.();
// // // // //     const controller = new AbortController();
// // // // //     abortRef.current = controller;

// // // // //     try {
// // // // //       setLoadingRoute(true);
// // // // //       setError(null);

// // // // //       const { coords, stats } = await fetchOptimizedOsrmRoute(
// // // // //         option.stops,
// // // // //         issues ?? roadIssues,
// // // // //         { signal: controller.signal }
// // // // //       );

// // // // //       setRouteCoords(coords);
// // // // //       setRouteStats(stats);
// // // // //     } catch (e) {
// // // // //       if (e?.name === "AbortError") return; // ✅ ignore dev aborts
// // // // //       console.error(e);
// // // // //       setRouteCoords([]);
// // // // //       setRouteStats(null);
// // // // //       setError(e?.message || "Route fetch failed");
// // // // //     } finally {
// // // // //       setLoadingRoute(false);
// // // // //     }
// // // // //   };

// // // // //   const selectedOption = useMemo(
// // // // //     () => routeOptions[selectedOptionIndex],
// // // // //     [routeOptions, selectedOptionIndex]
// // // // //   );

// // // // //   if (loading) {
// // // // //     return (
// // // // //       <div className="flex justify-center items-center h-screen text-[#351c15]">
// // // // //         <div className="text-center">
// // // // //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#351c15] mx-auto mb-4"></div>
// // // // //           <p>Loading route…</p>
// // // // //         </div>
// // // // //       </div>
// // // // //     );
// // // // //   }

// // // // //   return (
// // // // //     <div className="flex min-h-screen bg-[#f7f3ef]">
// // // // //       <DriverSidebar active="route" />

// // // // //       <div className="flex-1 flex flex-col">
// // // // //         <header className="bg-[#fff8e7] border-b border-[#e6ddc5] p-5 flex justify-between items-center shadow-sm">
// // // // //           <div>
// // // // //             <h1 className="text-2xl font-bold text-[#351c15]">🗺 Driver Route Planner</h1>
// // // // //             <p className="text-[#6f4e37] text-sm">OSRM road route + backend optimization</p>
// // // // //           </div>

// // // // //           <div className="text-right">
// // // // //             <p className="text-sm text-[#6f4e37]">Driver</p>
// // // // //             <p className="font-semibold text-[#351c15]">
// // // // //               {user?.first_name} {user?.last_name}
// // // // //             </p>
// // // // //           </div>
// // // // //         </header>

// // // // //         <main className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
// // // // //           <div className="space-y-6">
// // // // //             {error && (
// // // // //               <div className="bg-red-100 border border-red-300 text-red-800 p-3 rounded-lg text-sm">
// // // // //                 ⚠ {error}
// // // // //               </div>
// // // // //             )}

// // // // //             {routeStats && (
// // // // //               <div className="bg-[#fff8e7] border border-[#e6ddc5] p-5 rounded-xl shadow">
// // // // //                 <h3 className="text-sm font-semibold text-[#351c15] mb-3">Route Summary</h3>
// // // // //                 <div className="grid grid-cols-2 gap-4">
// // // // //                   <div>
// // // // //                     <p className="text-2xl font-bold text-[#351c15]">{routeStats.distanceKm} km</p>
// // // // //                     <p className="text-xs text-[#6f4e37]">Distance</p>
// // // // //                   </div>
// // // // //                   <div>
// // // // //                     <p className="text-2xl font-bold text-[#351c15]">{routeStats.durationMin} min</p>
// // // // //                     <p className="text-xs text-[#6f4e37]">Duration</p>
// // // // //                   </div>
// // // // //                 </div>
// // // // //               </div>
// // // // //             )}

// // // // //             <div className="bg-[#fff8e7] border border-[#e6ddc5] p-5 rounded-xl shadow">
// // // // //               <h2 className="text-lg font-semibold text-[#351c15] mb-3">📦 Route</h2>

// // // // //               {routeOptions.map((opt, idx) => (
// // // // //                 <div
// // // // //                   key={opt.id}
// // // // //                   onClick={() => {
// // // // //                     setSelectedOptionIndex(idx);
// // // // //                     previewRoute(idx);
// // // // //                   }}
// // // // //                   className={`border-2 rounded-lg p-4 mb-3 cursor-pointer transition ${selectedOptionIndex === idx
// // // // //                     ? "border-[#f9b400] bg-[#f9b400]/20"
// // // // //                     : "border-[#e6ddc5] bg-white hover:bg-[#fff8e7]"
// // // // //                     }`}
// // // // //                 >
// // // // //                   <div className="flex justify-between">
// // // // //                     <div>
// // // // //                       <p className="font-semibold text-[#351c15]">{opt.label}</p>
// // // // //                       <p className="text-xs text-[#6f4e37]">{opt.description}</p>
// // // // //                     </div>
// // // // //                     <span className="text-xs bg-[#fff8e7] border border-[#e6ddc5] px-2 py-1 rounded">
// // // // //                       {opt.stops.length} stops
// // // // //                     </span>
// // // // //                   </div>
// // // // //                 </div>
// // // // //               ))}
// // // // //             </div>

// // // // //             {selectedOption && (
// // // // //               <div className="bg-[#fff8e7] border border-[#e6ddc5] p-5 rounded-xl shadow max-h-[350px] overflow-y-auto">
// // // // //                 <h2 className="text-lg font-semibold text-[#351c15] mb-3">📍 Stops</h2>

// // // // //                 <ol className="space-y-4">
// // // // //                   {selectedOption.stops.map((stop, i) => {
// // // // //                     const near = isNearRoadIssue(stop, roadIssues);

// // // // //                     return (
// // // // //                       <li key={`${stop.id}-${i}`} className="flex gap-3">
// // // // //                         <span
// // // // //                           className="h-7 w-7 flex items-center justify-center rounded-full text-white text-xs font-bold flex-shrink-0"
// // // // //                           style={{ background: "#3b82f6" }}
// // // // //                         >
// // // // //                           {i + 1}
// // // // //                         </span>

// // // // //                         <div className="flex-1">
// // // // //                           <p className="font-medium text-sm text-[#351c15]">Order #{stop.orderId}</p>
// // // // //                           {near && (
// // // // //                             <span className="text-xs bg-red-100 text-red-700 px-2 rounded inline-block mt-1">
// // // // //                               ⚠ Near Issue
// // // // //                             </span>
// // // // //                           )}
// // // // //                           <p className="text-xs text-[#6f4e37]">{stop.receiverName}</p>
// // // // //                           <p className="text-xs text-[#6f4e37] truncate">{stop.address}</p>
// // // // //                           <p className="text-xs text-[#351c15] font-medium">Priority: {stop.priority}/5</p>
// // // // //                         </div>
// // // // //                       </li>
// // // // //                     );
// // // // //                   })}
// // // // //                 </ol>
// // // // //               </div>
// // // // //             )}
// // // // //           </div>

// // // // //           <div className="lg:col-span-2">
// // // // //             <div
// // // // //               className="bg-[#fff8e7] border border-[#e6ddc5] rounded-xl shadow overflow-hidden relative"
// // // // //               style={{ height: "600px" }}
// // // // //             >
// // // // //               {loadingRoute && (
// // // // //                 <div className="absolute top-4 right-4 bg-white shadow px-3 py-2 rounded text-xs z-[1000]">
// // // // //                   🔄 Calculating road route…
// // // // //                 </div>
// // // // //               )}

// // // // //               <MapContainer
// // // // //                 center={mapCenter}
// // // // //                 zoom={12}
// // // // //                 style={{ height: "100%", width: "100%" }}
// // // // //                 maxBounds={TN_BOUNDS}
// // // // //                 maxBoundsViscosity={1.0}
// // // // //                 minZoom={7}
// // // // //               >
// // // // //                 <TileLayer
// // // // //                   url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
// // // // //                   attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
// // // // //                 />

// // // // //                 <MapBoundsFitter routeCoords={routeCoords} stops={selectedOption?.stops} />

// // // // //                 {selectedOption?.stops.map((stop, i) => (
// // // // //                   <Marker
// // // // //                     key={`stop-${stop.id}-${i}`}
// // // // //                     position={[stop.lat, stop.lng]}
// // // // //                     icon={createDeliveryIcon(i + 1, stop.priority)}
// // // // //                   >
// // // // //                     <Tooltip direction="top">
// // // // //                       <div className="text-xs">
// // // // //                         <strong>Stop {i + 1}</strong> — Order #{stop.orderId}
// // // // //                         <br />
// // // // //                         Priority: {stop.priority}
// // // // //                         <br />
// // // // //                         {stop.receiverName}
// // // // //                         <br />
// // // // //                         {stop.address}
// // // // //                       </div>
// // // // //                     </Tooltip>
// // // // //                   </Marker>
// // // // //                 ))}

// // // // //                 {routeCoords.length > 1 && (
// // // // //                   <Polyline positions={routeCoords} color="#351c15" weight={4} opacity={0.85} />
// // // // //                 )}

// // // // //                 {roadIssues.map((issue, idx) => {
// // // // //                   const lat = Number(issue.latitude);
// // // // //                   const lng = Number(issue.longitude);
// // // // //                   if (!isValidTamilNaduCoord(lat, lng)) return null;

// // // // //                   const radius =
// // // // //                     issue.severity === "Critical" ? 1500 :
// // // // //                       issue.severity === "High" ? 1000 :
// // // // //                         issue.severity === "Medium" ? 700 : 500;

// // // // //                   return (
// // // // //                     <div key={`issue-${issue.id || idx}`}>
// // // // //                       <Circle
// // // // //                         center={[lat, lng]}
// // // // //                         radius={radius}
// // // // //                         pathOptions={{
// // // // //                           color: getSeverityColor(issue.severity),
// // // // //                           fillColor: getSeverityColor(issue.severity),
// // // // //                           fillOpacity: 0.15,
// // // // //                         }}
// // // // //                       />
// // // // //                       <Marker position={[lat, lng]} icon={warningIcon}>
// // // // //                         <Tooltip direction="top">
// // // // //                           <div className="text-xs">
// // // // //                             <strong style={{ color: getSeverityColor(issue.severity) }}>
// // // // //                               ⚠ {issue.issueType || "Road Issue"}
// // // // //                             </strong>
// // // // //                             <br />
// // // // //                             Severity: {issue.severity}
// // // // //                             <br />
// // // // //                             {issue.description || ""}
// // // // //                           </div>
// // // // //                         </Tooltip>
// // // // //                       </Marker>
// // // // //                     </div>
// // // // //                   );
// // // // //                 })}
// // // // //               </MapContainer>
// // // // //             </div>
// // // // //           </div>
// // // // //         </main>
// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // // };

// // // // // export default DriverRoutePage;

// // // // import { useEffect, useRef, useState } from "react";
// // // // import api from "../../services/api";
// // // // import { useAuth } from "../../context/AuthContext";
// // // // import {
// // // //   MapContainer,
// // // //   TileLayer,
// // // //   Marker,
// // // //   Polyline,
// // // //   Tooltip,
// // // //   Circle,
// // // //   useMap,
// // // // } from "react-leaflet";
// // // // import L from "leaflet";
// // // // import "leaflet/dist/leaflet.css";
// // // // import DriverSidebar from "./DriverSidebar";

// // // // /* ===============================
// // // //    LEAFLET ICON FIX
// // // // ================================ */
// // // // delete L.Icon.Default.prototype._getIconUrl;
// // // // L.Icon.Default.mergeOptions({
// // // //   iconRetinaUrl:
// // // //     "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
// // // //   iconUrl:
// // // //     "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
// // // //   shadowUrl:
// // // //     "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
// // // // });

// // // // /* ===============================
// // // //    CONSTANTS
// // // // ================================ */
// // // // const TN_BOUNDS = L.latLngBounds([8.0, 76.0], [13.6, 80.4]);
// // // // const DEFAULT_CENTER = [11.1271, 78.6569];

// // // // const ROUTE_MODES = [
// // // //   { id: "Balanced", label: "🎯 Balanced", desc: "Distance + priority" },
// // // //   { id: "PriorityFirst", label: "⭐ Priority First", desc: "High priority first" },
// // // //   { id: "TimeWindow", label: "⏰ Time Window", desc: "Rescheduled first" },
// // // //   { id: "AvoidIssues", label: "🚧 Avoid Issues", desc: "Avoid risky areas" },
// // // // ];

// // // // /* ===============================
// // // //    HELPERS
// // // // ================================ */
// // // // const isValidTN = (lat, lng) =>
// // // //   Number.isFinite(lat) &&
// // // //   Number.isFinite(lng) &&
// // // //   lat >= 8 &&
// // // //   lat <= 13.6 &&
// // // //   lng >= 76 &&
// // // //   lng <= 80.4;

// // // // /* ===============================
// // // //    NUMBERED STOP ICON
// // // // ================================ */
// // // // const createStopIcon = (num) =>
// // // //   L.divIcon({
// // // //     html: `
// // // //       <div style="
// // // //         background:#2563eb;
// // // //         color:white;
// // // //         width:28px;
// // // //         height:28px;
// // // //         border-radius:50%;
// // // //         display:flex;
// // // //         align-items:center;
// // // //         justify-content:center;
// // // //         font-weight:bold;
// // // //         border:2px solid white;
// // // //         box-shadow:0 2px 6px rgba(0,0,0,0.3);
// // // //       ">${num}</div>
// // // //     `,
// // // //     className: "",
// // // //     iconSize: [28, 28],
// // // //     iconAnchor: [14, 28],
// // // //   });

// // // // /* ===============================
// // // //    MAP BOUNDS FITTER
// // // // ================================ */
// // // // function MapBoundsFitter({ routeCoords, stops }) {
// // // //   const map = useMap();

// // // //   useEffect(() => {
// // // //     const pts = [];

// // // //     routeCoords.forEach(([lat, lng]) => {
// // // //       if (isValidTN(lat, lng)) pts.push([lat, lng]);
// // // //     });

// // // //     stops.forEach((s) => {
// // // //       if (isValidTN(s.lat, s.lng)) pts.push([s.lat, s.lng]);
// // // //     });

// // // //     if (pts.length < 2) return;

// // // //     const bounds = L.latLngBounds(pts).pad(0.15);
// // // //     map.fitBounds(bounds.intersects(TN_BOUNDS) ? bounds : TN_BOUNDS, {
// // // //       padding: [50, 50],
// // // //     });
// // // //   }, [routeCoords, stops, map]);

// // // //   return null;
// // // // }

// // // // /* ===============================
// // // //    BACKEND ROUTE CALL
// // // // ================================ */
// // // // async function fetchOptimizedRoute(stops, roadIssues, mode, signal) {
// // // //   const payload = {
// // // //     stops: stops.map((s) => ({
// // // //       lat: s.lat,
// // // //       lng: s.lng,
// // // //       priority: s.priority,
// // // //       windowStart: s.windowStart,
// // // //       windowEnd: null,
// // // //     })),
// // // //     roadIssues: roadIssues.map((i) => ({
// // // //       latitude: Number(i.latitude),
// // // //       longitude: Number(i.longitude),
// // // //       severity: i.severity,
// // // //     })),
// // // //     driverLocation: null,
// // // //     optimizationMode: mode,
// // // //   };

// // // //   const res = await fetch("http://localhost:5066/api/route/optimize", {
// // // //     method: "POST",
// // // //     headers: { "Content-Type": "application/json" },
// // // //     body: JSON.stringify(payload),
// // // //     signal,
// // // //   });

// // // //   if (!res.ok) {
// // // //     const txt = await res.text().catch(() => "");
// // // //     throw new Error(txt || "Routing failed");
// // // //   }

// // // //   const data = await res.json();
// // // //   const route = data.routes?.[0];

// // // //   return {
// // // //     coords: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
// // // //     stats: {
// // // //       distanceKm: (route.distance / 1000).toFixed(1),
// // // //       durationMin: Math.round(route.duration / 60),
// // // //     },
// // // //   };
// // // // }

// // // // /* ===============================
// // // //    MAIN COMPONENT
// // // // ================================ */
// // // // export default function DriverRoutePage() {
// // // //   const { user } = useAuth();
// // // //   const abortRef = useRef(null);

// // // //   const [stops, setStops] = useState([]);
// // // //   const [roadIssues, setRoadIssues] = useState([]);

// // // //   const [routeCoords, setRouteCoords] = useState([]);
// // // //   const [routeStats, setRouteStats] = useState(null);
// // // //   const [selectedMode, setSelectedMode] = useState("Balanced");

// // // //   const [loading, setLoading] = useState(true);
// // // //   const [routing, setRouting] = useState(false);
// // // //   const [error, setError] = useState(null);

// // // //   /* ===============================
// // // //      LOAD DATA
// // // //   ================================ */
// // // //   useEffect(() => {
// // // //     const load = async () => {
// // // //       try {
// // // //         const [r1, r2] = await Promise.all([
// // // //           api.get("/driver/route/optimized"),
// // // //           api.get("/driver/road-issues"),
// // // //         ]);

// // // //         const mappedStops = (r1.data || [])
// // // //           .map((o) => {
// // // //             const lat = Number(o.deliveryLatitude ?? o.pickupLatitude);
// // // //             const lng = Number(o.deliveryLongitude ?? o.pickupLongitude);
// // // //             if (!isValidTN(lat, lng)) return null;

// // // //             return {
// // // //               id: o.id,
// // // //               lat,
// // // //               lng,
// // // //               priority: Number(o.aiPriority || o.priority || 2),
// // // //               windowStart: o.scheduledDate || null,
// // // //               receiverName: o.receiverName || "Customer",
// // // //               address: o.receiverAddress || o.pickupAddress || "",
// // // //             };
// // // //           })
// // // //           .filter(Boolean);

// // // //         setStops(mappedStops);
// // // //         setRoadIssues(r2.data || []);

// // // //         if (mappedStops.length >= 2) {
// // // //           await calculateRoute(mappedStops, r2.data || [], selectedMode);
// // // //         }
// // // //       } catch {
// // // //         setError("Failed to load route data");
// // // //       } finally {
// // // //         setLoading(false);
// // // //       }
// // // //     };

// // // //     load();
// // // //     return () => abortRef.current?.abort?.();
// // // //   }, []);

// // // //   /* ===============================
// // // //      ROUTE CALCULATION
// // // //   ================================ */
// // // //   const calculateRoute = async (stops, issues, mode) => {
// // // //     abortRef.current?.abort?.();
// // // //     const controller = new AbortController();
// // // //     abortRef.current = controller;

// // // //     try {
// // // //       setRouting(true);
// // // //       setError(null);

// // // //       const { coords, stats } = await fetchOptimizedRoute(
// // // //         stops,
// // // //         issues,
// // // //         mode,
// // // //         controller.signal
// // // //       );

// // // //       setRouteCoords(coords);
// // // //       setRouteStats(stats);
// // // //     } catch (e) {
// // // //       if (e.name !== "AbortError") setError(e.message);
// // // //     } finally {
// // // //       setRouting(false);
// // // //     }
// // // //   };

// // // //   if (loading) {
// // // //     return (
// // // //       <div className="flex items-center justify-center h-screen">
// // // //         <div className="animate-spin h-12 w-12 border-b-2 border-[#351c15]" />
// // // //       </div>
// // // //     );
// // // //   }

// // // //   return (
// // // //     <div className="flex min-h-screen bg-[#f7f3ef]">
// // // //       <DriverSidebar active="route" />

// // // //       <div className="flex-1 flex flex-col">
// // // //         <header className="bg-[#fff8e7] border-b p-5 flex justify-between">
// // // //           <div>
// // // //             <h1 className="text-2xl font-bold">🗺 Driver Route Planner</h1>
// // // //             <p className="text-sm text-gray-600">Choose optimization strategy</p>
// // // //           </div>
// // // //           <div className="font-semibold">
// // // //             {user?.first_name} {user?.last_name}
// // // //           </div>
// // // //         </header>

// // // //         <main className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
// // // //           {/* LEFT */}
// // // //           <div className="space-y-4">
// // // //             {error && (
// // // //               <div className="bg-red-100 border border-red-300 p-3 rounded text-sm">
// // // //                 ⚠ {error}
// // // //               </div>
// // // //             )}

// // // //             {routeStats && (
// // // //               <div className="bg-white p-4 rounded shadow grid grid-cols-2 text-center">
// // // //                 <div>
// // // //                   <div className="text-xl font-bold">{routeStats.distanceKm} km</div>
// // // //                   <div className="text-xs">Distance</div>
// // // //                 </div>
// // // //                 <div>
// // // //                   <div className="text-xl font-bold">{routeStats.durationMin} min</div>
// // // //                   <div className="text-xs">Duration</div>
// // // //                 </div>
// // // //               </div>
// // // //             )}

// // // //             <div className="bg-white p-4 rounded shadow">
// // // //               <h3 className="font-semibold mb-3">Route Options</h3>
// // // //               {ROUTE_MODES.map((m) => (
// // // //                 <div
// // // //                   key={m.id}
// // // //                   onClick={() => {
// // // //                     setSelectedMode(m.id);
// // // //                     calculateRoute(stops, roadIssues, m.id);
// // // //                   }}
// // // //                   className={`p-3 mb-2 border rounded cursor-pointer ${
// // // //                     selectedMode === m.id
// // // //                       ? "bg-yellow-100 border-yellow-400"
// // // //                       : "hover:bg-gray-50"
// // // //                   }`}
// // // //                 >
// // // //                   <div className="font-medium">{m.label}</div>
// // // //                   <div className="text-xs text-gray-600">{m.desc}</div>
// // // //                 </div>
// // // //               ))}
// // // //             </div>
// // // //           </div>

// // // //           {/* MAP */}
// // // //           <div className="lg:col-span-2">
// // // //             <div className="h-[600px] bg-white rounded shadow relative">
// // // //               {routing && (
// // // //                 <div className="absolute top-4 right-4 bg-white p-2 rounded shadow text-xs z-10">
// // // //                   Calculating route…
// // // //                 </div>
// // // //               )}

// // // //               <MapContainer
// // // //                 center={DEFAULT_CENTER}
// // // //                 zoom={12}
// // // //                 maxBounds={TN_BOUNDS}
// // // //                 style={{ height: "100%", width: "100%" }}
// // // //               >
// // // //                 <TileLayer
// // // //                   url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
// // // //                 />

// // // //                 <MapBoundsFitter routeCoords={routeCoords} stops={stops} />

// // // //                 {stops.map((s, i) => (
// // // //                   <Marker
// // // //                     key={s.id}
// // // //                     position={[s.lat, s.lng]}
// // // //                     icon={createStopIcon(i + 1)}
// // // //                   >
// // // //                     <Tooltip>
// // // //                       Stop {i + 1}
// // // //                       <br />
// // // //                       Priority: {s.priority}
// // // //                       <br />
// // // //                       {s.receiverName}
// // // //                     </Tooltip>
// // // //                   </Marker>
// // // //                 ))}

// // // //                 {routeCoords.length > 1 && (
// // // //                   <Polyline
// // // //                     positions={routeCoords}
// // // //                     color="#111827"
// // // //                     weight={3}
// // // //                     opacity={0.85}
// // // //                   />
// // // //                 )}

// // // //                 {roadIssues.map((issue, idx) => {
// // // //                   const lat = Number(issue.latitude);
// // // //                   const lng = Number(issue.longitude);
// // // //                   if (!isValidTN(lat, lng)) return null;

// // // //                   const radius =
// // // //                     issue.severity === "Critical" ? 1500 :
// // // //                     issue.severity === "High" ? 1000 :
// // // //                     issue.severity === "Medium" ? 700 : 500;

// // // //                   const color =
// // // //                     issue.severity === "Critical" ? "#dc2626" :
// // // //                     issue.severity === "High" ? "#ea580c" :
// // // //                     issue.severity === "Medium" ? "#eab308" :
// // // //                     "#3b82f6";

// // // //                   return (
// // // //                     <div key={`issue-${idx}`}>
// // // //                       <Circle
// // // //                         center={[lat, lng]}
// // // //                         radius={radius}
// // // //                         pathOptions={{
// // // //                           color,
// // // //                           fillColor: color,
// // // //                           fillOpacity: 0.25,
// // // //                         }}
// // // //                       />
// // // //                       <Marker position={[lat, lng]}>
// // // //                         <Tooltip>
// // // //                           🚧 Road Issue
// // // //                           <br />
// // // //                           Severity: {issue.severity}
// // // //                         </Tooltip>
// // // //                       </Marker>
// // // //                     </div>
// // // //                   );
// // // //                 })}
// // // //               </MapContainer>
// // // //             </div>
// // // //           </div>
// // // //         </main>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }

// // // import { useEffect, useRef, useState } from "react";
// // // import api from "../../services/api";
// // // import { useAuth } from "../../context/AuthContext";
// // // import {
// // //   MapContainer,
// // //   TileLayer,
// // //   Marker,
// // //   Polyline,
// // //   Tooltip,
// // //   Circle,
// // //   useMap,
// // // } from "react-leaflet";
// // // import L from "leaflet";
// // // import "leaflet/dist/leaflet.css";
// // // import DriverSidebar from "./DriverSidebar";

// // // /* ===============================
// // //    LEAFLET FIX
// // // ================================ */
// // // delete L.Icon.Default.prototype._getIconUrl;
// // // L.Icon.Default.mergeOptions({
// // //   iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
// // //   iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
// // //   shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
// // // });

// // // /* ===============================
// // //    CONSTANTS
// // // ================================ */
// // // const TN_BOUNDS = L.latLngBounds([8.0, 76.0], [13.6, 80.4]);
// // // const DEFAULT_CENTER = [11.1271, 78.6569];

// // // const ROUTE_MODES = [
// // //   { id: "Balanced", label: "🎯 Balanced", desc: "Distance + priority" },
// // //   { id: "PriorityFirst", label: "⭐ Priority First", desc: "High priority first" },
// // //   { id: "TimeWindow", label: "⏰ Time Window", desc: "Rescheduled first" },
// // //   { id: "AvoidIssues", label: "🚧 Avoid Issues", desc: "Avoid risky areas" },
// // // ];

// // // const STORAGE_KEY = "driverPreferredRouteMode";

// // // /* ===============================
// // //    HELPERS
// // // ================================ */
// // // const isValidTN = (lat, lng) =>
// // //   Number.isFinite(lat) &&
// // //   Number.isFinite(lng) &&
// // //   lat >= 8 &&
// // //   lat <= 13.6 &&
// // //   lng >= 76 &&
// // //   lng <= 80.4;

// // // /* ===============================
// // //    STOP ICON
// // // ================================ */
// // // const stopIcon = (num) =>
// // //   L.divIcon({
// // //     html: `<div style="
// // //       background:#2563eb;color:white;width:28px;height:28px;
// // //       border-radius:50%;display:flex;align-items:center;
// // //       justify-content:center;font-weight:bold;border:2px solid white;">
// // //       ${num}
// // //     </div>`,
// // //     className: "",
// // //     iconSize: [28, 28],
// // //     iconAnchor: [14, 28],
// // //   });

// // // /* ===============================
// // //    MAP FITTER
// // // ================================ */
// // // function MapBoundsFitter({ routeCoords, stops }) {
// // //   const map = useMap();
// // //   useEffect(() => {
// // //     const pts = [];

// // //     routeCoords.forEach(([lat, lng]) => isValidTN(lat, lng) && pts.push([lat, lng]));
// // //     stops.forEach((s) => isValidTN(s.lat, s.lng) && pts.push([s.lat, s.lng]));

// // //     if (pts.length > 1) {
// // //       const b = L.latLngBounds(pts).pad(0.15);
// // //       map.fitBounds(b.intersects(TN_BOUNDS) ? b : TN_BOUNDS);
// // //     }
// // //   }, [routeCoords, stops, map]);

// // //   return null;
// // // }

// // // /* ===============================
// // //    ROUTE API
// // // ================================ */
// // // async function fetchRoute(stops, issues, mode, signal) {
// // //   const payload = {
// // //     stops: stops.map((s) => ({
// // //       lat: s.lat,
// // //       lng: s.lng,
// // //       priority: s.priority,
// // //       windowStart: s.windowStart,
// // //       windowEnd: null,
// // //     })),
// // //     roadIssues: issues,
// // //     driverLocation: null,
// // //     optimizationMode: mode,
// // //   };

// // //   const res = await fetch("http://localhost:5066/api/route/optimize", {
// // //     method: "POST",
// // //     headers: { "Content-Type": "application/json" },
// // //     body: JSON.stringify(payload),
// // //     signal,
// // //   });

// // //   const data = await res.json();
// // //   const route = data.routes[0];

// // //   return {
// // //     coords: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
// // //     duration: route.duration,
// // //     distance: route.distance,
// // //   };
// // // }

// // // /* ===============================
// // //    MAIN COMPONENT
// // // ================================ */
// // // export default function DriverRoutePage() {
// // //   const { user } = useAuth();
// // //   const abortRef = useRef(null);

// // //   const [stops, setStops] = useState([]);
// // //   const [roadIssues, setRoadIssues] = useState([]);
// // //   const [routeCoords, setRouteCoords] = useState([]);
// // //   const [etas, setEtas] = useState([]);

// // //   const [selectedMode, setSelectedMode] = useState(
// // //     localStorage.getItem(STORAGE_KEY) || "Balanced"
// // //   );

// // //   const [stats, setStats] = useState(null);
// // //   const [routing, setRouting] = useState(false);

// // //   /* ===============================
// // //      LOAD DATA
// // //   ================================ */
// // //   useEffect(() => {
// // //     (async () => {
// // //       const [r1, r2] = await Promise.all([
// // //         api.get("/driver/route/optimized"),
// // //         api.get("/driver/road-issues"),
// // //       ]);

// // //       const mappedStops = r1.data
// // //         .map((o) => ({
// // //           id: o.id,
// // //           lat: Number(o.deliveryLatitude ?? o.pickupLatitude),
// // //           lng: Number(o.deliveryLongitude ?? o.pickupLongitude),
// // //           priority: o.priority ?? 2,
// // //           receiverName: o.receiverName,
// // //           windowStart: o.scheduledDate,
// // //         }))
// // //         .filter((s) => isValidTN(s.lat, s.lng));

// // //       setStops(mappedStops);
// // //       setRoadIssues(r2.data);
// // //     })();
// // //   }, []);

// // //   /* ===============================
// // //      LIVE REROUTE ON ISSUE CHANGE
// // //   ================================ */
// // //   useEffect(() => {
// // //     if (stops.length >= 2) {
// // //       calculateRoute();
// // //     }
// // //   }, [roadIssues, selectedMode]);

// // //   /* ===============================
// // //      ROUTE CALCULATION
// // //   ================================ */
// // //   const calculateRoute = async () => {
// // //     abortRef.current?.abort?.();
// // //     const controller = new AbortController();
// // //     abortRef.current = controller;

// // //     setRouting(true);

// // //     const { coords, duration, distance } = await fetchRoute(
// // //       stops,
// // //       roadIssues,
// // //       selectedMode,
// // //       controller.signal
// // //     );

// // //     setRouteCoords(coords);
// // //     setStats({
// // //       km: (distance / 1000).toFixed(1),
// // //       min: Math.round(duration / 60),
// // //     });

// // //     /* ETA PER STOP */
// // //     const perStop = Math.round(duration / stops.length);
// // //     setEtas(stops.map((_, i) => Math.round(((i + 1) * perStop) / 60)));

// // //     setRouting(false);
// // //   };

// // //   /* ===============================
// // //      MODE CHANGE (PERSIST)
// // //   ================================ */
// // //   const onModeSelect = (mode) => {
// // //     localStorage.setItem(STORAGE_KEY, mode);
// // //     setSelectedMode(mode);
// // //   };

// // //   return (
// // //     <div className="flex min-h-screen">
// // //       <DriverSidebar active="route" />

// // //       <div className="flex-1 p-6">
// // //         <h1 className="text-2xl font-bold mb-4">🗺 Driver Route Planner</h1>

// // //         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
// // //           {/* LEFT */}
// // //           <div>
// // //             {ROUTE_MODES.map((m) => (
// // //               <div
// // //                 key={m.id}
// // //                 onClick={() => onModeSelect(m.id)}
// // //                 className={`p-3 mb-2 border rounded cursor-pointer ${
// // //                   selectedMode === m.id ? "bg-yellow-100" : ""
// // //                 }`}
// // //               >
// // //                 <div>{m.label}</div>
// // //                 <div className="text-xs text-gray-500">{m.desc}</div>
// // //               </div>
// // //             ))}

// // //             {stats && (
// // //               <div className="mt-4 p-4 bg-white shadow rounded">
// // //                 <div>{stats.km} km</div>
// // //                 <div>{stats.min} min</div>
// // //               </div>
// // //             )}
// // //           </div>

// // //           {/* MAP */}
// // //           <div className="lg:col-span-2 h-[600px] bg-white shadow rounded">
// // //             <MapContainer center={DEFAULT_CENTER} zoom={12} style={{ height: "100%" }}>
// // //               <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
// // //               <MapBoundsFitter routeCoords={routeCoords} stops={stops} />

// // //               {stops.map((s, i) => (
// // //                 <Marker key={s.id} position={[s.lat, s.lng]} icon={stopIcon(i + 1)}>
// // //                   <Tooltip>
// // //                     Stop {i + 1}
// // //                     <br />
// // //                     ETA: {etas[i]} min
// // //                   </Tooltip>
// // //                 </Marker>
// // //               ))}

// // //               {routeCoords.length > 1 && (
// // //                 <Polyline positions={routeCoords} color="#111827" />
// // //               )}

// // //               {roadIssues.map((i, idx) => (
// // //                 <Circle
// // //                   key={idx}
// // //                   center={[i.latitude, i.longitude]}
// // //                   radius={800}
// // //                   pathOptions={{ color: "#dc2626", fillOpacity: 0.2 }}
// // //                 />
// // //               ))}
// // //             </MapContainer>
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }




// // import { useEffect, useRef, useState } from "react";
// // import api from "../../services/api";
// // import { useAuth } from "../../context/AuthContext";
// // import {
// //   MapContainer,
// //   TileLayer,
// //   Marker,
// //   Polyline,
// //   Tooltip,
// //   Circle,
// //   useMap,
// // } from "react-leaflet";
// // import L from "leaflet";
// // import "leaflet/dist/leaflet.css";
// // import DriverSidebar from "./DriverSidebar";

// // /* ===========================
// //    LEAFLET FIX
// // =========================== */
// // delete L.Icon.Default.prototype._getIconUrl;
// // L.Icon.Default.mergeOptions({
// //   iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
// //   iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
// //   shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
// // });

// // /* ===========================
// //    CONSTANTS
// // =========================== */
// // const TN_BOUNDS = L.latLngBounds([8.0, 76.0], [13.6, 80.4]);
// // const DEFAULT_CENTER = [11.1271, 78.6569];

// // const ROUTE_MODES = [
// //   { id: "Balanced", label: "🎯 Balanced", desc: "Distance + priority" },
// //   { id: "PriorityFirst", label: "⭐ Priority", desc: "High priority first" },
// //   { id: "TimeWindow", label: "⏰ Time Window", desc: "Rescheduled first" },
// //   { id: "AvoidIssues", label: "🚧 Avoid Issues", desc: "Avoid road issues" },
// // ];

// // const STORAGE_KEY = "driver_route_mode";

// // /* ===========================
// //    HELPERS
// // =========================== */
// // const isValidTN = (lat, lng) =>
// //   Number.isFinite(lat) &&
// //   Number.isFinite(lng) &&
// //   lat >= 8 &&
// //   lat <= 13.6 &&
// //   lng >= 76 &&
// //   lng <= 80.4;

// // /* ===========================
// //    STOP ICON
// // =========================== */
// // const stopIcon = (num) =>
// //   L.divIcon({
// //     html: `<div style="
// //       background:#2563eb;
// //       color:white;
// //       width:28px;
// //       height:28px;
// //       border-radius:50%;
// //       display:flex;
// //       align-items:center;
// //       justify-content:center;
// //       font-weight:bold;
// //       border:2px solid white;
// //     ">${num}</div>`,
// //     className: "",
// //     iconSize: [28, 28],
// //     iconAnchor: [14, 28],
// //   });

// // /* ===========================
// //    MAP FITTER
// // =========================== */
// // function MapBoundsFitter({ coords, stops }) {
// //   const map = useMap();

// //   useEffect(() => {
// //     const pts = [];

// //     coords.forEach(([lat, lng]) => isValidTN(lat, lng) && pts.push([lat, lng]));
// //     stops.forEach((s) => isValidTN(s.lat, s.lng) && pts.push([s.lat, s.lng]));

// //     if (pts.length > 1) {
// //       const bounds = L.latLngBounds(pts).pad(0.15);
// //       map.fitBounds(bounds.intersects(TN_BOUNDS) ? bounds : TN_BOUNDS);
// //     }
// //   }, [coords, stops, map]);

// //   return null;
// // }

// // /* ===========================
// //    ETA DRIFT MODEL
// // =========================== */
// // function applyTrafficDrift(baseEta, stop, issues) {
// //   let drift = 0;
// //   const hour = new Date().getHours();

// //   if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20)) {
// //     drift += baseEta * 0.15;
// //   }

// //   issues.forEach((i) => {
// //     const d =
// //       Math.abs(stop.lat - i.latitude) +
// //       Math.abs(stop.lng - i.longitude);

// //     if (d < 0.02) {
// //       drift +=
// //         i.severity === "Critical"
// //           ? 12
// //           : i.severity === "High"
// //             ? 8
// //             : i.severity === "Medium"
// //               ? 5
// //               : 2;
// //     }
// //   });

// //   return Math.round(baseEta + drift);
// // }

// // /* ===========================
// //    ROUTE API
// // =========================== */
// // async function fetchRoute(stops, issues, mode, signal) {
// //   const payload = {
// //     stops: stops.map((s) => ({
// //       lat: s.lat,
// //       lng: s.lng,
// //       priority: s.priority,
// //       windowStart: s.windowStart,
// //       windowEnd: null,
// //     })),
// //     roadIssues: issues,
// //     driverLocation: null,
// //     optimizationMode: mode,
// //   };

// //   const res = await fetch("http://localhost:5066/api/route/optimize", {
// //     method: "POST",
// //     headers: { "Content-Type": "application/json" },
// //     body: JSON.stringify(payload),
// //     signal,
// //   });

// //   const data = await res.json();
// //   const route = data.routes[0];

// //   return {
// //     coords: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
// //     duration: route.duration,
// //     distance: route.distance,
// //   };
// // }

// // /* ===========================
// //    MAIN COMPONENT
// // =========================== */
// // export default function DriverRoutePage() {
// //   const { user } = useAuth();
// //   const abortRef = useRef(null);

// //   const [stops, setStops] = useState([]);
// //   const [roadIssues, setRoadIssues] = useState([]);
// //   const [routeCoords, setRouteCoords] = useState([]);
// //   const [etas, setEtas] = useState([]);
// //   const [stats, setStats] = useState(null);
// //   const [routing, setRouting] = useState(false);
// //   const [routeChanged, setRouteChanged] = useState(false);

// //   const [mode, setMode] = useState(
// //     localStorage.getItem(STORAGE_KEY) || "Balanced"
// //   );

// //   /* LOAD DATA */
// //   useEffect(() => {
// //     (async () => {
// //       const [ordersRes, issuesRes] = await Promise.all([
// //         api.get("/driver/route/optimized"),
// //         api.get("/driver/road-issues"),
// //       ]);

// //       const mappedStops = ordersRes.data
// //         .map((o) => ({
// //           id: o.id,
// //           lat: Number(o.deliveryLatitude ?? o.pickupLatitude),
// //           lng: Number(o.deliveryLongitude ?? o.pickupLongitude),
// //           priority: o.priority ?? 2,
// //           windowStart: o.scheduledDate,
// //           receiverName: o.receiverName,
// //         }))
// //         .filter((s) => isValidTN(s.lat, s.lng));

// //       setStops(mappedStops);
// //       setRoadIssues(issuesRes.data || []);
// //     })();
// //   }, []);

// //   /* LIVE REROUTE */
// //   useEffect(() => {
// //     if (stops.length >= 2) calculateRoute();
// //   }, [roadIssues, mode]);

// //   const calculateRoute = async () => {
// //     abortRef.current?.abort?.();
// //     const controller = new AbortController();
// //     abortRef.current = controller;

// //     setRouting(true);

// //     const { coords, duration, distance } = await fetchRoute(
// //       stops,
// //       roadIssues,
// //       mode,
// //       controller.signal
// //     );

// //     setRouteCoords(coords);
// //     setStats({
// //       km: (distance / 1000).toFixed(1),
// //       min: Math.round(duration / 60),
// //     });

// //     const basePerStop = Math.round(duration / stops.length / 60);
// //     setEtas(
// //       stops.map((s, i) =>
// //         applyTrafficDrift(basePerStop * (i + 1), s, roadIssues)
// //       )
// //     );

// //     setRouteChanged(true);
// //     setTimeout(() => setRouteChanged(false), 4000);

// //     setRouting(false);
// //   };

// //   const selectMode = (m) => {
// //     localStorage.setItem(STORAGE_KEY, m);
// //     setMode(m);
// //   };

// //   return (
// //     <div className="flex min-h-screen">
// //       <DriverSidebar active="route" />

// //       {routeChanged && (
// //         <div className="fixed top-16 right-6 z-50 bg-yellow-100 border px-4 py-2 rounded shadow">
// //           🔄 Route updated
// //         </div>
// //       )}

// //       <div className="flex-1 p-6">
// //         <h1 className="text-2xl font-bold mb-4">🗺 Driver Route Planner</h1>

// //         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
// //           {/* LEFT */}
// //           <div>
// //             {ROUTE_MODES.map((m) => (
// //               <div
// //                 key={m.id}
// //                 onClick={() => selectMode(m.id)}
// //                 className={`p-3 mb-2 border rounded cursor-pointer ${mode === m.id ? "bg-yellow-100" : ""
// //                   }`}
// //               >
// //                 <div>{m.label}</div>
// //                 <div className="text-xs text-gray-500">{m.desc}</div>
// //               </div>
// //             ))}

// //             {stats && (
// //               <div className="mt-4 p-4 bg-white shadow rounded">
// //                 <div>{stats.km} km</div>
// //                 <div>{stats.min} min</div>
// //               </div>
// //             )}
// //           </div>

// //           {/* MAP */}
// //           <div className="lg:col-span-2 h-[600px] bg-white shadow rounded">
// //             <MapContainer center={DEFAULT_CENTER} zoom={12} style={{ height: "100%" }}>
// //               {/* <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" /> */}
// //               <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />




// //               <MapBoundsFitter coords={routeCoords} stops={stops} />

// //               {stops.map((s, i) => (
// //                 <Marker key={s.id} position={[s.lat, s.lng]} icon={stopIcon(i + 1)}>
// //                   <Tooltip>
// //                     Stop {i + 1}
// //                     <br />
// //                     ETA: {etas[i]} min
// //                   </Tooltip>
// //                 </Marker>
// //               ))}

// //               {routeCoords.length > 1 && (
// //                 // <Polyline positions={routeCoords} color="#111827" weight={3} />
// //                 <Polyline positions={routeCoords} color="#2563eb" weight={4} />

// //               )}

// //               {roadIssues.map((i, idx) => (
// //                 <Circle
// //                   key={idx}
// //                   center={[i.latitude, i.longitude]}
// //                   radius={800}
// //                   pathOptions={{ color: "#dc2626", fillOpacity: 0.2 }}
// //                 />
// //               ))}
// //             </MapContainer>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }


// import { useEffect, useRef, useState } from "react";
// import api from "../../services/api";
// import { useAuth } from "../../context/AuthContext";
// import {
//   MapContainer,
//   TileLayer,
//   Marker,
//   Polyline,
//   Tooltip,
//   Circle,
//   useMap,
// } from "react-leaflet";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import DriverSidebar from "./DriverSidebar";

// /* ===========================
//    LEAFLET FIX
// =========================== */
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
//   iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
// });

// /* ===========================
//    CONSTANTS
// =========================== */
// const TN_BOUNDS = L.latLngBounds([8.0, 76.0], [13.6, 80.4]);
// const DEFAULT_CENTER = [11.1271, 78.6569];

// const ROUTE_MODES = [
//   { id: "Balanced", label: "🎯 Balanced", desc: "AI Priority + Distance" },
//   { id: "PriorityFirst", label: "⭐ Priority", desc: "AI Priority first" },
//   { id: "TimeWindow", label: "⏰ Time Window", desc: "Rescheduled first" },
//   { id: "AvoidIssues", label: "🚧 Avoid Issues", desc: "Avoid road issues" },
// ];

// const STORAGE_KEY = "driver_route_mode";

// /* ===========================
//    HELPERS
// =========================== */
// const isValidTN = (lat, lng) =>
//   Number.isFinite(lat) &&
//   Number.isFinite(lng) &&
//   lat >= 8 &&
//   lat <= 13.6 &&
//   lng >= 76 &&
//   lng <= 80.4;

// /* ===========================
//    STOP ICON
// =========================== */
// const stopIcon = (num, priority) => {
//   const color = priority >= 4 ? "#dc2626" : priority >= 3 ? "#f59e0b" : "#2563eb";
//   return L.divIcon({
//     html: `<div style="
//       background:${color};
//       color:white;
//       width:32px;
//       height:32px;
//       border-radius:50%;
//       display:flex;
//       align-items:center;
//       justify-content:center;
//       font-weight:bold;
//       border:3px solid white;
//       box-shadow: 0 2px 4px rgba(0,0,0,0.2);
//       font-size: 14px;
//     ">${num}</div>`,
//     className: "",
//     iconSize: [32, 32],
//     iconAnchor: [16, 32],
//   });
// };

// /* ===========================
//    MAP FITTER
// =========================== */
// function MapBoundsFitter({ coords, stops }) {
//   const map = useMap();

//   useEffect(() => {
//     const pts = [];

//     coords.forEach(([lat, lng]) => isValidTN(lat, lng) && pts.push([lat, lng]));
//     stops.forEach((s) => isValidTN(s.lat, s.lng) && pts.push([s.lat, s.lng]));

//     if (pts.length > 1) {
//       const bounds = L.latLngBounds(pts).pad(0.15);
//       map.fitBounds(bounds.intersects(TN_BOUNDS) ? bounds : TN_BOUNDS);
//     }
//   }, [coords, stops, map]);

//   return null;
// }

// /* ===========================
//    ETA DRIFT MODEL
// =========================== */
// function applyTrafficDrift(baseEta, stop, issues) {
//   let drift = 0;
//   const hour = new Date().getHours();

//   if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20)) {
//     drift += baseEta * 0.15;
//   }

//   issues.forEach((i) => {
//     const d =
//       Math.abs(stop.lat - i.latitude) +
//       Math.abs(stop.lng - i.longitude);

//     if (d < 0.02) {
//       drift +=
//         i.severity === "Critical"
//           ? 12
//           : i.severity === "High"
//             ? 8
//             : i.severity === "Medium"
//               ? 5
//               : 2;
//     }
//   });

//   return Math.round(baseEta + drift);
// }

// /* ===========================
//    ROUTE API
// =========================== */
// async function fetchRoute(stops, issues, mode, signal) {
//   const payload = {
//     stops: stops.map((s) => ({
//       lat: s.lat,
//       lng: s.lng,
//       priority: s.aiPriority || s.priority,
//       windowStart: s.windowStart,
//       windowEnd: null,
//     })),
//     roadIssues: issues,
//     driverLocation: null,
//     optimizationMode: mode,
//   };

//   const res = await fetch("http://localhost:5066/api/route/optimize", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload),
//     signal,
//   });

//   const data = await res.json();
//   const route = data.routes[0];

//   return {
//     coords: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
//     duration: route.duration,
//     distance: route.distance,
//   };
// }

// /* ===========================
//    MAIN COMPONENT
// =========================== */
// export default function DriverRoutePage() {
//   const { user } = useAuth();
//   const abortRef = useRef(null);

//   const [stops, setStops] = useState([]);
//   const [roadIssues, setRoadIssues] = useState([]);
//   const [routeCoords, setRouteCoords] = useState([]);
//   const [etas, setEtas] = useState([]);
//   const [stats, setStats] = useState(null);
//   const [routing, setRouting] = useState(false);
//   const [routeChanged, setRouteChanged] = useState(false);

//   const [mode, setMode] = useState(
//     localStorage.getItem(STORAGE_KEY) || "Balanced"
//   );

//   /* LOAD DATA */
//   useEffect(() => {
//     (async () => {
//       const [ordersRes, issuesRes] = await Promise.all([
//         api.get("/driver/route/optimized"),
//         api.get("/driver/road-issues"),
//       ]);

//       const mappedStops = ordersRes.data
//         .map((o) => ({
//           id: o.id,
//           trackingId: o.trackingId,
//           lat: Number(o.deliveryLatitude ?? o.pickupLatitude),
//           lng: Number(o.deliveryLongitude ?? o.pickupLongitude),
//           priority: o.priority ?? 2,
//           aiPriority: o.aiPriority,
//           aiJustification: o.aiPriorityJustification,
//           windowStart: o.scheduledDate,
//           receiverName: o.receiverName,
//           receiverAddress: o.receiverAddress,
//           status: o.status,
//         }))
//         .filter((s) => isValidTN(s.lat, s.lng));

//       setStops(mappedStops);
//       setRoadIssues(issuesRes.data || []);
//     })();
//   }, []);

//   /* LIVE REROUTE */
//   useEffect(() => {
//     if (stops.length >= 2) calculateRoute();
//   }, [roadIssues, mode]);

//   const calculateRoute = async () => {
//     abortRef.current?.abort?.();
//     const controller = new AbortController();
//     abortRef.current = controller;

//     setRouting(true);

//     try {
//       const { coords, duration, distance } = await fetchRoute(
//         stops,
//         roadIssues,
//         mode,
//         controller.signal
//       );

//       setRouteCoords(coords);
//       setStats({
//         km: (distance / 1000).toFixed(1),
//         min: Math.round(duration / 60),
//       });

//       const basePerStop = Math.round(duration / stops.length / 60);
//       setEtas(
//         stops.map((s, i) =>
//           applyTrafficDrift(basePerStop * (i + 1), s, roadIssues)
//         )
//       );

//       setRouteChanged(true);
//       setTimeout(() => setRouteChanged(false), 4000);
//     } catch (err) {
//       if (err.name !== 'AbortError') {
//         console.error('Route calculation failed:', err);
//       }
//     } finally {
//       setRouting(false);
//     }
//   };

//   const selectMode = (m) => {
//     localStorage.setItem(STORAGE_KEY, m);
//     setMode(m);
//   };

//   const getPriorityBadge = (stop) => {
//     const priority = stop.aiPriority || stop.priority;
//     if (priority >= 4) return <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">High</span>;
//     if (priority >= 3) return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">Medium</span>;
//     return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">Normal</span>;
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       <DriverSidebar active="route" />

//       {routeChanged && (
//         <div className="fixed top-16 right-6 z-50 bg-yellow-100 border border-yellow-400 px-4 py-2 rounded-lg shadow-lg">
//           🔄 Route updated
//         </div>
//       )}

//       <div className="flex-1 p-6">
//         <div className="mb-6">
//           <h1 className="text-3xl font-bold text-gray-800">🗺 Driver Route Planner</h1>
//           <p className="text-gray-600 mt-1">Optimized delivery route with AI-powered prioritization</p>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//           {/* LEFT - OPTIMIZATION MODES */}
//           <div className="space-y-3">
//             <h2 className="font-semibold text-gray-700 mb-3">Optimization Mode</h2>
//             {ROUTE_MODES.map((m) => (
//               <div
//                 key={m.id}
//                 onClick={() => selectMode(m.id)}
//                 className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
//                   mode === m.id
//                     ? "bg-blue-50 border-blue-500 shadow-md"
//                     : "bg-white border-gray-200 hover:border-blue-300"
//                 }`}
//               >
//                 <div className="font-medium text-gray-800">{m.label}</div>
//                 <div className="text-xs text-gray-500 mt-1">{m.desc}</div>
//               </div>
//             ))}

//             {stats && (
//               <div className="mt-6 p-4 bg-white shadow-md rounded-lg border border-gray-200">
//                 <h3 className="font-semibold text-gray-700 mb-2">Route Stats</h3>
//                 <div className="space-y-2">
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Distance:</span>
//                     <span className="font-semibold">{stats.km} km</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Duration:</span>
//                     <span className="font-semibold">{stats.min} min</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Stops:</span>
//                     <span className="font-semibold">{stops.length}</span>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {routing && (
//               <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
//                 ⏳ Calculating optimal route...
//               </div>
//             )}
//           </div>

//           {/* MAP */}
//           <div className="lg:col-span-3">
//             <div className="h-[500px] bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
//               <MapContainer center={DEFAULT_CENTER} zoom={12} style={{ height: "100%" }}>
//                 <TileLayer 
//                   url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
//                   attribution='&copy; OpenStreetMap contributors' 
//                 />

//                 <MapBoundsFitter coords={routeCoords} stops={stops} />

//                 {stops.map((s, i) => (
//                   <Marker 
//                     key={s.id} 
//                     position={[s.lat, s.lng]} 
//                     icon={stopIcon(i + 1, s.aiPriority || s.priority)}
//                   >
//                     <Tooltip permanent={false} direction="top">
//                       <div className="text-xs">
//                         <div className="font-bold">Stop #{i + 1}</div>
//                         <div className="text-gray-600">Order ID: {s.trackingId || s.id}</div>
//                         <div className="text-gray-600">{s.receiverName}</div>
//                         <div className="text-gray-500 text-[10px] mt-1">{s.receiverAddress}</div>
//                         <div className="mt-1 text-blue-600 font-semibold">ETA: {etas[i]} min</div>
//                         {s.aiPriority && (
//                           <div className="mt-1 text-purple-600 text-[10px]">
//                             AI Priority: {s.aiPriority}/5
//                           </div>
//                         )}
//                       </div>
//                     </Tooltip>
//                   </Marker>
//                 ))}

//                 {routeCoords.length > 1 && (
//                   <Polyline positions={routeCoords} color="#2563eb" weight={4} opacity={0.7} />
//                 )}

//                 {roadIssues.map((i, idx) => (
//                   <Circle
//                     key={idx}
//                     center={[i.latitude, i.longitude]}
//                     radius={800}
//                     pathOptions={{ color: "#dc2626", fillColor: "#dc2626", fillOpacity: 0.15 }}
//                   >
//                     <Tooltip>
//                       <div className="text-xs">
//                         <div className="font-bold text-red-600">Road Issue</div>
//                         <div>{i.description}</div>
//                         <div className="text-gray-500">Severity: {i.severity}</div>
//                       </div>
//                     </Tooltip>
//                   </Circle>
//                 ))}
//               </MapContainer>
//             </div>

//             {/* OPTIMIZED ORDER LIST */}
//             <div className="mt-6 bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden">
//               <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
//                 <h2 className="font-bold text-white text-lg">📋 Optimized Delivery Sequence</h2>
//               </div>
//               <div className="max-h-80 overflow-y-auto">
//                 {stops.length === 0 ? (
//                   <div className="p-6 text-center text-gray-500">
//                     No stops available for routing
//                   </div>
//                 ) : (
//                   <div className="divide-y divide-gray-100">
//                     {stops.map((stop, idx) => (
//                       <div 
//                         key={stop.id} 
//                         className="p-4 hover:bg-gray-50 transition-colors"
//                       >
//                         <div className="flex items-start gap-4">
//                           <div className="flex-shrink-0">
//                             <div 
//                               className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md"
//                               style={{
//                                 backgroundColor: (stop.aiPriority || stop.priority) >= 4 
//                                   ? "#dc2626" 
//                                   : (stop.aiPriority || stop.priority) >= 3 
//                                     ? "#f59e0b" 
//                                     : "#2563eb"
//                               }}
//                             >
//                               {idx + 1}
//                             </div>
//                           </div>

//                           <div className="flex-1 min-w-0">
//                             <div className="flex items-center gap-2 mb-1">
//                               <span className="font-semibold text-gray-800">
//                                 {stop.receiverName}
//                               </span>
//                               {getPriorityBadge(stop)}
//                               {stop.aiPriority && (
//                                 <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
//                                   AI: {stop.aiPriority}/5
//                                 </span>
//                               )}
//                             </div>

//                             <div className="text-sm text-gray-600 mb-1">
//                               Order ID: <span className="font-mono font-semibold">{stop.trackingId || stop.id}</span>
//                             </div>

//                             <div className="text-sm text-gray-500 truncate">
//                               📍 {stop.receiverAddress}
//                             </div>

//                             {stop.aiJustification && (
//                               <div className="mt-2 text-xs text-gray-500 italic bg-purple-50 p-2 rounded">
//                                 💡 {stop.aiJustification}
//                               </div>
//                             )}

//                             <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
//                               <span>⏱ ETA: {etas[idx] || 'N/A'} min</span>
//                               <span>📊 Status: {stop.status}</span>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Tooltip,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import DriverSidebar from "./DriverSidebar";

/* ===========================
   LEAFLET FIX
=========================== */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

/* ===========================
   CONSTANTS
=========================== */
const TN_BOUNDS = L.latLngBounds([8.0, 76.0], [13.6, 80.4]);
const DEFAULT_CENTER = [11.1271, 78.6569];

const ROUTE_MODES = [
  { id: "Balanced", label: "🎯 Balanced", desc: "AI Priority + Distance" },
  { id: "PriorityFirst", label: "⭐ Priority", desc: "AI Priority first" },
  { id: "TimeWindow", label: "⏰ Time Window", desc: "Rescheduled first" },
  { id: "AvoidIssues", label: "🚧 Avoid Issues", desc: "Avoid road issues" },
  { id: "AIOptimized", label: "🤖 AI Optimized", desc: "Gemini AI routing" },
];

const STORAGE_KEY = "driver_route_mode";

/* ===========================
   HELPERS
=========================== */
const isValidTN = (lat, lng) =>
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  lat >= 8 &&
  lat <= 13.6 &&
  lng >= 76 &&
  lng <= 80.4;

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/* ===========================
   ADVANCED ROUTE OPTIMIZATION
=========================== */
const optimizeRouteLocally = (stops, currentLat, currentLng, roadIssues, mode) => {
  if (stops.length === 0) return [];

  // Separate high priority and normal priority stops
  const highPriority = stops.filter(s => (s.aiPriority || s.priority) >= 4);
  const normalPriority = stops.filter(s => (s.aiPriority || s.priority) < 4);

  let optimizedStops = [];
  let currentPos = { lat: currentLat, lng: currentLng };

  if (mode === "PriorityFirst") {
    // Handle high priority with nearest neighbor
    const orderedHigh = nearestNeighborSort([...highPriority], currentPos);
    optimizedStops = [...orderedHigh];

    // Update current position to last high priority stop
    if (orderedHigh.length > 0) {
      currentPos = orderedHigh[orderedHigh.length - 1];
    }

    // Then handle normal priority
    const orderedNormal = nearestNeighborSort([...normalPriority], currentPos);
    optimizedStops = [...optimizedStops, ...orderedNormal];
  } else if (mode === "AvoidIssues") {
    // Sort all stops by issue proximity (least risky first) then nearest neighbor
    const sortedByRisk = [...stops].sort((a, b) => {
      const riskA = calculateIssueRisk(a, roadIssues);
      const riskB = calculateIssueRisk(b, roadIssues);
      return riskA - riskB;
    });
    optimizedStops = nearestNeighborSort(sortedByRisk, currentPos);
  } else {
    // Balanced mode: Priority first, then optimize by distance
    const orderedHigh = nearestNeighborSort([...highPriority], currentPos);
    optimizedStops = [...orderedHigh];

    if (orderedHigh.length > 0) {
      currentPos = orderedHigh[orderedHigh.length - 1];
    }

    const orderedNormal = nearestNeighborSort([...normalPriority], currentPos);
    optimizedStops = [...optimizedStops, ...orderedNormal];
  }

  return optimizedStops;
};

const nearestNeighborSort = (stops, startPos) => {
  if (stops.length === 0) return [];

  const sorted = [];
  const remaining = [...stops];
  let current = startPos;

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let nearestDist = haversineDistance(
      current.lat,
      current.lng,
      remaining[0].lat,
      remaining[0].lng
    );

    for (let i = 1; i < remaining.length; i++) {
      const dist = haversineDistance(
        current.lat,
        current.lng,
        remaining[i].lat,
        remaining[i].lng
      );
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }

    const nearest = remaining.splice(nearestIdx, 1)[0];
    sorted.push(nearest);
    current = nearest;
  }

  return sorted;
};

const calculateIssueRisk = (stop, issues) => {
  let risk = 0;
  issues.forEach((issue) => {
    const dist = haversineDistance(
      stop.lat,
      stop.lng,
      issue.latitude,
      issue.longitude
    );
    if (dist < 5) {
      risk += issue.severity === "Critical" ? 10 : issue.severity === "High" ? 5 : 2;
    }
  });
  return risk;
};

// /* ===========================
//    GEMINI AI OPTIMIZATION
// =========================== */
// const optimizeWithGemini = async (stops, currentLat, currentLng, roadIssues) => {
//   try {
//     const prompt = `You are a route optimization AI. Given the following delivery stops, optimize the delivery sequence.

// Current Location: ${currentLat}, ${currentLng}

// Stops (in JSON):
// ${JSON.stringify(
//   stops.map((s, i) => ({
//     id: s.id,
//     originalIndex: i,
//     lat: s.lat,
//     lng: s.lng,
//     priority: s.aiPriority || s.priority,
//     isPriority: (s.aiPriority || s.priority) >= 4,
//     receiverName: s.receiverName,
//   })),
//   null,
//   2
// )}

// Road Issues:
// ${JSON.stringify(
//   roadIssues.map((r) => ({
//     lat: r.latitude,
//     lng: r.longitude,
//     severity: r.severity,
//   })),
//   null,
//   2
// )}

// Rules:
// 1. HIGH PRIORITY stops (priority >= 4) MUST be delivered FIRST
// 2. After high priority stops, optimize by NEAREST NEIGHBOR to minimize backtracking
// 3. Avoid stops near Critical/High severity road issues if possible
// 4. Return ONLY a JSON array of stop IDs in optimal order

// Example response format:
// [12, 45, 23, 67, 89, 34, 56, 78, 90, 11]

// Return only the array, no explanation.`;

//     const response = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCLb13iCgSVneZkiz6U3EdRSlPtrZU0k2E`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           contents: [
//             {
//               parts: [{ text: prompt }],
//             },
//           ],
//           generationConfig: {
//             temperature: 0.2,
//             maxOutputTokens: 1000,
//           },
//         }),
//       }
//     );

//     const data = await response.json();
//     const text = data.candidates[0].content.parts[0].text;

//     // Extract JSON array from response
//     const match = text.match(/\[[\d,\s]+\]/);
//     if (match) {
//       const orderIds = JSON.parse(match[0]);

//       // Reorder stops based on AI response
//       const orderedStops = [];
//       orderIds.forEach(id => {
//         const stop = stops.find(s => s.id === id);
//         if (stop) orderedStops.push(stop);
//       });

//       // Add any missing stops at the end
//       stops.forEach(s => {
//         if (!orderedStops.find(os => os.id === s.id)) {
//           orderedStops.push(s);
//         }
//       });

//       return orderedStops;
//     }
//   } catch (error) {
//     console.error("Gemini AI optimization failed:", error);
//   }

//   return null;
// };

/* ===========================
   GEMINI AI OPTIMIZATION
=========================== */
const optimizeWithGemini = async (stops, driverLat, driverLng, roadIssues) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("Gemini API key not configured");
    return null;
  }

  try {
    const prompt = `You are a route optimization AI. Given the following delivery stops, optimize the delivery sequence.

Driver Current Location: ${driverLat}, ${driverLng}

Stops:
${stops.map((s, i) => `Stop ${i + 1}: Order ${s.id}, Priority ${s.aiPriority || s.priority}, Location (${s.lat}, ${s.lng}), Receiver: ${s.receiverName}`).join('\n')}

Road Issues:
${roadIssues.map((r) => `Issue at (${r.latitude}, ${r.longitude}), Severity: ${r.severity}`).join('\n')}

Rules:
1. HIGH PRIORITY stops (priority >= 4) MUST be delivered FIRST
2. After high priority stops, optimize by NEAREST NEIGHBOR to minimize backtracking
3. Avoid stops near Critical/High severity road issues if possible
4. Start from driver's current location

Return ONLY a JSON array of stop IDs in optimal order. Example: [12, 45, 23, 67]`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 1000 },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No response from Gemini API");
    }

    const text = data.candidates[0].content.parts[0].text;
    const match = text.match(/\[[\d,\s]+\]/);

    if (match) {
      const orderIds = JSON.parse(match[0]);
      const orderedStops = [];

      orderIds.forEach(id => {
        const stop = stops.find(s => s.id === id);
        if (stop) orderedStops.push(stop);
      });

      stops.forEach(s => {
        if (!orderedStops.find(os => os.id === s.id)) {
          orderedStops.push(s);
        }
      });

      return orderedStops;
    }
  } catch (error) {
    console.error("Gemini AI optimization failed:", error);
  }

  return null;
};


/* ===========================
   STOP ICON
=========================== */
const stopIcon = (num, priority) => {
  const color = priority >= 4 ? "#dc2626" : priority >= 3 ? "#f59e0b" : "#2563eb";
  return L.divIcon({
    html: `<div style="
      background:${color};
      color:white;
      width:32px;
      height:32px;
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      font-weight:bold;
      border:3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      font-size: 14px;
    ">${num}</div>`,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

/* ===========================
   MAP FITTER
=========================== */
function MapBoundsFitter({ coords, stops }) {
  const map = useMap();

  useEffect(() => {
    const pts = [];

    coords.forEach(([lat, lng]) => isValidTN(lat, lng) && pts.push([lat, lng]));
    stops.forEach((s) => isValidTN(s.lat, s.lng) && pts.push([s.lat, s.lng]));

    if (pts.length > 1) {
      const bounds = L.latLngBounds(pts).pad(0.15);
      map.fitBounds(bounds.intersects(TN_BOUNDS) ? bounds : TN_BOUNDS);
    }
  }, [coords, stops, map]);

  return null;
}

/* ===========================
   ETA DRIFT MODEL
=========================== */
function applyTrafficDrift(baseEta, stop, issues) {
  let drift = 0;
  const hour = new Date().getHours();

  if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20)) {
    drift += baseEta * 0.15;
  }

  issues.forEach((i) => {
    const d = haversineDistance(stop.lat, stop.lng, i.latitude, i.longitude);
    if (d < 1.5) {
      drift +=
        i.severity === "Critical"
          ? 12
          : i.severity === "High"
            ? 8
            : i.severity === "Medium"
              ? 5
              : 2;
    }
  });

  return Math.round(baseEta + drift);
}

/* ===========================
   ROUTE API
=========================== */
async function fetchRoute(stops, issues, mode, signal) {
  const payload = {
    stops: stops.map((s) => ({
      lat: s.lat,
      lng: s.lng,
      priority: s.aiPriority || s.priority,
      windowStart: s.windowStart,
      windowEnd: null,
    })),
    roadIssues: issues,
    driverLocation: null,
    optimizationMode: mode,
  };

  const res = await fetch("http://localhost:5066/api/route/optimize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  const data = await res.json();
  const route = data.routes[0];

  return {
    coords: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    duration: route.duration,
    distance: route.distance,
  };
}

/* ===========================
   MAIN COMPONENT
=========================== */
export default function DriverRoutePage() {
  const { user } = useAuth();
  const abortRef = useRef(null);

  const [rawStops, setRawStops] = useState([]);
  const [stops, setStops] = useState([]);
  const [roadIssues, setRoadIssues] = useState([]);
  const [routeCoords, setRouteCoords] = useState([]);
  const [etas, setEtas] = useState([]);
  const [stats, setStats] = useState(null);
  const [routing, setRouting] = useState(false);
  const [routeChanged, setRouteChanged] = useState(false);

  const [mode, setMode] = useState(
    localStorage.getItem(STORAGE_KEY) || "Balanced"
  );

  /* LOAD DATA */
  useEffect(() => {
    (async () => {
      const [ordersRes, issuesRes] = await Promise.all([
        api.get("/driver/route/optimized"),
        api.get("/driver/road-issues"),
      ]);

      const mappedStops = ordersRes.data
        .map((o) => ({
          id: o.id,
          trackingId: o.trackingId,
          lat: Number(o.deliveryLatitude ?? o.pickupLatitude),
          lng: Number(o.deliveryLongitude ?? o.pickupLongitude),
          priority: o.priority ?? 2,
          aiPriority: o.aiPriority,
          aiJustification: o.aiPriorityJustification,
          windowStart: o.scheduledDate,
          receiverName: o.receiverName,
          receiverAddress: o.receiverAddress,
          status: o.status,
        }))
        .filter((s) => isValidTN(s.lat, s.lng));

      setRawStops(mappedStops);
      setRoadIssues(issuesRes.data || []);
    })();
  }, []);

  /* OPTIMIZE STOPS WHEN MODE CHANGES */
  useEffect(() => {
    if (rawStops.length >= 2) {
      optimizeStops();
    }
  }, [rawStops, roadIssues, mode]);

  const optimizeStops = async () => {
    setRouting(true);

    // Get driver's current location (use first stop if not available)
    const currentLat = user?.currentLatitude || rawStops[0]?.lat || DEFAULT_CENTER[0];
    const currentLng = user?.currentLongitude || rawStops[0]?.lng || DEFAULT_CENTER[1];

    let optimizedStops;

    if (mode === "AIOptimized") {
      // Try Gemini AI first
      optimizedStops = await optimizeWithGemini(rawStops, currentLat, currentLng, roadIssues);

      // Fallback to local optimization if AI fails
      if (!optimizedStops) {
        optimizedStops = optimizeRouteLocally(rawStops, currentLat, currentLng, roadIssues, "Balanced");
      }
    } else {
      // Use local optimization
      optimizedStops = optimizeRouteLocally(rawStops, currentLat, currentLng, roadIssues, mode);
    }

    setStops(optimizedStops);
    setRouteChanged(true);
    setTimeout(() => setRouteChanged(false), 3000);

    // Calculate route with OSRM
    if (optimizedStops.length >= 2) {
      await calculateRoute(optimizedStops);
    }

    setRouting(false);
  };

  const calculateRoute = async (orderedStops) => {
    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const { coords, duration, distance } = await fetchRoute(
        orderedStops,
        roadIssues,
        mode,
        controller.signal
      );

      setRouteCoords(coords);
      setStats({
        km: (distance / 1000).toFixed(1),
        min: Math.round(duration / 60),
      });

      const basePerStop = Math.round(duration / orderedStops.length / 60);
      setEtas(
        orderedStops.map((s, i) =>
          applyTrafficDrift(basePerStop * (i + 1), s, roadIssues)
        )
      );
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Route calculation failed:", err);
      }
    }
  };

  const selectMode = (m) => {
    localStorage.setItem(STORAGE_KEY, m);
    setMode(m);
  };

  const getPriorityBadge = (stop) => {
    const priority = stop.aiPriority || stop.priority;
    if (priority >= 4) return <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded font-semibold">High Priority</span>;
    if (priority >= 3) return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">Medium</span>;
    return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">Normal</span>;
  };

  const calculateTotalBacktrack = () => {
    if (stops.length < 2) return 0;

    let totalDist = 0;
    for (let i = 0; i < stops.length - 1; i++) {
      totalDist += haversineDistance(
        stops[i].lat,
        stops[i].lng,
        stops[i + 1].lat,
        stops[i + 1].lng
      );
    }
    return totalDist.toFixed(1);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DriverSidebar active="route" />

      {routeChanged && (
        <div className="fixed top-16 right-6 z-50 bg-green-100 border-2 border-green-400 px-4 py-2 rounded-lg shadow-lg animate-pulse">
          ✅ Route optimized successfully!
        </div>
      )}

      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">🗺 Driver Route Planner</h1>
          <p className="text-gray-600 mt-1">Intelligent route optimization with nearest-neighbor algorithm</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* LEFT - OPTIMIZATION MODES */}
          <div className="space-y-3">
            <h2 className="font-semibold text-gray-700 mb-3">Optimization Mode</h2>
            {ROUTE_MODES.map((m) => (
              <div
                key={m.id}
                onClick={() => selectMode(m.id)}
                className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${mode === m.id
                  ? "bg-blue-50 border-blue-500 shadow-md"
                  : "bg-white border-gray-200 hover:border-blue-300"
                  }`}
              >
                <div className="font-medium text-gray-800">{m.label}</div>
                <div className="text-xs text-gray-500 mt-1">{m.desc}</div>
              </div>
            ))}

            {stats && (
              <div className="mt-6 p-4 bg-white shadow-md rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-3">Route Statistics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Distance:</span>
                    <span className="font-semibold text-blue-600">{stats.km} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Est. Duration:</span>
                    <span className="font-semibold text-blue-600">{stats.min} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Stops:</span>
                    <span className="font-semibold text-blue-600">{stops.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Route Distance:</span>
                    <span className="font-semibold text-green-600">{calculateTotalBacktrack()} km</span>
                  </div>
                </div>
              </div>
            )}

            {routing && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  <span>Optimizing route...</span>
                </div>
              </div>
            )}
          </div>

          {/* MAP */}
          <div className="lg:col-span-3">
            <div className="h-[500px] bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
              <MapContainer center={DEFAULT_CENTER} zoom={12} style={{ height: "100%" }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />

                <MapBoundsFitter coords={routeCoords} stops={stops} />

                {stops.map((s, i) => (
                  <Marker
                    key={s.id}
                    position={[s.lat, s.lng]}
                    icon={stopIcon(i + 1, s.aiPriority || s.priority)}
                  >
                    <Tooltip permanent={false} direction="top">
                      <div className="text-xs">
                        <div className="font-bold text-lg">Stop #{i + 1}</div>
                        <div className="text-gray-600 font-semibold">Order ID: {s.trackingId || s.id}</div>
                        <div className="text-gray-800 font-medium mt-1">{s.receiverName}</div>
                        <div className="text-gray-500 text-[10px] mt-1 max-w-xs">{s.receiverAddress}</div>
                        <div className="mt-2 text-blue-600 font-bold">⏱ ETA: {etas[i]} min</div>
                        {s.aiPriority && (
                          <div className="mt-1 text-purple-600 text-[10px] font-semibold">
                            🤖 AI Priority: {s.aiPriority}/5
                          </div>
                        )}
                        <div className="mt-1 text-[10px]">
                          📍 {s.lat.toFixed(4)}, {s.lng.toFixed(4)}
                        </div>
                      </div>
                    </Tooltip>
                  </Marker>
                ))}

                {routeCoords.length > 1 && (
                  <Polyline positions={routeCoords} color="#2563eb" weight={4} opacity={0.7} />
                )}

                {roadIssues.map((i, idx) => (
                  <Circle
                    key={idx}
                    center={[i.latitude, i.longitude]}
                    radius={800}
                    pathOptions={{ color: "#dc2626", fillColor: "#dc2626", fillOpacity: 0.15 }}
                  >
                    <Tooltip>
                      <div className="text-xs">
                        <div className="font-bold text-red-600">⚠️ Road Issue</div>
                        <div>{i.description}</div>
                        <div className="text-gray-500">Severity: {i.severity}</div>
                      </div>
                    </Tooltip>
                  </Circle>
                ))}
              </MapContainer>
            </div>

            {/* OPTIMIZED ORDER LIST */}
            <div className="mt-6 bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
                <h2 className="font-bold text-white text-lg">📋 Optimized Delivery Sequence</h2>
                <p className="text-blue-100 text-sm mt-1">Priority stops first, then nearest-neighbor routing</p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {stops.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No stops available for routing
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {stops.map((stop, idx) => {
                      const distFromPrev = idx > 0
                        ? haversineDistance(stops[idx - 1].lat, stops[idx - 1].lng, stop.lat, stop.lng)
                        : 0;

                      return (
                        <div
                          key={stop.id}
                          className="p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md"
                                style={{
                                  backgroundColor: (stop.aiPriority || stop.priority) >= 4
                                    ? "#dc2626"
                                    : (stop.aiPriority || stop.priority) >= 3
                                      ? "#f59e0b"
                                      : "#2563eb"
                                }}
                              >
                                {idx + 1}
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="font-semibold text-gray-800">
                                  {stop.receiverName}
                                </span>
                                {getPriorityBadge(stop)}
                                {stop.aiPriority && (
                                  <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded font-semibold">
                                    🤖 AI: {stop.aiPriority}/5
                                  </span>
                                )}
                              </div>

                              <div className="text-sm text-gray-600 mb-1">
                                Order ID: <span className="font-mono font-semibold text-blue-600">{stop.trackingId || stop.id}</span>
                              </div>

                              <div className="text-sm text-gray-500 truncate">
                                📍 {stop.receiverAddress}
                              </div>

                              {stop.aiJustification && (
                                <div className="mt-2 text-xs text-gray-600 italic bg-purple-50 p-2 rounded border border-purple-100">
                                  💡 {stop.aiJustification}
                                </div>
                              )}

                              <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                                <span>⏱ ETA: <strong>{etas[idx] || 'N/A'} min</strong></span>
                                <span>📊 Status: <strong>{stop.status}</strong></span>
                                {idx > 0 && (
                                  <span className="text-green-600">
                                    📏 From prev: <strong>{distFromPrev.toFixed(1)} km</strong>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}