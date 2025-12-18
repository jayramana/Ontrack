// import { useState, useEffect } from "react";
// import api from "../../services/api";

// export default function AdminASRPanel() {
//   const [asrList, setAsrList] = useState([]);
//   const [selectedASR, setSelectedASR] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [overrideReason, setOverrideReason] = useState("");
//   const [showOverrideDialog, setShowOverrideDialog] = useState(false);

//   useEffect(() => {
//     loadASRList();
//   }, []);

//   const loadASRList = async () => {
//     try {
//       const res = await api.get("/asr/admin/list");
//       setAsrList(res.data);
//     } catch (err) {
//       console.error("Error loading ASR list:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadASRDetails = async (asrId) => {
//     try {
//       const res = await api.get(`/asr/admin/details/${asrId}`);
//       setSelectedASR(res.data);
//     } catch (err) {
//       console.error("Error loading ASR details:", err);
//     }
//   };

//   const handleAdminOverride = async () => {
//     if (!overrideReason.trim()) {
//       alert("Please provide a reason for override");
//       return;
//     }

//     try {
//       await api.post(`/asr/admin/override/${selectedASR.id}`, {
//         reason: overrideReason
//       });

//       alert("ASR verification approved!");
//       setShowOverrideDialog(false);
//       setOverrideReason("");
//       loadASRList();
//       loadASRDetails(selectedASR.id);
//     } catch (err) {
//       alert("Override failed: " + (err.response?.data?.message || err.message));
//     }
//   };

//   const handleReverify = async (asrId) => {
//     try {
//       await api.post(`/asr/admin/reverify/${asrId}`);
//       alert("AI re-verification triggered");
//       loadASRDetails(asrId);
//     } catch (err) {
//       alert("Re-verification failed: " + (err.response?.data?.message || err.message));
//     }
//   };

//   const getStatusColor = (status) => {
//     return {
//       Success: "bg-green-100 text-green-800",
//       Failed: "bg-red-100 text-red-800",
//       Pending: "bg-yellow-100 text-yellow-800",
//       InProgress: "bg-blue-100 text-blue-800",
//       AdminOverride: "bg-purple-100 text-purple-800",
//     }[status] || "bg-gray-100 text-gray-800";
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <p>Loading ASR verifications...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#f8f4ef] p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="bg-white border border-[#e6d8c9] rounded-xl p-6 mb-6 shadow">
//           <h1 className="text-3xl font-bold text-[#351c15]">
//             🔒 ASR Verification Management
//           </h1>
//           <p className="text-[#6b4f3a] mt-1">
//             Review and manage Adult Signature Required verifications
//           </p>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* ASR List */}
//           <div className="lg:col-span-1 bg-white border border-[#e6d8c9] rounded-xl p-6 shadow">
//             <h2 className="text-xl font-bold text-[#351c15] mb-4">
//               All ASR Requests ({asrList.length})
//             </h2>

//             <div className="space-y-3 max-h-[600px] overflow-y-auto">
//               {asrList.map((asr) => (
//                 <div
//                   key={asr.id}
//                   onClick={() => loadASRDetails(asr.id)}
//                   className={`p-4 border rounded-lg cursor-pointer transition ${
//                     selectedASR?.id === asr.id
//                       ? "border-[#f9b400] bg-[#fff9ef]"
//                       : "border-[#e6d8c9] hover:bg-[#fdf7ed]"
//                   }`}
//                 >
//                   <div className="flex justify-between items-start mb-2">
//                     <div>
//                       <p className="font-semibold text-sm text-[#351c15]">
//                         Order #{asr.orderId}
//                       </p>
//                       <p className="text-xs text-[#6b4f3a]">{asr.trackingId}</p>
//                     </div>
//                     <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(asr.aiVerifyStatus)}`}>
//                       {asr.aiVerifyStatus}
//                     </span>
//                   </div>

//                   <p className="text-sm text-[#6b4f3a] mb-1">
//                     <strong>Customer:</strong> {asr.customerName}
//                   </p>
//                   <p className="text-sm text-[#6b4f3a]">
//                     <strong>Driver:</strong> {asr.driverName}
//                   </p>

