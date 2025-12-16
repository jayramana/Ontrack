// // // import { useState, useEffect, useRef } from "react";
// // // import api from "../../services/api";
// // // import * as signalR from "@microsoft/signalr";

// // // export default function DriverASRVerification({ orderId, onClose }) {
// // //   const [order, setOrder] = useState(null);
// // //   const [asrStatus, setAsrStatus] = useState(null);
// // //   const [loading, setLoading] = useState(true);
  
// // //   // Capture states
// // //   const [customerPhoto, setCustomerPhoto] = useState(null);
// // //   const [customerPhotoPreview, setCustomerPhotoPreview] = useState(null);
// // //   const [isCapturingSignature, setIsCapturingSignature] = useState(false);
// // //   const [signatureData, setSignatureData] = useState(null);
  
// // //   // Verification states
// // //   const [verificationResult, setVerificationResult] = useState(null);
// // //   const [canCompleteDelivery, setCanCompleteDelivery] = useState(false);
  
// // //   const canvasRef = useRef(null);
// // //   const [isDrawing, setIsDrawing] = useState(false);
  
// // //   const [connection, setConnection] = useState(null);

// // //   // Load order and ASR status
// // //   useEffect(() => {
// // //     const loadData = async () => {
// // //       try {
// // //         const [orderRes, asrRes] = await Promise.all([
// // //           api.get(`/driver/order/${orderId}`),
// // //           api.get(`/asr/driver/status/${orderId}`)
// // //         ]);
        
// // //         setOrder(orderRes.data);
// // //         setAsrStatus(asrRes.data);
        
// // //         if (asrRes.data.status === "Success" || asrRes.data.status === "AdminOverride") {
// // //           setCanCompleteDelivery(true);
// // //         }
// // //       } catch (err) {
// // //         console.error("Error loading ASR data:", err);
// // //       } finally {
// // //         setLoading(false);
// // //       }
// // //     };

// // //     loadData();
// // //   }, [orderId]);

// // //   // Setup SignalR
// // //   useEffect(() => {
// // //     const setupSignalR = async () => {
// // //       const conn = new signalR.HubConnectionBuilder()
// // //         .withUrl("http://localhost:5066/hubs/logistics", {
// // //           accessTokenFactory: () => localStorage.getItem("token") || "",
// // //         })
// // //         .withAutomaticReconnect()
// // //         .build();

// // //       conn.on("CustomerDocumentsUploaded", (data) => {
// // //         if (data.orderId === parseInt(orderId)) {
// // //           alert("Customer has uploaded ID documents!");
// // //           loadAsrStatus();
// // //         }
// // //       });

// // //       conn.on("ASRVerificationCompleted", (data) => {
// // //         if (data.orderId === parseInt(orderId)) {
// // //           setVerificationResult(data);
// // //           if (data.status === "Success") {
// // //             setCanCompleteDelivery(true);
// // //           }
// // //         }
// // //       });

// // //       conn.on("ASRAdminOverride", (data) => {
// // //         if (data.orderId === parseInt(orderId)) {
// // //           alert(`Admin approved ASR: ${data.reason}`);
// // //           setCanCompleteDelivery(true);
// // //         }
// // //       });

// // //       await conn.start();
// // //       const user = JSON.parse(localStorage.getItem("user") || "{}");
// // //       if (user.userId) {
// // //         await conn.invoke("JoinDriverGroup", user.userId);
// // //       }
      
// // //       setConnection(conn);
// // //     };

// // //     setupSignalR();
// // //     return () => connection?.stop();
// // //   }, [orderId]);

// // //   const loadAsrStatus = async () => {
// // //     try {
// // //       const res = await api.get(`/asr/driver/status/${orderId}`);
// // //       setAsrStatus(res.data);
// // //     } catch (err) {
// // //       console.error("Error loading ASR status:", err);
// // //     }
// // //   };

// // //   // Initiate ASR Request
// // //   const handleInitiateASR = async () => {
// // //     try {
// // //       await api.post(`/asr/driver/initiate/${orderId}`);
// // //       alert("ASR verification request sent to customer!");
// // //       loadAsrStatus();
// // //     } catch (err) {
// // //       alert("Error initiating ASR: " + (err.response?.data?.message || err.message));
// // //     }
// // //   };

// // //   // Handle photo capture
// // //   const handlePhotoCapture = (e) => {
// // //     const file = e.target.files[0];
// // //     if (file) {
// // //       setCustomerPhoto(file);
// // //       setCustomerPhotoPreview(URL.createObjectURL(file));
// // //     }
// // //   };

// // //   // Signature canvas
// // //   const startDrawing = (e) => {
// // //     setIsDrawing(true);
// // //     const canvas = canvasRef.current;
// // //     const ctx = canvas.getContext("2d");
// // //     const rect = canvas.getBoundingClientRect();
// // //     ctx.beginPath();
// // //     ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
// // //   };

// // //   const draw = (e) => {
// // //     if (!isDrawing) return;
// // //     const canvas = canvasRef.current;
// // //     const ctx = canvas.getContext("2d");
// // //     const rect = canvas.getBoundingClientRect();
// // //     ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
// // //     ctx.stroke();
// // //   };

// // //   const stopDrawing = () => {
// // //     setIsDrawing(false);
// // //   };

// // //   const clearSignature = () => {
// // //     const canvas = canvasRef.current;
// // //     const ctx = canvas.getContext("2d");
// // //     ctx.clearRect(0, 0, canvas.width, canvas.height);
// // //     setSignatureData(null);
// // //   };

// // //   const saveSignature = () => {
// // //     const canvas = canvasRef.current;
// // //     const dataUrl = canvas.toDataURL("image/png");
// // //     setSignatureData(dataUrl);
// // //     setIsCapturingSignature(false);
// // //   };

// // //   // Upload captures to server
// // //   const handleUploadCaptures = async () => {
// // //     if (!customerPhoto || !signatureData) {
// // //       alert("Please capture customer photo and signature");
// // //       return;
// // //     }

// // //     try {
// // //       // Convert photo to base64
// // //       const photoBase64 = await fileToBase64(customerPhoto);
      
// // //       await api.post(`/asr/driver/upload-captures/${asrStatus.asrId}`, {
// // //         customerPhotoUrl: photoBase64,
// // //         signatureUrl: signatureData
// // //       });

// // //       alert("Captures uploaded! Waiting for AI verification...");
// // //       loadAsrStatus();
// // //     } catch (err) {
// // //       alert("Upload error: " + (err.response?.data?.message || err.message));
// // //     }
// // //   };

// // //   const fileToBase64 = (file) => {
// // //     return new Promise((resolve, reject) => {
// // //       const reader = new FileReader();
// // //       reader.readAsDataURL(file);
// // //       reader.onload = () => resolve(reader.result);
// // //       reader.onerror = (error) => reject(error);
// // //     });
// // //   };

// // //   const handleCompleteDelivery = async () => {
// // //     if (!canCompleteDelivery) {
// // //       alert("Cannot complete delivery - ASR verification not successful");
// // //       return;
// // //     }

// // //     try {
// // //       await api.post(`/driver/mark-delivered/${orderId}`);
// // //       alert("Delivery completed successfully!");
// // //       if (onClose) onClose();
// // //     } catch (err) {
// // //       alert("Error completing delivery");
// // //     }
// // //   };

// // //   if (loading) {
// // //     return (
// // //       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
// // //         <div className="bg-white rounded-xl p-6">
// // //           <p className="text-[#351c15]">Loading ASR verification...</p>
// // //         </div>
// // //       </div>
// // //     );
// // //   }

