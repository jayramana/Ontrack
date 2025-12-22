// // ANALYTICS DRIVER DASHBOARD
// import React, { useState, useEffect } from "react";
// import { useAuth } from "../../context/AuthContext";
// import DriverSidebar from "./DriverSidebar";
// import api from "../../services/api";
// import { useNavigate } from "react-router-dom";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend
// } from "chart.js";
// import { Bar } from "react-chartjs-2";
// import DriverChart from "../../components/charts/Driver/DriverChart"; // Pie Chart
// import DriverBarChart from "../../components/charts/Driver/DriverBarChart"; // Bar Chart
// import { BsCheckCircleFill, BsExclamationTriangleFill } from "react-icons/bs";
// import { MdOutlinePendingActions, MdWork } from "react-icons/md";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend
// );

// export default function DriverDashboard() {
//   const navigate = useNavigate();
//   const { user, logout } = useAuth();
//   const [stats, setStats] = useState({
//     total: 0,
//     delivered: 0,
//     pending: 0,
//     exceptions: 0,
//     highPriority: 0,
//     normalPriority: 0,
//   });
//   const [weeklyStats, setWeeklyStats] = useState({
//       delivered: 0,
//       pending: 0,
//       exceptions: 0
//   });
//   const [orders, setOrders] = useState([]); // Store full orders for Bar Chart
//   const [loading, setLoading] = useState(true);
//   const [warehouse, setWarehouse] = useState(null);
//   const [isScrolled, setIsScrolled] = useState(false);

//   useEffect(() => {
//     const fetchAnalytics = async () => {
//       try {
//         const response = await api.get("/driver/orders/today/analytics");
//         const fetchedOrders = response.data || [];
//         setOrders(fetchedOrders);

//         if (fetchedOrders.length > 0) {
//             setWarehouse(fetchedOrders[0].currentWarehouse);
//         }

//         // Calculate Overall Stats
//         const delivered = fetchedOrders.filter((o) => o.status === "Delivered").length;
//         const pending = fetchedOrders.filter((o) => o.status !== "Delivered" && o.status !== "Cancelled").length;
//         const exceptions = fetchedOrders.filter((o) => o.status === "DeliveryAttempted" || o.status === "Cancelled").length;
        
//         const highPriority = fetchedOrders.filter((o) => o.priority === 1 && o.status === "Delivered").length;
//         const normalPriority = fetchedOrders.filter((o) => o.priority === 2 && o.status === "Delivered").length;

//         setStats({
//           total: fetchedOrders.length,
//           delivered,
//           pending,
//           exceptions,
//           highPriority,
//           normalPriority,
//         });

//         // Calculate Weekly Stats (Last 7 Days)
//         const oneWeekAgo = new Date();
//         oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

//         const weeklyOrders = fetchedOrders.filter(o => {
//             const orderDate = new Date(o.scheduledDate);
//             return orderDate >= oneWeekAgo;
//         });

//         const weeklyDelivered = weeklyOrders.filter((o) => o.status === "Delivered").length;
//         const weeklyPending = weeklyOrders.filter((o) => o.status !== "Delivered" && o.status !== "Cancelled").length;
//         const weeklyExceptions = weeklyOrders.filter((o) => o.status === "DeliveryAttempted" || o.status === "Cancelled").length;

//         setWeeklyStats({
//             delivered: weeklyDelivered,
//             pending: weeklyPending,
//             exceptions: weeklyExceptions
//         });

//       } catch (err) {
//         console.error("Failed to load analytics", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAnalytics();
//   }, []);

//   // Prepare data for Recharts Pie (DriverChart) - USING WEEKLY STATS
//   const pieData = [
//       { status: "Delivered", count: weeklyStats.delivered },
//       { status: "Pending", count: weeklyStats.pending },
//       { status: "Exceptions", count: weeklyStats.exceptions }
//   ];
  
//   return (
//     <div className="min-h-screen flex bg-[#0b0f14]">
//       <DriverSidebar active="dashboard" />

//       <div 
//         className="flex-1 flex flex-col h-screen overflow-y-auto transition-all duration-300"
//         onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 10)}
//       >
//         {/* HEADER */}
//         <header
//           className={`sticky top-0 z-40 transition-all duration-300
//               ${
//                 isScrolled
//                   ? "bg-[#0b0f14]/60 backdrop-blur-xl"
//                   : "bg-transparent"
//               }
//             `}
//         >
//           <div className="px-8 py-5">
//             <div className="max-w-7xl mx-auto flex justify-between items-center">
//               <div>
//                 <h1 className="text-3xl font-bold text-white">
//                     Performance Dashboard
//                 </h1>
//               </div>
//                {warehouse && (
//                   <div className="text-right hidden md:block">
//                     <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Base Location</p>
//                     <p className="text-white font-bold">{warehouse.name}</p>
//                     <p className="text-xs text-orange-500 font-bold">{warehouse.city}</p>
//                   </div>
//                 )}
//             </div>
//           </div>
//         </header>

