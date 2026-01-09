import { useState, useEffect } from "react";
import api from "../../services/api";
import { formatStatus, formatDate, formatDateTime } from "@/lib/utils";
import { 
  Package, 
  MapPin, 
  Truck, 
  Factory, 
  Clock, 
  User, 
  Phone, 
  Mail,
  Navigation,
  Box,
  Scale,
  Calendar
} from "lucide-react";

const OrderDetailsModal = ({ orderId, onClose }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/admin/order/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrderDetails();
  }, [orderId]);

  if (!orderId) return null;

  const statusColor =
    order?.status === "Delivered"
      ? "bg-green-500/20 text-green-400"
      : order?.status === "In Transit"
      ? "bg-orange-500/20 text-orange-400"
      : order?.status === "Assigned"
      ? "bg-blue-500/20 text-blue-400"
      : "bg-gray-500/20 text-gray-300";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#141922] rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-white/10 custom-scrollbar">

        {/* HEADER */}
        <div className="sticky top-0 bg-[#0f141c] px-6 py-4 flex justify-between items-center border-b border-white/10 rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold text-white">Order Details</h2>
            {order && (
              <p className="text-sm text-gray-400 mt-1">
                Tracking ID: {order.trackingId}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
            </div>
          ) : error ? (
            <p className="text-center text-red-400">{error}</p>
          ) : order ? (
            <>
              {/* STATUS */}
              <div className="flex justify-between items-center">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusColor}`}>
                  {formatStatus(order.status)}
                </span>
                <span className="text-sm text-gray-400">Order #{order.id}</span>
              </div>

              {/* SENDER */}
              <Section title="Sender Details" icon={<User className="w-5 h-5 text-blue-400" />}>
                <Info label="Name" value={order.senderName} icon={<User className="w-4 h-4 text-slate-400" />} />
                <Info label="Email" value={order.senderEmail} icon={<Mail className="w-4 h-4 text-slate-400" />} />
                <Info label="Phone" value={order.senderPhone} icon={<Phone className="w-4 h-4 text-slate-400" />} />
              </Section>

              {/* RECEIVER */}
              <Section title="Receiver Details" icon={<User className="w-5 h-5 text-orange-400" />}>
                <Info label="Name" value={order.receiverName} icon={<User className="w-4 h-4 text-slate-400" />} />
                <Info label="Email" value={order.receiverEmail} icon={<Mail className="w-4 h-4 text-slate-400" />} />
                <Info label="Phone" value={order.receiverPhone} icon={<Phone className="w-4 h-4 text-slate-400" />} />
              </Section>

              {/* ADDRESSES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card title="Pickup Address" icon={<MapPin className="w-5 h-5 text-blue-400" />}>
                  <p className="text-gray-300">{order.pickupAddress}</p>
                </Card>
                <Card title="Delivery Address" icon={<Navigation className="w-5 h-5 text-green-400" />}>
                  <p className="text-gray-300">{order.deliveryAddress}</p>
                </Card>
              </div>

              {/* PARCEL */}
              <Section title="Parcel Details" icon={<Package className="w-5 h-5 text-purple-400" />}>
                <Info label="Size" value={order.parcelSize} icon={<Box className="w-4 h-4 text-slate-400" />} />
                <Info label="Weight" value={order.weight ? `${order.weight} kg` : "N/A"} icon={<Scale className="w-4 h-4 text-slate-400" />} />
              </Section>

              {/* DRIVER */}
              {order.driver && (
                <Section title="Assigned Driver" icon={<Truck className="w-5 h-5 text-orange-400" />}>
                  <Info
                    label="Name"
                    value={`${order.driver.userFName} ${order.driver.userLName}`}
                    icon={<User className="w-4 h-4 text-slate-400" />}
                  />
                  <Info label="Email" value={order.driver.userEmail} icon={<Mail className="w-4 h-4 text-slate-400" />} />
                  <Info
                    label="Status"
                    value={order.driver.isAvailable ? "Available" : "Busy"}
                    highlight={order.driver.isAvailable ? "green" : "red"}
                  />
                </Section>
              )}

              {/* WAREHOUSE */}
              <Section title="Warehouses" icon={<Factory className="w-5 h-5 text-yellow-400" />}>
                <Warehouse label="Origin" data={order.originWarehouse} />
                <Warehouse label="Current" data={order.currentWarehouse} />
                <Warehouse label="Destination" data={order.destinationWarehouse} />
              </Section>

              {/* TIMELINE */}
              <Section title="Timeline" icon={<Clock className="w-5 h-5 text-cyan-400" />}>
                <Timeline label="Created" date={order.createdAt} />
                <Timeline label="Estimated Delivery" date={order.estimatedDeliveryDate} />
                <Timeline label="Delivered" date={order.deliveredAt} success />
              </Section>
            </>
          ) : (
            <p className="text-gray-400 text-center">No order data available</p>
          )}
        </div>

        {/* FOOTER */}
        <div className="sticky bottom-0 bg-[#0f141c] px-6 py-4 border-t border-white/10 rounded-b-xl flex justify-end">
          <button
            onClick={onClose}
            className="bg-orange-500 hover:bg-orange-600 text-black px-6 py-2 rounded-lg font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* ===================== SMALL COMPONENTS ===================== */

const Section = ({ title, icon, children }) => (
  <div className="bg-[#0b0f14] p-4 rounded-lg border border-white/10">
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h3 className="text-lg font-semibold text-white">{title}</h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{children}</div>
  </div>
);

const Card = ({ title, icon, children }) => (
  <div className="bg-[#0b0f14] p-4 rounded-lg border border-white/10">
    <div className="flex items-center gap-2 mb-2">
       {icon}
       <h3 className="text-lg font-semibold text-white">{title}</h3>
    </div>
    {children}
  </div>
);

const Info = ({ label, value, highlight, icon }) => (
  <div>
   <div className="flex items-center gap-2 mb-1">
       {icon}
       <p className="text-sm text-gray-400">{label}</p>
    </div>
    <p
      className={`font-medium ${
        highlight === "green"
          ? "text-green-400"
          : highlight === "red"
          ? "text-red-400"
          : "text-white"
      }`}
    >
      {value || "N/A"}
    </p>
  </div>
);

const Warehouse = ({ label, data }) => (
  <div>
    <p className="text-sm text-gray-400">{label}</p>
    {data ? (
      <>
        <p className="font-medium text-white">{data.name}</p>
        <p className="text-sm text-gray-500">{data.city}</p>
      </>
    ) : (
      <p className="text-gray-500">Not assigned</p>
    )}
  </div>
);

const Timeline = ({ label, date, success }) =>
  date ? (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className={success ? "text-green-400" : "text-white"}>
        {formatDateTime(date)}
      </span>
    </div>
  ) : null;

export default OrderDetailsModal;
