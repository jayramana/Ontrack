
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import api from "../services/api";

const GeofenceContext = createContext();

export const useGeofence = () => useContext(GeofenceContext);

export const GeofenceProvider = ({ children }) => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]); // List of active alert message objects

  // Track last alert execution time to prevent spam
  const lastAlertTimes = React.useRef({}); // { alertId: timestamp }

  // Helper to add alert if new
  const addAlert = (id, message, type = "info") => {
    setAlerts((prev) => {
      // If alert is already active (visible), don't re-add it even if cooldown passed?
      // Actually usually we want to notify again if it's a "new" notification.
      // But if it's already on screen, we definitely don't need a duplicate.
      if (prev.find((a) => a.id === id)) return prev;
      return [...prev, { id, message, type, time: new Date() }];
    });
  };

  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  // --- DRIVER LOGIC ---
  const checkDriverGeofences = async () => {
    try {
      // 1. Get My Location
      const meRes = await api.get(`/auth/${user.userId}`);
      const myLoc = meRes.data;
      if (!myLoc || !myLoc.currentLatitude) return;

      // 2. Get My Active Orders
      const ordersRes = await api.get("/driver/orders/all");
      const myOrders = ordersRes.data.filter(
        (o) => o.status !== "Delivered" && o.status !== "Cancelled"
      );
      
      if (myOrders.length === 0) return;

      // 3. Get Active Geofences
      const gfRes = await api.get("/geofence/list");
      const allGeofences = gfRes.data;

      for (const order of myOrders) {
         const gf = allGeofences.find(g => g.orderId === order.id && g.isActive);
         if (!gf) continue;

         // Check distance
         const dist = haversine(
             myLoc.currentLatitude, myLoc.currentLongitude,
             gf.centerLat, gf.centerLon
         );
         
         const alertId = `driver-gf-${gf.geofenceId}`;

         if (dist <= gf.radiusMeters) {
             const now = Date.now();
             const lastTime = lastAlertTimes.current[alertId];

             // Check cooldown (60s)
             if (!lastTime || (now - lastTime > 60000)) {
                 addAlert(alertId, `You are INSIDE the delivery zone for Order #${order.id} (${Math.round(dist)}m)`, "success");
                 lastAlertTimes.current[alertId] = now;
             }
         } else {
             // If we leave, remove alert?
             // Optional: reset cooldown if they leave so they get alerted immediately if they re-enter?
             // For now, simple behavior: just remove visible alert if any.
             removeAlert(alertId);
         }
      }

    } catch (err) {
      console.error("Driver geofence check failed", err);
    }
  };

  // --- CUSTOMER LOGIC ---
  const checkCustomerGeofences = async () => {
    try {
        // 1. Get My Active Orders
        const response = await api.get("/customer/orders");
        const activeOrders = response.data.filter(
            (o) => o.status === "InTransit" || o.status === "OutForDelivery" 
            || o.status === "Assigned"
        );

        for(const order of activeOrders) {
            if(!order.driverId) continue;
            
            // 2. Get Driver Location
            const trackRes = await api.get(`/customer/track/${order.id}`);
            const driverLoc = trackRes.data.driverLocation;

            if(driverLoc && driverLoc.latitude) {
                 const dist = haversine(
                     driverLoc.latitude, driverLoc.longitude,
                     order.deliveryLatitude, order.deliveryLongitude
                 );

                 const alertId = `cust-order-${order.id}`;

                 if(dist <= 1000) {
                     const now = Date.now();
                     const lastTime = lastAlertTimes.current[alertId];

                     if (!lastTime || (now - lastTime > 60000)) {
                         addAlert(alertId, `Driver is nearby! Order #${order.id} is ${Math.round(dist)}m away.`, "info");
                         lastAlertTimes.current[alertId] = now;
                     }
                 } else {
                     removeAlert(alertId);
                 }
            }
        }
    } catch (err) {
        console.error("Customer geofence check failed", err);
    }
  };

  useEffect(() => {
    if (!user) return;

    const tick = () => {
      if (user.role === "driver") {
        checkDriverGeofences();
      } else if (user.role === "customer") {
        checkCustomerGeofences();
      }
    };

    tick(); // Run immediately
    const interval = setInterval(tick, 10000); // Poll every 10s

    return () => clearInterval(interval);
  }, [user]);

  // Haversine Helper
  const haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // meters
    const toRad = (val) => (val * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return (
    <GeofenceContext.Provider value={{ alerts, removeAlert }}>
      {children}
    </GeofenceContext.Provider>
  );
};
