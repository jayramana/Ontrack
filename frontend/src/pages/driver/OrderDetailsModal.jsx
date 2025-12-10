// import { useEffect, useState } from "react";
// import api from "../../services/api";

// const OrderDetailsModal = ({ orderId, onClose }) => {
//     const [order, setOrder] = useState(null);

//     useEffect(() => {
//         const load = async () => {
//             const res = await api.get(`/driver/order/${orderId}`);

//             setOrder(res.data);
//         };
//         load();
//     }, [orderId]);

//     if (!order) return null;

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
//             <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
//                 <h2 className="text-xl font-bold mb-4">Order Details</h2>

//                 <p><strong>Tracking ID:</strong> {order.trackingId}</p>

//                 <h3 className="font-semibold mt-4">Customer Info</h3>
//                 <p><strong>Name:</strong> {order.customerName}</p>
//                 <p><strong>Email:</strong> {order.customerEmail}</p>
//                 <p><strong>Phone:</strong> {order.customerPhone}</p>
//                 <p><strong>Address:</strong> {order.customerAddress}</p>

//                 <h3 className="font-semibold mt-4">Pickup Info</h3>
//                 <p>{order.pickupAddress}</p>

//                 {order.rescheduledAt && (
//                     <div className="bg-yellow-100 text-yellow-800 p-2 rounded mt-4">
//                         <p><strong>Rescheduled:</strong> {new Date(order.rescheduledAt).toLocaleString()}</p>
//                         {order.rescheduleReason && (
//                             <p><strong>Reason:</strong> {order.rescheduleReason}</p>
//                         )}
//                     </div>
//                 )}


//                 <button 
//                     className="mt-4 px-4 py-2 bg-blue-600 text-white rounded w-full"
//                     onClick={onClose}
//                 >
//                     Close
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default OrderDetailsModal;

import { useEffect, useState } from "react";
import api from "../../services/api";

const OrderDetailsModal = ({ orderId, onClose }) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrderDetails = async () => {
            try {
                const res = await api.get(`/driver/order/${orderId}`);
                setOrder(res.data);
            } catch (error) {
                console.error("Error loading order:", error);
            } finally {
                setLoading(false);
            }
        };
        loadOrderDetails();
    }, [orderId]);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (!order) return null;

    // 🆕 GET PRIORITY BADGE COLOR
    const getPriorityBadgeColor = (aiPriority) => {
        if (!aiPriority) return "bg-gray-100 text-gray-700";
        if (aiPriority === 5) return "bg-red-500 text-white";
        if (aiPriority === 4) return "bg-orange-500 text-white";
        if (aiPriority === 3) return "bg-yellow-500 text-white";
        if (aiPriority === 2) return "bg-blue-500 text-white";
        return "bg-green-500 text-white";
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-lg my-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Order Details</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Order Header */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-600">Tracking ID</p>
                                <p className="text-xl font-bold text-blue-600">{order.trackingId}</p>
                            </div>
                            <div className="text-right">
                                <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm">
                                    {order.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 🆕 AI PRIORITY SECTION */}
                    {order.aiPriority && (
                        <div className={`p-4 rounded-lg ${
                            order.aiPriority >= 4 ? 'bg-red-50 border-l-4 border-red-500' : 
                            order.aiPriority === 3 ? 'bg-yellow-50 border-l-4 border-yellow-500' :
                            'bg-green-50 border-l-4 border-green-500'
                        }`}>
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`px-3 py-1 rounded-full font-bold ${getPriorityBadgeColor(order.aiPriority)}`}>
                                    AI Priority: {order.aiPriority}/5
                                </div>
                            </div>
                            {order.aiPriorityJustification && (
                                <p className="text-sm text-gray-700 mt-2">
                                    <strong>Reason:</strong> {order.aiPriorityJustification}
                                </p>
                            )}
                        </div>
                    )}

                    {/* 🆕 RESCHEDULE INFO */}
                    {order.rescheduledAt && (
                        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded">
                            <h3 className="font-semibold text-yellow-800 mb-2">⏳ Rescheduled Order</h3>
                            <p className="text-sm text-yellow-700">
                                <strong>New Delivery Date:</strong> {new Date(order.rescheduledAt).toLocaleString()}
                            </p>
                            {order.rescheduleReason && (
                                <p className="text-sm text-yellow-700 mt-1">
                                    <strong>Reason:</strong> {order.rescheduleReason}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Customer Info */}
                    <div className="border rounded-lg p-4">
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <span className="text-xl mr-2">👤</span> Customer Information
                        </h3>
                        <div className="space-y-2">
                            <p><strong>Name:</strong> {order.customerName}</p>
                            <p><strong>Email:</strong> {order.customerEmail || 'N/A'}</p>
                            <p><strong>Phone:</strong> {order.customerPhone || 'N/A'}</p>
                        </div>
                    </div>

                    {/* Sender Info */}
                    {order.senderName && (
                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                                <span className="text-xl mr-2">📤</span> Sender Information
                            </h3>
                            <div className="space-y-2">
                                <p><strong>Name:</strong> {order.senderName}</p>
                                {order.senderEmail && <p><strong>Email:</strong> {order.senderEmail}</p>}
                                {order.senderPhone && <p><strong>Phone:</strong> {order.senderPhone}</p>}
                            </div>
                        </div>
                    )}

                    {/* Pickup Info */}
                    <div className="border rounded-lg p-4">
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <span className="text-xl mr-2">📍</span> Pickup Location
                        </h3>
                        <p className="text-gray-700">{order.pickupAddress}</p>
                        {order.pickupLatitude && order.pickupLongitude && (
                            <p className="text-sm text-gray-500 mt-1">
                                Coordinates: {order.pickupLatitude.toFixed(6)}, {order.pickupLongitude.toFixed(6)}
                            </p>
                        )}
                    </div>

                    {/* Delivery Info */}
                    <div className="border rounded-lg p-4">
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <span className="text-xl mr-2">🎯</span> Delivery Location
                        </h3>
                        <p className="text-gray-700">{order.receiverAddress}</p>
                        {order.deliveryLatitude && order.deliveryLongitude && (
                            <p className="text-sm text-gray-500 mt-1">
                                Coordinates: {order.deliveryLatitude.toFixed(6)}, {order.deliveryLongitude.toFixed(6)}
                            </p>
                        )}
                    </div>

                    {/* Warehouse Info */}
                    {(order.originWarehouse || order.destinationWarehouse) && (
                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                                <span className="text-xl mr-2">🏭</span> Warehouse Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {order.originWarehouse && (
                                    <div>
                                        <p className="text-sm text-gray-600">Origin</p>
                                        <p className="font-semibold">{order.originWarehouse.name}</p>
                                        <p className="text-sm">{order.originWarehouse.city}</p>
                                    </div>
                                )}
                                {order.destinationWarehouse && (
                                    <div>
                                        <p className="text-sm text-gray-600">Destination</p>
                                        <p className="font-semibold">{order.destinationWarehouse.name}</p>
                                        <p className="text-sm">{order.destinationWarehouse.city}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Delivery Timeline */}
                    {order.estimatedDeliveryDate && (
                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                                <span className="text-xl mr-2">⏰</span> Delivery Timeline
                            </h3>
                            <p className="text-gray-700">
                                <strong>Estimated Delivery:</strong> {new Date(order.estimatedDeliveryDate).toLocaleString()}
                            </p>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;