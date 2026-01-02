
// import { useEffect, useRef, useState } from "react";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import {
//   MapContainer,
//   TileLayer,
//   Marker,
//   Polyline,
//   Tooltip,
//   Circle,
//   useMap,
// } from "react-leaflet";
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
// const ROUTE_DEVIATION_THRESHOLD = 0.15; // 150 meters
// const ADVANCE_WARNING_DISTANCE = 0.05; // 50 meters before instruction

// const ROUTE_MODES = [
//   { id: "Balanced", label: "🎯 Balanced", desc: "AI Priority + Distance" },
//   { id: "PriorityFirst", label: "⭐ Priority", desc: "AI Priority first" },
//   { id: "TimeWindow", label: "⏰ Time Window", desc: "Rescheduled first" },
//   { id: "AvoidIssues", label: "🚧 Avoid Issues", desc: "Avoid road issues" },
//   { id: "AIOptimized", label: "🤖 AI Optimized", desc: "Gemini AI routing" },
// ];

// const STORAGE_KEY = "driver_route_mode";

// /* ===========================
//    API BASE - Replace with your backend
// =========================== */
// const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

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
//    NAVIGATION HELPERS
// =========================== */
// const getInstructionIcon = (type, modifier) => {
//   if (type === "turn") {
//     if (modifier?.includes("left")) return "↰";
//     if (modifier?.includes("right")) return "↱";
//     if (modifier?.includes("sharp left")) return "⬅️";
//     if (modifier?.includes("sharp right")) return "➡️";
//     if (modifier?.includes("slight left")) return "↖️";
//     if (modifier?.includes("slight right")) return "↗️";
//   }
  
//   const icons = {
//     depart: "🚀",
//     arrive: "🎯",
//     merge: "🔀",
//     "on ramp": "🛣️",
//     "off ramp": "🛣️",
//     fork: "🔱",
//     "end of road": "⚠️",
//     continue: "⬆️",
//     roundabout: "🔄",
//     rotary: "🔄",
//     "exit roundabout": "↗️",
//     "exit rotary": "↗️",
//   };
  
//   return icons[type] || "➡️";
// };

// const speakInstruction = (text) => {
//   if ('speechSynthesis' in window) {
//     window.speechSynthesis.cancel();
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.rate = 0.85;
//     utterance.pitch = 1;
//     utterance.volume = 1;
//     window.speechSynthesis.speak(utterance);
//   }
// };

// /* ===========================
//    OPTIMIZATION
// =========================== */
// const optimizeRouteLocally = (stops, currentLat, currentLng, roadIssues, mode) => {
//   if (stops.length === 0) return [];

//   const highPriority = stops.filter(s => (s.aiPriority || s.priority) >= 4);
//   const normalPriority = stops.filter(s => (s.aiPriority || s.priority) < 4);

//   let optimizedStops = [];
//   let currentPos = { lat: currentLat, lng: currentLng };

//   if (mode === "PriorityFirst") {
//     const orderedHigh = nearestNeighborSort([...highPriority], currentPos);
//     optimizedStops = [...orderedHigh];
//     if (orderedHigh.length > 0) {
//       currentPos = orderedHigh[orderedHigh.length - 1];
//     }
//     const orderedNormal = nearestNeighborSort([...normalPriority], currentPos);
//     optimizedStops = [...optimizedStops, ...orderedNormal];
//   } else if (mode === "AvoidIssues") {
//     const sortedByRisk = [...stops].sort((a, b) => {
//       const riskA = calculateIssueRisk(a, roadIssues);
//       const riskB = calculateIssueRisk(b, roadIssues);
//       return riskA - riskB;
//     });
//     optimizedStops = nearestNeighborSort(sortedByRisk, currentPos);
//   } else {
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

// /* ===========================
//    ICONS
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
//    MAP COMPONENTS
// =========================== */
// function MapBoundsFitter({ coords, stops, driverPos }) {
//   const map = useMap();

//   useEffect(() => {
//     const pts = [];
//     if (driverPos) pts.push([driverPos.lat, driverPos.lng]);
//     coords.forEach(([lat, lng]) => isValidTN(lat, lng) && pts.push([lat, lng]));
//     stops.forEach((s) => isValidTN(s.lat, s.lng) && pts.push([s.lat, s.lng]));

//     if (pts.length > 1) {
//       const bounds = L.latLngBounds(pts).pad(0.15);
//       map.fitBounds(bounds.intersects(TN_BOUNDS) ? bounds : TN_BOUNDS);
//     }
//   }, [coords, stops, driverPos, map]);

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
// async function fetchRouteWithSteps(stops, issues, mode, signal, driverPos) {
//   const allStops = driverPos ? [
//     { lat: driverPos.lat, lng: driverPos.lng, priority: 0 },
//     ...stops
//   ] : stops;

//   const payload = {
//     stops: allStops.map((s) => ({
//       lat: s.lat,
//       lng: s.lng,
//       priority: s.aiPriority || s.priority || 0,
//       windowStart: s.windowStart,
//       windowEnd: null,
//     })),
//     roadIssues: issues,
//     driverLocation: driverPos,
//     optimizationMode: mode,
//   };

//   const res = await fetch(`${API_BASE}/route/optimize`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload),
//     signal,
//   });

//   const data = await res.json();
//   const route = data.routes[0];

//   const instructions = [];
//   route.legs.forEach((leg, legIdx) => {
//     leg.steps.forEach((step, stepIdx) => {
//       const [lng, lat] = step.maneuver.location;
//       instructions.push({
//         id: `${legIdx}-${stepIdx}`,
//         instruction: step.maneuver.instruction || step.name || "Continue",
//         type: step.maneuver.type,
//         modifier: step.maneuver.modifier,
//         distance: step.distance,
//         duration: step.duration,
//         location: [lat, lng],
//         roadName: step.name,
//       });
//     });
//   });

//   return {
//     coords: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
//     duration: route.duration,
//     distance: route.distance,
//     instructions,
//   };
// }

// /* ===========================
//    API CALLS
// =========================== */
// async function fetchOrders() {
//   const token = localStorage.getItem("token");
//   const res = await fetch(`${API_BASE}/driver/route/optimized`, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   return res.json();
// }

// async function fetchRoadIssues() {
//   const token = localStorage.getItem("token");
//   const res = await fetch(`${API_BASE}/driver/road-issues`, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   return res.json();
// }

// /* ===========================
//    MAIN COMPONENT
// =========================== */
// export default function DriverRoutePage() {
//   const abortRef = useRef(null);
//   const locationWatchRef = useRef(null);
//   const lastInstructionRef = useRef(null);
//   const nextInstructionAnnouncedRef = useRef(false);

