import { useState, useEffect } from "react";
import MapComponent from "../../components/MapComponent";
import * as signalR from "@microsoft/signalr";
import { useParams, useNavigate } from "react-router-dom";
import api, { API_BASE_URL } from "../../services/api";
import { Package, MapPin, Truck, ArrowRight, Clock, User, Box } from "lucide-react";

import CustomerSidebar from "./CustomerSidebar";

function Tracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [driverLocation, setDriverLocation] = useState(null);
  const [order, setOrder] = useState(null);
  const [eta, setEta] = useState(null); // ETA state
  const [loading, setLoading] = useState(false);
  const [connection, setConnection] = useState(null);
  const [searchId, setSearchId] = useState("");
  const isPublic = !localStorage.getItem("token");

  useEffect(() => {
    if (id) {
        fetchOrderAndTrack(id);
    }
    
    return () => {
       if (connection) connection.stop();
    };
  }, [id]);

  const fetchOrderAndTrack = async (orderId) => {
    // Only show loading on initial load, not polling updates
    if (!order) setLoading(true);
    
    try {
        const token = localStorage.getItem("token");
        const url = token ? `/customer/track/${orderId}` : `/public/tracking/${orderId}`;
        
        const response = await api.get(url);
        
        // Public endpoint returns structure { order: {...}, driverLocation: ..., eta: ... }
        const data = response.data;
        const orderData = data.order;
        
        // If driver is returned separately (authenticated endpoint), merge it into order
        if (data.driver && !orderData.driver) {
             orderData.driver = data.driver;
        }

        setOrder(orderData);
        
        if (data.driverLocation) {
            setDriverLocation(data.driverLocation);
        }
        
        if (response.data.eta) {
            setEta(response.data.eta);
        } else {
             setEta(null);
        }
        
        // SignalR setup (only if authenticated)
        if (response.data.order?.driverId && token) {
             setupSignalR(response.data.order.id);
        }

    } catch (error) {
        console.error("Error fetching tracking info:", error);
        // Don't clear order on polling error to avoid flickering
        if (!order) setOrder(null);
    } finally {
        setLoading(false);
    }
    };

  // POLLING LOGIC
  useEffect(() => {
      if (!id) return;

      const token = localStorage.getItem("token");
      // Poll every 5s if logged in (or rely on SignalR, but polling ensures sync), 15s if public
      const intervalMs = token ? 30000 : 30000; 

      const intervalId = setInterval(() => {
          fetchOrderAndTrack(id);
      }, intervalMs);

      return () => clearInterval(intervalId);
  }, [id]);

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
          navigate(isPublic ? `/tracking/${searchId}` : `/customer/track/${searchId}`);
      }
  };

  
  const renderInputForm = () => (
      <div className="max-w-md mx-auto bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 mt-20">
          <div className="text-center mb-8">
               <div className="mx-auto bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-white/10">
                   <Package className="h-8 w-8 text-[#ff8a3d]" />
               </div>
               <h3 className="text-2xl font-bold text-white mb-2">Track Shipment</h3>
               <p className="text-slate-400 text-sm">
                   {isPublic ? "Enter your secure tracking ID to see live status." : "Enter Order ID or Tracking Number."}
               </p>
          </div>

          <form onSubmit={handleSearch} className="space-y-6">
              <div className="space-y-2">
                  <label className="text-xs font-bold text-[#ff8a3d] uppercase tracking-wider">
                      {isPublic ? "Tracking Number" : "Order ID / Tracking Number"}
                  </label>
                  <div className="relative">
                      <input 
                          type="text" 
                          value={searchId}
                          onChange={(e) => setSearchId(e.target.value)}
                          className="w-full bg-black/20 text-white p-4 pl-12 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#ff8a3d] focus:border-transparent outline-none transition-all placeholder-slate-600"
                          placeholder={isPublic ? "e.g. E04F9D5156..." : "e.g. 1024 or E04F..."}
                          required
                      />
                      <Package className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500" />
                  </div>
                  {isPublic && <p className="text-xs text-slate-500 italic">Ensure you use the full Tracking ID provided in your email.</p>}
              </div>
              <button 
                  type="submit"
                  className="w-full bg-[#ff8a3d] text-black font-bold py-4 rounded-xl hover:bg-[#e0752d] transition-all duration-300 flex items-center justify-center gap-2"
              >
                  Track Package
                  <ArrowRight className="h-5 w-5" />
              </button>
          </form>
      </div>
  );

  const renderTrackingView = () => (
      <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header Card */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
              
              <div className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                      <div className="flex items-center gap-3 mb-2">
                          <span className="bg-[#ff8a3d]/20 text-[#ff8a3d] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                              {order?.status}
                          </span>
                          <span className="text-slate-500 text-sm">#{order?.trackingId || id}</span>
                      </div>
                      <h1 className="text-3xl font-black text-white mb-1">
                          {order?.status === 'Delivered' ? 'Package Delivered' : 'In Transit'}
                      </h1>
                      <p className="text-slate-400 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Last updated: {new Date().toLocaleTimeString()}
                      </p>
                  </div>
                  
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex items-center gap-4 min-w-[200px]">
                       <div className="bg-[#ff8a3d]/20 p-3 rounded-full">
                           {order?.status === 'Delivered' ? <Box className="h-6 w-6 text-[#ff8a3d]"/> : <Truck className="h-6 w-6 text-[#ff8a3d]" />}
                       </div>
                       <div>
                           <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Estimated Arrival</p>
                           <p className="text-xl font-bold text-white">
                               {order?.status === 'Delivered' ? 'Delivered' : (eta || 'Measuring...')}
                           </p>
                       </div>
                  </div>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Details */}
              <div className="space-y-6">
                  
                  {/* Route Info */}
                  <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                      <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-[#ff8a3d]" /> Shipment Route
                      </h3>
                      
                      <div className="relative pl-8 space-y-10 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/10">
                          {/* Origin */}
                          <div className="relative">
                              <span className="absolute -left-[41px] bg-[#0b0f14] border-2 border-[#ff8a3d] w-6 h-6 rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-[#ff8a3d] rounded-full"></div>
                              </span>
                              <div>
                                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Origin</p>
                                  <h4 className="text-lg font-bold text-white">
                                      {order?.originCity || order?.currentWarehouse?.city || order?.pickupAddress?.split(',')[0] || order?.senderName || "Processing Center"}
                                  </h4>
                                  {localStorage.getItem("token") && order?.pickupAddress ? (
                                      <p className="text-slate-400 text-sm mt-1">{order.pickupAddress}</p>
                                  ) : (
                                      <p className="text-slate-600 text-xs italic mt-1">Full address protected</p>
                                  )}
                              </div>
                          </div>

                          {/* Destination */}
                          <div className="relative">
                              <span className={`absolute -left-[41px] ${order?.status === 'Delivered' ? 'bg-[#ff8a3d]' : 'bg-[#0b0f14]'} border-2 border-[#ff8a3d] w-6 h-6 rounded-full flex items-center justify-center`}>
                                  <div className={`w-2 h-2 ${order?.status === 'Delivered' ? 'bg-black' : 'bg-white'} rounded-full`}></div>
                              </span>
                              <div>
                                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Destination</p>
                                  <h4 className="text-lg font-bold text-white">
                                      {order?.destinationCity || order?.receiverAddress?.split(',')[0] || order?.receiverName || "Destination"}
                                  </h4>
                                  {localStorage.getItem("token") && order?.receiverAddress ? (
                                      <>
                                          <p className="text-slate-400 text-sm mt-1">{order.receiverAddress}</p>
                                          {order?.price && (
                                              <div className="mt-3 inline-block bg-[#064e3b] text-[#34d399] px-2 py-1 rounded text-xs font-bold border border-[#065f46]">
                                                  COD: ₹{order.price}
                                              </div>
                                          )}
                                      </>
                                  ) : (
                                      <p className="text-slate-600 text-xs italic mt-1">Full address protected</p>
                                  )}
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Driver & Details */}
                  <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                          <User className="h-5 w-5 text-[#ff8a3d]" /> Delivery Agent
                      </h3>
                      
                      <div className="flex items-center gap-4 mb-8">
                           <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                               <User className="h-6 w-6 text-slate-400"/>
                           </div>
                           <div>
                               <p className="font-bold text-white text-lg">
                                  {order?.driverName || (order?.driver ? 
                                      `${order.driver.userFName || order.driver.UserFName || ''} ${order.driver.userLName || order.driver.UserLName || ''}` 
                                      : 'Unassigned')}
                               </p>
                               <p className="text-sm text-slate-500">Ontrack Certified Driver</p>
                           </div>
                      </div>

                      {localStorage.getItem("token") && (
                          <div className="border-t border-white/10 pt-6 grid grid-cols-2 gap-4">
                              <div>
                                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Receiver</p>
                                  <p className="text-white font-medium">{order?.receiverName}</p>
                                  <p className="text-slate-500 text-xs">{order?.receiverPhone}</p>
                              </div>
                              <div>
                                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Package</p>
                                  <p className="text-white font-medium">{order?.parcelSize}</p>
                                  <p className="text-slate-500 text-xs">{order?.weight} kg</p>
                              </div>
                          </div>
                      )}
                  </div>
              </div>

              {/* Right Column: Map */}
              <div className="lg:col-span-2 h-[600px] bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden relative">
                 {driverLocation ? (
                      <MapComponent
                        center={[driverLocation.latitude, driverLocation.longitude]}
                        zoom={13}
                        markers={[{
                            position: [driverLocation.latitude, driverLocation.longitude],
                            popup: "Driver Location"
                        }, {
                            position: [order?.deliveryLatitude || 13.0827, order?.deliveryLongitude || 80.2707],
                            popup: "Delivery Location"
                        }]}
                        driverLocation={driverLocation} 
                      />
                 ) : (
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-[#0b0f14]/50 backdrop-blur-sm">
                         <div className="bg-white/10 p-4 rounded-full mb-4 animate-pulse">
                             <MapPin className="h-8 w-8 text-slate-400" />
                         </div>
                         <p className="font-medium">
                             {order?.status === 'PendingAssignment' ? 'Searching for nearby drivers...' : 'Waiting for location signal...'}
                         </p>
                     </div>
                 )}
              </div>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen flex bg-[#0b0f14] text-slate-100 font-sans">
      {!isPublic && <CustomerSidebar active="track" />}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto transition-all duration-300">
        {!id ? (
            renderInputForm()
        ) : loading ? (
            <div className="flex flex-col items-center justify-center h-[80vh]">
                <div className="w-16 h-16 border-4 border-white/10 border-t-[#ff8a3d] rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 animate-pulse">Retrieving satellite data...</p>
            </div>
        ) : !order ? (
            <div className="text-center mt-20 max-w-md mx-auto">
                <div className="bg-red-500/10 p-6 rounded-2xl border border-red-500/20">
                    <h3 className="text-xl font-bold text-red-500 mb-2">Tracking Failed</h3>
                    <p className="text-slate-400 mb-6">We couldn't find a package with that ID. Please check your tracking number and try again.</p>
                    <button onClick={() => navigate(isPublic ? '/tracking' : '/customer/tracking')} className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg transition-colors">
                        Try Another ID
                    </button>
                </div>
            </div>
        ) : (
            renderTrackingView()
        )}
      </div>
    </div>
  );
}

export default Tracking;