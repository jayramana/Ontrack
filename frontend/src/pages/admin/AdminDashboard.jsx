import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import * as signalR from "@microsoft/signalr";
import OrderDetailsModal from "./OrderDetailsModal";
import DriverDetailsModal from "./DriverDetailsModal";

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
    unresolvedRoadIssues: 0,
  });

  const [pendingOrders, setPendingOrders] = useState([]);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [roadIssues, setRoadIssues] = useState([]);

  // ===== MODALS =====
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);

  // ===== ROAD ISSUE UI =====
  const [showRoadIssueAlert, setShowRoadIssueAlert] = useState(false);
  const [newRoadIssue, setNewRoadIssue] = useState(null);
  const [activeTab, setActiveTab] = useState("orders"); // orders | roadIssues

  // ========= SIGNALR ==========
  const setupSignalR = async () => {
    try {
      const connection = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:5066/hubs/logistics")
        .withAutomaticReconnect()
        .build();

      connection.on("RoadIssueReported", (data) => {
        setNewRoadIssue(data);
        setShowRoadIssueAlert(true);
        fetchRoadIssues();
        fetchDashboardData();
      });

      await connection.start();
      await connection.invoke("JoinAdminGroup");
    } catch (error) {
      console.error("SignalR Error:", error);
    }
  };

  useEffect(() => {
    setupSignalR();
  }, []);

  // ========= FETCH WAREHOUSE + DRIVERS ===========
  useEffect(() => {
    const loadInitial = async () => {
      try {
        const [driversRes, warehouseRes] = await Promise.all([
          api.get("/admin/drivers"),
          api.get("/warehouse"),
        ]);

        const normalizedDrivers = (driversRes.data || []).map((d) => ({
          userId: Number(d.userId ?? d.id),
          userFName: d.userFName ?? "",
          userLName: d.userLName ?? "",
          isAvailable: Boolean(d.isAvailable),
          ...d,
        }));

        setDrivers(normalizedDrivers);
        setWarehouse(warehouseRes.data || []);
      } catch (err) {
        console.error("Error fetching initial data:", err);
      }
    };

    loadInitial();
  }, []);

  // ========= FETCH FULL DASHBOARD ===========
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [
          dashboardRes,
          pendingRes,
          assignedRes,
          driversRes,
          roadIssuesRes,
        ] = await Promise.all([
          api.get("/admin/dashboard"),
          api.get("/orders/pending"),
          api.get("/orders/assigned"),
          api.get("/admin/drivers"),
          api.get("/roadissue/unresolved"),
        ]);

        const fetchedDrivers = (driversRes?.data || []).map((d) => ({
          userId: Number(d.userId ?? d.id),
          userFName: d.userFName ?? "",
          userLName: d.userLName ?? "",
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
          unresolvedRoadIssues: dashboardRes.data?.unresolvedRoadIssues ?? 0,
        });

        setPendingOrders(pendingRes.data || []);
        setAssignedOrders(assignedRes.data || []);
        setRoadIssues(roadIssuesRes.data || []);
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [warehouse]);

  // ========= ROAD ISSUES FETCH ===========
  const fetchRoadIssues = async () => {
    try {
      const res = await api.get("/roadissue/unresolved");
      setRoadIssues(res.data);
    } catch (err) {
      console.error("Error loading road issues:", err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const res = await api.get("/admin/dashboard");
      setStats((prev) => ({
        ...prev,
        unresolvedRoadIssues: res.data.unresolvedRoadIssues ?? 0,
      }));
    } catch (err) {
      console.log(err);
    }
  };

  // ========= ACTIONS ===========
  const handleOrderClick = (id) => {
    setSelectedOrderId(id);
    setShowOrderModal(true);
  };

  const handleDriverClick = (id) => {
    setSelectedDriverId(id);
    setShowDriverModal(true);
  };

  const handleDriverSelect = (orderId, value) => {
    const numeric = value === "" ? undefined : Number(value);
    setSelectedDrivers((prev) => ({ ...prev, [orderId]: numeric }));
  };

  const handleAssign = async (orderId) => {
    const driverId = selectedDrivers[orderId];
    if (!driverId) return alert("Select driver first.");

    try {
      await api.post(`/admin/assign-driver/${orderId}/${driverId}`);

      const [pendingRes, assignedRes] = await Promise.all([
        api.get("/orders/pending"),
        api.get("/orders/assigned"),
      ]);

      setPendingOrders(pendingRes.data);
      setAssignedOrders(assignedRes.data);

      alert("Order assigned successfully!");
    } catch (err) {
      alert(
        "Failed to assign order: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const broadcastRoadIssue = async (id) => {
    try {
      const res = await api.post(`/admin/broadcast-road-issue/${id}`);
      alert(
        `Road issue broadcasted to ${res.data.affectedDrivers} drivers. Routes re-optimized.`
      );
      fetchRoadIssues();
    } catch {
      alert("Failed to broadcast road issue");
    }
  };

  const resolveRoadIssue = async (id) => {
    try {
      await api.post(`/roadissue/${id}/resolve`);
      alert("Road issue resolved.");
      fetchRoadIssues();
      fetchDashboardData();
    } catch {
      alert("Failed to resolve road issue");
    }
  };

  const getSeverityColor = (severity) => {
    if (severity === "Critical") return "bg-red-600 text-white";
    if (severity === "High") return "bg-orange-600 text-white";
    if (severity === "Medium") return "bg-yellow-600 text-white";
    return "bg-blue-600 text-white";
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <AdminSidebar active="dashboard" />

      <div className="min-h-screen w-full bg-gray-50">
        {/* ========== HEADER ========== */}
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

        {/* ========== SIGNALR BANNER ========== */}
        {showRoadIssueAlert && newRoadIssue && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 mx-4 mt-4 rounded shadow">
            <div className="flex justify-between">
              <div>
                <h3 className="font-bold text-red-800">New Road Issue!</h3>
                <p className="text-sm">{newRoadIssue.description}</p>
                <button
                  onClick={() => {
                    broadcastRoadIssue(newRoadIssue.issueId);
                    setShowRoadIssueAlert(false);
                  }}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded"
                >
                  Broadcast to Drivers
                </button>
              </div>
              <button
                onClick={() => setShowRoadIssueAlert(false)}
                className="text-red-900 font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* ========== MAIN CONTENT ========== */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.totalUsers}
                  </p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <span className="text-2xl">👥</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Orders</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.activeOrders}
                  </p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <span className="text-2xl">📦</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Drivers</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.drivers}
                  </p>
                </div>
                <div className="bg-yellow-100 rounded-full p-3">
                  <span className="text-2xl">🚚</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Warehouses</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.warehouses}
                  </p>
                  <a
                    href="/admin/warehouses"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Manage
                  </a>
                </div>
                <div className="bg-purple-100 rounded-full p-3">
                  <span className="text-2xl">🏭</span>
                </div>
              </div>
            </div>

            {/* 🆕 ROAD ISSUES CARD */}
            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Road Issues</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    {stats.unresolvedRoadIssues}
                  </p>
                  <button
                    onClick={() => setActiveTab("roadIssues")}
                    className="text-sm text-red-600 hover:underline mt-1"
                  >
                    View All
                  </button>
                </div>
                <div className="bg-red-100 rounded-full p-3">
                  <span className="text-2xl">⚠️</span>
                </div>
              </div>
            </div>
          </div>

          {/* ===== TABS: ORDERS / ROAD ISSUES ===== */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-6 py-2 rounded-lg ${
                activeTab === "orders"
                  ? "bg-blue-600 text-white"
                  : "bg-white shadow"
              }`}
            >
              Orders Management
            </button>

            <button
              onClick={() => setActiveTab("roadIssues")}
              className={`px-6 py-2 rounded-lg ${
                activeTab === "roadIssues"
                  ? "bg-red-600 text-white"
                  : "bg-white shadow"
              }`}
            >
              Road Issues ({stats.unresolvedRoadIssues})
            </button>
          </div>

          {/* ================= ROAD ISSUES TAB ================= */}
          {activeTab === "roadIssues" && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Active Road Issues</h2>

              {roadIssues.length === 0 ? (
                <p className="text-gray-500">No active road issues.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roadIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="border-2 border-red-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between mb-2">
                        <div>
                          <h3 className="font-bold">{issue.issueType}</h3>
                          <span
                            className={`px-2 py-1 rounded text-xs ${getSeverityColor(
                              issue.severity
                            )}`}
                          >
                            {issue.severity}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(issue.reportedAt).toLocaleString()}
                        </p>
                      </div>

                      <p className="mb-2">{issue.description}</p>
                      <p className="text-sm">
                        <strong>Reported by:</strong> {issue.driver?.name}
                      </p>

                      <p className="text-sm mb-3">
                        <strong>Location:</strong> {issue.latitude.toFixed(4)},{" "}
                        {issue.longitude.toFixed(4)}
                      </p>

                      <div className="flex gap-2">
                        <button
                          onClick={() => broadcastRoadIssue(issue.id)}
                          className="flex-1 bg-orange-600 text-white px-3 py-2 rounded"
                        >
                          Broadcast
                        </button>

                        <button
                          onClick={() => resolveRoadIssue(issue.id)}
                          className="flex-1 bg-green-600 text-white px-3 py-2 rounded"
                        >
                          Resolve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= ORDERS TAB ================= */}
          {activeTab === "orders" && (
            <>
              {/* ===== PENDING ORDERS ===== */}
              <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <h2 className="text-xl font-bold mb-4">Unassigned Orders</h2>

                {loading ? (
                  <p>Loading...</p>
                ) : pendingOrders.length === 0 ? (
                  <p>No pending orders.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3">Order ID</th>
                          <th className="px-6 py-3">Details</th>
                          <th className="px-6 py-3">Assign</th>
                          <th className="px-6 py-3">Action</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-200">
                        {pendingOrders.map((order) => (
                          <tr key={order.id}>
                            <td className="px-6 py-4">
                              <button
                                className="text-blue-600 underline"
                                onClick={() => handleOrderClick(order.id)}
                              >
                                #{order.id}
                              </button>
                            </td>

                            <td className="px-6 py-4">
                              <div>Pickup: {order.pickupAddress}</div>
                              <div>Drop: {order.receiverAddress}</div>
                            </td>

                            <td className="px-6 py-4">
                              <select
                                className="border rounded p-2"
                                value={selectedDrivers[order.id] ?? ""}
                                onChange={(e) =>
                                  handleDriverSelect(order.id, e.target.value)
                                }
                              >
                                <option value="">Select Driver</option>
                                {drivers.map((d) => (
                                  <option key={d.userId} value={d.userId}>
                                    {d.userFName} {d.userLName}{" "}
                                    {d.isAvailable ? "(Available)" : "(Busy)"}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="px-6 py-4">
                              <button
                                disabled={!selectedDrivers[order.id]}
                                onClick={() => handleAssign(order.id)}
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

              {/* ===== ASSIGNED ORDERS ===== */}
              <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Assigned Orders
                </h2>
                {loading ? (
                  <p>Loading...</p>
                ) : assignedOrders.length === 0 ? (
                  <p className="text-gray-500">No assigned orders.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Details
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Driver
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {assignedOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => handleOrderClick(order.id)}
                                className="text-sm font-medium text-blue-600 hover:text-blue-900 hover:underline"
                              >
                                #{order.id}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              <div className="font-medium">
                                Pickup: {order.pickupAddress}
                              </div>
                              <div>Drop: {order.receiverAddress}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {order.driverName ? (
                                <button
                                  onClick={() =>
                                    handleDriverClick(order.driverId)
                                  }
                                  className="text-blue-600 hover:text-blue-900 hover:underline"
                                >
                                  {order.driverName}
                                </button>
                              ) : (
                                "Unknown"
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* ========== MODALS ========== */}
      {showOrderModal && (
        <OrderDetailsModal
          orderId={selectedOrderId}
          onClose={() => setShowOrderModal(false)}
        />
      )}

      {showDriverModal && (
        <DriverDetailsModal
          driverId={selectedDriverId}
          onClose={() => setShowDriverModal(false)}
        />
      )}
    </div>
  );
}