//   const [rawStops, setRawStops] = useState([]);
//   const [stops, setStops] = useState([]);
//   const [roadIssues, setRoadIssues] = useState([]);
//   const [routeCoords, setRouteCoords] = useState([]);
//   const [instructions, setInstructions] = useState([]);
//   const [currentInstruction, setCurrentInstruction] = useState(null);
//   const [nextInstruction, setNextInstruction] = useState(null);
//   const [etas, setEtas] = useState([]);
//   const [stats, setStats] = useState(null);
//   const [routing, setRouting] = useState(false);
//   const [routeChanged, setRouteChanged] = useState(false);
//   const [driverLocation, setDriverLocation] = useState(null);
//   const [isNavigating, setIsNavigating] = useState(false);
//   const [voiceEnabled, setVoiceEnabled] = useState(true);
//   const [mode, setMode] = useState(localStorage.getItem(STORAGE_KEY) || "Balanced");
//   const [isScrolled, setIsScrolled] = useState(false);

//   /* LOAD REAL DATA FROM BACKEND */
//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const [ordersData, issuesData] = await Promise.all([
//           fetchOrders(),
//           fetchRoadIssues(),
//         ]);

//         const mappedStops = ordersData
//           .map((o) => ({
//             id: o.id,
//             trackingId: o.trackingId,
//             lat: Number(o.deliveryLatitude ?? o.pickupLatitude),
//             lng: Number(o.deliveryLongitude ?? o.pickupLongitude),
//             priority: o.priority ?? 2,
//             aiPriority: o.aiPriority,
//             aiJustification: o.aiPriorityJustification,
//             windowStart: o.scheduledDate,
//             receiverName: o.receiverName,
//             receiverAddress: o.receiverAddress,
//             receiverPhone: o.receiverPhone,
//             status: o.status,
//           }))
//           .filter((s) => isValidTN(s.lat, s.lng));

//         setRawStops(mappedStops);
//         setRoadIssues(issuesData || []);
//       } catch (error) {
//         console.error("Failed to load data:", error);
//       }
//     };

//     loadData();
//   }, []);

//   /* GET CURRENT LOCATION */
//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const pos = {
//             lat: position.coords.latitude,
//             lng: position.coords.longitude,
//           };
//           if (isValidTN(pos.lat, pos.lng)) {
//             setDriverLocation(pos);
//           } else {
//             // Fallback to first stop if outside TN
//             if (rawStops.length > 0) {
//               setDriverLocation({ lat: rawStops[0].lat, lng: rawStops[0].lng });
//             }
//           }
//         },
//         (error) => {
//           console.error("Geolocation error:", error);
//           if (rawStops.length > 0) {
//             setDriverLocation({ lat: rawStops[0].lat, lng: rawStops[0].lng });
//           }
//         }
//       );
//     }
//   }, [rawStops]);

//     const calculateRoute = async (orderedStops) => {
//     if (!driverLocation) return;

//     abortRef.current?.abort?.();
//     const controller = new AbortController();
//     abortRef.current = controller;

//     try {
//       const { coords, duration, distance, instructions: routeInstructions } =
//         await fetchRouteWithSteps(orderedStops, roadIssues, mode, controller.signal, driverLocation);

//       setRouteCoords(coords);
//       setInstructions(routeInstructions);
//       setStats({
//         km: (distance / 1000).toFixed(1),
//         min: Math.round(duration / 60),
//       });

//       // Calculate ETAs
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
  
//     const optimizeStops = async () => {
//       if (!driverLocation) return;
  
//       setRouting(true);
  
//       const optimizedStops = optimizeRouteLocally(
//         rawStops,
//         driverLocation.lat,
//         driverLocation.lng,
//         roadIssues,
//         mode
//       );
  
//       setStops(optimizedStops);
//       setRouteChanged(true);
//       setTimeout(() => setRouteChanged(false), 3000);
  
//       if (optimizedStops.length >= 1) {
//         await calculateRoute(optimizedStops);
//       }
  
//       setRouting(false);
//     };

//   /* OPTIMIZE WHEN DATA CHANGES */
//   useEffect(() => {
//     if (rawStops.length >= 1 && driverLocation) {
//       optimizeStops();
//     }
//   }, [rawStops, roadIssues, mode, driverLocation]);



//   /* NAVIGATION TRACKING */
//   useEffect(() => {
//     if (!isNavigating || !navigator.geolocation) return;

//     locationWatchRef.current = navigator.geolocation.watchPosition(
//       (position) => {
//         const newPos = {
//           lat: position.coords.latitude,
//           lng: position.coords.longitude,
//         };

//         if (!isValidTN(newPos.lat, newPos.lng)) return;

//         setDriverLocation(newPos);

//         // Check for route deviation
//         if (routeCoords.length > 0) {
//           const closestPoint = findClosestPoint(newPos, routeCoords);
//           const deviation = haversineDistance(
//             newPos.lat,
//             newPos.lng,
//             closestPoint.lat,
//             closestPoint.lng
//           );

//           if (deviation > ROUTE_DEVIATION_THRESHOLD) {
            
//             optimizeStops();
//           }
//         }

//         // Update navigation instructions
//         updateNavigationInstructions(newPos);
//       },
//       (error) => console.error("Location tracking error:", error),
//       { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
//     );

//     return () => {
//       if (locationWatchRef.current) {
//         navigator.geolocation.clearWatch(locationWatchRef.current);
//       }
//     };
//   }, [isNavigating, routeCoords, instructions]);

//   const findClosestPoint = (pos, coords) => {
//     let closest = coords[0];
//     let minDist = haversineDistance(pos.lat, pos.lng, closest[0], closest[1]);

//     coords.forEach(([lat, lng]) => {
//       const dist = haversineDistance(pos.lat, pos.lng, lat, lng);
//       if (dist < minDist) {
//         minDist = dist;
//         closest = [lat, lng];
//       }
//     });

//     return { lat: closest[0], lng: closest[1] };
//   };

//   const updateNavigationInstructions = (pos) => {
//     if (instructions.length === 0) return;

//     let currentIdx = -1;
//     let minDist = Infinity;

//     // Find current instruction
//     instructions.forEach((inst, idx) => {
//       const [lat, lng] = inst.location;
//       const dist = haversineDistance(pos.lat, pos.lng, lat, lng);
      
//       if (dist < minDist) {
//         minDist = dist;
//         currentIdx = idx;
//       }
//     });

//     if (currentIdx === -1) return;

//     const current = instructions[currentIdx];
//     const [lat, lng] = current.location;
//     const distToCurrent = haversineDistance(pos.lat, pos.lng, lat, lng);

//     // Announce current instruction when within 30m
//     if (distToCurrent < 0.03) {
//       if (lastInstructionRef.current !== current.id) {
//         setCurrentInstruction(current);
//         lastInstructionRef.current = current.id;
//         nextInstructionAnnouncedRef.current = false;
        
//         if (voiceEnabled) {
//           const distText = distToCurrent < 0.01
//             ? ""
//             : `In ${Math.round(distToCurrent * 1000)} meters, `;
//           speakInstruction(distText + current.instruction);
//         }
//       }
//     }

//     // Advance warning for next instruction (50m before)
//     const nextIdx = currentIdx + 1;
//     if (nextIdx < instructions.length) {
//       const next = instructions[nextIdx];
//       const [nextLat, nextLng] = next.location;
//       const distToNext = haversineDistance(pos.lat, pos.lng, nextLat, nextLng);

