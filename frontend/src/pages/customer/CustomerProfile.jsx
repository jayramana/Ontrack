import React, { useState, useEffect } from "react";
import CustomerSidebar from "./CustomerSidebar";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function CustomerProfile() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/profile");
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch customer profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex bg-[#f7f3ef]">
        <CustomerSidebar active="profile" />
        <div className="flex-1 p-10 flex items-center justify-center">
            <div className="text-[#6b4f3a] text-xl animate-pulse">Loading Profile...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
     return (
        <div className="min-h-screen flex bg-[#f7f3ef]">
          <CustomerSidebar active="profile" />
          <div className="flex-1 p-10 flex items-center justify-center">
              <div className="text-red-500 text-xl">Failed to load profile.</div>
          </div>
        </div>
      );
  }

  // Helper to format full name
  const fullName = `${profile.firstName} ${profile.lastName}`;
  const displayRole = profile.role ? profile.role.toUpperCase() : "CUSTOMER";

  // Component Helpers
  const SectionCard = ({ title, description, children }) => (
    <div className="bg-white rounded-xl border border-[#e6d8c9] p-8 mb-8 shadow-sm">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-[#351c15]">{title}</h3>
        {description && <p className="text-sm text-[#8a6a1c] mt-1 opacity-80">{description}</p>}
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
      <CustomerSidebar active="profile" />

      {/* MAIN CONTENT */}
      <div className="flex-1 px-10 py-10 overflow-y-auto">
        <div className="max-w-4xl">
            
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-[#351c15]">Settings</h1>
                <p className="text-[#6b4f3a] mt-2 text-lg">Manage your personal account details.</p>
            </div>

            {/* SECTION 1: IDENTITY */}
            <SectionCard 
                title="Profile Information" 
                description="Your personal account information."
            >
                <div className="flex items-start gap-6 mb-4">
                    <div className="w-20 h-20 rounded-full bg-[#f0e6d8] shrink-0 flex items-center justify-center text-2xl font-bold text-[#351c15] border-2 border-white shadow">
                         {(profile.firstName || 'U').charAt(0)}{(profile.lastName || '').charAt(0)}
                    </div>
                    <div className="flex-1">
                        <FieldRow 
                            label="Full Name" 
                            value={fullName}
                            helperText="Your name as it appears on your account."
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
                        value="Active" 
                     />
                </div>
            </SectionCard>

            {/* SECTION 2: CONTACT */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <SectionCard 
                    title="Contact Details" 
                    description="How we can reach you regarding your orders."
                >
                    <FieldRow 
                        label="Email Address" 
                        value={profile.email} 
                        helperText="Used for login and order notifications."
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
                title="Default Delivery Address" 
                description="Your default address for deliveries."
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

            {/* SECTION 4: ACTIONS */}
            <div className="mt-8 border-t border-gray-200 pt-8">
                <h3 className="text-lg font-bold text-[#351c15] mb-4">Account Actions</h3>
                <button 
                    onClick={logout}
                    className="px-6 py-3 bg-red-50 text-red-700 border border-red-200 rounded-lg font-bold hover:bg-red-100 transition-colors flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                    </svg>
                    Sign Out
                </button>
            </div>

        </div>
      </div>
    </div>
  );
}
