import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import React from "react";
import DriverSidebar from "./DriverSidebar";
import api from "../../services/api";
import * as signalR from "@microsoft/signalr";
import { useNavigate } from "react-router-dom";
import OrderDetailsModal from "./OrderDetailsModal";

export default function DriverDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [optimizedRoute, setOptimizedRoute] = useState([]);
  const [route, setRoute] = useState(null); // updated route from server
  const [warehouse, setWarehouse] = useState(null);
  const [locationSharing, setLocationSharing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("today");

  // Alerts / UI from first block
  const [showRescheduleAlert, setShowRescheduleAlert] = useState(false);
  const [rescheduleInfo, setRescheduleInfo] = useState(null);
  const [showRoadIssueAlert, setShowRoadIssueAlert] = useState(false);
  const [roadIssueInfo, setRoadIssueInfo] = useState(null);

  // Modal
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const openOrderDetails = (id) => {
    setSelectedOrderId(id);
    setShowOrderModal(true);
  };

  // SignalR connection ref (kept in state so cleanup can use it)
  const [connection, setConnection] = useState(null);

  // ---------------------------
  // SignalR setup (from first block)
  // ---------------------------
  const setupSignalR = async () => {
    if (!user?.userId) return;

    try {
      const conn = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:5066/hubs/logistics", {
          accessTokenFactory: () => localStorage.getItem("token") || "",
        })
        .withAutomaticReconnect()
        .build();

      conn.on("ReceiveRouteUpdate", (routeData) => {
        console.log("📡 New Route Update:", routeData);
        setRoute(routeData);
        setOptimizedRoute(routeData.stops || []);
      });

      conn.on("OrderRescheduled", (data) => {
        console.log("🔔 Order Rescheduled:", data);
        setRescheduleInfo(data);
        setShowRescheduleAlert(true);
        fetchTodaysOrders();
      });

      conn.on("RoadIssueAlert", (data) => {
        console.log("⚠️ Road Issue Alert:", data);
        setRoadIssueInfo(data);
        setShowRoadIssueAlert(true);
        // route updates expected via ReceiveRouteUpdate
      });

      await conn.start();
      console.log("🟢 Driver connected to SignalR");

      // Join groups (use numeric id)
      if (user?.userId) {
        await conn.invoke("JoinDriverRouteGroup", Number(user.userId));
        await conn.invoke("JoinDriverGroup", Number(user.userId));
      }

      setConnection(conn);
    } catch (error) {
      console.error("SignalR Error:", error);
    }
  };

  useEffect(() => {
    setupSignalR();
    return () => {
      if (connection) {
        connection.stop().catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]);

  // ---------------------------
  // REST API calls
  // ---------------------------
  const fetchTodaysOrders = async () => {
    try {
      const response = await api.get("/driver/orders/today/full");
      setOrders(response.data || []);
      if (response.data?.length > 0 && response.data[0].currentWarehouse) {
        setWarehouse(response.data[0].currentWarehouse);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptimizedRoute = async () => {
    try {
      const response = await api.get("/driver/route/optimized/full");
      setOptimizedRoute(response.data || []);
    } catch (error) {
      console.error("Error fetching optimized route:", error);
    }
  };

  useEffect(() => {
    fetchTodaysOrders();
    fetchOptimizedRoute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live location sharing
  useEffect(() => {
    let locationInterval;
    if (locationSharing) {
      locationInterval = setInterval(shareLocation, 10000);
    }
    return () => {
      if (locationInterval) clearInterval(locationInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationSharing]);

  const shareLocation = async () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await api.post("/driver/location", {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            speed: position.coords.speed || 0,
            heading: position.coords.heading || 0,
          });
        } catch (error) {
          console.error("Error sharing location:", error);
        }
      },
      (err) => {
        console.warn("Geolocation error:", err);
      },
      { enableHighAccuracy: true }
    );
  };

  const markDelivered = async (id) => {
    try {
      await api.post(`/driver/mark-delivered/${orderId}`);
      await fetchTodaysOrders();
      await fetchOptimizedRoute();
      alert("✅ Order Delivered!");
    } catch (error) {
      console.error("Error marking delivered:", error);
      alert("Failed to mark delivered");
    }
  };

  const markAttempted = async (orderId) => {
    const reason = prompt("Reason for failed delivery:");
    if (!reason) return;
    try {
      await api.post(`/driver/mark-attempted/${orderId}`, { reason });
      await fetchTodaysOrders();
      await fetchOptimizedRoute();
      alert("⚠️ Attempt recorded");
    } catch (error) {
      console.error("Error marking attempted:", error);
      alert("Failed to record attempt");
    }
  };

  // Report issue (navigates to page or prompts, included from first block)
  const reportIssue = () => {
    navigate("/driver/report-issue");
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 1:
        return (
          <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
            High Priority
          </span>
        );
      case 2:
        return (
          <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
            Normal
          </span>
        );
      case 3:
        return (
          <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">
            Low/Rescheduled
          </span>
        );
      default:
        return null;
    }
  };

  const renderOrder = (o, idx) => (
    <div
      key={order.id}
      className="bg-white rounded-lg shadow p-4 hover:shadow-md transition"
      onClick={() => openOrderDetails(order.id)}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-semibold text-gray-900">#{index + 1}</span>
            {getPriorityBadge(order.priority)}
          </div>
          <p className="text-sm text-gray-600">Order ID: {order.id}</p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            o.status === "Delivered"
              ? "bg-green-100 text-green-700"
              : o.status === "InTransit"
              ? "bg-blue-100 text-blue-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {o.status}
        </span>
      </div>

      {/* Content */}
      <div className="space-y-3 mb-4">
        <div>
          <p className="text-xs text-gray-500">Receiver</p>
          <p className="font-medium text-[#351c15]">{o.receiverName}</p>
          <p className="text-sm text-gray-600">{o.receiverPhone}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Delivery Address</p>
          <p className="text-sm">{o.receiverAddress}</p>
        </div>

        {o.destinationWarehouse && (
          <div>
            <p className="text-xs text-gray-500">Warehouse</p>
            <p className="text-sm font-medium text-blue-600">
              {order.destinationWarehouse.name}
            </p>
            <p className="text-xs text-gray-500">{order.destinationWarehouse.city}</p>
          </div>
        )}
        {order.deliveryNotes && (
          <div>
            <p className="text-xs text-gray-500">Notes</p>
            <p className="text-sm">{order.deliveryNotes}</p>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            markDelivered(order.id);
          }}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          Delivered
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            markAttempted(order.id);
          }}
          className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          Attempted
        </button>
      </div>
    </div>
  );

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex bg-[#f8f4ef]">
      <DriverSidebar active="dashboard" />
      <div className="w-[100%] flex flex-col">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Welcome back, {user?.first_name} {user?.last_name}!
                </p>
                {warehouse && (
                  <p className="text-sm text-blue-600 font-medium mt-1">
                    📍 Assigned to: {warehouse.warehouseName || warehouse.name}, {warehouse.city}
                  </p>
                )}
              </div>
              <button onClick={logout} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-200">
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Reschedule alert */}
          {showRescheduleAlert && rescheduleInfo && (
            <div className="bg-orange-100 border-l-4 border-orange-500 p-4 mb-6 rounded shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-orange-800 mb-2">🔔 Order Rescheduled</h3>
                  <p className="text-sm text-orange-700">Order #{rescheduleInfo.orderId} ({rescheduleInfo.trackingId})</p>
                  <p className="text-sm text-orange-700">Customer: {rescheduleInfo.customerName}</p>
                  <p className="text-sm text-orange-700">New Date: {new Date(rescheduleInfo.newDate).toLocaleString()}</p>
                  {rescheduleInfo.aiPriority && <p className="text-sm text-orange-700 font-bold">AI Priority: {rescheduleInfo.aiPriority}/5</p>}
                  {rescheduleInfo.reason && <p className="text-sm text-orange-700 mt-1">Reason: {rescheduleInfo.reason}</p>}
                </div>
                <button onClick={() => setShowRescheduleAlert(false)} className="text-orange-800 hover:text-orange-900 font-bold">✕</button>
              </div>
            </div>
          )}

          {/* Road issue alert */}
          {showRoadIssueAlert && roadIssueInfo && (
            <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6 rounded shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-red-800 mb-2">⚠️ Road Issue Alert</h3>
                  <p className="text-sm text-red-700"><strong>Type:</strong> {roadIssueInfo.issueType}</p>
                  <p className="text-sm text-red-700"><strong>Severity:</strong> {roadIssueInfo.severity}</p>
                  <p className="text-sm text-red-700">{roadIssueInfo.description}</p>
                  <p className="text-sm text-red-700 mt-1">Reported by: {roadIssueInfo.reportedBy || roadIssueInfo.driverName}</p>
                  <p className="text-sm text-red-600 font-semibold mt-2">🔄 Your route has been automatically re-optimized</p>
                </div>
                <button onClick={() => setShowRoadIssueAlert(false)} className="text-red-800 hover:text-red-900 font-bold">✕</button>
              </div>
            </div>
          )}

          {route && (
            <div className="bg-blue-50 border p-4 rounded-lg shadow mb-6">
              <h2 className="text-xl font-bold mb-3">🚚 Updated Route</h2>
              {(route.stops || []).map((stop, i) => (
                <div key={i} className="py-2 border-b">
                  <p className="font-semibold">Stop {stop.sequence}</p>
                  <p>Order #{stop.orderId}</p>
                  {stop.aiPriority && <p className="text-sm text-blue-700 font-bold">AI Priority: {stop.aiPriority}/5</p>}
                  <p>ETA: {stop.etaMinutes} mins</p>
                </div>
              ))}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500 text-sm">Today's Deliveries</p>
              <p className="text-3xl font-bold text-blue-600">{orders.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500 text-sm">High Priority</p>
              <p className="text-3xl font-bold text-red-600">{orders.filter((o) => o.priority === 1).length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500 text-sm">Normal</p>
              <p className="text-3xl font-bold text-blue-600">{orders.filter((o) => o.priority === 2).length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500 text-sm">Rescheduled</p>
              <p className="text-3xl font-bold text-gray-600">{orders.filter((o) => o.priority === 3).length}</p>
            </div>
          </div>

          {/* Location Sharing Toggle */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Live Location Sharing</h3>
                <p className="text-sm text-gray-600">Share your location with customers every 10 seconds</p>
              </div>

              <button
                onClick={() => setLocationSharing(!locationSharing)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${locationSharing ? "bg-green-600" : "bg-gray-200"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${locationSharing ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>

            {locationSharing && <p className="text-xs text-green-600 mt-2">🟢 Location sharing active</p>}
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button onClick={() => setActiveTab("today")} className={`px-6 py-2 rounded-lg font-medium transition ${activeTab === "today" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}>
              Today's Orders ({orders.length})
            </button>
            <button onClick={() => setActiveTab("optimized")} className={`px-6 py-2 rounded-lg font-medium transition ${activeTab === "optimized" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}>
              Optimized Route ({optimizedRoute.length})
            </button>
          </div>

          {/* Orders List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeTab === "today" && orders.length === 0 && <div className="col-span-2 bg-white rounded-lg shadow p-8 text-center"><p className="text-gray-500">No orders assigned for today</p></div>}
            {activeTab === "today" && orders.map((order, index) => renderOrder(order, index))}

            {activeTab === "optimized" && optimizedRoute.length === 0 && <div className="col-span-2 bg-white rounded-lg shadow p-8 text-center"><p className="text-gray-500">No orders in optimized route</p></div>}
            {activeTab === "optimized" && optimizedRoute.map((order, index) => renderOrder(order, index))}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={() => navigate("/driver/route")} className="bg-blue-600 text-white rounded-lg p-4 hover:bg-blue-700 transition">📍 View Route on Map</button>

            <button onClick={() => {
              const issueType = prompt("Enter issue type (e.g., Traffic, Accident, Road Block):");
              if (issueType) {
                const description = prompt("Enter description:");
                if (description && navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(async (position) => {
                    try {
                      await api.post("/driver/report-issue", {
                        issueType,
                        description,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                      });
                      alert("Issue reported successfully!");
                    } catch (error) {
                      console.error("Error reporting issue:", error);
                      alert("Failed to report issue");
                    }
                  });
                }
              }
            }} className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg p-4 font-medium transition">⚠️ Report Road Issue</button>
          </div>
        </div>
      </div>

      {showOrderModal && (
        <OrderDetailsModal
          orderId={selectedOrderId}
          onClose={() => setShowOrderModal(false)}
        />
      )}
    </div>
  );
}
