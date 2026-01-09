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
import { formatStatus } from "../../lib/utils";
import {
  MapPin,
  Navigation,
  ArrowLeft,
  ArrowRight,
  CornerUpLeft,
  CornerUpRight,
  ArrowUpLeft,
  ArrowUpRight,
  Merge,
  Split,
  AlertTriangle,
  ArrowUp,
  RotateCw,
  Target,
  User,
  X,
  CheckCircle,
  Bot,
  Car,
  Square,
  Play,
  Volume2,
  VolumeX,
  Star,
  Clock,
  ShieldAlert
} from "lucide-react";

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
  { id: "Balanced", label: "Balanced", icon: Target, color: "#3b82f6", desc: "Distance + Priority" },
  { id: "PriorityFirst", label: "Priority", icon: Star, color: "#dc2626", desc: "Highest priority first" },
  { id: "TimeWindow", label: "Time Window", icon: Clock, color: "#f59e0b", desc: "Scheduled times first" },
  { id: "AvoidIssues", label: "Avoid Issues", icon: ShieldAlert, color: "#10b981", desc: "Safest routes" },
  { id: "AIOptimized", label: "AI Optimized", icon: Bot, color: "#8b5cf6", desc: "Shortest total distance" },
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
  const iconProps = { size: 32, className: "text-white" };

  if (type === "turn") {
    if (modifier?.includes("sharp left")) return <ArrowLeft {...iconProps} />;
    if (modifier?.includes("sharp right")) return <ArrowRight {...iconProps} />;
    if (modifier?.includes("left")) return <CornerUpLeft {...iconProps} />;
    if (modifier?.includes("right")) return <CornerUpRight {...iconProps} />;
    if (modifier?.includes("slight left")) return <ArrowUpLeft {...iconProps} />;
    if (modifier?.includes("slight right")) return <ArrowUpRight {...iconProps} />;
  }

  const icons = {
    depart: <Navigation {...iconProps} />,
    arrive: <MapPin {...iconProps} />,
    merge: <Merge {...iconProps} />,
    "on ramp": <Merge {...iconProps} />,
    "off ramp": <Split {...iconProps} />,
    fork: <Split {...iconProps} />,
    "end of road": <AlertTriangle {...iconProps} />,
    continue: <ArrowUp {...iconProps} />,
    roundabout: <RotateCw {...iconProps} />,
    rotary: <RotateCw {...iconProps} />,
  };

  return icons[type] || <ArrowRight {...iconProps} />;
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
  ">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M17 12H5"/></svg>
  </div>`,
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
  const res = await api.get("/driver/orders/today/full");
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
    <div className="flex h-screen bg-[#0b0f14] text-white overflow-hidden font-sans" style={{ backgroundImage: 'none', backgroundColor: '#0b0f14' }}>
      <DriverSidebar active="route" />

      <div
        className="flex-1 flex flex-col h-screen overflow-hidden relative"
      >
        {/* HEADER */}
        <header
          className="sticky top-0 z-40 bg-[#0b0f14] border-b border-white/10 shadow-lg flex-shrink-0"
        >
          <div className="px-4 md:px-6 py-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="md:pl-0 pl-12 flex items-center gap-3">
                {/* <div className="p-2 bg-[#1a1f29] border border-white/10 rounded-xl shadow-lg md:flex hidden">
                  <span className="text-xl text-[#ff8a3d]">🗺️</span>
                </div> */}
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">Navigation</h1>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isNavigating ? "bg-emerald-400" : "bg-gray-400"}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isNavigating ? "bg-emerald-500" : "bg-gray-500"}`}></span>
                </span>
                <span className="text-[10px] md:text-xs font-bold text-gray-400">{isNavigating ? "Active" : "Idle"}</span>
              </div>

              {isNavigating ? (
                <button
                  onClick={stopNavigation}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-3 md:px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-all flex items-center gap-2 shadow-lg shadow-red-900/10"
                >
                  <Square size={16} fill="currentColor" /> <span className="md:inline hidden">Stop</span>
                </button>
              ) : (
                <button
                  onClick={startNavigation}
                  disabled={!routeCoords.length || routing}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 md:px-6 py-2 rounded-xl font-bold text-xs md:text-sm transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 flex items-center gap-2"
                >
                  <Play size={16} fill="currentColor" /> <span className="md:inline hidden">Start</span>
                </button>
              )}

              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`p-2 rounded-xl border transition-all ${voiceEnabled
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 shadow-lg shadow-blue-900/10"
                  : "bg-white/5 text-gray-500 border-white/5"
                  }`}
              >
                {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
            </div>
          </div>
        </header>

        {/* MODE SELECTOR */}
        <div className={`px-6 pt-2 pb-4 border-b border-white/5 bg-[#0b0f14] transition-all duration-300 ${isNavigating ? "hidden" : "block"}`}>
          <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
            {ROUTE_MODES.map((m) => {
              const isActive = mode === m.id;
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => handleModeChange(m.id)}
                  disabled={routing}
                  className={`
                                 flex flex-col min-w-[140px] px-4 py-3 rounded-2xl border transition-all duration-300 relative overflow-hidden
                                 ${isActive
                      ? "bg-[#1a1f29] border-[#ff8a3d] shadow-lg shadow-[#ff8a3d]/10 scale-[1.02]"
                      : "bg-[#141922] border-white/5 hover:bg-[#1a1f29] hover:border-white/10"
                    }
                             `}
                >
                  {isActive && <div className="absolute top-0 left-0 w-full h-1 bg-[#ff8a3d]" />}
                  <span className={`text-2xl mb-2 block flex justify-center ${isActive ? "scale-110 text-[#ff8a3d]" : "grayscale opacity-50 text-gray-500"}`}>
                    <Icon size={24} />
                  </span>
                  <span className={`font-bold text-sm ${isActive ? "text-white" : "text-gray-400"}`}>{m.label}</span>
                  <span className="text-[10px] text-gray-500 mt-1 w-full text-center">{m.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* MAIN LAYOUT */}
        <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden relative">

          {/* MAP AREA */}
          <div className={`relative bg-[#141922] z-0 transition-all duration-500 flex-1 ${isNavigating ? "h-full" : "h-[50vh] lg:h-full"}`}>

            {/* FLOAT BOX: STATS DASHBOARD - MORE COMPACT */}
            <div className={`absolute top-4 right-4 z-[500] bg-[#1a1f29] border border-white/10 rounded-2xl p-4 shadow-2xl min-w-[180px] transition-all duration-300 ${isNavigating ? "opacity-0 pointer-events-none translate-y-[-10px]" : "opacity-100"}`}>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-500">Distance</span>
                    <span className="text-lg font-black text-white leading-none">{stats?.distance || 0}<span className="text-xs ml-0.5 text-gray-500">km</span></span>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-gray-500">Duration</span>
                    <span className="text-lg font-black text-emerald-400 leading-none">{stats?.duration || 0}<span className="text-xs ml-0.5 text-gray-500">min</span></span>
                  </div>
                </div>
                <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-500">Total Stops</span>
                  <span className="text-sm font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">{stops.length}</span>
                </div>
              </div>
            </div>

            {/* FLOAT BOX: ROAD ISSUES - REVERTED TO OVERLAY */}
            {roadIssues.length > 0 && (
              <div className={`absolute top-4 left-4 z-[500] max-w-xs max-h-[40vh] overflow-y-auto flex flex-col gap-2 transition-all duration-300 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent ${isNavigating ? "opacity-0 pointer-events-none translate-x-[-10px]" : "opacity-100"}`}>
                <div className="bg-[#1a1f29] border border-white/10 rounded-xl px-3 py-1.5 self-start mb-1 shadow-lg backdrop-blur-sm bg-opacity-90">
                  <span className="text-[10px] font-black text-amber-500">Road Alerts ({roadIssues.length})</span>
                </div>
                {roadIssues.map(issue => (
                  <div
                    key={issue.id}
                    className={`
                                   bg-[#1a1f29]/95 backdrop-blur-md border px-4 py-3 rounded-2xl shadow-xl flex items-start gap-3 transition-all
                                   ${issue.severity === 'Critical' ? 'border-red-500/30' : 'border-amber-500/30'}
                               `}
                  >
                    <div className={`mt-0.5 p-1.5 rounded-full shrink-0 ${issue.severity === 'Critical' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'}`}>
                      <AlertTriangle size={14} strokeWidth={3} />
                    </div>
                    <div>
                      <div className={`font-black text-xs ${issue.severity === 'Critical' ? 'text-red-400' : 'text-amber-400'}`}>
                        {issue.description}
                      </div>
                      <div className="text-[10px] text-slate-500 font-bold mt-1 flex items-center gap-1">
                        <MapPin size={10} className="opacity-50" /> {issue.location}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}


            {routing && (
              <div className="absolute inset-0 z-50 bg-[#0b0f14] flex items-center justify-center flex-col gap-4">
                <div className="relative">
                  <div className="animate-spin h-16 w-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-blue-500"><Bot size={24} /></div>
                </div>
                <div className="text-blue-400 font-bold animate-pulse">OPTIMIZING ROUTE...</div>
              </div>
            )}

            {/* NAV OVERLAY - MOVED TO BOTTOM FOR MOBILE ACCESSIBILITY */}
            {isNavigating && currentInstruction && (
              <div className="absolute bottom-6 left-4 right-4 z-[500] pointer-events-none flex justify-center animate-in slide-in-from-bottom-5 duration-300">
                <div className="bg-[#1a1f29] border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-5 max-w-xl w-full pointer-events-auto flex items-center gap-5">
                  <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-blue-900/50 shrink-0">
                    {getInstructionIcon(currentInstruction.type, currentInstruction.modifier)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xl md:text-2xl font-black text-white leading-tight mb-2 truncate">
                      {currentInstruction.instruction}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30 text-blue-400 font-mono font-black text-lg">
                        {(currentInstruction.distance / 1000).toFixed(1)} <span className="text-xs ml-0.5">km</span>
                      </div>
                      {currentInstruction.roadName && (
                        <div className="text-slate-400 font-bold truncate text-sm">
                          ON <span className="text-white">{currentInstruction.roadName}</span>
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
                 bg-[#0b0f14] border-l border-white/5 flex flex-col transition-all duration-500 z-10
                 ${isNavigating ? "hidden w-0" : "flex w-full lg:w-[420px] h-[50vh] lg:h-full"}
             `}>
            <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-[#0b0f14]">
              <div className="flex flex-col">
                <h3 className="font-black text-white text-sm">Delivery Sequence</h3>
                <span className="text-[10px] text-gray-500 font-bold mt-0.5">{stops.length} STOPS ASSIGNED</span>
              </div>
              <button className="text-xs font-black text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">Manifest</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0b0f14] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
              {stops.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-4xl mb-4 text-zinc-600"><MapPin size={48} /></div>
                  <p className="font-bold text-sm">No stops assigned</p>
                </div>
              ) : (
                stops.map((stop, idx) => (
                  <div
                    key={stop.id}
                    onClick={() => setSelectedStop(stop)}
                    className="group bg-[#27272a] p-4 rounded-xl border border-white/5 hover:border-white/20 hover:bg-[#3f3f46] transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-4">
                      {/* Number Badge */}
                      <div className={`
                                        flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm border border-white/5
                                        ${(stop.aiPriority || stop.priority) >= 4 ? 'bg-red-500/20 text-red-500' :
                          (stop.aiPriority || stop.priority) >= 3 ? 'bg-amber-500/20 text-amber-500' :
                            'bg-blue-500/20 text-blue-500'}
                                      `}>
                        {idx + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <h4 className="font-bold text-white truncate text-base">{stop.receiverName}</h4>
                          <span className="text-[10px] text-zinc-500 font-bold ml-2">+{getDistanceToStop(idx)} km</span>
                        </div>

                        <p className="text-xs text-zinc-400 truncate mb-2">{stop.receiverAddress}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {stop.aiPriority && (
                              <span className="text-[9px] font-bold text-[#a855f7]">
                                AI PRIORITY
                              </span>
                            )}
                            <span className="text-[9px] font-bold text-zinc-600">
                              #{stop.trackingId || stop.id}
                            </span>
                          </div>
                          {etas[idx] && <span className="text-[10px] font-bold text-emerald-500">~{etas[idx]} min</span>}
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
              className="absolute inset-0 bg-[#0b0f14]/90"
              onClick={() => setSelectedStop(null)}
            />

            <div className="bg-[#141922] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden transform animate-in fade-in zoom-in duration-300">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#0b0f14]">
                <h3 className="text-xl font-bold text-white">Customer Details</h3>
                <button
                  onClick={() => setSelectedStop(null)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Summary Info */}
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center shrink-0">
                    <User size={32} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-white">{selectedStop.receiverName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-gray-800 text-gray-400 border border-white/5 px-2 py-0.5 rounded">
                        #{selectedStop.trackingId}
                      </span>
                      {selectedStop.isAsr ? (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                          <CheckCircle size={12} /> ASR VERIFIED
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
                    <label className="text-[10px] font-bold text-gray-500 block mb-1">Delivery Address</label>
                    <p className="text-gray-200 text-sm leading-relaxed">{selectedStop.receiverAddress}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#0b0f14] p-4 rounded-xl border border-white/5">
                      <label className="text-[10px] font-bold text-gray-500 block mb-1">Contact Number</label>
                      <p className="text-gray-200 text-sm">{selectedStop.receiverPhone || 'Not provided'}</p>
                    </div>
                    <div className="bg-[#0b0f14] p-4 rounded-xl border border-white/5">
                      <label className="text-[10px] font-bold text-gray-500 block mb-1">Status</label>
                      <span className="text-emerald-400 text-sm font-bold">{formatStatus(selectedStop.status)}</span>
                    </div>
                  </div>

                  {selectedStop.aiJustification && (
                    <div className="bg-purple-500/5 p-4 rounded-xl border border-purple-500/10">
                      <label className="text-[10px] font-bold text-purple-400 block mb-1">AI Routing Note</label>
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