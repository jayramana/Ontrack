// // // import { useState, useEffect } from "react";
// // // import api from "../../services/api";
// // // import * as signalR from "@microsoft/signalr";

// // // export default function CustomerASRUpload({ orderId, onClose }) {
// // //   const [order, setOrder] = useState(null);
// // //   const [asrStatus, setAsrStatus] = useState(null);
// // //   const [loading, setLoading] = useState(true);
  
// // //   // Document upload states
// // //   const [aadhaarFront, setAadhaarFront] = useState(null);
// // //   const [aadhaarBack, setAadhaarBack] = useState(null);
// // //   const [panCard, setPanCard] = useState(null);
  
// // //   // Previews
// // //   const [aadhaarFrontPreview, setAadhaarFrontPreview] = useState(null);
// // //   const [aadhaarBackPreview, setAadhaarBackPreview] = useState(null);
// // //   const [panCardPreview, setPanCardPreview] = useState(null);
  
// // //   const [documentType, setDocumentType] = useState("aadhaar"); // "aadhaar" or "pan"
// // //   const [uploading, setUploading] = useState(false);
// // //   const [uploadSuccess, setUploadSuccess] = useState(false);
  
// // //   const [connection, setConnection] = useState(null);

// // //   useEffect(() => {
// // //     const loadData = async () => {
// // //       try {
// // //         const [orderRes, asrRes] = await Promise.all([
// // //           api.get(`/orders/my-orders/${orderId}`),
// // //           api.get(`/asr/customer/status/${orderId}`)
// // //         ]);
        
// // //         setOrder(orderRes.data);
// // //         setAsrStatus(asrRes.data);
        
// // //         if (asrRes.data.uploadedAt) {
// // //           setUploadSuccess(true);
// // //         }
// // //       } catch (err) {
// // //         console.error("Error loading data:", err);
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

// // //       conn.on("ASRVerificationRequested", (data) => {
// // //         if (data.orderId === parseInt(orderId)) {
// // //           alert("Driver has requested ASR verification. Please upload your ID documents.");
// // //           loadAsrStatus();
// // //         }
// // //       });

// // //       conn.on("ASRVerificationCompleted", (data) => {
// // //         if (data.orderId === parseInt(orderId)) {
// // //           alert(`Verification ${data.status}: ${data.reasons?.join(", ")}`);
// // //           loadAsrStatus();
// // //         }
// // //       });

// // //       await conn.start();
// // //       const user = JSON.parse(localStorage.getItem("user") || "{}");
// // //       if (user.userId) {
// // //         await conn.invoke("JoinOrderGroup", orderId);
// // //       }
      
// // //       setConnection(conn);
// // //     };

// // //     setupSignalR();
// // //     return () => connection?.stop();
// // //   }, [orderId]);

// // //   const loadAsrStatus = async () => {
// // //     try {
// // //       const res = await api.get(`/asr/customer/status/${orderId}`);
// // //       setAsrStatus(res.data);
// // //     } catch (err) {
// // //       console.error("Error loading ASR status:", err);
// // //     }
// // //   };

// // //   const handleFileSelect = (e, type) => {
// // //     const file = e.target.files[0];
// // //     if (!file) return;

// // //     const reader = new FileReader();
// // //     reader.onloadend = () => {
// // //       const base64 = reader.result;

// // //       if (type === "aadhaarFront") {
// // //         setAadhaarFront(base64);
// // //         setAadhaarFrontPreview(base64);
// // //       } else if (type === "aadhaarBack") {
// // //         setAadhaarBack(base64);
// // //         setAadhaarBackPreview(base64);
// // //       } else if (type === "pan") {
// // //         setPanCard(base64);
// // //         setPanCardPreview(base64);
// // //       }
// // //     };
// // //     reader.readAsDataURL(file);
// // //   };

// // //   const handleUpload = async () => {
// // //     const documentUrls = [];

// // //     if (documentType === "aadhaar") {
// // //       if (!aadhaarFront || !aadhaarBack) {
// // //         alert("Please upload both Aadhaar front and back");
// // //         return;
// // //       }
// // //       documentUrls.push(aadhaarFront, aadhaarBack);
// // //     } else {
// // //       if (!panCard) {
// // //         alert("Please upload PAN card");
// // //         return;
// // //       }
// // //       documentUrls.push(panCard);
// // //     }

