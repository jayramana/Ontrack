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
//   { id: "AIOptimized", label: "🤖 AI Optimized", desc: "Gemini AI routing" },
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

// const haversineDistance = (lat1, lon1, lat2, lon2) => {
//   const R = 6371;
//   const dLat = ((lat2 - lat1) * Math.PI) / 180;
//   const dLon = ((lon2 - lon1) * Math.PI) / 180;
//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos((lat1 * Math.PI) / 180) *
//     Math.cos((lat2 * Math.PI) / 180) *
//     Math.sin(dLon / 2) *
//     Math.sin(dLon / 2);
//   return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
// };

// /* ===========================
//    ADVANCED ROUTE OPTIMIZATION
// =========================== */
// const optimizeRouteLocally = (stops, currentLat, currentLng, roadIssues, mode) => {
//   if (stops.length === 0) return [];

//   // Separate high priority and normal priority stops
//   const highPriority = stops.filter(s => (s.aiPriority || s.priority) >= 4);
//   const normalPriority = stops.filter(s => (s.aiPriority || s.priority) < 4);

//   let optimizedStops = [];
//   let currentPos = { lat: currentLat, lng: currentLng };

//   if (mode === "PriorityFirst") {
//     // Handle high priority with nearest neighbor
//     const orderedHigh = nearestNeighborSort([...highPriority], currentPos);
//     optimizedStops = [...orderedHigh];

//     // Update current position to last high priority stop
//     if (orderedHigh.length > 0) {
//       currentPos = orderedHigh[orderedHigh.length - 1];
//     }

//     // Then handle normal priority
//     const orderedNormal = nearestNeighborSort([...normalPriority], currentPos);
//     optimizedStops = [...optimizedStops, ...orderedNormal];
//   } else if (mode === "AvoidIssues") {
//     // Sort all stops by issue proximity (least risky first) then nearest neighbor
//     const sortedByRisk = [...stops].sort((a, b) => {
//       const riskA = calculateIssueRisk(a, roadIssues);
//       const riskB = calculateIssueRisk(b, roadIssues);
//       return riskA - riskB;
//     });
//     optimizedStops = nearestNeighborSort(sortedByRisk, currentPos);
//   } else {
//     // Balanced mode: Priority first, then optimize by distance
//     const orderedHigh = nearestNeighborSort([...highPriority], currentPos);
//     optimizedStops = [...orderedHigh];

//     if (orderedHigh.length > 0) {
//       currentPos = orderedHigh[orderedHigh.length - 1];
//     }

//     const orderedNormal = nearestNeighborSort([...normalPriority], currentPos);
//     optimizedStops = [...optimizedStops, ...orderedNormal];
//   }

//   return optimizedStops;
// };

// const nearestNeighborSort = (stops, startPos) => {
//   if (stops.length === 0) return [];

//   const sorted = [];
//   const remaining = [...stops];
//   let current = startPos;

//   while (remaining.length > 0) {
//     let nearestIdx = 0;
//     let nearestDist = haversineDistance(
//       current.lat,
//       current.lng,
//       remaining[0].lat,
//       remaining[0].lng
//     );

//     for (let i = 1; i < remaining.length; i++) {
//       const dist = haversineDistance(
//         current.lat,
//         current.lng,
//         remaining[i].lat,
//         remaining[i].lng
//       );
//       if (dist < nearestDist) {
//         nearestDist = dist;
//         nearestIdx = i;
//       }
//     }

//     const nearest = remaining.splice(nearestIdx, 1)[0];
//     sorted.push(nearest);
//     current = nearest;
//   }

//   return sorted;
// };

// const calculateIssueRisk = (stop, issues) => {
//   let risk = 0;
//   issues.forEach((issue) => {
//     const dist = haversineDistance(
//       stop.lat,
//       stop.lng,
//       issue.latitude,
//       issue.longitude
//     );
//     if (dist < 5) {
//       risk += issue.severity === "Critical" ? 10 : issue.severity === "High" ? 5 : 2;
//     }
//   });
//   return risk;
// };

// // /* ===========================
// //    GEMINI AI OPTIMIZATION
// // =========================== */
// // const optimizeWithGemini = async (stops, currentLat, currentLng, roadIssues) => {
// //   try {
// //     const prompt = `You are a route optimization AI. Given the following delivery stops, optimize the delivery sequence.

// // Current Location: ${currentLat}, ${currentLng}

// // Stops (in JSON):
// // ${JSON.stringify(
// //   stops.map((s, i) => ({
// //     id: s.id,
// //     originalIndex: i,
// //     lat: s.lat,
// //     lng: s.lng,
// //     priority: s.aiPriority || s.priority,
// //     isPriority: (s.aiPriority || s.priority) >= 4,
// //     receiverName: s.receiverName,
// //   })),
// //   null,
// //   2
// // )}

