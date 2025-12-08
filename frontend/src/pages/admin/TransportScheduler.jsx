import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const TransportScheduler = () => {
    const { logout } = useAuth();
    const [transports, setTransports] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showScheduleForm, setShowScheduleForm] = useState(false);
    const [scheduleData, setScheduleData] = useState({
        originWarehouseId: '',
        destinationWarehouseId: '',
        minOrderCount: 5
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [transportsRes, warehousesRes] = await Promise.all([
                api.get('/transport'),
                api.get('/warehouse')
            ]);
            setTransports(transportsRes.data);
            setWarehouses(warehousesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAutoSchedule = async () => {
        try {
            const res = await api.post('/transport/auto-schedule');
            alert(`Successfully scheduled ${res.data.scheduledCount} transports!`);
            fetchData();
        } catch (error) {
            alert('Error auto-scheduling: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleManualSchedule = async (e) => {
        e.preventDefault();
        try {
            await api.post('/transport/schedule', scheduleData);
            alert('Transport scheduled successfully!');
            setShowScheduleForm(false);
            fetchData();
        } catch (error) {
            alert('Error scheduling: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDepart = async (id) => {
        try {
            await api.post(`/transport/${id}/depart`);
            fetchData();
        } catch (error) {
            alert('Error marking departed: ' + error.message);
        }
    };

    const handleArrive = async (id) => {
        try {
            await api.post(`/transport/${id}/arrive`);
            alert('Transport arrived! Orders updated.');
            fetchData();
        } catch (error) {
            alert('Error marking arrived: ' + error.message);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            Scheduled: 'bg-blue-100 text-blue-800',
            InTransit: 'bg-yellow-100 text-yellow-800',
            Arrived: 'bg-green-100 text-green-800',
            Cancelled: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">🚚 Transport Scheduler</h1>
                    <button onClick={logout} className="px-4 py-2 bg-red-600 text-white rounded">Logout</button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-6 flex gap-4">
                    <button
                        onClick={handleAutoSchedule}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
                    >
                        🤖 Auto-Schedule All Routes
                    </button>
                    <button
                        onClick={() => setShowScheduleForm(!showScheduleForm)}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                    >
                        ➕ Manual Schedule
                    </button>
                </div>

                {showScheduleForm && (
                    <div className="bg-white p-6 rounded-lg shadow mb-6">
                        <h3 className="text-lg font-semibold mb-4">Schedule New Transport</h3>
                        <form onSubmit={handleManualSchedule} className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Origin Warehouse</label>
                                <select
                                    value={scheduleData.originWarehouseId}
                                    onChange={(e) => setScheduleData({ ...scheduleData, originWarehouseId: parseInt(e.target.value) })}
                                    className="w-full border rounded px-3 py-2"
                                    required
                                >
                                    <option value="">Select Origin</option>
                                    {warehouses.map(w => (
                                        <option key={w.id} value={w.id}>{w.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Destination Warehouse</label>
                                <select
                                    value={scheduleData.destinationWarehouseId}
                                    onChange={(e) => setScheduleData({ ...scheduleData, destinationWarehouseId: parseInt(e.target.value) })}
                                    className="w-full border rounded px-3 py-2"
                                    required
                                >
                                    <option value="">Select Destination</option>
                                    {warehouses.map(w => (
                                        <option key={w.id} value={w.id}>{w.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Min Order Count</label>
                                <input
                                    type="number"
                                    value={scheduleData.minOrderCount}
                                    onChange={(e) => setScheduleData({ ...scheduleData, minOrderCount: parseInt(e.target.value) })}
                                    className="w-full border rounded px-3 py-2"
                                    min="1"
                                />
                            </div>
                            <div className="col-span-3 flex gap-2">
                                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
                                    Schedule Transport
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowScheduleForm(false)}
                                    className="px-4 py-2 bg-gray-400 text-white rounded"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b">
                        <h2 className="text-xl font-semibold">Scheduled Transports</h2>
                    </div>
                    {loading ? (
                        <p className="p-6 text-gray-500">Loading...</p>
                    ) : transports.length === 0 ? (
                        <p className="p-6 text-gray-500 text-center">No transports scheduled. Click "Auto-Schedule" to begin.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Departure</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Arrival</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {transports.map((transport) => (
                                        <tr key={transport.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                #{transport.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {transport.originWarehouse?.name} → {transport.destinationWarehouse?.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(transport.scheduledDepartureTime).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(transport.estimatedArrivalTime).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transport.status)}`}>
                                                    {transport.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {transport.status === 'Scheduled' && (
                                                    <button
                                                        onClick={() => handleDepart(transport.id)}
                                                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                    >
                                                        Depart
                                                    </button>
                                                )}
                                                {transport.status === 'InTransit' && (
                                                    <button
                                                        onClick={() => handleArrive(transport.id)}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        Arrive
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default TransportScheduler;
