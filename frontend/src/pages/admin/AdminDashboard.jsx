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

  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);

  const [showRoadIssueAlert, setShowRoadIssueAlert] = useState(false);
  const [newRoadIssue, setNewRoadIssue] = useState(null);

  const [activeTab, setActiveTab] = useState("orders");

  // ---------- SIGNALR ----------
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
    } catch (err) {
      console.error("SignalR Error:", err);
    }
  };

  useEffect(() => {
    setupSignalR();
  }, []);

  // ---------- INITIAL LOAD ----------
  useEffect(() => {
    const loadData = async () => {
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
      } catch (e) {
        console.log("Dashboard init error", e);
      }
    };

    loadData();
  }, []);

  // ---------- FULL DASHBOARD FETCH ----------
  useEffect(() => {
    const fetch = async () => {
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

        const formattedDrivers = (driversRes.data || []).map((d) => ({
          userId: Number(d.userId ?? d.id),
          userFName: d.userFName ?? "",
          userLName: d.userLName ?? "",
          isAvailable: Boolean(d.isAvailable),
        }));

        setDrivers(formattedDrivers);
        setStats({
          totalUsers: dashboardRes.data.drivers.length + 5,
          activeOrders: dashboardRes.data.orders.length,
          drivers: dashboardRes.data.drivers.length,
          warehouses: warehouse.length,
          unresolvedRoadIssues: dashboardRes.data.unresolvedRoadIssues ?? 0,
        });

        setPendingOrders(pendingRes.data);
        setAssignedOrders(assignedRes.data);
        setRoadIssues(roadIssuesRes.data);
      } catch (e) {
        console.log("Fetch error:", e);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [warehouse]);

  const fetchRoadIssues = async () => {
    try {
      const r = await api.get("/roadissue/unresolved");
      setRoadIssues(r.data);
    } catch {}
  };

  const fetchDashboardData = async () => {
    try {
      const r = await api.get("/admin/dashboard");
      setStats((p) => ({
        ...p,
        unresolvedRoadIssues: r.data.unresolvedRoadIssues ?? 0,
      }));
    } catch {}
  };

  const getSeverityColor = (s) => {
    if (s === "Critical") return "bg-red-600 text-white";
    if (s === "High") return "bg-orange-600 text-white";
    if (s === "Medium") return "bg-yellow-600 text-white";
    return "bg-blue-600 text-white";
  };

  const handleAssign = async (orderId) => {
    const driverId = selectedDrivers[orderId];
    if (!driverId) {
      alert("Please select a driver first.");
      return;
    }

    try {
      await api.post(`/admin/assign-driver/${orderId}/${driverId}`);
      alert("Driver assigned successfully!");

      setPendingOrders((prev) => prev.filter((o) => o.id !== orderId));
      
      const assignedRes = await api.get("/orders/assigned");
      setAssignedOrders(assignedRes.data);
      
      fetchDashboardData();

    } catch (e) {
      console.error("Assign error", e);
      alert("Failed to assign driver. " + (e.response?.data?.message || ""));
    }
  };

  const broadcastRoadIssue = async (issueId) => {
    try {
      await api.post(`/admin/broadcast-road-issue/${issueId}`);
      alert("Road issue broadcasted to all active drivers.");
    } catch (e) {
      console.error("Broadcast error", e);
      alert("Failed to broadcast issue.");
    }
  };

  const resolveRoadIssue = async (issueId) => {
    try {
      await api.post(`/roadissue/${issueId}/resolve`);
      alert("Road issue marked as resolved.");
      
      fetchRoadIssues();
      fetchDashboardData();
    } catch (e) {
      console.error("Resolve error", e);
      alert("Failed to resolve issue.");
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f8f4ef]">
      <AdminSidebar active="dashboard" />

      <div className="flex-1">
        {/* HEADER */}
        <div className="bg-white border-b border-[#e6d8c9] shadow-sm p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-[#351c15]">Admin Dashboard</h1>
              <p className="text-[#6b4f3a]">
                Welcome back, {user?.first_name} {user?.last_name}
              </p>
            </div>

            <button
              onClick={logout}
              className="px-6 py-2 bg-[#351c15] text-white rounded-lg shadow hover:bg-[#2b1711]"
            >
              Logout
            </button>
          </div>
        </div>

        {/* SIGNALR ALERT */}
        {showRoadIssueAlert && newRoadIssue && (
          <div className="mx-6 mt-4 bg-[#fff4f4] border-l-4 border-red-500 p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-red-700">New Road Issue Reported</h3>
                <p className="text-[#351c15] mt-1">{newRoadIssue.description}</p>

                <button
                  onClick={() => {
                    broadcastRoadIssue(newRoadIssue.issueId);
                    setShowRoadIssueAlert(false);
                  }}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700"
                >
                  Broadcast Now
                </button>
              </div>

              <button
                onClick={() => setShowRoadIssueAlert(false)}
                className="text-red-700 font-bold text-xl"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* MAIN CONTENT */}
        <div className="p-6">
          {/* STAT CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            {[
              {
                title: "Total Users",
                value: stats.totalUsers,
                icon: "👥",
              },
              {
                title: "Active Orders",
                value: stats.activeOrders,
                icon: "📦",
              },
              {
                title: "Drivers",
                value: stats.drivers,
                icon: "🚚",
              },
              {
                title: "Warehouses",
                value: stats.warehouses,
                icon: "🏭",
              },
              {
                title: "Road Issues",
                value: stats.unresolvedRoadIssues,
                icon: "⚠️",
                highlight: true,
              },
            ].map((c, i) => (
              <div
                key={i}
                className={`p-6 bg-white rounded-xl shadow border ${
                  c.highlight ? "border-red-300" : "border-[#e6d8c9]"
                }`}
              >
                <div className="flex justify-between">
                  <div>
                    <p className="text-[#6b4f3a] text-sm">{c.title}</p>
                    <p
                      className={`text-3xl font-bold ${
                        c.highlight ? "text-red-600" : "text-[#351c15]"
                      }`}
                    >
                      {c.value}
                    </p>
                  </div>
                  <div className="bg-[#fdf7ed] border border-[#e6d8c9] rounded-full p-3">
                    <span className="text-2xl">{c.icon}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* TABS */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-6 py-2 rounded-lg font-medium shadow ${
                activeTab === "orders"
                  ? "bg-[#ffb500] text-[#351c15]"
                  : "bg-white text-[#351c15] border border-[#e6d8c9]"
              }`}
            >
              Orders Management
            </button>

            <button
              onClick={() => setActiveTab("roadIssues")}
              className={`px-6 py-2 rounded-lg font-medium shadow ${
                activeTab === "roadIssues"
                  ? "bg-red-600 text-white"
                  : "bg-white text-[#351c15] border border-[#e6d8c9]"
              }`}
            >
              Road Issues ({stats.unresolvedRoadIssues})
            </button>
          </div>

          {/* ROAD ISSUES TAB */}
          {activeTab === "roadIssues" && (
            <div className="bg-white rounded-xl p-6 shadow border border-[#e6d8c9] mb-8">
              <h2 className="text-xl font-bold text-[#351c15] mb-4">
                Active Road Issues
              </h2>

              {roadIssues.length === 0 ? (
                <p className="text-[#6b4f3a]">No active issues.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roadIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="p-4 bg-[#fdf7ed] border border-[#e6d8c9] rounded-lg shadow hover:bg-[#fff9ef]"
                    >
                      <div className="flex justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-[#351c15]">
                            {issue.issueType}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded text-xs ${getSeverityColor(
                              issue.severity
                            )}`}
                          >
                            {issue.severity}
                          </span>
                        </div>

                        <p className="text-xs text-[#6b4f3a]">
                          {new Date(issue.reportedAt).toLocaleString()}
                        </p>
                      </div>

                      <p className="text-[#351c15] mb-2">{issue.description}</p>

                      <p className="text-sm text-[#6b4f3a]">
                        <strong>Driver:</strong> {issue.driver?.name}
                      </p>

                      <p className="text-sm mb-3 text-[#6b4f3a]">
                        <strong>Location:</strong>{" "}
                        {issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)}
                      </p>

                      <div className="flex gap-2">
                        <button
                          onClick={() => broadcastRoadIssue(issue.id)}
                          className="flex-1 py-2 bg-[#ffb500] text-[#351c15] rounded shadow hover:bg-[#e5a400]"
                        >
                          Broadcast
                        </button>

                        <button
                          onClick={() => resolveRoadIssue(issue.id)}
                          className="flex-1 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700"
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

          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <>
              {/* Pending Orders */}
              <div className="bg-white rounded-xl p-6 shadow border border-[#e6d8c9] mb-8">
                <h2 className="text-xl font-bold text-[#351c15] mb-4">
                  Unassigned Orders
                </h2>

                {loading ? (
                  <p>Loading...</p>
                ) : pendingOrders.length === 0 ? (
                  <p className="text-[#6b4f3a]">No pending orders.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-[#e6d8c9] rounded-lg">
                      <thead className="bg-[#fdf7ed] border-b border-[#e6d8c9]">
                        <tr>
                          <th className="px-4 py-3 text-left text-[#351c15]">Order ID</th>
                          <th className="px-4 py-3 text-left text-[#351c15]">Details</th>
                          <th className="px-4 py-3 text-left text-[#351c15]">Assign</th>
                          <th className="px-4 py-3 text-left text-[#351c15]">Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {pendingOrders.map((o) => (
                          <tr
                            key={o.id}
                            className="border-b border-[#f0e6db] hover:bg-[#fff9ef]"
                          >
                            <td className="px-4 py-3 text-blue-600 underline cursor-pointer"
                              onClick={() => {
                                setSelectedOrderId(o.id);
                                setShowOrderModal(true);
                              }}>
                              #{o.id}
                            </td>

                            <td className="px-4 py-3">
                              <div className="text-[#351c15] font-medium">
                                Pickup: {o.pickupAddress}
                              </div>
                              <div className="text-[#6b4f3a]">
                                Drop: {o.receiverAddress}
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <select
                                className="border border-[#d4c7b9] rounded-lg p-2 text-[#351c15]"
                                value={selectedDrivers[o.id] ?? ""}
                                onChange={(e) =>
                                  setSelectedDrivers({
                                    ...selectedDrivers,
                                    [o.id]: Number(e.target.value),
                                  })
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

                            <td className="px-4 py-3">
                              <button
                                disabled={!selectedDrivers[o.id]}
                                onClick={() => handleAssign(o.id)}
                                className="px-4 py-2 bg-[#ffb500] rounded text-[#351c15] font-semibold shadow hover:bg-[#e5a400] disabled:opacity-40"
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
              <div className="bg-white rounded-xl p-6 shadow border border-[#e6d8c9] mb-8">
                <h2 className="text-xl font-bold text-[#351c15] mb-4">
                  Assigned Orders
                </h2>

                {assignedOrders.length === 0 ? (
                  <p className="text-[#6b4f3a]">No assigned orders.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-[#e6d8c9] rounded-lg">
                      <thead className="bg-[#fdf7ed] border-b border-[#e6d8c9]">
                        <tr>
                          <th className="px-4 py-3 text-left text-[#351c15]">Order ID</th>
                          <th className="px-4 py-3 text-left text-[#351c15]">Details</th>
                          <th className="px-4 py-3 text-left text-[#351c15]">Driver</th>
                          <th className="px-4 py-3 text-left text-[#351c15]">Status</th>
                        </tr>
                      </thead>

                      <tbody>
                        {assignedOrders.map((o) => (
                          <tr
                            key={o.id}
                            className="border-b border-[#f0e6db] hover:bg-[#fff9ef]"
                          >
                            <td
                              className="px-4 py-3 text-blue-600 underline cursor-pointer"
                              onClick={() => {
                                setSelectedOrderId(o.id);
                                setShowOrderModal(true);
                              }}
                            >
                              #{o.id}
                            </td>

                            <td className="px-4 py-3 text-[#6b4f3a]">
                              <div className="text-[#351c15] font-medium">
                                Pickup: {o.pickupAddress}
                              </div>
                              <div>Drop: {o.receiverAddress}</div>
                            </td>

                            <td className="px-4 py-3 text-blue-700 underline cursor-pointer"
                              onClick={() => {
                                setSelectedDriverId(o.driverId);
                                setShowDriverModal(true);
                              }}>
                              {o.driverName}
                            </td>

                            <td className="px-4 py-3">
                              <span className="px-3 py-1 bg-[#e8edf5] text-[#351c15] rounded-full text-sm shadow-sm">
                                {o.status}
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
        </div>
      </div>

      {/* MODALS */}
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