// // //   return (
// // //     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
// // //       <div className="bg-[#f7f3ef] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
// // //         {/* Header */}
// // //         <div className="bg-[#fff8e7] border-b border-[#e6ddc5] p-6 sticky top-0 z-10">
// // //           <div className="flex justify-between items-center">
// // //             <div>
// // //               <h1 className="text-2xl font-bold text-[#351c15]">
// // //                 🔒 ASR Verification Required
// // //               </h1>
// // //               <p className="text-[#6f4e37]">Order #{orderId} - {order?.customerName}</p>
// // //             </div>
// // //             <button
// // //               onClick={onClose}
// // //               className="text-[#351c15] hover:text-[#2b160f] text-2xl font-bold"
// // //             >
// // //               ×
// // //             </button>
// // //           </div>
// // //         </div>

// // //         <div className="p-6 space-y-6">
// // //           {/* ASR Status Card */}
// // //           <div className={`border-l-4 p-4 rounded-lg ${
// // //             asrStatus?.status === "Success" ? "bg-green-50 border-green-500" :
// // //             asrStatus?.status === "Failed" ? "bg-red-50 border-red-500" :
// // //             asrStatus?.status === "InProgress" ? "bg-yellow-50 border-yellow-500" :
// // //             "bg-blue-50 border-blue-500"
// // //           }`}>
// // //             <div className="flex justify-between items-center">
// // //               <div>
// // //                 <h3 className="font-bold text-lg text-[#351c15]">
// // //                   Status: {asrStatus?.status || "Not Started"}
// // //                 </h3>
// // //                 {asrStatus?.score && (
// // //                   <p className="text-sm text-[#6f4e37]">
// // //                     AI Confidence: {(asrStatus.score * 100).toFixed(1)}%
// // //                   </p>
// // //                 )}
// // //               </div>

// // //               {asrStatus?.status === "Success" && (
// // //                 <div className="text-green-600 text-3xl">✓</div>
// // //               )}
// // //             </div>

// // //             {asrStatus?.reasons && asrStatus.reasons.length > 0 && (
// // //               <div className="mt-3 bg-white p-3 rounded border border-[#e6ddc5]">
// // //                 <p className="font-semibold text-sm text-[#351c15] mb-1">Details:</p>
// // //                 <ul className="text-sm text-[#6f4e37] space-y-1">
// // //                   {asrStatus.reasons.map((reason, idx) => (
// // //                     <li key={idx}>• {reason}</li>
// // //                   ))}
// // //                 </ul>
// // //               </div>
// // //             )}
// // //           </div>

// // //           {/* Step 1: Initiate ASR */}
// // //           {!asrStatus?.asrId && (
// // //             <div className="bg-[#fff8e7] border border-[#e6ddc5] rounded-xl p-6">
// // //               <h2 className="text-xl font-bold text-[#351c15] mb-3">Step 1: Request Documents</h2>
// // //               <p className="text-[#6f4e37] mb-4">
// // //                 Notify customer to upload Aadhaar or PAN card
// // //               </p>
// // //               <button
// // //                 onClick={handleInitiateASR}
// // //                 className="px-6 py-3 bg-[#351c15] text-white rounded-lg hover:bg-[#2b160f] font-semibold shadow"
// // //               >
// // //                 🔔 Send ASR Request
// // //               </button>
// // //             </div>
// // //           )}

// // //           {/* Step 2: Waiting for customer */}
// // //           {asrStatus?.asrId && !asrStatus?.hasDocuments && (
// // //             <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-6">
// // //               <h2 className="text-xl font-bold text-yellow-800 mb-2">
// // //                 ⏳ Waiting for Customer
// // //               </h2>
// // //               <p className="text-yellow-700">
// // //                 Customer notification sent. Waiting for ID upload...
// // //               </p>
// // //             </div>
// // //           )}

// // //           {/* Step 3: Capture photo & signature */}
// // //           {asrStatus?.hasDocuments && !asrStatus?.hasPhoto && (
// // //             <div className="bg-[#fff8e7] border border-[#e6ddc5] rounded-xl p-6">
// // //               <h2 className="text-xl font-bold text-[#351c15] mb-4">
// // //                 Step 2: Capture Photo & Signature
// // //               </h2>

// // //               {/* Photo */}
// // //               <div className="mb-6">
// // //                 <h3 className="font-semibold text-[#351c15] mb-2">📸 Customer Photo</h3>
// // //                 <input
// // //                   type="file"
// // //                   accept="image/*"
// // //                   onChange={handlePhotoCapture}
// // //                   className="mb-3"
// // //                 />
// // //                 {customerPhotoPreview && (
// // //                   <img 
// // //                     src={customerPhotoPreview} 
// // //                     alt="Customer" 
// // //                     className="w-48 h-48 object-cover rounded-lg border-2 border-[#e6ddc5]"
// // //                   />
// // //                 )}
// // //               </div>

// // //               {/* Signature */}
// // //               <div className="mb-6">
// // //                 <h3 className="font-semibold text-[#351c15] mb-2">✍️ Signature</h3>
                
// // //                 {!isCapturingSignature && !signatureData && (
// // //                   <button
// // //                     onClick={() => setIsCapturingSignature(true)}
// // //                     className="px-4 py-2 bg-[#f9b400] text-[#351c15] rounded-lg hover:bg-[#e0a200]"
// // //                   >
// // //                     Start Capture
// // //                   </button>
// // //                 )}

// // //                 {isCapturingSignature && (
// // //                   <div>
// // //                     <canvas
// // //                       ref={canvasRef}
// // //                       width={400}
// // //                       height={200}
// // //                       onMouseDown={startDrawing}
// // //                       onMouseMove={draw}
// // //                       onMouseUp={stopDrawing}
// // //                       onMouseLeave={stopDrawing}
// // //                       className="border-2 border-[#351c15] rounded-lg bg-white cursor-crosshair"
// // //                     />
// // //                     <div className="flex gap-3 mt-3">
// // //                       <button
// // //                         onClick={clearSignature}
// // //                         className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
// // //                       >
// // //                         Clear
// // //                       </button>
// // //                       <button
// // //                         onClick={saveSignature}
// // //                         className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
// // //                       >
// // //                         Save
// // //                       </button>
// // //                     </div>
// // //                   </div>
// // //                 )}

// // //                 {signatureData && !isCapturingSignature && (
// // //                   <div>
// // //                     <img 
// // //                       src={signatureData} 
// // //                       alt="Signature" 
// // //                       className="border-2 border-[#e6ddc5] rounded-lg bg-white"
// // //                     />
// // //                     <button
// // //                       onClick={() => setIsCapturingSignature(true)}
// // //                       className="mt-2 px-4 py-2 bg-[#f9b400] text-[#351c15] rounded-lg"
// // //                     >
// // //                       Retake
// // //                     </button>
// // //                   </div>
// // //                 )}
// // //               </div>

// // //               <button
// // //                 onClick={handleUploadCaptures}
// // //                 disabled={!customerPhoto || !signatureData}
// // //                 className="w-full px-6 py-3 bg-[#351c15] text-white rounded-lg hover:bg-[#2b160f] font-semibold disabled:opacity-50"
// // //               >
// // //                 📤 Upload & Verify
// // //               </button>
// // //             </div>
// // //           )}

