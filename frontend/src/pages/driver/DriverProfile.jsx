import React, { useState, useEffect } from "react";
import DriverSidebar from "./DriverSidebar";
import api from "../../services/api";

export default function DriverProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // TRACKING STATE
  // Initialize from localStorage if available, else default to false
  const [isTracking, setIsTracking] = useState(() => {
    return localStorage.getItem("driver_tracking_enabled") === "true";
  });

  // Fetch profile on mount
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

  // LOCATION TRACKING LOGIC
  useEffect(() => {
    let intervalId;

    const sendLocationUpdate = async (position) => {
        try {
            const { latitude, longitude, speed, heading } = position.coords;
            await api.post("/driver/location", {
                latitude,
                longitude,
                speed: speed || 0, // Speed in m/s (convert to km/h if needed by backend, assuming backend takes raw or handles it)
                heading: heading || 0
            });
            console.log("📍 Location updated:", latitude, longitude);
        } catch (error) {
            console.error("Failed to send location update:", error);
        }
    };

    const handleError = (error) => {
        console.error("Geolocation error:", error);
        // Optionally disable tracking on critical errors
    };

    if (isTracking) {
        // Immediate update when turned on
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(sendLocationUpdate, handleError);
            
            // Set interval for every 30 seconds
            intervalId = setInterval(() => {
                navigator.geolocation.getCurrentPosition(sendLocationUpdate, handleError);
            }, 30000);
        } else {
            alert("Geolocation is not supported by your browser.");
            setIsTracking(false);
        }
    }

    // Capture state in localStorage for persistence
    localStorage.setItem("driver_tracking_enabled", isTracking);

    return () => {
        if (intervalId) clearInterval(intervalId);
    };
  }, [isTracking]);

  const toggleTracking = () => {
      setIsTracking(!isTracking);
  };


  if (loading) {
    return (
      <div className="min-h-screen flex bg-[#f7f3ef]">
        <DriverSidebar active="profile" />
        <div className="flex-1 p-10 flex items-center justify-center">
            <div className="text-[#6b4f3a] text-xl animate-pulse">Loading Profile...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
     return (
        <div className="min-h-screen flex bg-[#f7f3ef]">
          <DriverSidebar active="profile" />
          <div className="flex-1 p-10 flex items-center justify-center">
              <div className="text-red-500 text-xl">Failed to load profile.</div>
          </div>
        </div>
      );
  }

  // Helper to format full name
  const fullName = `${profile.firstName} ${profile.lastName}`;
  const displayRole = profile.role ? profile.role.toUpperCase() : "DRIVER";

  // Component Helpers
  const SectionCard = ({ title, description, children, rightAction }) => (
    <div className="bg-white rounded-xl border border-[#e6d8c9] p-8 mb-8 shadow-sm">
      <div className="mb-6 flex justify-between items-start">
        <div>
            <h3 className="text-xl font-bold text-[#351c15]">{title}</h3>
            {description && <p className="text-sm text-[#8a6a1c] mt-1 opacity-80">{description}</p>}
        </div>
        {rightAction && <div>{rightAction}</div>}
      </div>
      
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );

  const FieldRow = ({ label, value, helperText, isAddress = false }) => (
    <div>
      <label className="block text-base font-semibold text-[#351c15] mb-2">
        {label}
      </label>
      {helperText && <p className="text-xs text-gray-500 mb-2">{helperText}</p>}
      
      <div className={`p-3.5 bg-gray-50 border border-gray-200 rounded-lg text-[#351c15] ${isAddress ? "whitespace-pre-line" : ""}`}>
        {value || <span className="text-gray-400 italic">Not set</span>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#f7f3ef]">
      <DriverSidebar active="profile" />

      {/* MAIN CONTENT */}
      <div className="flex-1 px-10 py-10 overflow-y-auto">
        <div className="max-w-4xl">
            
            <div className="mb-10 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-[#351c15]">Settings</h1>
                    <p className="text-[#6b4f3a] mt-2 text-lg">Manage your profile details and preferences.</p>
                </div>
                
                {/* GLOBAL ALERT IF TRACKING OFF */}
                {!isTracking && (
                    <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center shadow-sm animate-pulse">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="font-bold text-sm">Location Tracking is OFF. Please enable it for live updates.</span>
                    </div>
                )}
            </div>

            {/* SECTION 0: LOCATION TRACKING */}
            <SectionCard
                title="Location Tracking"
                description="Enable this to share your live location with customers and admins."
                rightAction={
                    <button
                        onClick={toggleTracking}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f9b400] ${
                            isTracking ? 'bg-[#15803d]' : 'bg-gray-300'
                        }`}
                    >
                        <span className="sr-only">Enable Location Tracking</span>
                        <span
                            className={`${
                                isTracking ? 'translate-x-7' : 'translate-x-1'
                            } inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 shadow-md`}
                        />
                    </button>
                }
            >
                <div>
                    <p className="text-[#351c15] font-medium">
                        Status: <span className={isTracking ? "text-[#15803d] font-bold" : "text-red-500 font-bold"}>
                            {isTracking ? "Active (Updating every 30s)" : "Inactive"}
                        </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        Your location is secure and only shared with active order participants.
                    </p>
                </div>
            </SectionCard>


            {/* SECTION 1: IDENTITY */}
            <SectionCard 
                title="Profile Information" 
                description="This information will be displayed to admin and customers during delivery."
            >
                <div className="flex items-start gap-6 mb-4">
                    <div className="w-20 h-20 rounded-full bg-[#f0e6d8] flex-shrink-0 flex items-center justify-center text-2xl font-bold text-[#351c15] border-2 border-white shadow">
                         {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <FieldRow 
                            label="Full Name" 
                            value={fullName}
                            helperText="Your name as it appears on your license."
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <FieldRow 
                        label="Role" 
                        value={displayRole} 
                     />
                     <FieldRow 
                        label="Status" 
                        value="Active" // Placeholder for online/offline status
                     />
                </div>
            </SectionCard>

            {/* SECTION 2: CONTACT */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <SectionCard 
                    title="Contact Details" 
                    description="Manage your contact information for notifications and updates."
                >
                    <FieldRow 
                        label="Email Address" 
                        value={profile.email} 
                        helperText="Used for login and important updates."
                    />
                    <FieldRow 
                        label="Phone Number" 
                        value={profile.phone} 
                        helperText="Primary contact for deliveries."
                    />
                </SectionCard>
            </div>

            {/* SECTION 3: ADDRESS */}
            <SectionCard 
                title="Home Address" 
                description="Your registered residence address."
            >
                <FieldRow 
                    label="Street Address" 
                    value={`${profile.addressLine1 || ''}${profile.addressLine2 ? '\n' + profile.addressLine2 : ''}`} 
                    isAddress={true}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <FieldRow label="City" value={profile.city} />
                     <FieldRow label="Postal Code" value={profile.postalCode} />
                     <FieldRow label="State" value={profile.state} />
                     <FieldRow label="Country" value={profile.country} />
                </div>
            </SectionCard>

        </div>
      </div>
    </div>
  );
}
