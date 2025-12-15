import { useEffect, useState, useMemo } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Tooltip,
  Circle,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import DriverSidebar from "./DriverSidebar";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

// Warning icon
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

// Delivery icon
const createDeliveryIcon = (number, priority) => {
  const colors = {
    5: "#dc2626",
    4: "#ea580c",
    3: "#eab308",
    2: "#3b82f6",
    1: "#22c55e",
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

const DEFAULT_CENTER = [13.0827, 80.2707];

const isValidCoord = (lat, lng) =>
  typeof lat === "number" &&
  typeof lng === "number" &&
  !isNaN(lat) &&
  !isNaN(lng) &&
  lat !== 0 &&
  lng !== 0;

// Distance formula
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Weighted nearest neighbor
const nearestNeighborRoute = (stops) => {
  if (!stops.length) return [];

  const unvisited = [...stops];
  const route = [];

  const startIdx = unvisited.findIndex(
    (s) => s.priority === Math.max(...unvisited.map((x) => x.priority))
  );

  let current = unvisited.splice(startIdx, 1)[0];
  route.push(current);

  while (unvisited.length) {
    let best = 0;
    let minScore = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const d = calculateDistance(
        current.lat,
        current.lng,
        unvisited[i].lat,
        unvisited[i].lng
      );

      const score = d / (unvisited[i].priority || 1);

      if (score < minScore) {
        minScore = score;
        best = i;
      }
    }

    current = unvisited.splice(best, 1)[0];
    route.push(current);
  }

  return route;
};

// 2-opt optimization
const twoOptOptimization = (route) => {
  if (route.length < 4) return route;

  let improved = true;
  const firstStop = route[0];
  let working = route.slice(1);

  while (improved) {
    improved = false;

    for (let i = 0; i < working.length - 2; i++) {
      for (let j = i + 2; j < working.length; j++) {
        const A = working[i];
        const B = working[i + 1];
        const C = working[j];
        const D = working[j + 1] || working[0];

        const current =
          calculateDistance(A.lat, A.lng, B.lat, B.lng) +
          calculateDistance(C.lat, C.lng, D.lat, D.lng);

        const swapped =
          calculateDistance(A.lat, A.lng, C.lat, C.lng) +
          calculateDistance(B.lat, B.lng, D.lat, D.lng);

        if (swapped < current) {
          working = [
            ...working.slice(0, i + 1),
            ...working.slice(i + 1, j + 1).reverse(),
            ...working.slice(j + 1),
          ];
          improved = true;
        }
      }
    }
  }

  return [firstStop, ...working];
};

const isNearRoadIssue = (stop, issues, threshold = 2) =>
  issues.some((i) => {
    if (!isValidCoord(i.latitude, i.longitude)) return false;
    const d = calculateDistance(stop.lat, stop.lng, i.latitude, i.longitude);
    return d < threshold;
  });

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

  // Load initial data
  useEffect(() => {
    const load = async () => {
      try {
        const [routeRes, issuesRes] = await Promise.all([
          api.get("/driver/route/optimized"),
          api.get("/driver/road-issues"),
        ]);

        const orders = routeRes.data || [];
        setOrders(orders);

        const issues = issuesRes.data || [];
        setRoadIssues(issues);

        const stops = orders
          .map((o) => {
            const lat = Number(o.deliveryLatitude ?? o.pickupLatitude);
            const lng = Number(o.deliveryLongitude ?? o.pickupLongitude);

            if (!isValidCoord(lat, lng)) return null;

            return {
              id: o.id,
              orderId: o.id,
              lat,
              lng,
              index: o.index,
              priority: o.aiPriority || o.priority || 2,
              address: o.receiverAddress || o.pickupAddress,
              windowStart: o.scheduledDate,
              receiverName: o.receiverName || "Customer",
            };
          })
          .filter(Boolean);

        if (!stops.length) {
          setError("No valid stops found");
          return;
        }

        setMapCenter([stops[0].lat, stops[0].lng]);

        // Build route strategies
        const nn = nearestNeighborRoute([...stops]);
        const optimized = twoOptOptimization(nn);

        const priorityRoute = [...stops].sort((a, b) => b.priority - a.priority);

        const timeWindowRoute = [...stops].sort((a, b) => {
          if (a.windowStart && b.windowStart)
            return new Date(a.windowStart) - new Date(b.windowStart);
          return b.priority - a.priority;
        });

        const safe = stops.filter((s) => !isNearRoadIssue(s, issues));
        const risky = stops.filter((s) => isNearRoadIssue(s, issues));

        const avoidIssuesRoute = [...safe, ...risky];

        const options = [
          {
            id: "ai",
            label: "🎯 AI Optimized Route",
            description: "Best balance of distance + priority",
            stops: optimized,
          },
          {
            id: "priority",
            label: "⭐ Priority First",
            description: "Deliver high priority first",
            stops: priorityRoute,
          },
          {
            id: "time",
            label: "⏰ Time Windows",
            description: "Schedules first",
            stops: timeWindowRoute,
          },
          {
            id: "issues",
            label: "🚧 Avoid Road Issues",
            description: "Skips blocked areas first",
            stops: avoidIssuesRoute,
          },
        ];

        setRouteOptions(options);

        await previewRoute(0, options);
      } catch (err) {
        setError("Failed to load route");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // // OSRM routing
  // const fetchOsrmRoute = async (stops) => {
  //   const coordinates = stops.map((s) => `${s.lng},${s.lat}`).join(";");
  //   const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;

  //   const res = await fetch(url);
  //   const json = await res.json();

  //   const route = json.routes?.[0];
  //   if (!route) throw new Error("OSRM failed");

  //   const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

  //   setRouteStats({
  //     distance: (route.distance / 1000).toFixed(1),
  //     duration: Math.round(route.duration / 60),
  //   });

  //   return coords;
  // };

  // OSRM routing (via backend proxy)
const fetchOsrmRoute = async (stops) => {
  if (!stops || stops.length < 2) {
    throw new Error("At least 2 stops required");
  }

  // Build coordinates string
  const coordinates = stops.map((s) => `${s.lng},${s.lat}`).join(";");

  // Extract start & end (OSRM backend expects only start & end)
  const points = coordinates.split(";");

  const [startLng, startLat] = points[0].split(",");
  const [endLng, endLat] = points[points.length - 1].split(",");

  // ✅ CALL YOUR BACKEND (NO CORS)
  const url =
    `http://localhost:5066/api/route/osrm` +
    `?startLng=${startLng}` +
    `&startLat=${startLat}` +
    `&endLng=${endLng}` +
    `&endLat=${endLat}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Route API failed");

  const json = await res.json();

  const route = json.routes?.[0];
  if (!route) throw new Error("OSRM failed");

  // Convert [lng, lat] → [lat, lng] for Leaflet
  const coords = route.geometry.coordinates.map(
    ([lng, lat]) => [lat, lng]
  );

  // Route stats
  setRouteStats({
    distance: (route.distance / 1000).toFixed(1), // km
    duration: Math.round(route.duration / 60),    // minutes
  });

  return coords;
};


  const previewRoute = async (index, opts = null) => {
    try {
      setLoadingRoute(true);
      const option = (opts || routeOptions)[index];

      const coords = await fetchOsrmRoute(option.stops);
      setRouteCoords(coords);

      setMapCenter(coords[Math.floor(coords.length / 2)]);
    } catch (err) {
      setError("Route calculation failed");
      setRouteCoords([]);
    } finally {
      setLoadingRoute(false);
    }
  };

  const selectedOption = useMemo(
    () => routeOptions[selectedOptionIndex],
    [routeOptions, selectedOptionIndex]
  );

  const getSeverityColor = (s) =>
    ({
      Critical: "#dc2626",
      High: "#ea580c",
      Medium: "#eab308",
      Low: "#3b82f6",
    }[s] || "#6b7280");

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-[#351c15]">
        Loading route…
      </div>
    );

  return (
    <div className="flex min-h-screen bg-[#f7f3ef]">
      <DriverSidebar active="route" />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        {/* UPS HEADER */}
        <header className="bg-[#fff8e7] border-b border-[#e6ddc5] p-5 flex justify-between items-center shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-[#351c15]">
              🗺️ Driver Route Planner
            </h1>
            <p className="text-[#6f4e37] text-sm">
              AI routing + real-time road issue avoidance
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-[#6f4e37]">Driver</p>
            <p className="font-semibold text-[#351c15]">
              {user?.first_name} {user?.last_name}
            </p>
          </div>
        </header>

        {/* MAIN GRID */}
        <main className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT PANEL */}
          <div className="space-y-6">
            {/* ERROR */}
            {error && (
              <div className="bg-red-100 border border-red-300 text-red-800 p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* ROUTE STATS CARD */}
            {routeStats && (
              <div className="bg-[#fff8e7] border border-[#e6ddc5] p-5 rounded-xl shadow">
                <h3 className="text-sm font-semibold text-[#351c15] mb-3">
                  Route Summary
                </h3>

                <div className="grid grid-cols-2">
                  <div>
                    <p className="text-2xl font-bold text-[#351c15]">
                      {routeStats.distance} km
                    </p>
                    <p className="text-xs text-[#6f4e37]">Distance</p>
                  </div>

                  <div>
                    <p className="text-2xl font-bold text-[#351c15]">
                      {routeStats.duration} min
                    </p>
                    <p className="text-xs text-[#6f4e37]">Duration</p>
                  </div>
                </div>
              </div>
            )}

            {/* ROUTE OPTIONS */}
            <div className="bg-[#fff8e7] border border-[#e6ddc5] p-5 rounded-xl shadow">
              <h2 className="text-lg font-semibold text-[#351c15] mb-3">
                📦 Route Options
              </h2>

              {routeOptions.map((opt, idx) => (
                <div
                  key={opt.id}
                  onClick={() => {
                    setSelectedOptionIndex(idx);
                    previewRoute(idx);
                  }}
                  className={`border-2 rounded-lg p-4 mb-3 cursor-pointer transition ${
                    selectedOptionIndex === idx
                      ? "border-[#f9b400] bg-[#f9b400]/20"
                      : "border-[#e6ddc5] bg-white hover:bg-[#fff8e7]"
                  }`}
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold text-[#351c15]">
                        {opt.label}
                      </p>
                      <p className="text-xs text-[#6f4e37]">
                        {opt.description}
                      </p>
                    </div>

                    <span className="text-xs bg-[#fff8e7] border border-[#e6ddc5] px-2 py-1 rounded">
                      {opt.stops.length} stops
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* STOP LIST */}
            {selectedOption && (
              <div className="bg-[#fff8e7] border border-[#e6ddc5] p-5 rounded-xl shadow max-h-[350px] overflow-y-auto">
                <h2 className="text-lg font-semibold text-[#351c15] mb-3">
                  📍 Delivery Sequence
                </h2>

                <ol className="space-y-4">
                  {selectedOption.stops.map((stop, i) => {
                    const near = isNearRoadIssue(stop, roadIssues);

                    return (
                      <li key={stop.id} className="flex gap-3">
                        <span
                          className="h-7 w-7 flex items-center justify-center rounded-full text-white text-xs font-bold"
                          style={{
                            background:
                              stop.priority === 5
                                ? "#dc2626"
                                : stop.priority === 4
                                ? "#ea580c"
                                : stop.priority === 3
                                ? "#eab308"
                                : "#3b82f6",
                          }}
                        >
                          {i + 1}
                        </span>

                        <div>
                          <p className="font-medium text-sm text-[#351c15]">
                            Order #{stop.orderId}
                          </p>

                          {near && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 rounded">
                              ⚠️ Near Issue
                            </span>
                          )}

                          <p className="text-xs text-[#6f4e37]">
                            {stop.receiverName}
                          </p>

                          <p className="text-xs text-[#6f4e37] truncate">
                            {stop.address}
                          </p>

                          <p className="text-xs text-[#351c15] font-medium">
                            Priority: {stop.priority}/5
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}
          </div>

          {/* MAP SECTION */}
          <div className="lg:col-span-2">
            <div
              className="bg-[#fff8e7] border border-[#e6ddc5] rounded-xl shadow overflow-hidden"
              style={{ height: "600px" }}
            >
              {loadingRoute && (
                <div className="absolute top-4 right-4 bg-white shadow px-3 py-2 rounded text-xs">
                  Calculating route…
                </div>
              )}

              <MapContainer
                center={mapCenter}
                zoom={12}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {/* Stops */}
                {selectedOption?.stops.map((stop, i) => (
                  <Marker
                    key={stop.id}
                    position={[stop.lat, stop.lng]}
                    icon={createDeliveryIcon(i + 1, stop.priority)}
                  >
                    <Tooltip>
                      <div className="text-xs">
                        <strong>Stop {i + 1}</strong> — Order #{stop.orderId}
                        <br />
                        Priority: {stop.priority}
                        <br />
                        {stop.receiverName}
                        <br />
                        {stop.address}
                      </div>
                    </Tooltip>
                  </Marker>
                ))}

                {/* Route polyline */}
                {routeCoords.length > 1 && (
                  <Polyline
                    positions={routeCoords}
                    color="#351c15"
                    weight={4}
                    opacity={0.8}
                  />
                )}

                {/* Road issues */}
                {roadIssues.map((issue) =>
                  isValidCoord(issue.latitude, issue.longitude) ? (
                    <div key={issue.id}>
                      <Circle
                        center={[issue.latitude, issue.longitude]}
                        radius={
                          issue.severity === "Critical"
                            ? 1500
                            : issue.severity === "High"
                            ? 1000
                            : 500
                        }
                        pathOptions={{
                          color: getSeverityColor(issue.severity),
                          fillColor: getSeverityColor(issue.severity),
                          fillOpacity: 0.15,
                        }}
                      />

                      <Marker
                        position={[issue.latitude, issue.longitude]}
                        icon={warningIcon}
                      >
                        <Tooltip>
                          <div className="text-xs">
                            <strong
                              style={{ color: getSeverityColor(issue.severity) }}
                            >
                              ⚠️ {issue.issueType}
                            </strong>
                            <br />
                            Severity: {issue.severity}
                            <br />
                            {issue.description}
                          </div>
                        </Tooltip>
                      </Marker>
                    </div>
                  ) : null
                )}
              </MapContainer>
            </div>

            {/* LEGEND */}
            <div className="bg-[#fff8e7] border border-[#e6ddc5] rounded-xl shadow p-5 mt-6 text-xs">
              <h3 className="font-semibold text-[#351c15] mb-3">Legend</h3>

              <div className="grid grid-cols-2 gap-3 text-[#6f4e37]">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-600"></div>
                  Critical Issue
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-orange-600"></div>
                  High Issue
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                  Medium Issue
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                  Low Issue
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DriverRoutePage;