//                   {asr.aiVerifyScore && (
//                     <div className="mt-2 pt-2 border-t border-[#e6d8c9]">
//                       <p className="text-xs text-[#6b4f3a]">
//                         AI Score: {(asr.aiVerifyScore * 100).toFixed(1)}%
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* ASR Details */}
//           <div className="lg:col-span-2">
//             {!selectedASR ? (
//               <div className="bg-white border border-[#e6d8c9] rounded-xl p-12 text-center shadow">
//                 <p className="text-[#6b4f3a]">Select an ASR verification to view details</p>
//               </div>
//             ) : (
//               <div className="space-y-6">
//                 {/* Order Info */}
//                 <div className="bg-white border border-[#e6d8c9] rounded-xl p-6 shadow">
//                   <h3 className="text-xl font-bold text-[#351c15] mb-4">Order Information</h3>
                  
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <p className="text-sm text-[#6b4f3a]">Order ID</p>
//                       <p className="font-semibold text-[#351c15]">#{selectedASR.orderId}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm text-[#6b4f3a]">Tracking ID</p>
//                       <p className="font-semibold text-[#351c15]">{selectedASR.order?.trackingId}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm text-[#6b4f3a]">Receiver</p>
//                       <p className="font-semibold text-[#351c15]">{selectedASR.order?.receiverName}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm text-[#6b4f3a]">Status</p>
//                       <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedASR.aiVerifyStatus)}`}>
//                         {selectedASR.aiVerifyStatus}
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Verification Score */}
//                 {selectedASR.aiVerifyScore !== null && (
//                   <div className={`border-l-4 p-6 rounded-lg ${
//                     selectedASR.aiVerifyScore >= 0.8 ? "bg-green-50 border-green-500" :
//                     selectedASR.aiVerifyScore >= 0.6 ? "bg-yellow-50 border-yellow-500" :
//                     "bg-red-50 border-red-500"
//                   }`}>
//                     <h3 className="font-bold text-lg mb-2">AI Verification Score</h3>
//                     <div className="flex items-center gap-4">
//                       <div className="text-4xl font-bold">
//                         {(selectedASR.aiVerifyScore * 100).toFixed(1)}%
//                       </div>
//                       <div className="flex-1">
//                         <div className="w-full bg-gray-200 rounded-full h-4">
//                           <div
//                             className={`h-4 rounded-full ${
//                               selectedASR.aiVerifyScore >= 0.8 ? "bg-green-600" :
//                               selectedASR.aiVerifyScore >= 0.6 ? "bg-yellow-600" :
//                               "bg-red-600"
//                             }`}
//                             style={{ width: `${selectedASR.aiVerifyScore * 100}%` }}
//                           />
//                         </div>
//                       </div>
//                     </div>

//                     {selectedASR.reasons && selectedASR.reasons.length > 0 && (
//                       <div className="mt-4 bg-white p-4 rounded">
//                         <p className="font-semibold text-sm mb-2">Verification Details:</p>
//                         <ul className="text-sm space-y-1">
//                           {selectedASR.reasons.map((reason, idx) => (
//                             <li key={idx}>• {reason}</li>
//                           ))}
//                         </ul>
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {/* Documents */}
//                 <div className="bg-white border border-[#e6d8c9] rounded-xl p-6 shadow">
//                   <h3 className="text-xl font-bold text-[#351c15] mb-4">Uploaded Documents</h3>

//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                     {/* ID Documents */}
//                     {selectedASR.documentUrls && selectedASR.documentUrls.length > 0 && (
//                       <div>
//                         <p className="font-semibold text-sm text-[#351c15] mb-2">ID Documents</p>
//                         <div className="space-y-2">
//                           {selectedASR.documentUrls.map((url, idx) => (
//                             <img
//                               key={idx}
//                               src={url}
//                               alt={`ID Document ${idx + 1}`}
//                               className="w-full h-48 object-cover rounded border-2 border-[#e6ddc5]"
//                             />
//                           ))}
//                         </div>
//                       </div>
//                     )}

//                     {/* Customer Photo */}
//                     {selectedASR.customerPhotoUrl && (
//                       <div>
//                         <p className="font-semibold text-sm text-[#351c15] mb-2">Customer Photo</p>
//                         <img
//                           src={selectedASR.customerPhotoUrl}
//                           alt="Customer"
//                           className="w-full h-48 object-cover rounded border-2 border-[#e6ddc5]"
//                         />
//                       </div>
//                     )}

//                     {/* Signature */}
//                     {selectedASR.signatureUrl && (
//                       <div>
//                         <p className="font-semibold text-sm text-[#351c15] mb-2">Customer Signature</p>
//                         <img
//                           src={selectedASR.signatureUrl}
//                           alt="Signature"
//                           className="w-full h-48 object-contain bg-white rounded border-2 border-[#e6ddc5]"
//                         />
//                       </div>
//                     )}
//                   </div>

