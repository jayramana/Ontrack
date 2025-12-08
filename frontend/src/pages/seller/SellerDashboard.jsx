// import React from "react";
// import SellerSidebar from "./SellerSidebar";

// export default function SellerDashboard() {
//   const stats = [
//     { label: "Total Shipments", value: 128, color: "teal" },
//     { label: "In Transit", value: 32, color: "blue" },
//     { label: "Delivered", value: 80, color: "green" },
//     { label: "Pending Pickup", value: 12, color: "yellow" },
//   ];

//   const recentShipments = [
//     { id: "ORD-1001", customer: "Lisa", status: "Delivered", destination: "Chennai" },
//     { id: "ORD-1002", customer: "Jennie", status: "In Transit", destination: "Bangalore" },
//     { id: "ORD-1003", customer: "Rose", status: "Pending Pickup", destination: "Hyderabad" },
//   ];

//   return (
//     <div className="min-h-screen flex bg-gray-100">

//       {/* SIDEBAR */}
//       <SellerSidebar active="dashboard" />

//       {/* MAIN CONTENT */}
//       <div className="flex-1 p-10">

//         {/* HEADER */}
//         <h1 className="text-3xl font-bold mb-2">Seller Dashboard</h1>
//         <p className="text-gray-500 mb-8">
//           Manage your shipments and deliveries from one place
//         </p>

//         {/* STAT CARDS */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
//           {stats.map((item) => (
//             <div
//               key={item.label}
//               className="bg-white p-6 rounded-2xl shadow text-center"
//             >
//               <p className="text-gray-600">{item.label}</p>
//               <h2 className="text-3xl font-bold mt-2">{item.value}</h2>
//             </div>
//           ))}
//         </div>

//         {/* RECENT SHIPMENTS */}
//         <div className="bg-white p-6 rounded-2xl shadow">
//           <h2 className="text-xl font-bold mb-4">Recent Shipments</h2>

//           <div className="space-y-4">
//             {recentShipments.map((ship) => (
//               <div
//                 key={ship.id}
//                 className="flex justify-between p-4 border rounded-xl"
//               >
//                 <div>
//                   <h3 className="font-semibold">{ship.id}</h3>
//                   <p className="text-gray-500 text-sm">
//                     Customer: {ship.customer}
//                   </p>
//                   <p className="text-gray-500 text-sm">
//                     Destination: {ship.destination}
//                   </p>
//                 </div>

//                 <div className="flex items-center">
//                   <span
//                     className={`px-3 py-1 rounded-lg text-sm ${
//                       ship.status === "Delivered"
//                         ? "bg-green-100 text-green-700"
//                         : ship.status === "In Transit"
//                         ? "bg-blue-100 text-blue-700"
//                         : "bg-yellow-100 text-yellow-700"
//                     }`}
//                   >
//                     {ship.status}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }

import { Link } from 'react-router-dom';

function SenderDashboard() {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Sender Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Actions</h2>
                    <Link to="/sender/place-order" className="block w-full bg-blue-600 text-white text-center p-3 rounded hover:bg-blue-700 mb-4">
                        Place New Order
                    </Link>
                    <Link to="/sender/orders" className="block w-full bg-gray-600 text-white text-center p-3 rounded hover:bg-gray-700">
                        View My Orders
                    </Link>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                    <p className="text-gray-600">No recent orders.</p>
                </div>
            </div>
        </div>
    );
}

export default SenderDashboard;