//       setNextInstruction(next);

//       // Announce next instruction 50m before
//       if (distToNext < ADVANCE_WARNING_DISTANCE && !nextInstructionAnnouncedRef.current) {
//         nextInstructionAnnouncedRef.current = true;
//         if (voiceEnabled) {
//           speakInstruction(`In ${Math.round(distToNext * 1000)} meters, ${next.instruction}`);
//         }
//       }
//     } else {
//       setNextInstruction(null);
//     }
//   };

//   const startNavigation = () => {
//     setIsNavigating(true);
//     lastInstructionRef.current = null;
//     nextInstructionAnnouncedRef.current = false;
//     if (voiceEnabled && instructions.length > 0) {
//       speakInstruction("Navigation started. " + instructions[0].instruction);
//     }
//   };

//   const stopNavigation = () => {
//     setIsNavigating(false);
//     setCurrentInstruction(null);
//     setNextInstruction(null);
//     lastInstructionRef.current = null;
//     nextInstructionAnnouncedRef.current = false;
//     if ('speechSynthesis' in window) {
//       window.speechSynthesis.cancel();
//     }
//   };

//   const selectMode = (m) => {
//     localStorage.setItem(STORAGE_KEY, m);
//     setMode(m);
//   };

//   const getPriorityBadge = (stop) => {
//     const priority = stop.aiPriority || stop.priority;
//     if (priority >= 4) return <span className="px-2 py-1 text-xs bg-red-500/20 text-red-500 border border-red-500/30 rounded font-semibold">High Priority</span>;
//     if (priority >= 3) return <span className="px-2 py-1 text-xs bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded">Medium</span>;
//     return <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-500 border border-blue-500/30 rounded">Normal</span>;
//   };

//   return (
//     <div className="flex h-screen bg-[#0b0f14] text-white overflow-hidden">
//       <DriverSidebar active="route" />

//       <div
//         className="flex-1 flex flex-col h-screen overflow-y-auto transition-all duration-300"
//         onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 10)}
//       >
//         {/* HEADER */}
//         <header
//           className={`sticky top-0 z-40 transition-all duration-300 ${
//             isScrolled ? "bg-[#0b0f14]/80 backdrop-blur-md border-b border-[#1f2937]" : "bg-transparent"
//           }`}
//         >
//            <div className="px-8 py-5">
//             <div className="max-w-7xl mx-auto flex justify-between items-center">
//               <div>
//                 <h1 className="text-3xl font-bold text-white">Route Optimized Navigator</h1>
//                  <p className="text-gray-400 mt-1">Real-time navigation with intelligent routing</p>
//               </div>
//             </div>
//            </div>
//         </header>


//         <div className="flex-1 p-8 pt-2">
            
//         {routeChanged && (
//             <div className="fixed top-24 right-8 z-50 bg-emerald-500/20 border border-emerald-500 text-emerald-500 px-4 py-3 rounded-xl shadow-lg animate-fade-in-down flex items-center gap-2">
//             <span className="text-xl">✅</span> Route optimized successfully!
//             </div>
//         )}

//       {/* CURRENT INSTRUCTION - Large Display */}
//       {currentInstruction && isNavigating && (
//         <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-[#1a1f29]/95 text-white px-8 py-6 rounded-2xl shadow-2xl border border-blue-500/30 max-w-2xl w-full backdrop-blur-md">
//           <div className="flex items-center gap-6">
//             <span className="text-6xl text-blue-500">{getInstructionIcon(currentInstruction.type, currentInstruction.modifier)}</span>
//             <div className="flex-1">
//               <div className="font-bold text-3xl leading-tight">{currentInstruction.instruction}</div>
//               <div className="text-lg text-blue-400 mt-2 font-medium">
//                 {currentInstruction.distance < 1000
//                   ? `${Math.round(currentInstruction.distance)} m`
//                   : `${(currentInstruction.distance / 1000).toFixed(1)} km`}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* NEXT INSTRUCTION - Preview */}
//       {nextInstruction && isNavigating && (
//         <div className="fixed top-64 left-1/2 transform -translate-x-1/2 z-40 bg-[#0f141c]/90 text-gray-300 px-6 py-3 rounded-xl shadow-lg border border-[#1f2937] max-w-lg backdrop-blur-sm">
//           <div className="flex items-center gap-4 text-sm">
//             <span className="text-2xl text-gray-400">{getInstructionIcon(nextInstruction.type, nextInstruction.modifier)}</span>
//             <div className="flex-1">
//               <div className="font-medium">Then: {nextInstruction.instruction}</div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* NAVIGATION CONTROLS */}
//       <div className="mb-8 flex gap-4 flex-wrap items-center bg-[#1a1f29] p-4 rounded-xl border border-[#1f2937] shadow-sm">
//         {!isNavigating ? (
//           <button
//             onClick={startNavigation}
//             disabled={!driverLocation || stops.length === 0 || routing}
//             className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-500 disabled:bg-[#1f2937] disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2"
//           >
//             🚀 Start Navigation
//           </button>
//         ) : (
//           <button
//             onClick={stopNavigation}
//             className="px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-500 transition-all shadow-lg shadow-red-900/20 flex items-center gap-2"
//           >
//             ⏹ Stop Navigation
//           </button>
//         )}

//         <button
//           onClick={() => setVoiceEnabled(!voiceEnabled)}
//           className={`px-6 py-3 rounded-lg font-semibold transition-all border ${
//             voiceEnabled
//               ? "bg-blue-600 text-white border-blue-500 hover:bg-blue-500"
//               : "bg-[#1f2937] text-gray-400 border-[#374151] hover:bg-[#2d3748]"
//           }`}
//         >
//           {voiceEnabled ? "🔊 Voice On" : "🔇 Voice Off"}
//         </button>

//         {driverLocation && (
//           <div className="px-5 py-3 bg-[#0f141c] rounded-lg border border-[#1f2937] flex items-center gap-3 ml-auto">
//             <span className="text-emerald-500 font-bold text-xl ripple">📍</span>
//             <div className="text-sm">
//               <div className="font-semibold text-gray-300">Current Location</div>
//               <div className="text-gray-500 font-mono">
//                 {driverLocation.lat.toFixed(4)}, {driverLocation.lng.toFixed(4)}
//               </div>
//             </div>
//           </div>
//         )}

//         {routing && (
//           <div className="px-6 py-3 bg-blue-900/20 border border-blue-800 rounded-lg flex items-center gap-3 text-blue-400">
//             <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
//             <span className="font-semibold">Optimizing route...</span>
//           </div>
//         )}
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//         {/* MODES & STATS */}
//         <div className="space-y-6">
//           <div className="bg-[#1a1f29] p-5 rounded-xl border border-[#1f2937] shadow-sm">
//              <h2 className="font-bold text-gray-100 mb-4 text-lg">Optimization Mode</h2>
//               <div className="space-y-3">
//                 {ROUTE_MODES.map((m) => (
//                 <div
//                     key={m.id}
//                     onClick={() => selectMode(m.id)}
//                     className={`p-4 border rounded-xl cursor-pointer transition-all relative overflow-hidden group ${mode === m.id
//                     ? "bg-blue-900/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
//                     : "bg-[#0f141c] border-[#1f2937] hover:border-gray-600 hover:bg-[#151b24]"
//                     }`}
//                 >
//                     {mode === m.id && <div className="absolute inset-y-0 left-0 w-1 bg-blue-500"></div>}
//                     <div className={`font-medium ${mode === m.id ? 'text-blue-400' : 'text-gray-300'}`}>{m.label}</div>
//                     <div className="text-sm text-gray-500 mt-1">{m.desc}</div>
//                 </div>
//                 ))}
//             </div>
//           </div>

