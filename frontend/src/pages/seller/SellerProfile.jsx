import React, { useState, useEffect } from "react";
import SellerSidebar from "./SellerSidebar";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

export default function SellerProfile() {
  const [profile, setProfile] = useState(null);
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH PROFILE ---------------- */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/profile");
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch seller profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex bg-[#0b0f14] text-slate-400">
        <SellerSidebar active="profile" />
        <div className="flex-1 flex items-center justify-center text-lg animate-pulse">
          Loading profile…
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex bg-[#0b0f14] text-slate-400">
        <SellerSidebar active="profile" />
        <div className="flex-1 flex items-center justify-center text-red-400 text-lg">
          Failed to load profile.
        </div>
      </div>
    );
  }

  const fullName = `${profile.firstName} ${profile.lastName}`;
  const sellerTypeDisplay = profile.sellerType
    ? profile.sellerType.charAt(0).toUpperCase() + profile.sellerType.slice(1)
    : "Verified User";

  /* ---------------- UI HELPERS ---------------- */
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

  return (
    <div className="min-h-screen flex bg-[#0b0f14] text-slate-100">
      <SellerSidebar active="profile" />

      {/* MAIN */}
      <div className="flex-1 px-10 py-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-12">

          {/* PAGE TITLE */}
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">
              Seller Profile
            </h1>
            <p className="text-slate-400 mt-1">
              Manage your business information and preferences
            </p>
          </div>

          {/* ================= IDENTITY ================= */}
          <section className="relative bg-gradient-to-br from-[#1a1f29] to-[#0f141c] rounded-3xl p-8 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ff8a3d22,transparent_60%)]" />

            <div className="relative flex flex-col sm:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-3xl font-black text-white">
                {profile.firstName?.[0]}
                {profile.lastName?.[0]}
              </div>

              {/* Identity */}
              <div className="flex-1">
                <h2 className="text-3xl font-black">{fullName}</h2>
                <p className="text-slate-400 mt-1">
                  {profile.role?.toUpperCase()} · {sellerTypeDisplay}
                </p>

                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm font-semibold">
                  ● Active
                </div>
              </div>
            </div>
          </section>

          {/* ================= INFO GRID ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* CONTACT */}
            <InfoCard
              title="Contact Details"
              description="Used for order updates and communication"
            >
              <Field label="Email" value={profile.email} />
              <Field label="Phone" value={profile.phone} />
            </InfoCard>

            {/* ACCOUNT */}
            <InfoCard
              title="Account Information"
              description="Your seller role and account type"
            >
              <Field label="Role" value={profile.role?.toUpperCase()} />
              <Field label="Account Type" value={sellerTypeDisplay} />
            </InfoCard>

          </div>

          {/* ================= ADDRESS ================= */}
          <InfoCard
            title="Business Address"
            description="Pickup and return location details"
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

          {/* ================= LOGOUT ================= */}
          <div className="pt-6 border-t border-white/10">
            <button
              onClick={logout}
              className="
                px-6 py-3 rounded-xl
                bg-red-500/10 border border-red-500/30
                text-red-400 font-bold
                hover:bg-red-500/20 hover:text-red-300
                transition
              "
            >
              Log Out
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
