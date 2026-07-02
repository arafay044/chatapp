export function formatMessageTime(date) {
    return new Date(date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

export function formatDateSeparator(date) {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

export function formatLastSeen(date) {
    if (!date) return "";
    const diffMs = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

export function getInitials(name = "") {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
}

const AVATAR_PALETTE = [
    "#16a34a", "#2563eb", "#d97706", "#dc2626", "#7c3aed", "#0891b2", "#db2777", "#4d7c0f",
];

export function colorFromString(str = "") {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

// append Cloudinary transformation params for lightweight thumbnails
export function cloudinaryThumb(url, { w = 96, h = 96 } = {}) {
    if (!url || !url.includes("/upload/")) return url;
    return url.replace("/upload/", `/upload/w_${w},h_${h},c_fill,g_face,q_auto,f_auto/`);
}
