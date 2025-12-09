// // // // // frontend/src/components/MapPicker.jsx
// // // // import { useEffect, useState } from "react";
// // // // import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
// // // // import L from "leaflet";
// // // // import "leaflet/dist/leaflet.css";

// // // // // fix default icon urls (Vite)
// // // // delete L.Icon.Default.prototype._getIconUrl;
// // // // L.Icon.Default.mergeOptions({
// // // //   iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
// // // //   iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
// // // //   shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
// // // // });

// // // // const DEFAULT_CENTER = [13.0827, 80.2707];

// // // // function ClickMarker({ position, setPosition }) {
// // // //   useMapEvents({
// // // //     click(e) {
// // // //       setPosition([e.latlng.lat, e.latlng.lng]);
// // // //     },
// // // //   });
// // // //   return position ? <Marker position={position} /> : null;
// // // // }

// // // // export default function MapPicker({ initialPosition = null, onSelect, onCancel, title = "Pick location" }) {
// // // //   const [position, setPosition] = useState(initialPosition);
// // // //   const [loadingReverse, setLoadingReverse] = useState(false);
// // // //   const [reverseResult, setReverseResult] = useState(null);

// // // //   useEffect(() => {
// // // //     if (!position) return;
// // // //     const reverse = async () => {
// // // //       setLoadingReverse(true);
// // // //       setReverseResult(null);
// // // //       try {
// // // //         const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${position[0]}&lon=${position[1]}&addressdetails=1`;
// // // //         const res = await fetch(url, { headers: { "User-Agent": "OntrackLogisticsApp/1.0" } });
// // // //         const data = await res.json();
// // // //         // data.display_name and postcode inside address
// // // //         setReverseResult({
// // // //           display_name: data.display_name,
// // // //           postcode: data.address?.postcode || data.address?.postcode || "",
// // // //         });
// // // //       } catch (err) {
// // // //         console.error("Reverse geocode failed:", err);
// // // //       } finally {
// // // //         setLoadingReverse(false);
// // // //       }
// // // //     };
// // // //     reverse();
// // // //   }, [position]);

// // // //   return (
// // // //     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
// // // //       <div className="bg-white rounded shadow-lg w-full max-w-4xl h-[70vh] overflow-hidden">
// // // //         <div className="flex items-center justify-between p-3 border-b">
// // // //           <h3 className="font-semibold">{title}</h3>
// // // //           <div className="flex items-center gap-2">
// // // //             <button className="px-3 py-1 rounded border" onClick={onCancel}>Cancel</button>
// // // //             <button
// // // //               className="px-3 py-1 rounded bg-blue-600 text-white"
// // // //               onClick={() => {
// // // //                 if (!position) {
// // // //                   alert("Tap/click the map to pick a location.");
// // // //                   return;
// // // //                 }
// // // //                 onSelect({
// // // //                   lat: position[0],
// // // //                   lng: position[1],
// // // //                   display_name: reverseResult?.display_name,
// // // //                   postcode: reverseResult?.postcode,
// // // //                 });
// // // //               }}
// // // //             >
// // // //               Select
// // // //             </button>
// // // //           </div>
// // // //         </div>

// // // //         <div className="h-full flex">
// // // //           <div className="w-2/3 h-full">
// // // //             <MapContainer center={initialPosition || DEFAULT_CENTER} zoom={13} style={{ height: "100%", width: "100%" }}>
// // // //               <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
// // // //               <ClickMarker position={position} setPosition={setPosition} />
// // // //             </MapContainer>
// // // //           </div>

// // // //           <div className="w-1/3 p-4 border-l">
// // // //             <p className="text-sm text-gray-600 mb-2">Instructions:</p>
// // // //             <ol className="list-decimal list-inside text-sm space-y-2">
// // // //               <li>Click/tap the map to drop a marker on location.</li>
// // // //               <li>Use zoom controls to refine pinpoint accuracy.</li>
// // // //               <li>Press <strong>Select</strong> to confirm — address and pincode will be auto-filled (if available).</li>
// // // //             </ol>

