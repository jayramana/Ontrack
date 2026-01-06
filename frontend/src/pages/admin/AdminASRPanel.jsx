import { useState, useEffect } from "react";
import api from "../../services/api";
import { formatStatus } from "@/lib/utils";
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

  // Auto-select first re-verify request when list loads
  useEffect(() => {
    if (asrList.length > 0 && !selectedASR) {
      const urgent = asrList.find(a => a.customerReverifyRequested && a.aiVerifyStatus !== 'AdminOverride');
      if (urgent) loadASRDetails(urgent.id);
    }
  }, [asrList]);

  const loadASRDetails = async (asrId) => {
    try {
      const res = await api.get(`/asr/admin/details/${asrId}`);
      setSelectedASR(res.data);
    } catch (err) {
      console.error("Error loading ASR details:", err);
      // alert("Failed to load details. Please check connection."); // Optional: silent fail often better for UX unless it's critical
    }
  };

  const handleAdminOverride = async () => {
    if (!overrideReason.trim()) {
      alert("Please provide a reason for override");
      return;
    }

    try {
      await api.post(`/asr/admin/override/${selectedASR.id}`, {
        Reason: overrideReason,
      });
      setShowOverrideDialog(false);
      setOverrideReason("");
      loadASRList();
      if (selectedASR) loadASRDetails(selectedASR.id);
      
      // Force refresh dashboard if present
      if (window.opener) window.opener.location.reload();
      
      alert("Override successful");
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleReverify = async (asrId) => {
    try {
      const res = await api.post(`/asr/admin/reverify/${asrId}`);
      alert(res.data?.message || "Re-verification initiated");
      loadASRDetails(asrId);
      loadASRList(); // Refresh list to show updated status
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
        Loading ASR verifications...
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
            ASR Verification Management
          </h1>
          <p className="text-slate-400 mt-1">
            Review and manage Adult Signature Required verifications
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ASR LIST */}
          <div className="
            col-span-1
            bg-white/5 backdrop-blur-xl
            border border-white/10
            rounded-3xl p-6
          ">
            <h2 className="text-lg font-bold mb-4">
              All ASR Requests ({asrList.length})
            </h2>

            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
              {asrList.map((asr) => (
                <div
                  key={asr.id}
                  onClick={() => loadASRDetails(asr.id)}
                  className={`
                    p-4 rounded-xl cursor-pointer transition
                    border
                    ${selectedASR?.id === asr.id
                      ? "border-[#ff8a3d] bg-white/10"
                      : "border-white/10 hover:bg-white/5"
                    }
                  `}
                >
                  <div className="flex justify-between mb-2">
                    <div>
                      <p className="font-semibold">Order #{asr.orderId}</p>
                      <p className="text-xs text-slate-400">{asr.trackingId}</p>
                      {asr.customerReverifyRequested && (
                        <span className="mt-1 inline-block px-2 py-0.5 bg-orange-500/20 text-orange-400 text-[10px] font-bold rounded border border-orange-500/30">
                          Reverify Req.
                        </span>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center justify-center
                                  px-3 h-6 rounded-full
                                  text-xs font-semibold leading-none
                                  ${getStatusStyle(asr.aiVerifyStatus)}`}
                    >
                      {formatStatus(asr.aiVerifyStatus)}
                    </span>
                  </div>

                  <p className="text-sm text-slate-400">
                    Customer: {asr.customerName}
                  </p>
                  <p className="text-sm text-slate-400">
                    Driver: {asr.driverName}
                  </p>

                  {typeof asr.aiVerifyScore === 'number' && asr.aiVerifyScore > 0 && (
                    <p className="text-xs text-slate-500 mt-2">
                      AI Score: {(asr.aiVerifyScore * 100).toFixed(1)}%
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* DETAIL VIEW */}
          <div className="
            col-span-2
            bg-white/5 backdrop-blur-xl
            border border-white/10
            rounded-3xl p-8
            min-h-[500px]
          ">
            {selectedASR ? (
              <div className="space-y-8">
                {/* HEADER */}
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">
                      Verification Details #{selectedASR.id}
                    </h2>
                    <p className="text-slate-400">
                      Order #{selectedASR.orderId}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-4 py-2 rounded-full font-bold ${getStatusStyle(selectedASR.aiVerifyStatus)}`}>
                      {formatStatus(selectedASR.aiVerifyStatus)}
                    </span>
                    {selectedASR.aiVerifyScore && (
                      <span className="text-sm text-slate-400">
                        Score: <b>{(selectedASR.aiVerifyScore * 100).toFixed(1)}%</b>
                      </span>
                    )}
                  </div>
                </div>

                {selectedASR.customerReverifyRequested && (
                  <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📣</span>
                      <div>
                        <p className="font-bold text-orange-400">Customer Requested Re-Verification</p>
                        <p className="text-sm text-slate-400">The customer believes the AI check was incorrect.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setOverrideReason("Customer Appeal Accepted");
                        setShowOverrideDialog(true);
                      }}
                      className="whitespace-nowrap px-4 py-2 bg-orange-500 hover:bg-orange-600 text-black font-bold rounded-lg text-sm transition"
                    >
                      Quick Approve
                    </button>
                  </div>
                )}

                {/* IMAGES GRID */}
                <div className="grid grid-cols-2 gap-6">
                  {/* CUSTOMER DOCUMENTS */}
                  <div className="space-y-4">
                    <h3 className="tex-sm font-bold text-slate-400">
                      Uploaded Documents
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {selectedASR.documentUrls && selectedASR.documentUrls.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt="ID Document"
                          className="w-full h-48 object-cover rounded-xl border border-white/10 bg-black/40"
                        />
                      ))}
                      {(!selectedASR.documentUrls || selectedASR.documentUrls.length === 0) && (
                        <div className="w-full h-48 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-500 text-sm">
                          No Documents
                        </div>
                      )}
                    </div>
                  </div>

                  {/* DRIVER CAPTURES */}
                  <div className="space-y-4">
                    <h3 className="tex-sm font-bold text-slate-400">
                      Driver Captures
                    </h3>
                    <div className="space-y-4">
                      {selectedASR.customerPhotoUrl ? (
                        <div>
                          <p className="text-xs text-slate-500 mb-2">Customer Photo</p>
                          <img
                            src={selectedASR.customerPhotoUrl}
                            className="w-full h-48 object-cover rounded-xl border border-white/10 bg-black/40"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-500 text-sm">
                          No Customer Photo
                        </div>
                      )}

                      {selectedASR.signatureUrl ? (
                        <div>
                          <p className="text-xs text-slate-500 mb-2">Signature</p>
                          <img
                            src={selectedASR.signatureUrl}
                            className="w-full h-32 object-contain rounded-xl border border-white/10 bg-white"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-32 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-500 text-sm">
                          No Signature
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* REASONS */}
                {selectedASR.reasons && selectedASR.reasons.length > 0 && (
                  <div className="bg-black/20 rounded-xl p-6 border border-white/10">
                    <h3 className="font-bold mb-4">Verification Analysis</h3>
                    <ul className="space-y-2">
                      {selectedASR.reasons.map((r, i) => (
                        <li key={i} className="flex gap-3 text-sm text-slate-300">
                          <span className="text-[#ff8a3d]">•</span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* ACTION BUTTONS (Manual Override / Reverify) */}
                <div className="pt-6 border-t border-white/10 flex gap-4">
                  <button
                    onClick={() => handleReverify(selectedASR.id)}
                    disabled={selectedASR.aiVerifyStatus === "Success" || selectedASR.aiVerifyStatus === "AdminOverride"}
                    className="
                           flex-1 py-3 rounded-xl font-bold bg-white/10 
                           hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed
                        "
                  >
                    Re-Run AI Verification
                  </button>

                  <button
                    onClick={() => setShowOverrideDialog(true)}
                    disabled={selectedASR.aiVerifyStatus === "Success" || selectedASR.aiVerifyStatus === "AdminOverride"}
                    className="
                           flex-1 py-3 rounded-xl font-bold bg-[#ff8a3d] text-black 
                           hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
                        "
                  >
                    Approve Manually (Override)
                  </button>
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500">
                <p>Select a verification request to view details</p>
              </div>
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
              placeholder="Explain the reason for override..."
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
