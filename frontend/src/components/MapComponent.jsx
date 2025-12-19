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
const coloredIcon = (color) =>
  L.divIcon({
    html: `
      <div style="
        background:${color};
        width:14px;
        height:14px;
        border-radius:50%;
        border:2px solid white;
        box-shadow:0 0 6px rgba(0,0,0,0.6);
      "></div>
    `,
    className: "",
    iconSize: [14, 14],
    iconAnchor: [7, 7],
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
          icon={m.color ? coloredIcon(m.color) : DefaultIcon}
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
