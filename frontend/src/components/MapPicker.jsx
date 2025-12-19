// // import { useState, useEffect, useRef } from "react";
// // import {
// //   MapContainer,
// //   TileLayer,
// //   Marker,
// //   useMapEvents,
// //   useMap
// // } from "react-leaflet";
// // import L from "leaflet";
// // import "leaflet/dist/leaflet.css";

// // delete L.Icon.Default.prototype._getIconUrl;
// // L.Icon.Default.mergeOptions({
// //   iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
// //   iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
// //   shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png"
// // });

// // // Default center: Chennai
// // const DEFAULT_CENTER = [13.0827, 80.2707];

// // function ClickHandler({ setPosition }) {
// //   useMapEvents({
// //     click(e) {
// //       setPosition([e.latlng.lat, e.latlng.lng]);
// //     }
// //   });
// //   return null;
// // }

// // function MapUpdater({ center }) {
// //   const map = useMap();
// //   useEffect(() => {
// //     if (center) {
// //       map.setView(center, 15);
// //     }
// //   }, [center, map]);
// //   return null;
// // }

// // export default function MapPicker({
// //   initialPosition,
// //   onSelect,
// //   onCancel,
// //   title
// // }) {
// //   const [position, setPosition] = useState(initialPosition || null);
// //   const [reverseInfo, setReverseInfo] = useState(null);
// //   const [loading, setLoading] = useState(false);
// //   const [searchQuery, setSearchQuery] = useState("");
// //   const [searchResults, setSearchResults] = useState([]);
// //   const [searching, setSearching] = useState(false);
// //   const [showResults, setShowResults] = useState(false);
// //   const searchTimeoutRef = useRef(null);
// //   const [mapCenter, setMapCenter] = useState(initialPosition || DEFAULT_CENTER);

// //   // Reverse Geocode
// //   useEffect(() => {
// //     if (!position) return;

// //     const fetchReverse = async () => {
// //       setLoading(true);
// //       try {
// //         const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position[0]}&lon=${position[1]}&addressdetails=1`;
// //         const res = await fetch(url, {
// //           headers: { "User-Agent": "OntrackLogisticsApp/1.0" }
// //         });
// //         const json = await res.json();
// //         setReverseInfo({
// //           display_name: json.display_name,
// //           postcode: json.address?.postcode || ""
// //         });
// //       } catch (err) {
// //         console.error("Reverse Geocoding Error:", err);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchReverse();
// //   }, [position]);

// //   // Search addresses
// //   const handleSearchInput = (e) => {
// //     const value = e.target.value;
// //     setSearchQuery(value);

// //     // Clear previous timeout
// //     if (searchTimeoutRef.current) {
// //       clearTimeout(searchTimeoutRef.current);
// //     }

// //     // Don't search if query is too short
// //     if (value.length < 3) {
// //       setSearchResults([]);
// //       setShowResults(false);
// //       return;
// //     }

// //     // Debounce search
// //     searchTimeoutRef.current = setTimeout(() => {
// //       performSearch(value);
// //     }, 500);
// //   };

// //   const performSearch = async (query) => {
// //     setSearching(true);
// //     setShowResults(true);
// //     try {
// //       // Enhanced search with country bias and language preference
// //       const url = `https://nominatim.openstreetmap.org/search?` +
// //         `format=json` +
// //         `&q=${encodeURIComponent(query)}` +
// //         `&limit=8` +
// //         `&addressdetails=1` +
// //         `&countrycodes=in` + // Limit to India for better accuracy
// //         `&accept-language=en` + // Prefer English results
// //         `&bounded=0` +
// //         `&dedupe=1`; // Remove duplicate results
      
// //       const res = await fetch(url, {
// //         headers: { "User-Agent": "OntrackLogisticsApp/1.0" }
// //       });
// //       const json = await res.json();
      
// //       // Sort results by importance (type priority)
// //       const sortedResults = json.sort((a, b) => {
// //         const priority = {
// //           'house': 1,
// //           'residential': 2,
// //           'building': 3,
// //           'shop': 4,
// //           'amenity': 5,
// //           'road': 6,
// //           'suburb': 7,
// //           'city': 8
// //         };
// //         const aPriority = priority[a.type] || 10;
// //         const bPriority = priority[b.type] || 10;
// //         return aPriority - bPriority;
// //       });
      
// //       setSearchResults(sortedResults);
// //     } catch (err) {
// //       console.error("Search Error:", err);
// //       setSearchResults([]);
// //     } finally {
// //       setSearching(false);
// //     }
// //   };

