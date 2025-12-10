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

    let locationInterval;
    if (locationSharing) {
      locationInterval = setInterval(shareLocation, 10000);
    }

    return () => {
      if (locationInterval) clearInterval(locationInterval);
    };
  }, [locationSharing]);

  const fetchTodaysOrders = async () => {
    try {
      const response = await api.get("/driver/orders/today");
      setOrders(response.data);

      // Get warehouse from first order if available
      if (response.data.length > 0 && response.data[0].currentWarehouse) {
        setWarehouse(response.data[0].currentWarehouse);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptimizedRoute = async () => {
    try {
      const response = await api.get("/driver/route/optimized");
      setOptimizedRoute(response.data);
    } catch (error) {
      console.error("Error fetching optimized route:", error);
    }
  };

  const shareLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
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
      });
    }
  };

  const markDelivered = async (orderId) => {
    try {
      await api.post(`/driver/mark-delivered/${orderId}`);
      fetchTodaysOrders();
      fetchOptimizedRoute();
      alert("Order marked as delivered!");
    } catch (error) {
      console.error("Error marking delivered:", error);
      alert("Failed to mark as delivered");
    }
  };

  const markAttempted = async (orderId) => {
    const reason = prompt("Enter reason for failed delivery:");
    if (reason) {
      try {
        await api.post(`/driver/mark-attempted/${orderId}`, { reason });
        fetchTodaysOrders();
        fetchOptimizedRoute();
        alert("Delivery attempt recorded");
      } catch (error) {
        console.error("Error marking attempted:", error);
      }
    }
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

  const renderOrder = (order, index) => (
    <div
      key={order.id}
      className="bg-white rounded-lg shadow p-4 hover:shadow-md transition"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-semibold text-gray-900">
              #{index + 1}
            </span>
            {getPriorityBadge(order.priority)}
          </div>
          <p className="text-sm text-gray-600">Order ID: {order.id}</p>
        </div>
        <div className="text-right">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
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
      </div>

      <div className="space-y-2 mb-4">
        <div>
          <p className="text-xs text-gray-500">Receiver</p>
          <p className="font-medium">{order.receiverName}</p>
          <p className="text-sm text-gray-600">{order.receiverPhone}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Delivery Address</p>
          <p className="text-sm">{order.receiverAddress}</p>
        </div>
        {order.destinationWarehouse && (
          <div>
            <p className="text-xs text-gray-500">Warehouse</p>
            <p className="text-sm font-medium text-blue-600">
              {order.destinationWarehouse.name}
            </p>
            <p className="text-xs text-gray-500">
              {order.destinationWarehouse.city}
            </p>
          </div>
        )}
        {order.deliveryNotes && (
          <div>
            <p className="text-xs text-gray-500">Notes</p>
            <p className="text-sm">{order.deliveryNotes}</p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => markDelivered(order.id)}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          Mark Delivered
        </button>
        <button
          onClick={() => markAttempted(order.id)}
          className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          Mark Attempted
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }
  return (
    <div className="min-h-screen flex bg-gray-50">
      <DriverSidebar active="dashboard" />
      <div className="w-[100%] flex flex-col">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Driver Dashboard
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Welcome back, {user?.first_name} {user?.last_name}!
                </p>
                {warehouse && (
                  <p className="text-sm text-blue-600 font-medium mt-1">
                    📍 Assigned to: {warehouse.warehouseName}, {warehouse.city}
                  </p>
                )}
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500 text-sm">Today's Deliveries</p>
              <p className="text-3xl font-bold text-blue-600">
                {orders.length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500 text-sm">High Priority</p>
              <p className="text-3xl font-bold text-red-600">
                {orders.filter((o) => o.priority === 1).length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500 text-sm">Normal</p>
              <p className="text-3xl font-bold text-blue-600">
                {orders.filter((o) => o.priority === 2).length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500 text-sm">Rescheduled</p>
              <p className="text-3xl font-bold text-gray-600">
                {orders.filter((o) => o.priority === 3).length}
              </p>
            </div>
          </div>

          {/* Location Sharing Toggle */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Live Location Sharing
                </h3>
                <p className="text-sm text-gray-600">
                  Share your location with customers every 10 seconds
                </p>
              </div>
              <button
                onClick={() => setLocationSharing(!locationSharing)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  locationSharing ? "bg-green-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    locationSharing ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            {locationSharing && (
              <p className="text-xs text-green-600 mt-2">
                🟢 Location sharing active
              </p>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab("today")}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                activeTab === "today"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Today's Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab("optimized")}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                activeTab === "optimized"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Optimized Route ({optimizedRoute.length})
            </button>
          </div>

          {/* Orders List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeTab === "today" && orders.length === 0 && (
              <div className="col-span-2 bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">No orders assigned for today</p>
              </div>
            )}
            {activeTab === "today" &&
              orders.map((order, index) => renderOrder(order, index))}

            {activeTab === "optimized" && optimizedRoute.length === 0 && (
              <div className="col-span-2 bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">No orders in optimized route</p>
              </div>
            )}
            {activeTab === "optimized" &&
              optimizedRoute.map((order, index) => renderOrder(order, index))}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() =>
                alert(
                  "Map view coming soon! Currently you can enable Location Sharing toggle above to share your GPS location."
                )
              }
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 text-center font-medium transition"
            >
              📍 View Route on Map
            </button>
            <button
              onClick={() => {
                const issueType = prompt(
                  "Enter issue type (e.g., Traffic, Accident, Road Block):"
                );
                if (issueType) {
                  const description = prompt("Enter description:");
                  if (description && navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      async (position) => {
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
                      }
                    );
                  }
                }
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg p-4 font-medium transition"
            >
              ⚠️ Report Road Issue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
