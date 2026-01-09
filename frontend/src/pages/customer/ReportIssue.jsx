import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CustomerSidebar from "./CustomerSidebar";
import { ArrowLeft, CircleHelp } from "lucide-react";
import api from "../../services/api";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function ReportIssue() {
  const { id } = useParams(); // orderId
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/customer/track/${id}`);
        setOrder(res.data.order);
      } catch (err) {
        console.error("Failed to fetch order", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex bg-[#0b0f14] text-slate-400">
        <CustomerSidebar active="orders" />
        <div className="flex-1 flex items-center justify-center">Loading...</div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen flex bg-[#0b0f14] text-slate-100">
      <CustomerSidebar active="orders" />

      <main className="flex-1 overflow-y-auto px-10 py-8 space-y-10">
        
        {/* HEADER */}
        <header className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-slate-400 hover:text-[#ff8a3d] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-black flex items-center gap-2">
              Report Issue
            </h1>
        </header>

        {/* CONTENT */}
        <div className="max-w-3xl">
            <div className="mb-8 p-6 bg-[#ff8a3d]/10 border border-[#ff8a3d]/20 rounded-2xl flex items-start gap-4">
                <div className="p-3 bg-[#ff8a3d]/20 rounded-full text-[#ff8a3d]">
                    <CircleHelp className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white mb-1">Frequently Asked Questions</h3>
                    <p className="text-slate-400 text-sm">
                        Please check if your query is answered below before contacting support.
                    </p>
                </div>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
                
                {order.status === "Delivered" ? (
                    /* DELIVERED FAQ */
                    <AccordionItem value="item-1" className="border border-white/10 rounded-xl px-4 bg-white/5 data-[state=open]:bg-white/10 transition-all">
                        <AccordionTrigger className="text-lg font-semibold hover:no-underline text-white">
                            I haven't received my order
                        </AccordionTrigger>
                        <AccordionContent className="text-slate-300 pb-4 text-base leading-relaxed">
                            The driver marked this order as <strong className="text-green-400">Delivered</strong>. 
                            If the item was not delivered, please contact support immediately for assistance.
                        </AccordionContent>
                    </AccordionItem>
                ) : (
                    /* FAILED / RETURNED FAQ */
                    <>
                        <AccordionItem value="item-1" className="border border-white/10 rounded-xl px-4 bg-white/5 data-[state=open]:bg-white/10 transition-all">
                            <AccordionTrigger className="text-lg font-semibold hover:no-underline text-white">
                                Where is my order?
                            </AccordionTrigger>
                            <AccordionContent className="text-slate-300 pb-4 text-base leading-relaxed">
                                Your order is currently at <strong className="text-[#ff8a3d]">{order.destinationWarehouse?.name || "Destination Warehouse"}</strong>. 
                                It is being processed for final delivery to your address.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-2" className="border border-white/10 rounded-xl px-4 bg-white/5 data-[state=open]:bg-white/10 transition-all">
                            <AccordionTrigger className="text-lg font-semibold hover:no-underline text-white">
                                My ASR failed what do I do now?
                            </AccordionTrigger>
                            <AccordionContent className="text-slate-300 pb-4 text-base leading-relaxed">
                                Request reverification of ASR. Your assigned driver or an admin will approve it manually. You can request reverification from the Order Details page.
                            </AccordionContent>
                        </AccordionItem>
                    </>
                )}

            </Accordion>
        </div>

      </main>
    </div>
  );
}
