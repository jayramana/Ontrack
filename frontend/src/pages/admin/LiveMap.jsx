// import { useState, useEffect } from "react";
// import api from "../../services/api";
// import MapComponent from "../../components/MapComponent";
// import * as signalR from "@microsoft/signalr";
// import AdminSidebar from "./AdminSidebar";

// export default function LiveMap() {
//   const [drivers, setDrivers] = useState([]);
//   const [connection, setConnection] = useState(null);

//   const fetchDashboardData = async () => {
//     try {
//       const response = await api.get("/admin/dashboard");

//       const normalizedDrivers = (response.data.drivers || []).map((d) => ({
//         userId: Number(d.userId ?? d.id),
//         userFName: d.userFName ?? "",
//         userLName: d.userLName ?? "",
//         isAvailable: d.isAvailable,
//         currentLatitude: d.currentLatitude,
//         currentLongitude: d.currentLongitude,
//       }));

//       setDrivers(normalizedDrivers);
//     } catch (e) {
//       console.error("Error fetching dashboard:", e);
//     }
//   };

//   const setupSignalR = async () => {
//     try {
//       const conn = new signalR.HubConnectionBuilder()
//         .withUrl("http://localhost:5066/hubs/logistics")
//         .withAutomaticReconnect()
//         .build();

//       conn.on("ReceiveDriverLocation", (id, lat, lng) => {
//         setDrivers((prev) =>
//           prev.map((d) =>
//             d.userId === id
//               ? { ...d, currentLatitude: lat, currentLongitude: lng }
//               : d
//           )
//         );
//       });

//       await conn.start();
//       await conn.invoke("JoinAdminGroup");
//       setConnection(conn);
//     } catch (e) {
//       console.error("SignalR error:", e);
//     }
//   };

//   useEffect(() => {
//     fetchDashboardData();
//     setupSignalR();

//     return () => {
//       if (connection) connection.stop();
//     };
//   }, []);

//   const markers = drivers
//     .filter((d) => d.currentLatitude && d.currentLongitude)
//     .map((d) => ({
//       position: [d.currentLatitude, d.currentLongitude],
//       popup: `${d.userFName} ${d.userLName} (${d.isAvailable ? "Available" : "Busy"})`,
//     }));

//   return (
//     <div className="min-h-screen flex bg-[#0b0f14] text-slate-100">
//       <AdminSidebar active="live-map" />

//       <div className="flex-1 px-10 py-10 space-y-10 overflow-y-auto">

//         {/* HEADER */}
//         <div>
//           <h1 className="text-3xl font-black tracking-tight">
//             Live Fleet Map
//           </h1>
//           <p className="text-slate-400 mt-1">
//             Monitor all driver locations in real time
//           </p>
//         </div>

//         {/* MAP CARD */}
//         <section
//           className="
//             bg-white/5 backdrop-blur-xl
//             border border-white/10
//             rounded-3xl p-6
//           "
//         >
//           <h2 className="text-lg font-bold mb-4">
//             Driver Map
//           </h2>

//           <div className="rounded-2xl overflow-hidden border border-white/10">
//             <MapComponent
//               center={[13.0827, 80.2707]}
//               zoom={12}
//               markers={markers}
//             />
//           </div>
//         </section>

//         {/* DRIVER LIST */}
//         <section
//           className="
//             bg-white/5 backdrop-blur-xl
//             border border-white/10
//             rounded-3xl p-6
//           "
//         >
//           <h3 className="text-lg font-bold mb-4">
//             Active Drivers
//           </h3>

//           {drivers.length === 0 ? (
//             <p className="text-slate-400">
//               No driver locations available.
//             </p>
//           ) : (
//             <ul className="space-y-3">
//               {drivers.map((d) => (
//                 <li
//                   key={d.userId}
//                   className="
//                     bg-white/5 border border-white/10
//                     rounded-2xl p-4
//                     hover:bg-white/10 transition
//                   "
//                 >
//                   <div className="flex justify-between items-center">
//                     <div className="font-semibold">
//                       {d.userFName} {d.userLName}
//                     </div>

//                     <span
//                       className={`
//                         px-3 py-1 rounded-full text-xs font-bold uppercase
//                         ${
//                           d.isAvailable
//                             ? "bg-green-500/20 text-green-400"
//                             : "bg-red-500/20 text-red-400"
//                         }
//                       `}
//                     >
//                       {d.isAvailable ? "Available" : "Busy"}
//                     </span>
//                   </div>

