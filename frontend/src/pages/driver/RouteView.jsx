import { useState, useEffect } from 'react';
import api from '../../services/api';
import MapComponent from '../../components/MapComponent';

function RouteView() {
    const [stops, setStops] = useState([]);
    const [currentLocation, setCurrentLocation] = useState({ lat: 13.0827, lng: 80.2707 });

    useEffect(() => {
        fetchRoute();
    }, []);

    const fetchRoute = async () => {
        try {
            const response = await api.get('/driver/route');
            setStops(response.data);
        } catch (error) {
            console.error('Error fetching route:', error);
        }
    };

    const markers = stops.map(stop => ({
        position: [stop.latitude, stop.longitude],
        popup: `Stop #${stop.sequenceNumber} - ${stop.order ? stop.order.receiverAddress : 'Pickup'}`
    }));

    // Add current location marker
    markers.push({
        position: [currentLocation.lat, currentLocation.lng],
        popup: "My Location"
    });

    const polyline = stops.map(stop => [stop.latitude, stop.longitude]);
    // Prepend current location
    if (stops.length > 0) {
        polyline.unshift([currentLocation.lat, currentLocation.lng]);
    }

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">My Route</h2>
            <div className="mb-6">
                <MapComponent center={[currentLocation.lat, currentLocation.lng]} zoom={13} markers={markers} polyline={polyline} />
            </div>
            <div>
                <h3 className="text-xl font-semibold mb-2">Stops</h3>
                <ul className="space-y-2">
                    {stops.map(stop => (
                        <li key={stop.id} className="p-3 border rounded bg-white shadow-sm">
                            <span className="font-bold">#{stop.sequenceNumber}</span> - {stop.order ? stop.order.receiverAddress : 'Pickup'}
                            <br />
                            <span className="text-sm text-gray-500">ETA: {new Date(stop.estimatedArrival).toLocaleTimeString()}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default RouteView;