// // //           {/* Verification Result */}
// // //           {verificationResult && (
// // //             <div className={`border-l-4 p-6 rounded-lg ${
// // //               verificationResult.status === "Success" 
// // //                 ? "bg-green-50 border-green-500" 
// // //                 : "bg-red-50 border-red-500"
// // //             }`}>
// // //               <h2 className="text-xl font-bold mb-3">
// // //                 {verificationResult.status === "Success" ? "✅ Verified" : "❌ Failed"}
// // //               </h2>
// // //               <p className="text-sm mb-2">Score: {(verificationResult.score * 100).toFixed(1)}%</p>
// // //               <div className="bg-white p-3 rounded">
// // //                 <ul className="text-sm space-y-1">
// // //                   {verificationResult.reasons?.map((r, i) => (
// // //                     <li key={i}>• {r}</li>
// // //                   ))}
// // //                 </ul>
// // //               </div>
// // //             </div>
// // //           )}

// // //           {/* Complete Delivery */}
// // //           <div className="bg-[#fff8e7] border border-[#e6ddc5] rounded-xl p-6">
// // //             <h2 className="text-xl font-bold text-[#351c15] mb-4">Complete Delivery</h2>
            
// // //             {!canCompleteDelivery && (
// // //               <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-lg mb-4">
// // //                 <p className="text-yellow-800">
// // //                   ⚠️ ASR verification required
// // //                 </p>
// // //               </div>
// // //             )}

// // //             <button
// // //               onClick={handleCompleteDelivery}
// // //               disabled={!canCompleteDelivery}
// // //               className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50"
// // //             >
// // //               {canCompleteDelivery ? "✓ Mark Delivered" : "🔒 Waiting for Verification"}
// // //             </button>
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // import { useState, useEffect, useRef } from "react";
// // import api from "../../services/api";
// // import * as signalR from "@microsoft/signalr";

// // export default function DriverASRVerification({ orderId, onClose }) {
// //   const [order, setOrder] = useState(null);
// //   const [asrStatus, setAsrStatus] = useState(null);
// //   const [loading, setLoading] = useState(true);
// //   const [initiating, setInitiating] = useState(false);
  
// //   // Capture states
// //   const [customerPhoto, setCustomerPhoto] = useState(null);
// //   const [customerPhotoPreview, setCustomerPhotoPreview] = useState(null);
// //   const [isCapturingSignature, setIsCapturingSignature] = useState(false);
// //   const [signatureData, setSignatureData] = useState(null);
// //   const [uploading, setUploading] = useState(false);
  
// //   // Verification states
// //   const [verificationResult, setVerificationResult] = useState(null);
// //   const [canCompleteDelivery, setCanCompleteDelivery] = useState(false);
  
// //   const canvasRef = useRef(null);
// //   const [isDrawing, setIsDrawing] = useState(false);
  
// //   const [connection, setConnection] = useState(null);

// //   // Load order and ASR status
// //   useEffect(() => {
// //     loadData();
// //   }, [orderId]);

// //   const loadData = async () => {
// //     try {
// //       setLoading(true);
      
// //       // Load order details
// //       const orderRes = await api.get(`/driver/order/${orderId}`);
// //       setOrder(orderRes.data);
      
// //       // Try to load ASR status (might not exist yet)
// //       try {
// //         const asrRes = await api.get(`/asr/driver/status/${orderId}`);
// //         setAsrStatus(asrRes.data);
        
// //         if (asrRes.data.status === "Success" || asrRes.data.status === "AdminOverride") {
// //           setCanCompleteDelivery(true);
// //         }
// //       } catch (err) {
// //         // ASR doesn't exist yet - this is fine
// //         if (err.response?.status === 404) {
// //           console.log("ASR not initiated yet");
// //           setAsrStatus(null);
// //         } else {
// //           throw err;
// //         }
// //       }
// //     } catch (err) {
// //       console.error("Error loading data:", err);
// //       alert("Error loading order details: " + (err.response?.data?.message || err.message));
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // Setup SignalR
// //   useEffect(() => {
// //     const setupSignalR = async () => {
// //       try {
// //         const conn = new signalR.HubConnectionBuilder()
// //           .withUrl("http://localhost:5066/hubs/logistics", {
// //             accessTokenFactory: () => localStorage.getItem("token") || "",
// //           })
// //           .withAutomaticReconnect()
// //           .build();

// //         conn.on("CustomerDocumentsUploaded", (data) => {
// //           if (data.orderId === parseInt(orderId)) {
// //             alert("Customer has uploaded ID documents!");
// //             loadData();
// //           }
// //         });

// //         conn.on("ASRVerificationCompleted", (data) => {
// //           if (data.orderId === parseInt(orderId)) {
// //             setVerificationResult(data);
// //             if (data.status === "Success") {
// //               setCanCompleteDelivery(true);
// //             }
// //             loadData();
// //           }
// //         });

// //         conn.on("ASRAdminOverride", (data) => {
// //           if (data.orderId === parseInt(orderId)) {
// //             alert(`Admin approved ASR: ${data.reason}`);
// //             setCanCompleteDelivery(true);
// //             loadData();
// //           }
// //         });

// //         await conn.start();
// //         const user = JSON.parse(localStorage.getItem("user") || "{}");
// //         if (user.userId) {
// //           await conn.invoke("JoinDriverGroup", user.userId);
// //         }
        
// //         setConnection(conn);
// //       } catch (err) {
// //         console.error("SignalR error:", err);
// //       }
// //     };

// //     setupSignalR();
// //     return () => connection?.stop();
// //   }, [orderId]);

// //   // Initiate ASR Request
// //   const handleInitiateASR = async () => {
// //     try {
// //       setInitiating(true);
// //       const response = await api.post(`/asr/driver/initiate/${orderId}`);
// //       alert(response.data.message);
// //       await loadData();
// //     } catch (err) {
// //       alert("Error initiating ASR: " + (err.response?.data?.message || err.message));
// //       console.error("Initiate error:", err.response?.data);
// //     } finally {
// //       setInitiating(false);
// //     }
// //   };

// //   // Handle photo capture
// //   const handlePhotoCapture = (e) => {
// //     const file = e.target.files[0];
// //     if (file) {
// //       setCustomerPhoto(file);
// //       setCustomerPhotoPreview(URL.createObjectURL(file));
// //     }
// //   };

// //   // Signature canvas
// //   const startDrawing = (e) => {
// //     setIsDrawing(true);
// //     const canvas = canvasRef.current;
// //     const ctx = canvas.getContext("2d");
// //     const rect = canvas.getBoundingClientRect();
// //     ctx.beginPath();
// //     ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
// //   };

// //   const draw = (e) => {
// //     if (!isDrawing) return;
// //     const canvas = canvasRef.current;
// //     const ctx = canvas.getContext("2d");
// //     const rect = canvas.getBoundingClientRect();
// //     ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
// //     ctx.stroke();
// //   };

// //   const stopDrawing = () => {
// //     setIsDrawing(false);
// //   };

// //   const clearSignature = () => {
// //     const canvas = canvasRef.current;
// //     const ctx = canvas.getContext("2d");
// //     ctx.clearRect(0, 0, canvas.width, canvas.height);
// //     setSignatureData(null);
// //   };

// //   const saveSignature = () => {
// //     const canvas = canvasRef.current;
// //     const dataUrl = canvas.toDataURL("image/png");
// //     setSignatureData(dataUrl);
// //     setIsCapturingSignature(false);
// //   };

// //   // Upload captures to server
// //   const handleUploadCaptures = async () => {
// //     if (!customerPhoto || !signatureData) {
// //       alert("Please capture customer photo and signature");
// //       return;
// //     }

