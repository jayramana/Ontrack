import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { formatStatus, formatDate, formatDateTime } from "@/lib/utils";

export default function OrderDetailsModal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/driver/order/${id}`);
        setOrder(res.data);
      } catch (err) {
        console.error("Failed to load order", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <p className="p-6 text-white">Loading...</p>;
  if (!order) return <p className="p-6 text-white">Order not found</p>;

  return (
    <div className="min-h-screen bg-[#0b0f14] text-white p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 border border-white/20 rounded-lg"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-4">
        Order #{order.id} ({order.trackingId})
      </h1>

      <div className="space-y-4 bg-white/5 p-6 rounded-xl border border-white/10">
        <p><strong>Status:</strong> {order.status}</p>

        {order.aiPriority && (
          <p>
            <strong>AI Priority:</strong> {order.aiPriority} <br />
            {order.aiPriorityJustification}
          </p>
        )}

        {order.rescheduledAt && (
          <p>
            <strong>Rescheduled:</strong>{" "}
            {formatDateTime(order.rescheduledAt)}
            <br />
            Reason: {order.rescheduleReason}
          </p>
        )}

        <p><strong>Receiver:</strong> {order.customerName}</p>
        <p><strong>Address:</strong> {order.receiverAddress}</p>

        <p><strong>Pickup:</strong> {order.pickupAddress}</p>

        {order.estimatedDeliveryDate && (
          <p>
            <strong>ETA:</strong>{" "}
            {formatDateTime(order.estimatedDeliveryDate)}
          </p>
        )}
      </div>
    </div>
  );
}