// // // //             <div className="mt-4">
// // // //               <p className="text-xs text-gray-500">Selected coords</p>
// // // //               <div className="mt-1">
// // // //                 Lat: {position ? position[0].toFixed(6) : "—"} <br />
// // // //                 Lng: {position ? position[1].toFixed(6) : "—"}
// // // //               </div>
// // // //             </div>

// // // //             <div className="mt-4">
// // // //               <p className="text-xs text-gray-500">Reverse geocode result</p>
// // // //               {loadingReverse ? (
// // // //                 <div className="text-sm">Looking up address...</div>
// // // //               ) : reverseResult ? (
// // // //                 <div className="text-sm">
// // // //                   <div className="font-medium">{reverseResult.display_name}</div>
// // // //                   <div className="text-xs text-gray-500 mt-1">Pincode: {reverseResult.postcode || "—"}</div>
// // // //                 </div>
// // // //               ) : (
// // // //                 <div className="text-sm text-gray-400">No address found yet.</div>
// // // //               )}
// // // //             </div>
// // // //           </div>
// // // //         </div>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }

// // // import { useState, useEffect } from "react";
// // // import {
// // //   MapContainer,
// // //   TileLayer,
// // //   Marker,
// // //   useMapEvents
// // // } from "react-leaflet";
// // // import L from "leaflet";
// // // import "leaflet/dist/leaflet.css";

// // // delete L.Icon.Default.prototype._getIconUrl;
// // // L.Icon.Default.mergeOptions({
// // //   iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
// // //   iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
// // //   shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png"
// // // });

// // // // Default center: Chennai
// // // const DEFAULT_CENTER = [13.0827, 80.2707];

// // // function ClickHandler({ setPosition }) {
// // //   useMapEvents({
// // //     click(e) {
// // //       setPosition([e.latlng.lat, e.latlng.lng]);
// // //     }
// // //   });
// // //   return null;
// // // }

// // // export default function MapPicker({
// // //   initialPosition,
// // //   onSelect,
// // //   onCancel,
// // //   title
// // // }) {
// // //   const [position, setPosition] = useState(initialPosition || null);
// // //   const [reverseInfo, setReverseInfo] = useState(null);
// // //   const [loading, setLoading] = useState(false);

// // //   // Reverse Geocode
// // //   useEffect(() => {
// // //     if (!position) return;

// // //     const fetchReverse = async () => {
// // //       setLoading(true);
// // //       try {
// // //         const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position[0]}&lon=${position[1]}&addressdetails=1`;
// // //         const res = await fetch(url, {
// // //           headers: { "User-Agent": "OntrackLogisticsApp/1.0" }
// // //         });
// // //         const json = await res.json();
// // //         setReverseInfo({
// // //           display_name: json.display_name,
// // //           postcode: json.address?.postcode || ""
// // //         });
// // //       } catch (err) {
// // //         console.error("Reverse Geocoding Error:", err);
// // //       } finally {
// // //         setLoading(false);
// // //       }
// // //     };

// // //     fetchReverse();
// // //   }, [position]);

// // //   return (
// // //     <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
// // //       <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] shadow-xl flex flex-col overflow-hidden">

// // //         {/* HEADER */}
// // //         <div className="flex justify-between items-center p-4 border-b bg-gray-50">
// // //           <h2 className="font-semibold text-lg">{title}</h2>
// // //           <div className="flex gap-2">
// // //             <button 
// // //               type="button"
// // //               className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition" 
// // //               onClick={onCancel}
// // //             >
// // //               Cancel
// // //             </button>
// // //             <button
// // //               type="button"
// // //               className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
// // //               disabled={!position}
// // //               onClick={() => {
// // //                 if (!position) {
// // //                   alert("Click on map to choose a location.");
// // //                   return;
// // //                 }
// // //                 onSelect({
// // //                   lat: position[0],
// // //                   lng: position[1],
// // //                   address: reverseInfo?.display_name || "",
// // //                   pincode: reverseInfo?.postcode || ""
// // //                 });
// // //               }}
// // //             >
// // //               Select Location
// // //             </button>
// // //           </div>
// // //         </div>

// // //         {/* BODY */}
// // //         <div className="flex flex-1 overflow-hidden">