// // //     setUploading(true);
// // //     try {
// // //       await api.post(`/asr/customer/upload-documents/${asrStatus.asrId}`, {
// // //         documentUrls
// // //       });

// // //       alert("Documents uploaded successfully! Driver has been notified.");
// // //       setUploadSuccess(true);
// // //       loadAsrStatus();
// // //     } catch (err) {
// // //       alert("Upload failed: " + (err.response?.data?.message || err.message));
// // //     } finally {
// // //       setUploading(false);
// // //     }
// // //   };

// // //   if (loading) {
// // //     return (
// // //       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
// // //         <div className="bg-white rounded-xl p-6">
// // //           <p>Loading ASR verification...</p>
// // //         </div>
// // //       </div>
// // //     );
// // //   }

// // //   return (
// // //     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
// // //       <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
// // //         {/* Header */}
// // //         <div className="bg-gradient-to-r from-[#351c15] to-[#6f4e37] text-white p-6 sticky top-0 z-10">
// // //           <div className="flex justify-between items-center">
// // //             <div>
// // //               <h1 className="text-2xl font-bold">🔒 ASR Verification</h1>
// // //               <p className="text-sm mt-1">Order #{orderId}</p>
// // //             </div>
// // //             <button
// // //               onClick={onClose}
// // //               className="text-white hover:text-gray-200 text-2xl font-bold"
// // //             >
// // //               ×
// // //             </button>
// // //           </div>
// // //         </div>

// // //         <div className="p-6 space-y-6">
// // //           {/* Instructions */}
// // //           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
// // //             <h3 className="font-bold text-blue-900 mb-2">📋 Instructions</h3>
// // //             <ul className="text-sm text-blue-800 space-y-1">
// // //               <li>• You must be 18+ years old to receive this delivery</li>
// // //               <li>• Upload clear, high-quality images</li>
// // //               <li>• Ensure all text is readable</li>
// // //               <li>• AI will verify your identity automatically</li>
// // //             </ul>
// // //           </div>

// // //           {/* Status */}
// // //           {asrStatus && (
// // //             <div className={`border-l-4 p-4 rounded-lg ${
// // //               asrStatus.status === "Success" ? "bg-green-50 border-green-500" :
// // //               asrStatus.status === "Pending" ? "bg-yellow-50 border-yellow-500" :
// // //               "bg-blue-50 border-blue-500"
// // //             }`}>
// // //               <h3 className="font-bold text-sm mb-1">
// // //                 Status: {asrStatus.status || "Not Started"}
// // //               </h3>
// // //               {asrStatus.uploadedAt && (
// // //                 <p className="text-xs text-gray-600">
// // //                   Uploaded: {new Date(asrStatus.uploadedAt).toLocaleString()}
// // //                 </p>
// // //               )}
// // //             </div>
// // //           )}

// // //           {uploadSuccess ? (
// // //             <div className="bg-green-50 border border-green-300 rounded-lg p-6 text-center">
// // //               <div className="text-green-600 text-5xl mb-3">✓</div>
// // //               <h3 className="text-xl font-bold text-green-800 mb-2">
// // //                 Documents Uploaded Successfully!
// // //               </h3>
// // //               <p className="text-green-700">
// // //                 Driver has been notified. AI verification in progress...
// // //               </p>
// // //             </div>
// // //           ) : (
// // //             <>
// // //               {/* Document Type Selection */}
// // //               <div>
// // //                 <h3 className="font-bold text-[#351c15] mb-3">Select Document Type</h3>
// // //                 <div className="flex gap-4">
// // //                   <button
// // //                     onClick={() => setDocumentType("aadhaar")}
// // //                     className={`flex-1 p-4 border-2 rounded-lg font-semibold transition ${
// // //                       documentType === "aadhaar"
// // //                         ? "border-[#351c15] bg-[#fff8e7] text-[#351c15]"
// // //                         : "border-gray-300 text-gray-600 hover:border-gray-400"
// // //                     }`}
// // //                   >
// // //                     🪪 Aadhaar Card
// // //                   </button>
// // //                   <button
// // //                     onClick={() => setDocumentType("pan")}
// // //                     className={`flex-1 p-4 border-2 rounded-lg font-semibold transition ${
// // //                       documentType === "pan"
// // //                         ? "border-[#351c15] bg-[#fff8e7] text-[#351c15]"
// // //                         : "border-gray-300 text-gray-600 hover:border-gray-400"
// // //                     }`}
// // //                   >
// // //                     💳 PAN Card
// // //                   </button>
// // //                 </div>
// // //               </div>

