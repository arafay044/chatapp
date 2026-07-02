import { useRef, useCallback } from "react";
import { getSocket } from "../lib/socket";

const STOP_DELAY = 2000;

export const useTypingEmitter = (conversationId) => {
    const timeoutRef = useRef(null);
    const isTypingRef = useRef(false);

    const notifyTyping = useCallback(() => {
        const socket = getSocket();
        if (!socket || !conversationId) return;

        if (!isTypingRef.current) {
            isTypingRef.current = true;
            socket.emit("typing", { conversationId });
        }
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            isTypingRef.current = false;
            socket.emit("stopTyping", { conversationId });
        }, STOP_DELAY);
    }, [conversationId]);

    const notifyStopTyping = useCallback(() => {
        const socket = getSocket();
        clearTimeout(timeoutRef.current);
        if (isTypingRef.current && socket && conversationId) {
            isTypingRef.current = false;
            socket.emit("stopTyping", { conversationId });
        }
    }, [conversationId]);

    return { notifyTyping, notifyStopTyping };
};
