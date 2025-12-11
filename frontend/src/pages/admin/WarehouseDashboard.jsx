import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import AdminSidebar from "./AdminSidebar";

const WarehouseDashboard = () => {
  const { logout } = useAuth();
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [orders, setOrders] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const res = await api.get("/warehouse");
        setWarehouses(res.data);
        if (res.data.length > 0) setSelectedWarehouse(res.data[0].id);
      } catch (error) {
        console.error("Error fetching warehouses:", error);
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
        setOrders(ordersRes.data);
        setStatistics(statsRes.data);
      } catch (error) {
        console.error("Error fetching warehouse data:", error);
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
    <div className="min-h-screen flex bg-[#f8f4ef]">
      {/* Sidebar */}
      <AdminSidebar active="warehouses" />

      {/* Main content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#351c15]">Warehouse Dashboard</h1>
            <p className="text-[#6b4f3a]">
              Manage and monitor district warehouse operations
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Warehouse Selector */}
          <div className="bg-white rounded-xl shadow border border-[#e6d8c9] p-6 mb-8">
            <label className="block text-sm font-medium text-[#351c15] mb-2">
              Select District Warehouse
            </label>

            <select
              value={selectedWarehouse || ""}
              onChange={(e) => setSelectedWarehouse(Number(e.target.value))}
              className="w-full p-3 border border-[#d4c7b9] rounded-lg focus:ring-2 focus:ring-[#ffb500] outline-none bg-white text-[#351c15]"
            >
              <option value="">-- Select a Warehouse --</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.warehouseName} - {warehouse.city} ({warehouse.pincode})
                </option>
              ))}
            </select>
          </div>

          {/* Warehouse Info & Statistics */}
          {selectedWarehouseData && statistics && (
            <>
              <div className="bg-[#351c15] text-white rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold mb-1">{statistics.warehouseName}</h2>
                <p className="text-[#ffb500] text-sm">
                  {statistics.city}, Tamil Nadu — {statistics.pincode}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-600">
                  <p className="text-sm text-[#6b4f3a]">Orders From District</p>
                  <p className="text-xs text-[#6b4f3a]">Pickup / Sent</p>
                  <p className="text-3xl font-bold text-green-700 mt-3">
                    {statistics.statistics.totalPickups}
                  </p>
                  <p className="text-xs text-[#6b4f3a] mt-2">Senders placed from {statistics.city}</p>
                </div>

                <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-600">
                  <p className="text-sm text-[#6b4f3a]">Orders To District</p>
                  <p className="text-xs text-[#6b4f3a]">Delivery / Receive</p>
                  <p className="text-3xl font-bold text-blue-700 mt-3">
                    {statistics.statistics.totalDeliveries}
                  </p>
                  <p className="text-xs text-[#6b4f3a] mt-2">Customers in {statistics.city}</p>
                </div>

                <div className="bg-white rounded-xl shadow p-6 border-l-4 border-[#ffb500]">
                  <p className="text-sm text-[#6b4f3a]">At Warehouse</p>
                  <p className="text-xs text-[#6b4f3a]">Current Stock</p>
                  <p className="text-3xl font-bold text-[#d68a00] mt-3">
                    {statistics.statistics.currentlyAtWarehouse}
                  </p>
                  <p className="text-xs text-[#6b4f3a] mt-2">Packages at facility</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-5 rounded-xl shadow border border-[#e6d8c9]">
                  <p className="text-sm text-[#6b4f3a]">Pending Assignment</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {statistics.statistics.pendingAssignment}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl shadow border border-[#e6d8c9]">
                  <p className="text-sm text-[#6b4f3a]">In Transit</p>
                  <p className="text-2xl font-bold text-blue-600">{statistics.statistics.inTransit}</p>
                </div>

                <div className="bg-white p-5 rounded-xl shadow border border-[#e6d8c9]">
                  <p className="text-sm text-[#6b4f3a]">Delivered</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.statistics.delivered}</p>
                </div>
              </div>
            </>
          )}

          {/* Orders List */}
          <div className="bg-white rounded-xl shadow border border-[#e6d8c9]">
            <div className="px-6 py-4 border-b border-[#e6d8c9]">
              <h3 className="text-lg font-semibold text-[#351c15]">Orders ({orders.length})</h3>
            </div>

            <div className="p-6">
              {loading && <p className="text-[#6b4f3a] text-center py-6">Loading...</p>}

              {!loading && orders.length === 0 && (
                <p className="text-[#6b4f3a] text-center py-6">No orders found for this warehouse.</p>
              )}

              {!loading && orders.length > 0 && (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-[#e6d8c9] rounded-lg p-5 bg-[#fffdf9] hover:bg-[#fdf7ed] shadow-sm transition"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-[#351c15] text-lg">Order #{order.id}</p>
                          <p className="text-sm text-[#6b4f3a]">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status === "Delivered"
                              ? "bg-green-100 text-green-800"
                              : order.status === "InTransit"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-[#351c15]">
                        <div>
                          <p className="text-[#6b4f3a] text-xs">From</p>
                          <p className="font-medium">{order.pickupAddress}</p>
                        </div>
                        <div>
                          <p className="text-[#6b4f3a] text-xs">To</p>
                          <p className="font-medium">{order.receiverAddress}</p>
                        </div>
                      </div>

                      {order.driver && (
                        <p className="mt-2 text-sm text-[#351c15]">
                          <span className="text-[#6b4f3a]">Driver:</span>{" "}
                          <span className="font-medium">{order.driver.name}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarehouseDashboard;
