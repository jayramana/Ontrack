import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Tooltip } from "react-leaflet";
import L from "leaflet";
import * as signalR from "@microsoft/signalr";
import api from "../../services/api";
import AdminSidebar from "./AdminSidebar";

const driverIcon = L.divIcon({
  html: "🚚",
  iconSize: [32, 32],
  className: "",
});

export default function AdminLiveDriversMap() {
  const [drivers, setDrivers] = useState({});
  const [routes, setRoutes] = useState({});
  const hubRef = useRef(null);

  /* ---------------- SIGNALR ---------------- */
  useEffect(() => {
    const hub = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5066/hubs/logistics")
      .withAutomaticReconnect()
      .build();

    hub.on("ReceiveDriverLocation", async (data) => {
      setDrivers((prev) => ({
        ...prev,
        [data.driverId]: {
          lat: data.latitude,
          lng: data.longitude,
          updatedAt: data.updatedAt,
        },
      }));

      // Load route once per driver
      if (!routes[data.driverId]) {
        const res = await api.get(`/route/admin/driver/${data.driverId}/route`);
        setRoutes((prev) => ({
          ...prev,
          [data.driverId]: res.data.map(p => [p.lat, p.lng]),
        }));
      }
    });

    hub.start().then(() => hub.invoke("JoinAdminGroup"));
    hubRef.current = hub;

    return () => hub.stop();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f8f4ef]">
      <AdminSidebar active="liveDrivers" />

      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-[#351c15] mb-4">
          🚦 Live Driver Tracking
        </h1>

        <div className="h-[600px] bg-white rounded-xl shadow border">
          <MapContainer center={[11.1, 78.6]} zoom={7} style={{ height: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors"
            />

            {Object.entries(drivers).map(([id, d]) => (
              <Marker key={id} position={[d.lat, d.lng]} icon={driverIcon}>
                <Tooltip>
                  <div className="text-xs">
                    <strong>Driver #{id}</strong>
                    <br />
                    Updated: {new Date(d.updatedAt).toLocaleTimeString()}
                  </div>
                </Tooltip>
              </Marker>
            ))}

            {Object.entries(routes).map(([id, coords]) => (
              <Polyline
                key={id}
                positions={coords}
                color="#2563eb"
                weight={4}
                opacity={0.6}
              />
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