// // Road Issues:
// // ${JSON.stringify(
// //   roadIssues.map((r) => ({
// //     lat: r.latitude,
// //     lng: r.longitude,
// //     severity: r.severity,
// //   })),
// //   null,
// //   2
// // )}

// // Rules:
// // 1. HIGH PRIORITY stops (priority >= 4) MUST be delivered FIRST
// // 2. After high priority stops, optimize by NEAREST NEIGHBOR to minimize backtracking
// // 3. Avoid stops near Critical/High severity road issues if possible
// // 4. Return ONLY a JSON array of stop IDs in optimal order

// // Example response format:
// // [12, 45, 23, 67, 89, 34, 56, 78, 90, 11]

// // Return only the array, no explanation.`;

// //     const response = await fetch(
// //       `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCLb13iCgSVneZkiz6U3EdRSlPtrZU0k2E`,
// //       {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({
// //           contents: [
// //             {
// //               parts: [{ text: prompt }],
// //             },
// //           ],
// //           generationConfig: {
// //             temperature: 0.2,
// //             maxOutputTokens: 1000,
// //           },
// //         }),
// //       }
// //     );

// //     const data = await response.json();
// //     const text = data.candidates[0].content.parts[0].text;

// //     // Extract JSON array from response
// //     const match = text.match(/\[[\d,\s]+\]/);
// //     if (match) {
// //       const orderIds = JSON.parse(match[0]);

// //       // Reorder stops based on AI response
// //       const orderedStops = [];
// //       orderIds.forEach(id => {
// //         const stop = stops.find(s => s.id === id);
// //         if (stop) orderedStops.push(stop);
// //       });

// //       // Add any missing stops at the end
// //       stops.forEach(s => {
// //         if (!orderedStops.find(os => os.id === s.id)) {
// //           orderedStops.push(s);
// //         }
// //       });

// //       return orderedStops;
// //     }
// //   } catch (error) {
// //     console.error("Gemini AI optimization failed:", error);
// //   }

// //   return null;
// // };

// /* ===========================
//    GEMINI AI OPTIMIZATION
// =========================== */
// const optimizeWithGemini = async (stops, driverLat, driverLng, roadIssues) => {
//   const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

//   if (!apiKey) {
//     console.warn("Gemini API key not configured");
//     return null;
//   }

//   try {
//     const prompt = `You are a route optimization AI. Given the following delivery stops, optimize the delivery sequence.

// Driver Current Location: ${driverLat}, ${driverLng}

// Stops:
// ${stops.map((s, i) => `Stop ${i + 1}: Order ${s.id}, Priority ${s.aiPriority || s.priority}, Location (${s.lat}, ${s.lng}), Receiver: ${s.receiverName}`).join('\n')}

// Road Issues:
// ${roadIssues.map((r) => `Issue at (${r.latitude}, ${r.longitude}), Severity: ${r.severity}`).join('\n')}

// Rules:
// 1. HIGH PRIORITY stops (priority >= 4) MUST be delivered FIRST
// 2. After high priority stops, optimize by NEAREST NEIGHBOR to minimize backtracking
// 3. Avoid stops near Critical/High severity road issues if possible
// 4. Start from driver's current location

// Return ONLY a JSON array of stop IDs in optimal order. Example: [12, 45, 23, 67]`;

//     const response = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           contents: [{ parts: [{ text: prompt }] }],
//           generationConfig: { temperature: 0.2, maxOutputTokens: 1000 },
//         }),
//       }
//     );

//     if (!response.ok) {
//       throw new Error(`Gemini API error: ${response.status}`);
//     }

//     const data = await response.json();

//     if (!data.candidates || data.candidates.length === 0) {
//       throw new Error("No response from Gemini API");
//     }

//     const text = data.candidates[0].content.parts[0].text;
//     const match = text.match(/\[[\d,\s]+\]/);

//     if (match) {
//       const orderIds = JSON.parse(match[0]);
//       const orderedStops = [];

//       orderIds.forEach(id => {
//         const stop = stops.find(s => s.id === id);
//         if (stop) orderedStops.push(stop);
//       });

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
//     const d = haversineDistance(stop.lat, stop.lng, i.latitude, i.longitude);
//     if (d < 1.5) {
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

//   const [rawStops, setRawStops] = useState([]);
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

//       setRawStops(mappedStops);
//       setRoadIssues(issuesRes.data || []);
//     })();
//   }, []);

//   /* OPTIMIZE STOPS WHEN MODE CHANGES */
//   useEffect(() => {
//     if (rawStops.length >= 2) {
//       optimizeStops();
//     }
//   }, [rawStops, roadIssues, mode]);

//   const optimizeStops = async () => {
//     setRouting(true);

//     // Get driver's current location (use first stop if not available)
//     const currentLat = user?.currentLatitude || rawStops[0]?.lat || DEFAULT_CENTER[0];
//     const currentLng = user?.currentLongitude || rawStops[0]?.lng || DEFAULT_CENTER[1];

