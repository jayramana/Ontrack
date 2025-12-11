import { useState, useEffect } from "react";
import api from "../../services/api";
import MapComponent from "../../components/MapComponent";
import * as signalR from "@microsoft/signalr";
import AdminSidebar from "./AdminSidebar";

function LiveMap() {
  const [drivers, setDrivers] = useState([]);
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    setupSignalR();

    return () => {
      if (connection) connection.stop();
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get("/admin/dashboard");
      setDrivers(response.data.drivers);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const setupSignalR = async () => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5000/hubs/logistics")
      .withAutomaticReconnect()
      .build();

    newConnection.on("ReceiveDriverLocation", (driverId, lat, lng) => {
      setDrivers((prevDrivers) =>
        prevDrivers.map((d) =>
          d.id === driverId
            ? { ...d, currentLatitude: lat, currentLongitude: lng }
            : d
        )
      );
    });

    try {
      await newConnection.start();
      await newConnection.invoke("JoinAdminGroup");
      setConnection(newConnection);
    } catch (err) {
      console.error("SignalR Connection Error:", err);
    }
  };

  const markers = drivers
    .filter((d) => d.currentLatitude && d.currentLongitude)
    .map((d) => ({
      position: [d.currentLatitude, d.currentLongitude],
      popup: `${d.name} (${d.isAvailable ? "Available" : "Busy"})`,
    }));

  return (
    <div className="min-h-screen flex bg-[#f8f4ef]">
      {/* Sidebar */}
      <AdminSidebar active="live-map" />

      {/* MAIN AREA */}
      <div className="flex-1 px-8 py-6">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#351c15]">Live Fleet Map</h2>
          <p className="text-[#6b4f3a]">Real-time tracking of all active drivers</p>
        </div>

        {/* MAP CARD */}
        <div className="bg-white rounded-xl shadow border border-[#e6d8c9] p-6 mb-8">
          <h3 className="text-xl font-semibold text-[#351c15] mb-4">Driver Locations</h3>
          <MapComponent center={[13.0827, 80.2707]} zoom={12} markers={markers} />
        </div>

        {/* ACTIVE DRIVERS LIST */}
        <div className="bg-white rounded-xl shadow border border-[#e6d8c9] p-6">
          <h3 className="text-xl font-semibold text-[#351c15] mb-4">Active Drivers</h3>

          <ul className="space-y-3">
            {drivers.map((d) => (
              <li
                key={d.id}
                className="p-4 border border-[#e6d8c9] rounded-lg bg-[#fffdf9] shadow-sm flex justify-between items-center hover:bg-[#fdf7ed] transition"
              >
                <span className="text-[#351c15] font-medium">{d.name}</span>

                <span
                  className={`font-semibold ${
                    d.isAvailable ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {d.isAvailable ? "Available" : "Busy"}
                </span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}

export default LiveMap;