// //   const handleSelectSearchResult = (result) => {
// //     const lat = parseFloat(result.lat);
// //     const lng = parseFloat(result.lon);
// //     setPosition([lat, lng]);
// //     setMapCenter([lat, lng]);
// //     setSearchQuery(result.display_name);
// //     setShowResults(false);
// //     setSearchResults([]);
// //   };

// //   // Cleanup timeout on unmount
// //   useEffect(() => {
// //     return () => {
// //       if (searchTimeoutRef.current) {
// //         clearTimeout(searchTimeoutRef.current);
// //       }
// //     };
// //   }, []);

// //   return (
// //     <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
// //       <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] shadow-xl flex flex-col overflow-hidden">

// //         {/* HEADER */}
// //         <div className="flex justify-between items-center p-4 border-b bg-gray-50">
// //           <h2 className="font-semibold text-lg">{title}</h2>
// //           <div className="flex gap-2">
// //             <button 
// //               type="button"
// //               className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition" 
// //               onClick={onCancel}
// //             >
// //               Cancel
// //             </button>
// //             <button
// //               type="button"
// //               className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
// //               disabled={!position}
// //               onClick={() => {
// //                 if (!position) {
// //                   alert("Click on map to choose a location.");
// //                   return;
// //                 }
// //                 onSelect({
// //                   lat: position[0],
// //                   lng: position[1],
// //                   address: reverseInfo?.display_name || "",
// //                   pincode: reverseInfo?.postcode || ""
// //                 });
// //               }}
// //             >
// //               Select Location
// //             </button>
// //           </div>
// //         </div>

// //         {/* BODY */}
// //         <div className="flex flex-1 overflow-hidden">

// //           {/* MAP AREA - 70% */}
// //           <div className="w-[70%] h-full relative">
// //             {/* SEARCH BAR */}
// //             <div className="absolute top-4 left-4 right-4 z-[1000]">
// //               <div className="relative">
// //                 <input
// //                   type="text"
// //                   value={searchQuery}
// //                   onChange={handleSearchInput}
// //                   onFocus={() => searchResults.length > 0 && setShowResults(true)}
// //                   placeholder="Search for an address, landmark, or place..."
// //                   className="w-full px-4 py-3 pr-10 border-2 border-gray-300 rounded-lg shadow-lg focus:outline-none focus:border-blue-500 bg-white"
// //                 />
// //                 {searching && (
// //                   <div className="absolute right-3 top-3.5">
// //                     <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
// //                   </div>
// //                 )}
// //                 {searchQuery && !searching && (
// //                   <button
// //                     type="button"
// //                     onClick={() => {
// //                       setSearchQuery("");
// //                       setSearchResults([]);
// //                       setShowResults(false);
// //                     }}
// //                     className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
// //                   >
// //                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
// //                     </svg>
// //                   </button>
// //                 )}

// //                 {/* SEARCH RESULTS DROPDOWN */}
// //                 {showResults && searchResults.length > 0 && (
// //                   <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-80 overflow-y-auto z-[1001]">
// //                     {searchResults.map((result, idx) => (
// //                       <button
// //                         key={idx}
// //                         type="button"
// //                         onClick={() => handleSelectSearchResult(result)}
// //                         className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition"
// //                       >
// //                         <div className="flex items-start gap-3">
// //                           <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
// //                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
// //                           </svg>
// //                           <div className="flex-1">
// //                             <div className="text-sm font-medium text-gray-900">
// //                               {result.display_name}
// //                             </div>
// //                             <div className="flex items-center gap-2 mt-1">
// //                               {result.address?.postcode && (
// //                                 <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
// //                                   PIN: {result.address.postcode}
// //                                 </span>
// //                               )}
// //                               {result.type && (
// //                                 <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded capitalize">
// //                                   {result.type}
// //                                 </span>
// //                               )}
// //                             </div>
// //                           </div>
// //                         </div>
// //                       </button>
// //                     ))}
// //                   </div>
// //                 )}

// //                 {showResults && searchResults.length === 0 && !searching && searchQuery.length >= 3 && (
// //                   <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-[1001]">
// //                     <p className="text-sm text-gray-500 text-center">No results found. Try a different search term.</p>
// //                   </div>
// //                 )}
// //               </div>
// //             </div>

// //             <MapContainer
// //               center={initialPosition || DEFAULT_CENTER}
// //               zoom={13}
// //               scrollWheelZoom={true}
// //               style={{ width: "100%", height: "100%" }}
// //             >
// //               {/* CartoDB Voyager - Fast, reliable, works in India */}
// //               <TileLayer
// //                 url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
// //                 attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
// //                 subdomains="abcd"
// //                 maxZoom={20}
// //               />