//     let optimizedStops;

//     if (mode === "AIOptimized") {
//       // Try Gemini AI first
//       optimizedStops = await optimizeWithGemini(rawStops, currentLat, currentLng, roadIssues);

//       // Fallback to local optimization if AI fails
//       if (!optimizedStops) {
//         optimizedStops = optimizeRouteLocally(rawStops, currentLat, currentLng, roadIssues, "Balanced");
//       }
//     } else {
//       // Use local optimization
//       optimizedStops = optimizeRouteLocally(rawStops, currentLat, currentLng, roadIssues, mode);
//     }

//     setStops(optimizedStops);
//     setRouteChanged(true);
//     setTimeout(() => setRouteChanged(false), 3000);

//     // Calculate route with OSRM
//     if (optimizedStops.length >= 2) {
//       await calculateRoute(optimizedStops);
//     }

//     setRouting(false);
//   };

//   const calculateRoute = async (orderedStops) => {
//     abortRef.current?.abort?.();
//     const controller = new AbortController();
//     abortRef.current = controller;

//     try {
//       const { coords, duration, distance } = await fetchRoute(
//         orderedStops,
//         roadIssues,
//         mode,
//         controller.signal
//       );

//       setRouteCoords(coords);
//       setStats({
//         km: (distance / 1000).toFixed(1),
//         min: Math.round(duration / 60),
//       });

//       const basePerStop = Math.round(duration / orderedStops.length / 60);
//       setEtas(
//         orderedStops.map((s, i) =>
//           applyTrafficDrift(basePerStop * (i + 1), s, roadIssues)
//         )
//       );
//     } catch (err) {
//       if (err.name !== "AbortError") {
//         console.error("Route calculation failed:", err);
//       }
//     }
//   };

//   const selectMode = (m) => {
//     localStorage.setItem(STORAGE_KEY, m);
//     setMode(m);
//   };

//   const getPriorityBadge = (stop) => {
//     const priority = stop.aiPriority || stop.priority;
//     if (priority >= 4) return <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded font-semibold">High Priority</span>;
//     if (priority >= 3) return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">Medium</span>;
//     return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">Normal</span>;
//   };

//   const calculateTotalBacktrack = () => {
//     if (stops.length < 2) return 0;

//     let totalDist = 0;
//     for (let i = 0; i < stops.length - 1; i++) {
//       totalDist += haversineDistance(
//         stops[i].lat,
//         stops[i].lng,
//         stops[i + 1].lat,
//         stops[i + 1].lng
//       );
//     }
//     return totalDist.toFixed(1);
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       <DriverSidebar active="route" />

//       {routeChanged && (
//         <div className="fixed top-16 right-6 z-50 bg-green-100 border-2 border-green-400 px-4 py-2 rounded-lg shadow-lg animate-pulse">
//           ✅ Route optimized successfully!
//         </div>
//       )}

//       <div className="flex-1 p-6">
//         <div className="mb-6">
//           <h1 className="text-3xl font-bold text-gray-800">🗺 Driver Route Planner</h1>
//           <p className="text-gray-600 mt-1">Intelligent route optimization with nearest-neighbor algorithm</p>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//           {/* LEFT - OPTIMIZATION MODES */}
//           <div className="space-y-3">
//             <h2 className="font-semibold text-gray-700 mb-3">Optimization Mode</h2>
//             {ROUTE_MODES.map((m) => (
//               <div
//                 key={m.id}
//                 onClick={() => selectMode(m.id)}
//                 className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${mode === m.id
//                   ? "bg-blue-50 border-blue-500 shadow-md"
//                   : "bg-white border-gray-200 hover:border-blue-300"
//                   }`}
//               >
//                 <div className="font-medium text-gray-800">{m.label}</div>
//                 <div className="text-xs text-gray-500 mt-1">{m.desc}</div>
//               </div>
//             ))}

