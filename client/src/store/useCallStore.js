import { create } from "zustand";

export const useCallStore = create((set) => ({
    status: "idle", // idle | outgoing | incoming | active
    callType: "audio", // audio | video
    peerUser: null,
    incomingOffer: null,
    localStream: null,
    remoteStream: null,
    isMuted: false,
    isCameraOff: false,

    startOutgoing: (peerUser, callType) => set({ status: "outgoing", peerUser, callType }),
    startIncoming: (peerUser, callType, offer) =>
        set({ status: "incoming", peerUser, callType, incomingOffer: offer }),
    goActive: () => set({ status: "active" }),
    setLocalStream: (stream) => set({ localStream: stream }),
    setRemoteStream: (stream) => set({ remoteStream: stream }),
    toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
    toggleCamera: () => set((s) => ({ isCameraOff: !s.isCameraOff })),
    reset: () =>
        set({
            status: "idle",
            peerUser: null,
            incomingOffer: null,
            localStream: null,
            remoteStream: null,
            isMuted: false,
            isCameraOff: false,
        }),
}));
