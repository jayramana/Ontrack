import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function MapComponent({ center, zoom, markers, polyline }) {
    return (
        <MapContainer center={center} zoom={zoom} style={{ height: '400px', width: '100%' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {markers && markers.map((marker, index) => (
                <Marker key={index} position={marker.position}>
                    <Popup>{marker.popup}</Popup>
                </Marker>
            ))}
            {polyline && <Polyline positions={polyline} color="blue" />}
        </MapContainer>
    );
}

export default MapComponent;
