import { useState } from "react";
import api from "../../services/api";
import MapPicker from "../../components/MapPicker";
import SellerSidebar from "./SellerSidebar";
import { ShieldCheck } from "lucide-react";

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

    // ASR adds extra cost
    let asrPrice = formData.isASR ? 100 : 0;

    setFormData((s) => ({
      ...s,
      price: weightPrice + sizePrice + asrPrice
    }));
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setSubmitting(true);
  //   try {
  //     const payload = {
  //       senderName: formData.senderName,
  //       senderPhone: formData.senderPhone,
  //       senderEmail: formData.senderEmail,
  //       pickupAddress: formData.pickupAddress,
  //       pickupPincode: formData.pickupPincode,
  //       pickupLatitude: formData.pickupLatitude,
  //       pickupLongitude: formData.pickupLongitude,
  //       receiverName: formData.receiverName,
  //       receiverPhone: formData.receiverPhone,
  //       receiverEmail: formData.receiverEmail,
  //       receiverAddress: formData.receiverAddress,
  //       receiverPincode: formData.receiverPincode,
  //       deliveryLatitude: formData.deliveryLatitude,
  //       deliveryLongitude: formData.deliveryLongitude,
  //       deliveryPincode: formData.deliveryPincode,
  //       deliveryType: formData.deliveryType,
  //       parcelSize: formData.parcelSize,
  //       weight: parseFloat(formData.weight),
  //       deliveryNotes: formData.deliveryNotes,
  //       scheduledDate: formData.scheduledDate || null,
  //       scheduledTimeSlot: formData.scheduledTimeSlot || null,
  //       price: formData.price,
  //       isASR: formData.isASR,
  //     };

  //     await api.post("/orders", payload);
  //     window.location.href = "/seller/dashboard";
  //   } catch (error) {
  //     console.error("Error placing order:", error);
  //     const errorMessage =
  //       error.response?.data?.message ||
  //       error.response?.data?.innerException ||
  //       error.message ||
  //       "Failed to place order.";
  //     alert(`Error: ${errorMessage}`);
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };


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

      deliveryPincode: formData.deliveryPincode || formData.receiverPincode,
      deliveryLatitude: formData.deliveryLatitude,
      deliveryLongitude: formData.deliveryLongitude,

      deliveryType: formData.deliveryType,
      parcelSize: formData.parcelSize,

      weight: formData.weight ? parseFloat(formData.weight) : 0,

      deliveryNotes: formData.deliveryNotes,

      scheduledDate: formData.scheduledDate
        ? new Date(formData.scheduledDate).toISOString()
        : null,

      scheduledTimeSlot: formData.scheduledTimeSlot || null,

      price: Number(formData.price) || 0,
      isASR: Boolean(formData.isASR),
    };

    console.log("ORDER PAYLOAD:", payload); // 🔥 DEBUG LINE

    await api.post("/orders", payload);
    window.location.href = "/seller/dashboard";
  } catch (error) {
    console.error("Error placing order:", error);

    const backendError =
      error.response?.data?.errors ||
      error.response?.data?.message ||
      JSON.stringify(error.response?.data);

    alert(`Order failed:\n${backendError}`);
  } finally {
    setSubmitting(false);
  }
};


  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#ff8a3d] focus:ring-1 focus:ring-[#ff8a3d] transition";
  const labelClass = "block mb-1 text-sm font-semibold text-slate-400 uppercase tracking-wider";

  return (
    <div className="min-h-screen flex bg-[#0b0f14] text-slate-100">
      <SellerSidebar active="place-order" />

      <div className="flex-1 px-10 py-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black mb-6 text-white tracking-tight">Place New Order</h2>

          <div className="space-y-8 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-xl">
            
            {/* Sender */}
            <div className="border-b border-white/10 pb-6">
              <h3 className="text-xl font-bold mb-6 text-[#ff8a3d]">Sender Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input name="senderName" value={formData.senderName} onChange={handleChange} placeholder="Sender Name" required className={inputClass} />
                <input name="senderPhone" value={formData.senderPhone} onChange={handleChange} placeholder="Sender Phone" required className={inputClass} />
                <input name="senderEmail" value={formData.senderEmail} onChange={handleChange} placeholder="Sender Email" type="email" className={inputClass} />
                <div className="md:col-span-2">
                  <label className={labelClass}>Pickup Address</label>
                  <div className="flex gap-2 mb-3">
                    <input name="pickupAddress" value={formData.pickupAddress} onChange={handleChange} placeholder="Street, area, etc." className={`flex-1 ${inputClass}`} />
                    <button type="button" onClick={() => setShowPickupPicker(true)} className="px-5 py-3 bg-[#ff8a3d] text-black font-bold rounded-xl hover:bg-[#e0a200] transition">Pick on map</button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <input name="pickupPincode" value={formData.pickupPincode} onChange={handleChange} placeholder="Pincode" className={inputClass} />
                    <div className="p-3 border border-white/10 rounded-xl bg-white/5 flex flex-col justify-center">
                      <div className="text-xs text-slate-500 uppercase">Latitude</div>
                      <div className="text-sm font-mono text-slate-300">{formData.pickupLatitude ? formData.pickupLatitude.toFixed(6) : "—"}</div>
                    </div>
                    <div className="p-3 border border-white/10 rounded-xl bg-white/5 flex flex-col justify-center">
                      <div className="text-xs text-slate-500 uppercase">Longitude</div>
                      <div className="text-sm font-mono text-slate-300">{formData.pickupLongitude ? formData.pickupLongitude.toFixed(6) : "—"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Receiver */}
            <div className="border-b border-white/10 pb-6">
              <h3 className="text-xl font-bold mb-6 text-[#ff8a3d]">Receiver Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input name="receiverName" value={formData.receiverName} onChange={handleChange} placeholder="Receiver Name" required className={inputClass} />
                <input name="receiverPhone" value={formData.receiverPhone} onChange={handleChange} placeholder="Receiver Phone" required className={inputClass} />
                <input name="receiverEmail" value={formData.receiverEmail} onChange={handleChange} placeholder="Receiver Email (optional)" className={inputClass} />
                <div className="md:col-span-2">
                  <label className={labelClass}>Receiver Address</label>
                  <div className="flex gap-2 mb-3">
                    <input name="receiverAddress" value={formData.receiverAddress} onChange={handleChange} placeholder="Delivery address" className={`flex-1 ${inputClass}`} />
                    <button type="button" onClick={() => setShowDeliveryPicker(true)} className="px-5 py-3 bg-[#ff8a3d] text-black font-bold rounded-xl hover:bg-[#e0a200] transition">Pick on map</button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <input name="receiverPincode" value={formData.receiverPincode} onChange={handleChange} placeholder="Pincode" className={inputClass} />
                    <div className="p-3 border border-white/10 rounded-xl bg-white/5 flex flex-col justify-center">
                      <div className="text-xs text-slate-500 uppercase">Latitude</div>
                      <div className="text-sm font-mono text-slate-300">{formData.deliveryLatitude ? formData.deliveryLatitude.toFixed(6) : "—"}</div>
                    </div>
                    <div className="p-3 border border-white/10 rounded-xl bg-white/5 flex flex-col justify-center">
                      <div className="text-xs text-slate-500 uppercase">Longitude</div>
                      <div className="text-sm font-mono text-slate-300">{formData.deliveryLongitude ? formData.deliveryLongitude.toFixed(6) : "—"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Package */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-[#ff8a3d]">Package & Delivery</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                   <label className={labelClass}>Type</label>
                   <select name="deliveryType" value={formData.deliveryType} onChange={handleChange} className={inputClass}>
                    <option value="Normal" className="bg-[#1a1f29]">Normal</option>
                    <option value="Express" className="bg-[#1a1f29]">Express</option>
                   </select>
                </div>
                <div>
                  <label className={labelClass}>Size</label>
                  <select name="parcelSize" value={formData.parcelSize} onChange={handleChange} className={inputClass}>
                    <option value="Small" className="bg-[#1a1f29]">Small</option>
                    <option value="Medium" className="bg-[#1a1f29]">Medium</option>
                    <option value="Large" className="bg-[#1a1f29]">Large</option>
                  </select>
                </div>
                <div>
                   <label className={labelClass}>Weight (kg)</label>
                   <input name="weight" value={formData.weight} onChange={handleChange} onBlur={calculatePrice} placeholder="0.0" type="number" className={inputClass} />
                </div>
              </div>

              {/* ASR Checkbox */}
              <div className="mt-6 bg-[#ff8a3d]/10 border border-[#ff8a3d]/30 rounded-xl p-5">
                <label className="flex items-start gap-4 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isASR"
                    checked={formData.isASR}
                    onChange={(e) => {
                      handleChange(e);
                      setTimeout(calculatePrice, 100);
                    }}
                    className="mt-1 w-5 h-5 text-[#ff8a3d] border-white/30 rounded focus:ring-[#ff8a3d] bg-transparent"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck className={`w-5 h-5 ${formData.isASR ? 'text-[#ff8a3d]' : 'text-slate-400'}`} />
                        <span className={`text-lg font-bold ${formData.isASR ? 'text-white' : 'text-slate-300'}`}>
                        Require Adult Signature (ASR)
                        </span>
                    </div>
                    <p className="text-sm text-slate-400">
                      Customer must provide ID verification and signature before delivery. Additional <span className="text-white font-bold">$100</span> fee applies.
                    </p>
                  </div>
                </label>
              </div>

              <div className="mt-6">
                <label className={labelClass}>Delivery Notes</label>
                <textarea name="deliveryNotes" value={formData.deliveryNotes} onChange={handleChange} placeholder="Instructions for driver..." className={inputClass} rows="3" />
              </div>
            </div>

            <div className="bg-[#0f141c] border border-white/10 p-6 rounded-2xl flex justify-between items-center shadow-inner">
              <span className="text-lg font-semibold text-slate-300">Estimated Price:</span>
              <span className="text-3xl font-black text-white">${formData.price}</span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-[#ff8a3d] text-black py-4 rounded-xl font-bold text-lg hover:shadow-[0_0_20px_rgba(255,138,61,0.4)] hover:scale-[1.01] transition disabled:opacity-50 disabled:hover:scale-100"
            >
              {submitting ? "Processing..." : "Confirm & Place Order"}
            </button>
          </div>

        </div>
      </div>

      {/* Map pickers */}
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