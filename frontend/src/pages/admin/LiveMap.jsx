import { useState, useEffect } from "react";
import api from "../../services/api";
import MapComponent from "../../components/MapComponent";
import * as signalR from "@microsoft/signalr";
import AdminSidebar from "./AdminSidebar";

export default function LiveMap() {
  const [drivers, setDrivers] = useState([]);
  const [connection, setConnection] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get("/admin/dashboard");

      const normalizedDrivers = (response.data.drivers || []).map((d) => ({
        userId: Number(d.userId ?? d.id),
        userFName: d.userFName ?? "",
        userLName: d.userLName ?? "",
        isAvailable: d.isAvailable,
        currentLatitude: d.currentLatitude,
        currentLongitude: d.currentLongitude,
      }));

      setDrivers(normalizedDrivers);
    } catch (e) {
      console.error("Error fetching dashboard:", e);
    }
  };

  const setupSignalR = async () => {
    try {
      const conn = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:5066/hubs/logistics")
        .withAutomaticReconnect()
        .build();

      conn.on("ReceiveDriverLocation", (id, lat, lng) => {
        setDrivers((prev) =>
          prev.map((d) =>
            d.userId === id
              ? { ...d, currentLatitude: lat, currentLongitude: lng }
              : d
          )
        );
      });

      await conn.start();
      await conn.invoke("JoinAdminGroup");
      setConnection(conn);
    } catch (e) {
      console.error("SignalR error:", e);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    setupSignalR();

    return () => {
      if (connection) connection.stop();
    };
  }, []);

  const markers = drivers
    .filter((d) => d.currentLatitude && d.currentLongitude)
    .map((d) => ({
      position: [d.currentLatitude, d.currentLongitude],
      popup: `${d.userFName} ${d.userLName} (${d.isAvailable ? "Available" : "Busy"})`,
    }));

  return (
    <div className="min-h-screen flex bg-[#f8f4ef]">
      {/* Sidebar */}
      <AdminSidebar active="livemap" />

      {/* Main Content */}
      <div className="flex-1 p-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#351c15]">Live Fleet Map</h1>
          <p className="text-[#6b4f3a]">Monitor all driver locations in real time</p>
        </div>

        {/* Map Card */}
        <div className="bg-white rounded-xl shadow border border-[#e6d8c9] p-6 mb-10">
          <h2 className="text-xl font-bold text-[#351c15] mb-4">Driver Map</h2>

          <div className="rounded-xl overflow-hidden border border-[#e6d8c9]">
            <MapComponent center={[13.0827, 80.2707]} zoom={12} markers={markers} />
          </div>
        </div>

        {/* Driver List */}
        <div className="bg-white rounded-xl shadow border border-[#e6d8c9] p-6">
          <h3 className="text-xl font-bold text-[#351c15] mb-4">Active Drivers</h3>

          {drivers.length === 0 ? (
            <p className="text-[#6b4f3a]">No driver locations available.</p>
          ) : (
            <ul className="space-y-3">
              {drivers.map((d) => (
                <li
                  key={d.userId}
                  className="p-4 bg-[#fdf7ed] border border-[#e6d8c9] rounded-lg shadow-sm hover:bg-[#fff9ef] transition"
                >
                  <div className="flex justify-between">
                    <div className="font-semibold text-[#351c15]">
                      {d.userFName} {d.userLName}
                    </div>
                    <div
                      className={
                        d.isAvailable ? "text-green-700" : "text-red-700"
                      }
                    >
                      {d.isAvailable ? "Available" : "Busy"}
                    </div>
                  </div>

                  {d.currentLatitude && (
                    <p className="text-sm text-[#6b4f3a] mt-1">
                      Lat: {d.currentLatitude.toFixed(4)}, Lng:{" "}
                      {d.currentLongitude.toFixed(4)}
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
