import React, { useState, useEffect } from "react";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import CustomerSidebar from "./CustomerSidebar";
import { MdMyLocation } from "react-icons/md";
import { Radio, Flag } from "lucide-react";

export default function CustomerGeofenceAlerts() {
  const { user } = useAuth();
  const [geofences, setGeofences] = useState([]);
  const [ordersMap, setOrdersMap] = useState({});
  const [driverStatuses, setDriverStatuses] = useState({});
  const [loading, setLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const gfRes = await api.get("/geofence/list");
        const myGeofences = gfRes.data.filter(
          (g) => g.ownerUserId === user.userId
        );

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
                statuses[gf.geofenceId] = {
                  error: "Driver location unavailable",
                };
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

  const renderGeofenceRow = (gf) => {
    const status = driverStatuses[gf.geofenceId];
    const inside = status?.inside;
    const order = ordersMap[gf.orderId];

    return (
      <div
        key={gf.geofenceId}
        className="bg-linear-to-br from-[#1a1f29] to-[#0f141c] rounded-lg p-6 mb-4 flex flex-col md:flex-row items-center justify-between shadow-sm hover:shadow-md transition-shadow"
      >
        {/* LEFT: Info */}
        <div className="flex-1 w-full md:w-auto mb-4 md:mb-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-[#fff8e7] text-[#351c15] p-2 rounded-lg">
              <Radio className="h-6 w-6 text-[#ea580c]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Geofence - #{gf.geofenceId}
              </h3>
              <p className="text-xs font-mono text-gray-400">
                {gf.name}
              </p>
            </div>
          </div>

          <div className="pl-0 md:pl-14">
            <div className="flex flex-col gap-2 text-sm text-gray-400">
              <p>
                <span className="font-semibold text-gray-300">Order ID:</span>{" "}
                {order?.id}
              </p>
              <p>
                <span className="font-semibold text-gray-300">Radius:</span>{" "}
                {(gf.radiusMeters / 1000).toFixed(2)} km
              </p>
              <p>
                <span className="font-semibold text-gray-300">Distance:</span>{" "}
                {status?.distanceMeters
                  ? `${(status.distanceMeters / 1000).toFixed(2)} km`
                  : "Calculating..."}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: Status Indicator */}
        <div className="md:w-64 w-full flex flex-col items-center md:items-end border-t md:border-t-0 border-gray-100/10 pt-4 md:pt-0">
          {status ? (
            status.error ? (
              <div className="flex flex-col items-end">
                <span className="text-red-400 font-bold bg-red-500/10 px-3 py-1 rounded text-sm mb-1">
                  Check Failed
                </span>
                <span className="text-xs text-gray-400">{status.error}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center md:items-end text-center md:text-right">
                {inside ? (
                  <>
                    <span className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-2 mb-2 animate-pulse">
                      <span className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.5)]"></span>
                      INSIDE ZONE
                    </span>
                    <p className="text-xs text-gray-400">
                      Driver is expected to arrive soon.
                    </p>
                  </>
                ) : (
                  <>
                    <span className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]"></span>
                      OUTSIDE ZONE
                    </span>
                    <p className="text-xs text-gray-400">
                      Driver is en route.
                    </p>
                  </>
                )}
              </div>
            )
          ) : (
            <div className="flex items-center gap-2 text-gray-400 italic text-sm">
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
              Locating driver...
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      <CustomerSidebar active="alerts" />

      <main
        className="flex-1 overflow-y-auto h-screen bg-[#0b0f14] transition-all duration-300"
        onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 10)}
      >
        <header
          className={`sticky top-0 z-30 mb-8 px-8 py-4 transition-all duration-300 ${
            isScrolled
              ? "bg-[#0b0f14]/80 backdrop-blur-xl border-b border-white/10"
              : "bg-transparent"
          }`}
        >
          <h1 className="text-2xl font-bold text-white">Geofence Alerts</h1>
        </header>

        <div className="p-8 pt-0">

        <section className="mb-12">
          <div className="flex gap-2 align-middle items-center mb-6">
            <MdMyLocation className="text-green-600 text-xl" />
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Active Geofences
            </h2>
          </div>

          {activeGeofences.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 text-2xl">
                📡
              </div>
              <p className="text-gray-500 font-medium">
                No active geofences currently being monitored.
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Alerts will appear here when drivers approach.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeGeofences.map(renderGeofenceRow)}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-400 mb-4 opacity-75">
            Expired Geofences
          </h2>

          {expiredGeofences.length === 0 ? (
            <p className="text-gray-400 text-sm italic">
              No completed delivery alerts yet.
            </p>
          ) : (
            <div className="space-y-3 opacity-90 hover:opacity-100 transition-opacity">
              {expiredGeofences.map((gf) => (
                <div
                  key={gf.geofenceId}
                  className="bg-linear-to-br from-[#1a1f29] to-[#0f141c] border border-[#1f2937] rounded-lg p-4 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-800 rounded-lg">
                        <Flag className="text-gray-400 w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{gf.name}</h3>
                      <p className="text-xs text-gray-400">
                        ID: {gf.geofenceId}
                      </p>
                    </div>
                  </div>
                  <span className="bg-[#1f2937] text-gray-300 border border-gray-700 px-3 py-1 text-xs font-bold rounded-full">
                    Expired
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
        </div>
      </main>
    </div>
  );
}
