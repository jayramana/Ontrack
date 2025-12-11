// frontend/src/pages/driver/ReportRoadIssue.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const ReportRoadIssue = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        issueType: "",
        severity: "Medium",
        description: "",
        latitude: null,
        longitude: null,
    });

    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const issueTypes = [
        { value: "Traffic", label: "🚦 Traffic Congestion", icon: "🚦" },
        { value: "Accident", label: "🚗 Accident", icon: "🚗" },
        { value: "RoadClosed", label: "🚧 Road Closed", icon: "🚧" },
        { value: "Flooding", label: "🌊 Flooding", icon: "🌊" },
        { value: "Construction", label: "👷 Construction", icon: "👷" },
        { value: "Other", label: "⚠️ Other", icon: "⚠️" },
    ];

    const severityLevels = [
        { value: "Low", color: "bg-green-100 text-green-800 border-green-300" },
        { value: "Medium", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
        { value: "High", color: "bg-orange-100 text-orange-800 border-orange-300" },
        { value: "Critical", color: "bg-red-100 text-red-800 border-red-300" },
    ];

    const getCurrentLocation = () => {
        setLocationLoading(true);
        setLocationError("");

        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser");
            setLocationLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData({
                    ...formData,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setLocationLoading(false);
            },
            (error) => {
                setLocationError("Unable to get location. Please enable location services.");
                setLocationLoading(false);
                console.error("Location error:", error);
            }
        );
    };

    useEffect(() => {
        getCurrentLocation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.issueType) {
            alert("Please select an issue type");
            return;
        }

        if (!formData.description.trim()) {
            alert("Please provide a description");
            return;
        }

        if (!formData.latitude || !formData.longitude) {
            alert("Location is required. Please enable location services.");
            return;
        }

        setLoading(true);

        try {
            await api.post("/roadissue/report", {
                issueType: formData.issueType,
                severity: formData.severity,
                description: formData.description,
                latitude: formData.latitude,
                longitude: formData.longitude,
            });

            setSuccessMessage("✅ Road issue reported successfully! Admin has been notified.");
            
            // Reset form
            setFormData({
                issueType: "",
                severity: "Medium",
                description: "",
                latitude: formData.latitude,
                longitude: formData.longitude,
            });

            // Redirect after 2 seconds
            setTimeout(() => {
                navigate("/driver/dashboard");
            }, 2000);
        } catch (error) {
            alert("❌ Failed to report issue. Please try again.");
            console.error("Error reporting issue:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-4xl mx-auto p-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Report Road Issue</h1>
                        <p className="text-gray-600 text-sm mt-1">
                            Help us improve route optimization
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/driver/dashboard")}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                        ← Back
                    </button>
                </div>
            </header>

            <div className="max-w-4xl mx-auto p-6">
                {successMessage && (
                    <div className="bg-green-100 border-l-4 border-green-500 p-4 mb-6 rounded shadow">
                        <p className="text-green-800 font-semibold">{successMessage}</p>
                        <p className="text-sm text-green-700 mt-1">
                            Redirecting to dashboard...
                        </p>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-lg p-6">
                    <form onSubmit={handleSubmit}>
                        {/* Issue Type Selection */}
                        <div className="mb-6">
                            <label className="block text-gray-700 font-semibold mb-3">
                                Issue Type <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {issueTypes.map((type) => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() =>
                                            setFormData({ ...formData, issueType: type.value })
                                        }
                                        className={`p-4 rounded-lg border-2 transition text-left ${
                                            formData.issueType === type.value
                                                ? "border-blue-500 bg-blue-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                    >
                                        <div className="text-2xl mb-1">{type.icon}</div>
                                        <div className="text-sm font-medium text-gray-800">
                                            {type.label}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Severity Level */}
                        <div className="mb-6">
                            <label className="block text-gray-700 font-semibold mb-3">
                                Severity Level <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {severityLevels.map((level) => (
                                    <button
                                        key={level.value}
                                        type="button"
                                        onClick={() =>
                                            setFormData({ ...formData, severity: level.value })
                                        }
                                        className={`p-3 rounded-lg border-2 font-medium transition ${
                                            formData.severity === level.value
                                                ? `${level.color} border-2`
                                                : "bg-white border-gray-200 hover:border-gray-300"
                                        }`}
                                    >
                                        {level.value}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <label
                                htmlFor="description"
                                className="block text-gray-700 font-semibold mb-2"
                            >
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Provide details about the road issue..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Include landmarks, road names, or any helpful details
                            </p>
                        </div>

                        {/* Location Info */}
                        <div className="mb-6">
                            <label className="block text-gray-700 font-semibold mb-2">
                                Location <span className="text-red-500">*</span>
                            </label>
                            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                                {locationLoading ? (
                                    <div className="flex items-center text-blue-600">
                                        <svg
                                            className="animate-spin h-5 w-5 mr-2"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        Getting your location...
                                    </div>
                                ) : locationError ? (
                                    <div>
                                        <p className="text-red-600 mb-2">⚠️ {locationError}</p>
                                        <button
                                            type="button"
                                            onClick={getCurrentLocation}
                                            className="text-blue-600 hover:underline text-sm"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                ) : formData.latitude && formData.longitude ? (
                                    <div>
                                        <p className="text-green-600 font-medium mb-2">
                                            ✅ Location captured
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Lat: {formData.latitude.toFixed(6)}, Lng:{" "}
                                            {formData.longitude.toFixed(6)}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={getCurrentLocation}
                                            className="text-blue-600 hover:underline text-sm mt-2"
                                        >
                                            Update Location
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={getCurrentLocation}
                                        className="text-blue-600 hover:underline"
                                    >
                                        Get Current Location
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Driver Info */}
                        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-gray-700">
                                <strong>Reported by:</strong> {user?.name}
                            </p>
                            <p className="text-sm text-gray-700">
                                <strong>Driver ID:</strong> {user?.userId}
                            </p>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={loading || !formData.latitude}
                                className={`flex-1 py-3 rounded-lg font-semibold transition ${
                                    loading || !formData.latitude
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-orange-600 hover:bg-orange-700 text-white"
                                }`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg
                                            className="animate-spin h-5 w-5 mr-2"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        Submitting...
                                    </span>
                                ) : (
                                    "⚠️ Report Issue"
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate("/driver/dashboard")}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>

                {/* Info Section */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Why report issues?</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Helps admin re-optimize routes in real-time</li>
                        <li>• Improves delivery efficiency for all drivers</li>
                        <li>• Ensures customer satisfaction with accurate ETAs</li>
                        <li>• Prevents other drivers from facing the same issue</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ReportRoadIssue;