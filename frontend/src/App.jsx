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
import Profile from "./pages/customer/Profile";
import Availability from "./pages/customer/Availability";

// Driver imports
import DriverDashboard from "./pages/driver/DriverDashboard";
import ConfirmDelivery from "./pages/driver/ConfirmDelivery";
import ReportIssues from "./pages/driver/ReportIssues";
import RouteView from "./pages/driver/RouteView";
import DriverGeofenceAlerts from "./pages/driver/DriverGeofenceAlerts";
import AgentProfile from "./pages/driver/AgentProfile";

// Admin imports
import AdminDashboard from "./pages/admin/AdminDashboard";
import CustomerQueries from "./pages/admin/CustomerQueries";
import DeliveryInsights from "./pages/admin/DeliveryInsights";
import LiveMap from "./pages/admin/LiveMap";
import WarehouseDashboard from "./pages/admin/WarehouseDashboard";
import TransportScheduler from "./pages/admin/TransportScheduler";
import CapacityDashboard from "./pages/admin/CapacityDashboard";

// Seller imports
import SellerDashboard from "./pages/seller/SellerDashboard";
import CreateShipment from "./pages/seller/CreateShipment";
import SellerProfile from "./pages/seller/SellerProfile";
import ShipmentList from "./pages/seller/ShipmentList";
import PlaceOrder from "./pages/seller/PlaceOrder";
import SenderOrders from "./pages/seller/SenderOrders";

import "./index.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />


          {/* ---------------- CUSTOMER ROUTES ---------------- */}
          <Route
  path="/customer/deliveryconfirm"
  element={
    <ProtectedRoute requiredRole="customer">
      <DeliveryConfirm />
    </ProtectedRoute>
  }
/>

<Route
  path="/customer/idverification"
  element={
    <ProtectedRoute requiredRole="customer">
      <IDVerification />
    </ProtectedRoute>
  }
/>

<Route
  path="/customer/tracking"
  element={
    <ProtectedRoute requiredRole="customer">
      <Tracking />
    </ProtectedRoute>
  }
/>

<Route
  path="/customer/profile"
  element={
    <ProtectedRoute requiredRole="customer">
      <Profile />
    </ProtectedRoute>
  }
/>

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

          <Route path="/driver/geofencealerts" element={<DriverGeofenceAlerts />} />
          <Route path="/driver/agentprofile" element={<AgentProfile />} />


          {/* ---------------- ADMIN ROUTES ---------------- */}
          <Route path="/admin/queries" element={<CustomerQueries />} />
          <Route path="/admin/insights" element={<DeliveryInsights />} />
          <Route path="/admin/scheduler" element={<TransportScheduler />} />

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
            path="/seller/shipments"
            element={
              <ProtectedRoute requiredRole="seller">
                <ShipmentList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller/create-shipment"
            element={
              <ProtectedRoute requiredRole="seller">
                <CreateShipment />
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller/sellerprofile"
            element={
              <ProtectedRoute requiredRole="seller">
                <SellerProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller/placeorder"
            element={
              <ProtectedRoute requiredRole="seller">
                <PlaceOrder />
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller/senderorders"
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
