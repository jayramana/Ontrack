import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';

// Customer imports
import CustomerDashboard from './pages/customer/CustomerDashboard';
import DeliveryConfirm from './pages/customer/DeliveryConfirm';
import GeofenceAlerts from './pages/customer/GeofenceAlerts';
import IDVerification from './pages/customer/IDVerification';
import Tracking from './pages/customer/Tracking';

// Driver imports
import DriverDashboard from './pages/driver/DriverDashboard';
import ConfirmDelivery from './pages/driver/ConfirmDelivery';
import RouteOptimization from './pages/driver/RouteOptimization';
import ReportIssues from './pages/driver/ReportIssues';

// Admin imports
import AdminDashboard from './pages/admin/AdminDashboard';
import CustomerQueries from "./pages/admin/CustomerQueries";
import DeliveryInsights from "./pages/admin/DeliveryInsights";

import SellerDashboard from "./pages/seller/SellerDashboard";

import "./index.css";

function App() {
  return (
    <Router>
      <AuthProvider>

        <Routes>

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Customer Pages */}
          <Route path="/customer/deliveryconfirm" element={<DeliveryConfirm />} />
          <Route path="/customer/geofencealerts" element={<GeofenceAlerts />} />
          <Route path="/customer/idverification" element={<IDVerification />} />
          <Route path="/customer/tracking" element={<Tracking />} />

          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute requiredRole="customer">
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Driver Pages */}
          <Route path="/driver/confirm" element={<ConfirmDelivery />} />
          <Route path="/driver/route" element={<RouteOptimization />} />
          <Route path="/driver/issues" element={<ReportIssues />} />

          <Route
            path="/driver/dashboard"
            element={
              <ProtectedRoute requiredRole="driver">
                <DriverDashboard />
              </ProtectedRoute>
            }
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
              path="/seller/dashboard"
              element={
                <ProtectedRoute requiredRole="seller">
                  <SellerDashboard/>
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
