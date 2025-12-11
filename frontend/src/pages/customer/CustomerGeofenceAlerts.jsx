import React, { useState, useEffect } from "react";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import CustomerSidebar from "./CustomerSidebar";

export default function CustomerGeofenceAlerts() {
  const { user } = useAuth();
  const [geofences, setGeofences] = useState([]);
  const [ordersMap, setOrdersMap] = useState({});
  const [driverStatuses, setDriverStatuses] = useState({});
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const gfRes = await api.get("/geofence/list");
        const myGeofences = gfRes.data.filter((g) => g.ownerUserId === user.userId);

        const ordersRes = await api.get("/orders/my-orders");
        const myOrders = ordersRes.data;

        const map = {};
        myOrders.forEach((o) => (map[o.id] = o));
        setOrdersMap(map);

        const statuses = {};

        for (const gf of myGeofences) {
          const order = map[gf.orderId];

          if (order && order.status !== "Delivered" && order.driverId) {
            try {
              const driverRes = await api.get(`/auth/${order.driverId}`);
              const driver = driverRes.data;

              if (driver?.currentLatitude && driver?.currentLongitude) {
                const check = await api.post("/geofence/check", {
                  DriverId: order.driverId,
                  OrderId: order.id,
                  Lat: driver.currentLatitude,
                  Lon: driver.currentLongitude,
                });

                statuses[gf.geofenceId] = {
                  driverName: `${driver.userFName} ${driver.userLName}`,
                  ...check.data,
                };
              } else {
                statuses[gf.geofenceId] = { error: "Driver location unavailable" };
              }
            } catch {
              statuses[gf.geofenceId] = { error: "Status check failed" };
            }
          }
        }

        setGeofences(myGeofences);
        setDriverStatuses(statuses);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const activeGeofences = geofences.filter((g) => {
    const o = ordersMap[g.orderId];
    return o && o.status !== "Delivered";
  });

  const expiredGeofences = geofences.filter((g) => {
    const o = ordersMap[g.orderId];
    return o && o.status === "Delivered";
  });

  // UPS UI CARD
  const renderGeofenceCard = (gf) => {
    const status = driverStatuses[gf.geofenceId];
    const inside = status?.inside;

    return (
      <div
        key={gf.geofenceId}
        className="bg-[#fff8e7] border border-[#e6ddc5] rounded-xl shadow hover:shadow-md transition p-5"
      >
        {/* Header */}
        <div className="flex justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-[#351c15]">{gf.name}</h3>
            <p className="text-xs text-[#6f4e37]">ID: {gf.geofenceId}</p>
          </div>

          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${
              gf.isActive
                ? "bg-[#f9b400]/30 border-[#f9b400] text-[#351c15]"
                : "bg-gray-200 border-gray-300 text-gray-600"
            }`}
          >
            {gf.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Radius + Distance */}
        <div className="flex justify-between mb-4">
          <div>
            <p className="text-xs text-[#6f4e37] uppercase font-semibold">
              Radius
            </p>
            <p className="text-lg font-bold text-[#351c15]">
              {gf.radiusMeters}m
            </p>
          </div>

          {status && (
            <div className="text-right">
              <p className="text-xs text-[#6f4e37] uppercase font-semibold">
                Distance
              </p>
              <p className="font-mono text-lg font-bold text-[#351c15]">
                {Math.round(status.distanceMeters)}m
              </p>
            </div>
          )}
        </div>

        {/* Status */}
        {status ? (
          status.error ? (
            <div className="bg-red-100 border border-red-300 text-red-800 p-3 rounded-lg text-sm">
              {status.error}
            </div>
          ) : (
            <div
              className={`p-4 rounded-lg border-l-4 ${
                inside
                  ? "bg-green-50 border-green-600"
                  : "bg-yellow-50 border-yellow-600"
              }`}
            >
              <div className="flex justify-between items-center">
                <span
                  className={`font-bold text-sm ${
                    inside ? "text-green-800" : "text-yellow-700"
                  }`}
                >
                  {inside ? "INSIDE ZONE" : "OUTSIDE ZONE"}
                </span>

                {inside && <span className="text-xl">✅</span>}
              </div>
            </div>
          )
        ) : (
          <p className="text-center italic text-[#6f4e37] text-sm">
            Locating driver…
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f3ef] flex">
      <CustomerSidebar active="alerts" />

      <main className="flex-1 p-10">
        {/* Header */}
        <header className="mb-10 pb-6 border-b border-[#e6ddc5]">
          <h1 className="text-3xl font-bold text-[#351c15]">Geofence Alerts</h1>
          <p className="text-[#6f4e37] mt-1">
            Real-time monitoring of delivery zones
          </p>
        </header>

        {/* Active Geofences */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#351c15]">
              Active Zones ({activeGeofences.length})
            </h2>

            {/* View Toggle */}
            <div className="flex bg-[#fff8e7] border border-[#e6ddc5] rounded-xl overflow-hidden shadow">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 text-sm ${
                  viewMode === "grid"
                    ? "bg-[#f9b400]/30 text-[#351c15]"
                    : "text-[#6f4e37] hover:bg-[#f9b400]/20"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 text-sm ${
                  viewMode === "list"
                    ? "bg-[#f9b400]/30 text-[#351c15]"
                    : "text-[#6f4e37] hover:bg-[#f9b400]/20"
                }`}
              >
                List
              </button>
            </div>
          </div>

          {activeGeofences.length === 0 ? (
            <div className="bg-[#fff8e7] border border-[#e6ddc5] rounded-xl p-10 text-center text-[#6f4e37]">
              No active geofences assigned.
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {activeGeofences.map(renderGeofenceCard)}
            </div>
          ) : (
            <div className="space-y-4">
              {activeGeofences.map(renderGeofenceCard)}
            </div>
          )}
        </section>

        {/* History */}
        <section>
          <h2 className="text-xl font-bold text-[#6f4e37] mb-4">
            Completed Deliveries
          </h2>

          {expiredGeofences.length === 0 ? (
            <p className="text-[#6f4e37] italic">No history.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {expiredGeofences.map((gf) => (
                <div
                  key={gf.geofenceId}
                  className="bg-[#fff8e7] border border-[#e6ddc5] rounded-xl p-4 opacity-60 hover:opacity-100 hover:shadow transition"
                >
                  <h3 className="font-bold text-[#351c15]">{gf.name}</h3>
                  <p className="text-xs text-[#6f4e37]">ID: {gf.geofenceId}</p>

                  <span className="mt-2 inline-block bg-green-100 text-green-700 px-3 py-1 text-xs font-bold rounded-full">
                    Delivered
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
