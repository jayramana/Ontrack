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

<<<<<<< HEAD
  useEffect(() => {
    const loadInitial = async () => {
      try {
        const [driversRes, warehouseRes] = await Promise.all([
          api.get("/admin/drivers"),
          api.get("/warehouse"),
        ]);

        const normalizedDrivers = (driversRes.data || []).map((d) => ({
          userId: Number(d.userId ?? d.id ?? d.userId),
          userFName: d.userFName ?? d.firstName ?? d.userFName ?? "",
          userLName: d.userLName ?? d.lastName ?? d.userLName ?? "",
          isAvailable: Boolean(d.isAvailable),
          ...d,
        }));

        setDrivers(normalizedDrivers);
        setWarehouse(warehouseRes.data || []);
      } catch (err) {
        console.error("Error fetching drivers/warehouse:", err);
      }
    };

    loadInitial();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
=======
  // Load basic driver data on mount
  useEffect(() => {
    const dataFetch = async () => {
      const data = await api.get("/admin/drivers");
      console.log("DRIVERS:", data.data);
    };
    dataFetch();
  }, []);

  // Load dashboard + orders + drivers
  useEffect(() => {
    const fetchData = async () => {
>>>>>>> static
      try {
        const [dashboardRes, pendingRes, assignedRes, driversRes] =
          await Promise.all([
            api.get("/admin/dashboard"),
            api.get("/orders/pending"),
            api.get("/orders/assigned"),
            api.get("/admin/drivers"),
          ]);

        const fetchedDrivers = (driversRes?.data || []).map((d) => ({
          userId: Number(d.userId ?? d.id),
          userFName: d.userFName ?? d.firstName ?? "",
          userLName: d.userLName ?? d.lastName ?? "",
          isAvailable: Boolean(d.isAvailable),
          ...d,
        }));

        setDrivers(fetchedDrivers);

        setStats({
          totalUsers:
            dashboardRes.data?.usersCount ??
            (dashboardRes.data?.drivers?.length ?? 0) + 5,
          activeOrders: dashboardRes.data?.orders?.length ?? 0,
          drivers: fetchedDrivers.length,
          warehouses: warehouse.length,
        });

<<<<<<< HEAD
        setPendingOrders(pendingRes.data || []);
        setAssignedOrders(assignedRes.data || []);
=======
        // Backend returns empty pending list, so build it manually:
const fallbackPending = dashboardRes.data.orders.filter(o =>
  !o.driverId && (
    o.status === "Pending" ||
    o.status === "PendingAssignment" ||
    o.status === "Created"
  )
);

// If backend returns empty, use fallback
setPendingOrders(
  pendingRes.data.length > 0 ? pendingRes.data : fallbackPending
);

// Assigned orders work fine
setAssignedOrders(assignedRes.data);

        setDrivers(driversRes.data);
>>>>>>> static
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [warehouse]);

<<<<<<< HEAD
  const handleDriverSelect = (orderId, driverIdValue) => {
    const numeric = driverIdValue === "" ? undefined : Number(driverIdValue);
    setSelectedDrivers((prev) => ({ ...prev, [orderId]: numeric }));
=======
  const handleDriverSelect = (orderId, driverId) => {
    setSelectedDrivers((prev) => ({
      ...prev,
      [orderId]: driverId,
    }));
>>>>>>> static
  };

  const handleAssign = async (orderId) => {
    const driverId = selectedDrivers[orderId];
<<<<<<< HEAD
    if (!driverId && driverId !== 0) {
      alert("Please select a driver first.");
=======

    if (!driverId) {
      alert("Please select a driver.");
>>>>>>> static
      return;
    }

    try {
<<<<<<< HEAD
      await api.post(`/orders/${orderId}/assign-driver/${driverId}`, {
        driverId: driverId,
      });

      const [pendingRes, assignedRes] = await Promise.all([
        api.get("/orders/pending"),
        api.get("/orders/assigned"),
      ]);
      setPendingOrders(pendingRes.data || []);
      setAssignedOrders(assignedRes.data || []);
=======
      await api.post(`/orders/${orderId}/assign-driver/${driverId}`);

      const pendingRes = await api.get("/orders/pending");
      const assignedRes = await api.get("/orders/assigned");

      setPendingOrders(pendingRes.data);
      setAssignedOrders(assignedRes.data);

>>>>>>> static
      alert("Order assigned successfully!");
    } catch (error) {
      console.error("Error assigning order:", error);
      alert("Failed to assign order.");
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <AdminSidebar active="dashboard" />

      <div className="min-h-screen w-full bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">
                Welcome back, {user?.first_name} {user?.last_name}!
              </p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* ... stats cards unchanged ... */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {" "}
            {/* Stats Cards */}{" "}
            <div className="bg-white rounded-xl shadow-md p-6">
              {" "}
              <div className="flex items-center justify-between">
                {" "}
                <div>
                  {" "}
                  <p className="text-sm text-gray-600">Total Users</p>{" "}
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {" "}
                    {stats.totalUsers}{" "}
                  </p>{" "}
                </div>{" "}
                <div className="bg-blue-100 rounded-full p-3">
                  {" "}
                  <span className="text-2xl">👥</span>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            <div className="bg-white rounded-xl shadow-md p-6">
              {" "}
              <div className="flex items-center justify-between">
                {" "}
                <div>
                  {" "}
                  <p className="text-sm text-gray-600">Active Orders</p>{" "}
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {" "}
                    {stats.activeOrders}{" "}
                  </p>{" "}
                </div>{" "}
                <div className="bg-green-100 rounded-full p-3">
                  {" "}
                  <span className="text-2xl">📦</span>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            <div className="bg-white rounded-xl shadow-md p-6">
              {" "}
              <div className="flex items-center justify-between">
                {" "}
                <div>
                  {" "}
                  <p className="text-sm text-gray-600">Drivers</p>{" "}
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {" "}
                    {stats.drivers}{" "}
                  </p>{" "}
                </div>{" "}
                <div className="bg-yellow-100 rounded-full p-3">
                  {" "}
                  <span className="text-2xl">🚚</span>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            <div className="bg-white rounded-xl shadow-md p-6">
              {" "}
              <div className="flex items-center justify-between">
                {" "}
                <div>
                  {" "}
                  <p className="text-sm text-gray-600">Warehouses</p>{" "}
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {" "}
                    {stats.warehouses}{" "}
                  </p>{" "}
                  <a
                    href="/admin/warehouses"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {" "}
                    Manage{" "}
                  </a>{" "}
                </div>{" "}
                <div className="bg-purple-100 rounded-full p-3">
                  {" "}
                  <span className="text-2xl">🏭</span>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
          </div>
          {/* Pending Orders Section */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Unassigned Orders</h2>

            {loading ? (
              <p>Loading...</p>
            ) : pendingOrders.length === 0 ? (
              <p className="text-gray-500">No pending orders.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                        Order ID
                      </th>
                      <th className="px-6 py-3">Details</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Assign Driver</th>
                      <th className="px-6 py-3">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {pendingOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 font-medium">
                          #{order.id}
                        </td>

                        <td className="px-6 py-4">
                          <div>Pickup: {order.pickupAddress}</div>
                          <div>Drop: {order.receiverAddress}</div>
                          <div className="text-xs text-gray-400">
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
<<<<<<< HEAD
                            className="border rounded p-1"
                            value={selectedDrivers[order.id] ?? ""}
=======
                            className="border rounded p-2"
                            value={selectedDrivers[order.id] || ""}
>>>>>>> static
                            onChange={(e) =>
                              handleDriverSelect(order.id, e.target.value)
                            }
                          >
                            <option value="">Select Driver</option>
                            {drivers.map((d) => (
                              <option key={d.userId} value={d.userId}>
                                {d.userFName} {d.userLName}{" "}
<<<<<<< HEAD
                                {d.isAvailable ? "(Available)" : "(Busy)"}
=======
                                {d.isAvailable ? "(Avail)" : "(Busy)"}
>>>>>>> static
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleAssign(order.id)}
                            disabled={!selectedDrivers[order.id]}
                            className="text-blue-600 font-bold disabled:opacity-50"
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

          {/* Assigned Orders */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Assigned Orders</h2>

            {assignedOrders.length === 0 ? (
              <p className="text-gray-500">No assigned orders.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3">Order ID</th>
                      <th className="px-6 py-3">Details</th>
                      <th className="px-6 py-3">Driver</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
<<<<<<< HEAD
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assignedOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="font-medium">
                            Pickup: {order.pickupAddress}
                          </div>
                          <div>Drop: {order.receiverAddress}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {drivers.find(
                            (d) => d.userId === Number(order.driverId)
                          )
                            ? `${
                                drivers.find(
                                  (d) => d.userId === Number(order.driverId)
                                ).userFName
                              } ${
                                drivers.find(
                                  (d) => d.userId === Number(order.driverId)
                                ).userLName
                              }`
                            : "Unknown"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
=======

                  <tbody className="divide-y divide-gray-200">
                    {assignedOrders.map((order) => {
                      const driver = drivers.find(
                        (d) => d.userId === order.driverId
                      );

                      return (
                        <tr key={order.id}>
                          <td className="px-6 py-4 font-medium">
                            #{order.id}
                          </td>

                          <td className="px-6 py-4">
                            <div>Pickup: {order.pickupAddress}</div>
                            <div>Drop: {order.receiverAddress}</div>
                          </td>

                          <td className="px-6 py-4">
                            {driver
                              ? `${driver.userFName} ${driver.userLName}`
                              : "Unknown"}
                          </td>

                          <td className="px-6 py-4">
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
>>>>>>> static
                  </tbody>

                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