//                   {d.currentLatitude && (
//                     <p className="text-sm text-slate-400 mt-2">
//                       Lat: {d.currentLatitude.toFixed(4)}, Lng:{" "}
//                       {d.currentLongitude.toFixed(4)}
//                     </p>
//                   )}
//                 </li>
//               ))}
//             </ul>
//           )}
//         </section>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect } from "react";
import api from "../../services/api";
import MapComponent from "../../components/MapComponent";
import * as signalR from "@microsoft/signalr";
import AdminSidebar from "./AdminSidebar";

/* ===========================
   DRIVER COLORS
=========================== */
const DRIVER_COLORS = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#9333ea",
  "#ea580c",
  "#0891b2",
];

export default function LiveMap() {
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState({});
  const [connection, setConnection] = useState(null);

  /* ===========================
     LOAD DRIVERS
  =========================== */
  const fetchDashboardData = async () => {
    try {
      const response = await api.get("/admin/dashboard");

      const normalizedDrivers = (response.data.drivers || []).map((d, idx) => ({
        userId: Number(d.userId ?? d.id),
        userFName: d.userFName ?? "",
        userLName: d.userLName ?? "",
        isAvailable: d.isAvailable,
        currentLatitude: d.currentLatitude,
        currentLongitude: d.currentLongitude,
        color: DRIVER_COLORS[idx % DRIVER_COLORS.length],
      }));

      setDrivers(normalizedDrivers);

      // Fetch route for each driver
      normalizedDrivers.forEach(fetchDriverRoute);
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    }
  };

  /* ===========================
     FETCH DRIVER ROUTE
  =========================== */
  const fetchDriverRoute = async (driver) => {
    try {
      const res = await api.get(`/admin/driver/${driver.userId}/route`);
      const coords = (res.data.stops || []).map(s => [s.lat, s.lng]);

      setRoutes(prev => ({
        ...prev,
        [driver.userId]: {
          color: driver.color,
          positions: coords
        }
      }));
    } catch (e) {
      console.error(`Route fetch failed for driver ${driver.userId}`, e);
    }
  };

  /* ===========================
     SIGNALR
  =========================== */
  const setupSignalR = async () => {
    try {
      const conn = new signalR.HubConnectionBuilder()
        .withUrl(`${import.meta.env.VITE_API_URL}/hubs/logistics`)
        .withAutomaticReconnect()
        .build();

      conn.on("ReceiveDriverLocation", (data) => {
        setDrivers(prev =>
          prev.map(d =>
            d.userId === data.driverId
              ? { ...d, currentLatitude: data.latitude, currentLongitude: data.longitude }
              : d
          )
        );
      });

      await conn.start();
      await conn.invoke("JoinAdminGroup");
      setConnection(conn);
    } catch (e) {
      console.error("SignalR error:", e);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    setupSignalR();

    return () => {
      if (connection) connection.stop();
    };
  }, []);

  /* ===========================
     MAP DATA
  =========================== */
  const markers = drivers
    .filter(d => d.currentLatitude && d.currentLongitude)
    .map(d => ({
      position: [d.currentLatitude, d.currentLongitude],
      color: d.color,
      popup: `${d.userFName} ${d.userLName}`
    }));

  const polylines = Object.values(routes);

  return (
    <div className="min-h-screen flex bg-[#0b0f14] text-slate-100">
      <AdminSidebar active="live-map" />

      <div className="flex-1 px-10 py-10 space-y-10">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-black">Live Fleet Map</h1>
          <p className="text-slate-400 mt-1">
            Real-time driver locations & delivery routes
          </p>
        </div>

        {/* MAP */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <h2 className="text-lg font-bold mb-4">Driver Routes</h2>

          <div className="rounded-2xl overflow-hidden border border-white/10">
            <MapComponent
              center={[13.0827, 80.2707]}
              zoom={12}
              markers={markers}
              polylines={polylines}
            />
          </div>
        </section>

        {/* DRIVER LEGEND */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <h3 className="text-lg font-bold mb-4">Active Drivers</h3>

          <ul className="space-y-3">
            {drivers.map(d => (
              <li
                key={d.userId}
                className="flex justify-between items-center bg-white/5 p-4 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="font-semibold">
                    {d.userFName} {d.userLName}
                  </span>
                </div>

                <span
                  className={`px-3 py-1 text-xs rounded-full ${
                    d.isAvailable
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {d.isAvailable ? "Available" : "Busy"}
                </span>
              </li>
            ))}
          </ul>
        </section>

      </div>
    </div>
  );
}