// //     if (!asrStatus?.asrId) {
// //       alert("ASR not initiated yet. Please initiate ASR first.");
// //       return;
// //     }

// //     try {
// //       setUploading(true);
      
// //       // Convert photo to base64
// //       const photoBase64 = await fileToBase64(customerPhoto);
      
// //       const response = await api.post(`/asr/driver/upload-captures/${asrStatus.asrId}`, {
// //         customerPhotoUrl: photoBase64,
// //         signatureUrl: signatureData
// //       });

// //       alert("Captures uploaded! Waiting for AI verification...");
// //       await loadData();
// //     } catch (err) {
// //       alert("Upload error: " + (err.response?.data?.message || err.message));
// //       console.error("Upload error:", err.response?.data);
// //     } finally {
// //       setUploading(false);
// //     }
// //   };

// //   const fileToBase64 = (file) => {
// //     return new Promise((resolve, reject) => {
// //       const reader = new FileReader();
// //       reader.readAsDataURL(file);
// //       reader.onload = () => resolve(reader.result);
// //       reader.onerror = (error) => reject(error);
// //     });
// //   };

// //   const handleCompleteDelivery = async () => {
// //     if (!canCompleteDelivery) {
// //       alert("Cannot complete delivery - ASR verification not successful");
// //       return;
// //     }

// //     try {
// //       await api.post(`/driver/mark-delivered/${orderId}`);
// //       alert("Delivery completed successfully!");
// //       if (onClose) onClose();
// //     } catch (err) {
// //       alert("Error completing delivery: " + (err.response?.data?.message || err.message));
// //     }
// //   };

// //   if (loading) {
// //     return (
// //       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
// //         <div className="bg-white rounded-xl p-6">
// //           <p className="text-[#351c15]">Loading ASR verification...</p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
// //       <div className="bg-[#f7f3ef] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
// //         {/* Header */}
// //         <div className="bg-[#fff8e7] border-b border-[#e6ddc5] p-6 sticky top-0 z-10">
// //           <div className="flex justify-between items-center">
// //             <div>
// //               <h1 className="text-2xl font-bold text-[#351c15]">
// //                 🔒 ASR Verification Required
// //               </h1>
// //               <p className="text-[#6f4e37]">Order #{orderId} - {order?.customerName}</p>
// //             </div>
// //             <button
// //               onClick={onClose}
// //               className="text-[#351c15] hover:text-[#2b160f] text-2xl font-bold"
// //             >
// //               ×
// //             </button>
// //           </div>
// //         </div>

// //         <div className="p-6 space-y-6">
// //           {/* ASR Status Card */}
// //           {asrStatus && (
// //             <div className={`border-l-4 p-4 rounded-lg ${
// //               asrStatus.status === "Success" ? "bg-green-50 border-green-500" :
// //               asrStatus.status === "Failed" ? "bg-red-50 border-red-500" :
// //               asrStatus.status === "InProgress" ? "bg-yellow-50 border-yellow-500" :
// //               "bg-blue-50 border-blue-500"
// //             }`}>
// //               <div className="flex justify-between items-center">
// //                 <div>
// //                   <h3 className="font-bold text-lg text-[#351c15]">
// //                     Status: {asrStatus.status}
// //                   </h3>
// //                   {asrStatus.score && (
// //                     <p className="text-sm text-[#6f4e37]">
// //                       AI Confidence: {(asrStatus.score * 100).toFixed(1)}%
// //                     </p>
// //                   )}
// //                 </div>

// //                 {asrStatus.status === "Success" && (
// //                   <div className="text-green-600 text-3xl">✓</div>
// //                 )}
// //               </div>

// //               {asrStatus.reasons && asrStatus.reasons.length > 0 && (
// //                 <div className="mt-3 bg-white p-3 rounded border border-[#e6ddc5]">
// //                   <p className="font-semibold text-sm text-[#351c15] mb-1">Details:</p>
// //                   <ul className="text-sm text-[#6f4e37] space-y-1">
// //                     {asrStatus.reasons.map((reason, idx) => (
// //                       <li key={idx}>• {reason}</li>
// //                     ))}
// //                   </ul>
// //                 </div>
// //               )}
// //             </div>
// //           )}

// //           {/* Step 1: Initiate ASR */}
// //           {!asrStatus && (
// //             <div className="bg-[#fff8e7] border border-[#e6ddc5] rounded-xl p-6">
// //               <h2 className="text-xl font-bold text-[#351c15] mb-3">Step 1: Request Documents</h2>
// //               <p className="text-[#6f4e37] mb-4">
// //                 Notify customer to upload Aadhaar or PAN card
// //               </p>
// //               <button
// //                 onClick={handleInitiateASR}
// //                 disabled={initiating}
// //                 className="px-6 py-3 bg-[#351c15] text-white rounded-lg hover:bg-[#2b160f] font-semibold shadow disabled:opacity-50"
// //               >
// //                 {initiating ? "Sending..." : "🔔 Send ASR Request"}
// //               </button>
// //             </div>
// //           )}

// //           {/* Step 2: Waiting for customer */}
// //           {asrStatus && !asrStatus.hasDocuments && (
// //             <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-6">
// //               <h2 className="text-xl font-bold text-yellow-800 mb-2">
// //                 ⏳ Waiting for Customer
// //               </h2>
// //               <p className="text-yellow-700">
// //                 Customer notification sent. Waiting for ID upload...
// //               </p>
// //               <button
// //                 onClick={loadData}
// //                 className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
// //               >
// //                 🔄 Refresh Status
// //               </button>
// //             </div>
// //           )}

// //           {/* Step 3: Capture photo & signature */}
// //           {asrStatus && asrStatus.hasDocuments && !asrStatus.hasPhoto && (
// //             <div className="bg-[#fff8e7] border border-[#e6ddc5] rounded-xl p-6">
// //               <h2 className="text-xl font-bold text-[#351c15] mb-4">
// //                 Step 2: Capture Photo & Signature
// //               </h2>

// //               {/* Photo */}
// //               <div className="mb-6">
// //                 <h3 className="font-semibold text-[#351c15] mb-2">📸 Customer Photo</h3>
// //                 <input
// //                   type="file"
// //                   accept="image/*"
// //                   capture="environment"
// //                   onChange={handlePhotoCapture}
// //                   className="mb-3 block w-full text-sm text-[#6f4e37]
// //                     file:mr-4 file:py-2 file:px-4
// //                     file:rounded-lg file:border-0
// //                     file:text-sm file:font-semibold
// //                     file:bg-[#f9b400] file:text-[#351c15]
// //                     hover:file:bg-[#e0a200]"
// //                 />
// //                 {customerPhotoPreview && (
// //                   <img 
// //                     src={customerPhotoPreview} 
// //                     alt="Customer" 
// //                     className="w-48 h-48 object-cover rounded-lg border-2 border-[#e6ddc5]"
// //                   />
// //                 )}
// //               </div>

// //               {/* Signature */}
// //               <div className="mb-6">
// //                 <h3 className="font-semibold text-[#351c15] mb-2">✍️ Signature</h3>
                
// //                 {!isCapturingSignature && !signatureData && (
// //                   <button
// //                     onClick={() => setIsCapturingSignature(true)}
// //                     className="px-4 py-2 bg-[#f9b400] text-[#351c15] rounded-lg hover:bg-[#e0a200]"
// //                   >
// //                     Start Capture
// //                   </button>
// //                 )}

