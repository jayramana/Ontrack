// // import { useState } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import api from '../../services/api';

// // function PlaceOrder() {
// //     const [formData, setFormData] = useState({
// //         senderName: '',
// //         senderPhone: '',
// //         senderEmail: '',
// //         pickupAddress: '',
// //         pickupPincode: '',
// //         receiverName: '',
// //         receiverPhone: '',
// //         receiverEmail: '',
// //         receiverAddress: '',
// //         receiverPincode: '',
// //         deliveryPincode: '',
// //         deliveryType: 'Normal',
// //         parcelSize: 'Small',
// //         weight: '',
// //         deliveryNotes: '',
// //         scheduledDate: '',
// //         scheduledTimeSlot: '',
// //         price: 0
// //     });
// //     const navigate = useNavigate();

// //     const handleChange = (e) => {
// //         const { name, value } = e.target;
// //         setFormData({ ...formData, [name]: value });
// //     };

// //     const calculatePrice = () => {
// //         let weightPrice = parseFloat(formData.weight || 0) * 10;
// //         let sizePrice = formData.parcelSize === 'Large' ? 50 : formData.parcelSize === 'Medium' ? 30 : 10;
// //         let typePrice = formData.deliveryType === 'ASR' ? 100 : 0;
// //         setFormData({ ...formData, price: weightPrice + sizePrice + typePrice });
// //     };

// //     const handleSubmit = async (e) => {
// //         e.preventDefault();
// //         try {
// //             await api.post('/orders', formData);
// //             alert('Order placed successfully!');
// //             navigate('/sender/dashboard');
// //         } catch (error) {
// //             console.error('Error placing order:', error);
// //             const errorMessage = error.response?.data?.message || error.response?.data?.innerException || error.message || 'Failed to place order.';
// //             alert(`Error: ${errorMessage}`);
// //         }
// //     };

// //     return (
// //         <div className="p-6 max-w-4xl mx-auto">
// //             <h2 className="text-3xl font-bold mb-6 text-gray-800">Place New Order</h2>
// //             <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-md">

// //                 {/* Sender Details */}
// //                 <div className="border-b pb-4">
// //                     <h3 className="text-xl font-semibold mb-4 text-blue-600">Sender Details</h3>
// //                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                         <div>
// //                             <label className="block mb-1 font-medium">Sender Name</label>
// //                             <input type="text" name="senderName" value={formData.senderName} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
// //                         </div>
// //                         <div>
// //                             <label className="block mb-1 font-medium">Sender Phone</label>
// //                             <input type="text" name="senderPhone" value={formData.senderPhone} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
// //                         </div>
// //                         <div>
// //                             <label className="block mb-1 font-medium">Sender Email</label>
// //                             <input type="email" name="senderEmail" value={formData.senderEmail} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
// //                         </div>
// //                         <div className="md:col-span-2">
// //                             <label className="block mb-1 font-medium">Pickup Address</label>
// //                             <input type="text" name="pickupAddress" value={formData.pickupAddress} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
// //                         </div>
// //                         <div>
// //                             <label className="block mb-1 font-medium">Pickup Pincode</label>
// //                             <input type="text" name="pickupPincode" value={formData.pickupPincode} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" maxLength="6" placeholder="e.g., 600001" required />
// //                         </div>
// //                     </div>
// //                 </div>

// //                 {/* Receiver Details */}
// //                 <div className="border-b pb-4">
// //                     <h3 className="text-xl font-semibold mb-4 text-blue-600">Receiver Details</h3>
// //                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                         <div>
// //                             <label className="block mb-1 font-medium">Receiver Name</label>
// //                             <input type="text" name="receiverName" value={formData.receiverName} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
// //                         </div>
// //                         <div>
// //                             <label className="block mb-1 font-medium">Receiver Phone</label>
// //                             <input type="text" name="receiverPhone" value={formData.receiverPhone} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
// //                         </div>
// //                         <div>
// //                             <label className="block mb-1 font-medium">Receiver Email (Optional)</label>
// //                             <input type="email" name="receiverEmail" value={formData.receiverEmail} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="For account linking" />
// //                         </div>
// //                         <div className="md:col-span-2">
// //                             <label className="block mb-1 font-medium">Receiver Address</label>
// //                             <input type="text" name="receiverAddress" value={formData.receiverAddress} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
// //                         </div>
// //                         <div>
// //                             <label className="block mb-1 font-medium">Receiver Pincode</label>
// //                             <input type="text" name="receiverPincode" value={formData.receiverPincode} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" maxLength="6" required />
// //                         </div>
// //                         <div>
// //                             <label className="block mb-1 font-medium">Delivery Pincode</label>
// //                             <input type="text" name="deliveryPincode" value={formData.deliveryPincode} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" maxLength="6" placeholder="e.g., 629001" required />
// //                         </div>
// //                     </div>
// //                 </div>

