// frontend/src/pages/driver/ReportRoadIssue.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import DriverSidebar from "./DriverSidebar";

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
    { value: "Low", style: "bg-green-100 text-green-800 border-green-300" },
    { value: "Medium", style: "bg-yellow-100 text-yellow-800 border-yellow-300" },
    { value: "High", style: "bg-orange-100 text-orange-800 border-orange-300" },
    { value: "Critical", style: "bg-red-100 text-red-800 border-red-300" },
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
      () => {
        setLocationError("Unable to get location. Enable location services.");
        setLocationLoading(false);
      }
    );
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.issueType) return alert("Select an issue type");
    if (!formData.description.trim()) return alert("Add a description");
    if (!formData.latitude || !formData.longitude)
      return alert("Location required");

    setLoading(true);

    try {
      await api.post("/roadissue/report", formData);

      setSuccessMessage("✅ Road issue reported successfully!");

      setFormData({
        ...formData,
        issueType: "",
        severity: "Medium",
        description: "",
      });

      setTimeout(() => navigate("/driver/dashboard"), 2000);
    } catch (err) {
      alert("❌ Failed to report issue.");
    } finally {
      setLoading(false);
    }
  };

  // UI-only change
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="min-h-screen flex bg-[#f7f3ef]">
      <DriverSidebar active="report-issue" />

      {/* MAIN PANEL */}
      <div className="flex-1">
        {/* UPS HEADER */}
        <header className="bg-[#fff8e7] border-b border-[#e6ddc5] shadow-sm">
          <div className="max-w-4xl mx-auto p-5 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#351c15]">
                Report Road Issue
              </h1>
              <p className="text-[#6f4e37] text-sm mt-1">
                Help admin optimize routes in real-time
              </p>
            </div>

            <button
              onClick={() => navigate("/driver/dashboard")}
              className="px-4 py-2 bg-[#f9b400] text-[#351c15] font-semibold rounded-lg border border-[#e6ddc5] hover:bg-[#dca600]"
            >
              ← Back
            </button>
          </div>
        </header>

        {/* BODY */}
        <div className="max-w-4xl mx-auto p-8">
          {successMessage && (
            <div className="bg-green-100 border border-green-400 p-4 mb-6 rounded-lg shadow-sm">
              <p className="text-green-800 font-semibold">{successMessage}</p>
              <p className="text-sm text-green-700">Redirecting…</p>
            </div>
          )}

          {/* MAIN FORM CARD */}
          <div className="bg-[#fff8e7] border border-[#e6ddc5] rounded-xl shadow p-8">
            <form onSubmit={handleSubmit}>
              {/* ISSUE TYPE */}
              <div className="mb-8">
                <label className="block text-[#351c15] font-semibold mb-3">
                  Issue Type <span className="text-red-500">*</span>
                </label>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {issueTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, issueType: type.value })
                      }
                      className={`p-4 rounded-xl border-2 transition text-left shadow-sm ${
                        formData.issueType === type.value
                          ? "border-[#f9b400] bg-[#f9b400]/20"
                          : "border-[#e6ddc5] bg-white hover:bg-[#fff8e7]"
                      }`}
                    >
                      <div className="text-2xl mb-2">{type.icon}</div>
                      <p className="font-medium text-[#351c15]">{type.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* SEVERITY */}
              <div className="mb-8">
                <label className="block text-[#351c15] font-semibold mb-3">
                  Severity <span className="text-red-500">*</span>
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
                          ? `${level.style} border-[#351c15]`
                          : "bg-white border-[#e6ddc5] hover:bg-[#fff8e7]"
                      }`}
                    >
                      {level.value}
                    </button>
                  ))}
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="mb-8">
                <label className="block text-[#351c15] font-semibold mb-2">
                  Description <span className="text-red-500">*</span>
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe the issue clearly..."
                  className="w-full px-4 py-3 border border-[#e6ddc5] rounded-lg bg-white focus:ring-2 focus:ring-[#f9b400]"
                />
              </div>

              {/* LOCATION */}
              <div className="mb-8">
                <label className="block text-[#351c15] font-semibold mb-2">
                  Location <span className="text-red-500">*</span>
                </label>

                <div className="bg-white border border-[#e6ddc5] rounded-lg p-4">
                  {locationLoading ? (
                    <p className="text-[#6f4e37]">Fetching location…</p>
                  ) : locationError ? (
                    <p className="text-red-600">{locationError}</p>
                  ) : (
                    <p className="text-green-700 font-medium">
                      Lat: {formData.latitude?.toFixed(6)} — Lng:{" "}
                      {formData.longitude?.toFixed(6)}
                    </p>
                  )}
                </div>
              </div>

              {/* DRIVER INFO */}
              <div className="mb-8 bg-[#fff3d4] border border-[#f9b400] rounded-lg p-4">
                <p className="text-sm text-[#351c15]">
                  <strong>Driver:</strong> {user?.name}
                </p>
                <p className="text-sm text-[#351c15]">
                  <strong>ID:</strong> {user?.userId}
                </p>
              </div>

              {/* BUTTONS */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading || !formData.latitude}
                  className={`flex-1 py-3 rounded-lg font-semibold transition shadow ${
                    loading || !formData.latitude
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-[#f9b400] text-[#351c15] border border-[#e6ddc5] hover:bg-[#dca600]"
                  }`}
                >
                  {loading ? "Submitting…" : "⚠️ Report Issue"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/driver/dashboard")}
                  className="px-6 py-3 bg-white border border-[#e6ddc5] text-[#351c15] rounded-lg font-semibold hover:bg-[#fff8e7]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* INFORMATION BOX */}
          <div className="mt-6 bg-[#fff3d4] border border-[#f9b400] rounded-lg p-5">
            <h3 className="font-semibold text-[#351c15] mb-2">
              ℹ️ Why report issues?
            </h3>
            <ul className="text-sm text-[#6f4e37] space-y-1">
              <li>• Helps admin re-optimize routes instantly</li>
              <li>• Improves delivery ETAs for all customers</li>
              <li>• Prevents drivers from entering blocked roads</li>
              <li>• Improves safety during navigation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportRoadIssue;