// //                 {isCapturingSignature && (
// //                   <div>
// //                     <canvas
// //                       ref={canvasRef}
// //                       width={400}
// //                       height={200}
// //                       onMouseDown={startDrawing}
// //                       onMouseMove={draw}
// //                       onMouseUp={stopDrawing}
// //                       onMouseLeave={stopDrawing}
// //                       onTouchStart={(e) => {
// //                         e.preventDefault();
// //                         const touch = e.touches[0];
// //                         const mouseEvent = new MouseEvent('mousedown', {
// //                           clientX: touch.clientX,
// //                           clientY: touch.clientY
// //                         });
// //                         canvasRef.current.dispatchEvent(mouseEvent);
// //                       }}
// //                       onTouchMove={(e) => {
// //                         e.preventDefault();
// //                         const touch = e.touches[0];
// //                         const mouseEvent = new MouseEvent('mousemove', {
// //                           clientX: touch.clientX,
// //                           clientY: touch.clientY
// //                         });
// //                         canvasRef.current.dispatchEvent(mouseEvent);
// //                       }}
// //                       onTouchEnd={(e) => {
// //                         e.preventDefault();
// //                         stopDrawing();
// //                       }}
// //                       className="border-2 border-[#351c15] rounded-lg bg-white cursor-crosshair w-full"
// //                     />
// //                     <div className="flex gap-3 mt-3">
// //                       <button
// //                         onClick={clearSignature}
// //                         className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
// //                       >
// //                         Clear
// //                       </button>
// //                       <button
// //                         onClick={saveSignature}
// //                         className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
// //                       >
// //                         Save
// //                       </button>
// //                     </div>
// //                   </div>
// //                 )}

// //                 {signatureData && !isCapturingSignature && (
// //                   <div>
// //                     <img 
// //                       src={signatureData} 
// //                       alt="Signature" 
// //                       className="border-2 border-[#e6ddc5] rounded-lg bg-white max-w-full"
// //                     />
// //                     <button
// //                       onClick={() => {
// //                         setSignatureData(null);
// //                         setIsCapturingSignature(true);
// //                       }}
// //                       className="mt-2 px-4 py-2 bg-[#f9b400] text-[#351c15] rounded-lg"
// //                     >
// //                       Retake
// //                     </button>
// //                   </div>
// //                 )}
// //               </div>

// //               <button
// //                 onClick={handleUploadCaptures}
// //                 disabled={!customerPhoto || !signatureData || uploading}
// //                 className="w-full px-6 py-3 bg-[#351c15] text-white rounded-lg hover:bg-[#2b160f] font-semibold disabled:opacity-50"
// //               >
// //                 {uploading ? "Uploading..." : "📤 Upload & Verify"}
// //               </button>
// //             </div>
// //           )}

// //           {/* Verification Result */}
// //           {verificationResult && (
// //             <div className={`border-l-4 p-6 rounded-lg ${
// //               verificationResult.status === "Success" 
// //                 ? "bg-green-50 border-green-500" 
// //                 : "bg-red-50 border-red-500"
// //             }`}>
// //               <h2 className="text-xl font-bold mb-3">
// //                 {verificationResult.status === "Success" ? "✅ Verified" : "❌ Failed"}
// //               </h2>
// //               <p className="text-sm mb-2">Score: {(verificationResult.score * 100).toFixed(1)}%</p>
// //               <div className="bg-white p-3 rounded">
// //                 <ul className="text-sm space-y-1">
// //                   {verificationResult.reasons?.map((r, i) => (
// //                     <li key={i}>• {r}</li>
// //                   ))}
// //                 </ul>
// //               </div>
// //             </div>
// //           )}

// //           {/* Complete Delivery */}
// //           <div className="bg-[#fff8e7] border border-[#e6ddc5] rounded-xl p-6">
// //             <h2 className="text-xl font-bold text-[#351c15] mb-4">Complete Delivery</h2>
            
// //             {!canCompleteDelivery && (
// //               <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-lg mb-4">
// //                 <p className="text-yellow-800">
// //                   ⚠️ ASR verification required before delivery
// //                 </p>
// //               </div>
// //             )}

// //             <button
// //               onClick={handleCompleteDelivery}
// //               disabled={!canCompleteDelivery}
// //               className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
// //             >
// //               {canCompleteDelivery ? "✓ Mark Delivered" : "🔒 Waiting for Verification"}
// //             </button>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// import { useState, useEffect, useRef } from "react";
// import api from "../../services/api";
// import * as signalR from "@microsoft/signalr";

// export default function DriverASRVerification({ orderId, onClose }) {
//   const [order, setOrder] = useState(null);
//   const [asrStatus, setAsrStatus] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [initiating, setInitiating] = useState(false);
  
//   // Capture states
//   const [customerPhoto, setCustomerPhoto] = useState(null);
//   const [customerPhotoPreview, setCustomerPhotoPreview] = useState(null);
//   const [signatureData, setSignatureData] = useState(null);
//   const [signaturePreview, setSignaturePreview] = useState(null);
//   const [uploading, setUploading] = useState(false);
  
//   // Verification states
//   const [verificationResult, setVerificationResult] = useState(null);
//   const [canCompleteDelivery, setCanCompleteDelivery] = useState(false);
  
//   const [connection, setConnection] = useState(null);

//   // Load order and ASR status
//   useEffect(() => {
//     loadData();
//   }, [orderId]);

//   const loadData = async () => {
//     try {
//       setLoading(true);
      
//       // Load order details
//       const orderRes = await api.get(`/driver/order/${orderId}`);
//       setOrder(orderRes.data);
      
//       // Try to load ASR status (might not exist yet)
//       try {
//         const asrRes = await api.get(`/asr/driver/status/${orderId}`);
//         setAsrStatus(asrRes.data);
        
//         if (asrRes.data.status === "Success" || asrRes.data.status === "AdminOverride") {
//           setCanCompleteDelivery(true);
//         }
//       } catch (err) {
//         // ASR doesn't exist yet - this is fine
//         if (err.response?.status === 404) {
//           console.log("ASR not initiated yet");
//           setAsrStatus(null);
//         } else {
//           throw err;
//         }
//       }
//     } catch (err) {
//       console.error("Error loading data:", err);
//       alert("Error loading order details: " + (err.response?.data?.message || err.message));
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Setup SignalR
//   useEffect(() => {
//     const setupSignalR = async () => {
//       try {
//         const conn = new signalR.HubConnectionBuilder()
//           .withUrl("http://localhost:5066/hubs/logistics", {
//             accessTokenFactory: () => localStorage.getItem("token") || "",
//           })
//           .withAutomaticReconnect()
//           .build();

//         conn.on("CustomerDocumentsUploaded", (data) => {
//           if (data.orderId === parseInt(orderId)) {
//             alert("Customer has uploaded ID documents!");
//             loadData();
//           }
//         });

//         conn.on("ASRVerificationCompleted", (data) => {
//           if (data.orderId === parseInt(orderId)) {
//             setVerificationResult(data);
//             if (data.status === "Success") {
//               setCanCompleteDelivery(true);
//             }
//             loadData();
//           }
//         });

//         conn.on("ASRAdminOverride", (data) => {
//           if (data.orderId === parseInt(orderId)) {
//             alert(`Admin approved ASR: ${data.reason}`);
//             setCanCompleteDelivery(true);
//             loadData();
//           }
//         });

//         await conn.start();
//         const user = JSON.parse(localStorage.getItem("user") || "{}");
//         if (user.userId) {
//           await conn.invoke("JoinDriverGroup", user.userId);
//         }
        
