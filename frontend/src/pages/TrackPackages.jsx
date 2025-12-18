import { useState } from "react";
import api from "../services/api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

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
      setError("Tracking ID not found", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#351c15] to-[#4e2a1f] p-4">
      <div className="max-w-4xl mx-auto bg-[#f8f4ef] rounded-2xl shadow-xl p-8 border border-[#e6d8c9]">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#351c15] mb-1">
            📦 Track Your Package
          </h1>
          <p className="text-sm text-[#6b4f3a]">
            Enter your tracking ID to get real-time delivery updates
          </p>
        </div>

        {/* Input */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            placeholder="Enter Tracking ID (e.g. ONT123456)"
            className="flex-1 px-4 py-3 border border-[#d4c7b9] rounded-lg 
                       focus:ring-2 focus:ring-[#ffb500] 
                       focus:border-transparent outline-none"
          />
          <button
            onClick={track}
            disabled={loading}
            className={`px-8 py-3 rounded-lg font-semibold transition-all
              ${
                loading
                  ? "bg-[#d6b36d] cursor-not-allowed"
                  : "bg-[#351c15] text-white hover:bg-[#2a1510]"
              }`}
          >
            {loading ? "Tracking..." : "Track"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <p className="text-center text-[#6b4f3a]">
            Fetching live shipment data...
          </p>
        )}

        {/* Data */}
        {data && (
          <>
            {/* Status Card */}
            <div className="bg-white p-6 rounded-xl shadow mb-6 border border-[#e6d8c9]">
              <h2 className="text-lg font-semibold text-[#351c15] mb-4">
                Shipment Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <p>
                  <span className="font-medium text-[#4b382e]">Status:</span>{" "}
                  <span className="text-[#351c15] font-semibold">
                    {data.status}
                  </span>
                </p>
                <p>
                  <span className="font-medium text-[#4b382e]">Driver:</span>{" "}
                  {data.driverName}
                </p>
                <p>
                  <span className="font-medium text-[#4b382e]">Phone:</span>{" "}
                  {data.driverPhone}
                </p>
                <p>
                  <span className="font-medium text-[#4b382e]">Pickup:</span>{" "}
                  {data.pickupAddress}
                </p>
                <p className="sm:col-span-2">
                  <span className="font-medium text-[#4b382e]">Delivery:</span>{" "}
                  {data.deliveryAddress}
                </p>
              </div>
            </div>

            {/* Map */}
            {data.driverLatitude && data.driverLongitude && (
              <div className="rounded-xl overflow-hidden shadow border border-[#e6d8c9]">
                <MapContainer
                  center={[data.driverLatitude, data.driverLongitude]}
                  zoom={13}
                  className="h-96 w-full"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker
                    position={[data.driverLatitude, data.driverLongitude]}
                  >
                    <Popup>🚚 Driver Current Location</Popup>
                  </Marker>
                </MapContainer>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}