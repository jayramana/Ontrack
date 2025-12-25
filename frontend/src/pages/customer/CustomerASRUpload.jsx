import { useState, useEffect } from "react";
import api, { API_BASE_URL } from "../../services/api";
import * as signalR from "@microsoft/signalr";
import { FaCloudUploadAlt } from "react-icons/fa";
import { MdOutlineVerifiedUser } from "react-icons/md";

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

  // Waiting State
  if (!asrStatus) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-[#1a1f29] border border-white/10 rounded-2xl max-w-md w-full p-8 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff8a3d] to-transparent animate-pulse" />
          <div className="mb-6 mx-auto w-20 h-20 rounded-full bg-[#ff8a3d]/10 flex items-center justify-center">
             <div className="text-4xl animate-pulse">⏳</div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Waiting for Driver</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            The driver has not initiated the ASR verification process yet. 
            Please wait for the driver to arrive and request verification.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#0b0f14] border border-white/10 rounded-2xl max-w-4xl w-full p-0 shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#0b0f14]/80 backdrop-blur-md z-10">
          <h2 className="text-xl font-black text-white flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-[#ff8a3d]/20 flex items-center justify-center text-[#ff8a3d]"><MdOutlineVerifiedUser /></span>
            ASR Verification Upload
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-6">
            
            {/* Status Banner */}
            {asrStatus && (
            <div className="px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex justify-between items-center">
                <p className="text-sm font-bold text-blue-400">
                STATUS: <span className="uppercase">{asrStatus.status}</span>
                </p>
                {asrStatus.requestedAt && (
                <p className="text-xs text-blue-300/70 font-mono">
                    REQ: {new Date(asrStatus.requestedAt).toLocaleTimeString()}
                </p>
                )}
            </div>
            )}

            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
                <h3 className="font-bold text-yellow-500 mb-2 flex items-center gap-2">Requirements</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[
                        "Aadhaar Front (Mandatory)",
                        "Aadhaar Back (Optional)",
                        "PAN Card (Optional)", 
                        "Valid 12-digit Aadhaar Number",
                        "Ensure good lighting"
                    ].map((item, i) => (
                        <li key={i} className="text-sm text-yellow-200/80 flex items-start gap-2">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0" />
                            {item}
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">
                    Aadhaar Number <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={aadhaarNumber}
                    onChange={handleAadhaarNumberChange}
                    placeholder="XXXX-XXXX-XXXX"
                    maxLength={14}
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:border-[#ff8a3d] focus:outline-none focus:ring-1 focus:ring-[#ff8a3d]/50 text-white font-mono text-lg placeholder-slate-600 transition-all"
                />
                <p className="text-xs text-slate-500 mt-2">
                    Format: 12-digit unique identification number
                </p>
            </div>

            {/* Front Upload */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors">
                <label className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-white">Aadhaar Front Side <span className="text-red-500">*</span></span>
                    {frontPreview && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-bold">Uploaded</span>}
                </label>
                
                {frontPreview ? (
                        <div className="relative group">
                        <img src={frontPreview} alt="Front" className="w-full h-48 object-contain rounded-lg bg-black/40 border border-white/5" />
                        <button onClick={() => {setAadhaarFront(null); setFrontPreview(null);}} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold text-red-500">Remove</button>
                        </div>
                ) : (
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:bg-white/5 hover:border-[#ff8a3d]/50 transition-all group">
                        <div className="flex items-center gap-3">
                             <span className="text-2xl group-hover:scale-110 transition-transform text-slate-500 group-hover:text-[#ff8a3d]"><FaCloudUploadAlt /></span>
                             <span className="text-xs text-slate-400 font-bold tracking-wider">Tap to Upload Front Side</span>
                        </div>
                        <input type="file" accept="image/*" capture="environment" onChange={handleFrontUpload} className="hidden" />
                    </label>
                )}
            </div>

            {/* Back Upload */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors">
                 <label className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-slate-300">Aadhaar Back Side</span>
                    {backPreview && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-bold">Uploaded</span>}
                </label>
                {backPreview ? (
                    <div className="relative group">
                        <img src={backPreview} alt="Back" className="w-full h-32 object-contain rounded-lg bg-black/40 border border-white/5" />
                        <button onClick={() => {setAadhaarBack(null); setBackPreview(null);}} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold text-red-500 text-xs">Remove</button>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:bg-white/5 hover:border-white/30 transition-all">
                         <div className="flex items-center gap-3">
                            <span className="text-xl text-slate-600"><FaCloudUploadAlt /></span>
                             <span className="text-xs text-slate-500 font-bold  tracking-wider">Tap to Upload Back Side</span>
                         </div>
                        <input type="file" accept="image/*" capture="environment" onChange={handleBackUpload} className="hidden" />
                    </label>
                )}
            </div>

            {/* PAN Upload */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors">
                <label className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-slate-300">PAN Card (Optional)</span>
                    {panPreview && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-bold">Uploaded</span>}
                </label>
                {panPreview ? (
                    <div className="relative group">
                        <img src={panPreview} alt="PAN" className="w-full h-32 object-contain rounded-lg bg-black/40 border border-white/5" />
                        <button onClick={() => {setPanCard(null); setPanPreview(null);}} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold text-red-500 text-xs">Remove</button>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:bg-white/5 hover:border-white/30 transition-all">
                        <div className="flex items-center gap-3">
                            <span className="text-xl text-slate-600"><FaCloudUploadAlt /></span>
                             <span className="text-xs text-slate-500 font-bold  tracking-wider">Tap to Upload PAN Card</span>
                         </div>
                        <input type="file" accept="image/*" capture="environment" onChange={handlePanUpload} className="hidden" />
                    </label>
                )}
            </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-[#0b0f14]/80 backdrop-blur-md sticky bottom-0 z-10 flex gap-4">
           <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-bold transition-all border border-transparent hover:border-white/10"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!aadhaarFront || !aadhaarNumber || aadhaarNumber.replace(/\D/g, '').length !== 12 || uploading}
            className="flex-1 px-4 py-3 bg-[#ff8a3d] hover:bg-[#ff9f63] text-black rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,138,61,0.2)] hover:shadow-[0_0_30px_rgba(255,138,61,0.4)]"
          >
            {uploading ? "Uploading..." : "Submit Verification"}
          </button>
        </div>
      </div>
    </div>
  );
}
