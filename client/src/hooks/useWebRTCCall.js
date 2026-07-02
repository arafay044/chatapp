import { useCallback, useEffect, useRef } from "react";
import { getSocket } from "../lib/socket";
import { useCallStore } from "../store/useCallStore";
import { useAuthStore } from "../store/useAuthStore";

const ICE_SERVERS = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

// Native WebRTC 1:1 calling, signaled over the existing Socket.IO connection.
// No TURN server is configured, so calls may fail across strict corporate NATs.
export const useWebRTCCall = () => {
    const pcRef = useRef(null);
    const pendingCandidatesRef = useRef([]);
    const authUser = useAuthStore((s) => s.authUser);

    const store = useCallStore;

    const cleanup = useCallback(() => {
        pcRef.current?.close();
        pcRef.current = null;
        pendingCandidatesRef.current = [];
        const { localStream } = store.getState();
        localStream?.getTracks().forEach((t) => t.stop());
        store.getState().reset();
    }, [store]);

    const createPeerConnection = useCallback((peerUserId) => {
        const pc = new RTCPeerConnection(ICE_SERVERS);
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                getSocket()?.emit("call:ice-candidate", { toUserId: peerUserId, candidate: event.candidate });
            }
        };
        pc.ontrack = (event) => {
            store.getState().setRemoteStream(event.streams[0]);
        };
        pc.onconnectionstatechange = () => {
            if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
                cleanup();
            }
        };
        pcRef.current = pc;
        return pc;
    }, [cleanup, store]);

    const startCall = useCallback(async (peerUser, callType) => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: callType === "video",
        });
        store.getState().setLocalStream(stream);
        store.getState().startOutgoing(peerUser, callType);

        const pc = createPeerConnection(peerUser._id);
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        getSocket()?.emit("call:invite", {
            toUserId: peerUser._id,
            offer,
            callType,
            caller: { _id: authUser._id, fullName: authUser.fullName, profilePic: authUser.profilePic },
        });
    }, [createPeerConnection, store, authUser]);

    const acceptCall = useCallback(async () => {
        const { peerUser, callType, incomingOffer } = store.getState();
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: callType === "video",
        });
        store.getState().setLocalStream(stream);

        const pc = createPeerConnection(peerUser._id);
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));
        pendingCandidatesRef.current.forEach((c) => pc.addIceCandidate(new RTCIceCandidate(c)));
        pendingCandidatesRef.current = [];

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        getSocket()?.emit("call:answer", { toUserId: peerUser._id, answer });
        store.getState().goActive();
    }, [createPeerConnection, store]);

    const rejectCall = useCallback(() => {
        const { peerUser } = store.getState();
        if (peerUser) getSocket()?.emit("call:reject", { toUserId: peerUser._id });
        cleanup();
    }, [cleanup, store]);

    const endCall = useCallback(() => {
        const { peerUser } = store.getState();
        if (peerUser) getSocket()?.emit("call:end", { toUserId: peerUser._id });
        cleanup();
    }, [cleanup, store]);

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const onInvite = ({ fromUserId, offer, callType, caller }) => {
            if (store.getState().status !== "idle") {
                socket.emit("call:reject", { toUserId: fromUserId });
                return;
            }
            store.getState().startIncoming(caller || { _id: fromUserId, fullName: "Unknown" }, callType, offer);
        };

        const onAnswer = async ({ answer }) => {
            const pc = pcRef.current;
            if (!pc) return;
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
            store.getState().goActive();
        };

        const onIceCandidate = async ({ candidate }) => {
            const pc = pcRef.current;
            if (pc?.remoteDescription) {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } else {
                pendingCandidatesRef.current.push(candidate);
            }
        };

        const onReject = () => cleanup();
        const onEnd = () => cleanup();

        socket.on("call:invite", onInvite);
        socket.on("call:answer", onAnswer);
        socket.on("call:ice-candidate", onIceCandidate);
        socket.on("call:reject", onReject);
        socket.on("call:end", onEnd);

        return () => {
            socket.off("call:invite", onInvite);
            socket.off("call:answer", onAnswer);
            socket.off("call:ice-candidate", onIceCandidate);
            socket.off("call:reject", onReject);
            socket.off("call:end", onEnd);
        };
    }, [cleanup, store]);

    return { startCall, acceptCall, rejectCall, endCall };
};
