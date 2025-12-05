import React, { useEffect, useRef, useState } from "react";
import CustomerSidebar from "./CustomerSidebar";
import SignaturePad from "signature_pad";
import { useNavigate } from "react-router-dom";
export default function DeliveryConfirm() {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const canvasRef = useRef(null);
  const signaturePadRef = useRef(null);
  const navigate = useNavigate();


  // Initialize Signature Pad
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    // Resize canvas properly
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    signaturePadRef.current = new SignaturePad(canvas, {
      penColor: "black",
      backgroundColor: "white",
    });
  }, []);

  // OTP handling
  const handleOtpChange = (value, index) => {
    let newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);
  };

  const handleVerifyOtp = () => {
    console.log("OTP Entered:", otp.join(""));
    // TODO: Send OTP to backend for verification
  };

  // Signature functions
  const handleClearSignature = () => {
    signaturePadRef.current.clear();
  };

  const handleSubmitSignature = () => {
    if (signaturePadRef.current.isEmpty()) {
      alert("Please provide a signature before submitting.");
      return;
    }

    const signatureImage = signaturePadRef.current.toDataURL(); // PNG Base64
    console.log("Signature submitted:", signatureImage);

    // TODO: Upload to backend
    // await axios.post("/api/submit-signature", { signature: signatureImage })
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <CustomerSidebar active="confirm" />

      {/* CONTENT */}
      <div className="flex-1 p-10">

        <h1 className="text-3xl font-bold mb-2">Delivery Confirmation</h1>
        <p className="text-gray-500 mb-6">Confirm receipt of your package</p>

        {/* PACKAGE CARD */}
        <div className="bg-white rounded-2xl p-6 shadow flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-teal-50 p-3 rounded-xl text-teal-600 text-2xl">
              📦
            </div>
            <div>
              <h2 className="text-xl font-semibold">Package Arrived!</h2>
              <p className="text-gray-500">Order #DEL-2024-001</p>
            </div>
          </div>

          <div className="text-right text-gray-600 text-sm">
            <p>⏱ Arrived at 2:55 PM</p>
            <p>📍 123 Main Street</p>
          </div>
        </div>

        {/* TWO PANEL GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* OTP SECTION */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-semibold mb-3">🔑 OTP Confirmation</h2>
            <p className="text-gray-500 mb-4">
              Enter the 4-digit code sent to your registered phone
            </p>

            <div className="flex space-x-4 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  value={digit}
                  maxLength="1"
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  className="w-14 h-14 text-center text-xl border rounded-xl 
                             focus:ring-2 focus:ring-teal-500"
                />
              ))}
            </div>

            <button
              onClick={handleVerifyOtp}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-xl mb-3"
            >
              ✔ Verify OTP
            </button>

            <p className="text-sm text-gray-500 text-center">
              Didn't receive code?{" "}
              <span className="text-teal-600 cursor-pointer hover:underline">
                Resend
              </span>
            </p>
          </div>

          {/* SIGNATURE SECTION */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-semibold mb-3">✒️ Digital Signature</h2>
            <p className="text-gray-500 mb-4">
              Sign below to confirm you received the package
            </p>

            {/* Signature Box */}
            <div className="border-2 border-dashed rounded-2xl h-56 mb-4 relative">
              <canvas
                ref={canvasRef}
                className="w-full h-full rounded-xl"
              ></canvas>
              <p className="absolute inset-0 flex items-center justify-center 
                            text-gray-400 pointer-events-none">
                Sign here
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleClearSignature}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-xl w-full"
              >
                Clear
              </button>

              <button
                onClick={handleSubmitSignature}
                className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-xl w-full"
              >
                ✔ Submit Signature
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