//           {stats && (
//             <div className="bg-[#1a1f29] p-5 rounded-xl border border-[#1f2937] shadow-sm">
//               <h3 className="font-bold text-gray-100 mb-4 text-lg">Route Statistics</h3>
//               <div className="space-y-4">
//                 <div className="flex justify-between items-center p-3 bg-[#0f141c] rounded-lg border border-[#1f2937]">
//                   <span className="text-gray-400 text-sm">Total Distance</span>
//                   <span className="font-mono font-bold text-blue-400 text-lg">{stats.km} <span className="text-xs text-gray-500">km</span></span>
//                 </div>
//                 <div className="flex justify-between items-center p-3 bg-[#0f141c] rounded-lg border border-[#1f2937]">
//                   <span className="text-gray-400 text-sm">Est. Duration</span>
//                   <span className="font-mono font-bold text-blue-400 text-lg">{stats.min} <span className="text-xs text-gray-500">min</span></span>
//                 </div>
//                 <div className="flex justify-between items-center p-3 bg-[#0f141c] rounded-lg border border-[#1f2937]">
//                   <span className="text-gray-400 text-sm">Total Stops</span>
//                   <span className="font-mono font-bold text-emerald-400 text-lg">{stops.length}</span>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* MAP */}
//         <div className="lg:col-span-3 space-y-6">
//           <div className="h-[550px] bg-[#0f141c] shadow-lg rounded-xl overflow-hidden border border-[#1f2937] relative">
//             <MapContainer center={DEFAULT_CENTER} zoom={12} style={{ height: "100%" }}>
//               <TileLayer
//                 url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                 attribution='&copy; OpenStreetMap contributors'
//                 className="map-tiles"
//               />

//               <MapBoundsFitter coords={routeCoords} stops={stops} driverPos={driverLocation} />

//               {/* Driver Location */}
//               {driverLocation && (
//                   <Marker position={[driverLocation.lat, driverLocation.lng]} icon={L.divIcon({
//                       html: `<div style="background:#10b981;box-shadow:0 0 20px #10b981;width:16px;height:16px;border-radius:50%;border:2px solid white;"></div>`,
//                       className: 'driver-marker',
//                       iconSize: [20, 20]
//                   })} />
//               )}

//               {stops.map((s, i) => (
//                 <Marker
//                   key={s.id}
//                   position={[s.lat, s.lng]}
//                   icon={stopIcon(i + 1, s.aiPriority || s.priority)}
//                 >
//                   <Tooltip permanent={false} direction="top" className="custom-tooltip">
//                     <div className="bg-gray-800 text-white p-2 border-0 shadow-xl rounded-lg text-xs min-w-[200px]">
//                       <div className="font-bold text-lg mb-1 border-b border-gray-700 pb-1">Stop #{i + 1}</div>
//                       <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2">
//                         <span className="text-gray-400">Order ID:</span> <span className="font-mono text-blue-300">{s.trackingId || s.id}</span>
//                         <span className="text-gray-400">Receiver:</span> <span className="truncate text-gray-200">{s.receiverName}</span>
//                          {s.receiverPhone && <><span className="text-gray-400">Phone:</span> <span className="text-gray-200">{s.receiverPhone}</span></>}
//                         <span className="text-gray-400">ETA:</span> <span className="font-bold text-emerald-400">{etas[i]} min</span>
//                       </div>
                      
//                       {s.aiPriority && (
//                         <div className="mt-2 text-purple-300 text-[10px] font-semibold bg-purple-900/30 p-1 rounded border border-purple-500/30 text-center">
//                           🤖 AI Priority: {s.aiPriority}/5
//                         </div>
//                       )}
//                     </div>
//                   </Tooltip>
//                 </Marker>
//               ))}

//               {routeCoords.length > 1 && (
//                 <Polyline positions={routeCoords} color="#3b82f6" weight={5} opacity={0.8} />
//               )}

//               {roadIssues.map((i, idx) => (
//                 <Circle
//                   key={idx}
//                   center={[i.latitude, i.longitude]}
//                   radius={800}
//                   pathOptions={{ color: "#ef4444", fillColor: "#ef4444", fillOpacity: 0.2, weight: 1 }}
//                 >
//                   <Tooltip>
//                     <div className="bg-red-900 text-white p-2 rounded border border-red-700 text-xs">
//                       <div className="font-bold text-red-300">⚠️ Road Issue</div>
//                       <div>{i.description}</div>
//                       <div className="text-gray-300">Severity: {i.severity}</div>
//                     </div>
//                   </Tooltip>
//                 </Circle>
//               ))}
//             </MapContainer>
            
//             {/* Map Overlay Controls could go here */}
//           </div>

//           {/* OPTIMIZED ORDER LIST */}
//           <div className="bg-[#1a1f29] shadow-sm rounded-xl border border-[#1f2937] overflow-hidden flex flex-col max-h-[500px]">
//             <div className="px-6 py-4 border-b border-[#1f2937] bg-[#0f141c] flex justify-between items-center sticky top-0">
//               <h2 className="font-bold text-white text-lg flex items-center gap-2">
//                 📋 Optimized Sequence
//                 <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full border border-gray-700">{stops.length} Stops</span>
//               </h2>
//             </div>
            
//             <div className="overflow-y-auto custom-scrollbar">
//               {stops.length === 0 ? (
//                 <div className="p-12 text-center text-gray-500 flex flex-col items-center">
//                   <span className="text-4xl mb-3 opacity-30">📍</span>
//                   <p>No stops available for routing</p>
//                 </div>
//               ) : (
//                 <div className="divide-y divide-[#1f2937]">
//                   {stops.map((stop, idx) => {
//                     const distFromPrev = idx > 0
//                       ? haversineDistance(stops[idx - 1].lat, stops[idx - 1].lng, stop.lat, stop.lng)
//                       : 0;
                    
//                     const isNext = idx === 0 && !isNavigating || (isNavigating && nextInstruction && currentInstruction && idx===0); // Logic simplification needed here potentially

//                     return (
//                       <div key={stop.id} className="p-4 hover:bg-[#232936] transition-colors group">
//                         <div className="flex items-start gap-4">
//                           <div className="flex-shrink-0 flex flex-col items-center gap-1">
//                             <div
//                               className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-2 border-[#1f2937] group-hover:border-gray-500 transition-colors"
//                               style={{
//                                 backgroundColor: (stop.aiPriority || stop.priority) >= 4
//                                   ? "#b91c1c"
//                                   : (stop.aiPriority || stop.priority) >= 3
//                                     ? "#d97706"
//                                     : "#2563eb"
//                               }}
//                             >
//                               {idx + 1}
//                             </div>
//                             {idx < stops.length - 1 && (
//                                 <div className="h-full w-0.5 bg-[#1f2937] rounded-full my-1"></div>
//                             )}
//                           </div>

