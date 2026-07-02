import { create } from "zustand";
import toast from "react-hot-toast";
import api, { setAuthToken } from "../lib/axios";
import { connectSocket, disconnectSocket, getSocket } from "../lib/socket";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    onlineUsers: [],
    isLoading: true,
    isAuthenticating: false,

    initSocketListeners: () => {
        const socket = getSocket();
        if (!socket) return;
        socket.off("getOnlineUsers");
        socket.on("getOnlineUsers", (userIds) => set({ onlineUsers: userIds }));
    },

    checkAuth: async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            set({ isLoading: false });
            return;
        }
        setAuthToken(token);
        try {
            const { data } = await api.get("/api/auth/check");
            if (data.success) {
                set({ authUser: data.user });
                connectSocket(token);
                get().initSocketListeners();
            } else {
                localStorage.removeItem("token");
            }
        } catch {
            localStorage.removeItem("token");
        } finally {
            set({ isLoading: false });
        }
    },

    login: async (mode, credentials) => {
        set({ isAuthenticating: true });
        try {
            const { data } = await api.post(`/api/auth/${mode}`, credentials);
            if (data.success) {
                localStorage.setItem("token", data.token);
                setAuthToken(data.token);
                set({ authUser: data.userData });
                connectSocket(data.token);
                get().initSocketListeners();
                toast.success(data.message);
                return true;
            }
            toast.error(data.message);
            return false;
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
            return false;
        } finally {
            set({ isAuthenticating: false });
        }
    },

    logout: () => {
        localStorage.removeItem("token");
        setAuthToken(null);
        disconnectSocket();
        set({ authUser: null, onlineUsers: [] });
        toast.success("Logged out");
    },

    updateProfile: async (body) => {
        try {
            const { data } = await api.put("/api/auth/update-profile", body);
            if (data.success) {
                set({ authUser: data.user });
                toast.success("Profile updated");
                return true;
            }
            toast.error(data.message);
            return false;
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
            return false;
        }
    },
}));
