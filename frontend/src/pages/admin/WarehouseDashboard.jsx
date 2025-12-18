import { useState, useEffect } from "react";
import api from "../../services/api";
import AdminSidebar from "./AdminSidebar";

const WarehouseDashboard = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [orders, setOrders] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const res = await api.get("/warehouse");
        setWarehouses(res.data || []);
        if (res.data?.length > 0) setSelectedWarehouse(res.data[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWarehouses();
  }, []);

  useEffect(() => {
    if (!selectedWarehouse) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const ordersRes = await api.get(
          `/warehouse/${selectedWarehouse}/orders`
        );
        const statsRes = await api.get(
          `/warehouse/${selectedWarehouse}/statistics`
        );
        setOrders(ordersRes.data || []);
        setStatistics(statsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedWarehouse]);

  const selectedWarehouseData = warehouses.find(
    (w) => w.id === selectedWarehouse
  );

  return (
    <div className="min-h-screen flex bg-[#0b0f14] text-slate-100">
      <AdminSidebar active="warehouses" />

      <div className="flex-1 px-10 py-10 overflow-y-auto space-y-10">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            Warehouse Dashboard
          </h1>
          <p className="text-slate-400 mt-1">
            Monitor district warehouse operations
          </p>
        </div>

        {/* SELECTOR */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <label className="block text-sm font-semibold text-slate-400 mb-2">
            Select District Warehouse
          </label>
          <select
            value={selectedWarehouse || ""}
            onChange={(e) => setSelectedWarehouse(Number(e.target.value))}
            className="
              w-full px-4 py-3 rounded-xl
              bg-[#0b0f14] border border-white/10
              text-slate-100
              focus:outline-none focus:ring-2 focus:ring-[#ff8a3d]
            "
          >
            <option value="">-- Select a Warehouse --</option>
            {warehouses.map((w) => (
              <option
                key={w.id}
                value={w.id}
                className="bg-[#0b0f14] text-slate-100"
              >
                {w.name} - {w.city} ({w.pincode})
              </option>
            ))}
          </select>
        </div>

        {/* WAREHOUSE SUMMARY */}
        {selectedWarehouseData && statistics && (
          <>
            <section className="relative bg-gradient-to-br from-[#1a1f29] to-[#0f141c] rounded-3xl p-8 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ff8a3d22,transparent_60%)]" />
              <div className="relative">
                <h2 className="text-2xl font-black">
                  {statistics.warehouseName}
                </h2>
                <p className="text-[#ff8a3d] text-sm mt-1">
                  {statistics.city}, Tamil Nadu — {statistics.pincode}
                </p>
              </div>
            </section>

            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  label: "Orders From District",
                  value: statistics.statistics.totalPickups,
                  color: "text-green-400",
                },
                {
                  label: "Orders To District",
                  value: statistics.statistics.totalDeliveries,
                  color: "text-blue-400",
                },
                {
                  label: "At Warehouse",
                  value: statistics.statistics.currentlyAtWarehouse,
                  color: "text-[#ff8a3d]",
                },
              ].map((c, i) => (
                <div
                  key={i}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                  <p className="text-sm text-slate-400">{c.label}</p>
                  <p className={`text-3xl font-black mt-3 ${c.color}`}>
                    {c.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                ["Pending Assignment", statistics.statistics.pendingAssignment, "text-yellow-400"],
                ["In Transit", statistics.statistics.inTransit, "text-blue-400"],
                ["Delivered", statistics.statistics.delivered, "text-green-400"],
              ].map(([label, val, color]) => (
                <div
                  key={label}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                  <p className="text-sm text-slate-400">{label}</p>
                  <p className={`text-2xl font-bold mt-2 ${color}`}>{val}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ORDERS */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h3 className="font-bold">
              Orders <span className="text-slate-400">({orders.length})</span>
            </h3>
          </div>

          <div className="p-6 space-y-4">
            {loading && (
              <p className="text-slate-400 text-center py-6">Loading…</p>
            )}

            {!loading && orders.length === 0 && (
              <p className="text-slate-500 text-center py-6">
                No orders for this warehouse.
              </p>
            )}

            {!loading &&
              orders.map((order) => (
                <div
                  key={order.id}
                  className="
                    bg-white/5 border border-white/10
                    rounded-2xl p-5
                    hover:bg-white/10 transition
                  "
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-lg">
                        Order #{order.id}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#ff8a3d]/20 text-[#ff8a3d]">
                      {order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 text-xs">From</p>
                      <p className="font-medium">{order.pickupAddress}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">To</p>
                      <p className="font-medium">{order.receiverAddress}</p>
                    </div>
                  </div>

                  {order.driver && (
                    <p className="mt-2 text-sm">
                      <span className="text-slate-500">Driver:</span>{" "}
                      <span className="font-medium">{order.driver.name}</span>
                    </p>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarehouseDashboard;
