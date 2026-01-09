import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../../services/api";
import MapPicker from "../../components/MapPicker";
import SellerSidebar from "./SellerSidebar";
import { ShieldCheck } from "lucide-react";

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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/profile");
        const user = res.data;

        setFormData((prev) => ({
          ...prev,
          senderName: `${user.firstName} ${user.lastName}`.trim(),
          senderEmail: user.email,
          senderPhone: user.phone,
        }));
      } catch (err) {
        console.error("Failed to load profile for autofill", err);
      }
    };
    fetchProfile();
  }, []);

  const [showPickupPicker, setShowPickupPicker] = useState(false);
  const [showDeliveryPicker, setShowDeliveryPicker] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    const weightVal = parseFloat(formData.weight) || 0;
    const sizeVal = formData.parcelSize;
    const asrVal = formData.isASR;

    let weightPrice = weightVal * 10;
    let sizePrice =
      sizeVal === "Large"
        ? 50
        : sizeVal === "Medium"
        ? 30
        : 10;

    let asrPrice = asrVal ? 100 : 0;

    const newPrice = weightPrice + sizePrice + asrPrice;

    setFormData((prev) => {
      if (prev.price === newPrice) return prev;
      return { ...prev, price: newPrice };
    });
  }, [formData.weight, formData.parcelSize, formData.isASR]);

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
        weight: parseFloat(formData.weight),
        deliveryNotes: formData.deliveryNotes,
        scheduledDate: formData.scheduledDate || null,
        scheduledTimeSlot: formData.scheduledTimeSlot || null,
        price: formData.price,
        isASR: formData.isASR,
      };

      await api.post("/orders", payload);
      toast.success("Order placed successfully! Redirecting to dashboard...");
      
      // Delay redirection to let the user see the toast
      setTimeout(() => {
        navigate("/seller/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Error placing order:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.innerException ||
        error.message ||
        "Failed to place order.";
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#ff8a3d] focus:ring-1 focus:ring-[#ff8a3d] transition";
  const labelClass =
    "block mb-1 text-sm font-semibold text-slate-400";

  return (
    <div className="min-h-screen flex bg-[#0b0f14] text-slate-100">
      <SellerSidebar active="place-order" />

      <div className="flex-1 px-10 py-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black mb-6 text-white tracking-tight">
            Place New Order
          </h2>

          <div className="space-y-8 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-xl">
            {/* Sender */}
            <div className="border-b border-white/10 pb-6">
              <h3 className="text-xl font-bold mb-6 text-[#ff8a3d]">
                Sender Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input
                  name="senderName"
                  value={formData.senderName}
                  readOnly
                  placeholder="Sender Name"
                  className={`${inputClass} opacity-60 cursor-not-allowed`}
                  title="Auto-filled from profile"
                />
                <input
                  name="senderPhone"
                  value={formData.senderPhone}
                  readOnly
                  placeholder="Sender Phone"
                  className={`${inputClass} opacity-60 cursor-not-allowed`}
                  title="Auto-filled from profile"
                />
                <input
                  name="senderEmail"
                  value={formData.senderEmail}
                  readOnly
                  placeholder="Sender Email"
                  type="email"
                  className={`${inputClass} opacity-60 cursor-not-allowed`}
                  title="Auto-filled from profile"
                />
                <div className="md:col-span-2">
                  <label className={labelClass}>Pickup Address</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      name="pickupAddress"
                      value={formData.pickupAddress}
                      onChange={handleChange}
                      placeholder="Street, area, etc."
                      className={`flex-1 ${inputClass}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPickupPicker(true)}
                      className="px-5 py-3 bg-[#ff8a3d] text-black font-bold rounded-xl hover:bg-[#e57c37] hover:text-white transition"
                    >
                      Pick on map
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      name="pickupPincode"
                      value={formData.pickupPincode}
                      onChange={handleChange}
                      placeholder="Pincode"
                      className={inputClass}
                    />
                    <div className="p-3 border border-white/10 rounded-xl bg-white/5 flex flex-col justify-center">
                      <div className="text-xs text-slate-500 ">
                        Latitude
                      </div>
                      <div className="text-sm font-mono text-slate-300">
                        {formData.pickupLatitude
                          ? formData.pickupLatitude.toFixed(6)
                          : "—"}
                      </div>
                    </div>
                    <div className="p-3 border border-white/10 rounded-xl bg-white/5 flex flex-col justify-center">
                      <div className="text-xs text-slate-500 ">
                        Longitude
                      </div>
                      <div className="text-sm font-mono text-slate-300">
                        {formData.pickupLongitude
                          ? formData.pickupLongitude.toFixed(6)
                          : "—"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Receiver */}
            <div className="border-b border-white/10 pb-6">
              <h3 className="text-xl font-bold mb-6 text-[#ff8a3d]">
                Receiver Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input
                  name="receiverName"
                  value={formData.receiverName}
                  onChange={handleChange}
                  placeholder="Receiver Name"
                  required
                  className={inputClass}
                />
                <input
                  name="receiverPhone"
                  value={formData.receiverPhone}
                  onChange={handleChange}
                  placeholder="Receiver Phone"
                  required
                  className={inputClass}
                />
                <input
                  name="receiverEmail"
                  value={formData.receiverEmail}
                  onChange={handleChange}
                  placeholder="Receiver Email (optional)"
                  className={inputClass}
                />
                <div className="md:col-span-2">
                  <label className={labelClass}>Receiver Address</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      name="receiverAddress"
                      value={formData.receiverAddress}
                      onChange={handleChange}
                      placeholder="Delivery address"
                      className={`flex-1 ${inputClass}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowDeliveryPicker(true)}
                      className="px-5 py-3 bg-[#ff8a3d] text-black font-bold rounded-xl hover:bg-[#e57c37] hover:text-white transition"
                    >
                      Pick on map
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      name="receiverPincode"
                      value={formData.receiverPincode}
                      onChange={handleChange}
                      placeholder="Pincode"
                      className={inputClass}
                    />
                    <div className="p-3 border border-white/10 rounded-xl bg-white/5 flex flex-col justify-center">
                      <div className="text-xs text-slate-500">
                        Latitude
                      </div>
                      <div className="text-sm font-mono text-slate-300">
                        {formData.deliveryLatitude
                          ? formData.deliveryLatitude.toFixed(6)
                          : "—"}
                      </div>
                    </div>
                    <div className="p-3 border border-white/10 rounded-xl bg-white/5 flex flex-col justify-center">
                      <div className="text-xs text-slate-500">
                        Longitude
                      </div>
                      <div className="text-sm font-mono text-slate-300">
                        {formData.deliveryLongitude
                          ? formData.deliveryLongitude.toFixed(6)
                          : "—"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Package */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-[#ff8a3d]">
                Package & Delivery
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className={labelClass}>Type</label>
                  <select
                    name="deliveryType"
                    value={formData.deliveryType}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="Normal" className="bg-[#1a1f29]">
                      Normal
                    </option>
                    <option value="Express" className="bg-[#1a1f29]">
                      Express
                    </option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Size</label>
                  <select
                    name="parcelSize"
                    value={formData.parcelSize}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="Small" className="bg-[#1a1f29]">
                      Small
                    </option>
                    <option value="Medium" className="bg-[#1a1f29]">
                      Medium
                    </option>
                    <option value="Large" className="bg-[#1a1f29]">
                      Large
                    </option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Weight (kg)</label>
                  <input
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="0.0"
                    type="number"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* ASR Checkbox */}
              <div className="mt-6 bg-[#ff8a3d]/10 border border-[#ff8a3d]/30 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck
                        className={`w-5 h-5 ${
                          formData.isASR ? "text-[#ff8a3d]" : "text-slate-400"
                        }`}
                      />
                      <span className="text-lg font-bold text-white">
                        Enable ASR
                      </span>
                    </div>
                    
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="isASR"
                        checked={formData.isASR}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff8a3d]"></div>
                    </label>
                </div>
                
                <p className="text-sm text-slate-400">
                  Customer must provide ID verification and signature before
                  delivery. Additional{" "}
                  <span className="text-white font-bold">₹100</span> fee
                  applies.
                </p>
              </div>


              <div>
                <label className={labelClass}>Schedule Delivery</label>
                <input 
                  type="date"
                  name="scheduledDate"
                  min={new Date().toISOString().split("T")[0]}
                  value={formData.scheduledDate ? formData.scheduledDate.split("T")[0] : ""} 
                  onChange={(e) => {
                    const dateVal = e.target.value ? new Date(e.target.value).toISOString() : "";
                    setFormData(prev => ({ ...prev, scheduledDate: dateVal }));
                  }}
                  className={`${inputClass} [color-scheme:dark]`}
                />
              </div>

              <div className="mt-6">
                <label className={labelClass}>Delivery Notes</label>
                <textarea
                  name="deliveryNotes"
                  value={formData.deliveryNotes}
                  onChange={handleChange}
                  placeholder="Instructions for driver..."
                  className={inputClass}
                  rows="3"
                />
              </div>
            </div>

            <div className="bg-[#0f141c] border border-white/10 p-6 rounded-2xl flex justify-between items-center shadow-inner">
              <span className="text-lg font-semibold text-slate-300">
                Estimated Price:
              </span>
              <span className="text-3xl font-black text-white">
                ₹{formData.price}
              </span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-[#ff8a3d] text-black py-4 rounded-xl font-bold text-lg hover:shadow-[0_0_20px_rgba(255,138,61,0.4)] hover:scale-[1.01] hover:bg-[#e57c37] hover:text-white transition disabled:opacity-50 disabled:hover:scale-100"
            >
              {submitting ? "Processing..." : "Confirm & Place Order"}
            </button>
          </div>
        </div>
      </div>

      {/* Map pickers */}
      {showPickupPicker && (
        <MapPicker
          initialPosition={
            formData.pickupLatitude && formData.pickupLongitude
              ? [formData.pickupLatitude, formData.pickupLongitude]
              : null
          }
          onCancel={() => setShowPickupPicker(false)}
          onSelect={(payload) => handleMapPick("pickup", payload)}
          title="Pick Pickup Location"
        />
      )}

      {showDeliveryPicker && (
        <MapPicker
          initialPosition={
            formData.deliveryLatitude && formData.deliveryLongitude
              ? [formData.deliveryLatitude, formData.deliveryLongitude]
              : null
          }
          onCancel={() => setShowDeliveryPicker(false)}
          onSelect={(payload) => handleMapPick("delivery", payload)}
          title="Pick Delivery Location"
        />
      )}
    </div>
  );
}

export default PlaceOrder;