//         <div className="flex-1 p-8">
//             <div className="max-w-7xl mx-auto">
            
//             {/* KPI CARDS */}
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//                 {/* Completion Rate */}
//                 <div className="bg-linear-to-br from-[#1a1f29] to-[#0f141c] p-6 rounded-xl shadow border border-[#1f2937] flex justify-between items-center">
//                     <div>
//                         <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Completion Rate</p>
//                         <p className="text-3xl font-bold text-white mt-2">
//                              {stats.total > 0 ? Math.round((stats.delivered / stats.total) * 100) : 0}%
//                         </p>
//                     </div>
//                     <div className="p-3 bg-emerald-500/10 rounded-full">
//                         <BsCheckCircleFill className="text-3xl text-emerald-500" />
//                     </div>
//                 </div>

//                  {/* Total Jobs */}
//                  <div className="bg-linear-to-br from-[#1a1f29] to-[#0f141c] p-6 rounded-xl shadow border border-[#1f2937] flex justify-between items-center">
//                     <div>
//                         <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Jobs</p>
//                         <p className="text-3xl font-bold text-white mt-2">
//                              {stats.total}
//                         </p>
//                     </div>
//                     <div className="p-3 bg-blue-500/10 rounded-full">
//                         <MdWork className="text-3xl text-blue-500" />
//                     </div>
//                 </div>

//                 {/* Pending */}
//                  <div className="bg-linear-to-br from-[#1a1f29] to-[#0f141c] p-6 rounded-xl shadow border border-[#1f2937] flex justify-between items-center">
//                     <div>
//                         <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Pending</p>
//                         <p className="text-3xl font-bold text-white mt-2">
//                              {stats.pending}
//                         </p>
//                     </div>
//                     <div className="p-3 bg-amber-500/10 rounded-full">
//                         <MdOutlinePendingActions className="text-3xl text-amber-500" />
//                     </div>
//                 </div>

//                 {/* Exceptions */}
//                  <div className="bg-linear-to-br from-[#1a1f29] to-[#0f141c] p-6 rounded-xl shadow border border-[#1f2937] flex justify-between items-center">
//                     <div>
//                         <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Exceptions</p>
//                         <p className="text-3xl font-bold text-white mt-2">
//                              {stats.exceptions}
//                         </p>
//                         <p className="text-xs text-gray-500 mt-1">Failed / Cancelled</p>
//                     </div>
//                     <div className="p-3 bg-red-500/10 rounded-full">
//                         <BsExclamationTriangleFill className="text-3xl text-red-500" />
//                     </div>
//                 </div>
//             </div>

//             {/* CHARTS */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                
//                 {/* STATUS CHART - PIE */}
//                 <div className="bg-[#0b0f14] rounded-xl shadow-sm border border-[#1f2937]">
//                     <DriverChart data={pieData} />
//                 </div>

//                 {/* STATUS HISTORY CHART - BAR */}
//                 <div className="bg-[#0b0f14] rounded-xl shadow-sm border border-[#1f2937]">
//                     <DriverBarChart data={orders} />
//                 </div>

