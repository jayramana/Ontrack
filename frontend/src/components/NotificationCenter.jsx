import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { formatStatus, formatDate, formatDateTime } from "@/lib/utils";
import * as signalR from "@microsoft/signalr";

export default function NotificationCenter({ isOpen, onClose }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await notificationAPI.getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await notificationAPI.markAsRead(id);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, isRead: true } : n
            ));
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationAPI.markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-start justify-start pointer-events-none">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-[2px] pointer-events-auto"
                onClick={onClose}
            />

            {/* Popover Content */}
            <div
                className="relative mt-20 ml-4 md:ml-20 w-[calc(100vw-32px)] md:w-80 max-h-[80vh] bg-[#0b0f14] border border-white/10 shadow-2xl rounded-2xl flex flex-col pointer-events-auto animate-in fade-in zoom-in duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5 rounded-t-2xl">
                    <div className="flex items-center gap-2">
                        <Bell size={20} className="text-[#f9b400]" />
                        <h2 className="font-bold text-slate-100">Notifications</h2>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg text-slate-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar min-h-[100px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#f9b400]"></div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-slate-500">
                            <Bell size={40} className="mb-3 opacity-20" />
                            <p className="text-sm font-medium">No notifications yet</p>
                            <p className="text-xs opacity-50 text-center mt-1">We'll alert you when something happens</p>
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div
                                key={notif.id}
                                onClick={() => !notif.isRead && markAsRead(notif.id)}
                                className={`p-3 rounded-xl border transition-all cursor-pointer group relative ${notif.isRead
                                    ? "bg-transparent border-transparent opacity-60"
                                    : "bg-white/5 border-white/10 hover:border-[#f9b400]/30"
                                    }`}
                            >
                                <div className="flex gap-3">
                                    <div className={`mt-1 flex-shrink-0 p-2 rounded-lg ${notif.type === "Success" ? "bg-green-500/10 text-green-500" :
                                        notif.type === "Alert" ? "bg-red-500/10 text-red-500" :
                                            "bg-blue-500/10 text-blue-500"
                                        }`}>
                                        {notif.type === "Success" ? <CheckCircle size={14} /> :
                                            notif.type === "Alert" ? <AlertTriangle size={14} /> :
                                                <Info size={14} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm leading-snug font-medium ${notif.isRead ? "text-slate-400" : "text-slate-100"}`}>
                                            {notif.message}
                                        </p>
                                        <p className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-1">
                                            <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                                            {formatDateTime(notif.createdAt)}
                                        </p>
                                    </div>
                                    {!notif.isRead && (
                                        <div className="w-2 h-2 rounded-full bg-[#f9b400] absolute top-4 right-4 shadow-[0_0_8px_rgba(249,180,0,0.5)]"></div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {notifications.some(n => !n.isRead) && (
                    <div className="p-3 border-t border-white/10 bg-white/5 rounded-b-2xl">
                        <button
                            onClick={markAllAsRead}
                            className="w-full py-2 rounded-xl bg-white/5 text-slate-300 font-semibold text-xs hover:bg-white/10 hover:text-white transition-all border border-white/10"
                        >
                            Mark all as read
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