//                   {!selectedASR.documentUrls?.length && !selectedASR.customerPhotoUrl && !selectedASR.signatureUrl && (
//                     <p className="text-center text-[#6b4f3a] py-8">
//                       No documents uploaded yet
//                     </p>
//                   )}
//                 </div>

//                 {/* Admin Actions */}
//                 <div className="bg-white border border-[#e6d8c9] rounded-xl p-6 shadow">
//                   <h3 className="text-xl font-bold text-[#351c15] mb-4">Admin Actions</h3>

//                   <div className="flex flex-wrap gap-3">
//                     {selectedASR.aiVerifyStatus === "Failed" && (
//                       <button
//                         onClick={() => setShowOverrideDialog(true)}
//                         className="flex-1 px-4 py-3 bg-[#f9b400] text-[#351c15] rounded-lg hover:bg-[#e0a200] font-semibold"
//                       >
//                         ✓ Override & Approve
//                       </button>
//                     )}

//                     <button
//                       onClick={() => handleReverify(selectedASR.id)}
//                       className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
//                     >
//                       🔄 Re-verify with AI
//                     </button>
//                   </div>

//                   {selectedASR.isAdminOverride && (
//                     <div className="mt-4 bg-purple-50 border border-purple-200 p-4 rounded">
//                       <p className="font-semibold text-purple-800 mb-1">Admin Override Applied</p>
//                       <p className="text-sm text-purple-700">
//                         <strong>Reason:</strong> {selectedASR.overrideReason}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Override Dialog */}
//       {showOverrideDialog && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl max-w-md w-full p-6">
//             <h3 className="text-xl font-bold text-[#351c15] mb-4">
//               Override ASR Verification
//             </h3>

//             <div className="bg-yellow-50 border border-yellow-300 p-4 rounded mb-4">
//               <p className="text-sm text-yellow-800">
//                 ⚠️ You are about to manually approve this ASR verification despite AI failure. This action will be logged.
//               </p>
//             </div>

//             <div className="mb-4">
//               <label className="block text-sm font-semibold text-[#351c15] mb-2">
//                 Reason for Override *
//               </label>
//               <textarea
//                 value={overrideReason}
//                 onChange={(e) => setOverrideReason(e.target.value)}
//                 rows={4}
//                 className="w-full p-3 border border-[#e6ddc5] rounded-lg"
//                 placeholder="Explain why you are approving this verification..."
//               />
//             </div>

//             <div className="flex gap-3">
//               <button
//                 onClick={() => {
//                   setShowOverrideDialog(false);
//                   setOverrideReason("");
//                 }}
//                 className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleAdminOverride}
//                 className="flex-1 px-4 py-2 bg-[#f9b400] text-[#351c15] rounded-lg hover:bg-[#e0a200] font-semibold"
//               >
//                 Confirm Override
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import api from "../../services/api";
import AdminSidebar from "./AdminSidebar";

