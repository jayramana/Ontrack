import { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, Navigation, MapPin, X, Check } from "lucide-react";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png"
});

// Default center: Chennai
const DEFAULT_CENTER = [13.0827, 80.2707];
const API_BASE = `${import.meta.env.VITE_API_URL}/api/geocode`;

function ClickHandler({ setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    }
  });
  return null;
}

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 15);
  }, [center, map]);
  return null;
}

export default function MapPicker({
  initialPosition,
  onSelect,
  onCancel,
  title
}) {
  const [position, setPosition] = useState(initialPosition || null);
  const [reverseInfo, setReverseInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const searchTimeoutRef = useRef(null);
  const [mapCenter, setMapCenter] = useState(initialPosition || DEFAULT_CENTER);

  // =============================
  // ✅ Reverse Geocode (BACKEND)
  // =============================
  useEffect(() => {
    if (!position) return;

    const fetchReverse = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE}/reverse?lat=${position[0]}&lon=${position[1]}`
        );
        const json = await res.json();

        setReverseInfo({
          display_name: json.display_name || "",
          postcode: json.address?.postcode || ""
        });
      } catch (err) {
        console.error("Reverse Geocoding Error:", err);
        setReverseInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchReverse();
  }, [position]);

  // =============================
  // Search input (debounced)
  // =============================
  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeoutRef.current)
      clearTimeout(searchTimeoutRef.current);

    if (value.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 500);
  };

  // =============================
  // ✅ Search via BACKEND
  // =============================
  const performSearch = async (query) => {
    setSearching(true);
    setShowResults(true);

    try {
      const res = await fetch(
        `${API_BASE}/search?q=${encodeURIComponent(query)}`
      );
      const json = await res.json();

      const priority = {
        house: 1,
        residential: 2,
        building: 3,
        shop: 4,
        amenity: 5,
        road: 6,
        suburb: 7,
        city: 8
      };

      const sorted = json.sort((a, b) => {
        return (priority[a.type] || 10) - (priority[b.type] || 10);
      });

      setSearchResults(sorted);
    } catch (err) {
      console.error("Search Error:", err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSearchResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    setPosition([lat, lng]);
    setMapCenter([lat, lng]);
    setSearchQuery(result.display_name);
    setShowResults(false);
    setSearchResults([]);
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current)
        clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-[#0f141c] border border-white/10 rounded-3xl w-full max-w-6xl h-[90vh] shadow-2xl flex flex-col overflow-hidden">

        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#1a1f29]">
          <h2 className="font-bold text-xl text-white flex items-center gap-2">
            <MapPin className="text-[#ff8a3d]" />
            {title}
          </h2>
          <div className="flex gap-3">
            <button
              type="button"
              className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition font-medium"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-6 py-2 bg-[#ff8a3d] text-black font-bold rounded-xl hover:bg-[#e0a200] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={!position}
              onClick={() =>
                onSelect({
                  lat: position[0],
                  lng: position[1],
                  address: reverseInfo?.display_name || "",
                  pincode: reverseInfo?.postcode || ""
                })
              }
            >
              <Check className="w-4 h-4" />
              Select Location
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">

          {/* MAP */}
          <div className="w-[70%] h-full relative">
            <div className="absolute top-6 left-6 right-6 z-[1000]">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={handleSearchInput}
                  placeholder="Search address, landmark, place..."
                  className="w-full pl-12 pr-4 py-3 bg-[#1a1f29]/90 backdrop-blur border border-white/20 rounded-xl shadow-lg text-white placeholder-slate-400 focus:outline-none focus:border-[#ff8a3d] transition"
                />
                {searchQuery && (
                   <button 
                     onClick={() => setSearchQuery("")}
                     className="absolute right-4 top-3.5 text-slate-400 hover:text-white"
                   >
                     <X className="w-5 h-5" />
                   </button>
                )}
              </div>

              {showResults && searchResults.length > 0 && (
                <div className="bg-[#1a1f29]/95 backdrop-blur border border-white/10 mt-2 rounded-xl shadow-xl max-h-72 overflow-y-auto">
                  {searchResults.map((r, i) => (
                    <button
                      key={i}
                      className="w-full text-left px-4 py-3 hover:bg-white/10 border-b border-white/5 last:border-0 transition text-slate-200 text-sm"
                      onClick={() => handleSelectSearchResult(r)}
                    >
                      {r.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <MapContainer
              center={initialPosition || DEFAULT_CENTER}
              zoom={13}
              scrollWheelZoom
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              <ClickHandler setPosition={setPosition} />
              <MapUpdater center={mapCenter} />
              {position && <Marker position={position} />}
            </MapContainer>
          </div>

          {/* INFO */}
          <div className="w-[30%] p-6 border-l border-white/10 bg-[#0f141c] overflow-y-auto space-y-6">
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
                <Navigation className="w-4 h-4" />
                How to select
              </h3>
              <ul className="text-sm text-slate-400 space-y-1 list-disc pl-4">
                <li>Search for an exact address</li>
                <li>Or click directly on the map</li>
                <li>Verify details below</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Coordinates</p>
                <div className="flex gap-4 font-mono text-sm text-[#ff8a3d]">
                  <span>{position?.[0]?.toFixed(6) || "—"}</span>
                  <span className="text-slate-600">|</span>
                  <span>{position?.[1]?.toFixed(6) || "—"}</span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Detected Address</p>
                <p className="text-sm text-slate-200 leading-relaxed">
                   {loading ? (
                     <span className="flex items-center gap-2 text-slate-400">
                       <span className="w-3 h-3 border-2 border-slate-500 border-t-white rounded-full animate-spin" />
                       Fetching address...
                     </span>
                   ) : (reverseInfo?.display_name || <span className="text-slate-500 italic">No location selected</span>)}
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                 <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Postal Code</p>
                 <p className="text-xl font-bold text-white">
                   {loading ? "..." : reverseInfo?.postcode || "—"}
                 </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}