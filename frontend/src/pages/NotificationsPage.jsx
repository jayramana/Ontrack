import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { notificationAPI } from "../services/api";
import { Bell, CheckCircle, AlertTriangle, Info, Trash2, Check, Filter } from "lucide-react";
import DriverSidebar from "./driver/DriverSidebar";
import CustomerSidebar from "./customer/CustomerSidebar";
import SellerSidebar from "./seller/SellerSidebar";
import AdminSidebar from "./admin/AdminSidebar";

export default function NotificationsPage() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // 'all' or 'unread'

    useEffect(() => {
        fetchNotifications();
    }, []);

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
            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, isRead: true } : n
            ));
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationAPI.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === "unread") return !n.isRead;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const renderSidebar = () => {
        if (!user) return null;
        switch (user.role) {
            case "driver": return <DriverSidebar active="notifications" />;
            case "customer": return <CustomerSidebar active="notifications" />;
            case "seller": return <SellerSidebar active="notifications" />;
            case "admin": return <AdminSidebar active="notifications" />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen flex bg-[#0b0f14] text-white">
            {renderSidebar()}

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="sticky top-0 z-30 bg-[#0b0f14] border-b border-white/10 px-8 py-5 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Bell className="text-[#f9b400]" size={32} />
                            Notifications
                        </h1>
                        <p className="text-gray-400 mt-1">Stay updated with your latest alerts and messages</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-[#1a1f29] p-1 rounded-lg border border-white/10 flex">
                            <button
                                onClick={() => setFilter("all")}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === "all"
                                    ? "bg-[#f9b400]/20 text-[#f9b400]"
                                    : "text-gray-400 hover:text-white"
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter("unread")}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${filter === "unread"
                                    ? "bg-[#f9b400]/20 text-[#f9b400]"
                                    : "text-gray-400 hover:text-white"
                                    }`}
                            >
                                Unread
                                {unreadCount > 0 && (
                                    <span className="bg-[#f9b400] text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors text-slate-300 hover:text-white"
                            >
                                <Check size={16} />
                                Mark all read
                            </button>
                        )}
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-4xl mx-auto space-y-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f9b400] mb-4"></div>
                                <p className="text-gray-500">Loading notifications...</p>
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                    <Bell size={40} className="text-gray-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    {filter === "unread" ? "No unread notifications" : "No notifications yet"}
                                </h3>
                                <p className="text-gray-500 max-w-sm">
                                    {filter === "unread"
                                        ? "You're all caught up! Check the 'All' tab to see past notifications."
                                        : "We'll notify you when important updates happen regarding your orders or account."}
                                </p>
                            </div>
                        ) : (
                            filteredNotifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    onClick={() => !notif.isRead && markAsRead(notif.id)}
                                    className={`relative group p-6 rounded-xl border transition-all duration-200 cursor-pointer
                                        ${notif.isRead
                                            ? "bg-[#11161d] border-transparent hover:border-white/5 opacity-70 hover:opacity-100"
                                            : "bg-[#161b22] border-l-4 border-l-[#f9b400] border-y-white/5 border-r-white/5 shadow-lg shadow-black/20 hover:bg-[#1c222b]"
                                        }`}
                                >
                                    <div className="flex items-start gap-5">
                                        <div className={`mt-1 flex-shrink-0 p-3 rounded-full ${notif.type === "Success" ? "bg-emerald-500/10 text-emerald-500" :
                                            notif.type === "Alert" ? "bg-red-500/10 text-red-500" :
                                                "bg-blue-500/10 text-blue-500"
                                            }`}>
                                            {notif.type === "Success" ? <CheckCircle size={24} /> :
                                                notif.type === "Alert" ? <AlertTriangle size={24} /> :
                                                    <Info size={24} />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className={`text-lg font-semibold ${notif.isRead ? "text-gray-400" : "text-white"}`}>
                                                    {notif.heading || "Notification"}
                                                </h4>
                                                <span className="text-xs text-gray-500 font-mono whitespace-nowrap ml-4">
                                                    {new Date(notif.createdAt).toLocaleDateString()} • {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className={`text-base leading-relaxed ${notif.isRead ? "text-gray-500" : "text-gray-300"}`}>
                                                {notif.message}
                                            </p>
                                        </div>
                                    </div>

                                    {!notif.isRead && (
                                        <div className="absolute top-6 right-6 w-3 h-3 bg-[#f9b400] rounded-full shadow-[0_0_10px_rgba(249,180,0,0.5)]"></div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