//                           <div className="flex-1 min-w-0 pt-1">
//                             <div className="flex items-center gap-2 mb-1 flex-wrap">
//                               <span className="font-bold text-gray-200 text-lg">
//                                 {stop.receiverName}
//                               </span>
//                               {getPriorityBadge(stop)}
//                               {stop.aiPriority && (
//                                 <span className="px-2 py-1 text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded font-medium">
//                                   🤖 AI: {stop.aiPriority}/5
//                                 </span>
//                               )}
//                             </div>

//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm text-gray-400 mb-2">
//                                 <div><span className="text-gray-500 text-xs uppercase tracking-wide">Order ID:</span> <span className="font-mono text-blue-400">{stop.trackingId || stop.id}</span></div>
//                                 <div><span className="text-gray-500 text-xs uppercase tracking-wide">Status:</span> <span className="text-gray-300">{stop.status}</span></div>
//                             </div>
                            
//                             <div className="text-sm text-gray-400 mb-2 flex items-start gap-1">
//                                 <span className="mt-0.5 opacity-60">📍</span>
//                                 <span className="truncate">{stop.receiverAddress}</span>
//                             </div>

//                             {stop.aiJustification && (
//                               <div className="mt-2 text-xs text-purple-300 italic bg-purple-900/20 p-2 rounded-lg border border-purple-500/20">
//                                 💡 {stop.aiJustification}
//                               </div>
//                             )}

//                             <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 border-t border-[#2d3748] pt-2">
//                               <span className="flex items-center gap-1 text-emerald-400 bg-emerald-900/10 px-2 py-1 rounded">
//                                 ⏱ ETA: <strong className="text-emerald-300">{etas[idx] || 'N/A'} min</strong>
//                               </span>
                              
//                               {idx > 0 && (
//                                 <span className="flex items-center gap-1 text-blue-400 bg-blue-900/10 px-2 py-1 rounded">
//                                   📏 <strong className="text-blue-300">{distFromPrev.toFixed(1)} km</strong> from prev
//                                 </span>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//      </div>
//     </div>
//   </div>
//   );
// }
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
import DriverSidebar from "./DriverSidebar";
import api from "../../services/api";

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
const NAVIGATION_ZOOM = 17;
const OVERVIEW_ZOOM = 11;

const ROUTE_MODES = [
  { id: "Balanced", label: "🎯 Balanced", color: "#3b82f6", desc: "Distance + Priority" },
  { id: "PriorityFirst", label: "⭐ Priority", color: "#dc2626", desc: "Highest priority first" },
  { id: "TimeWindow", label: "⏰ Time Window", color: "#f59e0b", desc: "Scheduled times first" },
  { id: "AvoidIssues", label: "🚧 Avoid Issues", color: "#10b981", desc: "Safest routes" },
  { id: "AIOptimized", label: "🤖 AI Optimized", color: "#8b5cf6", desc: "Shortest total distance" },
];

const STORAGE_KEY = "driver_route_mode";


/* ===========================
   HELPERS
=========================== */
const isValidTN = (lat, lng) =>
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  lat >= -90 &&
  lat <= 90 &&
  lng >= -180 &&
  lng <= 180;

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
    if (modifier?.includes("sharp left")) return "⬅️";
    if (modifier?.includes("sharp right")) return "➡️";
    if (modifier?.includes("left")) return "↰";
    if (modifier?.includes("right")) return "↱";
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
   OPTIMIZED ROUTE ALGORITHMS
   Each mode produces DIFFERENT stop sequences
=========================== */
const optimizeRouteByMode = (stops, startPos, roadIssues, mode) => {
  if (!stops.length) return [];

  const calculateIssueRisk = (stop) => {
    let risk = 0;
    roadIssues.forEach((issue) => {
      const dist = haversineDistance(stop.lat, stop.lng, issue.latitude, issue.longitude);
      if (dist < 5) {
        risk += issue.severity === "Critical" ? 10 : issue.severity === "High" ? 5 : 2;
      }
    });
    return risk;
  };

  const dist = (a, b) => haversineDistance(a.lat, a.lng, b.lat, b.lng);

  // MODE 1: PRIORITY FIRST
  if (mode === "PriorityFirst") {
    return [...stops].sort((a, b) => {
      const priorityA = a.aiPriority || a.priority || 0;
      const priorityB = b.aiPriority || b.priority || 0;
      if (priorityB !== priorityA) return priorityB - priorityA;
      return dist(startPos, a) - dist(startPos, b);
    });
  }

  // MODE 2: TIME WINDOW
  if (mode === "TimeWindow") {
    return [...stops].sort((a, b) => {
      if (a.windowStart && b.windowStart) {
        return new Date(a.windowStart) - new Date(b.windowStart);
      }
      if (a.windowStart) return -1;
      if (b.windowStart) return 1;
      return dist(startPos, a) - dist(startPos, b);
    });
  }

  // MODE 3: AVOID ISSUES
  if (mode === "AvoidIssues") {
    const stopsWithRisk = stops.map(s => ({
      ...s,
      risk: calculateIssueRisk(s)
    }));

    return stopsWithRisk.sort((a, b) => {
      if (Math.abs(a.risk - b.risk) > 2) {
        return a.risk - b.risk;
      }
      return dist(startPos, a) - dist(startPos, b);
    });
  }

  // MODE 4: AI OPTIMIZED (TSP using 2-opt)
  if (mode === "AIOptimized") {
    let route = [...stops];
    let improved = true;
    let iterations = 0;
    const maxIterations = 100;

    const calculateTotalDistance = (r) => {
      let total = dist(startPos, r[0]);
      for (let i = 0; i < r.length - 1; i++) {
        total += dist(r[i], r[i + 1]);
      }
      return total;
    };

    while (improved && iterations < maxIterations) {
      improved = false;
      iterations++;

      for (let i = 0; i < route.length - 1; i++) {
        for (let j = i + 2; j < route.length; j++) {
          const newRoute = [
            ...route.slice(0, i + 1),
            ...route.slice(i + 1, j + 1).reverse(),
            ...route.slice(j + 1)
          ];

          if (calculateTotalDistance(newRoute) < calculateTotalDistance(route)) {
            route = newRoute;
            improved = true;
          }
        }
      }
    }

    return route;
  }

  // MODE 5: BALANCED (Weighted nearest neighbor)
  const remaining = [...stops];
  const route = [];
  let current = startPos;

  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestScore = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const stop = remaining[i];
      const distance = dist(current, stop);
      const priority = stop.aiPriority || stop.priority || 1;
      const risk = calculateIssueRisk(stop);

      const score = distance * 1.5 - (priority * 0.3) + (risk * 0.2);

      if (score < bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }

    route.push(remaining[bestIdx]);
    current = remaining[bestIdx];
    remaining.splice(bestIdx, 1);
  }

  return route;
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
   NAVIGATION ZOOM COMPONENT
