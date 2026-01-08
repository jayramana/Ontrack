import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

/* ===========================
   DEFAULT MARKER FIX
=========================== */
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

/* ===========================
   COLORED DRIVER ICON
=========================== */
const coloredIcon = (color, label) =>
  L.divIcon({
    html: `
      <div style="position: relative; width: 30px; height: 50px;">
         <svg viewBox="0 0 30 50" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));">
            <!-- Needle -->
            <path d="M15 30 L15 50" stroke="${color}" stroke-width="3" stroke-linecap="round" />
            <!-- Circle Body -->
            <circle cx="15" cy="15" r="14" fill="${color}" stroke="white" stroke-width="2"/>
         </svg>
         <div style="
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 14px;
            font-family: sans-serif;
         ">
            ${label || ''}
         </div>
      </div>
    `,
    className: "",
    iconSize: [30, 50],
    iconAnchor: [15, 50],
    popupAnchor: [0, -50],
  });

/* ===========================
   MAP COMPONENT
=========================== */
function MapComponent({
  center,
  zoom,
  markers = [],
  polylines = [], // 🆕 MULTI ROUTES
}) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "400px", width: "100%" }}
    >
      {/* BASE MAP (FREE + CLEAR) */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {/* DRIVER MARKERS */}
      {markers.map((m, idx) => (
        <Marker
          key={idx}
          position={m.position}
          icon={m.color ? coloredIcon(m.color, m.label) : DefaultIcon}
        >
          {m.popup && <Popup>{m.popup}</Popup>}
        </Marker>
      ))}

      {/* DRIVER ROUTES */}
      {polylines.map((p, idx) => (
        <Polyline
          key={idx}
          positions={p.positions}
          pathOptions={{
            color: p.color || "#2563eb",
            weight: 4,
            opacity: 0.8,
          }}
        />
      ))}
    </MapContainer>
  );
}

export default MapComponent;
