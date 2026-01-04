import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { notificationAPI } from "../services/api";
import NotificationCenter from "./NotificationCenter";

export default function NotificationBell({ showLabel = false, active = false }) {
    const [unreadCount, setUnreadCount] = useState(0);
    const [isCenterOpen, setIsCenterOpen] = useState(false);

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const notifications = await notificationAPI.getNotifications();
            const count = notifications.filter(n => !n.isRead).length;
            setUnreadCount(count);
        } catch (error) {
            console.error("Error fetching unread count:", error);
        }
    };

    return (
        <div className="relative w-full">
            <button
                onClick={() => setIsCenterOpen(!isCenterOpen)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all relative
                    ${active || isCenterOpen
                        ? "bg-white/10 text-[#f9b400]"
                        : "hover:bg-white/10 text-slate-300"
                    }`}
            >
                <div className="relative">
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-[#0b0f14]">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </div>

                <span className={`transition-opacity whitespace-nowrap font-medium
                    ${showLabel ? "opacity-100" : "opacity-100 md:opacity-0 md:group-hover:opacity-100"}
                `}>
                    Notifications
                </span>
            </button>

            <NotificationCenter
                isOpen={isCenterOpen}
                onClose={() => {
                    setIsCenterOpen(false);
                    fetchUnreadCount();
                }}
            />
        </div>
    );
}