// // //           {/* MAP AREA - 70% */}
// // //           <div className="w-[70%] h-full relative">
// // //             <MapContainer
// // //               center={initialPosition || DEFAULT_CENTER}
// // //               zoom={13}
// // //               scrollWheelZoom={true}
// // //               style={{ width: "100%", height: "100%" }}
// // //             >
// // //               {/* MapTiler Streets Tiles */}
// // //               <TileLayer
// // //                 url="https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=Ky6EwGzLKiuw4Mc8Kzub"
// // //                 attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
// // //                 maxZoom={19}
// // //               />

// // //               <ClickHandler setPosition={setPosition} />

// // //               {position && <Marker position={position} />}
// // //             </MapContainer>
// // //           </div>

// // //           {/* INFO PANEL - 30% */}
// // //           <div className="w-[30%] border-l bg-gray-50 p-6 overflow-y-auto">
// // //             <h3 className="font-semibold text-lg mb-4 text-gray-800">How to Use</h3>
// // //             <ul className="list-disc text-sm pl-5 space-y-2 text-gray-700 mb-6">
// // //               <li>Click anywhere on the map</li>
// // //               <li>A marker will appear at that location</li>
// // //               <li>Address & pincode will auto-fill</li>
// // //               <li>Click "Select Location" to confirm</li>
// // //             </ul>

// // //             <div className="space-y-4">
// // //               <div className="bg-white p-3 rounded border">
// // //                 <p className="text-xs text-gray-500 mb-1">Latitude</p>
// // //                 <p className="text-sm font-mono">{position?.[0]?.toFixed(6) ?? "—"}</p>
// // //               </div>

// // //               <div className="bg-white p-3 rounded border">
// // //                 <p className="text-xs text-gray-500 mb-1">Longitude</p>
// // //                 <p className="text-sm font-mono">{position?.[1]?.toFixed(6) ?? "—"}</p>
// // //               </div>

// // //               <div className="bg-white p-3 rounded border">
// // //                 <p className="text-xs text-gray-500 mb-1">Detected Address</p>
// // //                 {loading ? (
// // //                   <p className="text-sm text-gray-400 italic">Loading...</p>
// // //                 ) : (
// // //                   <p className="text-sm">{reverseInfo?.display_name || "—"}</p>
// // //                 )}
// // //               </div>

// // //               <div className="bg-white p-3 rounded border">
// // //                 <p className="text-xs text-gray-500 mb-1">Pincode</p>
// // //                 {loading ? (
// // //                   <p className="text-sm text-gray-400 italic">Loading...</p>
// // //                 ) : (
// // //                   <p className="text-sm font-semibold">{reverseInfo?.postcode || "Not available"}</p>
// // //                 )}
// // //               </div>
// // //             </div>

// // //             {!position && (
// // //               <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded">
// // //                 <p className="text-sm text-blue-700">👆 Click on the map to select a location</p>
// // //               </div>
// // //             )}
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }
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
// //       const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
// //       const res = await fetch(url, {
// //         headers: { "User-Agent": "OntrackLogisticsApp/1.0" }
// //       });
// //       const json = await res.json();
// //       setSearchResults(json);
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
// //                             <div className="text-sm font-medium text-gray-900">{result.display_name}</div>
// //                             {result.address?.postcode && (
// //                               <div className="text-xs text-gray-500 mt-1">Pincode: {result.address.postcode}</div>
// //                             )}
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
// //               {/* MapTiler Streets Tiles */}
// //               <TileLayer
// //                 url="https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=Ky6EwGzLKiuw4Mc8Kzub"
// //                 attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
// //                 maxZoom={19}
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
// //               <li>Search for an address in the search bar</li>
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
//     if (center) {
//       map.setView(center, 15);
//     }
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

//   // Reverse Geocode
//   useEffect(() => {
//     if (!position) return;

//     const fetchReverse = async () => {
//       setLoading(true);
//       try {
//         const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position[0]}&lon=${position[1]}&addressdetails=1`;
//         const res = await fetch(url, {
//           headers: { "User-Agent": "OntrackLogisticsApp/1.0" }
//         });
//         const json = await res.json();
//         setReverseInfo({
//           display_name: json.display_name,
//           postcode: json.address?.postcode || ""
//         });
//       } catch (err) {
//         console.error("Reverse Geocoding Error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchReverse();
//   }, [position]);

