import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import React from "react";
import DriverSidebar from "./DriverSidebar";
import api from "../../services/api";

export default function DriverDashboard() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [optimizedRoute, setOptimizedRoute] = useState([]);
  const [warehouse, setWarehouse] = useState(null);
  const [locationSharing, setLocationSharing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("today");

  useEffect(() => {
    fetchTodaysOrders();
    fetchOptimizedRoute();

    let interval;
    if (locationSharing) {
      interval = setInterval(shareLocation, 10000);
    }
    return () => clearInterval(interval);
  }, [locationSharing]);

  const fetchTodaysOrders = async () => {
    try {
      const res = await api.get("/driver/orders/today");
      setOrders(res.data);

      if (res.data.length > 0 && res.data[0].currentWarehouse) {
        setWarehouse(res.data[0].currentWarehouse);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptimizedRoute = async () => {
    try {
      const res = await api.get("/driver/route/optimized");
      setOptimizedRoute(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const shareLocation = async () => {
    navigator.geolocation?.getCurrentPosition(async (pos) => {
      try {
        await api.post("/driver/location", {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          speed: pos.coords.speed || 0,
          heading: pos.coords.heading || 0,
        });
      } catch (err) {
        console.error("Location update error:", err);
      }
    });
  };

  const markDelivered = async (id) => {
    try {
      await api.post(`/driver/mark-delivered/${id}`);
      fetchTodaysOrders();
      fetchOptimizedRoute();
    } catch (err) {
      alert("Error updating status");
    }
  };

  const markAttempted = async (id) => {
    const reason = prompt("Reason for failed delivery:");
    if (!reason) return;

    try {
      await api.post(`/driver/mark-attempted/${id}`, { reason });
      fetchTodaysOrders();
      fetchOptimizedRoute();
    } catch {
      alert("Error updating attempt");
    }
  };

  const priorityBadge = {
    1: "bg-red-100 text-red-700",
    2: "bg-blue-100 text-blue-700",
    3: "bg-gray-200 text-gray-700",
  };

  const priorityText = {
    1: "High Priority",
    2: "Normal",
    3: "Rescheduled",
  };

  const badge = (p) => (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${priorityBadge[p]}`}>
      {priorityText[p]}
    </span>
  );

  const renderOrder = (o, idx) => (
    <div
      key={o.id}
      className="bg-white border border-[#e2d6c6] p-6 rounded-xl shadow-md hover:shadow-lg transition"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-[#351c15] text-lg flex items-center gap-2">
            #{idx + 1} {badge(o.priority)}
          </h3>
          <p className="text-sm text-gray-600">Order ID: {o.id}</p>
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
            <p className="font-medium text-[#ffb500]">{o.destinationWarehouse.name}</p>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => markDelivered(o.id)}
          className="flex-1 bg-[#ffb500] hover:bg-[#e6a300] text-[#351c15] font-semibold py-2 rounded-lg"
        >
          Delivered
        </button>

        <button
          onClick={() => markAttempted(o.id)}
          className="flex-1 bg-[#351c15] hover:bg-[#2b160f] text-white py-2 rounded-lg"
        >
          Attempted
        </button>
      </div>
    </div>
  );

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center text-lg text-[#351c15]">
        Loading…
      </div>
    );

  return (
    <div className="min-h-screen flex bg-[#f8f4ef]">
      <DriverSidebar active="dashboard" />

      <div className="flex-1 px-10 py-6">
        {/* Header */}
        <header className="bg-white border border-[#e2d6c6] p-6 rounded-xl shadow mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#351c15]">Driver Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {user?.first_name} {user?.last_name}
            </p>

            {warehouse && (
              <p className="text-[#ffb500] font-semibold mt-1">
                📍 Hub: {warehouse.warehouseName}
              </p>
            )}
          </div>

          <button
            onClick={logout}
            className="px-4 py-2 bg-[#ffb500] text-[#351c15] rounded-lg font-semibold hover:bg-[#e6a300]"
          >
            Logout
          </button>
        </header>

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
              className="bg-white border border-[#e2d6c6] p-6 rounded-xl shadow"
            >
              <p className="text-gray-600 text-sm">{label}</p>
              <p className="text-3xl font-bold text-[#351c15]">{count}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          {[["today", "Today's Orders"], ["optimized", "Optimized Route"]].map(
            ([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-6 py-2 rounded-lg font-semibold border ${
                  activeTab === key
                    ? "bg-[#351c15] text-white border-[#351c15]"
                    : "bg-white border-gray-300 hover:bg-gray-50"
                }`}
              >
                {label}
              </button>
            )
          )}
        </div>

        {/* Order List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeTab === "today"
            ? orders.map((o, i) => renderOrder(o, i))
            : optimizedRoute.map((o, i) => renderOrder(o, i))}
        </div>
      </div>
    </div>
  );
}
