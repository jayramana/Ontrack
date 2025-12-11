import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { GeofenceProvider } from "./context/GeofenceContext";

import ProtectedRoute from "./components/ProtectedRoute";
import GlobalGeofenceAlerts from "./components/GlobalGeofenceAlerts";

// Auth
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// --- CUSTOMER PAGES ---
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import DeliveryConfirm from "./pages/customer/DeliveryConfirm";
import IDVerification from "./pages/customer/IDVerification";
import Tracking from "./pages/customer/Tracking";
import CustomerGeofenceAlerts from "./pages/customer/CustomerGeofenceAlerts";
import Availability from "./pages/customer/Availability";

// --- DRIVER PAGES ---
import DriverDashboard from "./pages/driver/DriverDashboard";
import ConfirmDelivery from "./pages/driver/ConfirmDelivery";
import RouteOptimization from "./pages/driver/RouteOptimization"; // Added from block 1
import ReportRoadIssue from "./pages/driver/ReportRoadIssue"; // Exists only in block 1
import ReportIssues from "./pages/driver/ReportIssues";
import DriverGeofenceAlerts from "./pages/driver/DriverGeofenceAlerts";


// --- ADMIN PAGES ---
import AdminDashboard from "./pages/admin/AdminDashboard";
import CustomerQueries from "./pages/admin/CustomerQueries";
import DeliveryInsights from "./pages/admin/DeliveryInsights";
import LiveMap from "./pages/admin/LiveMap";
import WarehouseDashboard from "./pages/admin/WarehouseDashboard";
import TransportScheduler from "./pages/admin/TransportScheduler";
import CapacityDashboard from "./pages/admin/CapacityDashboard";

// --- SELLER/SENDER PAGES ---
import SellerDashboard from "./pages/seller/SellerDashboard";
import PlaceOrder from "./pages/seller/PlaceOrder";
import SenderOrders from "./pages/seller/SenderOrders";

import "./index.css";
import DriverRoutePage from "./pages/driver/DriverRoutePage";

function App() {
  return (
    <Router>
      <AuthProvider>
        <GeofenceProvider>
          <GlobalGeofenceAlerts />

          <Routes>
            {/* ---------------- PUBLIC ROUTES ---------------- */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* ---------------- CUSTOMER ROUTES ---------------- */}

            <Route path="/customer/deliveryconfirm" element={<DeliveryConfirm />} />
            <Route path="/customer/idverification" element={<IDVerification />} />
            <Route path="/customer/tracking" element={<Tracking />} />

            <Route
              path="/customer/availability"
              element={
                <ProtectedRoute requiredRole="customer">
                  <Availability />
                </ProtectedRoute>
              }
            />

            <Route
              path="/customer/dashboard"
              element={
                <ProtectedRoute requiredRole="customer">
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/customer/geofencealerts"
              element={
                <ProtectedRoute requiredRole="customer">
                  <CustomerGeofenceAlerts />
                </ProtectedRoute>
              }
            />

            {/* ---------------- DRIVER ROUTES ---------------- */}

            <Route path="/driver/confirm" element={<ConfirmDelivery />} />

            {/* This was missing in block 2 → Add from block 1 */}
            <Route path="/driver/report-issue" element={<ReportRoadIssue />} />

            <Route path="/driver/route" element={<DriverRoutePage />} />
            <Route path="/driver/issues" element={<ReportRoadIssue />} />

            {/* From block 1 → Route Optimization page */}
            <Route
              path="/driver/route-optimized"
              element={<RouteOptimization />}
            />

            <Route
              path="/driver/dashboard"
              element={
                <ProtectedRoute requiredRole="driver">
                  <DriverDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/driver/geofencealerts"
              element={<DriverGeofenceAlerts />}
            />

            {/* ---------------- ADMIN ROUTES ---------------- */}

            <Route path="/admin/queries" element={<CustomerQueries />} />
            <Route path="/admin/insights" element={<DeliveryInsights />} />

            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/live-map"
              element={
                <ProtectedRoute requiredRole="admin">
                  <LiveMap />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/warehouses"
              element={
                <ProtectedRoute requiredRole="admin">
                  <WarehouseDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/transports"
              element={
                <ProtectedRoute requiredRole="admin">
                  <TransportScheduler />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/capacity"
              element={
                <ProtectedRoute requiredRole="admin">
                  <CapacityDashboard />
                </ProtectedRoute>
              }
            />

            {/* ---------------- SELLER ROUTES ---------------- */}

            <Route
              path="/seller/dashboard"
              element={
                <ProtectedRoute requiredRole="seller">
                  <SellerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sender/place-order"
              element={
                <ProtectedRoute requiredRole="seller">
                  <PlaceOrder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sender/orders"
              element={
                <ProtectedRoute requiredRole="seller">
                  <SenderOrders />
                </ProtectedRoute>
              }
            />

            {/* ---------------- FALLBACK ROUTE ---------------- */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </GeofenceProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
