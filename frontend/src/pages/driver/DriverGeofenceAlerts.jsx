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
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    if (!user?.userId) return;

    const fetchData = async () => {
      setLoading(true);

      try {
        // 1️⃣ Fetch driver orders
        const ordersRes = await api.get("/driver/orders/all");
        const myOrders = ordersRes.data || [];

        const orderMap = {};
        myOrders.forEach((o) => (orderMap[o.id] = o));
        setOrdersMap(orderMap);

        // 2️⃣ Fetch geofences
        const gfRes = await api.get("/geofence/list");
        const allGeofences = gfRes.data || [];

        const myGeofences = allGeofences.filter((g) => orderMap[g.orderId]);
        setGeofences(myGeofences);

        // 3️⃣ Fetch driver location
        let myLocation = null;
        try {
          const meRes = await api.get(`/auth/${user.userId}`);
          myLocation = meRes.data;
        } catch {
          console.warn("Unable to fetch driver location");
        }

        const statusMap = {};

        // 4️⃣ Check each geofence
        for (const gf of myGeofences) {
          const order = orderMap[gf.orderId];

          if (!order || order.status === "Delivered") continue;

          if (
            myLocation &&
            typeof myLocation.currentLatitude === "number" &&
            typeof myLocation.currentLongitude === "number"
          ) {
            try {
              const checkRes = await api.post("/geofence/check", {
                driverId: Number(user.userId),
                orderId: Number(order.id),
                lat: Number(myLocation.currentLatitude),
                lon: Number(myLocation.currentLongitude),
              });

              statusMap[gf.geofenceId] = {
                driverName: "You",
                ...checkRes.data,
              };
            } catch (err) {
              console.error("Geofence check failed:", err);
              statusMap[gf.geofenceId] = { error: "Check failed" };
            }
          } else {
            statusMap[gf.geofenceId] = { error: "Waiting for GPS fix…" };
          }
        }

        setDriverStatuses(statusMap);
      } catch (err) {
        console.error("Failed to load geofence data:", err);
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
        className="bg-white border border-[#e6d8c9] rounded-xl shadow hover:shadow-md transition"
      >
        <div className="bg-[#f8f4ef] border-b border-[#e6d8c9] p-4 flex justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#351c15]">{gf.name}</h3>
            <p className="text-xs font-mono text-[#6b4f3a]">
              ZONE #{gf.geofenceId}
            </p>
          </div>

          <span
            className={`px-3 py-1 rounded text-xs font-bold ${
              gf.isActive
                ? "bg-[#ffb500]/20 text-[#8a5a00]"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {gf.isActive ? "ACTIVE" : "INACTIVE"}
          </span>
        </div>

        <div className="p-5">
          <div className="flex justify-between mb-4">
            <div>
              <p className="text-xs uppercase font-bold text-[#6b4f3a]">
                Radius
              </p>
              <p className="text-lg font-bold">{gf.radiusMeters} m</p>
            </div>

            {status?.distanceMeters != null && (
              <div className="text-right">
                <p className="text-xs uppercase font-bold text-[#6b4f3a]">
                  Distance
                </p>
                <p className="font-mono font-bold">
                  {Math.round(status.distanceMeters)} m
                </p>
              </div>
            )}
          </div>

          {status ? (
            status.error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm text-center">
                {status.error}
              </div>
            ) : (
              <div
                className={`p-4 rounded border-l-4 ${
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
                    <span className="font-bold text-sm uppercase">
                      {isInside ? "Inside Zone" : "Outside Zone"}
                    </span>
                  </div>
                  {isInside && <span className="text-xl">✅</span>}
                </div>
              </div>
            )
          ) : (
            <div className="text-center text-sm italic text-[#6b4f3a]">
              Locating…
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderGeofenceList = (list) => (
    <div className="space-y-4">{list.map(renderGeofenceCard)}</div>
  );

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen flex bg-[#f8f4ef]">
      <DriverSidebar active="geofence" />

      <main className="flex-1 p-8">
        <header className="mb-8 border-b pb-6 flex justify-between">
          <div>
            <h1 className="text-3xl font-black text-[#351c15]">
              Geofence Monitor
            </h1>
            <p className="text-[#6b4f3a]">Real-time driver zone tracking</p>
          </div>

          <div className="bg-white border rounded-lg flex overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${
                viewMode === "grid" ? "bg-[#ffb500]/20" : "hover:bg-[#fff8e6]"
              }`}
            >
              ⬜⬜
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${
                viewMode === "list" ? "bg-[#ffb500]/20" : "hover:bg-[#fff8e6]"
              }`}
            >
              ☰
            </button>
          </div>
        </header>

        {loading && geofences.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#6b4f3a]">Syncing geofences…</p>
          </div>
        )}

        {/* ACTIVE */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">
            Active Zones ({activeGeofences.length})
          </h2>

          {activeGeofences.length ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {activeGeofences.map(renderGeofenceCard)}
              </div>
            ) : (
              renderGeofenceList(activeGeofences)
            )
          ) : (
            <p className="italic text-[#6b4f3a]">No active geofences.</p>
          )}
        </section>

        {/* HISTORY */}
        <section>
          <h2 className="text-sm uppercase tracking-wider mb-4">
            Completed History
          </h2>

          {expiredGeofences.length ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {expiredGeofences.map((gf) => (
                <div
                  key={gf.geofenceId}
                  className="bg-[#f1e8da] border rounded p-4 opacity-70"
                >
                  <h4 className="font-bold">{gf.name}</h4>
                  <span className="text-xs">Delivered</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="italic text-[#6b4f3a]">No history.</p>
          )}
        </section>
      </main>
    </div>
  );
}
