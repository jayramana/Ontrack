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

const SellerOrderDetailsModal = ({ orderId, onClose }) => {
  const [order, setOrder] = useState(null);
  const [driverLoc, setDriverLoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        // Using the new endpoint specific for Sellers
        const res = await api.get(`/orders/sent-orders/${orderId}`);
        setOrder(res.data.order);
        setDriverLoc(res.data.latestDriverLocation);
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
        <div className="sticky top-0 bg-[#0f141c] px-6 py-4 flex justify-between items-center border-b border-white/10 rounded-t-xl z-10">
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
            className="text-gray-400 hover:text-white text-3xl leading-none font-bold"
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

              {/* RECEIVER */}
              <Section title="Receiver Details" icon={<User className="w-5 h-5 text-orange-400" />}>
                <Info label="Name" value={order.receiverName} />
                <Info label="Email" value={order.receiverEmail} />
                <Info label="Phone" value={order.receiverPhone} />
              </Section>

              {/* ADDRESSES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card title="Pickup Address" icon={<MapPin className="w-5 h-5 text-blue-400" />}>
                  <p className="text-gray-300">{order.pickupAddress}</p>
                </Card>
                <Card title="Delivery Address" icon={<Navigation className="w-5 h-5 text-green-400" />}>
                  <p className="text-gray-300">{order.receiverAddress}</p>
                </Card>
              </div>

              {/* PARCEL */}
              <Section title="Parcel Details" icon={<Package className="w-5 h-5 text-purple-400" />}>
                <Info label="Size" value={order.parcelSize} />
                <Info label="Weight" value={order.weight ? `${order.weight} kg` : "N/A"} />
                <Info label="Price" value={`₹${order.price}`} highlight="green" />
              </Section>

              {/* DRIVER */}
              {order.driver && (
                <Section title="Assigned Driver" icon={<Truck className="w-5 h-5 text-orange-400" />}>
                  <Info
                    label="Name"
                    value={`${order.driver.userFName} ${order.driver.userLName}`}
                  />
                  <Info label="Email" value={order.driver.userEmail} />
                  {driverLoc && (
                    <div className="col-span-1 md:col-span-3 mt-2 bg-white/5 p-3 rounded-lg border border-white/10 flex justify-between items-center">
                       <div>
                         <p className="text-xs text-gray-400">Last Known Location</p>
                         <p className="text-sm font-mono text-orange-200">
                           {driverLoc.latitude.toFixed(4)}, {driverLoc.longitude.toFixed(4)}
                         </p>
                       </div>
                       <p className="text-xs text-slate-500">
                         {new Date(driverLoc.updatedAt).toLocaleTimeString()}
                       </p>
                    </div>
                  )}
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
        <div className="sticky bottom-0 bg-[#0f141c] px-6 py-4 border-t border-white/10 rounded-b-xl flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg font-semibold transition"
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

const Info = ({ label, value, highlight }) => (
  <div>
    <p className="text-sm text-gray-400">{label}</p>
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

export default SellerOrderDetailsModal;