//         setConnection(conn);
//       } catch (err) {
//         console.error("SignalR error:", err);
//       }
//     };

//     setupSignalR();
//     return () => connection?.stop();
//   }, [orderId]);

//   // Initiate ASR Request
//   const handleInitiateASR = async () => {
//     try {
//       setInitiating(true);
//       const response = await api.post(`/asr/driver/initiate/${orderId}`);
//       alert(response.data.message);
//       await loadData();
//     } catch (err) {
//       alert("Error initiating ASR: " + (err.response?.data?.message || err.message));
//       console.error("Initiate error:", err.response?.data);
//     } finally {
//       setInitiating(false);
//     }
//   };

//   // Handle photo capture
//   const handlePhotoCapture = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setCustomerPhoto(file);
//       setCustomerPhotoPreview(URL.createObjectURL(file));
//     }
//   };

//   // Handle signature upload
//   const handleSignatureUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = (event) => {
//         setSignatureData(event.target.result);
//         setSignaturePreview(event.target.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   // Upload captures to server
//   const handleUploadCaptures = async () => {
//     if (!customerPhoto || !signatureData) {
//       alert("Please capture customer photo and signature");
//       return;
//     }

//     if (!asrStatus?.asrId) {
//       alert("ASR not initiated yet. Please initiate ASR first.");
//       return;
//     }

//     try {
//       setUploading(true);
      
//       // Convert photo to base64
//       const photoBase64 = await fileToBase64(customerPhoto);
      
//       const response = await api.post(`/asr/driver/upload-captures/${asrStatus.asrId}`, {
//         customerPhotoUrl: photoBase64,
//         signatureUrl: signatureData
//       });

//       alert("Captures uploaded! Waiting for AI verification...");
//       await loadData();
//     } catch (err) {
//       alert("Upload error: " + (err.response?.data?.message || err.message));
//       console.error("Upload error:", err.response?.data);
//     } finally {
//       setUploading(false);
//     }
//   };

//   const fileToBase64 = (file) => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.readAsDataURL(file);
//       reader.onload = () => resolve(reader.result);
//       reader.onerror = (error) => reject(error);
//     });
//   };

//   const handleCompleteDelivery = async () => {
//     if (!canCompleteDelivery) {
//       alert("Cannot complete delivery - ASR verification not successful");
//       return;
//     }

//     try {
//       await api.post(`/driver/mark-delivered/${orderId}`);
//       alert("Delivery completed successfully!");
//       if (onClose) onClose();
//     } catch (err) {
//       alert("Error completing delivery: " + (err.response?.data?.message || err.message));
//     }
//   };

//   if (loading) {
//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//         <div className="bg-white rounded-xl p-6">
//           <p className="text-[#351c15]">Loading ASR verification...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
//       <div className="bg-[#f7f3ef] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//         {/* Header */}
//         <div className="bg-[#fff8e7] border-b border-[#e6ddc5] p-6 sticky top-0 z-10">
//           <div className="flex justify-between items-center">
//             <div>
//               <h1 className="text-2xl font-bold text-[#351c15]">
//                 🔒 ASR Verification Required
//               </h1>
//               <p className="text-[#6f4e37]">Order #{orderId} - {order?.customerName}</p>
//             </div>
//             <button
//               onClick={onClose}
//               className="text-[#351c15] hover:text-[#2b160f] text-2xl font-bold"
//             >
//               ×
//             </button>
//           </div>
//         </div>

//         <div className="p-6 space-y-6">
//           {/* ASR Status Card */}
//           {asrStatus && (
//             <div className={`border-l-4 p-4 rounded-lg ${
//               asrStatus.status === "Success" ? "bg-green-50 border-green-500" :
//               asrStatus.status === "Failed" ? "bg-red-50 border-red-500" :
//               asrStatus.status === "InProgress" ? "bg-yellow-50 border-yellow-500" :
//               "bg-blue-50 border-blue-500"
//             }`}>
//               <div className="flex justify-between items-center">
//                 <div>
//                   <h3 className="font-bold text-lg text-[#351c15]">
//                     Status: {asrStatus.status}
//                   </h3>
//                   {asrStatus.score && (
//                     <p className="text-sm text-[#6f4e37]">
//                       AI Confidence: {(asrStatus.score * 100).toFixed(1)}%
//                     </p>
//                   )}
//                 </div>

//                 {asrStatus.status === "Success" && (
//                   <div className="text-green-600 text-3xl">✓</div>
//                 )}
//               </div>

//               {asrStatus.reasons && asrStatus.reasons.length > 0 && (
//                 <div className="mt-3 bg-white p-3 rounded border border-[#e6ddc5]">
//                   <p className="font-semibold text-sm text-[#351c15] mb-1">Details:</p>
//                   <ul className="text-sm text-[#6f4e37] space-y-1">
//                     {asrStatus.reasons.map((reason, idx) => (
//                       <li key={idx}>• {reason}</li>
//                     ))}
//                   </ul>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Step 1: Initiate ASR */}
//           {!asrStatus && (
//             <div className="bg-[#fff8e7] border border-[#e6ddc5] rounded-xl p-6">
//               <h2 className="text-xl font-bold text-[#351c15] mb-3">Step 1: Request Documents</h2>
//               <p className="text-[#6f4e37] mb-4">
//                 Notify customer to upload Aadhaar or PAN card
//               </p>
//               <button
//                 onClick={handleInitiateASR}
//                 disabled={initiating}
//                 className="px-6 py-3 bg-[#351c15] text-white rounded-lg hover:bg-[#2b160f] font-semibold shadow disabled:opacity-50"
//               >
//                 {initiating ? "Sending..." : "🔔 Send ASR Request"}
//               </button>
//             </div>
//           )}

//           {/* Step 2: Waiting for customer */}
//           {asrStatus && !asrStatus.hasDocuments && (
//             <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-6">
//               <h2 className="text-xl font-bold text-yellow-800 mb-2">
//                 ⏳ Waiting for Customer
//               </h2>
//               <p className="text-yellow-700">
//                 Customer notification sent. Waiting for ID upload...
//               </p>
//               <button
//                 onClick={loadData}
//                 className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
//               >
//                 🔄 Refresh Status
//               </button>
//             </div>
//           )}

//           {/* Step 3: Capture photo & signature */}
//           {asrStatus && asrStatus.hasDocuments && !asrStatus.hasPhoto && (
//             <div className="bg-[#fff8e7] border border-[#e6ddc5] rounded-xl p-6">
//               <h2 className="text-xl font-bold text-[#351c15] mb-4">
//                 Step 2: Capture Photo & Signature
//               </h2>

//               {/* Photo */}
//               <div className="mb-6">
//                 <h3 className="font-semibold text-[#351c15] mb-2">📸 Customer Photo</h3>
//                 <input
//                   type="file"
//                   accept="image/*"
//                   capture="environment"
//                   onChange={handlePhotoCapture}
//                   className="mb-3 block w-full text-sm text-[#6f4e37]
//                     file:mr-4 file:py-2 file:px-4
//                     file:rounded-lg file:border-0
//                     file:text-sm file:font-semibold
//                     file:bg-[#f9b400] file:text-[#351c15]
//                     hover:file:bg-[#e0a200]"
//                 />
//                 {customerPhotoPreview && (
//                   <img 
//                     src={customerPhotoPreview} 
//                     alt="Customer" 
//                     className="w-48 h-48 object-cover rounded-lg border-2 border-[#e6ddc5]"
//                   />
//                 )}
//               </div>