//   // Search addresses
//   const handleSearchInput = (e) => {
//     const value = e.target.value;
//     setSearchQuery(value);

//     // Clear previous timeout
//     if (searchTimeoutRef.current) {
//       clearTimeout(searchTimeoutRef.current);
//     }

//     // Don't search if query is too short
//     if (value.length < 3) {
//       setSearchResults([]);
//       setShowResults(false);
//       return;
//     }

//     // Debounce search
//     searchTimeoutRef.current = setTimeout(() => {
//       performSearch(value);
//     }, 500);
//   };

//   const performSearch = async (query) => {
//     setSearching(true);
//     setShowResults(true);
//     try {
//       const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
//       const res = await fetch(url, {
//         headers: { "User-Agent": "OntrackLogisticsApp/1.0" }
//       });
//       const json = await res.json();
//       setSearchResults(json);
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

//   // Cleanup timeout on unmount
//   useEffect(() => {
//     return () => {
//       if (searchTimeoutRef.current) {
//         clearTimeout(searchTimeoutRef.current);
//       }
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
//               className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition" 
//               onClick={onCancel}
//             >
//               Cancel
//             </button>
//             <button
//               type="button"
//               className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
//               disabled={!position}
//               onClick={() => {
//                 if (!position) {
//                   alert("Click on map to choose a location.");
//                   return;
//                 }
//                 onSelect({
//                   lat: position[0],
//                   lng: position[1],
//                   address: reverseInfo?.display_name || "",
//                   pincode: reverseInfo?.postcode || ""
//                 });
//               }}
//             >
//               Select Location
//             </button>
//           </div>
//         </div>

//         {/* BODY */}
//         <div className="flex flex-1 overflow-hidden">

//           {/* MAP AREA - 70% */}
//           <div className="w-[70%] h-full relative">
//             {/* SEARCH BAR */}
//             <div className="absolute top-4 left-4 right-4 z-[1000]">
//               <div className="relative">
//                 <input
//                   type="text"
//                   value={searchQuery}
//                   onChange={handleSearchInput}
//                   onFocus={() => searchResults.length > 0 && setShowResults(true)}
//                   placeholder="Search for an address, landmark, or place..."
//                   className="w-full px-4 py-3 pr-10 border-2 border-gray-300 rounded-lg shadow-lg focus:outline-none focus:border-blue-500 bg-white"
//                 />
//                 {searching && (
//                   <div className="absolute right-3 top-3.5">
//                     <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
//                   </div>
//                 )}
//                 {searchQuery && !searching && (
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setSearchQuery("");
//                       setSearchResults([]);
//                       setShowResults(false);
//                     }}
//                     className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
//                   >
//                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                     </svg>
//                   </button>
//                 )}

//                 {/* SEARCH RESULTS DROPDOWN */}
//                 {showResults && searchResults.length > 0 && (
//                   <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-80 overflow-y-auto z-[1001]">
//                     {searchResults.map((result, idx) => (
//                       <button
//                         key={idx}
//                         type="button"
//                         onClick={() => handleSelectSearchResult(result)}
//                         className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition"
//                       >
//                         <div className="flex items-start gap-3">
//                           <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
//                           </svg>
//                           <div className="flex-1">
//                             <div className="text-sm font-medium text-gray-900">{result.display_name}</div>
//                             {result.address?.postcode && (
//                               <div className="text-xs text-gray-500 mt-1">Pincode: {result.address.postcode}</div>
//                             )}
//                           </div>
//                         </div>
//                       </button>
//                     ))}
//                   </div>
//                 )}

//                 {showResults && searchResults.length === 0 && !searching && searchQuery.length >= 3 && (
//                   <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-[1001]">
//                     <p className="text-sm text-gray-500 text-center">No results found. Try a different search term.</p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             <MapContainer
//               center={initialPosition || DEFAULT_CENTER}
//               zoom={13}
//               scrollWheelZoom={true}
//               style={{ width: "100%", height: "100%" }}
//             >
//               {/* OpenStreetMap Standard Tiles - Fast & Free */}
//               <TileLayer
//                 url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                 attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//                 maxZoom={19}
//               />

//               <ClickHandler setPosition={setPosition} />
//               <MapUpdater center={mapCenter} />

