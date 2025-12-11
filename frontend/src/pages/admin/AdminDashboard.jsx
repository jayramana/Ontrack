import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  const [drivers, setDrivers] = useState([]);
  const [warehouse, setWarehouse] = useState([]);

  const [selectedDrivers, setSelectedDrivers] = useState({});
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeOrders: 0,
    drivers: 0,
    warehouses: 0,
  });

  const [pendingOrders, setPendingOrders] = useState([]);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initial driver fetch
  useEffect(() => {
    const dataFetch = async () => {
      const data = await api.get("/admin/drivers");
      console.log("DRIVERS:", data.data);
    };
    dataFetch();
  }, []);

  // Dashboard data fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardRes, pendingRes, assignedRes, driversRes] =
          await Promise.all([
            api.get("/admin/dashboard"),
            api.get("/orders/pending"),
            api.get("/orders/assigned"),
            api.get("/admin/drivers"),
          ]);

        setStats({
          totalUsers: dashboardRes.data.drivers.length + 5,
          activeOrders: dashboardRes.data.orders.length,
          drivers: dashboardRes.data.drivers.length,
          warehouses: warehouse.length,
        });

        const fallbackPending = dashboardRes.data.orders.filter(
          (o) =>
            !o.driverId &&
            (o.status === "Pending" ||
              o.status === "PendingAssignment" ||
              o.status === "Created")
        );

        setPendingOrders(
          pendingRes.data.length > 0 ? pendingRes.data : fallbackPending
        );

        setAssignedOrders(assignedRes.data);
        setDrivers(driversRes.data);
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [warehouse]);

  // Select driver
  const handleDriverSelect = (orderId, driverId) => {
    setSelectedDrivers((prev) => ({
      ...prev,
      [orderId]: driverId,
    }));
  };

  // Assign order
  const handleAssign = async (orderId) => {
    const driverId = selectedDrivers[orderId];

    if (!driverId) {
      alert("Please select a driver.");
      return;
    }

    try {
      await api.post(`/orders/${orderId}/assign-driver/${driverId}`);

      const pendingRes = await api.get("/orders/pending");
      const assignedRes = await api.get("/orders/assigned");

      setPendingOrders(pendingRes.data);
      setAssignedOrders(assignedRes.data);

      alert("Order assigned successfully!");
    } catch (error) {
      console.error("Error assigning order:", error);
      alert("Failed to assign order.");
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f8f4ef]">

      {/* Sidebar */}
      <AdminSidebar active="dashboard" />

      {/* MAIN CONTENT AREA – same layout as Insights */}
      <div className="flex-1 p-8">

        {/* PAGE HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#351c15]">Admin Dashboard</h1>
            <p className="text-[#6b4f3a]">
              Welcome back, {user?.first_name} {user?.last_name}!
            </p>
          </div>

          <button
            onClick={logout}
            className="px-4 py-2 bg-[#ffb500] text-[#351c15] font-semibold rounded-lg hover:bg-[#e6a300] transition"
          >
            Logout
          </button>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Users", value: stats.totalUsers, icon: "👥" },
            { label: "Active Orders", value: stats.activeOrders, icon: "📦" },
            { label: "Drivers", value: stats.drivers, icon: "🚚" },
            { label: "Warehouses", value: stats.warehouses, icon: "🏭" },
          ].map((card, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow p-6 border border-[#e6d8c9]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#6b4f3a]">{card.label}</p>
                  <p className="text-3xl font-bold text-[#351c15] mt-2">
                    {card.value}
                  </p>
                </div>
                <div className="bg-[#ffb500]/20 text-[#351c15] p-3 rounded-full text-2xl">
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* UNASSIGNED ORDERS */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-[#e6d8c9]">
          <h2 className="text-xl font-bold text-[#351c15] mb-4">Unassigned Orders</h2>

          {loading ? (
            <p className="text-[#6b4f3a]">Loading...</p>
          ) : pendingOrders.length === 0 ? (
            <p className="text-[#6b4f3a]">No pending orders.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#e6d8c9]">
                <thead className="bg-[#fff8e6] text-[#351c15] font-semibold">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs">Order ID</th>
                    <th className="px-6 py-3">Details</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Assign Driver</th>
                    <th className="px-6 py-3">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#e6d8c9]">
                  {pendingOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#fdf7ed]">
                      <td className="px-6 py-4 font-semibold text-[#351c15]">
                        #{order.id}
                      </td>

                      <td className="px-6 py-4 text-[#4e2a1f]">
                        <div>Pickup: {order.pickupAddress}</div>
                        <div>Drop: {order.receiverAddress}</div>
                        <div className="text-xs text-gray-500">
                          Weight: {order.weight}kg
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            order.deliveryType === "ASR"
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {order.deliveryType}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <select
                          className="border border-[#d4c7b9] rounded p-2 bg-white focus:ring-2 focus:ring-[#ffb500]"
                          value={selectedDrivers[order.id] || ""}
                          onChange={(e) =>
                            handleDriverSelect(order.id, e.target.value)
                          }
                        >
                          <option value="">Select Driver</option>
                          {drivers.map((d) => (
                            <option key={d.userId} value={d.userId}>
                              {d.userFName} {d.userLName}{" "}
                              {d.isAvailable ? "(Avail)" : "(Busy)"}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleAssign(order.id)}
                          disabled={!selectedDrivers[order.id]}
                          className="px-3 py-1 rounded bg-[#ffb500] text-[#351c15] font-semibold hover:bg-[#e6a300] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Assign
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ASSIGNED ORDERS */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-[#e6d8c9]">
          <h2 className="text-xl font-bold text-[#351c15] mb-4">
            Assigned Orders
          </h2>

          {assignedOrders.length === 0 ? (
            <p className="text-[#6b4f3a]">No assigned orders.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#e6d8c9]">
                <thead className="bg-[#fff8e6] text-[#351c15] font-semibold">
                  <tr>
                    <th className="px-6 py-3">Order ID</th>
                    <th className="px-6 py-3">Details</th>
                    <th className="px-6 py-3">Driver</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#e6d8c9]">
                  {assignedOrders.map((order) => {
                    const driver = drivers.find(
                      (d) => d.userId === order.driverId
                    );

                    return (
                      <tr key={order.id} className="hover:bg-[#fdf7ed]">
                        <td className="px-6 py-4 font-semibold text-[#351c15]">
                          #{order.id}
                        </td>

                        <td className="px-6 py-4 text-[#4e2a1f]">
                          <div>Pickup: {order.pickupAddress}</div>
                          <div>Drop: {order.receiverAddress}</div>
                        </td>

                        <td className="px-6 py-4 text-[#351c15]">
                          {driver
                            ? `${driver.userFName} ${driver.userLName}`
                            : "Unknown"}
                        </td>

                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs rounded-full bg-[#ffb500]/30 text-[#351c15] font-semibold">
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
