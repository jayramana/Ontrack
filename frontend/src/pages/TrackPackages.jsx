import { useState } from "react";
import api from "../services/api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Search, Package, User, Phone, MapPin, Truck } from "lucide-react";

export default function TrackPackage() {
  const [trackingId, setTrackingId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const track = async () => {
    if (!trackingId) {
      setError("Please enter a Tracking ID");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/track/${trackingId}`);
      setData(res.data);
    } catch (err) {
      setError("Tracking ID not found");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f14] text-white p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ff8a3d11,transparent_50%)]" />

      <div className="relative max-w-4xl mx-auto bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-10 border border-white/10 mt-10">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex p-3 bg-orange-500/10 rounded-2xl text-[#ff8a3d] mb-4">
            <Truck size={32} />
          </div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
            Track Package
          </h1>
          <p className="text-slate-400">
            Real-time updates for your OnTrack shipment
          </p>
        </div>

        {/* Input */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="Enter Tracking ID (e.g. ONT123456)"
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl 
                         text-white placeholder-slate-500
                         focus:outline-none focus:ring-2 focus:ring-[#ff8a3d] focus:border-transparent
                         transition-all"
            />
          </div>
          <button
            onClick={track}
            disabled={loading}
            className={`px-10 py-4 rounded-2xl font-bold transition-all shadow-lg
              ${loading
                ? "bg-white/10 text-slate-500 cursor-not-allowed"
                : "bg-[#ff8a3d] text-black hover:bg-[#ff9f5d] transform hover:-translate-y-0.5 active:translate-y-0"
              }`}
          >
            {loading ? "Tracking..." : "Track Now"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl mb-8 text-sm text-center">
            {error}
          </div>
        )}

        {/* Data */}
        {data && (
          <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
            {/* Status Card */}
            <div className="bg-white/5 p-6 md:p-8 rounded-3xl border border-white/10 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Package className="text-[#ff8a3d]" size={24} />
                <h2 className="text-xl font-bold text-white">
                  Shipment Details
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">Current Status</span>
                    <span className="text-lg font-bold text-[#ff8a3d]">{data.status}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">Driver</span>
                    <div className="flex items-center gap-2 text-white font-medium">
                      <User size={16} className="text-slate-400" /> {data.driverName}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">Phone</span>
                    <div className="flex items-center gap-2 text-white font-medium">
                      <Phone size={16} className="text-slate-400" /> {data.driverPhone}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">Pickup From</span>
                    <div className="flex items-start gap-2 text-white font-medium">
                      <MapPin size={16} className="text-slate-400 mt-1 shrink-0" /> {data.pickupAddress}
                    </div>
                  </div>
                  <div className="flex flex-col text-white">
                    <span className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">Delivery Location</span>
                    <div className="flex items-start gap-2 text-white font-medium leading-relaxed">
                      <MapPin size={16} className="text-[#ff8a3d] mt-1 shrink-0" /> {data.deliveryAddress}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            {data.driverLatitude && data.driverLongitude && (
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/10 h-[400px]">
                <MapContainer
                  center={[data.driverLatitude, data.driverLongitude]}
                  zoom={13}
                  className="h-full w-full grayscale-[0.2] invert-[0.1]"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker
                    position={[data.driverLatitude, data.driverLongitude]}
                  >
                    <Popup>
                      <div className="text-black font-bold">🚚 Driver is here</div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
