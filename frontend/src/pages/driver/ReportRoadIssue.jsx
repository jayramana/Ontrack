// frontend/src/pages/driver/ReportRoadIssue.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import DriverSidebar from "./DriverSidebar";

export default function ReportRoadIssue() {
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
    { value: "Traffic", label: "Traffic", icon: "🚦" },
    { value: "Accident", label: "Accident", icon: "🚗" },
    { value: "RoadClosed", label: "Road Closed", icon: "🚧" },
    { value: "Flooding", label: "Flooding", icon: "🌊" },
    { value: "Construction", label: "Construction", icon: "👷" },
    { value: "Other", label: "Other", icon: "⚠️" },
  ];

  const severityLevels = [
    { value: "Low", color: "bg-green-500/20 text-green-400" },
    { value: "Medium", color: "bg-yellow-500/20 text-yellow-400" },
    { value: "High", color: "bg-orange-500/20 text-orange-400" },
    { value: "Critical", color: "bg-red-500/20 text-red-400" },
  ];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setLocationLoading(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }));
        setLocationLoading(false);
      },
      () => {
        setLocationError("Enable location services");
        setLocationLoading(false);
      }
    );
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.issueType) return alert("Select issue type");
    if (!formData.description.trim()) return alert("Add description");
    if (!formData.latitude || !formData.longitude)
      return alert("Location required");

    setLoading(true);

    try {
      await api.post("/roadissue/report", formData);
      setSuccessMessage("Road issue reported successfully");
      setTimeout(() => navigate("/driver/dashboard"), 2000);
    } catch {
      alert("Failed to report issue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0b0f14] text-slate-100">
      <DriverSidebar active="report-issue" />

      {/* MAIN AREA */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-10">

          {/* HEADER */}
          <div className="mb-10">
            <h1 className="text-3xl font-black tracking-tight">
              Report Road Issue
            </h1>
            <p className="text-slate-400 mt-1">
              Help optimize routes in real time
            </p>
          </div>

          {/* SUCCESS */}
          {successMessage && (
            <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-green-400">
              {successMessage}
            </div>
          )}

          {/* FORM CARD */}
          <div className="bg-gradient-to-br from-[#1a1f29] to-[#0f141c]
            border border-white/10 rounded-3xl p-8 backdrop-blur-xl">

            <form onSubmit={handleSubmit} className="space-y-8">

              {/* ISSUE TYPE */}
              <div>
                <label className="block mb-3 font-semibold text-slate-300">
                  Issue Type
                </label>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {issueTypes.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, issueType: t.value })
                      }
                      className={`p-4 rounded-xl border transition text-left
                        ${
                          formData.issueType === t.value
                            ? "border-[#ff8a3d] bg-[#ff8a3d]/10"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                    >
                      <div className="text-2xl mb-1">{t.icon}</div>
                      <p className="font-medium">{t.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* SEVERITY */}
              <div>
                <label className="block mb-3 font-semibold text-slate-300">
                  Severity
                </label>

                <div className="flex flex-wrap gap-3">
                  {severityLevels.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, severity: s.value })
                      }
                      className={`px-4 py-2 rounded-full text-sm font-semibold border transition
                        ${
                          formData.severity === s.value
                            ? `${s.color} border-white/20`
                            : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                        }`}
                    >
                      {s.value}
                    </button>
                  ))}
                </div>
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="block mb-2 font-semibold text-slate-300">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe the issue clearly..."
                  className="w-full rounded-xl bg-white/5 border border-white/10
                    px-4 py-3 text-slate-100 placeholder-slate-500
                    focus:outline-none focus:ring-2 focus:ring-[#ff8a3d]"
                />
              </div>

              {/* LOCATION */}
              <div>
                <label className="block mb-2 font-semibold text-slate-300">
                  Location
                </label>

                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  {locationLoading ? (
                    <p className="text-slate-400">Fetching location…</p>
                  ) : locationError ? (
                    <p className="text-red-400">{locationError}</p>
                  ) : (
                    <p className="text-green-400 font-medium">
                      Lat: {formData.latitude?.toFixed(5)} • Lng:{" "}
                      {formData.longitude?.toFixed(5)}
                    </p>
                  )}
                </div>
              </div>

              {/* DRIVER INFO */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm">
                <p>
                  <span className="text-slate-400">Driver:</span>{" "}
                  <span className="font-semibold">{user?.name}</span>
                </p>
                <p>
                  <span className="text-slate-400">ID:</span>{" "}
                  <span className="font-semibold">{user?.userId}</span>
                </p>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 py-3 rounded-xl font-bold transition
                    ${
                      loading
                        ? "bg-white/10 text-slate-500 cursor-not-allowed"
                        : "bg-[#ff8a3d] text-black hover:opacity-90"
                    }`}
                >
                  {loading ? "Submitting…" : "Report Issue"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/driver/dashboard")}
                  className="px-6 py-3 rounded-xl border border-white/10
                    bg-white/5 hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* INFO */}
          <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="font-semibold mb-2 text-[#ff8a3d]">
              Why report issues?
            </h3>
            <ul className="text-sm text-slate-400 space-y-1">
              <li>• Improves ETA accuracy</li>
              <li>• Helps reroute drivers instantly</li>
              <li>• Prevents blocked road entry</li>
              <li>• Enhances delivery safety</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
