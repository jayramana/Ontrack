import { useState, useEffect } from "react";
import api from "../../services/api";
import MapComponent from "../../components/MapComponent";
import DriverSidebar from "./DriverSidebar";

export default function RouteView() {
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

      {/* MAIN CONTENT */}
      <div className="flex-1 p-10">

        {/* PAGE HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-[#351c15]">My Route</h1>
          <p className="text-gray-600">View your full optimized route</p>
        </div>

        {/* MAP SECTION */}
        <div className="bg-white rounded-xl shadow border border-[#e2d6c6] p-6 mb-8">
          <h2 className="text-xl font-bold text-[#351c15] mb-4">Route Map</h2>

          <div className="rounded-xl overflow-hidden border border-[#d8c9b8]">
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
          <h3 className="text-xl font-bold text-[#351c15] mb-4">Stops List</h3>

          {stops.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No stops found for today
            </div>
          ) : (
            <ul className="space-y-3">
              {stops.map((stop) => (
                <li
                  key={stop.id}
                  className="p-4 bg-[#fdfbf7] border border-[#e2d6c6] rounded-lg shadow-sm"
                >
                  <p className="font-bold text-[#351c15]">
                    Stop #{stop.sequenceNumber}
                  </p>

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
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
