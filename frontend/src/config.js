export const API_BASE_URL = import.meta.env.VITE_API_URL || "https://ontrack-t99t.onrender.com/api";
export const HUB_BASE_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : "https://ontrack-t99t.onrender.com";
