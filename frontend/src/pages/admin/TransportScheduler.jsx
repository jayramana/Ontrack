import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import AdminSidebar from "./AdminSidebar";

const TransportScheduler = () => {
  const { logout } = useAuth();
  const [transports, setTransports] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleForm, setShowScheduleForm] = useState(false);

  const [scheduleData, setScheduleData] = useState({
    originWarehouseId: "",
    destinationWarehouseId: "",
    minOrderCount: 5,
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
      const res = await api.post("/transport/auto-schedule");
      alert(`Successfully scheduled ${res.data.scheduledCount} transports!`);
      fetchData();
    } catch (error) {
      alert(
        "Error auto-scheduling: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleManualSchedule = async (e) => {
    e.preventDefault();
    try {
      await api.post("/transport/schedule", scheduleData);
      alert("Transport scheduled successfully!");
      setShowScheduleForm(false);
      fetchData();
    } catch (error) {
      alert("Error scheduling: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDepart = async (id) => {
    try {
      await api.post(`/transport/${id}/depart`);
      fetchData();
    } catch (error) {
      alert("Error marking departed: " + error.message);
    }
  };

  const handleArrive = async (id) => {
    try {
      await api.post(`/transport/${id}/arrive`);
      alert("Transport arrived! Orders updated.");
      fetchData();
    } catch (error) {
      alert("Error marking arrived: " + error.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Scheduled: "bg-blue-100 text-blue-800",
      InTransit: "bg-yellow-100 text-yellow-800",
      Arrived: "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen flex bg-[#f8f4ef]">
      {/* Sidebar */}
      <AdminSidebar active="transports" />

      {/* Main content */}
      <div className="flex-1 px-8 py-6">
        {/* Header */}

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#351c15]">Transport Scheduler</h1>
            <p className="text-[#6b4f3a]">
                Schedule and manage transport routes between warehouses
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Action Buttons */}
          <div className="mb-8 flex gap-4">
            <button
              onClick={handleAutoSchedule}
              className="px-6 py-3 bg-[#ffb500] text-[#351c15] font-semibold rounded-lg hover:bg-[#e6a300] shadow"
            >
              🤖 Auto-Schedule All Routes
            </button>

            <button
              onClick={() => setShowScheduleForm(!showScheduleForm)}
              className="px-6 py-3 bg-[#351c15] text-white font-semibold rounded-lg hover:bg-[#2b140f] shadow"
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

          {/* Transport List */}
          <div className="bg-white border border-[#e6d8c9] shadow rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e6d8c9]">
              <h2 className="text-xl font-semibold text-[#351c15]">
                Scheduled Transports
              </h2>
            </div>

            {loading ? (
              <p className="p-6 text-[#6b4f3a]">Loading...</p>
            ) : transports.length === 0 ? (
              <p className="p-6 text-[#6b4f3a] text-center">
                No transports scheduled. Click **Auto-Schedule** to begin.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#e6d8c9]">
                  <thead className="bg-[#fff8e6] text-[#351c15]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold">Route</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold">Departure</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold">Arrival</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-[#e6d8c9]">
                    {transports.map((t) => (
                      <tr key={t.id} className="hover:bg-[#fdf7ed]">
                        <td className="px-6 py-4 font-medium text-[#351c15]">
                          #{t.id}
                        </td>

                        <td className="px-6 py-4 text-[#4e2a1f]">
                          {t.originWarehouse?.warehouseName} →{" "}
                          {t.destinationWarehouse?.warehouseName}
                        </td>

                        <td className="px-6 py-4 text-[#4e2a1f]">
                          {new Date(t.scheduledDepartureTime).toLocaleString()}
                        </td>

                        <td className="px-6 py-4 text-[#4e2a1f]">
                          {new Date(t.estimatedArrivalTime).toLocaleString()}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              t.status
                            )}`}
                          >
                            {t.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm font-medium">
                          {t.status === "Scheduled" && (
                            <button
                              onClick={() => handleDepart(t.id)}
                              className="text-blue-700 hover:text-blue-900 mr-3 font-semibold"
                            >
                              Depart
                            </button>
                          )}

                          {t.status === "InTransit" && (
                            <button
                              onClick={() => handleArrive(t.id)}
                              className="text-green-700 hover:text-green-900 font-semibold"
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
        </div>
      </div>
    </div>
  );
};

export default TransportScheduler;