// //               <ClickHandler setPosition={setPosition} />
// //               <MapUpdater center={mapCenter} />

// //               {position && <Marker position={position} />}
// //             </MapContainer>
// //           </div>

// //           {/* INFO PANEL - 30% */}
// //           <div className="w-[30%] border-l bg-gray-50 p-6 overflow-y-auto">
// //             <h3 className="font-semibold text-lg mb-4 text-gray-800">How to Use</h3>
// //             <ul className="list-disc text-sm pl-5 space-y-2 text-gray-700 mb-6">
// //               <li>Search using street name, area, or landmark</li>
// //               <li>Be specific: "Anna Nagar, Chennai" works better than just "Chennai"</li>
// //               <li>Or click anywhere on the map</li>
// //               <li>A marker will appear at that location</li>
// //               <li>Address & pincode will auto-fill</li>
// //               <li>Click "Select Location" to confirm</li>
// //             </ul>

// //             <div className="space-y-4">
// //               <div className="bg-white p-3 rounded border">
// //                 <p className="text-xs text-gray-500 mb-1">Latitude</p>
// //                 <p className="text-sm font-mono">{position?.[0]?.toFixed(6) ?? "—"}</p>
// //               </div>

// //               <div className="bg-white p-3 rounded border">
// //                 <p className="text-xs text-gray-500 mb-1">Longitude</p>
// //                 <p className="text-sm font-mono">{position?.[1]?.toFixed(6) ?? "—"}</p>
// //               </div>

// //               <div className="bg-white p-3 rounded border">
// //                 <p className="text-xs text-gray-500 mb-1">Detected Address</p>
// //                 {loading ? (
// //                   <p className="text-sm text-gray-400 italic">Loading...</p>
// //                 ) : (
// //                   <p className="text-sm">{reverseInfo?.display_name || "—"}</p>
// //                 )}
// //               </div>

// //               <div className="bg-white p-3 rounded border">
// //                 <p className="text-xs text-gray-500 mb-1">Pincode</p>
// //                 {loading ? (
// //                   <p className="text-sm text-gray-400 italic">Loading...</p>
// //                 ) : (
// //                   <p className="text-sm font-semibold">{reverseInfo?.postcode || "Not available"}</p>
// //                 )}
// //               </div>
// //             </div>

// //             {!position && (
// //               <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded">
// //                 <p className="text-sm text-blue-700">👆 Click on the map to select a location</p>
// //               </div>
// //             )}
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// import { useState, useEffect, useRef } from "react";
// import {
//   MapContainer,
//   TileLayer,
//   Marker,
//   useMapEvents,
//   useMap
// } from "react-leaflet";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";

// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
//   iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png"
// });

// // Default center: Chennai
// const DEFAULT_CENTER = [13.0827, 80.2707];
// const API_BASE = "http://localhost:5066/api/geocode";

// function ClickHandler({ setPosition }) {
//   useMapEvents({
//     click(e) {
//       setPosition([e.latlng.lat, e.latlng.lng]);
//     }
//   });
//   return null;
// }

// function MapUpdater({ center }) {
//   const map = useMap();
//   useEffect(() => {
//     if (center) map.setView(center, 15);
//   }, [center, map]);
//   return null;
// }

// export default function MapPicker({
//   initialPosition,
//   onSelect,
//   onCancel,
//   title
// }) {
//   const [position, setPosition] = useState(initialPosition || null);
//   const [reverseInfo, setReverseInfo] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchResults, setSearchResults] = useState([]);
//   const [searching, setSearching] = useState(false);
//   const [showResults, setShowResults] = useState(false);

//   const searchTimeoutRef = useRef(null);
//   const [mapCenter, setMapCenter] = useState(initialPosition || DEFAULT_CENTER);

//   // =============================
//   // ✅ Reverse Geocode (BACKEND)
//   // =============================
//   useEffect(() => {
//     if (!position) return;

//     const fetchReverse = async () => {
//       setLoading(true);
//       try {
//         const res = await fetch(
//           `${API_BASE}/reverse?lat=${position[0]}&lon=${position[1]}`
//         );
//         const json = await res.json();

//         setReverseInfo({
//           display_name: json.display_name || "",
//           postcode: json.address?.postcode || ""
//         });
//       } catch (err) {
//         console.error("Reverse Geocoding Error:", err);
//         setReverseInfo(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchReverse();
//   }, [position]);