=========================== */
function NavigationZoom({ isNavigating, driverPos }) {
  const map = useMap();

  useEffect(() => {
    if (isNavigating && driverPos) {
      map.setView([driverPos.lat, driverPos.lng], NAVIGATION_ZOOM, {
        animate: true,
        duration: 1
      });
    }
  }, [isNavigating, driverPos, map]);

  return null;
}

/* ===========================
   MAP BOUNDS COMPONENT
=========================== */
function MapBoundsFitter({ coords, stops, driverPos, isNavigating }) {
  const map = useMap();

  useEffect(() => {
    if (isNavigating) return;

    const pts = [];
    if (driverPos) pts.push([driverPos.lat, driverPos.lng]);
    coords.forEach(([lat, lng]) => isValidTN(lat, lng) && pts.push([lat, lng]));
    stops.forEach((s) => isValidTN(s.lat, s.lng) && pts.push([s.lat, s.lng]));

    if (pts.length > 1) {
      const bounds = L.latLngBounds(pts).pad(0.15);
      map.fitBounds(bounds.intersects(TN_BOUNDS) ? bounds : TN_BOUNDS);
    }
  }, [coords, stops, driverPos, isNavigating, map]);

  return null;
}

/* ===========================
   ROUTE API
=========================== */
async function fetchRouteWithSteps(stops, issues, mode, signal, driverPos) {
  if (!stops.length) return { coords: [], duration: 0, distance: 0, instructions: [] };

  // Build coordinates string for OSRM API
  const allPoints = driverPos
    ? [[driverPos.lng, driverPos.lat], ...stops.map(s => [s.lng, s.lat])]
    : stops.map(s => [s.lng, s.lat]);

  const coordinates = allPoints.map(p => `${p[0]},${p[1]}`).join(';');

  // Different routing profiles based on mode
  let osrmProfile = 'driving';
  let params = 'overview=full&geometries=geojson&steps=true&annotations=true';

  // Modify routing behavior based on mode
  if (mode === 'AvoidIssues') {
    // For avoiding issues, we'll calculate routes that avoid problem areas
    params += '&continue_straight=false&alternatives=true';
  } else if (mode === 'AIOptimized') {
    // Shortest distance - use a tighter overview
    params += '&continue_straight=true';
  } else if (mode === 'TimeWindow') {
    // Fastest route
    params += '&continue_straight=false';
  }

  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/${osrmProfile}/${coordinates}?${params}`,
      { signal }
    );

    const data = await res.json();

    if (!data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }

    // If avoiding issues, pick alternative route if available
    let route = data.routes[0];
    if (mode === 'AvoidIssues' && data.routes.length > 1) {
      // Calculate which route avoids more issues
      let bestRouteIdx = 0;
      let lowestRisk = Infinity;

      data.routes.forEach((r, idx) => {
        const coords = r.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        let routeRisk = 0;

        // Sample points along route to check issue proximity
        const samplePoints = coords.filter((_, i) => i % Math.max(1, Math.floor(coords.length / 20)) === 0);

        samplePoints.forEach(([lat, lng]) => {
          issues.forEach(issue => {
            const dist = haversineDistance(lat, lng, issue.latitude, issue.longitude);
            if (dist < 3) {
              routeRisk += issue.severity === "Critical" ? 10 : issue.severity === "High" ? 5 : 2;
            }
          });
        });

        if (routeRisk < lowestRisk) {
          lowestRisk = routeRisk;
          bestRouteIdx = idx;
        }
      });

      route = data.routes[bestRouteIdx];
    }

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
      distance: route.distance / 1000, // Convert to km
      instructions,
    };
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    console.error('OSRM routing failed:', err);

    // Fallback: create straight lines between points
    const coords = allPoints.map(([lng, lat]) => [lat, lng]);
    let totalDist = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      totalDist += haversineDistance(coords[i][0], coords[i][1], coords[i + 1][0], coords[i + 1][1]);
    }

    return {
      coords,
      duration: (totalDist / 40) * 60, // 40 km/h average
      distance: totalDist,
      instructions: [],
    };
  }
}

/* ===========================
   API CALLS
=========================== */
async function fetchOrders() {
  const res = await api.get("/driver/route/optimized");
  return res.data;
}

async function fetchRoadIssues() {
  const res = await api.get("/driver/road-issues");
  return res.data;
}

/* ===========================
   MAIN COMPONENT
=========================== */
export default function DriverRoutePage() {
  const abortRef = useRef(null);
  const locationWatchRef = useRef(null);

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
  const [driverLocation, setDriverLocation] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [mode, setMode] = useState(localStorage.getItem(STORAGE_KEY) || "Balanced");
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedStop, setSelectedStop] = useState(null);

  /* LOAD DATA */
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
            isAsr: !!o.isASR, // Backend field name is often isASR
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

  /* GET LOCATION */
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
          } else if (rawStops.length > 0) {
            setDriverLocation({ lat: rawStops[0].lat, lng: rawStops[0].lng });
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

  /* CALCULATE ROUTE */
  const calculateRoute = async (orderedStops) => {
    if (!orderedStops.length || !driverLocation) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setRouting(true);

    try {
      const result = await fetchRouteWithSteps(
        orderedStops,
        roadIssues,
        mode,
        abortRef.current.signal,
        driverLocation
      );

      setRouteCoords(result.coords);
      setInstructions(result.instructions);

      if (result.instructions.length > 0) {
        setCurrentInstruction(result.instructions[0]);
        setNextInstruction(result.instructions[1] || null);
      }

      // Use the actual route data from the API for display
      setStats({
        distance: result.distance.toFixed(1),
        duration: Math.round(result.duration / 60),
        stops: orderedStops.length,
      });

      // Calculate ETAs based on the actual route
      const etaList = [];
      let cumulativeTime = 0;
      const segmentDuration = result.duration / orderedStops.length;

      for (let i = 0; i < orderedStops.length; i++) {
        cumulativeTime += segmentDuration + 5; // Add 5 min per stop
        etaList.push(Math.round(cumulativeTime / 60));
      }

      setEtas(etaList);

    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Route calculation failed:", err);
      }
    } finally {
      setRouting(false);
    }
  };

  /* OPTIMIZE AND CALCULATE */
  useEffect(() => {
    if (rawStops.length > 0 && driverLocation) {
      const optimized = optimizeRouteByMode(rawStops, driverLocation, roadIssues, mode);
      setStops(optimized);
      calculateRoute(optimized);
    }
  }, [rawStops, roadIssues, mode, driverLocation]);

  /* HANDLE MODE CHANGE */
  const handleModeChange = (newMode) => {
    setMode(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
  };

  /* START NAVIGATION */
  const startNavigation = () => {
    setIsNavigating(true);

    if (currentInstruction && voiceEnabled) {
      speakInstruction(currentInstruction.instruction);
    }

    if (navigator.geolocation) {
      locationWatchRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          if (isValidTN(pos.lat, pos.lng)) {
            setDriverLocation(pos);

            if (currentInstruction) {
              const distToInstruction = haversineDistance(
                pos.lat,
                pos.lng,
                currentInstruction.location[0],
                currentInstruction.location[1]
              );

              if (distToInstruction < 0.03) {
                const currentIdx = instructions.findIndex(i => i.id === currentInstruction.id);
                if (currentIdx < instructions.length - 1) {
                  const next = instructions[currentIdx + 1];
                  setCurrentInstruction(next);
                  setNextInstruction(instructions[currentIdx + 2] || null);

                  if (voiceEnabled) {
                    speakInstruction(next.instruction);
                  }
                }
              }
            }
          }
        },
        (error) => console.error("Location watch error:", error),
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
      );
    }
  };

  /* STOP NAVIGATION */
  const stopNavigation = () => {
    setIsNavigating(false);

    if (locationWatchRef.current) {
      navigator.geolocation.clearWatch(locationWatchRef.current);
      locationWatchRef.current = null;
    }

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const currentModeColor = ROUTE_MODES.find(m => m.id === mode)?.color || "#3b82f6";

  // Calculate distance between two points
  const getDistanceToStop = (stopIdx) => {
    if (!driverLocation || stopIdx < 0) return 0;
    const stop = stops[stopIdx];
    // Simple straight line distance for list display if real route segment not available easily
    // In a real app, this would use the route segments. 
    // Here we'll use haversine for display speed.
    if (stopIdx === 0) {
      return haversineDistance(driverLocation.lat, driverLocation.lng, stop.lat, stop.lng).toFixed(1);
    }
    const prev = stops[stopIdx - 1];
    return haversineDistance(prev.lat, prev.lng, stop.lat, stop.lng).toFixed(1);
  };

  return (
    <div className="flex h-screen bg-[#0b0f14] text-white overflow-hidden font-sans">
      <DriverSidebar active="route" />

      <div
        className="flex-1 flex flex-col h-screen overflow-hidden relative"
      >
        {/* HEADER */}
        <header
          className="z-40 bg-[#0b0f14] border-b border-white/10 shadow-lg flex-shrink-0"
        >
          <div className="px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-lg shadow-blue-900/20">
                <span className="text-2xl">🗺️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Driver Navigation</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 bg-[#141922] border border-white/5 px-4 py-2 rounded-xl shadow-inner">
                <span className="relative flex h-3 w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isNavigating ? "bg-emerald-400" : "bg-gray-400"}`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${isNavigating ? "bg-emerald-500" : "bg-gray-500"}`}></span>
                </span>
                <span className="text-sm font-medium text-gray-300">{isNavigating ? "Navigating" : "Idle"}</span>
              </div>

              {isNavigating ? (
                <button
                  onClick={stopNavigation}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 hover:shadow-lg hover:shadow-red-900/20"
                >
                  ⏹ Stop
                </button>
              ) : (
                <button
                  onClick={startNavigation}
                  disabled={!routeCoords.length || routing}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-2 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-900/20 hover:shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🚀 Start
                </button>
              )}

              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`p-2.5 rounded-xl border transition-all ${voiceEnabled
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20"
                  : "bg-[#141922] text-gray-500 border-white/5 hover:text-gray-300"
                  }`}
              >
                {voiceEnabled ? "🔊" : "🔇"}
              </button>
            </div>
          </div>
        </header>

        {/* MODE SELECTOR */}
        <div className={`px-6 pt-2 pb-4 border-b border-white/5 bg-[#0b0f14] transition-all duration-300 ${isNavigating ? "hidden" : "block"}`}>
          <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
            {ROUTE_MODES.map((m) => {
              const isActive = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => handleModeChange(m.id)}
                  disabled={routing}
                  className={`
                                 flex flex-col min-w-[140px] px-4 py-3 rounded-2xl border transition-all duration-300 relative overflow-hidden
                                 ${isActive
                      ? "bg-[#141922] border-blue-500/50 shadow-lg shadow-blue-900/10 scale-[1.02]"
                      : "bg-[#141922]/50 border-white/5 hover:bg-[#141922] hover:border-white/10"
                    }
                             `}
                >
                  {isActive && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500" />}
                  <span className="text-lg mb-1 block">{m.label.split(" ")[0]}</span>
                  <span className={`font-bold text-sm ${isActive ? "text-white" : "text-gray-400"}`}>{m.label.split(" ").slice(1).join(" ")}</span>
                  <span className="text-[10px] text-gray-500 mt-1 truncate w-full text-left">{m.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* MAIN LAYOUT */}
        <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden relative">

          {/* MAP AREA */}
          <div className={`relative bg-[#141922] z-0 transition-all duration-300 ${isNavigating ? "w-full h-full" : "w-full lg:flex-1 h-[50vh] lg:h-full"}`}>

            {/* FLOAT BOX: STATS DASHBOARD */}
            <div className="absolute top-4 right-4 z-[500] bg-[#0b0f14]/90 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl min-w-[200px]">
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Trip Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">Total Dist</span>
                  <span className="font-mono text-white">{stats?.distance || 0} km</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">Total Time</span>
                  <span className="font-mono text-emerald-400">{stats?.duration || 0} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">Stops</span>
                  <span className="font-mono text-blue-400">{stops.length}</span>
                </div>
              </div>
            </div>

            {/* FLOAT BOX: ROAD ISSUES */}
            {roadIssues.length > 0 && (
              <div className="absolute bottom-4 left-4 z-[500] max-w-xs max-h-[30vh] overflow-y-auto custom-scrollbar flex flex-col gap-2">
                {roadIssues.map(issue => (
                  <div
                    key={issue.id}
                    className={`
                                   bg-[#0b0f14]/90 backdrop-blur-md border px-4 py-3 rounded-xl shadow-lg flex items-start gap-3
                                   ${issue.severity === 'Critical' ? 'border-red-500/30' : 'border-amber-500/30'}
                               `}
                  >
                    <div className={`mt-0.5 p-1 rounded-full ${issue.severity === 'Critical' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'}`}>
                      <span className="text-xs">⚠️</span>
                    </div>
                    <div>
                      <div className={`font-bold text-sm ${issue.severity === 'Critical' ? 'text-red-400' : 'text-amber-400'}`}>
                        {issue.description}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <span>📍</span> {issue.location}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {routing && (
              <div className="absolute inset-0 z-50 bg-[#0b0f14]/80 backdrop-blur-sm flex items-center justify-center flex-col gap-4">
                <div className="relative">
                  <div className="animate-spin h-16 w-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-xs">🤖</div>
                </div>
                <div className="text-blue-400 font-bold tracking-wider animate-pulse">OPTIMIZING ROUTE...</div>
              </div>
            )}

            {/* NAV OVERLAY */}
            {isNavigating && currentInstruction && (
              <div className="absolute top-4 left-4 right-4 z-[500] pointer-events-none flex justify-center">
                <div className="bg-[#0b0f14]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 max-w-xl w-full pointer-events-auto flex items-center gap-4">
                  <div className="h-16 w-16 bg-blue-600 rounded-xl flex items-center justify-center text-3xl shadow-lg shadow-blue-900/50">
                    {getInstructionIcon(currentInstruction.type, currentInstruction.modifier)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-2xl font-black text-white leading-none mb-1">{currentInstruction.instruction}</div>
                    <div className="flex items-center gap-3">
                      <div className="bg-[#141922] px-2 py-0.5 rounded border border-white/5 text-blue-400 font-mono font-bold text-lg">
                        {(currentInstruction.distance / 1000).toFixed(1)} km
                      </div>
                      {currentInstruction.roadName && (
                        <div className="text-gray-400 font-medium truncate">
                          on <span className="text-white">{currentInstruction.roadName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <MapContainer
              center={DEFAULT_CENTER}
              zoom={OVERVIEW_ZOOM}
              className="h-full w-full bg-[#141922]"
              zoomControl={false}
              attributionControl={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              <NavigationZoom isNavigating={isNavigating} driverPos={driverLocation} />
              <MapBoundsFitter coords={routeCoords} stops={stops} driverPos={driverLocation} isNavigating={isNavigating} />

              {driverLocation && (
                <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon} />
              )}

              {stops.map((stop, idx) => (
                <Marker
                  key={stop.id}
                  position={[stop.lat, stop.lng]}
                  icon={stopIcon(idx + 1, stop.aiPriority || stop.priority)}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={1} className="custom-tooltip">
                    <div className="bg-[#1a1f29] text-white p-3 text-xs rounded-xl border border-white/10 shadow-xl">
                      <div className="font-bold mb-1 text-sm">Stop {idx + 1}</div>
                      <div className="text-gray-300">{stop.receiverName}</div>
                      {etas[idx] && <div className="text-emerald-400 font-mono mt-1">{etas[idx]} min away</div>}
                    </div>
                  </Tooltip>
                </Marker>
              ))}

              {routeCoords.length > 0 && (
                <>
                  <Polyline positions={routeCoords} color={currentModeColor} weight={8} opacity={0.4} />
                  <Polyline positions={routeCoords} color={currentModeColor} weight={4} opacity={0.9} />
                </>
              )}

              {roadIssues.map((issue) => (
                <Circle
                  key={issue.id}
                  center={[issue.latitude, issue.longitude]}
                  radius={issue.severity === "Critical" ? 500 : 300}
                  pathOptions={{
                    color: issue.severity === "Critical" ? "#ef4444" : "#f59e0b",
                    fillColor: issue.severity === "Critical" ? "#ef4444" : "#f59e0b",
                    fillOpacity: 0.2
                  }}
                />
              ))}
            </MapContainer>
          </div>

          {/* STOP LIST (Fixed Width Panel) */}
          <div className={`
                 bg-[#0b0f14] border-l border-white/5 flex flex-col transition-all duration-300 z-10
                 ${isNavigating ? "hidden w-0" : "flex w-full lg:w-[400px] h-[50vh] lg:h-full"}
             `}>
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#0b0f14]">
              <h3 className="font-bold text-gray-200">Delivery Sequence</h3>
              <button className="text-xs text-blue-400 hover:text-blue-300 hover:underline">View manifest</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {stops.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                  <span className="text-4xl mb-2 grayscale">📍</span>
                  <p>No stops assigned</p>
                </div>
              ) : (
                stops.map((stop, idx) => (
                  <div
                    key={stop.id}
                    onClick={() => setSelectedStop(stop)}
                    className="group bg-[#141922] p-4 rounded-xl border border-white/5 hover:border-white/20 transition-all hover:bg-[#1a1f29] relative overflow-hidden cursor-pointer"
                  >
                    {/* Progress Line */}
                    {idx !== stops.length - 1 && (
                      <div className="absolute left-7 top-14 bottom-0 w-0.5 bg-gray-800 group-hover:bg-gray-700 transition-colors"></div>
                    )}

                    <div className="flex gap-4 relative z-10">
                      {/* Number Badge */}
                      <div className={`
                                        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg
                                        ${(stop.aiPriority || stop.priority) >= 4 ? 'bg-rose-600 text-white' :
                          (stop.aiPriority || stop.priority) >= 3 ? 'bg-amber-500 text-black' :
                            'bg-blue-600 text-white'}
                                      `}>
                        {idx + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-gray-200 truncate group-hover:text-white transition-colors">{stop.receiverName}</h4>
                          <div className="flex flex-col items-end">
                            {etas[idx] && <span className="text-xs font-mono text-emerald-500">~{etas[idx]} min</span>}
                            <span className="text-[10px] text-blue-400 font-medium mt-0.5">+{getDistanceToStop(idx)} km</span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-500 truncate mb-3">{stop.receiverAddress}</p>

                        <div className="flex items-center gap-2 flex-wrap">
                          {stop.aiPriority && (
                            <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded font-medium">
                              AI Priority
                            </span>
                          )}
                          <span className="text-[10px] bg-gray-800 text-gray-400 border border-white/5 px-2 py-0.5 rounded">
                            #{stop.trackingId || stop.id}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* CUSTOMER DETAIL MODAL */}
        {selectedStop && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-[#0b0f14]/80 backdrop-blur-sm"
              onClick={() => setSelectedStop(null)}
            />

            <div className="bg-[#141922] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden transform animate-in fade-in zoom-in duration-300">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#0b0f14]/50">
                <h3 className="text-xl font-bold text-white">Customer Details</h3>
                <button
                  onClick={() => setSelectedStop(null)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Summary Info */}
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center text-3xl shrink-0">
                    👤
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-white">{selectedStop.receiverName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-gray-800 text-gray-400 border border-white/5 px-2 py-0.5 rounded">
                        #{selectedStop.trackingId}
                      </span>
                      {selectedStop.isAsr ? (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                          <span>✓</span> ASR VERIFIED
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-bold">
                          NOT ASR VERIFIED
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Fields */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-[#0b0f14] p-4 rounded-xl border border-white/5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Delivery Address</label>
                    <p className="text-gray-200 text-sm leading-relaxed">{selectedStop.receiverAddress}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#0b0f14] p-4 rounded-xl border border-white/5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Contact Number</label>
                      <p className="text-gray-200 text-sm">{selectedStop.receiverPhone || 'Not provided'}</p>
                    </div>
                    <div className="bg-[#0b0f14] p-4 rounded-xl border border-white/5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Status</label>
                      <span className="text-emerald-400 text-sm font-bold uppercase">{selectedStop.status}</span>
                    </div>
                  </div>

                  {selectedStop.aiJustification && (
                    <div className="bg-purple-500/5 p-4 rounded-xl border border-purple-500/10">
                      <label className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block mb-1">AI Routing Note</label>
                      <p className="text-gray-300 text-xs italic leading-relaxed">{selectedStop.aiJustification}</p>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <button
                  onClick={() => setSelectedStop(null)}
                  className="w-full py-3 bg-white text-[#0b0f14] font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-lg"
                >
                  Back to Route
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}