// // //               {/* Aadhaar Upload */}
// // //               {documentType === "aadhaar" && (
// // //                 <div className="space-y-4">
// // //                   <div>
// // //                     <h4 className="font-semibold text-[#351c15] mb-2">Aadhaar Front Side</h4>
// // //                     <input
// // //                       type="file"
// // //                       accept="image/*"
// // //                       onChange={(e) => handleFileSelect(e, "aadhaarFront")}
// // //                       className="w-full"
// // //                     />
// // //                     {aadhaarFrontPreview && (
// // //                       <img
// // //                         src={aadhaarFrontPreview}
// // //                         alt="Aadhaar Front"
// // //                         className="mt-3 w-full max-w-md rounded-lg border-2 border-[#e6ddc5]"
// // //                       />
// // //                     )}
// // //                   </div>

// // //                   <div>
// // //                     <h4 className="font-semibold text-[#351c15] mb-2">Aadhaar Back Side</h4>
// // //                     <input
// // //                       type="file"
// // //                       accept="image/*"
// // //                       onChange={(e) => handleFileSelect(e, "aadhaarBack")}
// // //                       className="w-full"
// // //                     />
// // //                     {aadhaarBackPreview && (
// // //                       <img
// // //                         src={aadhaarBackPreview}
// // //                         alt="Aadhaar Back"
// // //                         className="mt-3 w-full max-w-md rounded-lg border-2 border-[#e6ddc5]"
// // //                       />
// // //                     )}
// // //                   </div>
// // //                 </div>
// // //               )}

// // //               {/* PAN Upload */}
// // //               {documentType === "pan" && (
// // //                 <div>
// // //                   <h4 className="font-semibold text-[#351c15] mb-2">PAN Card</h4>
// // //                   <input
// // //                     type="file"
// // //                     accept="image/*"
// // //                     onChange={(e) => handleFileSelect(e, "pan")}
// // //                     className="w-full"
// // //                   />
// // //                   {panCardPreview && (
// // //                     <img
// // //                       src={panCardPreview}
// // //                       alt="PAN Card"
// // //                       className="mt-3 w-full max-w-md rounded-lg border-2 border-[#e6ddc5]"
// // //                     />
// // //                   )}
// // //                 </div>
// // //               )}

// // //               {/* Upload Button */}
// // //               <button
// // //                 onClick={handleUpload}
// // //                 disabled={uploading || (documentType === "aadhaar" ? (!aadhaarFront || !aadhaarBack) : !panCard)}
// // //                 className="w-full px-6 py-4 bg-[#351c15] text-white rounded-lg hover:bg-[#2b160f] font-semibold shadow disabled:opacity-50 disabled:cursor-not-allowed"
// // //               >
// // //                 {uploading ? "Uploading..." : "📤 Upload Documents"}
// // //               </button>
// // //             </>
// // //           )}

// // //           {/* Privacy Notice */}
// // //           <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
// // //             <p className="text-xs text-gray-600">
// // //               🔒 <strong>Privacy Notice:</strong> Your documents are encrypted and used only for delivery verification. They will be securely deleted after successful delivery.
// // //             </p>
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // import { useState, useEffect } from "react";
// // import api from "../../services/api";
// // import * as signalR from "@microsoft/signalr";

// // export default function CustomerASRUpload({ orderId, onClose }) {
// //   const [order, setOrder] = useState(null);
// //   const [asrStatus, setAsrStatus] = useState(null);
// //   const [loading, setLoading] = useState(true);
// //   const [uploading, setUploading] = useState(false);
  
// //   const [documents, setDocuments] = useState([]);
// //   const [documentPreviews, setDocumentPreviews] = useState([]);

// //   useEffect(() => {
// //     loadData();
// //     setupSignalR();
// //   }, [orderId]);