// //                 {/* Package Details */}
// //                 <div>
// //                     <h3 className="text-xl font-semibold mb-4 text-blue-600">Package & Delivery</h3>
// //                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //                         <div>
// //                             <label className="block mb-1 font-medium">Delivery Type</label>
// //                             <select name="deliveryType" value={formData.deliveryType} onChange={handleChange} onBlur={calculatePrice} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none">
// //                                 <option value="Normal">Normal Delivery</option>
// //                                 <option value="ASR">ASR (Adult Signature Required)</option>
// //                             </select>
// //                         </div>
// //                         <div>
// //                             <label className="block mb-1 font-medium">Parcel Size</label>
// //                             <select name="parcelSize" value={formData.parcelSize} onChange={handleChange} onBlur={calculatePrice} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none">
// //                                 <option value="Small">Small</option>
// //                                 <option value="Medium">Medium</option>
// //                                 <option value="Large">Large</option>
// //                             </select>
// //                         </div>
// //                         <div>
// //                             <label className="block mb-1 font-medium">Weight (kg)</label>
// //                             <input type="number" name="weight" value={formData.weight} onChange={handleChange} onBlur={calculatePrice} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
// //                         </div>
// //                     </div>
// //                     <div className="mt-4">
// //                         <label className="block mb-1 font-medium">Delivery Notes</label>
// //                         <textarea name="deliveryNotes" value={formData.deliveryNotes} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" rows="2"></textarea>
// //                     </div>
// //                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
// //                         <div>
// //                             <label className="block mb-1 font-medium">Preferred Date (Optional)</label>
// //                             <input type="date" name="scheduledDate" value={formData.scheduledDate} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" />
// //                         </div>
// //                         <div>
// //                             <label className="block mb-1 font-medium">Preferred Time Slot (Optional)</label>
// //                             <select name="scheduledTimeSlot" value={formData.scheduledTimeSlot} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none">
// //                                 <option value="">Any Time</option>
// //                                 <option value="Morning">Morning (9am - 12pm)</option>
// //                                 <option value="Afternoon">Afternoon (12pm - 4pm)</option>
// //                                 <option value="Evening">Evening (4pm - 8pm)</option>
// //                             </select>
// //                         </div>
// //                     </div>
// //                 </div>

// //                 <div className="bg-gray-100 p-4 rounded-lg flex justify-between items-center">
// //                     <span className="text-lg font-semibold">Estimated Price:</span>
// //                     <span className="text-2xl font-bold text-green-600">${formData.price}</span>
// //                 </div>

// //                 <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 shadow-lg">
// //                     Confirm & Place Order
// //                 </button>
// //             </form>
// //         </div>
// //     );
// // }

// // export default PlaceOrder;


// // frontend/src/pages/sender/PlaceOrder.jsx
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../../services/api";
// import MapPicker from "../../components/MapPicker";

// function PlaceOrder() {
//   const [formData, setFormData] = useState({
//     senderName: "",
//     senderPhone: "",
//     senderEmail: "",
//     pickupAddress: "",
//     pickupPincode: "",
//     pickupLatitude: null,
//     pickupLongitude: null,
//     receiverName: "",
//     receiverPhone: "",
//     receiverEmail: "",
//     receiverAddress: "",
//     receiverPincode: "",
//     deliveryLatitude: null,
//     deliveryLongitude: null,
//     deliveryPincode: "",
//     deliveryType: "Normal",
//     parcelSize: "Small",
//     weight: "",
//     deliveryNotes: "",
//     scheduledDate: "",
//     scheduledTimeSlot: "",
//     price: 0,
//   });