export default function AdminASRPanel() {
  const [asrList, setAsrList] = useState([]);
  const [selectedASR, setSelectedASR] = useState(null);
  const [loading, setLoading] = useState(true);
  const [overrideReason, setOverrideReason] = useState("");
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);

  useEffect(() => {
    loadASRList();
  }, []);

  const loadASRList = async () => {
    try {
      const res = await api.get("/asr/admin/list");
      setAsrList(res.data || []);
    } catch (err) {
      console.error("Error loading ASR list:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadASRDetails = async (asrId) => {
    try {
      const res = await api.get(`/asr/admin/details/${asrId}`);
      setSelectedASR(res.data);
    } catch (err) {
      console.error("Error loading ASR details:", err);
    }
  };

  const handleAdminOverride = async () => {
    if (!overrideReason.trim()) {
      alert("Please provide a reason for override");
      return;
    }

    try {
      await api.post(`/asr/admin/override/${selectedASR.id}`, {
        reason: overrideReason,
      });
      setShowOverrideDialog(false);
      setOverrideReason("");
      loadASRList();
      loadASRDetails(selectedASR.id);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleReverify = async (asrId) => {
    try {
      await api.post(`/asr/admin/reverify/${asrId}`);
      loadASRDetails(asrId);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const getStatusStyle = (status) => {
    return {
      Success: "bg-green-500/20 text-green-400",
      Failed: "bg-red-500/20 text-red-400",
      Pending: "bg-yellow-500/20 text-yellow-400",
      InProgress: "bg-blue-500/20 text-blue-400",
      AdminOverride: "bg-purple-500/20 text-purple-400",
    }[status] || "bg-white/10 text-slate-300";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f14] text-slate-400">
        Loading ASR verifications…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#0b0f14] text-slate-100">
      <AdminSidebar active="asr" />

      <div className="flex-1 px-10 py-8 space-y-8 overflow-y-auto">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            🔒 ASR Verification Management
          </h1>
          <p className="text-slate-400 mt-1">
            Review and manage Adult Signature Required verifications
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ASR LIST */}
          <div className="
            bg-white/5 backdrop-blur-xl
            border border-white/10
            rounded-3xl p-6
          ">
            <h2 className="text-lg font-bold mb-4">
              All ASR Requests ({asrList.length})
            </h2>

            <div className="space-y-3 max-h-[70vh] overflow-y-auto">
              {asrList.map((asr) => (
                <div
                  key={asr.id}
                  onClick={() => loadASRDetails(asr.id)}
                  className={`
                    p-4 rounded-xl cursor-pointer transition
                    border
                    ${
                      selectedASR?.id === asr.id
                        ? "border-[#ff8a3d] bg-white/10"
                        : "border-white/10 hover:bg-white/5"
                    }
                  `}
                >
                  <div className="flex justify-between mb-2">
                    <div>
                      <p className="font-semibold">Order #{asr.orderId}</p>
                      <p className="text-xs text-slate-400">{asr.trackingId}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusStyle(asr.aiVerifyStatus)}`}>
                      {asr.aiVerifyStatus}
                    </span>
                  </div>

                  <p className="text-sm text-slate-400">
                    Customer: {asr.customerName}
                  </p>
                  <p className="text-sm text-slate-400">
                    Driver: {asr.driverName}
                  </p>

                  {asr.aiVerifyScore && (
                    <p className="text-xs text-slate-500 mt-2">
                      AI Score: {(asr.aiVerifyScore * 100).toFixed(1)}%
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ASR DETAILS */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedASR ? (
              <div className="
                bg-white/5 backdrop-blur-xl
                border border-white/10
                rounded-3xl p-12
                text-center text-slate-400
              ">
                Select an ASR request to view details
              </div>
            ) : (
              <>
                {/* ORDER INFO */}
                <div className="
                  bg-white/5 backdrop-blur-xl
                  border border-white/10
                  rounded-3xl p-6
                ">
                  <h3 className="font-bold mb-4">Order Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Order ID</p>
                      <p className="font-semibold">#{selectedASR.orderId}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Tracking ID</p>
                      <p className="font-semibold">{selectedASR.order?.trackingId}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Receiver</p>
                      <p className="font-semibold">{selectedASR.order?.receiverName}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Status</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle(selectedASR.aiVerifyStatus)}`}>
                        {selectedASR.aiVerifyStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="
                  bg-white/5 backdrop-blur-xl
                  border border-white/10
                  rounded-3xl p-6
                ">
                  <h3 className="font-bold mb-4">Admin Actions</h3>
                  <div className="flex gap-3">
                    {selectedASR.aiVerifyStatus === "Failed" && (
                      <button
                        onClick={() => setShowOverrideDialog(true)}
                        className="flex-1 py-3 rounded-xl bg-[#ff8a3d] text-black font-bold hover:opacity-90"
                      >
                        Override & Approve
                      </button>
                    )}

                    <button
                      onClick={() => handleReverify(selectedASR.id)}
                      className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold"
                    >
                      Re-verify with AI
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* OVERRIDE MODAL */}
      {showOverrideDialog && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="
            bg-[#0f141c]
            border border-white/10
            rounded-3xl p-6
            max-w-md w-full
          ">
            <h3 className="text-xl font-bold mb-4">
              Override ASR Verification
            </h3>

            <textarea
              rows={4}
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="Explain the reason for override…"
              className="
                w-full p-3 rounded-xl
                bg-white/5 border border-white/10
                text-slate-100 placeholder-slate-500
                mb-4
              "
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowOverrideDialog(false)}
                className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                onClick={handleAdminOverride}
                className="flex-1 py-2 rounded-xl bg-[#ff8a3d] text-black font-bold"
              >
                Confirm Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
