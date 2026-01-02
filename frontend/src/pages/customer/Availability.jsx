import { useState } from "react";
import CustomerSidebar from "./CustomerSidebar";

function Availability() {
  const [availabilityText, setAvailabilityText] = useState("");
  const [parsedAvailability, setParsedAvailability] = useState(null);

  const handleAnalyze = () => {
    // Mock parsed result
    setParsedAvailability({
      date: "2025-12-06",
      start: "18:00",
      end: "20:00",
      priority: "High",
    });
  };

  const handleSave = () => {
    alert("Availability saved!");
  };

  return (
    <div className="min-h-screen flex bg-[#0b0f14] text-slate-100">
      {/* SIDEBAR */}
      <CustomerSidebar active="availability" />

      {/* MAIN */}
      <main className="flex-1 px-10 py-10 overflow-y-auto">
        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl font-black text-white">
            Set Availability
          </h1>
          <p className="text-slate-400 mt-1">
            Tell us when you're available to receive your delivery
          </p>
        </div>

        {/* INPUT CARD */}
        <div
          className="
            bg-white/5 backdrop-blur-xl
            border border-white/10
            rounded-3xl p-6
            max-w-3xl
          "
        >
          <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">
            Availability Details
          </label>

          <textarea
            value={availabilityText}
            onChange={(e) => setAvailabilityText(e.target.value)}
            placeholder="e.g. I'm available after 6 PM tomorrow"
            className="
              w-full h-32 p-4 rounded-xl
              bg-white/5 border border-white/10
              text-white placeholder-slate-500
              focus:outline-none focus:ring-2 focus:ring-[#ff8a3d]
            "
          />

          <button
            onClick={handleAnalyze}
            className="
              mt-5 w-full py-3 rounded-xl
              bg-[#ff8a3d] text-black
              font-bold
              hover:bg-[#ff9f5d]
              transition
            "
          >
            Analyze Availability
          </button>
        </div>

        {/* PARSED RESULT */}
        {parsedAvailability && (
          <div
            className="
              mt-8
              bg-white/5 backdrop-blur-xl
              border border-white/10
              rounded-3xl p-6
              max-w-3xl
            "
          >
            <h3 className="text-lg font-bold text-white mb-4">
              Parsed Availability
            </h3>

            <div className="space-y-2 text-sm">
              <p>
                <span className="text-slate-400">Date:</span>{" "}
                <span className="font-semibold">{parsedAvailability.date}</span>
              </p>
              <p>
                <span className="text-slate-400">Time:</span>{" "}
                <span className="font-semibold">
                  {parsedAvailability.start} – {parsedAvailability.end}
                </span>
              </p>
              <p>
                <span className="text-slate-400">Priority:</span>{" "}
                <span
                  className={`font-bold ${
                    parsedAvailability.priority === "High"
                      ? "text-red-400"
                      : "text-green-400"
                  }`}
                >
                  {parsedAvailability.priority}
                </span>
              </p>
            </div>

            <button
              onClick={handleSave}
              className="
                mt-6 w-full py-3 rounded-xl
                bg-white/10 border border-white/20
                text-white font-bold
                hover:bg-white/20
                transition
              "
            >
              Confirm & Save
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default Availability;
