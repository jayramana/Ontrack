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

/* ===============================
   LEAFLET FIX
================================ */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

/* ===============================
   CONSTANTS
================================ */
const TN_BOUNDS = L.latLngBounds([8.0, 76.0], [13.6, 80.4]);
const DEFAULT_CENTER = [11.1271, 78.6569];

const ROUTE_MODES = [
  { id: "Balanced", label: "🎯 Balanced", desc: "Distance + priority" },
  { id: "PriorityFirst", label: "⭐ Priority First", desc: "High priority first" },
  { id: "TimeWindow", label: "⏰ Time Window", desc: "Rescheduled first" },
  { id: "AvoidIssues", label: "🚧 Avoid Issues", desc: "Avoid risky areas" },
];

const STORAGE_KEY = "driverPreferredRouteMode";

/* ===============================
   HELPERS
================================ */
const isValidTN = (lat, lng) =>
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  lat >= 8 &&
  lat <= 13.6 &&
  lng >= 76 &&
  lng <= 80.4;

/* ===============================
   STOP ICON
================================ */
const stopIcon = (num) =>
  L.divIcon({
    html: `<div style="
      background:#2563eb;color:white;width:28px;height:28px;
      border-radius:50%;display:flex;align-items:center;
      justify-content:center;font-weight:bold;border:2px solid white;">
      ${num}
    </div>`,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });

/* ===============================
   MAP FITTER
================================ */
function MapBoundsFitter({ routeCoords, stops }) {
  const map = useMap();
  useEffect(() => {
    const pts = [];

    routeCoords.forEach(([lat, lng]) => isValidTN(lat, lng) && pts.push([lat, lng]));
    stops.forEach((s) => isValidTN(s.lat, s.lng) && pts.push([s.lat, s.lng]));

    if (pts.length > 1) {
      const b = L.latLngBounds(pts).pad(0.15);
      map.fitBounds(b.intersects(TN_BOUNDS) ? b : TN_BOUNDS);
    }
  }, [routeCoords, stops, map]);

  return null;
}

/* ===============================
   ROUTE API
================================ */
async function fetchRoute(stops, issues, mode, signal) {
  const payload = {
    stops: stops.map((s) => ({
      lat: s.lat,
      lng: s.lng,
      priority: s.priority,
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

/* ===============================
   MAIN COMPONENT
================================ */
export default function DriverRoutePage() {
  const { user } = useAuth();
  const abortRef = useRef(null);

  const [stops, setStops] = useState([]);
  const [roadIssues, setRoadIssues] = useState([]);
  const [routeCoords, setRouteCoords] = useState([]);
  const [etas, setEtas] = useState([]);

  const [selectedMode, setSelectedMode] = useState(
    localStorage.getItem(STORAGE_KEY) || "Balanced"
  );

  const [stats, setStats] = useState(null);
  const [routing, setRouting] = useState(false);

  /* ===============================
     LOAD DATA
  ================================ */
  useEffect(() => {
    (async () => {
      const [r1, r2] = await Promise.all([
        api.get("/driver/route/optimized"),
        api.get("/driver/road-issues"),
      ]);

      const mappedStops = r1.data
        .map((o) => ({
          id: o.id,
          lat: Number(o.deliveryLatitude ?? o.pickupLatitude),
          lng: Number(o.deliveryLongitude ?? o.pickupLongitude),
          priority: o.priority ?? 2,
          receiverName: o.receiverName,
          windowStart: o.scheduledDate,
        }))
        .filter((s) => isValidTN(s.lat, s.lng));

      setStops(mappedStops);
      setRoadIssues(r2.data);
    })();
  }, []);

  const calculateRoute = async () => {
    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;

    setRouting(true);

    const { coords, duration, distance } = await fetchRoute(
      stops,
      roadIssues,
      selectedMode,
      controller.signal
    );

    setRouteCoords(coords);
    setStats({
      km: (distance / 1000).toFixed(1),
      min: Math.round(duration / 60),
    });

    /* ETA PER STOP */
    const perStop = Math.round(duration / stops.length);
    setEtas(stops.map((_, i) => Math.round(((i + 1) * perStop) / 60)));

    setRouting(false);
  };
  
  useEffect(() => {
    if (stops.length >= 2) {
      calculateRoute();
    }
  }, [roadIssues, selectedMode]);

  const onModeSelect = (mode) => {
    localStorage.setItem(STORAGE_KEY, mode);
    setSelectedMode(mode);
  };

  return (
    <div className="flex min-h-screen">
      <DriverSidebar active="route" />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">🗺 Driver Route Planner</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT */}
          <div>
            {ROUTE_MODES.map((m) => (
              <div
                key={m.id}
                onClick={() => onModeSelect(m.id)}
                className={`p-3 mb-2 border rounded cursor-pointer ${
                  selectedMode === m.id ? "bg-yellow-100" : ""
                }`}
              >
                <div>{m.label}</div>
                <div className="text-xs text-gray-500">{m.desc}</div>
              </div>
            ))}

            {stats && (
              <div className="mt-4 p-4 bg-white shadow rounded">
                <div>{stats.km} km</div>
                <div>{stats.min} min</div>
              </div>
            )}
          </div>

          {/* MAP */}
          <div className="lg:col-span-2 h-[600px] bg-white shadow rounded">
            <MapContainer center={DEFAULT_CENTER} zoom={12} style={{ height: "100%" }}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
              <MapBoundsFitter routeCoords={routeCoords} stops={stops} />

              {stops.map((s, i) => (
                <Marker key={s.id} position={[s.lat, s.lng]} icon={stopIcon(i + 1)}>
                  <Tooltip>
                    Stop {i + 1}
                    <br />
                    ETA: {etas[i]} min
                  </Tooltip>
                </Marker>
              ))}

              {routeCoords.length > 1 && (
                <Polyline positions={routeCoords} color="#111827" />
              )}

              {roadIssues.map((i, idx) => (
                <Circle
                  key={idx}
                  center={[i.latitude, i.longitude]}
                  radius={800}
                  pathOptions={{ color: "#dc2626", fillOpacity: 0.2 }}
                />
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}