// //   const loadData = async () => {
// //     try {
// //       setLoading(true);
      
// //       // Get ASR status for this order
// //       const asrRes = await api.get(`/asr/customer/status/${orderId}`);
// //       setAsrStatus(asrRes.data);
// //     } catch (err) {
// //       console.error("Error loading ASR:", err);
// //       if (err.response?.status === 404) {
// //         alert("No ASR verification found for this order");
// //       }
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const setupSignalR = async () => {
// //     try {
// //       const conn = new signalR.HubConnectionBuilder()
// //         .withUrl("http://localhost:5066/hubs/logistics", {
// //           accessTokenFactory: () => localStorage.getItem("token") || "",
// //         })
// //         .withAutomaticReconnect()
// //         .build();

// //       conn.on("ASRVerificationRequested", (data) => {
// //         if (data.orderId === parseInt(orderId)) {
// //           alert(data.message);
// //           loadData();
// //         }
// //       });

// //       await conn.start();
// //       const user = JSON.parse(localStorage.getItem("user") || "{}");
// //       if (user.userId) {
// //         await conn.invoke("JoinCustomerGroup", user.userId);
// //       }
// //     } catch (err) {
// //       console.error("SignalR error:", err);
// //     }
// //   };

// //   const handleDocumentSelect = (e) => {
// //     const files = Array.from(e.target.files);
// //     setDocuments(files);
    
// //     // Create previews
// //     const previews = files.map(file => URL.createObjectURL(file));
// //     setDocumentPreviews(previews);
// //   };

// //   const handleUpload = async () => {
// //     if (documents.length === 0) {
// //       alert("Please select at least one ID document (Aadhaar, PAN, etc.)");
// //       return;
// //     }

// //     try {
// //       setUploading(true);
      
// //       // Convert all documents to base64
// //       const base64Documents = await Promise.all(
// //         documents.map(file => fileToBase64(file))
// //       );

// //       await api.post(`/asr/customer/upload-documents/${asrStatus.asrId}`, {
// //         documentUrls: base64Documents
// //       });

// //       alert("Documents uploaded successfully! Driver will be notified.");
// //       await loadData();
      
// //       if (onClose) onClose();
// //     } catch (err) {
// //       alert("Upload failed: " + (err.response?.data?.message || err.message));
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

// //   if (loading) {
// //     return (
// //       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
// //         <div className="bg-white rounded-xl p-6">
// //           <p>Loading...</p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
// //       <div className="bg-white rounded-xl max-w-2xl w-full p-6">
// //         <div className="flex justify-between items-center mb-6">
// //           <h2 className="text-2xl font-bold text-gray-900">
// //             🔒 Upload ID for ASR Verification
// //           </h2>
// //           <button
// //             onClick={onClose}
// //             className="text-gray-500 hover:text-gray-700 text-2xl"
// //           >
// //             ×
// //           </button>
// //         </div>

// //         {asrStatus && (
// //           <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
// //             <p className="text-sm text-blue-800">
// //               <strong>Status:</strong> {asrStatus.status}
// //             </p>
// //             {asrStatus.requestedAt && (
// //               <p className="text-sm text-blue-700 mt-1">
// //                 Requested: {new Date(asrStatus.requestedAt).toLocaleString()}
// //               </p>
// //             )}
// //           </div>
// //         )}

// //         <div className="mb-6">
// //           <label className="block text-sm font-semibold text-gray-700 mb-2">
// //             Upload Government ID (Aadhaar, PAN, Passport, etc.)
// //           </label>
// //           <input
// //             type="file"
// //             accept="image/*"
// //             multiple
// //             onChange={handleDocumentSelect}
// //             className="block w-full text-sm text-gray-700
// //               file:mr-4 file:py-2 file:px-4
// //               file:rounded-lg file:border-0
// //               file:text-sm file:font-semibold
// //               file:bg-blue-600 file:text-white
// //               hover:file:bg-blue-700"
// //           />
// //           <p className="text-xs text-gray-500 mt-1">
// //             You can upload multiple documents. Accepted: Aadhaar, PAN, Passport
// //           </p>
// //         </div>

// //         {/* Preview */}
// //         {documentPreviews.length > 0 && (
// //           <div className="mb-6">
// //             <h3 className="font-semibold text-gray-700 mb-3">Preview:</h3>
// //             <div className="grid grid-cols-2 gap-4">
// //               {documentPreviews.map((preview, idx) => (
// //                 <img
// //                   key={idx}
// //                   src={preview}
// //                   alt={`Document ${idx + 1}`}
// //                   className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
// //                 />
// //               ))}
// //             </div>
// //           </div>
// //         )}

// //         <div className="flex gap-3">
// //           <button
// //             onClick={onClose}
// //             className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
// //           >
// //             Cancel
// //           </button>
// //           <button
// //             onClick={handleUpload}
// //             disabled={documents.length === 0 || uploading}
// //             className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
// //           >
// //             {uploading ? "Uploading..." : "Upload Documents"}
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// import { useState, useEffect } from "react";
// import api from "../../services/api";
// import * as signalR from "@microsoft/signalr";

// export default function CustomerASRUpload({ orderId, onClose }) {
//   const [asrStatus, setAsrStatus] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [uploading, setUploading] = useState(false);
  
//   // 🆕 Separate front and back
//   const [aadhaarFront, setAadhaarFront] = useState(null);
//   const [aadhaarBack, setAadhaarBack] = useState(null);
//   const [frontPreview, setFrontPreview] = useState(null);
//   const [backPreview, setBackPreview] = useState(null);

//   useEffect(() => {
//     loadData();
//     setupSignalR();
//   }, [orderId]);

//   const loadData = async () => {
//     try {
//       setLoading(true);
//       const asrRes = await api.get(`/asr/customer/status/${orderId}`);
//       setAsrStatus(asrRes.data);
//     } catch (err) {
//       console.error("Error loading ASR:", err);
//       if (err.response?.status === 404) {
//         alert("No ASR verification found for this order");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const setupSignalR = async () => {
//     try {
//       const conn = new signalR.HubConnectionBuilder()
//         .withUrl("http://localhost:5066/hubs/logistics", {
//           accessTokenFactory: () => localStorage.getItem("token") || "",
//         })
//         .withAutomaticReconnect()
//         .build();

//       conn.on("ASRVerificationRequested", (data) => {
//         if (data.orderId === parseInt(orderId)) {
//           alert(data.message);
//           loadData();
//         }
//       });

//       await conn.start();
//       const user = JSON.parse(localStorage.getItem("user") || "{}");
//       if (user.userId) {
//         await conn.invoke("JoinCustomerGroup", user.userId);
//       }
//     } catch (err) {
//       console.error("SignalR error:", err);
//     }
//   };

//   // 🆕 Handle front side upload
//   const handleFrontUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setAadhaarFront(file);
//       setFrontPreview(URL.createObjectURL(file));
//     }
//   };

//   // 🆕 Handle back side upload
//   const handleBackUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setAadhaarBack(file);
//       setBackPreview(URL.createObjectURL(file));
//     }
//   };

//   const handleUpload = async () => {
//     if (!aadhaarFront) {
//       alert("Please upload Aadhaar front side (with photo and QR code)");
//       return;
//     }

//     try {
//       setUploading(true);
      
//       // Convert to base64
//       const frontBase64 = await fileToBase64(aadhaarFront);
//       const backBase64 = aadhaarBack ? await fileToBase64(aadhaarBack) : null;

//       // Send both front and back
//       const documentUrls = [frontBase64];
//       if (backBase64) {
//         documentUrls.push(backBase64);
//       }

//       await api.post(`/asr/customer/upload-documents/${asrStatus.asrId}`, {
//         documentUrls: documentUrls
//       });

//       alert("Aadhaar uploaded successfully! Driver will be notified.");
//       await loadData();
      
//       if (onClose) onClose();
//     } catch (err) {
//       alert("Upload failed: " + (err.response?.data?.message || err.message));
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

//   if (loading) {
//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//         <div className="bg-white rounded-xl p-6">
//           <p>Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
//       <div className="bg-white rounded-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-2xl font-bold text-gray-900">
//             🔒 Upload Aadhaar for ASR Verification
//           </h2>
//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700 text-2xl"
//           >
//             ×
//           </button>
//         </div>

//         {asrStatus && (
//           <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//             <p className="text-sm text-blue-800">
//               <strong>Status:</strong> {asrStatus.status}
//             </p>
//             {asrStatus.requestedAt && (
//               <p className="text-sm text-blue-700 mt-1">
//                 Requested: {new Date(asrStatus.requestedAt).toLocaleString()}
//               </p>
//             )}
//           </div>
//         )}

//         {/* Instructions */}
//         <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//           <h3 className="font-semibold text-yellow-900 mb-2">📋 Instructions:</h3>
//           <ul className="text-sm text-yellow-800 space-y-1">
//             <li>• <strong>Front side</strong> must show your photo and QR code clearly</li>
//             <li>• <strong>Back side</strong> shows your address (optional but recommended)</li>
//             <li>• Ensure good lighting and no glare on QR code</li>
//             <li>• All 4 corners of Aadhaar must be visible</li>
//           </ul>
//         </div>

//         {/* Front Side Upload */}
//         <div className="mb-6">
//           <label className="block text-sm font-semibold text-gray-700 mb-2">
//             📄 Aadhaar Front Side (with Photo & QR Code) *
//           </label>
//           <input
//             type="file"
//             accept="image/*"
//             capture="environment"
//             onChange={handleFrontUpload}
//             className="block w-full text-sm text-gray-700
//               file:mr-4 file:py-2 file:px-4
//               file:rounded-lg file:border-0
//               file:text-sm file:font-semibold
//               file:bg-blue-600 file:text-white
//               hover:file:bg-blue-700"
//           />
//           <p className="text-xs text-gray-500 mt-1">
//             Required: Must show your photo and QR code
//           </p>

//           {frontPreview && (
//             <div className="mt-3">
//               <img
//                 src={frontPreview}
//                 alt="Aadhaar Front"
//                 className="w-full max-w-md h-48 object-contain rounded-lg border-2 border-blue-200 bg-gray-50"
//               />
//             </div>
//           )}
//         </div>

//         {/* Back Side Upload */}
//         <div className="mb-6">
//           <label className="block text-sm font-semibold text-gray-700 mb-2">
//             📄 Aadhaar Back Side (with Address)
//           </label>
//           <input
//             type="file"
//             accept="image/*"
//             capture="environment"
//             onChange={handleBackUpload}
//             className="block w-full text-sm text-gray-700
//               file:mr-4 file:py-2 file:px-4
//               file:rounded-lg file:border-0
//               file:text-sm file:font-semibold
//               file:bg-gray-400 file:text-white
//               hover:file:bg-gray-500"
//           />
//           <p className="text-xs text-gray-500 mt-1">
//             Optional: Helpful for address verification
//           </p>

//           {backPreview && (
//             <div className="mt-3">
//               <img
//                 src={backPreview}
//                 alt="Aadhaar Back"
//                 className="w-full max-w-md h-48 object-contain rounded-lg border-2 border-gray-200 bg-gray-50"
//               />
//             </div>
//           )}
//         </div>

//         {/* Preview Grid */}
//         {(frontPreview || backPreview) && (
//           <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
//             <p className="text-sm text-green-800 font-semibold mb-2">
//               ✓ Ready to upload
//             </p>
//             <div className="grid grid-cols-2 gap-4">
//               {frontPreview && (
//                 <div>
//                   <p className="text-xs text-gray-600 mb-1">Front (with QR)</p>
//                   <div className="h-24 bg-white rounded border border-green-300 flex items-center justify-center">
//                     <span className="text-green-600 text-2xl">✓</span>
//                   </div>
//                 </div>
//               )}
//               {backPreview && (
//                 <div>
//                   <p className="text-xs text-gray-600 mb-1">Back (address)</p>
//                   <div className="h-24 bg-white rounded border border-green-300 flex items-center justify-center">
//                     <span className="text-green-600 text-2xl">✓</span>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         <div className="flex gap-3">
//           <button
//             onClick={onClose}
//             className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleUpload}
//             disabled={!aadhaarFront || uploading}
//             className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
//           >
//             {uploading ? "Uploading..." : "Upload Aadhaar"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import api from "../../services/api";
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
        alert("No ASR verification found for this order");
      }
    } finally {
      setLoading(false);
    }
  };

  const setupSignalR = async () => {
    try {
      const conn = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:5066/hubs/logistics", {
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