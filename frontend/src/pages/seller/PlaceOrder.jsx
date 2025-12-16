import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import MapPicker from "../../components/MapPicker";

function PlaceOrder() {
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
    isASR: false, // 🆕 ASR field
  });

  const [showPickupPicker, setShowPickupPicker] = useState(false);
  const [showDeliveryPicker, setShowDeliveryPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((s) => ({
      ...s,
      [name]: type === "checkbox" ? checked : value
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
    let weightPrice = parseFloat(formData.weight || 0) * 10;
    let sizePrice =
      formData.parcelSize === "Large"
        ? 50
        : formData.parcelSize === "Medium"
          ? 30
          : 10;

    // 🆕 ASR adds extra cost
    let asrPrice = formData.isASR ? 100 : 0;

    setFormData((s) => ({
      ...s,
      price: weightPrice + sizePrice + asrPrice
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Prepare payload: include coordinates only if available (null -> omitted)
      const payload = {
        senderName: formData.senderName,
        senderPhone: formData.senderPhone,
        senderEmail: formData.senderEmail,
        pickupAddress: formData.pickupAddress,
        pickupPincode: formData.pickupPincode,
        // If null, let backend geocode from address
        pickupLatitude: formData.pickupLatitude,
        pickupLongitude: formData.pickupLongitude,

        receiverName: formData.receiverName,
        receiverPhone: formData.receiverPhone,
        receiverEmail: formData.receiverEmail,
        receiverAddress: formData.receiverAddress,
        receiverPincode: formData.deliveryPincode || formData.receiverPincode,
        deliveryLatitude: formData.deliveryLatitude,
        deliveryLongitude: formData.deliveryLongitude,

        deliveryType: formData.deliveryType,
        parcelSize: formData.parcelSize,
        weight: parseFloat(formData.weight || 0),
        deliveryNotes: formData.deliveryNotes,
        scheduledDate: formData.scheduledDate || null,
        scheduledTimeSlot: formData.scheduledTimeSlot || null,
        price: formData.price,
        isASR: formData.isASR,
      };

      // Send to server
      await api.post("/orders", payload);
      alert("Order placed successfully!");
      // Redirect to valid page, e.g. dashboard or orders list
      navigate("/seller/dashboard");
    } catch (error) {
      console.error("Error placing order:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.innerException ||
        error.message ||
        "Failed to place order.";
      alert(`Error: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-[#351c15]">Place New Order</h2>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-md border border-[#e6d8c9]">
        {/* Sender */}
        <div className="border-b pb-4">
          <h3 className="text-xl font-semibold mb-4 text-[#351c15]">Sender Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="senderName" value={formData.senderName} onChange={handleChange} placeholder="Sender Name" required className="p-2 border rounded" />
            <input name="senderPhone" value={formData.senderPhone} onChange={handleChange} placeholder="Sender Phone" required className="p-2 border rounded" />
            <input name="senderEmail" value={formData.senderEmail} onChange={handleChange} placeholder="Sender Email" type="email" className="p-2 border rounded" />
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium text-[#4b382e]">Pickup Address</label>
              <div className="flex gap-2">
                <input name="pickupAddress" value={formData.pickupAddress} onChange={handleChange} placeholder="Street, area, etc." className="flex-1 p-2 border rounded" />
                <button type="button" onClick={() => setShowPickupPicker(true)} className="px-3 py-2 bg-[#ffb500] text-[#351c15] font-semibold rounded hover:bg-[#e6a300] transition">Pick on map</button>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <input name="pickupPincode" value={formData.pickupPincode} onChange={handleChange} placeholder="Pincode" className="p-2 border rounded" />
                <div className="p-2 border rounded bg-gray-50">
                  <div className="text-xs text-gray-500">Latitude</div>
                  <div className="text-sm font-mono">{formData.pickupLatitude ? formData.pickupLatitude.toFixed(6) : "—"}</div>
                </div>
                <div className="p-2 border rounded bg-gray-50">
                  <div className="text-xs text-gray-500">Longitude</div>
                  <div className="text-sm font-mono">{formData.pickupLongitude ? formData.pickupLongitude.toFixed(6) : "—"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Receiver */}
        <div className="border-b pb-4">
          <h3 className="text-xl font-semibold mb-4 text-[#351c15]">Receiver Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="receiverName" value={formData.receiverName} onChange={handleChange} placeholder="Receiver Name" required className="p-2 border rounded" />
            <input name="receiverPhone" value={formData.receiverPhone} onChange={handleChange} placeholder="Receiver Phone" required className="p-2 border rounded" />
            <input name="receiverEmail" value={formData.receiverEmail} onChange={handleChange} placeholder="Receiver Email (optional)" className="p-2 border rounded" />
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium text-[#4b382e]">Receiver Address</label>
              <div className="flex gap-2">
                <input name="receiverAddress" value={formData.receiverAddress} onChange={handleChange} placeholder="Delivery address" className="flex-1 p-2 border rounded" />
                <button type="button" onClick={() => setShowDeliveryPicker(true)} className="px-3 py-2 bg-[#ffb500] text-[#351c15] font-semibold rounded hover:bg-[#e6a300] transition">Pick on map</button>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <input name="receiverPincode" value={formData.receiverPincode} onChange={handleChange} placeholder="Pincode" className="p-2 border rounded" />
                <div className="p-2 border rounded bg-gray-50">
                  <div className="text-xs text-gray-500">Latitude</div>
                  <div className="text-sm font-mono">{formData.deliveryLatitude ? formData.deliveryLatitude.toFixed(6) : "—"}</div>
                </div>
                <div className="p-2 border rounded bg-gray-50">
                  <div className="text-xs text-gray-500">Longitude</div>
                  <div className="text-sm font-mono">{formData.deliveryLongitude ? formData.deliveryLongitude.toFixed(6) : "—"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Package */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-[#351c15]">Package & Delivery</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select name="deliveryType" value={formData.deliveryType} onChange={handleChange} className="p-2 border rounded">
              <option value="Normal">Normal</option>
              <option value="Express">Express</option>
            </select>
            <select name="parcelSize" value={formData.parcelSize} onChange={handleChange} className="p-2 border rounded">
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
            </select>
            <input name="weight" value={formData.weight} onChange={handleChange} onBlur={calculatePrice} placeholder="Weight (kg)" type="number" className="p-2 border rounded" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-[#4b382e] mb-1">Scheduled Date</label>
              <input 
                type="date" 
                name="scheduledDate" 
                value={formData.scheduledDate} 
                onChange={handleChange} 
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-2 border rounded" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4b382e] mb-1">Time Slot (Optional)</label>
              <select name="scheduledTimeSlot" value={formData.scheduledTimeSlot} onChange={handleChange} className="w-full p-2 border rounded">
                <option value="">Any Time</option>
                <option value="Morning (9AM - 12PM)">Morning (9AM - 12PM)</option>
                <option value="Afternoon (12PM - 4PM)">Afternoon (12PM - 4PM)</option>
                <option value="Evening (4PM - 8PM)">Evening (4PM - 8PM)</option>
              </select>
            </div>
          </div>

          {/* 🆕 ASR Checkbox */}
          <div className="mt-4 bg-red-50 border-2 border-red-300 rounded-lg p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isASR"
                checked={formData.isASR}
                onChange={(e) => {
                  handleChange(e);
                  // Recalculate price when ASR changes
                  setTimeout(calculatePrice, 100);
                }}
                className="w-5 h-5 text-red-600 border-red-300 rounded focus:ring-red-500"
              />
              <div>
                <span className="text-lg font-bold text-red-800">
                  🔒 Require Adult Signature (ASR)
                </span>
                <p className="text-sm text-red-700 mt-1">
                  Customer must provide ID verification and signature before delivery. Additional ₹100 fee applies.
                </p>
              </div>
            </label>
          </div>

          <div className="mt-4">
            <textarea name="deliveryNotes" value={formData.deliveryNotes} onChange={handleChange} placeholder="Delivery notes" className="w-full p-2 border rounded" rows="2" />
          </div>
        </div>

        <div className="bg-[#fdf7ed] p-4 rounded-lg flex justify-between items-center border border-[#e6d8c9]">
          <span className="text-lg font-semibold text-[#351c15]">Estimated Price:</span>
          <span className="text-2xl font-bold text-[#ffb500]">₹{formData.price}</span>
        </div>

        <button type="submit" disabled={submitting} className="w-full bg-[#351c15] text-white py-3 rounded-lg font-semibold hover:bg-[#4a2a21] transition disabled:opacity-50">
          {submitting ? "Placing order..." : "Confirm & Place Order"}
        </button>
      </form>

      {/* Map pickers as modal-like components */}
      {showPickupPicker && (
        <MapPicker
          initialPosition={formData.pickupLatitude && formData.pickupLongitude ? [formData.pickupLatitude, formData.pickupLongitude] : null}
          onCancel={() => setShowPickupPicker(false)}
          onSelect={(payload) => handleMapPick("pickup", payload)}
          title="Pick Pickup Location"
        />
      )}

      {showDeliveryPicker && (
        <MapPicker
          initialPosition={formData.deliveryLatitude && formData.deliveryLongitude ? [formData.deliveryLatitude, formData.deliveryLongitude] : null}
          onCancel={() => setShowDeliveryPicker(false)}
          onSelect={(payload) => handleMapPick("delivery", payload)}
          title="Pick Delivery Location"
        />
      )}
    </div>
  );
}

export default PlaceOrder;