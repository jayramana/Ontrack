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

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // SIGNALR CONNECTION FOR GEOFENCE ALERTS
  useEffect(() => {
    if (!user) return;

    // Use environment variable or default to localhost
    const HUB_URL = "http://localhost:5066/geofencehub"; 

    const connection = new HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => {
        console.log("Connected to GeofenceHub");
        
        // Listen for backend-triggered geofence events
        connection.on("GeofenceTriggered", (payload) => {
          console.log("[SignalR] Geofence Alert Received:", payload);
          
          const alertId = `backend-gf-${payload.geofenceId}-${payload.event}`;
          // Example payload: { geofenceId, name, event: "ENTER"|"EXIT", distanceMeters, ... }
          
          // Only show 'ENTER' alerts or important 'EXIT' ones
          if (payload.event === "ENTER") {
            const msg = `Geofence Alert: Entered ${payload.name} (${payload.distanceMeters}m)`;
            sendBrowserNotification("Geofence Entry", msg, alertId);
            addAlert(alertId, msg, "success");
          } else if (payload.event === "EXIT") {
             const msg = `Geofence Update: Exited ${payload.name}`;
             // Optional: Do we want to alert on exit? Maybe just log or subtle info
             console.log(msg);
             addAlert(alertId, msg, "info"); // Show as info
          }
        });

        // Join specific groups if needed (the backend might add us automatically based on connection, 
        // but typically we might need to invoke a JoinGroup method if the backend requires it.
        // Looking at backend code: 
        // AdminEndpoints maps /assign-driver -> calls geofenceService -> CheckAndNotifyAsync
        // CheckAndNotifyAsync broadcasts to: "order-{id}", "user-{customerId}", "driver-{driverId}"
        // We need to make sure we Subscribed to these groups? 
        // Wait, standard SignalR doesn't auto-subscribe users to "user-{id}" unless we have a custom UserId provider 
        // OR we explicitly join groups. 
        // Let's assume for now the backend handles mapping UserID -> ConnectionID 
        // OR we might need to invoke a backend method to 'Identify' ourselves.
        // However, standard Auth usually maps UserIdentifier. Let's see if that works.
      })
      .catch((err) => console.error("GeofenceHub Connection Error:", err));

    hubConnectionRef.current = connection;

    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, [user]);


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

  const addAlert = (id, message, type = "info") => {
    setAlerts((prev) => {
      if (prev.find((a) => a.id === id)) return prev;
      return [...prev, { id, message, type, time: new Date() }];
    });
  };

  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const checkDriverGeofences = async () => {
    try {
      console.log("Checking Driver Geofences (Local Polling)...");
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
      console.log("Checking Customer Geofences (Local Polling)...");
      const response = await api.get("/customer/orders");
      const activeOrders = response.data.filter(
        (o) =>
          o.status === "InTransit" ||
          o.status === "OutForDelivery" ||
          o.status === "Assigned"
      );
      
      console.log(`Found ${activeOrders.length} active orders.`);

      for (const order of activeOrders) {
        if (!order.driverId) continue;

        const trackRes = await api.get(`/customer/track/${order.id}`);
        // PRIORITIZE LIVE PROFILE LOCATION OVER HISTORY
        // The backend now returns 'driver' object with currentLat/Lon
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
          
          console.log(`Order ${order.id}: Driver dist ${Math.round(dist)}m`);

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

  // PERIODIC LOCATION UPDATES (HEARTBEAT)
  useEffect(() => {
    if (!user || user.role !== "driver") return;

    const updateLocation = () => {
      if (!navigator.geolocation) return;

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude, speed, heading } = position.coords;
            // console.log("Updating location heartbeart:", latitude, longitude);
            await api.post("/driver/location", {
              latitude,
              longitude,
              speed: speed || 0, // speed might be null
              heading: heading || 0 // heading might be null
            });
          } catch (err) {
            console.error("Failed to update driver location", err);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
        },
        { enableHighAccuracy: true }
      );
    };

    updateLocation();

    const intervalId = setInterval(updateLocation, 30 * 1000); // 30 seconds

    return () => clearInterval(intervalId);
  }, [user]);

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