//               {position && <Marker position={position} />}
//             </MapContainer>
//           </div>

//           {/* INFO PANEL - 30% */}
//           <div className="w-[30%] border-l bg-gray-50 p-6 overflow-y-auto">
//             <h3 className="font-semibold text-lg mb-4 text-gray-800">How to Use</h3>
//             <ul className="list-disc text-sm pl-5 space-y-2 text-gray-700 mb-6">
//               <li>Search for an address in the search bar</li>
//               <li>Or click anywhere on the map</li>
//               <li>A marker will appear at that location</li>
//               <li>Address & pincode will auto-fill</li>
//               <li>Click "Select Location" to confirm</li>
//             </ul>

//             <div className="space-y-4">
//               <div className="bg-white p-3 rounded border">
//                 <p className="text-xs text-gray-500 mb-1">Latitude</p>
//                 <p className="text-sm font-mono">{position?.[0]?.toFixed(6) ?? "—"}</p>
//               </div>

//               <div className="bg-white p-3 rounded border">
//                 <p className="text-xs text-gray-500 mb-1">Longitude</p>
//                 <p className="text-sm font-mono">{position?.[1]?.toFixed(6) ?? "—"}</p>
//               </div>

//               <div className="bg-white p-3 rounded border">
//                 <p className="text-xs text-gray-500 mb-1">Detected Address</p>
//                 {loading ? (
//                   <p className="text-sm text-gray-400 italic">Loading...</p>
//                 ) : (
//                   <p className="text-sm">{reverseInfo?.display_name || "—"}</p>
//                 )}
//               </div>

//               <div className="bg-white p-3 rounded border">
//                 <p className="text-xs text-gray-500 mb-1">Pincode</p>
//                 {loading ? (
//                   <p className="text-sm text-gray-400 italic">Loading...</p>
//                 ) : (
//                   <p className="text-sm font-semibold">{reverseInfo?.postcode || "Not available"}</p>
//                 )}
//               </div>
//             </div>

//             {!position && (
//               <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded">
//                 <p className="text-sm text-blue-700">👆 Click on the map to select a location</p>
//               </div>
//             )}
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

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png"
});

