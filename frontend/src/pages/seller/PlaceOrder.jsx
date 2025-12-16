import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import MapPicker from "../../components/MapPicker";

function PlaceOrder() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    senderName: "",
    senderPhone: "",
    senderEmail: "",
    pickupAddress: "",
    pickupPincode: "",
    pickupLatitude: null,
    pickupLongitude: null,

    receiverName: "",
    receiverPhone: "",
    receiverEmail: "",
    receiverAddress: "",
    receiverPincode: "",
    deliveryLatitude: null,
    deliveryLongitude: null,
    deliveryPincode: "",

    deliveryType: "Normal",
    parcelSize: "Small",
    weight: "",
    deliveryNotes: "",
    scheduledDate: "",
    scheduledTimeSlot: "",
    price: 0,
    isASR: false,
  });

  const [showPickupPicker, setShowPickupPicker] = useState(false);
  const [showDeliveryPicker, setShowDeliveryPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* =========================
     HANDLERS
  ========================= */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((s) => ({
      ...s,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleMapPick = (type, { lat, lng, address, pincode }) => {
    if (type === "pickup") {
      setFormData((s) => ({
        ...s,
        pickupLatitude: lat,
        pickupLongitude: lng,
        pickupAddress: address || s.pickupAddress,
        pickupPincode: pincode || s.pickupPincode,
      }));
      setShowPickupPicker(false);
    } else {
      setFormData((s) => ({
        ...s,
        deliveryLatitude: lat,
        deliveryLongitude: lng,
        receiverAddress: address || s.receiverAddress,
        receiverPincode: pincode || s.receiverPincode,
        deliveryPincode: pincode || s.deliveryPincode,
      }));
      setShowDeliveryPicker(false);
    }
  };

  const calculatePrice = () => {
    const weight = parseFloat(formData.weight || 0);
    const weightPrice = weight * 10;

    const sizePrice =
      formData.parcelSize === "Large"
        ? 50
        : formData.parcelSize === "Medium"
        ? 30
        : 10;

    const asrPrice = formData.isASR ? 100 : 0;

    setFormData((s) => ({
      ...s,
      price: weightPrice + sizePrice + asrPrice,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        senderName: formData.senderName,
        senderPhone: formData.senderPhone,
        senderEmail: formData.senderEmail,

        pickupAddress: formData.pickupAddress,
        pickupPincode: formData.pickupPincode,
        pickupLatitude: formData.pickupLatitude,
        pickupLongitude: formData.pickupLongitude,

        receiverName: formData.receiverName,
        receiverPhone: formData.receiverPhone,
        receiverEmail: formData.receiverEmail,
        receiverAddress: formData.receiverAddress,
        receiverPincode: formData.receiverPincode,

        deliveryLatitude: formData.deliveryLatitude,
        deliveryLongitude: formData.deliveryLongitude,
        deliveryPincode: formData.deliveryPincode,

        deliveryType: formData.deliveryType,
        parcelSize: formData.parcelSize,
        weight: parseFloat(formData.weight || 0),
        deliveryNotes: formData.deliveryNotes,

        scheduledDate: formData.scheduledDate || null,
        scheduledTimeSlot: formData.scheduledTimeSlot || null,
        price: formData.price,

        isASR: formData.isASR,
      };

      await api.post("/orders", payload);
      alert("Order placed successfully!");
      navigate("/seller/dashboard");
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.innerException ||
        error.message ||
        "Failed to place order.";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-[#351c15]">
        Place New Order
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-8 rounded-xl shadow-md border border-[#e6d8c9]"
      >
        {/* Sender */}
        <div className="border-b pb-4">
          <h3 className="text-xl font-semibold mb-4">Sender Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="senderName"
              value={formData.senderName}
              onChange={handleChange}
              required
              placeholder="Sender Name"
              className="p-2 border rounded"
            />
            <input
              name="senderPhone"
              value={formData.senderPhone}
              onChange={handleChange}
              required
              placeholder="Sender Phone"
              className="p-2 border rounded"
            />
            <input
              name="senderEmail"
              value={formData.senderEmail}
              onChange={handleChange}
              placeholder="Sender Email"
              className="p-2 border rounded"
            />
          </div>
        </div>

        {/* Receiver */}
        <div className="border-b pb-4">
          <h3 className="text-xl font-semibold mb-4">Receiver Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="receiverName"
              value={formData.receiverName}
              onChange={handleChange}
              required
              placeholder="Receiver Name"
              className="p-2 border rounded"
            />
            <input
              name="receiverPhone"
              value={formData.receiverPhone}
              onChange={handleChange}
              required
              placeholder="Receiver Phone"
              className="p-2 border rounded"
            />
          </div>
        </div>

        {/* Package */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Package & Delivery</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              name="parcelSize"
              value={formData.parcelSize}
              onChange={handleChange}
              className="p-2 border rounded"
            >
              <option>Small</option>
              <option>Medium</option>
              <option>Large</option>
            </select>

            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              onBlur={calculatePrice}
              placeholder="Weight (kg)"
              className="p-2 border rounded"
            />
          </div>

          {/* ASR */}
          <div className="mt-4 bg-red-50 border border-red-300 rounded-lg p-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isASR"
                checked={formData.isASR}
                onChange={(e) => {
                  handleChange(e);
                  setTimeout(calculatePrice, 50);
                }}
              />
              <span className="font-bold text-red-800">
                🔒 Adult Signature Required (+₹100)
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-between bg-[#fdf7ed] p-4 rounded border">
          <span className="font-semibold">Estimated Price</span>
          <span className="font-bold text-[#ffb500]">₹{formData.price}</span>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#351c15] text-white py-3 rounded font-semibold disabled:opacity-50"
        >
          {submitting ? "Placing Order..." : "Place Order"}
        </button>
      </form>

      {/* Map Pickers */}
      {showPickupPicker && (
        <MapPicker
          onCancel={() => setShowPickupPicker(false)}
          onSelect={(p) => handleMapPick("pickup", p)}
          title="Pickup Location"
        />
      )}

      {showDeliveryPicker && (
        <MapPicker
          onCancel={() => setShowDeliveryPicker(false)}
          onSelect={(p) => handleMapPick("delivery", p)}
          title="Delivery Location"
        />
      )}
    </div>
  );
}

export default PlaceOrder;
