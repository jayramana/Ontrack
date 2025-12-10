import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

function PlaceOrder() {
    const [formData, setFormData] = useState({
        senderName: '',
        senderPhone: '',
        senderEmail: '',
        pickupAddress: '',
        pickupPincode: '',
        receiverName: '',
        receiverPhone: '',
        receiverEmail: '',
        receiverAddress: '',
        receiverPincode: '',
        deliveryPincode: '',
        deliveryType: 'Normal',
        parcelSize: 'Small',
        weight: '',
        deliveryNotes: '',
        scheduledDate: "",
        scheduledTimeSlot: '',
        price: 0
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const calculatePrice = () => {
        let weightPrice = parseFloat(formData.weight || 0) * 10;
        let sizePrice = formData.parcelSize === 'Large' ? 50 : formData.parcelSize === 'Medium' ? 30 : 10;
        let typePrice = formData.deliveryType === 'ASR' ? 100 : 0;
        setFormData({ ...formData, price: weightPrice + sizePrice + typePrice });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/orders', formData);
            alert('Order placed successfully!');
            navigate('/sender/dashboard');
        } catch (error) {
            console.error('Error placing order:', error);
            const errorMessage = error.response?.data?.message || error.response?.data?.innerException || error.message || 'Failed to place order.';
            alert(`Error: ${errorMessage}`);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Place New Order</h2>
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-md">

                {/* Sender Details */}
                <div className="border-b pb-4">
                    <h3 className="text-xl font-semibold mb-4 text-blue-600">Sender Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 font-medium">Sender Name</label>
                            <input type="text" name="senderName" value={formData.senderName} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Sender Phone</label>
                            <input type="text" name="senderPhone" value={formData.senderPhone} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Sender Email</label>
                            <input type="email" name="senderEmail" value={formData.senderEmail} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block mb-1 font-medium">Pickup Address</label>
                            <input type="text" name="pickupAddress" value={formData.pickupAddress} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Pickup Pincode</label>
                            <input type="text" name="pickupPincode" value={formData.pickupPincode} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" maxLength="6" placeholder="e.g., 600001" required />
                        </div>
                    </div>
                </div>

                {/* Receiver Details */}
                <div className="border-b pb-4">
                    <h3 className="text-xl font-semibold mb-4 text-blue-600">Receiver Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 font-medium">Receiver Name</label>
                            <input type="text" name="receiverName" value={formData.receiverName} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Receiver Phone</label>
                            <input type="text" name="receiverPhone" value={formData.receiverPhone} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Receiver Email (Optional)</label>
                            <input type="email" name="receiverEmail" value={formData.receiverEmail} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="For account linking" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block mb-1 font-medium">Receiver Address</label>
                            <input type="text" name="receiverAddress" value={formData.receiverAddress} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Receiver Pincode</label>
                            <input type="text" name="receiverPincode" value={formData.receiverPincode} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" maxLength="6" required />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Delivery Pincode</label>
                            <input type="text" name="deliveryPincode" value={formData.deliveryPincode} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" maxLength="6" placeholder="e.g., 629001" required />
                        </div>
                    </div>
                </div>

                {/* Package Details */}
                <div>
                    <h3 className="text-xl font-semibold mb-4 text-blue-600">Package & Delivery</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block mb-1 font-medium">Delivery Type</label>
                            <select name="deliveryType" value={formData.deliveryType} onChange={handleChange} onBlur={calculatePrice} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none">
                                <option value="Normal">Normal Delivery</option>
                                <option value="ASR">ASR (Adult Signature Required)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Parcel Size</label>
                            <select name="parcelSize" value={formData.parcelSize} onChange={handleChange} onBlur={calculatePrice} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none">
                                <option value="Small">Small</option>
                                <option value="Medium">Medium</option>
                                <option value="Large">Large</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Weight (kg)</label>
                            <input type="number" name="weight" value={formData.weight} onChange={handleChange} onBlur={calculatePrice} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="block mb-1 font-medium">Delivery Notes</label>
                        <textarea name="deliveryNotes" value={formData.deliveryNotes} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" rows="2"></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <label className="block mb-1 font-medium">Preferred Date (Optional)</label>
                            <input type="date" name="scheduledDate" value={formData.scheduledDate} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Preferred Time Slot (Optional)</label>
                            <select name="scheduledTimeSlot" value={formData.scheduledTimeSlot} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none">
                                <option value="">Any Time</option>
                                <option value="Morning">Morning (9am - 12pm)</option>
                                <option value="Afternoon">Afternoon (12pm - 4pm)</option>
                                <option value="Evening">Evening (4pm - 8pm)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-100 p-4 rounded-lg flex justify-between items-center">
                    <span className="text-lg font-semibold">Estimated Price:</span>
                    <span className="text-2xl font-bold text-green-600">${formData.price}</span>
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 shadow-lg">
                    Confirm & Place Order
                </button>
            </form>
        </div>
    );
}

export default PlaceOrder;
