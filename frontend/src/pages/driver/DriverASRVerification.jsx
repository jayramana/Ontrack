import { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import * as signalR from "@microsoft/signalr";

export default function DriverASRVerification({ orderId, onClose }) {
  const [order, setOrder] = useState(null);
  const [asrStatus, setAsrStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initiating, setInitiating] = useState(false);
  
  // Capture states
  const [customerPhoto, setCustomerPhoto] = useState(null);
  const [customerPhotoPreview, setCustomerPhotoPreview] = useState(null);
  const [isCapturingSignature, setIsCapturingSignature] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Verification states
  const [verificationResult, setVerificationResult] = useState(null);
  const [canCompleteDelivery, setCanCompleteDelivery] = useState(false);
  
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const [connection, setConnection] = useState(null);

  // Load order and ASR status
  useEffect(() => {
    loadData();
  }, [orderId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load order details
      const orderRes = await api.get(`/driver/order/${orderId}`);
      setOrder(orderRes.data);
      
      // Try to load ASR status (might not exist yet)
      try {
        const asrRes = await api.get(`/asr/driver/status/${orderId}`);
        setAsrStatus(asrRes.data);
        
        if (asrRes.data.status === "Success" || asrRes.data.status === "AdminOverride") {
          setCanCompleteDelivery(true);
        }
      } catch (err) {
        // ASR doesn't exist yet - this is fine
        if (err.response?.status === 404) {
          console.log("ASR not initiated yet");
          setAsrStatus(null);
        } else {
          throw err;
        }
      }
    } catch (err) {
      console.error("Error loading data:", err);
      if (err.response?.status !== 404) {
          alert("Error loading order details: " + (err.response?.data?.message || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  // Setup SignalR
  useEffect(() => {
    const setupSignalR = async () => {
      try {
        const conn = new signalR.HubConnectionBuilder()
          .withUrl(`${import.meta.env.VITE_API_URL}/hubs/logistics`, {
            accessTokenFactory: () => localStorage.getItem("token") || "",
          })
          .withAutomaticReconnect()
          .build();

        conn.on("CustomerDocumentsUploaded", (data) => {
          if (data.orderId === parseInt(orderId)) {
            alert("Customer has uploaded ID documents!");
            loadData();
          }
        });

        conn.on("ASRVerificationCompleted", (data) => {
          if (data.orderId === parseInt(orderId)) {
            setVerificationResult(data);
            if (data.status === "Success") {
              setCanCompleteDelivery(true);
            }
            loadData();
          }
        });

        conn.on("ASRAdminOverride", (data) => {
          if (data.orderId === parseInt(orderId)) {
            alert(`Admin approved ASR: ${data.reason}`);
            setCanCompleteDelivery(true);
            loadData();
          }
        });

        await conn.start();
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (user.userId) {
          await conn.invoke("JoinDriverGroup", user.userId);
        }
        
        setConnection(conn);
      } catch (err) {
        console.error("SignalR error:", err);
      }
    };

    setupSignalR();
    return () => connection?.stop();
  }, [orderId]);

  // Initiate ASR Request
  const handleInitiateASR = async () => {
    try {
      setInitiating(true);
      const response = await api.post(`/asr/driver/initiate/${orderId}`);
      alert(response.data.message);
      await loadData();
    } catch (err) {
      alert("Error initiating ASR: " + (err.response?.data?.message || err.message));
      console.error("Initiate error:", err.response?.data);
    } finally {
      setInitiating(false);
    }
  };

  // Handle photo capture
  const handlePhotoCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCustomerPhoto(file);
      setCustomerPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Signature canvas
  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData(null);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL("image/png");
    setSignatureData(dataUrl);
    setIsCapturingSignature(false);
  };

  // Upload captures to server
  const handleUploadCaptures = async () => {
    if (!customerPhoto || !signatureData) {
      alert("Please capture customer photo and signature");
      return;
    }

    if (!asrStatus?.asrId) {
      alert("ASR not initiated yet. Please initiate ASR first.");
      return;
    }

    try {
      setUploading(true);
      
      // Convert photo to base64
      const photoBase64 = await fileToBase64(customerPhoto);
      
      const response = await api.post(`/asr/driver/upload-captures/${asrStatus.asrId}`, {
        customerPhotoUrl: photoBase64,
        signatureUrl: signatureData
      });

      alert("Captures uploaded! Waiting for AI verification...");
      await loadData();
    } catch (err) {
      alert("Upload error: " + (err.response?.data?.message || err.message));
      console.error("Upload error:", err.response?.data);
    } finally {
      setUploading(false);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleCompleteDelivery = async () => {
    console.log("completing delivery");
    if (!canCompleteDelivery) {
      alert("Cannot complete delivery - ASR verification not successful");
      return;
    }

    try {
      await api.post(`/driver/mark-delivered/${orderId}`);
      alert("Delivery completed successfully!");
      if (onClose) onClose();
    } catch (err) {
      alert("Error completing delivery: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6">
          <p className="text-[#351c15]">Loading ASR verification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#f7f3ef] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-[#fff8e7] border-b border-[#e6ddc5] p-6 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#351c15]">
                🔒 ASR Verification Required
              </h1>
              <p className="text-[#6f4e37]">Order #{orderId} - {order?.customerName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-[#351c15] hover:text-[#2b160f] text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* ASR Status Card */}
          {asrStatus && (
            <div className={`border-l-4 p-4 rounded-lg ${
              asrStatus.status === "Success" ? "bg-green-50 border-green-500" :
              asrStatus.status === "Failed" ? "bg-red-50 border-red-500" :
              asrStatus.status === "InProgress" ? "bg-yellow-50 border-yellow-500" :
              "bg-blue-50 border-blue-500"
            }`}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg text-[#351c15]">
                    Status: {asrStatus.status}
                  </h3>
                  {asrStatus.score && (
                    <p className="text-sm text-[#6f4e37]">
                      AI Confidence: {(asrStatus.score * 100).toFixed(1)}%
                    </p>
                  )}
                </div>

                {asrStatus.status === "Success" && (
                  <div className="text-green-600 text-3xl">✓</div>
                )}
              </div>

              {asrStatus.reasons && asrStatus.reasons.length > 0 && (
                <div className="mt-3 bg-white p-3 rounded border border-[#e6ddc5]">
                  <p className="font-semibold text-sm text-[#351c15] mb-1">Details:</p>
                  <ul className="text-sm text-[#6f4e37] space-y-1">
                    {asrStatus.reasons.map((reason, idx) => (
                      <li key={idx}>• {reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Initiate ASR */}
          {!asrStatus && (
            <div className="bg-[#fff8e7] border border-[#e6ddc5] rounded-xl p-6">
              <h2 className="text-xl font-bold text-[#351c15] mb-3">Step 1: Request Documents</h2>
              <p className="text-[#6f4e37] mb-4">
                Notify customer to upload Aadhaar or PAN card
              </p>
              <button
                onClick={handleInitiateASR}
                disabled={initiating}
                className="px-6 py-3 bg-[#351c15] text-white rounded-lg hover:bg-[#2b160f] font-semibold shadow disabled:opacity-50"
              >
                {initiating ? "Sending..." : "🔔 Send ASR Request"}
              </button>
            </div>
          )}

          {/* Step 2: Waiting for customer */}
          {asrStatus && !asrStatus.hasDocuments && (
            <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-6">
              <h2 className="text-xl font-bold text-yellow-800 mb-2">
                ⏳ Waiting for Customer
              </h2>
              <p className="text-yellow-700">
                Customer notification sent. Waiting for ID upload...
              </p>
              <button
                onClick={loadData}
                className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                🔄 Refresh Status
              </button>
            </div>
          )}

          {/* Step 3: Capture photo & signature */}
          {asrStatus && asrStatus.hasDocuments && !asrStatus.hasPhoto && (
            <div className="bg-[#fff8e7] border border-[#e6ddc5] rounded-xl p-6">
              <h2 className="text-xl font-bold text-[#351c15] mb-4">
                Step 2: Capture Photo & Signature
              </h2>

              {/* Photo */}
              <div className="mb-6">
                <h3 className="font-semibold text-[#351c15] mb-2">📸 Customer Photo</h3>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoCapture}
                  className="mb-3 block w-full text-sm text-[#6f4e37]
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-[#351c15] file:text-white
                    hover:file:bg-[#2b160f]"
                />
                {customerPhotoPreview && (
                  <img 
                    src={customerPhotoPreview} 
                    alt="Customer" 
                    className="w-48 h-48 object-cover rounded-lg border-2 border-[#e6ddc5]"
                  />
                )}
              </div>

              {/* Signature */}
              <div className="mb-6">
                <h3 className="font-semibold text-[#351c15] mb-2">✍️ Signature</h3>
                
                {!isCapturingSignature && !signatureData && (
                  <button
                    onClick={() => setIsCapturingSignature(true)}
                    className="px-4 py-2 bg-[#f9b400] text-[#351c15] rounded-lg hover:bg-[#e0a200]"
                  >
                    Start Capture
                  </button>
                )}

                {isCapturingSignature && (
                  <div>
                    <canvas
                      ref={canvasRef}
                      width={400}
                      height={200}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      className="border-2 border-[#351c15] rounded-lg bg-white cursor-crosshair touch-none"
                    />
                    <div className="flex gap-3 mt-3">
                      <button
                        onClick={clearSignature}
                        className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                      >
                        Clear
                      </button>
                      <button
                        onClick={saveSignature}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}

                {signatureData && !isCapturingSignature && (
                  <div>
                    <img 
                      src={signatureData} 
                      alt="Signature" 
                      className="border-2 border-[#e6ddc5] rounded-lg bg-white"
                    />
                    <button
                      onClick={() => setIsCapturingSignature(true)}
                      className="mt-2 px-4 py-2 bg-[#f9b400] text-[#351c15] rounded-lg"
                    >
                      Retake
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleUploadCaptures}
                disabled={!customerPhoto || !signatureData || uploading}
                className="w-full px-6 py-3 bg-[#351c15] text-white rounded-lg hover:bg-[#2b160f] font-semibold disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "📤 Upload & Verify"}
              </button>
            </div>
          )}

          {/* Verification Result */}
          {verificationResult && (
            <div className={`border-l-4 p-6 rounded-lg ${
              verificationResult.status === "Success" 
                ? "bg-green-50 border-green-500" 
                : "bg-red-50 border-red-500"
            }`}>
              <h2 className="text-xl font-bold mb-3">
                {verificationResult.status === "Success" ? "✅ Verified" : "❌ Failed"}
              </h2>
              <p className="text-sm mb-2">Score: {(verificationResult.score * 100).toFixed(1)}%</p>
              <div className="bg-white p-3 rounded">
                <ul className="text-sm space-y-1">
                  {verificationResult.reasons?.map((r, i) => (
                    <li key={i}>• {r}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Complete Delivery */}
          <div className="bg-[#fff8e7] border border-[#e6ddc5] rounded-xl p-6">
            <h2 className="text-xl font-bold text-[#351c15] mb-4">Complete Delivery</h2>
            
            {!canCompleteDelivery && (
              <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-lg mb-4">
                <p className="text-yellow-800">
                  ⚠️ ASR verification required
                </p>
              </div>
            )}

            <button
              onClick={handleCompleteDelivery}
              disabled={!canCompleteDelivery}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50"
            >
              {canCompleteDelivery ? "✓ Mark Delivered" : "🔒 Waiting for Verification"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}