import { useState, useEffect } from "react";
import MapComponent from "../../components/MapComponent";
import * as signalR from "@microsoft/signalr";
import { useParams, useNavigate } from "react-router-dom";
import CustomerSidebar from "./CustomerSidebar";
import api, { API_BASE_URL } from "../../services/api";

function Tracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [driverLocation, setDriverLocation] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [connection, setConnection] = useState(null);
  const [searchId, setSearchId] = useState("");

  useEffect(() => {
    if (id) {
        fetchOrderAndTrack(id);
    }
    
    return () => {
       if (connection) connection.stop();
    };
  }, [id]);

  const fetchOrderAndTrack = async (orderId) => {
    setLoading(true);
    try {
        const response = await api.get(`/customer/track/${orderId}`);
        setOrder(response.data.order);
        if (response.data.driverLocation) {
            setDriverLocation(response.data.driverLocation);
        }
        if (response.data.order?.driverId) {
             setupSignalR(response.data.order.id);
        }

    } catch (error) {
        console.error("Error fetching tracking info:", error);
        setOrder(null);
    } finally {
        setLoading(false);
    }
  };

  const setupSignalR = async (currentOrderId) => {
    if (connection) return;

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(API_BASE_URL.replace("/api", "/hubs/logistics"), {
        accessTokenFactory: () => localStorage.getItem("token") || ""
      })
      .withAutomaticReconnect()
      .build();

    newConnection.on("ReceiveDriverLocation", (payload) => {
        setDriverLocation({
             latitude: payload.latitude, 
             longitude: payload.longitude 
        });
    });

    try {
      await newConnection.start();
      await newConnection.invoke("JoinOrderGroup", Number(currentOrderId));
      setConnection(newConnection);
    } catch (err) {
      console.error('SignalR Connection Error: ', err);
    }
  };

  const handleSearch = (e) => {
      e.preventDefault();
      if(searchId) {
          navigate(`/customer/track/${searchId}`);
      }
  };

  
  const renderInputForm = () => (
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md border border-[#e6ddc5] mt-10">
          <h3 className="text-2xl font-bold text-[#351c15] mb-6 text-center">Track Your Package</h3>
          <form onSubmit={handleSearch} className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order ID / Tracking Number</label>
                  <input 
                      type="text" 
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f9b400] focus:border-transparent outline-none"
                      placeholder="e.g. 1024"
                      required
                  />
              </div>
              <button 
                  type="submit"
                  className="w-full bg-[#351c15] text-white font-bold py-3 rounded-lg hover:bg-[#2b160f] transition-all"
              >
                  Track Now
              </button>
          </form>
      </div>
  );

  const renderTrackingView = () => (
      <div className="space-y-6">
          {/* Header Info */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e6ddc5] flex justify-between items-center">
              <div>
                  <h2 className="text-xl font-bold text-[#351c15]">Order #{id}</h2>
                  <p className="text-gray-500">{order?.status}</p>
              </div>
              <div className="text-right">
                   <p className="text-sm text-gray-400">ETA</p>
                   <p className="text-lg font-bold text-[#f9b400]">
                       {order?.status === 'Delivered' ? 'Delivered' : 'Calculating...'}
                   </p>
              </div>
          </div>

          {/* Map */}
          <div className="bg-[#fff8e7] border border-[#e6ddc5] rounded-xl shadow p-4 h-[600px]">
             {driverLocation ? (
                  <MapComponent
                    center={[driverLocation.latitude, driverLocation.longitude]}
                    zoom={13}
                    markers={[{
                        position: [driverLocation.latitude, driverLocation.longitude],
                        popup: "Driver Location"
                    }, {
                        position: [order?.deliveryLatitude || 13.0827, order?.deliveryLongitude || 80.2707],
                        popup: "Data Delivery Location"
                    }]}
                    // Passes the driver location to update the view
                    driverLocation={driverLocation} 
                  />
             ) : (
                 <div className="h-full flex items-center justify-center text-gray-500">
                     {order?.status === 'PendingAssignment' ? 'Waiting for driver assignment...' : 'Waiting for location signal...'}
                 </div>
             )}
          </div>
      </div>
  );

  return (
    <div className="min-h-screen flex bg-[#f7f3ef]">
      <CustomerSidebar active="track" />

      <div className="flex-1 p-10 overflow-y-auto">
        {!id ? (
            renderInputForm()
        ) : loading ? (
            <div className="flex justify-center items-center h-full">Loading tracking info...</div>
        ) : !order ? (
            <div className="text-center mt-10">
                <p className="text-red-500 font-bold mb-4">Order not found</p>
                <button onClick={() => navigate('/customer/tracking')} className="text-blue-600 hover:underline">Try another ID</button>
            </div>
        ) : (
            renderTrackingView()
        )}
      </div>
    </div>
  );
}

export default Tracking;