//   // =============================
//   // Search input (debounced)
//   // =============================
//   const handleSearchInput = (e) => {
//     const value = e.target.value;
//     setSearchQuery(value);

//     if (searchTimeoutRef.current)
//       clearTimeout(searchTimeoutRef.current);

//     if (value.length < 3) {
//       setSearchResults([]);
//       setShowResults(false);
//       return;
//     }

//     searchTimeoutRef.current = setTimeout(() => {
//       performSearch(value);
//     }, 500);
//   };

//   // =============================
//   // ✅ Search via BACKEND
//   // =============================
//   const performSearch = async (query) => {
//     setSearching(true);
//     setShowResults(true);

//     try {
//       const res = await fetch(
//         `${API_BASE}/search?q=${encodeURIComponent(query)}`
//       );
//       const json = await res.json();

//       const priority = {
//         house: 1,
//         residential: 2,
//         building: 3,
//         shop: 4,
//         amenity: 5,
//         road: 6,
//         suburb: 7,
//         city: 8
//       };

//       const sorted = json.sort((a, b) => {
//         return (priority[a.type] || 10) - (priority[b.type] || 10);
//       });

//       setSearchResults(sorted);
//     } catch (err) {
//       console.error("Search Error:", err);
//       setSearchResults([]);
//     } finally {
//       setSearching(false);
//     }
//   };

//   const handleSelectSearchResult = (result) => {
//     const lat = parseFloat(result.lat);
//     const lng = parseFloat(result.lon);

//     setPosition([lat, lng]);
//     setMapCenter([lat, lng]);
//     setSearchQuery(result.display_name);
//     setShowResults(false);
//     setSearchResults([]);
//   };

//   useEffect(() => {
//     return () => {
//       if (searchTimeoutRef.current)
//         clearTimeout(searchTimeoutRef.current);
//     };
//   }, []);

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
//       <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] shadow-xl flex flex-col overflow-hidden">

//         {/* HEADER */}
//         <div className="flex justify-between items-center p-4 border-b bg-gray-50">
//           <h2 className="font-semibold text-lg">{title}</h2>
//           <div className="flex gap-2">
//             <button
//               type="button"
//               className="px-4 py-2 border rounded"
//               onClick={onCancel}
//             >
//               Cancel
//             </button>
//             <button
//               type="button"
//               className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
//               disabled={!position}
//               onClick={() =>
//                 onSelect({
//                   lat: position[0],
//                   lng: position[1],
//                   address: reverseInfo?.display_name || "",
//                   pincode: reverseInfo?.postcode || ""
//                 })
//               }
//             >
//               Select Location
//             </button>
//           </div>
//         </div>

//         <div className="flex flex-1 overflow-hidden">

//           {/* MAP */}
//           <div className="w-[70%] h-full relative">
//             <div className="absolute top-4 left-4 right-4 z-[1000]">
//               <input
//                 value={searchQuery}
//                 onChange={handleSearchInput}
//                 placeholder="Search address, landmark, place..."
//                 className="w-full px-4 py-3 border rounded-lg shadow"
//               />

//               {showResults && searchResults.length > 0 && (
//                 <div className="bg-white shadow-lg mt-2 rounded max-h-72 overflow-y-auto">
//                   {searchResults.map((r, i) => (
//                     <button
//                       key={i}
//                       className="w-full text-left px-4 py-2 hover:bg-blue-50"
//                       onClick={() => handleSelectSearchResult(r)}
//                     >
//                       {r.display_name}
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <MapContainer
//               center={initialPosition || DEFAULT_CENTER}
//               zoom={13}
//               scrollWheelZoom
//               style={{ height: "100%", width: "100%" }}
//             >
//               <TileLayer
//                 url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
//               />
//               <ClickHandler setPosition={setPosition} />
//               <MapUpdater center={mapCenter} />
//               {position && <Marker position={position} />}
//             </MapContainer>
//           </div>

//           {/* INFO */}
//           <div className="w-[30%] p-6 border-l bg-gray-50">
//             <p className="text-sm mb-2">
//               <b>Latitude:</b> {position?.[0]?.toFixed(6) || "—"}
//             </p>
//             <p className="text-sm mb-2">
//               <b>Longitude:</b> {position?.[1]?.toFixed(6) || "—"}
//             </p>
//             <p className="text-sm">
//               <b>Address:</b><br />
//               {loading ? "Loading..." : reverseInfo?.display_name || "—"}
//             </p>
//             <p className="text-sm mt-2">
//               <b>Pincode:</b> {reverseInfo?.postcode || "—"}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


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
const API_BASE = "http://localhost:5066/api/geocode";

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