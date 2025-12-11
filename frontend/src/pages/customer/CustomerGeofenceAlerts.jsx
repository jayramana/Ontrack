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

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const gfRes = await api.get("/geofence/list");
        const myGeofences = gfRes.data.filter((g) => g.ownerUserId === user.userId);

        const ordersRes = await api.get("/orders/my-orders");
        const myOrders = ordersRes.data;

        const oMap = {};
        myOrders.forEach((o) => (oMap[o.id] = o));
        setOrdersMap(oMap);

        const statuses = {};

        for (const gf of myGeofences) {
          const order = oMap[gf.orderId];

          if (order && order.status !== "Delivered" && order.driverId) {
            try {
              const driverRes = await api.get(`/auth/${order.driverId}`);
              const driver = driverRes.data;

              if (driver?.currentLatitude && driver?.currentLongitude) {
                const checkRes = await api.post("/geofence/check", {
                  DriverId: order.driverId,
                  OrderId: order.id,
                  Lat: driver.currentLatitude,
                  Lon: driver.currentLongitude,
                });

                statuses[gf.geofenceId] = {
                  driverName: `${driver.userFName} ${driver.userLName}`,
                  ...checkRes.data,
                };
              } else {
                statuses[gf.geofenceId] = {
                  driverName: driver ? `${driver.userFName} ${driver.userLName}` : "Unknown",
                  error: "Driver location unavailable",
                };
              }
            } catch {
              statuses[gf.geofenceId] = { error: "Failed to fetch status" };
            }
          }
        }

        setGeofences(myGeofences);
        setDriverStatuses(statuses);
      } catch (err) {
        console.error("Failed to load geofence alerts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const activeGeofences = geofences.filter((gf) => {
    const order = ordersMap[gf.orderId];
    return order && order.status === "Assigned";
  });

  const expiredGeofences = geofences.filter((gf) => {
    const order = ordersMap[gf.orderId];
    return order && order.status === "Delivered";
  });

  // UPS Styled Card Renderer
  const renderGeofenceCard = (gf) => {
    const status = driverStatuses[gf.geofenceId];
    const isInside = status?.inside;

    return (
      <div
        key={gf.geofenceId}
        className="bg-[#fff8e7] border border-[#e6ddc5] rounded-xl shadow-sm p-6 hover:shadow-md transition"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-[#351c15]">{gf.name}</h3>
            <p className="text-xs text-[#6f4e37]">ID: {gf.geofenceId}</p>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              gf.isActive
                ? "bg-green-100 text-green-700"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {gf.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Body */}
        <div className="text-sm mb-6 text-[#6f4e37]">
          <p>
            <span className="font-semibold text-[#351c15]">Radius:</span>{" "}
            {gf.radiusMeters}m
          </p>

          {status?.driverName && (
            <p className="mt-2">
              <span className="font-semibold text-[#351c15]">Driver:</span>{" "}
              {status.driverName}
            </p>
          )}
        </div>

        {/* Status Footer */}
        <div className="border-t border-[#e6ddc5] pt-3">
          {status ? (
            status.error ? (
              <p className="text-sm text-red-600 flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                {status.error}
              </p>
            ) : (
              <div className="flex items-center justify-between">
                <div
                  className={`flex items-center font-medium text-sm ${
                    isInside ? "text-green-700" : "text-amber-700"
                  }`}
                >
                  <span className="relative flex h-2.5 w-2.5 mr-2">
                    {isInside && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    )}
                    <span
                      className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                        isInside ? "bg-green-500" : "bg-amber-500"
                      }`}
                    ></span>
                  </span>
                  {isInside ? "Inside Range" : "Outside Range"}
                </div>

                <span className="text-sm font-mono text-[#6f4e37]">
                  {Math.round(status.distanceMeters)}m away
                </span>
              </div>
            )
          ) : (
            <p className="text-sm text-gray-400 italic">Checking status...</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-[#f7f3ef]">

      {/* Sidebar */}
      <CustomerSidebar active="alerts" />

      {/* MAIN CONTENT */}
      <div className="flex-1 p-10">

        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-[#351c15]">Geofence Alerts</h2>

          <span className="px-3 py-1 rounded-lg bg-[#fff8e7] border border-[#e6ddc5] text-[#6f4e37] text-sm">
            Auto-refresh: 10s
          </span>
        </div>

        {/* ACTIVE */}
        <div className="mb-12">
          <h3 className="text-sm font-semibold text-[#6f4e37] uppercase tracking-wide mb-4 border-b border-[#e6ddc5] pb-2">
            Active Deliveries
          </h3>

          {activeGeofences.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeGeofences.map(renderGeofenceCard)}
            </div>
          ) : (
            <p className="text-[#6f4e37] italic text-sm">No active deliveries.</p>
          )}
        </div>

        {/* COMPLETED */}
        <div>
          <h3 className="text-sm font-semibold text-[#6f4e37] uppercase tracking-wide mb-4 border-b border-[#e6ddc5] pb-2">
            Completed
          </h3>

          {expiredGeofences.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {expiredGeofences.map((gf) => (
                <div
                  key={gf.geofenceId}
                  className="bg-[#fff8e7] border border-[#e6ddc5] rounded-xl p-6 opacity-70"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-[#351c15]">{gf.name}</h4>
                      <p className="text-xs text-[#6f4e37]">ID: {gf.geofenceId}</p>
                    </div>
                    <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded">
                      Delivered
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-[#e6ddc5] rounded-xl">
              <p className="text-[#6f4e37] text-sm">No delivery history found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
