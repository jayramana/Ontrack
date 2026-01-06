import { useState, useEffect, useRef } from "react";
import api, { API_BASE_URL } from "../../services/api";
import * as signalR from "@microsoft/signalr";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

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
  
  const [confirmData, setConfirmData] = useState({
    open: false,
    title: "",
    desc: "",
    action: null
  });

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

          setAsrStatus(null);
        } else {
          throw err;
        }
      }
    } catch (err) {
      console.error("Error loading data:", err);
      if (err.response?.status !== 404) {
        toast.error("Error loading order details: " + (err.response?.data?.message || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  // Setup SignalR
  useEffect(() => {
    const setupSignalR = async () => {
      try {
        const hubUrl = API_BASE_URL.replace("/api", "/hubs/logistics");

        const conn = new signalR.HubConnectionBuilder()
          .withUrl(hubUrl, {
            accessTokenFactory: () => localStorage.getItem("token") || "",
          })
          .withAutomaticReconnect()
          .build();

        conn.on("CustomerDocumentsUploaded", (data) => {
          if (data.orderId === parseInt(orderId)) {
            toast.info("Customer has uploaded ID documents!");
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
            toast.success(`Admin approved ASR: ${data.reason}`);
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
      toast.success(response.data.message);
      await loadData();
    } catch (err) {
      toast.error("Error initiating ASR: " + (err.response?.data?.message || err.message));
      console.error("Initiate error:", err.response?.data);
    } finally {
      setInitiating(false);
    }
  };

  // Handle Retry
  const handleRetry = async () => {
    setConfirmData({
      open: true,
      title: "Confirm Retry",
      desc: "Are you sure you want to retry? This will allow you and the customer to edit response.",
      action: async () => {
        try {
          setLoading(true);
          await api.post(`/asr/driver/retry/${asrStatus.asrId}`);
          toast.info("Retry initiated! Re-capture or ask customer to re-upload.");
          await loadData();
        } catch (err) {
          toast.error("Error resetting ASR: " + (err.response?.data?.message || err.message));
        } finally {
          setLoading(false);
        }
      }
    });
  };


  // Handle Re-initiate (for reassigned orders)
  const handleReinitiate = async () => {
    setConfirmData({
      open: true,
      title: "Confirm Re-initiate",
      desc: "This will allow the customer to re-upload their documents. Continue?",
      action: async () => {
        try {
          setLoading(true);
          await api.post(`/asr/driver/reinitiate/${orderId}`);
          toast.info("ASR re-initiated! Customer notified.");

          // Clear local states
          setCustomerPhoto(null);
          setCustomerPhotoPreview(null);
          setSignatureData(null);
          setIsCapturingSignature(false);

          await loadData();
        } catch (err) {
          toast.error("Error re-initiating ASR: " + (err.response?.data?.message || err.message));
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Handle Open Step 1 (Allow customer to re-edit)
  const handleOpenStep1 = async () => {
    setConfirmData({
      open: true,
      title: "Open Step 1",
      desc: "This will allow the customer to EDIT their uploaded documents and re-submit. Continue?",
      action: async () => {
        try {
          setLoading(true);
          await api.post(`/asr/driver/open-step1/${asrStatus.asrId}`);
          toast.success("Step 1 opened! Customer can now re-edit.");
          await loadData();
        } catch (err) {
          toast.error("Error opening Step 1: " + (err.response?.data?.message || err.message));
        } finally {
          setLoading(false);
        }
      }
    });
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
    // Check if we have (New Local OR Existing Remote) for BOTH photo and signature
    const hasPhoto = customerPhoto || (asrStatus && asrStatus.hasPhoto);
    const hasSignature = signatureData || (asrStatus && asrStatus.hasSignature);

    if (!hasPhoto || !hasSignature) {
      toast.warning("Please ensure both customer photo and signature are captured.");
      return;
    }

    if (!asrStatus?.asrId) {
      toast.error("ASR not initiated yet. Please initiate ASR first.");
      return;
    }

    try {
      setUploading(true);

      //const signatureKey = await uploadToS3(signatureFile);
      // const photoKey = await uploadToS3(customerPhoto);
      // 1. Upload Customer Photo to local storage
      const photoKey = customerPhoto ? await uploadFile(customerPhoto) : null;

      // 2. Convert Signature to Blob and Upload to S3 (only if new)
      let signatureKey = null;
      if (signatureData) {
        // If signatureData starts with data:, it's new. If it's a URL, it's existing.
        // Wait, signatureData state is set to URL when we load? No, we don't set signatureData on load.
        // valid: signatureData is only set by saveSignature (dataURL). 
        // So if signatureData is present, it IS new.
        const signatureBlob = dataURLtoBlob(signatureData);
        const signatureFile = new File([signatureBlob], "signature.png", { type: "image/png" });
        signatureKey = await uploadFile(signatureFile);
      }

      // 3. Submit Keys to ASR Service
      const response = await api.post(`/asr/driver/upload-captures/${asrStatus.asrId}`, {
        customerPhotoUrl: photoKey,
        signatureUrl: signatureKey
      });

      toast.success("Captures uploaded! Waiting for AI verification...");
      await loadData();
    } catch (err) {
      toast.error("Upload error: " + (err.response?.data?.message || err.message));
      console.error("Upload error:", err.response?.data);
    } finally {
      setUploading(false);
    }
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/uploads/files", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data.key;
  };

  const dataURLtoBlob = (dataURL) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const handleCompleteDelivery = async () => {

    if (!canCompleteDelivery) {
      toast.error("Cannot complete delivery - ASR verification not successful");
      return;
    }

    try {
      await api.post(`/driver/mark-delivered/${orderId}`);
      toast.success("Delivery completed successfully!");
      if (onClose) onClose();
    } catch (err) {
      toast.error("Error completing delivery: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div
          className="
          bg-white/5 backdrop-blur-xl
          border border-white/10
          rounded-3xl
          px-8 py-6
          shadow-2xl
          flex flex-col items-center gap-3
        "
        >
          {/* Spinner */}
          <div
            className="
            h-10 w-10
            rounded-full
            border-4 border-white/10
            border-t-[#ff8a3d]
            animate-spin
          "
          />

          <p className="text-slate-300 font-medium">
            Loading ASR verification…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[45] flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
      <div
        className="
        bg-white/5 backdrop-blur-xl
        border border-white/10
        rounded-3xl
        max-w-4xl w-full
        max-h-[90vh] overflow-y-auto
        text-slate-100
        [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
      "
      >
        {/* HEADER */}
        <div className="sticky top-0 z-10 px-6 py-5 border-b border-white/10 bg-black/30 backdrop-blur-xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black text-white">
                🔒 ASR Verification Required
              </h1>
              <p className="text-slate-400 text-sm">
                Order #{orderId} — {order?.customerName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white text-3xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* ASR STATUS */}
          {asrStatus && (
            <div
              className={`
                rounded-2xl p-5 border
                ${asrStatus.status?.toLowerCase() === "success" || asrStatus.status?.toLowerCase() === "adminoverride"
                  ? "bg-green-500/10 border-green-500/30"
                  : asrStatus.status?.toLowerCase() === "failed"
                    ? "bg-red-500/10 border-red-500/30"
                    : asrStatus.status?.toLowerCase() === "inprogress"
                      ? "bg-yellow-500/10 border-yellow-500/30"
                      : "bg-blue-500/10 border-blue-500/30"
                }
              `}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold">
                    Status: {asrStatus.status}
                  </h3>
                  {asrStatus.score && (
                    <p className="text-sm text-slate-400">
                      AI Confidence: {(asrStatus.score * 100).toFixed(1)}%
                    </p>
                  )}
                </div>

                {asrStatus.status?.toLowerCase() === "success" && (
                  <div className="text-green-400 text-3xl">✓</div>
                )}
              </div>

              {asrStatus.reasons?.length > 0 && (
                <div className="mt-4 bg-black/30 border border-white/10 rounded-xl p-4">
                  <p className="font-semibold text-sm mb-2">Details</p>
                  <ul className="text-sm text-slate-300 space-y-1">
                    {asrStatus.reasons.map((r, i) => (
                      <li key={i}>• {r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* RETRY & RESET BUTTONS (Only if Failed) */}
              {asrStatus.status?.toLowerCase() === "failed" && (
                <div className="mt-4 flex justify-end gap-3">
                  <button
                    onClick={handleOpenStep1}
                    className="
                              px-4 py-2 rounded-xl
                              bg-amber-500/20 text-amber-200 font-bold
                              hover:bg-amber-500/30
                              border border-amber-500/30
                          "
                  >
                    📂 Open Step 1
                  </button>


                  <button
                    onClick={handleRetry}
                    className="
                              px-4 py-2 rounded-xl
                              bg-white/10 text-white font-bold
                              hover:bg-white/20
                              border border-white/20
                          "
                  >
                    🔄 Retry Verification
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 1 */}
          {!asrStatus && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-2">
                Step 1: Request Documents
              </h2>
              <p className="text-slate-400 mb-4">
                Notify customer to upload Aadhaar or PAN card. Use "Re-initiate" if this order was reassigned.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleInitiateASR}
                  disabled={initiating}
                  className="
                    flex-1 px-6 py-3 rounded-xl
                    bg-[#ff8a3d] text-black font-bold
                    hover:opacity-90
                    disabled:opacity-50
                  "
                >
                  {initiating ? "Sending…" : "🔔 Send ASR Request"}
                </button>

                <button
                  onClick={handleReinitiate}
                  disabled={loading}
                  className="
                    flex-1 px-6 py-3 rounded-xl
                    bg-blue-500/20 text-blue-200 font-bold
                    hover:bg-500/30
                    border border-blue-500/30
                    disabled:opacity-50
                  "
                >
                  {loading ? "Processing..." : "🔄 Re-initiate ASR"}
                </button>
              </div>
            </div>
          )}

          {/* WAITING */}
          {asrStatus && !asrStatus.hasDocuments && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-yellow-300 mb-2">
                ⏳ Waiting for Customer
              </h2>
              <p className="text-yellow-200">
                Customer notification sent. Waiting for ID upload…
              </p>
              <button
                onClick={loadData}
                className="
                mt-4 px-4 py-2 rounded-xl
                bg-yellow-500 text-black font-bold
                hover:opacity-90
              "
              >
                🔄 Refresh Status
              </button>
            </div>
          )}

          {/* CAPTURE */}
          {asrStatus && asrStatus.hasDocuments && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">
                Step 2: Capture Photo & Signature
              </h2>

              {/* PHOTO */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">📸 Customer Photo</h3>

                {/* Show existing photo if available and not yet replaced locally */}
                {!customerPhoto && asrStatus.hasPhoto && (
                  <div className="mb-4">
                    <img
                      src={asrStatus.customerPhotoUrl}
                      alt="Existing Customer Photo"
                      className="w-48 h-48 object-cover rounded-xl border border-white/10 mb-2"
                    />
                    <p className="text-xs text-green-400 mb-2">✓ Photo already uploaded</p>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoCapture}
                  className="
                  block w-full text-sm text-slate-300
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-xl file:border-0
                  file:bg-white/10 file:text-white
                  hover:file:bg-white/20
                "
                />

                {customerPhotoPreview && (
                  <img
                    src={customerPhotoPreview}
                    alt="Customer"
                    className="mt-4 w-48 h-48 object-cover rounded-xl border border-white/10"
                  />
                )}
              </div>

              {/* SIGNATURE */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">✍️ Signature</h3>


                {/* Show existing signature if available and not capturing */}
                {!isCapturingSignature && !signatureData && asrStatus.hasSignature && (
                  <div className="mb-4">
                    <img
                      src={asrStatus.signatureUrl}
                      alt="Existing Signature"
                      className="border border-white/10 rounded-xl bg-white mb-2"
                    />
                    <p className="text-xs text-green-400 mb-2">✓ Signature already uploaded</p>
                  </div>
                )}

                {!isCapturingSignature && !signatureData && (
                  <button
                    onClick={() => setIsCapturingSignature(true)}
                    className="
                    px-4 py-2 rounded-xl
                    bg-[#ff8a3d] text-black font-bold
                  "
                  >
                    {asrStatus.hasSignature ? "Retake Signature" : "Start Capture"}
                  </button>
                )}

                {isCapturingSignature && (
                  <>
                    <canvas
                      ref={canvasRef}
                      width={400}
                      height={200}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      className="
                      border border-white/20
                      rounded-xl bg-white
                      cursor-crosshair touch-none
                    "
                    />
                    <div className="flex gap-3 mt-3">
                      <button
                        onClick={clearSignature}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20"
                      >
                        Clear
                      </button>
                      <button
                        onClick={saveSignature}
                        className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 font-bold"
                      >
                        Save
                      </button>
                    </div>
                  </>
                )}

                {signatureData && !isCapturingSignature && (
                  <>
                    <img
                      src={signatureData}
                      alt="Signature"
                      className="border border-white/10 rounded-xl bg-white"
                    />
                    <button
                      onClick={() => setIsCapturingSignature(true)}
                      className="mt-2 px-4 py-2 rounded-xl bg-[#ff8a3d] text-black font-bold"
                    >
                      Retake
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={handleUploadCaptures}
                // Allow upload if we have local files OR (existing files AND we are just triggering verification?)
                // Actually, uploadCaptures overwrites. 
                // We should only enable if we have NEW captures OR we have existing captures and just want to verify?
                // For simplicity: If they are here, they probably captured something new.
                // But if they just want to retry with SAME data, they need a way to Trigger Verification without uploading?
                // Wait, Retry automatically resets status to Pending. 
                // If they want to retry with SAME data, they should click "Upload & Verify" and we should handle "use existing if not new".
                // But UploadDriverCaptures expects files.

                // Let's enforce: You must capture at least ONE thing to re-upload. 
                // OR checking valid state:
                disabled={
                  uploading ||
                  // Disabled if we don't have (New Local OR Existing Remote) for BOTH photo and signature
                  !((customerPhoto || asrStatus.hasPhoto) && (signatureData || asrStatus.hasSignature))
                }
                className="
                w-full px-6 py-3 rounded-xl
                bg-[#ff8a3d] text-black font-bold
                disabled:opacity-50
              "
              >
                {uploading ? "Uploading…" : "📤 Upload & Verify"}
              </button>
            </div>
          )}

          {/* COMPLETE DELIVERY */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Complete Delivery</h2>

            {!canCompleteDelivery && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl mb-4">
                ⚠️ ASR verification required
              </div>
            )}

            <button
              onClick={handleCompleteDelivery}
              disabled={!canCompleteDelivery}
              className="
              w-full px-6 py-3 rounded-xl font-bold
              bg-green-600 hover:bg-green-700
              disabled:opacity-50
            "
            >
              {canCompleteDelivery
                ? "✓ Mark Delivered"
                : "🔒 Waiting for Verification"}
            </button>
          </div>

        </div>
      </div>
      <AlertDialog open={confirmData.open} onOpenChange={(open) => setConfirmData(prev => ({ ...prev, open }))}>
        <AlertDialogContent className="z-[60] bg-[#1a1f29] border border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">{confirmData.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              {confirmData.desc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-[#ff8a3d] text-black hover:bg-[#ff8a3d]/90 font-bold border-none"
              onClick={(e) => {
              if (confirmData.action) {
                 confirmData.action();
              }
            }}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}