//             {stats && (
//               <div className="mt-6 p-4 bg-white shadow-md rounded-lg border border-gray-200">
//                 <h3 className="font-semibold text-gray-700 mb-3">Route Statistics</h3>
//                 <div className="space-y-2">
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Total Distance:</span>
//                     <span className="font-semibold text-blue-600">{stats.km} km</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Est. Duration:</span>
//                     <span className="font-semibold text-blue-600">{stats.min} min</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Total Stops:</span>
//                     <span className="font-semibold text-blue-600">{stops.length}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Route Distance:</span>
//                     <span className="font-semibold text-green-600">{calculateTotalBacktrack()} km</span>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {routing && (
//               <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
//                 <div className="flex items-center gap-2">
//                   <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
//                   <span>Optimizing route...</span>
//                 </div>
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
//                         <div className="font-bold text-lg">Stop #{i + 1}</div>
//                         <div className="text-gray-600 font-semibold">Order ID: {s.trackingId || s.id}</div>
//                         <div className="text-gray-800 font-medium mt-1">{s.receiverName}</div>
//                         <div className="text-gray-500 text-[10px] mt-1 max-w-xs">{s.receiverAddress}</div>
//                         <div className="mt-2 text-blue-600 font-bold">⏱ ETA: {etas[i]} min</div>
//                         {s.aiPriority && (
//                           <div className="mt-1 text-purple-600 text-[10px] font-semibold">
//                             🤖 AI Priority: {s.aiPriority}/5
//                           </div>
//                         )}
//                         <div className="mt-1 text-[10px]">
//                           📍 {s.lat.toFixed(4)}, {s.lng.toFixed(4)}
//                         </div>
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
//                         <div className="font-bold text-red-600">⚠️ Road Issue</div>
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
//                 <p className="text-blue-100 text-sm mt-1">Priority stops first, then nearest-neighbor routing</p>
//               </div>
//               <div className="max-h-80 overflow-y-auto">
//                 {stops.length === 0 ? (
//                   <div className="p-6 text-center text-gray-500">
//                     No stops available for routing
//                   </div>
//                 ) : (
//                   <div className="divide-y divide-gray-100">
//                     {stops.map((stop, idx) => {
//                       const distFromPrev = idx > 0
//                         ? haversineDistance(stops[idx - 1].lat, stops[idx - 1].lng, stop.lat, stop.lng)
//                         : 0;

//                       return (
//                         <div
//                           key={stop.id}
//                           className="p-4 hover:bg-gray-50 transition-colors"
//                         >
//                           <div className="flex items-start gap-4">
//                             <div className="flex-shrink-0">
//                               <div
//                                 className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md"
//                                 style={{
//                                   backgroundColor: (stop.aiPriority || stop.priority) >= 4
//                                     ? "#dc2626"
//                                     : (stop.aiPriority || stop.priority) >= 3
//                                       ? "#f59e0b"
//                                       : "#2563eb"
//                                 }}
//                               >
//                                 {idx + 1}
//                               </div>
//                             </div>

//                             <div className="flex-1 min-w-0">
//                               <div className="flex items-center gap-2 mb-1 flex-wrap">
//                                 <span className="font-semibold text-gray-800">
//                                   {stop.receiverName}
//                                 </span>
//                                 {getPriorityBadge(stop)}
//                                 {stop.aiPriority && (
//                                   <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded font-semibold">
//                                     🤖 AI: {stop.aiPriority}/5
//                                   </span>
//                                 )}
//                               </div>

//                               <div className="text-sm text-gray-600 mb-1">
//                                 Order ID: <span className="font-mono font-semibold text-blue-600">{stop.trackingId || stop.id}</span>
//                               </div>

//                               <div className="text-sm text-gray-500 truncate">
//                                 📍 {stop.receiverAddress}
//                               </div>

//                               {stop.aiJustification && (
//                                 <div className="mt-2 text-xs text-gray-600 italic bg-purple-50 p-2 rounded border border-purple-100">
//                                   💡 {stop.aiJustification}
//                                 </div>
//                               )}

//                               <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 flex-wrap">
//                                 <span>⏱ ETA: <strong>{etas[idx] || 'N/A'} min</strong></span>
//                                 <span>📊 Status: <strong>{stop.status}</strong></span>
//                                 {idx > 0 && (
//                                   <span className="text-green-600">
//                                     📏 From prev: <strong>{distFromPrev.toFixed(1)} km</strong>
//                                   </span>
//                                 )}
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       );
//                     })}
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




//updated with navigating route optimization
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Tooltip,
  Circle,
  useMap,
} from "react-leaflet";

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
const ROUTE_DEVIATION_THRESHOLD = 0.15; // 150 meters
const ADVANCE_WARNING_DISTANCE = 0.05; // 50 meters before instruction

const ROUTE_MODES = [
  { id: "Balanced", label: "🎯 Balanced", desc: "AI Priority + Distance" },
  { id: "PriorityFirst", label: "⭐ Priority", desc: "AI Priority first" },
  { id: "TimeWindow", label: "⏰ Time Window", desc: "Rescheduled first" },
  { id: "AvoidIssues", label: "🚧 Avoid Issues", desc: "Avoid road issues" },
  { id: "AIOptimized", label: "🤖 AI Optimized", desc: "Gemini AI routing" },
];

const STORAGE_KEY = "driver_route_mode";

/* ===========================
   API BASE - Replace with your backend
=========================== */
const API_BASE = "http://localhost:5066/api";

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
   NAVIGATION HELPERS
