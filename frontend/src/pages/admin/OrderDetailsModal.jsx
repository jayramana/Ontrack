import { useState, useEffect } from 'react';
import api from '../../services/api';
import AdminSidebar from './AdminSidebar';

const OrderDetailsModal = ({ orderId, onClose }) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/admin/order/${orderId}`);
                setOrder(response.data);
            } catch (err) {
                console.error('Error fetching order details:', err);
                setError('Failed to load order details');
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);

    if (!orderId) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <AdminSidebar active="orders"/>
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center rounded-t-xl">
                    <div>
                        <h2 className="text-2xl font-bold">Order Details</h2>
                        {order && (
                            <p className="text-sm text-blue-100 mt-1">
                                Tracking ID: {order.trackingId}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-200 text-3xl leading-none"
                    >
                        &times;
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-red-600">{error}</p>
                            <button
                                onClick={onClose}
                                className="mt-4 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                                Close
                            </button>
                        </div>
                    ) : order ? (
                        <div className="space-y-6">
                            {/* Status Badge */}
                            <div className="flex items-center justify-between">
                                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                    order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                    order.status === 'Assigned' ? 'bg-blue-100 text-blue-800' :
                                    order.status === 'InTransit' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {order.status}
                                </span>
                                <span className="text-sm text-gray-500">Order #{order.id}</span>
                            </div>

                            {/* Sender Information */}
                            <div className="bg-blue-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                    <span className="text-2xl mr-2">📤</span>
                                    Sender Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-sm text-gray-600">Name</p>
                                        <p className="font-medium">{order.senderName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Email</p>
                                        <p className="font-medium">{order.senderEmail || 'N/A'}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-sm text-gray-600">Phone</p>
                                        <p className="font-medium">{order.senderPhone || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Receiver Information */}
                            <div className="bg-green-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                    <span className="text-2xl mr-2">📥</span>
                                    Receiver Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-sm text-gray-600">Name</p>
                                        <p className="font-medium">{order.receiverName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Email</p>
                                        <p className="font-medium">{order.receiverEmail || 'N/A'}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-sm text-gray-600">Phone</p>
                                        <p className="font-medium">{order.receiverPhone}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Addresses */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-purple-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                                        <span className="text-xl mr-2">📍</span>
                                        Pickup Address
                                    </h3>
                                    <p className="text-sm text-gray-700">{order.pickupAddress}</p>
                                    {order.pickupLatitude && order.pickupLongitude && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            Coordinates: {order.pickupLatitude.toFixed(4)}, {order.pickupLongitude.toFixed(4)}
                                        </p>
                                    )}
                                </div>

                                <div className="bg-orange-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                                        <span className="text-xl mr-2">🎯</span>
                                        Delivery Address
                                    </h3>
                                    <p className="text-sm text-gray-700">{order.deliveryAddress}</p>
                                    {order.deliveryLatitude && order.deliveryLongitude && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            Coordinates: {order.deliveryLatitude.toFixed(4)}, {order.deliveryLongitude.toFixed(4)}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Parcel Information */}
                            <div className="bg-yellow-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                    <span className="text-2xl mr-2">📦</span>
                                    Parcel Information
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-sm text-gray-600">Size</p>
                                        <p className="font-medium">{order.parcelSize || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Weight</p>
                                        <p className="font-medium">{order.weight ? `${order.weight} kg` : 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Driver Information */}
                            {order.driver && (
                                <div className="bg-indigo-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                        <span className="text-2xl mr-2">🚚</span>
                                        Assigned Driver
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                            <p className="text-sm text-gray-600">Name</p>
                                            <p className="font-medium">{order.driver.userFName + " " + order.driver.userLName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Email</p>
                                            <p className="font-medium">{order.driver.userEmail || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Status</p>
                                            <p className={`font-medium ${order.driver.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                                                {order.driver.isAvailable ? 'Available' : 'Busy'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Warehouse Information */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                    <span className="text-2xl mr-2">🏭</span>
                                    Warehouse Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600 font-semibold mb-1">Origin</p>
                                        {order.originWarehouse ? (
                                            <>
                                                <p className="font-medium">{order.originWarehouse.name}</p>
                                                <p className="text-sm text-gray-500">{order.originWarehouse.city}</p>
                                            </>
                                        ) : (
                                            <p className="text-gray-400">Not assigned</p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-semibold mb-1">Current</p>
                                        {order.currentWarehouse ? (
                                            <>
                                                <p className="font-medium">{order.currentWarehouse.name}</p>
                                                <p className="text-sm text-gray-500">{order.currentWarehouse.city}</p>
                                            </>
                                        ) : (
                                            <p className="text-gray-400">Not assigned</p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-semibold mb-1">Destination</p>
                                        {order.destinationWarehouse ? (
                                            <>
                                                <p className="font-medium">{order.destinationWarehouse.name}</p>
                                                <p className="text-sm text-gray-500">{order.destinationWarehouse.city}</p>
                                            </>
                                        ) : (
                                            <p className="text-gray-400">Not assigned</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="bg-teal-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                    <span className="text-2xl mr-2">⏱️</span>
                                    Timeline
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Created At</span>
                                        <span className="font-medium">
                                            {new Date(order.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    {order.estimatedDeliveryDate && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Estimated Delivery</span>
                                            <span className="font-medium">
                                                {new Date(order.estimatedDeliveryDate).toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                    {order.deliveredAt && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Delivered At</span>
                                            <span className="font-medium text-green-600">
                                                {new Date(order.deliveredAt).toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-center py-12 text-gray-500">No order data available</p>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end rounded-b-xl border-t">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;