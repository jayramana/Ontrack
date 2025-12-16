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

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    signaturePadRef.current = new SignaturePad(canvas, {
      penColor: "#351c15",
      backgroundColor: "white",
    });
  }, []);

  const handleOtpChange = (value, index) => {
    let newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);
  };

  const handleVerifyOtp = () => {
    console.log("OTP Entered:", otp.join(""));
  };

  const handleClearSignature = () => {
    signaturePadRef.current.clear();
  };

  const handleSubmitSignature = () => {
    if (signaturePadRef.current.isEmpty()) {
      alert("Please provide a signature before submitting.");
      return;
    }

    const signatureImage = signaturePadRef.current.toDataURL();
    console.log("Signature submitted:", signatureImage);
  };

  return (
    <div className="min-h-screen flex bg-[#f7f3ef]">
      <CustomerSidebar active="confirm" />

      {/* CONTENT */}
      <div className="flex-1 p-10">

        <h1 className="text-3xl font-bold mb-2 text-[#351c15]">Delivery Confirmation</h1>
        <p className="text-[#6f4e37] mb-6">Confirm receipt of your package</p>

        {/* PACKAGE CARD */}
        <div className="bg-[#fff8e7] rounded-2xl p-6 border border-[#e6ddc5] shadow-sm flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-[#f9b400]/20 p-3 rounded-xl text-[#f9b400] text-2xl">
              📦
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#351c15]">Package Arrived!</h2>
              <p className="text-[#6f4e37]">Order #DEL-2024-001</p>
            </div>
          </div>

          <div className="text-right text-[#6f4e37] text-sm">
            <p>⏱ Arrived at 2:55 PM</p>
            <p>📍 123 Main Street</p>
          </div>
        </div>

        {/* TWO PANEL GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* OTP SECTION */}
          <div className="bg-[#fff8e7] p-6 rounded-2xl border border-[#e6ddc5] shadow-sm">
            <h2 className="text-xl font-semibold text-[#351c15] mb-3">🔑 OTP Confirmation</h2>
            <p className="text-[#6f4e37] mb-4">
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
                  className="
                    w-14 h-14 text-center text-xl border border-[#d2c6b8]
                    rounded-xl bg-white text-[#351c15]
                    focus:ring-2 focus:ring-[#f9b400]
                    shadow-sm
                  "
                />
              ))}
            </div>

            <button
              onClick={handleVerifyOtp}
              className="w-full bg-[#351c15] hover:bg-[#4a2a21] text-white py-3 rounded-xl shadow"
            >
              ✔ Verify OTP
            </button>

            <p className="text-sm text-[#6f4e37] text-center mt-3">
              Didn't receive code?{" "}
              <span className="text-[#f9b400] cursor-pointer hover:underline">
                Resend
              </span>
            </p>
          </div>

          {/* SIGNATURE SECTION */}
          <div className="bg-[#fff8e7] p-6 rounded-2xl border border-[#e6ddc5] shadow-sm">
            <h2 className="text-xl font-semibold text-[#351c15] mb-3">✒️ Digital Signature</h2>
            <p className="text-[#6f4e37] mb-4">
              Sign below to confirm you received the package
            </p>

            {/* Signature Box */}
            <div className="border-2 border-dashed border-[#c5b9a5] rounded-2xl h-56 mb-4 relative bg-white">
              <canvas
                ref={canvasRef}
                className="w-full h-full rounded-xl"
              ></canvas>
              <p className="absolute inset-0 flex items-center justify-center text-[#b1a597] pointer-events-none">
                Sign here
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleClearSignature}
                className="bg-[#6f4e37] hover:bg-[#5b4331] text-white px-4 py-2 rounded-xl w-full shadow"
              >
                Clear
              </button>

              <button
                onClick={handleSubmitSignature}
                className="bg-[#351c15] hover:bg-[#4a2a21] text-white px-4 py-2 rounded-xl w-full shadow"
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