// Default center: Chennai
const DEFAULT_CENTER = [13.0827, 80.2707];

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
    if (center) {
      map.setView(center, 15);
    }
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

  // Reverse Geocode
  useEffect(() => {
    if (!position) return;

    const fetchReverse = async () => {
      setLoading(true);
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position[0]}&lon=${position[1]}&addressdetails=1`;
        const res = await fetch(url, {
          headers: { "User-Agent": "OntrackLogisticsApp/1.0" }
        });
        const json = await res.json();
        setReverseInfo({
          display_name: json.display_name,
          postcode: json.address?.postcode || ""
        });
      } catch (err) {
        console.error("Reverse Geocoding Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReverse();
  }, [position]);

  // Search addresses
  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Don't search if query is too short
    if (value.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 500);
  };

  const performSearch = async (query) => {
    setSearching(true);
    setShowResults(true);
    try {
      // Enhanced search with country bias and language preference
      const url = `https://nominatim.openstreetmap.org/search?` +
        `format=json` +
        `&q=${encodeURIComponent(query)}` +
        `&limit=8` +
        `&addressdetails=1` +
        `&countrycodes=in` + // Limit to India for better accuracy
        `&accept-language=en` + // Prefer English results
        `&bounded=0` +
        `&dedupe=1`; // Remove duplicate results
      
      const res = await fetch(url, {
        headers: { "User-Agent": "OntrackLogisticsApp/1.0" }
      });
      const json = await res.json();
      
      // Sort results by importance (type priority)
      const sortedResults = json.sort((a, b) => {
        const priority = {
          'house': 1,
          'residential': 2,
          'building': 3,
          'shop': 4,
          'amenity': 5,
          'road': 6,
          'suburb': 7,
          'city': 8
        };
        const aPriority = priority[a.type] || 10;
        const bPriority = priority[b.type] || 10;
        return aPriority - bPriority;
      });
      
      setSearchResults(sortedResults);
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] shadow-xl flex flex-col overflow-hidden">

        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h2 className="font-semibold text-lg">{title}</h2>
          <div className="flex gap-2">
            <button 
              type="button"
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition" 
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
              disabled={!position}
              onClick={() => {
                if (!position) {
                  alert("Click on map to choose a location.");
                  return;
                }
                onSelect({
                  lat: position[0],
                  lng: position[1],
                  address: reverseInfo?.display_name || "",
                  pincode: reverseInfo?.postcode || ""
                });
              }}
            >
              Select Location
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="flex flex-1 overflow-hidden">

          {/* MAP AREA - 70% */}
          <div className="w-[70%] h-full relative">
            {/* SEARCH BAR */}
            <div className="absolute top-4 left-4 right-4 z-[1000]">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInput}
                  onFocus={() => searchResults.length > 0 && setShowResults(true)}
                  placeholder="Search for an address, landmark, or place..."
                  className="w-full px-4 py-3 pr-10 border-2 border-gray-300 rounded-lg shadow-lg focus:outline-none focus:border-blue-500 bg-white"
                />
                {searching && (
                  <div className="absolute right-3 top-3.5">
                    <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                )}
                {searchQuery && !searching && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResults([]);
                      setShowResults(false);
                    }}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}

                {/* SEARCH RESULTS DROPDOWN */}
                {showResults && searchResults.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-80 overflow-y-auto z-[1001]">
                    {searchResults.map((result, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectSearchResult(result)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition"
                      >
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {result.display_name}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              {result.address?.postcode && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                  PIN: {result.address.postcode}
                                </span>
                              )}
                              {result.type && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded capitalize">
                                  {result.type}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {showResults && searchResults.length === 0 && !searching && searchQuery.length >= 3 && (
                  <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-[1001]">
                    <p className="text-sm text-gray-500 text-center">No results found. Try a different search term.</p>
                  </div>
                )}
              </div>
            </div>

            <MapContainer
              center={initialPosition || DEFAULT_CENTER}
              zoom={13}
              scrollWheelZoom={true}
              style={{ width: "100%", height: "100%" }}
            >
              {/* CartoDB Voyager - Fast, reliable, works in India */}
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                subdomains="abcd"
                maxZoom={20}
              />

              <ClickHandler setPosition={setPosition} />
              <MapUpdater center={mapCenter} />

              {position && <Marker position={position} />}
            </MapContainer>
          </div>

          {/* INFO PANEL - 30% */}
          <div className="w-[30%] border-l bg-gray-50 p-6 overflow-y-auto">
            <h3 className="font-semibold text-lg mb-4 text-gray-800">How to Use</h3>
            <ul className="list-disc text-sm pl-5 space-y-2 text-gray-700 mb-6">
              <li>Search using street name, area, or landmark</li>
              <li>Be specific: "Anna Nagar, Chennai" works better than just "Chennai"</li>
              <li>Or click anywhere on the map</li>
              <li>A marker will appear at that location</li>
              <li>Address & pincode will auto-fill</li>
              <li>Click "Select Location" to confirm</li>
            </ul>

            <div className="space-y-4">
              <div className="bg-white p-3 rounded border">
                <p className="text-xs text-gray-500 mb-1">Latitude</p>
                <p className="text-sm font-mono">{position?.[0]?.toFixed(6) ?? "—"}</p>
              </div>

              <div className="bg-white p-3 rounded border">
                <p className="text-xs text-gray-500 mb-1">Longitude</p>
                <p className="text-sm font-mono">{position?.[1]?.toFixed(6) ?? "—"}</p>
              </div>

              <div className="bg-white p-3 rounded border">
                <p className="text-xs text-gray-500 mb-1">Detected Address</p>
                {loading ? (
                  <p className="text-sm text-gray-400 italic">Loading...</p>
                ) : (
                  <p className="text-sm">{reverseInfo?.display_name || "—"}</p>
                )}
              </div>

              <div className="bg-white p-3 rounded border">
                <p className="text-xs text-gray-500 mb-1">Pincode</p>
                {loading ? (
                  <p className="text-sm text-gray-400 italic">Loading...</p>
                ) : (
                  <p className="text-sm font-semibold">{reverseInfo?.postcode || "Not available"}</p>
                )}
              </div>
            </div>

            {!position && (
              <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-700">👆 Click on the map to select a location</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}