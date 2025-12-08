import { useState } from 'react';

function Availability() {
    const [availabilityText, setAvailabilityText] = useState('');
    const [parsedAvailability, setParsedAvailability] = useState(null);

    const handleAnalyze = async () => {
        // Mock parsing
        setParsedAvailability({
            date: "2025-12-06",
            start: "18:00",
            end: "20:00",
            priority: "high"
        });

    };

    const handleSave = async () => {
        alert('Availability saved!');
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Set Availability</h2>
            <div className="mb-4">
                <label className="block mb-2">When are you available?</label>
                <textarea
                    className="w-full p-2 border rounded h-32"
                    placeholder="e.g., I am available only after 6 PM tomorrow."
                    value={availabilityText}
                    onChange={(e) => setAvailabilityText(e.target.value)}
                />
            </div>
            <button onClick={handleAnalyze} className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 mb-4">
                Analyze Availability
            </button>

            {parsedAvailability && (
                <div className="bg-gray-100 p-4 rounded mb-4">
                    <h3 className="font-semibold mb-2">Parsed Availability:</h3>
                    <p>Date: {parsedAvailability.date}</p>
                    <p>Time: {parsedAvailability.start} - {parsedAvailability.end}</p>
                    <p>Priority: {parsedAvailability.priority}</p>
                    <button onClick={handleSave} className="mt-2 bg-green-600 text-white p-2 rounded hover:bg-green-700">
                        Confirm & Save
                    </button>
                </div>
            )}
        </div>
    );
}

export default Availability;
