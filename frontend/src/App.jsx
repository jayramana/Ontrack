// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';
// import ProtectedRoute from './components/ProtectedRoute';
// import Login from './pages/Login';
// import Signup from './pages/Signup'; // New import
// import CustomerDashboard from './pages/customer/CustomerDashboard';
// import DriverDashboard from './pages/driver/DriverDashboard';
// import AdminDashboard from './pages/admin/AdminDashboard';
// import SenderDashboard from './pages/sender/SenderDashboard';
// import PlaceOrder from './pages/sender/PlaceOrder';
// import SenderOrders from './pages/sender/SenderOrders';
// import ReportRoadIssue from "./pages/driver/ReportRoadIssue";

// import LiveMap from './pages/admin/LiveMap';
// import WarehouseDashboard from './pages/admin/WarehouseDashboard';
// import TransportScheduler from './pages/admin/TransportScheduler';
// import CapacityDashboard from './pages/admin/CapacityDashboard';
// import Availability from './pages/customer/Availability';
// import Tracking from './pages/customer/Tracking';
// import DriverRoutePage from './pages/driver/DriverRoutePage';

// function App() {
//   return (
//     <Router>
//       <AuthProvider>
//         <Routes>
//           {/* Public Routes */}
//           <Route path="/login" element={<Login />} />
//           <Route path="/signup" element={<Signup />} /> {/* New Signup Route */}

//           {/* Protected Customer Route */}
//           <Route
//             path="/customer/dashboard"
//             element={
//               <ProtectedRoute requiredRole="Customer">
//                 <CustomerDashboard />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/customer/availability"
//             element={
//               <ProtectedRoute requiredRole="Customer">
//                 <Availability />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/customer/tracking"
//             element={
//               <ProtectedRoute requiredRole="Customer">
//                 <Tracking />
//               </ProtectedRoute>
//             }
//           />

//           <Route path="/driver/report-issue" element={<ReportRoadIssue />} />

//           {/* Protected Driver Route */}
//           <Route
//             path="/driver/dashboard"
//             element={
//               <ProtectedRoute requiredRole="Driver">
//                 <DriverDashboard />
//               </ProtectedRoute>
//             }
//           />
          

//           <Route path="/driver/route" element={<ProtectedRoute requiredRole="Driver"><DriverRoutePage /></ProtectedRoute>} />


//           {/* Protected Admin Route */}
//           <Route
//             path="/admin/dashboard"
//             element={
//               <ProtectedRoute requiredRole="Admin">
//                 <AdminDashboard />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/admin/live-map"
//             element={
//               <ProtectedRoute requiredRole="Admin">
//                 <LiveMap />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/admin/warehouses"
//             element={
//               <ProtectedRoute requiredRole="Admin">
//                 <WarehouseDashboard />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/admin/transports"
//             element={
//               <ProtectedRoute requiredRole="Admin">
//                 <TransportScheduler />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/admin/capacity"
//             element={
//               <ProtectedRoute requiredRole="Admin">
//                 <CapacityDashboard />
//               </ProtectedRoute>
//             }
//           />

//           {/* Protected Sender Route */}
//           <Route
//             path="/sender/dashboard"
//             element={
//               <ProtectedRoute requiredRole="Sender">
//                 <SenderDashboard />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/sender/place-order"
//             element={
//               <ProtectedRoute requiredRole="Sender">
//                 <PlaceOrder />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/sender/orders"
//             element={
//               <ProtectedRoute requiredRole="Sender">
//                 <SenderOrders />
//               </ProtectedRoute>
//             }
//           />

//           {/* Catch all - redirect to login */}
//           <Route path="*" element={<Navigate to="/login" replace />} />
//         </Routes>
//       </AuthProvider>
//     </Router>
//   );
// }

// export default App;


import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import DriverDashboard from './pages/driver/DriverDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import SenderDashboard from './pages/sender/SenderDashboard';
import PlaceOrder from './pages/sender/PlaceOrder';
import SenderOrders from './pages/sender/SenderOrders';
import ReportRoadIssue from "./pages/driver/ReportRoadIssue";
import LiveMap from './pages/admin/LiveMap';
import WarehouseDashboard from './pages/admin/WarehouseDashboard';
import TransportScheduler from './pages/admin/TransportScheduler';
import CapacityDashboard from './pages/admin/CapacityDashboard';
import Availability from './pages/customer/Availability';
import Tracking from './pages/customer/Tracking';
import DriverRoutePage from './pages/driver/DriverRoutePage';

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Customer Routes */}
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute requiredRole="Customer">
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/availability"
            element={
              <ProtectedRoute requiredRole="Customer">
                <Availability />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/tracking"
            element={
              <ProtectedRoute requiredRole="Customer">
                <Tracking />
              </ProtectedRoute>
            }
          />

          {/* Protected Driver Routes */}
          <Route
            path="/driver/dashboard"
            element={
              <ProtectedRoute requiredRole="Driver">
                <DriverDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver/route"
            element={
              <ProtectedRoute requiredRole="Driver">
                <DriverRoutePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver/report-issue"
            element={
              <ProtectedRoute requiredRole="Driver">
                <ReportRoadIssue />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="Admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/live-map"
            element={
              <ProtectedRoute requiredRole="Admin">
                <LiveMap />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/warehouses"
            element={
              <ProtectedRoute requiredRole="Admin">
                <WarehouseDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/transports"
            element={
              <ProtectedRoute requiredRole="Admin">
                <TransportScheduler />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/capacity"
            element={
              <ProtectedRoute requiredRole="Admin">
                <CapacityDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Sender Routes */}
          <Route
            path="/sender/dashboard"
            element={
              <ProtectedRoute requiredRole="Sender">
                <SenderDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sender/place-order"
            element={
              <ProtectedRoute requiredRole="Sender">
                <PlaceOrder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sender/orders"
            element={
              <ProtectedRoute requiredRole="Sender">
                <SenderOrders />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;