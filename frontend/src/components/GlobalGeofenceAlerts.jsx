import React from 'react';
import { useGeofence } from '../context/GeofenceContext';

const GlobalGeofenceAlerts = () => {
    const { alerts, removeAlert } = useGeofence();

    if (alerts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
            {alerts.map(alert => (
                <div 
                    key={alert.id}
                    className={`p-4 rounded-lg shadow-lg border-l-4 flex justify-between items-start animate-slide-in ${
                        alert.type === 'success' 
                        ? 'bg-green-50 border-green-500 text-green-800' 
                        : alert.type === 'error'
                        ? 'bg-red-50 border-red-500 text-red-800'
                        : 'bg-blue-50 border-blue-500 text-blue-800'
                    }`}
                >
                    <div>
                        <div className="font-bold text-sm mb-1">Geofence Alert</div>
                        <p className="text-sm">{alert.message}</p>
                        <p className="text-xs opacity-75 mt-1">
                            {alert.time.toLocaleTimeString()}
                        </p>
                    </div>
                    <button 
                        onClick={() => removeAlert(alert.id)}
                        className="text-gray-400 hover:text-gray-600 ml-2"
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    );
};

export default GlobalGeofenceAlerts;
