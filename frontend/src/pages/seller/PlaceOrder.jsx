import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import SellerSidebar from "./SellerSidebar";

export default function PlaceOrder() {
  const [formData, setFormData] = useState({
    senderName: "",
    senderPhone: "",
    senderEmail: "",
    pickupAddress: "",
    pickupPincode: "",
    receiverName: "",
    receiverPhone: "",
    receiverEmail: "",
    receiverAddress: "",
    receiverPincode: "",
    deliveryPincode: "",
    deliveryType: "Normal",
    parcelSize: "Small",
    weight: "",
    deliveryNotes: "",
    scheduledDate: "",
    scheduledTimeSlot: "",
    price: 0,
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const calculatePrice = () => {
    let weightPrice = parseFloat(formData.weight || 0) * 10;
    let sizePrice =
      formData.parcelSize === "Large"
        ? 50
        : formData.parcelSize === "Medium"
        ? 30
        : 10;
    let typePrice = formData.deliveryType === "ASR" ? 100 : 0;

    setFormData({
      ...formData,
      price: weightPrice + sizePrice + typePrice,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/orders", formData);
      alert("Order placed successfully!");
      navigate("/seller/dashboard");
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order.");
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f8f4ef]">

      {/* SIDEBAR */}
      <SellerSidebar active="placeorder" />

      {/* MAIN CONTENT */}
      <div className="flex-1 px-10 py-8">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#351c15]">Place New Order</h1>
          <p className="text-[#6b4f3a]">
            Fill out the details to create a new shipment
          </p>
        </div>

        {/* FORM CARD */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-2xl shadow border border-[#e6d8c9] space-y-10 max-w-4xl"
        >

          {/* ------------ SENDER SECTION ------------ */}
          <div>
            <h2 className="text-xl font-bold text-[#351c15] mb-4">
              Sender Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Sender Name" name="senderName" value={formData.senderName} onChange={handleChange} />
              <InputField label="Sender Phone" name="senderPhone" value={formData.senderPhone} onChange={handleChange} />
              <InputField label="Sender Email" name="senderEmail" type="email" value={formData.senderEmail} onChange={handleChange} />
              <InputField label="Pickup Pincode" name="pickupPincode" value={formData.pickupPincode} maxLength="6" onChange={handleChange} />
            </div>

            <InputField label="Pickup Address" name="pickupAddress" value={formData.pickupAddress} onChange={handleChange} className="mt-4" />
          </div>

          {/* ------------ RECEIVER SECTION ------------ */}
          <div>
            <h2 className="text-xl font-bold text-[#351c15] mb-4">
              Receiver Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Receiver Name" name="receiverName" value={formData.receiverName} onChange={handleChange} />
              <InputField label="Receiver Phone" name="receiverPhone" value={formData.receiverPhone} onChange={handleChange} />
              <InputField label="Receiver Email" name="receiverEmail" type="email" value={formData.receiverEmail} onChange={handleChange} />
              <InputField label="Receiver Pincode" name="receiverPincode" value={formData.receiverPincode} maxLength="6" onChange={handleChange} />
              <InputField label="Delivery Pincode" name="deliveryPincode" value={formData.deliveryPincode} maxLength="6" onChange={handleChange} />
            </div>

            <InputField label="Receiver Address" name="receiverAddress" value={formData.receiverAddress} onChange={handleChange} className="mt-4" />
          </div>

          {/* ------------ PACKAGE SECTION ------------ */}
          <div>
            <h2 className="text-xl font-bold text-[#351c15] mb-4">
              Package & Delivery Info
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Delivery Type */}
              <SelectField label="Delivery Type" name="deliveryType" value={formData.deliveryType} onChange={handleChange} onBlur={calculatePrice} options={["Normal", "ASR"]} />

              {/* Size */}
              <SelectField label="Parcel Size" name="parcelSize" value={formData.parcelSize} onChange={handleChange} onBlur={calculatePrice} options={["Small", "Medium", "Large"]} />

              {/* Weight */}
              <InputField label="Weight (kg)" name="weight" type="number" value={formData.weight} onChange={handleChange} onBlur={calculatePrice} />
            </div>

            <textarea
              name="deliveryNotes"
              rows="2"
              placeholder="Delivery notes (optional)"
              value={formData.deliveryNotes}
              onChange={handleChange}
              className="w-full mt-4 p-3 border rounded-xl focus:ring-2 focus:ring-[#ffb500] outline-none"
            ></textarea>
          </div>

          {/* ------------ SCHEDULING ------------ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Preferred Date (Optional)" type="date" name="scheduledDate" value={formData.scheduledDate} onChange={handleChange} />
            <SelectField
              label="Preferred Time Slot"
              name="scheduledTimeSlot"
              value={formData.scheduledTimeSlot}
              onChange={handleChange}
              options={["Morning (9-12)", "Afternoon (12-4)", "Evening (4-8)"]}
            />
          </div>

          {/* PRICE DISPLAY */}
          <div className="bg-[#fff4d0] p-4 border rounded-xl flex justify-between items-center">
            <span className="text-lg font-semibold text-[#351c15]">
              Estimated Price:
            </span>
            <span className="text-2xl font-bold text-green-700">
              ₹{formData.price}
            </span>
          </div>

          {/* SUBMIT */}
          <button className="w-full bg-[#ffb500] text-[#351c15] py-3 rounded-xl font-semibold hover:bg-[#e6a300] transition shadow">
            Confirm & Place Order
          </button>
        </form>
      </div>
    </div>
  );
}

function InputField({ label, name, value, onChange, type = "text", className = "", ...rest }) {
  return (
    <div className={className}>
      <label className="block mb-1 font-medium text-[#351c15]">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        {...rest}
        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#ffb500] outline-none"
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options = [], className = "", ...rest }) {
  return (
    <div className={className}>
      <label className="block mb-1 font-medium text-[#351c15]">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        {...rest}
        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#ffb500] outline-none"
      >
        <option value="">Select</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
