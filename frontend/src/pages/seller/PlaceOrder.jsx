import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import MapPicker from "../../components/MapPicker";
import SellerSidebar from "./SellerSidebar";

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
    isASR: false,
  });

  const [showPickupPicker, setShowPickupPicker] = useState(false);
  const [showDeliveryPicker, setShowDeliveryPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/profile");
        const profile = res.data;
        if (profile) {
          setFormData(prev => ({
            ...prev,
            senderName: `${profile.firstName} ${profile.lastName}`.trim(),
            senderPhone: profile.phone || "",
            senderEmail: profile.email || "",
          }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(s => ({
      ...s,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleMapPick = (type, { lat, lng, address, pincode }) => {
    if (type === "pickup") {
      setFormData(s => ({
        ...s,
        pickupLatitude: lat,
        pickupLongitude: lng,
        pickupAddress: address || s.pickupAddress,
        pickupPincode: pincode || s.pickupPincode,
      }));
      setShowPickupPicker(false);
    } else {
      setFormData(s => ({
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

    let asrPrice = formData.isASR ? 100 : 0;

    setFormData(s => ({
      ...s,
      price: weightPrice + sizePrice + asrPrice,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/orders", {
        ...formData,
        weight: parseFloat(formData.weight || 0),
        scheduledDate: formData.scheduledDate || null,
        scheduledTimeSlot: formData.scheduledTimeSlot || null,
      });
      alert("Order placed successfully!");
      navigate("/seller/dashboard");
    } catch {
      alert("Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "p-2 rounded bg-white/10 border border-white/10 text-slate-100 placeholder:text-slate-500";

  return (
    <main className="flex bg-[#0b0f14] text-slate-100">
      <SellerSidebar active="create" />

      <div className="p-6 w-[80%] mx-auto">
        <h2 className="text-3xl font-black mb-6">Place New Order</h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10"
        >
          {/* ================= SENDER ================= */}
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-xl font-bold mb-4 text-[#ff8a3d]">
              Sender Details
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <input readOnly value={formData.senderName} className={inputClass} />
              <input readOnly value={formData.senderPhone} className={inputClass} />
              <input readOnly value={formData.senderEmail} className={inputClass} />
            </div>
          </div>

          {/* ================= RECEIVER ================= */}
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-xl font-bold mb-4 text-[#ff8a3d]">
              Receiver Details
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <input name="receiverName" value={formData.receiverName} onChange={handleChange} className={inputClass} placeholder="Receiver name"/>
              <input name="receiverPhone" value={formData.receiverPhone} onChange={handleChange} className={inputClass} placeholder="Receiver phone"/>
              <input name="receiverEmail" value={formData.receiverEmail} onChange={handleChange} className={inputClass} placeholder="Receiver email"/>
            </div>
          </div>

          {/* ================= PACKAGE DETAILS ================= */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-[#ff8a3d]">
              Package & Delivery
            </h3>

            <div className="grid md:grid-cols-3 gap-4 [&_option]:text-black">
              <select name="deliveryType" value={formData.deliveryType} onChange={handleChange} className={inputClass}>
                <option value="Normal">Normal</option>
                <option value="Express">Express</option>
              </select>

              <select name="parcelSize" value={formData.parcelSize} onChange={handleChange} className={inputClass}>
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
              </select>

              <input
                name="weight"
                type="number"
                placeholder="Weight (kg)"
                value={formData.weight}
                onChange={handleChange}
                onBlur={calculatePrice}
                className={inputClass}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4 [&_option]:text-black">
              <input type="date" name="scheduledDate" value={formData.scheduledDate} onChange={handleChange} className={inputClass} />

              <select name="scheduledTimeSlot" value={formData.scheduledTimeSlot} onChange={handleChange} className={inputClass}>
                <option value="">Any Time</option>
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
              </select>
            </div>

            {/* ASR */}
            <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isASR"
                  checked={formData.isASR}
                  onChange={(e) => {
                    handleChange(e);
                    setTimeout(calculatePrice, 100);
                  }}
                />
                <span className="font-bold text-red-400">
                  Require Adult Signature (₹100)
                </span>
              </label>
            </div>

            <textarea
              name="deliveryNotes"
              value={formData.deliveryNotes}
              onChange={handleChange}
              placeholder="Delivery notes"
              rows="2"
              className={`${inputClass} mt-4 w-full`}
            />
          </div>

          {/* ================= PRICE ================= */}
          <div className="flex justify-between bg-white/5 p-4 rounded-xl border border-white/10">
            <span className="text-slate-400">Estimated Price</span>
            <span className="text-2xl font-black text-[#ff8a3d]">
              ₹{formData.price}
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#ff8a3d] text-black py-3 rounded-xl font-bold hover:opacity-90"
          >
            {submitting ? "Placing order..." : "Confirm & Place Order"}
          </button>
        </form>

        {showPickupPicker && (
          <MapPicker onCancel={() => setShowPickupPicker(false)} onSelect={(p) => handleMapPick("pickup", p)} />
        )}

        {showDeliveryPicker && (
          <MapPicker onCancel={() => setShowDeliveryPicker(false)} onSelect={(p) => handleMapPick("delivery", p)} />
        )}
      </div>
    </main>
  );
}

export default PlaceOrder;
