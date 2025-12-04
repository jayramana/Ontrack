import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ChooseRole from "./pages/ChooseRole";
import SignupPage from "./pages/SignupPage";
import CustomerDashboard from "./pages/Customer/CustomerDashboard";
import Tracking from "./pages/Customer/Tracking";
import GeofenceAlerts from "./pages/Customer/GeofenceAlerts";
import IdVerification from "./pages/Customer/IdVerification";
import DeliveryConfirm from "./pages/Customer/DeliveryConfirm";
function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/choose-role" element={<ChooseRole />} />
      <Route path="/signup/:role" element={<SignupPage />} />
      <Route path="/customer/customerdashboard" element={<CustomerDashboard />} />
      <Route path="/customer/tracking" element={<Tracking/>} />
      <Route path="/customer/geofencealerts" element={<GeofenceAlerts/>} />
      <Route path="/customer/idverification" element={<IdVerification/>} />
      <Route path="/customer/deliveryconfirm" element={<DeliveryConfirm/>} />
    </Routes>
  );
}

export default App;
