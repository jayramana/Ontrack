// frontend/src/pages/driver/RouteView.jsx
import { useState, useEffect } from "react";
import api from "../../services/api";
import MapComponent from "../../components/MapComponent";
import DriverSidebar from "./DriverSidebar";
import { useAuth } from "../../context/AuthContext"; // added for header/logout

export default function RouteView() {
  const { user, logout } = useAuth(); // added
  const [stops, setStops] = useState([]);

  const [currentLocation] = useState({
    latitude: 13.0827,
    longitude: 80.2707,
    speed: 0,
    heading: 0,
  });

  const fetchRoute = async () => {
    try {
      const res = await api.get("/driver/route/optimized");
      setStops(res.data);
    } catch (err) {
      console.error("Route fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchRoute();
  }, []);

  const markers = stops.map((stop) => ({
    position: [stop.latitude, stop.longitude],
    popup: `Stop #${stop.sequenceNumber} - ${
      stop.order ? stop.order.receiverAddress : "Pickup"
    }`,
  }));

  markers.push({
    position: [currentLocation.latitude, currentLocation.longitude],
    popup: "My Location",
  });

  const polyline = stops.map((stop) => [stop.latitude, stop.longitude]);
  if (stops.length > 0) {
    polyline.unshift([currentLocation.latitude, currentLocation.longitude]);
  }

  return (
    <div className="min-h-screen flex bg-[#f8f4ef]">
      {/* SIDEBAR */}
      <DriverSidebar active="routeview" />

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#351c15]">My Route</h1>
              <p className="text-sm text-[#6b4f3a] mt-1">View your full optimized route</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-gray-500">Driver</p>
                <p className="font-semibold text-[#351c15]">
                  {user?.first_name || user?.name || "Unknown"}
                </p>
              </div>

              <button
                onClick={logout}
                className="px-4 py-2 bg-[#351c15] hover:bg-[#2b160f] text-white rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-10 overflow-auto">
          {/* PAGE HEADER */}
          <div className="mb-6">
            <h2 className="text-3xl font-extrabold text-[#351c15]">Route Overview</h2>
            <p className="text-gray-600 mt-1">Your optimized stops and live position</p>
          </div>

          {/* MAP SECTION */}
          <div className="bg-white rounded-xl shadow border border-[#e2d6c6] p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#351c15]">Route Map</h3>
              <div className="text-sm text-[#6b4f3a]">
                {stops.length} stops • Centered on current position
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-[#d8c9b8] h-[480px]">
              <MapComponent
                center={[currentLocation.latitude, currentLocation.longitude]}
                zoom={13}
                markers={markers}
                polyline={polyline}
              />
            </div>
          </div>

          {/* STOPS LIST */}
          <div className="bg-white rounded-xl shadow border border-[#e2d6c6] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#351c15]">Stops List</h3>
              <div className="text-sm text-[#6b4f3a]">Optimized sequence</div>
            </div>

            {stops.length === 0 ? (
              <div className="text-center py-6 text-gray-500">No stops found for today</div>
            ) : (
              <ul className="space-y-3">
                {stops.map((stop) => (
                  <li
                    key={stop.id}
                    className="p-4 bg-[#fdfbf7] border border-[#e2d6c6] rounded-lg shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-[#351c15]">Stop #{stop.sequenceNumber}</p>
                        <p className="text-gray-700">
                          {stop.order ? stop.order.receiverAddress : "Pickup"}
                        </p>
                        {stop.estimatedArrival && (
                          <p className="text-sm text-gray-500 mt-1">
                            ETA:{" "}
                            {new Date(stop.estimatedArrival).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-gray-400">Priority</p>
                        <p className="font-semibold text-[#351c15]">{stop.priority ?? "-"}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