=========================== */
const getInstructionIcon = (type, modifier) => {
  if (type === "turn") {
    if (modifier?.includes("left")) return "↰";
    if (modifier?.includes("right")) return "↱";
    if (modifier?.includes("sharp left")) return "⬅️";
    if (modifier?.includes("sharp right")) return "➡️";
    if (modifier?.includes("slight left")) return "↖️";
    if (modifier?.includes("slight right")) return "↗️";
  }
  
  const icons = {
    depart: "🚀",
    arrive: "🎯",
    merge: "🔀",
    "on ramp": "🛣️",
    "off ramp": "🛣️",
    fork: "🔱",
    "end of road": "⚠️",
    continue: "⬆️",
    roundabout: "🔄",
    rotary: "🔄",
    "exit roundabout": "↗️",
    "exit rotary": "↗️",
  };
  
  return icons[type] || "➡️";
};

const speakInstruction = (text) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  }
};

/* ===========================
   OPTIMIZATION
=========================== */
const optimizeRouteLocally = (stops, currentLat, currentLng, roadIssues, mode) => {
  if (stops.length === 0) return [];

  const highPriority = stops.filter(s => (s.aiPriority || s.priority) >= 4);
  const normalPriority = stops.filter(s => (s.aiPriority || s.priority) < 4);

  let optimizedStops = [];
  let currentPos = { lat: currentLat, lng: currentLng };

  if (mode === "PriorityFirst") {
    const orderedHigh = nearestNeighborSort([...highPriority], currentPos);
    optimizedStops = [...orderedHigh];
    if (orderedHigh.length > 0) {
      currentPos = orderedHigh[orderedHigh.length - 1];
    }
    const orderedNormal = nearestNeighborSort([...normalPriority], currentPos);
    optimizedStops = [...optimizedStops, ...orderedNormal];
  } else if (mode === "AvoidIssues") {
    const sortedByRisk = [...stops].sort((a, b) => {
      const riskA = calculateIssueRisk(a, roadIssues);
      const riskB = calculateIssueRisk(b, roadIssues);
      return riskA - riskB;
    });
    optimizedStops = nearestNeighborSort(sortedByRisk, currentPos);
  } else {
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

/* ===========================
   ICONS
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

const driverIcon = L.divIcon({
  html: `<div style="
    background:#10b981;
    color:white;
    width:40px;
    height:40px;
    border-radius:50%;
    display:flex;
    align-items:center;
    justify-content:center;
    font-weight:bold;
    border:4px solid white;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    font-size: 20px;
  ">🚗</div>`,
  className: "",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

/* ===========================
   MAP COMPONENTS
=========================== */
function MapBoundsFitter({ coords, stops, driverPos }) {
  const map = useMap();

  useEffect(() => {
    const pts = [];
    if (driverPos) pts.push([driverPos.lat, driverPos.lng]);
    coords.forEach(([lat, lng]) => isValidTN(lat, lng) && pts.push([lat, lng]));
    stops.forEach((s) => isValidTN(s.lat, s.lng) && pts.push([s.lat, s.lng]));

    if (pts.length > 1) {
      const bounds = L.latLngBounds(pts).pad(0.15);
      map.fitBounds(bounds.intersects(TN_BOUNDS) ? bounds : TN_BOUNDS);
    }
  }, [coords, stops, driverPos, map]);

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
async function fetchRouteWithSteps(stops, issues, mode, signal, driverPos) {
  const allStops = driverPos ? [
    { lat: driverPos.lat, lng: driverPos.lng, priority: 0 },
    ...stops
  ] : stops;

  const payload = {
    stops: allStops.map((s) => ({
      lat: s.lat,
      lng: s.lng,
      priority: s.aiPriority || s.priority || 0,
      windowStart: s.windowStart,
      windowEnd: null,
    })),
    roadIssues: issues,
    driverLocation: driverPos,
    optimizationMode: mode,
  };

  const res = await fetch(`${API_BASE}/route/optimize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  const data = await res.json();
  const route = data.routes[0];

  const instructions = [];
  route.legs.forEach((leg, legIdx) => {
    leg.steps.forEach((step, stepIdx) => {
      const [lng, lat] = step.maneuver.location;
      instructions.push({
        id: `${legIdx}-${stepIdx}`,
        instruction: step.maneuver.instruction || step.name || "Continue",
        type: step.maneuver.type,
        modifier: step.maneuver.modifier,
        distance: step.distance,
        duration: step.duration,
        location: [lat, lng],
        roadName: step.name,
      });
    });
  });

  return {
    coords: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    duration: route.duration,
    distance: route.distance,
    instructions,
  };
}

/* ===========================
   API CALLS
=========================== */
async function fetchOrders() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}/driver/route/optimized`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

async function fetchRoadIssues() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}/driver/road-issues`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

/* ===========================
   MAIN COMPONENT
=========================== */
export default function DriverRoutePage() {
  const abortRef = useRef(null);
  const locationWatchRef = useRef(null);
  const lastInstructionRef = useRef(null);
  const nextInstructionAnnouncedRef = useRef(false);

  const [rawStops, setRawStops] = useState([]);
  const [stops, setStops] = useState([]);
  const [roadIssues, setRoadIssues] = useState([]);
  const [routeCoords, setRouteCoords] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [currentInstruction, setCurrentInstruction] = useState(null);
  const [nextInstruction, setNextInstruction] = useState(null);
  const [etas, setEtas] = useState([]);
  const [stats, setStats] = useState(null);
  const [routing, setRouting] = useState(false);
  const [routeChanged, setRouteChanged] = useState(false);
  const [driverLocation, setDriverLocation] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [mode, setMode] = useState(localStorage.getItem(STORAGE_KEY) || "Balanced");

  /* LOAD REAL DATA FROM BACKEND */
  useEffect(() => {
    const loadData = async () => {
      try {
        const [ordersData, issuesData] = await Promise.all([
          fetchOrders(),
          fetchRoadIssues(),
        ]);

        const mappedStops = ordersData
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
            receiverPhone: o.receiverPhone,
            status: o.status,
          }))
          .filter((s) => isValidTN(s.lat, s.lng));

        setRawStops(mappedStops);
        setRoadIssues(issuesData || []);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    loadData();
  }, []);

  /* GET CURRENT LOCATION */
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          if (isValidTN(pos.lat, pos.lng)) {
            setDriverLocation(pos);
          } else {
            // Fallback to first stop if outside TN
            if (rawStops.length > 0) {
              setDriverLocation({ lat: rawStops[0].lat, lng: rawStops[0].lng });
            }
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          if (rawStops.length > 0) {
            setDriverLocation({ lat: rawStops[0].lat, lng: rawStops[0].lng });
          }
        }
      );
    }
  }, [rawStops]);

  /* OPTIMIZE WHEN DATA CHANGES */
  useEffect(() => {
    if (rawStops.length >= 1 && driverLocation) {
      optimizeStops();
    }
  }, [rawStops, roadIssues, mode, driverLocation]);

  const optimizeStops = async () => {
    if (!driverLocation) return;

    setRouting(true);

    const optimizedStops = optimizeRouteLocally(
      rawStops,
      driverLocation.lat,
      driverLocation.lng,
      roadIssues,
      mode
    );

    setStops(optimizedStops);
    setRouteChanged(true);
    setTimeout(() => setRouteChanged(false), 3000);

    if (optimizedStops.length >= 1) {
      await calculateRoute(optimizedStops);
    }

    setRouting(false);
  };

  const calculateRoute = async (orderedStops) => {
    if (!driverLocation) return;

    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const { coords, duration, distance, instructions: routeInstructions } = 
        await fetchRouteWithSteps(orderedStops, roadIssues, mode, controller.signal, driverLocation);

      setRouteCoords(coords);
      setInstructions(routeInstructions);
      setStats({
        km: (distance / 1000).toFixed(1),
        min: Math.round(duration / 60),
      });

      // Calculate ETAs
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

  /* NAVIGATION TRACKING */
  useEffect(() => {
    if (!isNavigating || !navigator.geolocation) return;

    locationWatchRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        if (!isValidTN(newPos.lat, newPos.lng)) return;

        setDriverLocation(newPos);

        // Check for route deviation
        if (routeCoords.length > 0) {
          const closestPoint = findClosestPoint(newPos, routeCoords);
          const deviation = haversineDistance(
            newPos.lat,
            newPos.lng,
            closestPoint.lat,
            closestPoint.lng
          );

          if (deviation > ROUTE_DEVIATION_THRESHOLD) {
            console.log("Route deviation detected, recalculating...");
            optimizeStops();
          }
        }

        // Update navigation instructions
        updateNavigationInstructions(newPos);
      },
      (error) => console.error("Location tracking error:", error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => {
      if (locationWatchRef.current) {
        navigator.geolocation.clearWatch(locationWatchRef.current);
      }
    };
  }, [isNavigating, routeCoords, instructions]);

  const findClosestPoint = (pos, coords) => {
    let closest = coords[0];
    let minDist = haversineDistance(pos.lat, pos.lng, closest[0], closest[1]);

    coords.forEach(([lat, lng]) => {
      const dist = haversineDistance(pos.lat, pos.lng, lat, lng);
      if (dist < minDist) {
        minDist = dist;
        closest = [lat, lng];
      }
    });

    return { lat: closest[0], lng: closest[1] };
  };

  const updateNavigationInstructions = (pos) => {
    if (instructions.length === 0) return;

    let currentIdx = -1;
    let minDist = Infinity;

    // Find current instruction
    instructions.forEach((inst, idx) => {
      const [lat, lng] = inst.location;
      const dist = haversineDistance(pos.lat, pos.lng, lat, lng);
      
      if (dist < minDist) {
        minDist = dist;
        currentIdx = idx;
      }
    });

    if (currentIdx === -1) return;

    const current = instructions[currentIdx];
    const [lat, lng] = current.location;
    const distToCurrent = haversineDistance(pos.lat, pos.lng, lat, lng);

    // Announce current instruction when within 30m
    if (distToCurrent < 0.03) {
      if (lastInstructionRef.current !== current.id) {
        setCurrentInstruction(current);
        lastInstructionRef.current = current.id;
        nextInstructionAnnouncedRef.current = false;
        
        if (voiceEnabled) {
          const distText = distToCurrent < 0.01 
            ? "" 
            : `In ${Math.round(distToCurrent * 1000)} meters, `;
          speakInstruction(distText + current.instruction);
        }
      }
    }

    // Advance warning for next instruction (50m before)
    const nextIdx = currentIdx + 1;
    if (nextIdx < instructions.length) {
      const next = instructions[nextIdx];
      const [nextLat, nextLng] = next.location;
      const distToNext = haversineDistance(pos.lat, pos.lng, nextLat, nextLng);

      setNextInstruction(next);

      // Announce next instruction 50m before
      if (distToNext < ADVANCE_WARNING_DISTANCE && !nextInstructionAnnouncedRef.current) {
        nextInstructionAnnouncedRef.current = true;
        if (voiceEnabled) {
          speakInstruction(`In ${Math.round(distToNext * 1000)} meters, ${next.instruction}`);
        }
      }
    } else {
      setNextInstruction(null);
    }
  };

  const startNavigation = () => {
    setIsNavigating(true);
    lastInstructionRef.current = null;
    nextInstructionAnnouncedRef.current = false;
    if (voiceEnabled && instructions.length > 0) {
      speakInstruction("Navigation started. " + instructions[0].instruction);
    }
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setCurrentInstruction(null);
    setNextInstruction(null);
    lastInstructionRef.current = null;
    nextInstructionAnnouncedRef.current = false;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-6">
      {routeChanged && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border-2 border-green-400 px-4 py-2 rounded-lg shadow-lg">
          ✅ Route optimized successfully!
        </div>
      )}

      {/* CURRENT INSTRUCTION - Large Display */}
      {currentInstruction && isNavigating && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white px-6 py-4 rounded-lg shadow-2xl max-w-lg">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{getInstructionIcon(currentInstruction.type, currentInstruction.modifier)}</span>
            <div className="flex-1">
              <div className="font-bold text-xl">{currentInstruction.instruction}</div>
              <div className="text-sm text-blue-100 mt-1">
                {currentInstruction.distance < 1000 
                  ? `${Math.round(currentInstruction.distance)} m` 
                  : `${(currentInstruction.distance / 1000).toFixed(1)} km`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEXT INSTRUCTION - Preview */}
      {nextInstruction && isNavigating && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-40 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg max-w-md opacity-90">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-xl">{getInstructionIcon(nextInstruction.type, nextInstruction.modifier)}</span>
            <div className="flex-1">
              <div className="font-semibold">Then: {nextInstruction.instruction}</div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">🗺 Driver Route Navigator</h1>
        <p className="text-gray-600 mt-1">Real-time navigation with intelligent routing</p>
      </div>

      {/* NAVIGATION CONTROLS */}
      <div className="mb-6 flex gap-4 flex-wrap items-center">
        {!isNavigating ? (
          <button
            onClick={startNavigation}
            disabled={!driverLocation || stops.length === 0 || routing}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            🚀 Start Navigation
          </button>
        ) : (
          <button
            onClick={stopNavigation}
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-md"
          >
            ⏹ Stop Navigation
          </button>
        )}

        <button
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors shadow-md ${
            voiceEnabled
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-700 hover:bg-gray-400"
          }`}
        >
          {voiceEnabled ? "🔊 Voice On" : "🔇 Voice Off"}
        </button>

        {driverLocation && (
          <div className="px-4 py-3 bg-white rounded-lg border-2 border-green-500 flex items-center gap-2 shadow-md">
            <span className="text-green-600 font-bold text-xl">📍</span>
            <div className="text-sm">
              <div className="font-semibold text-gray-700">Current Location</div>
              <div className="text-gray-500">
                {driverLocation.lat.toFixed(4)}, {driverLocation.lng.toFixed(4)}
              </div>
            </div>
          </div>
        )}

        {routing && (
          <div className="px-4 py-3 bg-blue-50 border-2 border-blue-300 rounded-lg flex items-center gap-2">
            <div className="animate-spin h-5 w-5 border-3 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="text-blue-700 font-semibold">Optimizing route...</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* MODES & STATS */}
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-700 mb-3">Optimization Mode</h2>
          {ROUTE_MODES.map((m) => (
            <div
              key={m.id}
              onClick={() => !isNavigating && selectMode(m.id)}
              className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                mode === m.id
                  ? "bg-blue-50 border-blue-500 shadow-md"
                  : "bg-white border-gray-200 hover:border-blue-300"
              } ${isNavigating ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="font-medium text-gray-800">{m.label}</div>
              <div className="text-xs text-gray-500 mt-1">{m.desc}</div>
            </div>
          ))}

          {stats && (
            <div className="mt-6 p-4 bg-white shadow-md rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-3">📊 Route Statistics</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Distance:</span>
                  <span className="font-semibold text-blue-600">{stats.km} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-semibold text-blue-600">{stats.min} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Stops:</span>
                  <span className="font-semibold text-blue-600">{stops.length}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MAP */}
        <div className="lg:col-span-3 space-y-6">
          <div className="h-[500px] bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
            <MapContainer center={DEFAULT_CENTER} zoom={12} style={{ height: "100%" }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />

              <MapBoundsFitter coords={routeCoords} stops={stops} driverPos={driverLocation} />

              {/* Driver Location */}
              {driverLocation && (
                <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
                  <Tooltip permanent direction="top">
                    <div className="text-xs font-bold">📍 You Are Here</div>
                  </Tooltip>
                </Marker>
              )}

              {/* Stops */}
              {stops.map((s, i) => (
                <Marker
                  key={s.id}
                  position={[s.lat, s.lng]}
                  icon={stopIcon(i + 1, s.aiPriority || s.priority)}
                >
                  <Tooltip permanent={false} direction="top">
                    <div className="text-xs">
                      <div className="font-bold text-lg">Stop #{i + 1}</div>
                      <div className="text-gray-600 font-semibold">ID: {s.trackingId || s.id}</div>
                      <div className="text-gray-800 font-medium mt-1">{s.receiverName}</div>
                      <div className="text-gray-500 text-[10px] mt-1 max-w-xs">{s.receiverAddress}</div>
                      {s.receiverPhone && (
                        <div className="text-gray-600 text-[10px] mt-1">📞 {s.receiverPhone}</div>
                      )}
                      <div className="mt-2 text-blue-600 font-bold">⏱ ETA: {etas[i] || 'N/A'} min</div>
                      {s.aiPriority && (
                        <div className="mt-1 text-purple-600 text-[10px] font-semibold">
                          🤖 AI Priority: {s.aiPriority}/5
                        </div>
                      )}
                    </div>
                  </Tooltip>
                </Marker>
              ))}

              {/* Route */}
              {routeCoords.length > 1 && (
                <Polyline positions={routeCoords} color="#2563eb" weight={4} opacity={0.7} />
              )}

              {/* Road Issues */}
              {roadIssues.map((issue, idx) => (
                <Circle
                  key={idx}
                  center={[issue.latitude, issue.longitude]}
                  radius={800}
                  pathOptions={{ color: "#dc2626", fillColor: "#dc2626", fillOpacity: 0.15 }}
                >
                  <Tooltip>
                    <div className="text-xs">
                      <div className="font-bold text-red-600">⚠️ Road Issue</div>
                      <div>{issue.description}</div>
                      <div className="text-gray-500">Severity: {issue.severity}</div>
                    </div>
                  </Tooltip>
                </Circle>
              ))}
            </MapContainer>
          </div>

          {/* DELIVERY SEQUENCE */}
          <div className="bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
              <h2 className="font-bold text-white text-lg">📋 Optimized Delivery Sequence</h2>
              <p className="text-blue-100 text-sm mt-1">Priority stops first, then nearest-neighbor routing</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {stops.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  {routing ? "Loading route..." : "No stops available for routing"}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {stops.map((stop, idx) => {
                    const distFromPrev = idx > 0
                      ? haversineDistance(stops[idx - 1].lat, stops[idx - 1].lng, stop.lat, stop.lng)
                      : driverLocation 
                        ? haversineDistance(driverLocation.lat, driverLocation.lng, stop.lat, stop.lng)
                        : 0;

                    return (
                      <div key={stop.id} className="p-4 hover:bg-gray-50 transition-colors">
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
                              <span className="font-semibold text-gray-800">{stop.receiverName}</span>
                              {getPriorityBadge(stop)}
                              {stop.aiPriority && (
                                <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded font-semibold">
                                  🤖 AI: {stop.aiPriority}/5
                                </span>
                              )}
                            </div>

                            <div className="text-sm text-gray-600 mb-1">
                              Order: <span className="font-mono font-semibold text-blue-600">{stop.trackingId || stop.id}</span>
                            </div>

                            <div className="text-sm text-gray-500 truncate">📍 {stop.receiverAddress}</div>

                            {stop.receiverPhone && (
                              <div className="text-sm text-gray-600 mt-1">📞 {stop.receiverPhone}</div>
                            )}

                            {stop.aiJustification && (
                              <div className="mt-2 text-xs text-gray-600 italic bg-purple-50 p-2 rounded border border-purple-100">
                                💡 {stop.aiJustification}
                              </div>
                            )}

                            <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                              <span>⏱ ETA: <strong>{etas[idx] || 'N/A'} min</strong></span>
                              <span>📊 Status: <strong>{stop.status}</strong></span>
                              {distFromPrev > 0 && (
                                <span className="text-green-600">
                                  📏 Distance: <strong>{distFromPrev.toFixed(1)} km</strong>
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
  );
}