//             </div>
//             </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// ANALYTICS DRIVER DASHBOARD
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import DriverSidebar from "./DriverSidebar";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";
import DriverChart from "../../components/charts/Driver/DriverChart"; // Pie Chart
import DriverBarChart from "../../components/charts/Driver/DriverBarChart"; // Bar Chart
import { BsCheckCircleFill, BsExclamationTriangleFill } from "react-icons/bs";
import { MdOutlinePendingActions, MdWork } from "react-icons/md";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function DriverDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    delivered: 0,
    pending: 0,
    exceptions: 0,
    highPriority: 0,
    normalPriority: 0,
  });
  const [weeklyStats, setWeeklyStats] = useState({
      delivered: 0,
      pending: 0,
      exceptions: 0
  });
  const [orders, setOrders] = useState([]); // Store full orders for Bar Chart
  const [loading, setLoading] = useState(true);
  const [warehouse, setWarehouse] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get("/driver/orders/today/analytics");
        const fetchedOrders = response.data || [];
        setOrders(fetchedOrders);

        if (fetchedOrders.length > 0) {
            setWarehouse(fetchedOrders[0].currentWarehouse);
        }

        // Calculate Overall Stats
        const delivered = fetchedOrders.filter((o) => o.status === "Delivered").length;
        const pending = fetchedOrders.filter((o) => o.status !== "Delivered" && o.status !== "Cancelled").length;
        const exceptions = fetchedOrders.filter((o) => o.status === "DeliveryAttempted" || o.status === "Cancelled").length;
        
        const highPriority = fetchedOrders.filter((o) => o.priority === 1 && o.status === "Delivered").length;
        const normalPriority = fetchedOrders.filter((o) => o.priority === 2 && o.status === "Delivered").length;

        setStats({
          total: fetchedOrders.length,
          delivered,
          pending,
          exceptions,
          highPriority,
          normalPriority,
        });

        // Calculate Weekly Stats (Last 7 Days)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const weeklyOrders = fetchedOrders.filter(o => {
            const orderDate = new Date(o.scheduledDate);
            return orderDate >= oneWeekAgo;
        });

        const weeklyDelivered = weeklyOrders.filter((o) => o.status === "Delivered").length;
        const weeklyPending = weeklyOrders.filter((o) => o.status !== "Delivered" && o.status !== "Cancelled").length;
        const weeklyExceptions = weeklyOrders.filter((o) => o.status === "DeliveryAttempted" || o.status === "Cancelled").length;

        setWeeklyStats({
            delivered: weeklyDelivered,
            pending: weeklyPending,
            exceptions: weeklyExceptions
        });

      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Prepare data for Recharts Pie (DriverChart) - USING WEEKLY STATS
  const pieData = [
      { status: "Delivered", count: weeklyStats.delivered },
      { status: "Pending", count: weeklyStats.pending },
      { status: "Exceptions", count: weeklyStats.exceptions }
  ];
  
  return (
    <div className="min-h-screen flex bg-[#0b0f14]">
      <DriverSidebar active="dashboard" />

      <div 
        className="flex-1 flex flex-col h-screen overflow-y-auto transition-all duration-300"
        onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 10)}
      >
        {/* HEADER */}
        <header
          className={`sticky top-0 z-40 transition-all duration-300
              ${
                isScrolled
                  ? "bg-[#0b0f14]/60 backdrop-blur-xl"
                  : "bg-transparent"
              }
            `}
        >
          <div className="px-8 py-5">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">
                    Performance Dashboard
                </h1>
              </div>
               {warehouse && (
                  <div className="text-right hidden md:block">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Base Location</p>
                    <p className="text-white font-bold">{warehouse.name}</p>
                    <p className="text-xs text-orange-500 font-bold">{warehouse.city}</p>
                  </div>
                )}
            </div>
          </div>
        </header>

        <div className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
            
            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* Completion Rate */}
                <div className="bg-linear-to-br from-[#1a1f29] to-[#0f141c] p-6 rounded-xl shadow border border-[#1f2937] flex justify-between items-center">
                    <div>
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Completion Rate</p>
                        <p className="text-3xl font-bold text-white mt-2">
                             {stats.total > 0 ? Math.round((stats.delivered / stats.total) * 100) : 0}%
                        </p>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-full">
                        <BsCheckCircleFill className="text-3xl text-emerald-500" />
                    </div>
                </div>

                 {/* Total Jobs */}
                 <div className="bg-linear-to-br from-[#1a1f29] to-[#0f141c] p-6 rounded-xl shadow border border-[#1f2937] flex justify-between items-center">
                    <div>
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Jobs</p>
                        <p className="text-3xl font-bold text-white mt-2">
                             {stats.total}
                        </p>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-full">
                        <MdWork className="text-3xl text-blue-500" />
                    </div>
                </div>

                {/* Pending */}
                 <div className="bg-linear-to-br from-[#1a1f29] to-[#0f141c] p-6 rounded-xl shadow border border-[#1f2937] flex justify-between items-center">
                    <div>
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Pending</p>
                        <p className="text-3xl font-bold text-white mt-2">
                             {stats.pending}
                        </p>
                    </div>
                    <div className="p-3 bg-amber-500/10 rounded-full">
                        <MdOutlinePendingActions className="text-3xl text-amber-500" />
                    </div>
                </div>

                {/* Exceptions */}
                 <div className="bg-linear-to-br from-[#1a1f29] to-[#0f141c] p-6 rounded-xl shadow border border-[#1f2937] flex justify-between items-center">
                    <div>
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Exceptions</p>
                        <p className="text-3xl font-bold text-white mt-2">
                             {stats.exceptions}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Failed / Cancelled</p>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-full">
                        <BsExclamationTriangleFill className="text-3xl text-red-500" />
                    </div>
                </div>
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                
                {/* STATUS CHART - PIE */}
                <div className="bg-[#0b0f14] rounded-xl shadow-sm border border-[#1f2937]">
                    <DriverChart data={pieData} />
                </div>

                {/* STATUS HISTORY CHART - BAR */}
                <div className="bg-[#0b0f14] rounded-xl shadow-sm border border-[#1f2937]">
                    <DriverBarChart data={orders} />
                </div>

            </div>
            </div>
        </div>
      </div>
    </div>
  );
}