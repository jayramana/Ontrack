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

  // const handleReverify = async (asrId) => {
  //   try {
  //     await api.post(`/asr/admin/reverify/${asrId}`);
  //     loadASRDetails(asrId);
  //   } catch (err) {
  //     alert(err.response?.data?.message || err.message);
  //   }
  // };

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
             ASR Verification Management
          </h1>
          <p className="text-slate-400 mt-1">
            Review and manage Adult Signature Required verifications
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">

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
<span
  className={`inline-flex items-center justify-center
              px-3 h-6 rounded-full
              text-xs font-semibold leading-none
              ${getStatusStyle(asr.aiVerifyStatus)}`}
>
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
