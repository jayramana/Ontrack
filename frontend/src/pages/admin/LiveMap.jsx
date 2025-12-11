import { useState, useEffect } from "react";
import api from "../../services/api";
import MapComponent from "../../components/MapComponent";
import * as signalR from "@microsoft/signalr";

function LiveMap() {
    const [drivers, setDrivers] = useState([]);
    const [connection, setConnection] = useState(null);

    // Fetch initial drivers from dashboard
    const fetchDashboardData = async () => {
        try {
            const response = await api.get("/admin/dashboard");

            const normalizedDrivers = (response.data.drivers || []).map(d => ({
                userId: Number(d.userId ?? d.id),
                userFName: d.userFName ?? "",
                userLName: d.userLName ?? "",
                isAvailable: d.isAvailable,
                currentLatitude: d.currentLatitude,
                currentLongitude: d.currentLongitude
            }));

            setDrivers(normalizedDrivers);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        }
    };

    // Setup SignalR connection
    const setupSignalR = async () => {
        try {
            const newConnection = new signalR.HubConnectionBuilder()
                .withUrl("http://localhost:5066/hubs/logistics")
                .withAutomaticReconnect()
                .build();

            newConnection.on("ReceiveDriverLocation", (driverId, lat, lng) => {
                setDrivers(prev =>
                    prev.map(d =>
                        d.userId === driverId
                            ? { ...d, currentLatitude: lat, currentLongitude: lng }
                            : d
                    )
                );
            });

            await newConnection.start();
            await newConnection.invoke("JoinAdminGroup");
            setConnection(newConnection);

            console.log("LiveMap connected to SignalR");
        } catch (err) {
            console.error("SignalR Connection Error:", err);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        setupSignalR();

        return () => {
            if (connection) {
                connection.stop();
            }
        };
    }, []);

    // Marker format for MapComponent
    const markers = drivers
        .filter(d => d.currentLatitude && d.currentLongitude)
        .map(d => ({
            position: [d.currentLatitude, d.currentLongitude],
            popup: `${d.userFName} ${d.userLName} (${d.isAvailable ? "Available" : "Busy"})`
        }));

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Live Fleet Map</h2>

            <div className="mb-6">
                <MapComponent
                    center={[13.0827, 80.2707]}
                    zoom={12}
                    markers={markers}
                />
            </div>

            <div>
                <h3 className="text-xl font-semibold mb-2">Active Drivers</h3>
                <ul className="space-y-2">
                    {drivers.map(d => (
                        <li
                            key={d.userId}
                            className="p-3 border rounded bg-white shadow-sm flex justify-between"
                        >
                            <span>{d.userFName} {d.userLName}</span>
                            <span className={d.isAvailable ? "text-green-600" : "text-red-600"}>
                                {d.isAvailable ? "Available" : "Busy"}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default LiveMap;
