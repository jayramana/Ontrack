import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const CapacityDashboard = () => {
    const { logout } = useAuth();
    const [capacities, setCapacities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCapacities();
        const interval = setInterval(fetchCapacities, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchCapacities = async () => {
        try {
            const res = await api.get('/warehouse/capacity/all');
            setCapacities(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching capacities:', error);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            Normal: 'bg-green-500',
            Warning: 'bg-yellow-500',
            Critical: 'bg-red-500'
        };
        return colors[status] || 'bg-gray-500';
    };

    const getStatusIcon = (status) => {
        const icons = {
            Normal: '✅',
            Warning: '⚠️',
            Critical: '🚨'
        };
        return icons[status] || '📦';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">📊 Warehouse Capacity Monitor</h1>
                    <button onClick={logout} className="px-4 py-2 bg-red-600 text-white rounded">Logout</button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        <p className="mt-4 text-gray-600">Loading capacity data...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {capacities.map((warehouse) => (
                            <div key={warehouse.warehouseId} className="bg-white rounded-lg shadow-lg overflow-hidden">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-semibold text-gray-900">{warehouse.warehouseName}</h3>
                                        <span className="text-3xl">{getStatusIcon(warehouse.status)}</span>
                                    </div>

                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                                            <span>Capacity Usage</span>
                                            <span className="font-bold">{warehouse.percentage.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-500 ${getStatusColor(warehouse.status)}`}
                                                style={{ width: `${Math.min(warehouse.percentage, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-blue-50 p-3 rounded">
                                            <p className="text-xs text-gray-600 mb-1">Current Capacity</p>
                                            <p className="text-lg font-bold text-blue-600">
                                                {warehouse.currentCapacity.toFixed(1)} m³
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded">
                                            <p className="text-xs text-gray-600 mb-1">Max Capacity</p>
                                            <p className="text-lg font-bold text-gray-700">
                                                {warehouse.maxCapacity.toFixed(1)} m³
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${warehouse.status === 'Critical' ? 'bg-red-100 text-red-800' :
                                                warehouse.status === 'Warning' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-green-100 text-green-800'
                                            }`}>
                                            {warehouse.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-8 bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">📈 System Overview</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-3xl font-bold text-green-600">
                                {capacities.filter(c => c.status === 'Normal').length}
                            </p>
                            <p className="text-sm text-gray-600">Normal</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-yellow-600">
                                {capacities.filter(c => c.status === 'Warning').length}
                            </p>
                            <p className="text-sm text-gray-600">Warning</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-red-600">
                                {capacities.filter(c => c.status === 'Critical').length}
                            </p>
                            <p className="text-sm text-gray-600">Critical</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CapacityDashboard;