//               {/* Signature */}
//               <div className="mb-6">
//                 <h3 className="font-semibold text-[#351c15] mb-2">✍️ Customer Signature</h3>
                
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handleSignatureUpload}
//                   className="block w-full text-sm text-[#6f4e37]
//                     file:mr-4 file:py-2 file:px-4
//                     file:rounded-lg file:border-0
//                     file:text-sm file:font-semibold
//                     file:bg-[#f9b400] file:text-[#351c15]
//                     hover:file:bg-[#e0a200]"
//                 />
//                 <p className="text-xs text-[#6f4e37] mt-1">
//                   Upload a photo of the customer's signature (white background preferred)
//                 </p>

//                 {signaturePreview && (
//                   <div className="mt-3">
//                     <img 
//                       src={signaturePreview} 
//                       alt="Signature" 
//                       className="w-full max-w-md h-32 object-contain bg-white rounded-lg border-2 border-[#e6ddc5] p-2"
//                     />
//                     <button
//                       onClick={() => {
//                         setSignatureData(null);
//                         setSignaturePreview(null);
//                       }}
//                       className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
//                     >
//                       Remove
//                     </button>
//                   </div>
//                 )}
//               </div>

//               <button
//                 onClick={handleUploadCaptures}
//                 disabled={!customerPhoto || !signatureData || uploading}
//                 className="w-full px-6 py-3 bg-[#351c15] text-white rounded-lg hover:bg-[#2b160f] font-semibold disabled:opacity-50"
//               >
//                 {uploading ? "Uploading..." : "📤 Upload & Verify"}
//               </button>
//             </div>
//           )}

//           {/* Verification Result */}
//           {verificationResult && (
//             <div className={`border-l-4 p-6 rounded-lg ${
//               verificationResult.status === "Success" 
//                 ? "bg-green-50 border-green-500" 
//                 : "bg-red-50 border-red-500"
//             }`}>
//               <h2 className="text-xl font-bold mb-3">
//                 {verificationResult.status === "Success" ? "✅ Verified" : "❌ Failed"}
//               </h2>
//               <p className="text-sm mb-2">Score: {(verificationResult.score * 100).toFixed(1)}%</p>
//               <div className="bg-white p-3 rounded">
//                 <ul className="text-sm space-y-1">
//                   {verificationResult.reasons?.map((r, i) => (
//                     <li key={i}>• {r}</li>
//                   ))}
//                 </ul>
//               </div>
//             </div>
//           )}

//           {/* Complete Delivery */}
//           <div className="bg-[#fff8e7] border border-[#e6ddc5] rounded-xl p-6">
//             <h2 className="text-xl font-bold text-[#351c15] mb-4">Complete Delivery</h2>
            
//             {!canCompleteDelivery && (
//               <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-lg mb-4">
//                 <p className="text-yellow-800">
//                   ⚠️ ASR verification required before delivery
//                 </p>
//               </div>
//             )}

