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
    <div className="min-h-screen flex bg-[#f7f3ef]">

      {/* SIDEBAR */}
      <CustomerSidebar active="availability" />

      {/* MAIN CONTENT */}
      <div className="flex-1 p-10 transition-all duration-300">

        {/* HEADER */}
        <h2 className="text-3xl font-bold text-[#351c15] mb-1">
          Set Availability
        </h2>
        <p className="text-[#6f4e37] mb-8">
          Tell us when you're available to receive your delivery.
        </p>

        {/* INPUT CARD */}
        <div className="bg-[#fff8e7] border border-[#e6ddc5] p-6 rounded-2xl shadow-md max-w-3xl">
          <label className="block mb-2 text-[#351c15] font-semibold">
            When are you available?
          </label>

          <textarea
            className="w-full p-4 bg-white border border-[#d4c7b3] rounded-xl
            text-[#351c15] h-32 focus:ring-2 focus:ring-[#f9b400] outline-none"
            placeholder="e.g., I'm available after 6 PM tomorrow."
            value={availabilityText}
            onChange={(e) => setAvailabilityText(e.target.value)}
          />

          <button
            onClick={handleAnalyze}
            className="mt-5 bg-[#351c15] hover:bg-[#4a2a21]
            text-white p-3 rounded-xl w-full font-semibold shadow transition"
          >
            Analyze Availability
          </button>
        </div>

        {/* PARSED RESULT CARD */}
        {parsedAvailability && (
          <div className="bg-[#fff8e7] border border-[#e6ddc5] p-6 rounded-2xl shadow-md max-w-3xl mt-8">
            <h3 className="text-lg font-bold text-[#351c15] mb-4">
              Parsed Availability
            </h3>

            <div className="bg-white border border-[#d4c7b3] p-4 rounded-xl">
              <p className="text-[#351c15] mb-1">
                <b>Date:</b> {parsedAvailability.date}
              </p>
              <p className="text-[#351c15] mb-1">
                <b>Time:</b> {parsedAvailability.start} – {parsedAvailability.end}
              </p>
              <p className="text-[#351c15]">
                <b>Priority:</b> {parsedAvailability.priority}
              </p>
            </div>

            <button
              onClick={handleSave}
              className="mt-5 bg-[#f9b400] hover:bg-[#e0a200]
              text-[#351c15] p-3 rounded-xl w-full font-bold shadow transition"
            >
              Confirm & Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Availability;
