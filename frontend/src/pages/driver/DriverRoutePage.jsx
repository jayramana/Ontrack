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
        const status = err.response?.status;
        const msg = err.response?.data?.message || err.message;
        setError(`Failed to load: ${status || 'Unknown'} - ${msg}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // OSRM helper
  const fetchOsrmRoute = async (stops) => {
    const valid = stops.every((s) => isValidCoord(s.lat, s.lng));
    if (!valid) throw new Error("Invalid coordinates in stops.");

    const coordsStr = stops.map((s) => `${s.lng},${s.lat}`).join(";");
    const url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`;

    const res = await fetch(url);
    const data = await res.json();

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
  };

  // Preview selected route
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
      setError(err.message || "Failed to calculate route.");
      setRouteCoords([]);
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
            <p className="font-semibold">{user?.first_name + " " + user?.last_name || "Unknown"}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT PANEL */}
        <div className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-800 px-3 py-2 rounded">
              ⚠️ {error}
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