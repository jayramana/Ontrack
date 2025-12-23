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
import HomePage from "./HomePage";

// --- CUSTOMER PAGES ---
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import CustomerOrders from "./pages/customer/CustomerOrders"; // [NEW]
import OrderDetails from "./pages/customer/OrderDetails"; // [NEW]
import Tracking from "./pages/customer/Tracking";
import CustomerGeofenceAlerts from "./pages/customer/CustomerGeofenceAlerts";
import Availability from "./pages/customer/Availability";

// --- DRIVER PAGES ---
import DriverDashboard from "./pages/driver/DriverDashboard";
import ReportRoadIssue from "./pages/driver/ReportRoadIssue";
import DriverGeofenceAlerts from "./pages/driver/DriverGeofenceAlerts";
import DriverRoutePage from "./pages/driver/DriverRoutePage";
import DriverDeliveries from "./pages/driver/DriverDeliveries";
import DriverOrderDetails from "./pages/driver/DriverOrderDetails"; // [NEW]
import CustomerProfile from "./pages/customer/CustomerProfile";
import DriverProfile from "./pages/driver/DriverProfile";

// --- ADMIN PAGES ---
import AdminDashboard from "./pages/admin/AdminDashboard";
import CustomerQueries from "./pages/admin/CustomerQueries";
import DeliveryInsights from "./pages/admin/DeliveryInsights";
import LiveMap from "./pages/admin/LiveMap";
import WarehouseDashboard from "./pages/admin/WarehouseDashboard";
import AdminASRPanel from "./pages/admin/AdminASRPanel";
//import TransportScheduler from "./pages/admin/TransportScheduler";
//import CapacityDashboard from "./pages/admin/CapacityDashboard";

// --- SELLER/SENDER PAGES ---
import SellerDashboard from "./pages/seller/SellerDashboard";
import SellerProfile from "./pages/seller/SellerProfile";
import ShipmentList from "./pages/seller/ShipmentList";
import PlaceOrder from "./pages/seller/PlaceOrder";
import SenderOrders from "./pages/seller/SenderOrders";

import SenderChart from "./components/charts/Sender/SenderChart";

import "./index.css";

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
            <Route path="/" element={<HomePage />} />

            {/* ---------------- CUSTOMER ROUTES ---------------- */}

            <Route path="/tracking" element={<Tracking />} />
            <Route path="/tracking/:id" element={<Tracking />} />
            <Route path="/customer/track/:id" element={<Tracking />} />

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
              path="/customer/orders"
              element={
                <ProtectedRoute requiredRole="customer">
                  <CustomerOrders />
                </ProtectedRoute>
              }
            />

            <Route
              path="/customer/orders/:id"
              element={
                <ProtectedRoute requiredRole="customer">
                  <OrderDetails />
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

            <Route path="/driver/report-issue" element={<ReportRoadIssue />} />
            <Route path="/driver/issues" element={<ReportRoadIssue />} />

            <Route path="/driver/route" element={<DriverRoutePage />} />

            <Route
              path="/customer/profile"
              element={
                <ProtectedRoute requiredRole="customer">
                  <CustomerProfile />
                </ProtectedRoute>
              }
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
              path="/driver/deliveries"
              element={
                <ProtectedRoute requiredRole="driver">
                  <DriverDeliveries />
                </ProtectedRoute>
              }
            />

            <Route
              path="/driver/orders/:id"
              element={
                <ProtectedRoute requiredRole="driver">
                  <DriverOrderDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="/driver/geofencealerts"
              element={<DriverGeofenceAlerts />}
            />

            <Route
              path="/driver/profile"
              element={
                <ProtectedRoute requiredRole="driver">
                  <DriverProfile />
                </ProtectedRoute>
              }
            />

            {/* ---------------- ADMIN ROUTES ---------------- */}
            <Route path="/admin/queries" element={<CustomerQueries />} />
            <Route path="/admin/insights" element={<DeliveryInsights />} />
            <Route path="/admin/asr" element={<AdminASRPanel />} />

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
            {/*<Route
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
            />/*}

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
              path="/seller/create-shipment"
              element={
                <ProtectedRoute requiredRole="seller">
                  <PlaceOrder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/seller-profile"
              element={
                <ProtectedRoute requiredRole="seller">
                  <SellerProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/shipments"
              element={
                <ProtectedRoute requiredRole="seller">
                  <ShipmentList />
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
            <Route path="*" element={<FallbackRedirect />} />
            {/* // Test Routes */}
            <Route path="/test" element={<SenderChart />} />
          </Routes>
        </GeofenceProvider>
      </AuthProvider>
    </Router>
  );
}

function FallbackRedirect() {
  console.log(
    "Fallback route hit. No matching route found. Redirecting to login..."
  );
  return <Navigate to="/login" replace />;
}

console.log(import.meta.env.VITE_API_URL);

export default App;
