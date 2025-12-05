import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup'; // New import
import CustomerDashboard from './pages/customer/CustomerDashboard';
import DriverDashboard from './pages/driver/DriverDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import DeliveryConfirm from './pages/customer/DeliveryConfirm';   
import GeofenceAlerts from './pages/customer/GeofenceAlerts';
import IDVerification from './pages/customer/IDVerification';
import Tracking from './pages/customer/Tracking';
//import SellerDashboard from './pages/seller/SellerDashboard';

//Driver imports :
import ConfirmDelivery from './pages/driver/ConfirmDelivery';
import RouteOptimization from './pages/driver/RouteOptimization';
import ReportIssues from './pages/driver/ReportIssues';

//Admin imports:
import CustomerQueries from "./pages/admin/CustomerQueries";
import DeliveryInsights from "./pages/admin/DeliveryInsights";
function App() {
  return (
    <Router>
      <AuthProvider>
  
        <Routes>
          {/* Public Routes */}



          <Route path="/admin/dashboard" element={<CustomerDashboard />} />
          <Route path="/admin/queries" element={<CustomerQueries />} />
          <Route path="/admin/insights" element={<DeliveryInsights />} />



          <Route path="/driver/confirm" element={<ConfirmDelivery />} />
          <Route path="/driver/route" element={<RouteOptimization />} />
          <Route path="/driver/issues" element={<ReportIssues />} />


          {/*<Route path="/" element={<CustomerDashboard/>} />*/}
          <Route path="/customer/deliveryconfirm" element={<DeliveryConfirm/>} />
          <Route path="/customer/geofencealerts" element={<GeofenceAlerts/>} />
          <Route path="/customer/idverification" element={<IDVerification/>} />
          <Route path="/customer/tracking" element={<Tracking/>} />



          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} /> {/* New Signup Route */}

          {/* Protected Customer Route */}
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute requiredRole="Customer">
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Driver Route */}
          <Route
            path="/driver/dashboard"
            element={
              <ProtectedRoute requiredRole="Driver">
                <DriverDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Route */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="Admin">
                <AdminDashboard />
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
