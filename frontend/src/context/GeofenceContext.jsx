import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";
import api from "../services/api";
import { HubConnectionBuilder } from "@microsoft/signalr";

export const GeofenceContext = createContext();

export const useGeofence = () => useContext(GeofenceContext);

export const GeofenceProvider = ({ children }) => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const hubConnectionRef = useRef(null);

  const lastAlertTimes = useRef({});
  const haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
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

    const sendBrowserNotification = (title, body, tag) => {
    if (!("Notification" in window) || Notification.permission !== "granted")
      return;

    if (document.visibilityState === "hidden") {
      try {
        new Notification(title, {
          body,
          icon: "/vite.svg",
          tag: tag,
          requireInteraction: false,
        });
      } catch (e) {
        console.error("Error creating notification:", e);
      }
    }
  };

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);
    const addAlert = (id, message, type = "info") => {
    setAlerts((prev) => {
      if (prev.find((a) => a.id === id)) return prev;
      return [...prev, { id, message, type, time: new Date() }];
    });
  };

  // SIGNALR CONNECTION FOR GEOFENCE ALERTS
  useEffect(() => {
    if (!user) return;

    const HUB_URL = `${import.meta.env.VITE_API_URL}/geofencehub`; 

    const connection = new HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => {
        console.log("Connected to GeofenceHub");
        
        connection.on("GeofenceTriggered", (payload) => {
          console.log("[SignalR] Geofence Alert Received:", payload);
          
          const alertId = `backend-gf-${payload.geofenceId}-${payload.event}`;
          
          if (payload.event === "ENTER") {
            const msg = `Geofence Alert: Entered ${payload.name} (${payload.distanceMeters}m)`;
            sendBrowserNotification("Geofence Entry", msg, alertId);
            addAlert(alertId, msg, "success");
          } else if (payload.event === "EXIT") {
             const msg = `Geofence Update: Exited ${payload.name}`;
             addAlert(alertId, msg, "info"); // Show as info
          }
        });

      })
      .catch((err) => console.error("GeofenceHub Connection Error:", err));

    hubConnectionRef.current = connection;

    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, [user]);

  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const checkDriverGeofences = async () => {
    try {
      const meRes = await api.get(`/auth/${user.userId}`);
      const myLoc = meRes.data;
      if (!myLoc || !myLoc.currentLatitude) {
          console.log("No driver location found.");
          return;
      }

      const ordersRes = await api.get("/driver/orders/all");
      const myOrders = ordersRes.data.filter(
        (o) => o.status !== "Delivered" && o.status !== "Cancelled"
      );

      if (myOrders.length === 0) return;

      const gfRes = await api.get("/geofence/list");
      const allGeofences = gfRes.data;
      console.log(`Found ${allGeofences.length} total geofences.`);

      for (const order of myOrders) {
        const gf = allGeofences.find(
          (g) => g.orderId === order.id && g.isActive
        );
        if (!gf) continue;

        const dist = haversine(
          myLoc.currentLatitude,
          myLoc.currentLongitude,
          gf.centerLat,
          gf.centerLon
        );
        
        console.log(`Order ${order.id}: Distance ${Math.round(dist)}m (Radius: ${gf.radiusMeters}m)`);

        const alertId = `driver-gf-${gf.geofenceId}`;

        if (dist <= gf.radiusMeters) {
          const now = Date.now();
          const lastTime = lastAlertTimes.current[alertId];

          if (!lastTime || now - lastTime > 30000) {
            const msg = `You are inside the delivery zone for Order #${
              order.id
            } (${Math.round(dist)}m)`;

            sendBrowserNotification("Geofence Alert", msg, alertId);
            addAlert(alertId, msg, "success");

            lastAlertTimes.current[alertId] = now;
          }
        } else {
          removeAlert(alertId);
        }
      }
    } catch (err) {
      console.error("Driver geofence check failed", err);
    }
  };

  const checkCustomerGeofences = async () => {
    try {
      const response = await api.get("/customer/orders");
      const activeOrders = response.data.filter(
        (o) =>
          o.status === "InTransit" ||
          o.status === "OutForDelivery" ||
          o.status === "Assigned"
      );
      

      for (const order of activeOrders) {
        if (!order.driverId) continue;

        const trackRes = await api.get(`/customer/track/${order.id}`);
        const driverProfile = trackRes.data.driver;
        const driverHistory = trackRes.data.driverLocation;

        let lat, lon;

        if (driverProfile && driverProfile.currentLatitude && driverProfile.currentLongitude) {
             lat = driverProfile.currentLatitude;
             lon = driverProfile.currentLongitude;
        } else if (driverHistory && driverHistory.latitude) {
             lat = driverHistory.latitude;
             lon = driverHistory.longitude;
        }

        if (lat && lon) {
          const dist = haversine(
            lat,
            lon,
            order.deliveryLatitude,
            order.deliveryLongitude
          );
          
          const alertId = `cust-order-${order.id}`;

          if (dist <= 1000) {
            const now = Date.now();
            const lastTime = lastAlertTimes.current[alertId];

            if (!lastTime || now - lastTime > 30000) {
              const msg = `Driver is nearby! Order #${order.id} is ${Math.round(
                dist
              )}m away.`;

              sendBrowserNotification("Geofence Alert", msg, alertId);
              addAlert(alertId, msg, "info");

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

    tick();
    const interval = setInterval(tick, 10000);

    return () => clearInterval(interval);
  }, [user]);

  return (
    <GeofenceContext.Provider value={{ alerts, removeAlert }}>
      {children}
    </GeofenceContext.Provider>
  );
};
