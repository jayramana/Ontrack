import { useState } from 'react';
import api from '../services/api';

const PricingCalculator = ({ onPriceCalculated }) => {
    const [formData, setFormData] = useState({
        pickupRegion: 'All India',
        deliveryRegion: 'All India',
        distance: '',
        weight: '',
        deliveryType: 'Normal',
        isInternational: false
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleCalculate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/pricing/calculate', {
                ...formData,
                distance: parseFloat(formData.distance),
                weight: parseFloat(formData.weight)
            });
            setResult(res.data);
            if (onPriceCalculated) {
                onPriceCalculated(res.data.totalPrice);
            }
        } catch (error) {
            alert('Error calculating price: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold text-indigo-900 mb-4">💰 Pricing Calculator</h3>

            <form onSubmit={handleCalculate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={formData.distance}
                            onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g., 350"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={formData.weight}
                            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g., 10"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Region</label>
                        <select
                            value={formData.pickupRegion}
                            onChange={(e) => setFormData({ ...formData, pickupRegion: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                        >
                            <option>All India</option>
                            <option>Tamil Nadu</option>
                            <option>Karnataka</option>
                            <option>Maharashtra</option>
                            <option>Delhi</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Region</label>
                        <select
                            value={formData.deliveryRegion}
                            onChange={(e) => setFormData({ ...formData, deliveryRegion: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                        >
                            <option>All India</option>
                            <option>Tamil Nadu</option>
                            <option>Karnataka</option>
                            <option>Maharashtra</option>
                            <option>Delhi</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Type</label>
                        <select
                            value={formData.deliveryType}
                            onChange={(e) => setFormData({ ...formData, deliveryType: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                        >
                            <option>Normal</option>
                            <option>ASR</option>
                            <option>Express</option>
                        </select>
                    </div>
                    <div className="flex items-center pt-6">
                        <input
                            type="checkbox"
                            checked={formData.isInternational}
                            onChange={(e) => setFormData({ ...formData, isInternational: e.target.checked })}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm font-medium text-gray-700">International Shipping</label>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 transition"
                >
                    {loading ? 'Calculating...' : '🧮 Calculate Price'}
                </button>
            </form>

            {result && (
                <div className="mt-6 bg-white p-4 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-lg font-semibold text-gray-700">Total Price:</span>
                        <span className="text-3xl font-bold text-indigo-600">₹{result.totalPrice.toFixed(2)}</span>
                    </div>

                    <div className="border-t pt-3 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Base Price:</span>
                            <span className="font-medium">₹{result.breakdown.basePrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Distance Charge:</span>
                            <span className="font-medium">₹{result.breakdown.distanceCharge.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Weight Charge:</span>
                            <span className="font-medium">₹{result.breakdown.weightCharge.toFixed(2)}</span>
                        </div>
                        {result.breakdown.surcharge > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Surcharge ({formData.deliveryType}):</span>
                                <span className="font-medium">₹{result.breakdown.surcharge.toFixed(2)}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PricingCalculator;
