// UPS THEMED DRIVER DASHBOARD
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
  const [route, setRoute] = useState(null);
  const [warehouse, setWarehouse] = useState(null);
  const [locationSharing, setLocationSharing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("today");

  // Alerts
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

  const [connection, setConnection] = useState(null);

  // ---------------------------------------------
  // SIGNALR SETUP
  // ---------------------------------------------
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
        setRoute(routeData);
        setOptimizedRoute(routeData.stops || []);
      });

      conn.on("OrderRescheduled", (data) => {
        setRescheduleInfo(data);
        setShowRescheduleAlert(true);
        fetchTodaysOrders();
      });

      conn.on("RoadIssueAlert", (data) => {
        setRoadIssueInfo(data);
        setShowRoadIssueAlert(true);
      });

      await conn.start();
      await conn.invoke("JoinDriverRouteGroup", Number(user.userId));
      await conn.invoke("JoinDriverGroup", Number(user.userId));
      setConnection(conn);
    } catch (error) {
      console.error("SignalR Error:", error);
    }
  };

  useEffect(() => {
    setupSignalR();
    return () => connection && connection.stop();
  }, [user?.userId]);

  // ---------------------------------------------
  // DATA FETCHING
  // ---------------------------------------------
  const fetchTodaysOrders = async () => {
    try {
      const response = await api.get("/driver/orders/today/full");
      setOrders(response.data || []);
      if (response.data?.length > 0) {
        setWarehouse(response.data[0].currentWarehouse);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchOptimizedRoute = async () => {
    try {
      const response = await api.get("/driver/route/optimized");
      setOptimizedRoute(response.data || []);
    } catch (e) {}
  };

  useEffect(() => {
    fetchTodaysOrders();
    fetchOptimizedRoute();
  }, []);

  // ---------------------------------------------
  // LOCATION SHARING
  // ---------------------------------------------
  useEffect(() => {
    let interval;
    if (locationSharing) {
      interval = setInterval(shareLocation, 10000);
    }
    return () => clearInterval(interval);
  }, [locationSharing]);

  const shareLocation = async () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await api.post("/driver/location", {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      () => {}
    );
  };

  // ---------------------------------------------
  // ORDER ACTIONS
  // ---------------------------------------------
  const markDelivered = async (id) => {
    try {
      await api.post(`/driver/mark-delivered/${id}`);
      fetchTodaysOrders();
      fetchOptimizedRoute();
    } catch {}
  };

  const markAttempted = async (id) => {
    const reason = prompt("Reason for failed attempt:");
    if (!reason) return;
    try {
      await api.post(`/driver/mark-attempted/${id}`, { reason });
      fetchTodaysOrders();
      fetchOptimizedRoute();
    } catch {}
  };

  // ---------------------------------------------
  // UPS BADGES
  // ---------------------------------------------
  const getPriorityBadge = (p) => {
    const styles = {
      1: "bg-red-100 text-red-800",
      2: "bg-[#f9b400]/30 text-[#351c15]",
      3: "bg-gray-200 text-gray-700",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[p]}`}>
        {p === 1 ? "High Priority" : p === 2 ? "Normal" : "Rescheduled"}
      </span>
    );
  };

  // ---------------------------------------------
  // ORDER CARD (UPS THEME)
  // ---------------------------------------------
  const renderOrder = (order, idx) => (
    <div
      key={order.id}
      className="bg-[#fff8e7] border border-[#e6ddc5] rounded-xl p-6 shadow hover:shadow-md transition cursor-pointer"
      onClick={() => openOrderDetails(order.id)}
    >
      {/* Header */}
      <div className="flex justify-between mb-4">
        <div>
          <h3 className="font-bold text-[#351c15] text-lg">Stop #{idx + 1}</h3>
          {getPriorityBadge(order.priority)}
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            order.status === "Delivered"
              ? "bg-green-100 text-green-700"
              : "bg-[#f9b400]/20 text-[#351c15]"
          }`}
        >
          {order.status}
        </span>
      </div>

      <p className="text-sm text-[#6f4e37] mb-1">Receiver</p>
      <p className="font-semibold text-[#351c15]">{order.receiverName}</p>

      <p className="text-sm text-[#6f4e37] mt-3">Address</p>
      <p className="text-sm">{order.receiverAddress}</p>

      {/* Buttons */}
      <div className="flex gap-3 mt-5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            markDelivered(order.id);
          }}
          className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2 rounded-lg"
        >
          Delivered
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            markAttempted(order.id);
          }}
          className="flex-1 bg-[#f9b400] hover:bg-[#e0a200] text-[#351c15] py-2 rounded-lg"
        >
          Attempted
        </button>
      </div>
    </div>
  );

  if (loading)
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen flex bg-[#f7f3ef]">
      <DriverSidebar active="dashboard" />

      <div className="flex-1">
        {/* HEADER */}
        <header className="bg-[#fff8e7] border-b border-[#e6ddc5] shadow">
          <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-[#351c15]">
                Driver Dashboard
              </h1>
              <p className="text-[#6f4e37]">
                Welcome, {user?.first_name} {user?.last_name}
              </p>

              {warehouse && (
                <p className="text-[#f9b400] font-semibold">
                  📍 Assigned Warehouse: {warehouse.name}, {warehouse.city}
                </p>
              )}
            </div>

            <button
              onClick={logout}
              className="px-4 py-2 bg-[#351c15] hover:bg-[#2b160f] text-white rounded-lg shadow"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-6">
          {/* Alerts */}
          {showRescheduleAlert && (
            <div className="bg-[#f9b400]/20 border-l-4 border-[#f9b400] p-4 rounded mb-6">
              <h3 className="font-bold text-[#351c15]">Order Rescheduled</h3>
              <button
                className="float-right font-bold text-[#351c15]"
                onClick={() => setShowRescheduleAlert(false)}
              >
                ✕
              </button>
            </div>
          )}

          {showRoadIssueAlert && (
            <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded mb-6">
              <h3 className="font-bold text-red-800">Road Issue Alert</h3>
              <button
                className="float-right font-bold text-red-800"
                onClick={() => setShowRoadIssueAlert(false)}
              >
                ✕
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            {[
              ["Today's Deliveries", orders.length],
              ["High Priority", orders.filter((o) => o.priority === 1).length],
              ["Normal", orders.filter((o) => o.priority === 2).length],
              ["Rescheduled", orders.filter((o) => o.priority === 3).length],
            ].map(([label, count], i) => (
              <div
                key={i}
                className="bg-[#fff8e7] border border-[#e6ddc5] rounded-xl p-6 shadow"
              >
                <p className="text-[#6f4e37]">{label}</p>
                <p className="text-3xl font-bold text-[#351c15]">{count}</p>
              </div>
            ))}
          </div>

          {/* Location switch */}
          <div className="bg-[#fff8e7] border border-[#e6ddc5] rounded-xl p-4 shadow mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-[#351c15]">Live Location Sharing</p>
                <p className="text-[#6f4e37] text-sm">
                  Your location updates every 10 seconds.
                </p>
              </div>

              <button
                onClick={() => setLocationSharing(!locationSharing)}
                className={`h-6 w-12 rounded-full flex items-center transition ${
                  locationSharing ? "bg-green-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`h-5 w-5 bg-white rounded-full transition transform ${
                    locationSharing ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {locationSharing && (
              <p className="text-xs text-green-700 mt-2">🟢 Live location active</p>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8">
            {[
              ["today", `Today's Orders (${orders.length})`],
              ["optimized", `Optimized Route (${optimizedRoute.length})`],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-6 py-2 rounded-lg font-medium shadow ${
                  activeTab === key
                    ? "bg-[#f9b400] text-[#351c15]"
                    : "bg-[#fff8e7] text-[#6f4e37] hover:bg-[#f9b400]/20"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Orders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeTab === "today" &&
              orders.map((o, i) => renderOrder(o, i))}

            {activeTab === "optimized" &&
              optimizedRoute.map((o, i) => renderOrder(o, i))}
          </div>

          {/* Quick Actions */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => navigate("/driver/route")}
              className="bg-[#351c15] hover:bg-[#2b160f] text-white rounded-xl p-5 shadow"
            >
              📍 View Route on Map
            </button>

            <button
              onClick={() => navigate("/driver/issues")}
              className="bg-[#f9b400] hover:bg-[#e0a200] text-[#351c15] rounded-xl p-5 shadow font-semibold"
            >
              ⚠️ Report Road Issue
            </button>
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