//   const [showPickupPicker, setShowPickupPicker] = useState(false);
//   const [showDeliveryPicker, setShowDeliveryPicker] = useState(false);
//   const [submitting, setSubmitting] = useState(false);

//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((s) => ({ ...s, [name]: value }));
//   };

//   const handleMapPick = (type, { lat, lng, display_name, postcode }) => {
//     if (type === "pickup") {
//       setFormData((s) => ({
//         ...s,
//         pickupLatitude: lat,
//         pickupLongitude: lng,
//         pickupAddress: display_name || s.pickupAddress,
//         pickupPincode: postcode || s.pickupPincode,
//       }));
//       setShowPickupPicker(false);
//     } else {
//       setFormData((s) => ({
//         ...s,
//         deliveryLatitude: lat,
//         deliveryLongitude: lng,
//         receiverAddress: display_name || s.receiverAddress,
//         deliveryPincode: postcode || s.deliveryPincode,
//       }));
//       setShowDeliveryPicker(false);
//     }
//   };

//   const calculatePrice = () => {
//     let weightPrice = parseFloat(formData.weight || 0) * 10;
//     let sizePrice =
//       formData.parcelSize === "Large"
//         ? 50
//         : formData.parcelSize === "Medium"
//         ? 30
//         : 10;
//     let typePrice = formData.deliveryType === "ASR" ? 100 : 0;
//     setFormData((s) => ({ ...s, price: weightPrice + sizePrice + typePrice }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);
//     try {
//       // Prepare payload: include coordinates only if available (null -> omitted)
//       const payload = {
//         senderName: formData.senderName,
//         senderPhone: formData.senderPhone,
//         senderEmail: formData.senderEmail,
//         pickupAddress: formData.pickupAddress,
//         pickupPincode: formData.pickupPincode,
//         // If null, let backend geocode from address
//         pickupLatitude: formData.pickupLatitude,
//         pickupLongitude: formData.pickupLongitude,

//         receiverName: formData.receiverName,
//         receiverPhone: formData.receiverPhone,
//         receiverEmail: formData.receiverEmail,
//         receiverAddress: formData.receiverAddress,
//         receiverPincode: formData.deliveryPincode || formData.receiverPincode,
//         deliveryLatitude: formData.deliveryLatitude,
//         deliveryLongitude: formData.deliveryLongitude,

//         deliveryType: formData.deliveryType,
//         parcelSize: formData.parcelSize,
//         weight: parseFloat(formData.weight || 0),
//         deliveryNotes: formData.deliveryNotes,
//         scheduledDate: formData.scheduledDate || null,
//         scheduledTimeSlot: formData.scheduledTimeSlot || null,
//         price: formData.price,
//       };

//       // Send to server
//       await api.post("/orders", payload);
//       alert("Order placed successfully!");
//       navigate("/sender/dashboard");
//     } catch (error) {
//       console.error("Error placing order:", error);
//       const errorMessage =
//         error.response?.data?.message ||
//         error.response?.data?.innerException ||
//         error.message ||
//         "Failed to place order.";
//       alert(`Error: ${errorMessage}`);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="p-6 max-w-4xl mx-auto">
//       <h2 className="text-3xl font-bold mb-6 text-gray-800">Place New Order</h2>

