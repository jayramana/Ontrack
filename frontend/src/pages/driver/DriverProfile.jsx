import React, { useState, useEffect } from "react";
import DriverSidebar from "./DriverSidebar";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

export default function DriverProfile() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= TRACKING STATE ================= */
  const [isTracking, setIsTracking] = useState(
    () => localStorage.getItem("driver_tracking_enabled") === "true"
  );

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/profile");
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch driver profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  /* ================= LOCATION TRACKING ================= */
  // Sync local state with backend profile when loaded
  useEffect(() => {
    if (profile) {
      // If backend says sharing=true, we are tracking.
      setIsTracking(profile.isSharingLocation);
    }
  }, [profile]);

  useEffect(() => {
    let intervalId;

    const sendLocationUpdate = async (position) => {
      try {
        const { latitude, longitude, speed, heading } = position.coords;
        await api.post("/driver/location", {
          latitude,
          longitude,
          speed: speed || 0,
          heading: heading || 0,
        });
      } catch (err) {
        console.error("Location update failed", err);
      }
    };

    const handleError = (err) => {
      console.error("Geolocation error:", err);
    };

    if (isTracking) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(sendLocationUpdate, handleError);
        intervalId = setInterval(() => {
          navigator.geolocation.getCurrentPosition(sendLocationUpdate, handleError);
        }, 30000);
      } else {
        alert("Geolocation not supported");
        setIsTracking(false);
      }
    }

    localStorage.setItem("driver_tracking_enabled", isTracking);
    return () => intervalId && clearInterval(intervalId);
  }, [isTracking]);

  const toggleTracking = async () => {
    const newState = !isTracking;
    
    // Optimistic update
    setIsTracking(newState);

    try {
      await api.post("/driver/tracking-status", { isSharing: newState });
    } catch (error) {
      console.error("Failed to update tracking status:", error);
      // Revert on failure
      setIsTracking(!newState);
      alert("Failed to update tracking status. Please try again.");
    }
  };

  /* ================= LOADING / ERROR ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex bg-[#0b0f14] text-slate-400">
        <DriverSidebar active="profile" />
        <div className="flex-1 flex items-center justify-center animate-pulse">
          Loading profile…
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex bg-[#0b0f14] text-slate-400">
        <DriverSidebar active="profile" />
        <div className="flex-1 flex items-center justify-center text-red-400">
          Failed to load profile
        </div>
      </div>
    );
  }

  const fullName = `${profile.firstName} ${profile.lastName}`;
  const displayRole = profile.role?.toUpperCase() || "DRIVER";

  /* ================= UI HELPERS (same as customer) ================= */
  const InfoCard = ({ title, description, children }) => (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {description && (
          <p className="text-sm text-slate-400 mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );

  const Field = ({ label, value, isAddress = false }) => (
    <div>
      <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">
        {label}
      </p>
      <div
        className={`text-slate-100 font-medium ${
          isAddress ? "whitespace-pre-line" : ""
        }`}
      >
        {value || <span className="text-slate-500 italic">Not set</span>}
      </div>
    </div>
  );

  /* ================= UI ================= */
  return (
    <div className="min-h-screen flex bg-[#0b0f14] text-slate-100">
      <DriverSidebar active="profile" />

      <div className="flex-1 px-10 py-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-12">

          {/* PAGE TITLE */}
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">
              Profile
            </h1>
            <p className="text-slate-400 mt-1">
              Manage your driver information & live tracking
            </p>
          </div>

          {/* ================= IDENTITY + TRACKING (IMPORTANT) ================= */}
          <section className="relative bg-gradient-to-br from-[#1a1f29] to-[#0f141c] rounded-3xl p-8 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ff8a3d22,transparent_60%)]" />

            <div className="relative flex flex-col sm:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-white/10 border border-white/20
                flex items-center justify-center text-3xl font-black text-white">
                {profile.firstName[0]}
                {profile.lastName[0]}
              </div>

              {/* Identity */}
              <div className="flex-1">
                <h2 className="text-3xl font-black">{fullName}</h2>
                <p className="text-slate-400 mt-1">{displayRole}</p>

                {/* TRACKING STATUS */}
                <div className="mt-4 flex items-center gap-4">
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold
                      ${isTracking
                        ? "bg-green-500/10 text-green-400"
                        : "bg-red-500/10 text-red-400"}`}
                  >
                    ● {isTracking ? "Live Tracking ON" : "Tracking OFF"}
                  </div>

                  {/* TOGGLE */}
                  <button
                    onClick={toggleTracking}
                    className={`relative w-14 h-8 rounded-full transition
                      ${isTracking ? "bg-[#ff8a3d]" : "bg-white/20"}`}
                  >
                    <span
                      className={`absolute top-1 h-6 w-6 rounded-full bg-black transition
                        ${isTracking ? "left-7" : "left-1"}`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ================= INFO GRID ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            <InfoCard
              title="Contact Details"
              description="Used for delivery updates"
            >
              <Field label="Email" value={profile.email} />
              <Field label="Phone" value={profile.phone} />
            </InfoCard>

            <InfoCard
              title="Account Information"
              description="Driver role & status"
            >
              <Field label="Role" value={displayRole} />
              <Field label="Status" value="Active" />
            </InfoCard>

          </div>

          {/* ================= ADDRESS ================= */}
          <InfoCard
            title="Home Address"
            description="Registered residence"
          >
            <Field
              label="Street Address"
              value={`${profile.addressLine1 || ""}${
                profile.addressLine2 ? "\n" + profile.addressLine2 : ""
              }`}
              isAddress
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
              <Field label="City" value={profile.city} />
              <Field label="Postal Code" value={profile.postalCode} />
              <Field label="State" value={profile.state} />
              <Field label="Country" value={profile.country} />
            </div>
          </InfoCard>

          {/* ================= DANGER ZONE ================= */}
          <div className="pt-6 border-t border-white/10">
            <button
              onClick={logout}
              className="px-6 py-3 rounded-xl
                bg-red-500/10 border border-red-500/30
                text-red-400 font-bold
                hover:bg-red-500/20 hover:text-red-300 transition"
            >
              Log Out
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
