import { useState, useEffect } from "react";
import api, { API_BASE_URL } from "../../services/api";
import * as signalR from "@microsoft/signalr";

export default function CustomerASRUpload({ orderId, onClose }) {
  const [asrStatus, setAsrStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Document uploads
  const [aadhaarFront, setAadhaarFront] = useState(null);
  const [aadhaarBack, setAadhaarBack] = useState(null);
  const [panCard, setPanCard] = useState(null);
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  
  // Previews
  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);
  const [panPreview, setPanPreview] = useState(null);

  useEffect(() => {
    loadData();
    setupSignalR();
  }, [orderId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const asrRes = await api.get(`/asr/customer/status/${orderId}`);
      setAsrStatus(asrRes.data);
    } catch (err) {
      console.error("Error loading ASR:", err);
      if (err.response?.status === 404) {
        // Suppress alert if it's just not found initially (maybe not created yet)
        console.warn("No ASR verification found for this order");
      }
    } finally {
      setLoading(false);
    }
  };

  const setupSignalR = async () => {
    try {
      // Use dynamic URL from API configuration
      const hubUrl = API_BASE_URL.replace("/api", "/hubs/logistics");

      const conn = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => localStorage.getItem("token") || "",
        })
        .withAutomaticReconnect()
        .build();

      conn.on("ASRVerificationRequested", (data) => {
        if (data.orderId === parseInt(orderId)) {
          alert(data.message);
          loadData();
        }
      });

      await conn.start();
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.userId) {
        await conn.invoke("JoinCustomerGroup", user.userId);
      }
    } catch (err) {
      console.error("SignalR error:", err);
    }
  };

  const handleFrontUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAadhaarFront(file);
      setFrontPreview(URL.createObjectURL(file));
    }
  };

  const handleBackUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAadhaarBack(file);
      setBackPreview(URL.createObjectURL(file));
    }
  };

  const handlePanUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPanCard(file);
      setPanPreview(URL.createObjectURL(file));
    }
  };

  const formatAadhaarNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    const formatted = digits.match(/.{1,4}/g)?.join('-') || digits;
    return formatted.substring(0, 14); // XXXX-XXXX-XXXX
  };

  const handleAadhaarNumberChange = (e) => {
    const formatted = formatAadhaarNumber(e.target.value);
    setAadhaarNumber(formatted);
  };

  const handleUpload = async () => {
    if (!aadhaarFront) {
      alert("Please upload Aadhaar front side (mandatory)");
      return;
    }

    if (!aadhaarNumber || aadhaarNumber.replace(/\D/g, '').length !== 12) {
      alert("Please enter a valid 12-digit Aadhaar number");
      return;
    }

    try {
      setUploading(true);
      
      const documentUrls = [];
      
      // Front (mandatory)
      documentUrls.push(await fileToBase64(aadhaarFront));
      
      // Back (optional)
      if (aadhaarBack) {
        documentUrls.push(await fileToBase64(aadhaarBack));
      }
      
      // PAN (optional)
      if (panCard) {
        documentUrls.push(await fileToBase64(panCard));
      }

      await api.post(`/asr/customer/upload-documents/${asrStatus.asrId}`, {
        documentUrls: documentUrls,
        aadhaarNumber: aadhaarNumber.replace(/\D/g, '')
      });

      alert("Documents uploaded successfully! Driver will be notified.");
      await loadData();
      
      if (onClose) onClose();
    } catch (err) {
      alert("Upload failed: " + (err.response?.data?.message || err.message));
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

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // 🔥 FIX: Handle case where ASR hasn't been initiated yet
  if (!asrStatus) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6 text-center">
          <div className="mb-4 text-yellow-500 text-5xl">⏳</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Waiting for Driver</h2>
          <p className="text-gray-600 mb-6">
            The driver has not initiated the ASR verification process yet. 
            Please wait for the driver to arrive and request verification.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            🔒 Upload Documents for ASR Verification
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {asrStatus && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Status:</strong> {asrStatus.status}
            </p>
            {asrStatus.requestedAt && (
              <p className="text-sm text-blue-700 mt-1">
                Requested: {new Date(asrStatus.requestedAt).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-900 mb-2">📋 Requirements:</h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• <strong>Aadhaar Front</strong> (mandatory): Must show photo clearly</li>
            <li>• <strong>Aadhaar Back</strong> (optional): Shows address details</li>
            <li>• <strong>PAN Card</strong> (optional): Additional verification</li>
            <li>• <strong>Aadhaar Number</strong> (mandatory): Enter 12-digit number</li>
            <li>• Ensure good lighting and all corners visible</li>
          </ul>
        </div>

        {/* Aadhaar Number Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            🔢 Aadhaar Number *
          </label>
          <input
            type="text"
            value={aadhaarNumber}
            onChange={handleAadhaarNumberChange}
            placeholder="XXXX-XXXX-XXXX"
            maxLength={14}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter your 12-digit Aadhaar number (will be auto-formatted)
          </p>
        </div>

        {/* Aadhaar Front Upload */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📄 Aadhaar Front Side (with Photo) *
          </label>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFrontUpload}
            className="block w-full text-sm text-gray-700
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-600 file:text-white
              hover:file:bg-blue-700"
          />
          {frontPreview && (
            <div className="mt-3">
              <img
                src={frontPreview}
                alt="Aadhaar Front"
                className="w-full max-w-md h-48 object-contain rounded-lg border-2 border-blue-200 bg-gray-50"
              />
              <button
                onClick={() => {
                  setAadhaarFront(null);
                  setFrontPreview(null);
                }}
                className="mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Aadhaar Back Upload */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📄 Aadhaar Back Side (with Address)
          </label>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleBackUpload}
            className="block w-full text-sm text-gray-700
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-gray-400 file:text-white
              hover:file:bg-gray-500"
          />
          {backPreview && (
            <div className="mt-3">
              <img
                src={backPreview}
                alt="Aadhaar Back"
                className="w-full max-w-md h-48 object-contain rounded-lg border-2 border-gray-200 bg-gray-50"
              />
              <button
                onClick={() => {
                  setAadhaarBack(null);
                  setBackPreview(null);
                }}
                className="mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* PAN Card Upload */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            💳 PAN Card (Optional)
          </label>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePanUpload}
            className="block w-full text-sm text-gray-700
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-gray-400 file:text-white
              hover:file:bg-gray-500"
          />
          {panPreview && (
            <div className="mt-3">
              <img
                src={panPreview}
                alt="PAN Card"
                className="w-full max-w-md h-48 object-contain rounded-lg border-2 border-gray-200 bg-gray-50"
              />
              <button
                onClick={() => {
                  setPanCard(null);
                  setPanPreview(null);
                }}
                className="mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Upload Summary */}
        {(frontPreview || backPreview || panPreview) && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-semibold mb-2">
              ✓ Ready to upload
            </p>
            <div className="space-y-1 text-sm text-gray-700">
              {frontPreview && <p>✓ Aadhaar Front</p>}
              {backPreview && <p>✓ Aadhaar Back</p>}
              {panPreview && <p>✓ PAN Card</p>}
              {aadhaarNumber && aadhaarNumber.replace(/\D/g, '').length === 12 && (
                <p>✓ Aadhaar Number: {aadhaarNumber}</p>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!aadhaarFront || !aadhaarNumber || aadhaarNumber.replace(/\D/g, '').length !== 12 || uploading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {uploading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Uploading...
              </span>
            ) : (
              "Upload Documents"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