//       <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-md">
//         {/* Sender */}
//         <div className="border-b pb-4">
//           <h3 className="text-xl font-semibold mb-4 text-blue-600">Sender Details</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <input name="senderName" value={formData.senderName} onChange={handleChange} placeholder="Sender Name" required className="p-2 border rounded" />
//             <input name="senderPhone" value={formData.senderPhone} onChange={handleChange} placeholder="Sender Phone" required className="p-2 border rounded" />
//             <input name="senderEmail" value={formData.senderEmail} onChange={handleChange} placeholder="Sender Email" type="email" className="p-2 border rounded" />
//             <div className="md:col-span-2">
//               <label className="block mb-1 font-medium">Pickup Address</label>
//               <div className="flex gap-2">
//                 <input name="pickupAddress" value={formData.pickupAddress} onChange={handleChange} placeholder="Street, area, etc." className="flex-1 p-2 border rounded" />
//                 <button type="button" onClick={() => setShowPickupPicker(true)} className="px-3 py-2 bg-blue-600 text-white rounded">Pick on map</button>
//               </div>
//               <div className="mt-2 grid grid-cols-2 gap-2">
//                 <input name="pickupPincode" value={formData.pickupPincode} onChange={handleChange} placeholder="Pincode" className="p-2 border rounded" />
//                 <div className="p-2 border rounded">
//                   <div className="text-xs text-gray-500">Lat</div>
//                   <div>{formData.pickupLatitude ? formData.pickupLatitude.toFixed(6) : "—"}</div>
//                 </div>
//                 <div className="p-2 border rounded">
//                   <div className="text-xs text-gray-500">Lng</div>
//                   <div>{formData.pickupLongitude ? formData.pickupLongitude.toFixed(6) : "—"}</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Receiver */}
//         <div className="border-b pb-4">
//           <h3 className="text-xl font-semibold mb-4 text-blue-600">Receiver Details</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <input name="receiverName" value={formData.receiverName} onChange={handleChange} placeholder="Receiver Name" required className="p-2 border rounded" />
//             <input name="receiverPhone" value={formData.receiverPhone} onChange={handleChange} placeholder="Receiver Phone" required className="p-2 border rounded" />
//             <input name="receiverEmail" value={formData.receiverEmail} onChange={handleChange} placeholder="Receiver Email (optional)" className="p-2 border rounded" />
//             <div className="md:col-span-2">
//               <label className="block mb-1 font-medium">Receiver Address</label>
//               <div className="flex gap-2">
//                 <input name="receiverAddress" value={formData.receiverAddress} onChange={handleChange} placeholder="Delivery address" className="flex-1 p-2 border rounded" />
//                 <button type="button" onClick={() => setShowDeliveryPicker(true)} className="px-3 py-2 bg-blue-600 text-white rounded">Pick on map</button>
//               </div>
//               <div className="mt-2 grid grid-cols-2 gap-2">
//                 <input name="receiverPincode" value={formData.receiverPincode} onChange={handleChange} placeholder="Pincode" className="p-2 border rounded" />
//                 <div className="p-2 border rounded">
//                   <div className="text-xs text-gray-500">Lat</div>
//                   <div>{formData.deliveryLatitude ? formData.deliveryLatitude.toFixed(6) : "—"}</div>
//                 </div>
//                 <div className="p-2 border rounded">
//                   <div className="text-xs text-gray-500">Lng</div>
//                   <div>{formData.deliveryLongitude ? formData.deliveryLongitude.toFixed(6) : "—"}</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Package */}
//         <div>
//           <h3 className="text-xl font-semibold mb-4 text-blue-600">Package & Delivery</h3>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <select name="deliveryType" value={formData.deliveryType} onChange={handleChange} className="p-2 border rounded">
//               <option value="Normal">Normal</option>
//               <option value="ASR">ASR</option>
//             </select>
//             <select name="parcelSize" value={formData.parcelSize} onChange={handleChange} className="p-2 border rounded">
//               <option value="Small">Small</option>
//               <option value="Medium">Medium</option>
//               <option value="Large">Large</option>
//             </select>
//             <input name="weight" value={formData.weight} onChange={handleChange} onBlur={calculatePrice} placeholder="Weight (kg)" type="number" className="p-2 border rounded" />
//           </div>

//           <div className="mt-4">
//             <textarea name="deliveryNotes" value={formData.deliveryNotes} onChange={handleChange} placeholder="Delivery notes" className="w-full p-2 border rounded" rows="2" />
//           </div>
//         </div>

//         <div className="bg-gray-100 p-4 rounded-lg flex justify-between items-center">
//           <span className="text-lg font-semibold">Estimated Price:</span>
//           <span className="text-2xl font-bold text-green-600">${formData.price}</span>
//         </div>

//         <button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
//           {submitting ? "Placing order..." : "Confirm & Place Order"}
//         </button>
//       </form>

