import React, { useState, useEffect } from "react";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import DriverSidebar from "./DriverSidebar";

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
        className="bg-white border border-[#e6d8c9] rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden group"
      >
        {/* HEADER */}
        <div className="bg-[#f8f4ef] border-b border-[#e6d8c9] p-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-[#351c15]">{gf.name}</h3>
            <p className="text-xs text-[#6b4f3a] font-mono">ZONE ID: {gf.geofenceId}</p>
          </div>

          <div
            className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider
              ${
                gf.isActive
                  ? "bg-[#ffb500]/20 text-[#8a5a00] border border-[#ffb500]"
                  : "bg-gray-100 text-gray-500 border border-gray-300"
              }`}
          >
            {gf.isActive ? "Active" : "Inactive"}
          </div>
        </div>

        {/* BODY */}
        <div className="p-5">

          {/* TOP ROW */}
          <div className="flex justify-between items-center mb-5 text-sm">
            <div className="flex flex-col">
              <span className="text-xs text-[#6b4f3a] font-bold uppercase">Radius</span>
              <span className="font-bold text-[#351c15] text-lg">
                {gf.radiusMeters} <span className="text-xs font-normal text-[#6b4f3a]">meters</span>
              </span>
            </div>

            {status && (
              <div className="flex flex-col text-right">
                <span className="text-xs text-[#6b4f3a] font-bold uppercase">Distance</span>
                <span className="font-mono font-bold text-[#351c15] text-lg">
                  {Math.round(status.distanceMeters)}m
                </span>
              </div>
            )}
          </div>

          {/* STATUS BOX */}
          {status ? (
            status.error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm text-center font-medium">
                Check Failed
              </div>
            ) : (
              <div
                className={`p-4 rounded border-l-4
                  ${
                    isInside
                      ? "bg-green-50 border-green-600"
                      : "bg-[#fff8e6] border-[#ffb500]"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span
                      className={`h-3 w-3 rounded-full mr-3 ${
                        isInside ? "bg-green-600" : "bg-[#ffb500]"
                      }`}
                    ></span>
                    <span
                      className={`font-bold uppercase text-sm ${
                        isInside ? "text-green-700" : "text-[#8a5a00]"
                      }`}
                    >
                      {isInside ? "INSIDE ZONE" : "OUTSIDE ZONE"}
                    </span>
                  </div>
                  {isInside && <span className="text-xl">✅</span>}
                </div>
              </div>
            )
          ) : (
            <div className="text-center py-4 text-[#6b4f3a] text-sm italic">Finding location…</div>
          )}
        </div>
      </div>
    );
  };

  const [viewMode, setViewMode] = useState("grid");

  const renderGeofenceList = (geofences) => (
    <div className="space-y-4">
      {geofences.map((gf) => {
        const status = driverStatuses[gf.geofenceId];
        const isInside = status?.inside;

        return (
          <div
            key={gf.geofenceId}
            className="bg-white border border-[#e6d8c9] rounded-xl p-4 flex justify-between items-center shadow-sm"
          >
            <div>
              <span className="text-lg font-bold text-[#351c15]">{gf.name}</span>
              <p className="text-xs text-[#6b4f3a] font-mono">Radius: {gf.radiusMeters}m</p>
            </div>

            <div className="flex items-center gap-6">
              {status ? (
                <div
                  className={`px-4 py-2 rounded font-bold text-sm flex items-center
                      ${
                        isInside
                          ? "bg-green-100 text-green-800"
                          : "bg-[#fff8e6] text-[#8a5a00]"
                      }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full mr-2 ${
                      isInside ? "bg-green-600" : "bg-[#ffb500]"
                    }`}
                  ></span>
                  {isInside ? "INSIDE" : "OUTSIDE"}
                </div>
              ) : (
                <span className="text-xs text-[#6b4f3a] italic">Locating…</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#f8f4ef]">
      <DriverSidebar active="geofence" />

      <main className="flex-1 p-8">

        {/* HEADER */}
        <header className="mb-8 pb-6 border-b border-[#e6d8c9] flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-[#351c15]">Geofence Monitor</h1>
            <p className="text-[#6b4f3a] mt-1 font-medium">
              Real-time UPS-style zone monitoring.
            </p>
          </div>

          {/* VIEW MODE */}
          <div className="flex items-center gap-4">
            <div className="bg-white border border-[#e6d8c9] rounded-lg flex overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${
                  viewMode === "grid"
                    ? "bg-[#ffb500]/20 text-[#351c15]"
                    : "text-gray-500 hover:bg-[#fff8e6]"
                }`}
              >
                ⬜⬜
              </button>

              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${
                  viewMode === "list"
                    ? "bg-[#ffb500]/20 text-[#351c15]"
                    : "text-gray-500 hover:bg-[#fff8e6]"
                }`}
              >
                ☰
              </button>
            </div>
          </div>
        </header>

        {/* LOADING */}
        {loading && geofences.length === 0 && (
          <div className="text-center py-20">
            <div className="animate-spin w-10 h-10 border-4 border-[#e6d8c9] border-t-[#351c15] rounded-full mx-auto mb-4"></div>
            <p className="text-[#6b4f3a] font-medium">Syncing Geofence Data…</p>
          </div>
        )}

        {/* ACTIVE */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#351c15] flex items-center">
              <span className="bg-[#ffb500]/20 text-[#8a5a00] px-2 py-1 rounded text-sm mr-3">
                {activeGeofences.length}
              </span>
              Active Zones
            </h2>
          </div>

          {activeGeofences.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {activeGeofences.map(renderGeofenceCard)}
              </div>
            ) : (
              renderGeofenceList(activeGeofences)
            )
          ) : (
            !loading && (
              <div className="bg-white border-2 border-dashed border-[#e6d8c9] rounded-lg p-10 text-center">
                <p className="text-[#6b4f3a] font-medium">No active geofences.</p>
              </div>
            )
          )}
        </section>

        {/* HISTORY */}
        <section>
          <h2 className="text-lg font-bold text-[#6b4f3a] mb-4 uppercase tracking-wider text-sm border-b border-[#e6d8c9] pb-2">
            Completed History
          </h2>

          {expiredGeofences.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {expiredGeofences.map((gf) => (
                <div
                  key={gf.geofenceId}
                  className="bg-[#f1e8da] border border-[#e6d8c9] rounded p-4 flex justify-between items-center opacity-70 hover:opacity-100 transition"
                >
                  <div>
                    <h4 className="font-bold text-[#351c15] text-sm">{gf.name}</h4>
                    <p className="text-xs text-[#6b4f3a]">#{gf.geofenceId}</p>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">
                    DELIVERED
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#6b4f3a] text-sm italic">No history.</p>
          )}
        </section>
      </main>
    </div>
  );
}
