import { create } from "zustand";

const getInitialTheme = () => {
    const stored = localStorage.getItem("theme");
    if (stored) return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const applyTheme = (theme) => {
    document.documentElement.classList.toggle("dark", theme === "dark");
};

const initial = getInitialTheme();
applyTheme(initial);

export const useUIStore = create((set, get) => ({
    theme: initial,
    isNewConversationOpen: false,
    isSearchOverlayOpen: false,
    isInfoPanelOpen: false,

    toggleTheme: () => {
        const next = get().theme === "dark" ? "light" : "dark";
        localStorage.setItem("theme", next);
        applyTheme(next);
        set({ theme: next });
    },
    openNewConversation: () => set({ isNewConversationOpen: true }),
    closeNewConversation: () => set({ isNewConversationOpen: false }),
    openSearchOverlay: () => set({ isSearchOverlayOpen: true }),
    closeSearchOverlay: () => set({ isSearchOverlayOpen: false }),
    toggleInfoPanel: () => set((s) => ({ isInfoPanelOpen: !s.isInfoPanelOpen })),
    closeInfoPanel: () => set({ isInfoPanelOpen: false }),
}));
