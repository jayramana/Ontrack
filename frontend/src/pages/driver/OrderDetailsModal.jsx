import { useEffect, useState } from "react";
import api from "../../services/api";

const OrderDetailsModal = ({ orderId, onClose }) => {
    const [order, setOrder] = useState(null);

    useEffect(() => {
        const load = async () => {
            const res = await api.get(`/driver/order/${orderId}`);

            setOrder(res.data);
        };
        load();
    }, [orderId]);

    if (!order) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
                <h2 className="text-xl font-bold mb-4">Order Details</h2>

                <p><strong>Tracking ID:</strong> {order.trackingId}</p>

                <h3 className="font-semibold mt-4">Customer Info</h3>
                <p><strong>Name:</strong> {order.customerName}</p>
                <p><strong>Email:</strong> {order.customerEmail}</p>
                <p><strong>Phone:</strong> {order.customerPhone}</p>
                <p><strong>Address:</strong> {order.customerAddress}</p>

                <h3 className="font-semibold mt-4">Pickup Info</h3>
                <p>{order.pickupAddress}</p>

                {order.rescheduledAt && (
                    <div className="bg-yellow-100 text-yellow-800 p-2 rounded mt-4">
                        <p><strong>Rescheduled:</strong> {new Date(order.rescheduledAt).toLocaleString()}</p>
                        {order.rescheduleReason && (
                            <p><strong>Reason:</strong> {order.rescheduleReason}</p>
                        )}
                    </div>
                )}


                <button 
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded w-full"
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default OrderDetailsModal;