//       {/* Map pickers as modal-like components */}
//       {showPickupPicker && (
//         <MapPicker
//           initialPosition={formData.pickupLatitude && formData.pickupLongitude ? [formData.pickupLatitude, formData.pickupLongitude] : null}
//           onCancel={() => setShowPickupPicker(false)}
//           onSelect={(payload) => handleMapPick("pickup", payload)}
//           title="Pick Pickup Location"
//         />
//       )}

//       {showDeliveryPicker && (
//         <MapPicker
//           initialPosition={formData.deliveryLatitude && formData.deliveryLongitude ? [formData.deliveryLatitude, formData.deliveryLongitude] : null}
//           onCancel={() => setShowDeliveryPicker(false)}
//           onSelect={(payload) => handleMapPick("delivery", payload)}
//           title="Pick Delivery Location"
//         />
//       )}
//     </div>
//   );
// }

// export default PlaceOrder;

// frontend/src/pages/sender/PlaceOrder.jsx
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
  });

  const [showPickupPicker, setShowPickupPicker] = useState(false);
  const [showDeliveryPicker, setShowDeliveryPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
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
    let typePrice = formData.deliveryType === "ASR" ? 100 : 0;
    setFormData((s) => ({ ...s, price: weightPrice + sizePrice + typePrice }));
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
      };

      // Send to server
      await api.post("/orders", payload);
      alert("Order placed successfully!");
      navigate("/sender/dashboard");
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
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Place New Order</h2>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-md">
        {/* Sender */}
        <div className="border-b pb-4">
          <h3 className="text-xl font-semibold mb-4 text-blue-600">Sender Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="senderName" value={formData.senderName} onChange={handleChange} placeholder="Sender Name" required className="p-2 border rounded" />
            <input name="senderPhone" value={formData.senderPhone} onChange={handleChange} placeholder="Sender Phone" required className="p-2 border rounded" />
            <input name="senderEmail" value={formData.senderEmail} onChange={handleChange} placeholder="Sender Email" type="email" className="p-2 border rounded" />
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Pickup Address</label>
              <div className="flex gap-2">
                <input name="pickupAddress" value={formData.pickupAddress} onChange={handleChange} placeholder="Street, area, etc." className="flex-1 p-2 border rounded" />
                <button type="button" onClick={() => setShowPickupPicker(true)} className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Pick on map</button>
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
          <h3 className="text-xl font-semibold mb-4 text-blue-600">Receiver Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="receiverName" value={formData.receiverName} onChange={handleChange} placeholder="Receiver Name" required className="p-2 border rounded" />
            <input name="receiverPhone" value={formData.receiverPhone} onChange={handleChange} placeholder="Receiver Phone" required className="p-2 border rounded" />
            <input name="receiverEmail" value={formData.receiverEmail} onChange={handleChange} placeholder="Receiver Email (optional)" className="p-2 border rounded" />
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Receiver Address</label>
              <div className="flex gap-2">
                <input name="receiverAddress" value={formData.receiverAddress} onChange={handleChange} placeholder="Delivery address" className="flex-1 p-2 border rounded" />
                <button type="button" onClick={() => setShowDeliveryPicker(true)} className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Pick on map</button>
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
          <h3 className="text-xl font-semibold mb-4 text-blue-600">Package & Delivery</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select name="deliveryType" value={formData.deliveryType} onChange={handleChange} className="p-2 border rounded">
              <option value="Normal">Normal</option>
              <option value="ASR">ASR</option>
            </select>
            <select name="parcelSize" value={formData.parcelSize} onChange={handleChange} className="p-2 border rounded">
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
            </select>
            <input name="weight" value={formData.weight} onChange={handleChange} onBlur={calculatePrice} placeholder="Weight (kg)" type="number" className="p-2 border rounded" />
          </div>

          <div className="mt-4">
            <textarea name="deliveryNotes" value={formData.deliveryNotes} onChange={handleChange} placeholder="Delivery notes" className="w-full p-2 border rounded" rows="2" />
          </div>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg flex justify-between items-center">
          <span className="text-lg font-semibold">Estimated Price:</span>
          <span className="text-2xl font-bold text-green-600">${formData.price}</span>
        </div>

        <button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
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