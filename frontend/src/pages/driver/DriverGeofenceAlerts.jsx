import React, { useState, useEffect } from "react";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import DriverSidebar from "./DriverSidebar"; // <-- ADDED SIDEBAR

export default function DriverGeofenceAlerts() {
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
        const ordersRes = await api.get("/driver/orders/all");
        const myOrders = ordersRes.data;

        const oMap = {};
        myOrders.forEach((o) => (oMap[o.id] = o));
        setOrdersMap(oMap);

        const gfRes = await api.get("/geofence/list");
        const allGeofences = gfRes.data;

        const myGeofences = allGeofences.filter((g) => oMap[g.orderId]);
        setGeofences(myGeofences);

        const statuses = {};

        let myLocation = null;
        try {
          const meRes = await api.get(`/auth/${user.userId}`);
          myLocation = meRes.data;
        } catch {}

        for (const gf of myGeofences) {
          const order = oMap[gf.orderId];

          if (order && order.status !== "Delivered" && myLocation) {
            try {
              const checkRes = await api.post("/geofence/check", {
                DriverId: user.userId,
                OrderId: order.id,
                Lat: myLocation.currentLatitude,
                Lon: myLocation.currentLongitude,
              });
              statuses[gf.geofenceId] = {
                driverName: "You",
                ...checkRes.data,
              };
            } catch {
              statuses[gf.geofenceId] = { error: "Check failed" };
            }
          }
        }
        setDriverStatuses(statuses);
      } catch (err) {
        console.error("Failed to load driver geofences:", err);
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
    return order && order.status !== "Delivered";
  });

  const expiredGeofences = geofences.filter((gf) => {
    const order = ordersMap[gf.orderId];
    return order && order.status === "Delivered";
  });

  const renderGeofenceCard = (gf) => {
    const status = driverStatuses[gf.geofenceId];
    const isInside = status?.inside;

    return (
      <div
        key={gf.geofenceId}
        className="bg-white border border-[#e2d6c6] rounded-xl shadow-md hover:shadow-lg transition overflow-hidden"
      >
        {/* UPS Header */}
        <div className="p-5 bg-[#f8f4ef] border-b border-[#e2d6c6] flex justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#351c15]">{gf.name}</h3>
            <p className="text-xs text-gray-500 mt-1">Zone #{gf.geofenceId}</p>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold shadow border ${
              gf.isActive
                ? "bg-[#ffb500]/30 text-[#351c15] border-[#ffb500]"
                : "bg-gray-200 text-gray-700 border-gray-300"
            }`}
          >
            {gf.isActive ? "ACTIVE" : "INACTIVE"}
          </span>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-4">

          <div className="flex justify-between text-sm text-gray-700 pb-2 border-b border-[#f0e8dd]">
            <span className="font-medium text-[#351c15]">Radius</span>
            <span className="font-semibold bg-[#f8f4ef] px-2 py-1 rounded">
              {gf.radiusMeters}m
            </span>
          </div>

          {status ? (
            <div
              className={`rounded-xl p-4 border ${
                isInside
                  ? "bg-green-50 border-green-300"
                  : "bg-amber-50 border-amber-300"
              }`}
            >
              {status.error ? (
                <p className="text-red-600 text-sm">Error: {status.error}</p>
              ) : (
                <div className="space-y-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Current Status</p>
                    <span
                      className={`px-4 py-2 rounded-lg font-bold text-sm ${
                        isInside
                          ? "bg-green-600 text-white"
                          : "bg-[#ffb500] text-[#351c15]"
                      }`}
                    >
                      {isInside ? "INSIDE ZONE" : "OUTSIDE RANGE"}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm bg-white p-2 rounded-lg border border-gray-200">
                    <span className="text-gray-600">Distance</span>
                    <span className="font-mono font-bold text-gray-800">
                      {Math.round(status.distanceMeters)}m
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-3">Fetching GPS...</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-[#f8f4ef]">

      {/* SIDEBAR INCLUDED */}
      <DriverSidebar active="geofence" />

      <div className="flex-1 p-10">
        {/* Page Header */}
        <h2 className="text-3xl font-extrabold text-[#351c15]">
          Driver Geofence Alerts
        </h2>
        <p className="text-gray-600 mt-2">
          Live monitoring of your assigned delivery zones.
        </p>

        {loading && geofences.length === 0 && (
          <div className="flex flex-col items-center py-16">
            <div className="w-10 h-10 border-4 border-[#ffb500]/40 border-t-[#351c15] rounded-full animate-spin"></div>
            <p className="mt-4 text-[#351c15] font-medium">Syncing zones…</p>
          </div>
        )}

        {/* ACTIVE */}
        <div className="mt-10">
          <h3 className="text-xl font-bold text-[#351c15] mb-4">
            Active Assignments ({activeGeofences.length})
          </h3>

          {activeGeofences.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeGeofences.map(renderGeofenceCard)}
            </div>
          ) : (
            <div className="bg-white p-10 rounded-xl border border-[#e2d6c6] text-center">
              <p className="text-gray-500">No active geofences.</p>
            </div>
          )}
        </div>

        {/* COMPLETED */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-[#351c15] mb-4">
            Completed ({expiredGeofences.length})
          </h3>

          {expiredGeofences.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {expiredGeofences.map((gf) => (
                <div
                  key={gf.geofenceId}
                  className="bg-white border border-[#e2d6c6] p-5 rounded-xl opacity-70"
                >
                  <h4 className="font-bold text-[#351c15]">{gf.name}</h4>
                  <p className="text-xs text-gray-500">#{gf.geofenceId}</p>

                  <div className="mt-3 px-3 py-1 bg-green-100 text-green-700 border border-green-300 rounded text-xs font-bold inline-flex items-center">
                    ✔ Completed
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No completed geofences.</p>
          )}
        </div>
      </div>
    </div>
  );
}
