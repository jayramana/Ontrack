import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Customer imports
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import DeliveryConfirm from "./pages/customer/DeliveryConfirm";
import IDVerification from "./pages/customer/IDVerification";
import Tracking from "./pages/customer/Tracking";
import CustomerGeofenceAlerts from "./pages/customer/CustomerGeofenceAlerts";

// Driver imports
import DriverDashboard from "./pages/driver/DriverDashboard";
import ConfirmDelivery from "./pages/driver/ConfirmDelivery";
import RouteOptimization from "./pages/driver/RouteOptimization";
import ReportIssues from "./pages/driver/ReportIssues";

// Admin imports
import AdminDashboard from "./pages/admin/AdminDashboard";
import CustomerQueries from "./pages/admin/CustomerQueries";
import DeliveryInsights from "./pages/admin/DeliveryInsights";

import SellerDashboard from "./pages/seller/SellerDashboard";

// Misc
import PlaceOrder from "./pages/seller/PlaceOrder";
import SenderOrders from "./pages/seller/SenderOrders";
import RouteView from "./pages/driver/RouteView";
import LiveMap from "./pages/admin/LiveMap";
import WarehouseDashboard from "./pages/admin/WarehouseDashboard";
import TransportScheduler from "./pages/admin/TransportScheduler";
import CapacityDashboard from "./pages/admin/CapacityDashboard";
import Availability from "./pages/customer/Availability";

import "./index.css";
import DriverGeofenceAlerts from "./pages/driver/DriverGeofenceAlerts";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Customer Pages */}
          <Route
            path="/customer/deliveryconfirm"
            element={<DeliveryConfirm />}
          />
          <Route path="/customer/idverification" element={<IDVerification />} />
          <Route path="/customer/tracking" element={<Tracking />} />
          <Route
            path="/customer/availability"
            element={
              <ProtectedRoute requiredRole="Customer">
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
          >
            
          </Route>

          {/* Driver Pages */}
          <Route path="/driver/confirm" element={<ConfirmDelivery />} />
          <Route path="/driver/route" element={<RouteView />} />
          <Route path="/driver/issues" element={<ReportIssues />} />

          <Route
            path="/driver/dashboard"
            element={
              <ProtectedRoute requiredRole="driver">
                <DriverDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/driver/geofencealerts" element={<DriverGeofenceAlerts />}
            
          />

          {/* Admin Pages */}
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

          {/* Default Redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;