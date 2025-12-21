import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="w-full font-sans bg-[#0b0f14] text-slate-100">
      <nav className="fixed top-0 left-0 w-full bg-[#0b0f14]/80 backdrop-blur border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto px-10 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-black tracking-tight text-[#ff8a3d]">
            OnTrack
          </h1>

          <div className="flex gap-4">
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg text-slate-300 hover:bg-white/10 transition"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-[#ff8a3d] text-black rounded-lg font-bold hover:opacity-90 transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      <section
        className="relative min-h-screen pt-28 flex items-center px-10
        bg-linear-to-br from-[#242c3a] via-[#141a24] to-[#0b0f14]"
      >
        {/* Accent Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,#ff8a3d22,transparent_55%)]" />

        {/* Depth Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.04),transparent_30%,transparent_70%,rgba(0,0,0,0.35))]" />

        <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-5xl font-black leading-tight">
              Track Every Move, <br />
              Any Destination, <br />
              with <span className="text-[#ff8a3d]">OnTrack</span>.
            </h1>

            <p className="mt-6 text-slate-400 max-w-lg">
              We simplify complex logistics by combining real-time tracking,
              intelligent routing, and reliable delivery solutions to keep your
              shipments always on track.
            </p>
          </div>

          <img
            src="https://images.unsplash.com/photo-1578575437130-527eed3abbec"
            className="rounded-2xl shadow-xl w-full object-cover border border-white/10"
            alt="Logistics"
          />
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-[#0b0f14]" />

        <div className="relative">
          <h2 className="text-4xl font-black text-center">
            Core Features of <span className="text-[#ff8a3d]">OnTrack</span>
          </h2>

          <p className="mt-4 text-slate-400 max-w-2xl mx-auto text-center">
            OnTrack is designed to address real-world logistics challenges by
            improving visibility, efficiency, and delivery reliability.
          </p>

          <div className="grid md:grid-cols-4 gap-10 mt-16 max-w-6xl mx-auto">
            {[
              {
                title: "Live Shipment & Driver Tracking",
                desc: [
                  "Real-time shipment and driver location visibility.",
                  "Prevents delays from poor communication.",
                  "Improves delivery transparency.",
                ],
              },
              {
                title: "Estimated Time & Route Analysis",
                desc: [
                  "Accurate delivery ETA calculations.",
                  "Traffic-aware routing decisions.",
                  "Better customer expectations.",
                ],
              },
              {
                title: "Smart Delivery Updates",
                desc: [
                  "Automatic status updates.",
                  "Minimizes manual errors.",
                  "Reliable delivery communication.",
                ],
              },
              {
                title: "ASR-Based Verification",
                desc: [
                  "Secure delivery confirmation.",
                  "Digital ASR workflow.",
                  "Legally compliant proof.",
                ],
              },
            ].map((f, i) => (
              <div
                key={i}
                className="
        group
        bg-white/5 backdrop-blur-xl border border-white/10
        rounded-2xl p-6
        hover:bg-white/10
        transition
      "
              >
                <h3
                  className="
          text-xl font-bold mb-3
          text-white
          transition-colors duration-300
          group-hover:text-[#ff8a3d]
        "
                >
                  {f.title}
                </h3>

                {f.desc.map((d, idx) => (
                  <p key={idx} className="text-slate-400 mt-3">
                    {d}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= WHY ONTRACK ================= */}
      <section
        className="relative py-24 px-6
        bg-gradient-to-br from-[#1f2633] via-[#141a24] to-[#0b0f14]"
      >
        {/* Bottom Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,#ff8a3d1a,transparent_60%)]" />

        <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <img
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d"
            className="rounded-2xl w-full object-cover border border-white/10"
            alt="Logistics Operations"
          />

          <div>
            <h2 className="text-4xl font-black">
              Why <span className="text-[#ff8a3d]">OnTrack</span>?
            </h2>

            <p className="mt-4 text-slate-400">
              Traditional logistics systems rely heavily on manual updates and
              disconnected communication channels.
            </p>

            <p className="mt-4 text-slate-400">
              OnTrack introduces a centralized, real-time platform focused on
              transparency, accountability, and efficiency.
            </p>

            <ul className="mt-6 space-y-3 text-slate-300">
              <li>✔ Eliminates manual delivery errors</li>
              <li>✔ Real-time shipment & driver tracking</li>
              <li>✔ Accurate ETA predictions</li>
              <li>✔ Secure ASR-based verification</li>
            </ul>
          </div>
        </div>
        <div className="flex items-center justify-center mt-12 relative z-10">
          <span className="underline text-orange-400">
            <Link to="/tracking">Track Your Package</Link>
          </span>
        </div>
      </section>
    </div>
  );
}