//             <button
//               onClick={handleCompleteDelivery}
//               disabled={!canCompleteDelivery}
//               className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {canCompleteDelivery ? "✓ Mark Delivered" : "🔒 Waiting for Verification"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
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
  const [signatureData, setSignatureData] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Verification states
  const [verificationResult, setVerificationResult] = useState(null);
  const [aadhaarData, setAadhaarData] = useState(null);
  const [canCompleteDelivery, setCanCompleteDelivery] = useState(false);
  
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

        // Extract Aadhaar data from metadata if available
        if (asrRes.data.metadata && asrRes.data.metadata.aadhaarData) {
          setAadhaarData(asrRes.data.metadata.aadhaarData);
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
      alert("Error loading order details: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Setup SignalR
  useEffect(() => {
    const setupSignalR = async () => {
      try {
        const conn = new signalR.HubConnectionBuilder()
          .withUrl("http://localhost:5066/hubs/logistics", {
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
              alert("✅ Verification successful! You can now complete delivery.");
            } else if (data.status === "Failed") {
              alert("❌ Verification failed. Please check the details.");
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

  // Handle signature upload
  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSignatureData(event.target.result);
        setSignaturePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
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

      // Handle verification response from Python service
      if (response.data.status === "Success") {
        setVerificationResult({
          status: response.data.status,
          score: response.data.score,
          reasons: response.data.reasons
        });
        
        if (response.data.aadhaarData) {
          setAadhaarData(response.data.aadhaarData);
        }
        
        setCanCompleteDelivery(true);
        alert("✅ Verification successful! You can now complete delivery.");
      } else if (response.data.status === "Failed") {
        setVerificationResult({
          status: response.data.status,
          score: response.data.score,
          reasons: response.data.reasons
        });
        alert("❌ Verification failed. Please review the reasons and try again.");
      } else {
        alert("Captures uploaded! Verification in progress...");
      }

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
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-800 font-semibold">Loading ASR verification...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-50 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 sticky top-0 z-10 rounded-t-xl shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <span className="mr-2">🔒</span>
                ASR Verification Required
              </h1>
              <p className="text-blue-100 mt-1">
                Order #{orderId} {order?.customerName ? `- ${order.customerName}` : ""}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-3xl font-bold leading-none transition-colors"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* ASR Status Card */}
          {asrStatus && (
            <div className={`border-l-4 p-5 rounded-lg shadow-md transition-all ${
              asrStatus.status === "Success" ? "bg-green-50 border-green-500" :
              asrStatus.status === "Failed" ? "bg-red-50 border-red-500" :
              asrStatus.status === "InProgress" ? "bg-yellow-50 border-yellow-500" :
              asrStatus.status === "AdminOverride" ? "bg-purple-50 border-purple-500" :
              "bg-blue-50 border-blue-500"
            }`}>
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="font-bold text-lg flex items-center">
                    {asrStatus.status === "Success" && <span className="mr-2">✅</span>}
                    {asrStatus.status === "Failed" && <span className="mr-2">❌</span>}
                    {asrStatus.status === "InProgress" && <span className="mr-2">⏳</span>}
                    {asrStatus.status === "AdminOverride" && <span className="mr-2">👤</span>}
                    Status: {asrStatus.status}
                  </h3>
                  {asrStatus.score !== null && asrStatus.score !== undefined && (
                    <p className="text-sm text-gray-700 mt-1">
                      AI Confidence: <span className="font-semibold">{(asrStatus.score * 100).toFixed(1)}%</span>
                    </p>
                  )}
                  {asrStatus.retryCount > 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      Retry Count: {asrStatus.retryCount}
                    </p>
                  )}
                </div>

                {asrStatus.status === "Success" && (
                  <div className="text-green-600 text-5xl">✓</div>
                )}
                {asrStatus.status === "Failed" && (
                  <div className="text-red-600 text-5xl">✗</div>
                )}
              </div>

              {asrStatus.reasons && asrStatus.reasons.length > 0 && (
                <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <p className="font-semibold text-sm mb-2 text-gray-800">Verification Details:</p>
                  <ul className="text-sm space-y-2">
                    {asrStatus.reasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="mr-2 mt-0.5">
                          {reason.includes("✓") || reason.toLowerCase().includes("confirmed") || reason.toLowerCase().includes("valid") 
                            ? "✅" 
                            : reason.includes("✗") || reason.toLowerCase().includes("failed") 
                            ? "❌" 
                            : "ℹ️"}
                        </span>
                        <span className="text-gray-700">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Aadhaar Data Display */}
          {aadhaarData && (
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-300 rounded-lg p-5 shadow-md">
              <h3 className="font-bold text-indigo-900 mb-4 flex items-center text-lg">
                <span className="mr-2 text-2xl">🆔</span>
                Verified Aadhaar Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {aadhaarData.name && (
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <span className="font-semibold text-indigo-800 block mb-1">Name:</span>
                    <p className="text-indigo-900">{aadhaarData.name}</p>
                  </div>
                )}
                {(aadhaarData.dob || aadhaarData.yob) && (
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <span className="font-semibold text-indigo-800 block mb-1">Date of Birth:</span>
                    <p className="text-indigo-900">{aadhaarData.dob || `Year: ${aadhaarData.yob}`}</p>
                  </div>
                )}
                {aadhaarData.gender && (
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <span className="font-semibold text-indigo-800 block mb-1">Gender:</span>
                    <p className="text-indigo-900">{aadhaarData.gender}</p>
                  </div>
                )}
                {aadhaarData.maskedAadhaar && (
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <span className="font-semibold text-indigo-800 block mb-1">Aadhaar Number:</span>
                    <p className="text-indigo-900 font-mono">{aadhaarData.maskedAadhaar}</p>
                  </div>
                )}
                {aadhaarData.address && (
                  <div className="bg-white p-3 rounded-lg shadow-sm md:col-span-2">
                    <span className="font-semibold text-indigo-800 block mb-1">Address:</span>
                    <p className="text-indigo-900">{aadhaarData.address}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 1: Initiate ASR */}
          {!asrStatus && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
              <div className="flex items-start mb-4">
                <div className="bg-blue-100 rounded-full p-3 mr-4">
                  <span className="text-2xl">📋</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">Step 1: Request Documents</h2>
                  <p className="text-gray-600">
                    Send notification to customer to upload their Aadhaar or PAN card for identity verification
                  </p>
                </div>
              </div>
              <button
                onClick={handleInitiateASR}
                disabled={initiating}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <span className="mr-2">🔔</span>
                {initiating ? "Sending Request..." : "Send ASR Request"}
              </button>
            </div>
          )}

          {/* Step 2: Waiting for customer */}
          {asrStatus && !asrStatus.hasDocuments && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 shadow-md">
              <div className="flex items-start mb-4">
                <div className="animate-pulse bg-yellow-200 rounded-full p-3 mr-4">
                  <span className="text-2xl">⏳</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-yellow-900 mb-2">
                    Waiting for Customer Documents
                  </h2>
                  <p className="text-yellow-700">
                    Customer notification has been sent. They need to upload their ID documents to proceed.
                  </p>
                </div>
              </div>
              <button
                onClick={loadData}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-semibold shadow transition-colors flex items-center"
              >
                <span className="mr-2">🔄</span>
                Refresh Status
              </button>
            </div>
          )}

          {/* Step 3: Capture photo & signature */}
          {asrStatus && asrStatus.hasDocuments && !asrStatus.hasPhoto && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
              <div className="flex items-start mb-5">
                <div className="bg-green-100 rounded-full p-3 mr-4">
                  <span className="text-2xl">📸</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    Step 2: Capture Photo & Signature
                  </h2>
                  <p className="text-gray-600">
                    Customer has uploaded their documents. Now capture their photo and signature for verification.
                  </p>
                </div>
              </div>

              {/* Photo Capture */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="mr-2">📸</span>
                  Customer Photo (Live Capture)
                </h3>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoCapture}
                  className="mb-3 block w-full text-sm text-gray-700
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-600 file:text-white
                    hover:file:bg-blue-700
                    file:cursor-pointer file:shadow-sm"
                />
                {customerPhotoPreview && (
                  <div className="mt-3">
                    <img 
                      src={customerPhotoPreview} 
                      alt="Customer" 
                      className="w-48 h-48 object-cover rounded-lg border-4 border-blue-200 shadow-md"
                    />
                    <button
                      onClick={() => {
                        setCustomerPhoto(null);
                        setCustomerPhotoPreview(null);
                      }}
                      className="mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Signature Capture */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="mr-2">✍️</span>
                  Customer Signature
                </h3>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSignatureUpload}
                  className="block w-full text-sm text-gray-700
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-600 file:text-white
                    hover:file:bg-blue-700
                    file:cursor-pointer file:shadow-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  📝 Capture a photo of the customer's signature on white paper
                </p>

                {signaturePreview && (
                  <div className="mt-3">
                    <img 
                      src={signaturePreview} 
                      alt="Signature" 
                      className="w-full max-w-md h-32 object-contain bg-white rounded-lg border-4 border-blue-200 p-3 shadow-md"
                    />
                    <button
                      onClick={() => {
                        setSignatureData(null);
                        setSignaturePreview(null);
                      }}
                      className="mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleUploadCaptures}
                disabled={!customerPhoto || !signatureData || uploading}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-bold text-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Uploading & Verifying...
                  </>
                ) : (
                  <>
                    <span className="mr-2">📤</span>
                    Upload & Verify with AI
                  </>
                )}
              </button>
            </div>
          )}

          {/* Verification Result (Real-time from API) */}
          {verificationResult && (
            <div className={`border-l-4 p-6 rounded-lg shadow-lg ${
              verificationResult.status === "Success" 
                ? "bg-green-50 border-green-500" 
                : "bg-red-50 border-red-500"
            }`}>
              <h2 className="text-xl font-bold mb-3 flex items-center">
                {verificationResult.status === "Success" ? (
                  <>
                    <span className="text-3xl mr-2">✅</span>
                    Verification Successful
                  </>
                ) : (
                  <>
                    <span className="text-3xl mr-2">❌</span>
                    Verification Failed
                  </>
                )}
              </h2>
              {verificationResult.score !== null && verificationResult.score !== undefined && (
                <p className="text-sm mb-3 font-semibold">
                  Confidence Score: {(verificationResult.score * 100).toFixed(1)}%
                </p>
              )}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="font-semibold text-sm mb-2">Details:</p>
                <ul className="text-sm space-y-2">
                  {verificationResult.reasons?.map((r, i) => (
                    <li key={i} className="flex items-start">
                      <span className="mr-2">
                        {r.includes("✓") || r.toLowerCase().includes("confirmed") || r.toLowerCase().includes("valid")
                          ? "✅"
                          : r.includes("✗") || r.toLowerCase().includes("failed")
                          ? "❌"
                          : "ℹ️"}
                      </span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Complete Delivery */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">📦</span>
              Complete Delivery
            </h2>
            
            {!canCompleteDelivery && (
              <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-lg mb-4 flex items-start">
                <span className="text-2xl mr-3">⚠️</span>
                <div>
                  <p className="text-yellow-900 font-semibold">ASR Verification Required</p>
                  <p className="text-yellow-700 text-sm mt-1">
                    Complete the verification process before marking this delivery as complete.
                  </p>
                </div>
              </div>
            )}

            {canCompleteDelivery && (
              <div className="bg-green-50 border-2 border-green-300 p-4 rounded-lg mb-4 flex items-start">
                <span className="text-2xl mr-3">✅</span>
                <div>
                  <p className="text-green-900 font-semibold">Ready for Delivery</p>
                  <p className="text-green-700 text-sm mt-1">
                    Verification complete. You can now mark this order as delivered.
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={handleCompleteDelivery}
              disabled={!canCompleteDelivery}
              className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-bold text-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale flex items-center justify-center"
            >
              {canCompleteDelivery ? (
                <>
                  <span className="mr-2">✓</span>
                  Mark as Delivered
                </>
              ) : (
                <>
                  <span className="mr-2">🔒</span>
                  Waiting for Verification
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}