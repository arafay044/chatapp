import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "../lib/socket";
import { useConversationStore } from "../store/useConversationStore";
import { useAuthStore } from "../store/useAuthStore";

// Wires Socket.IO events into the React Query cache so components never
// need their own socket.on/off pairs. Mount once near the app root.
export const useRealtimeSync = () => {
    const queryClient = useQueryClient();
    const authUser = useAuthStore((s) => s.authUser);
    const setTyping = useConversationStore((s) => s.setTyping);

    useEffect(() => {
        if (!authUser) return;
        const socket = getSocket();
        if (!socket) return;

        const patchMessagesCache = (conversationId, updater) => {
            queryClient.setQueriesData({ queryKey: ["messages", conversationId] }, (old) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map((page) => ({ ...page, messages: updater(page.messages) })),
                };
            });
        };

        const bumpConversationList = (message) => {
            queryClient.setQueryData(["conversations"], (old) => {
                if (!old) return old;
                const conversations = old.conversations.map((c) =>
                    c._id === message.conversationId ? { ...c, lastMessage: message, updatedAt: new Date().toISOString() } : c
                );
                conversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                const unreadCounts = { ...old.unreadCounts };
                const isOwnMessage = message.senderId === authUser._id || message.senderId?._id === authUser._id;
                const isCurrentlyOpen = useConversationStore.getState().selectedConversation?._id === message.conversationId;
                if (!isOwnMessage && !isCurrentlyOpen) {
                    unreadCounts[message.conversationId] = (unreadCounts[message.conversationId] || 0) + 1;
                }
                return { ...old, conversations, unreadCounts };
            });
        };

        const onNewMessage = (message) => {
            patchMessagesCache(message.conversationId, (msgs) => [...msgs, message]);
            bumpConversationList(message);
        };

        const onMessageEdited = (message) => {
            patchMessagesCache(message.conversationId, (msgs) =>
                msgs.map((m) => (m._id === message._id ? message : m))
            );
        };

        const onMessageDeleted = ({ _id, conversationId }) => {
            patchMessagesCache(conversationId, (msgs) =>
                msgs.map((m) => (m._id === _id ? { ...m, isDeleted: true, text: "", image: undefined, audioUrl: undefined } : m))
            );
        };

        const onMessageReaction = ({ _id, conversationId, reactions }) => {
            patchMessagesCache(conversationId, (msgs) =>
                msgs.map((m) => (m._id === _id ? { ...m, reactions } : m))
            );
        };

        const onMessagesSeen = ({ conversationId, userId }) => {
            patchMessagesCache(conversationId, (msgs) =>
                msgs.map((m) =>
                    m.seenBy?.some((s) => s.userId === userId)
                        ? m
                        : { ...m, seenBy: [...(m.seenBy || []), { userId, seenAt: new Date().toISOString() }] }
                )
            );
        };

        const onTyping = ({ conversationId, userId }) => setTyping(conversationId, userId, true);
        const onStopTyping = ({ conversationId, userId }) => setTyping(conversationId, userId, false);

        socket.on("newMessage", onNewMessage);
        socket.on("messageEdited", onMessageEdited);
        socket.on("messageDeleted", onMessageDeleted);
        socket.on("messageReaction", onMessageReaction);
        socket.on("messagesSeen", onMessagesSeen);
        socket.on("typing", onTyping);
        socket.on("stopTyping", onStopTyping);

        return () => {
            socket.off("newMessage", onNewMessage);
            socket.off("messageEdited", onMessageEdited);
            socket.off("messageDeleted", onMessageDeleted);
            socket.off("messageReaction", onMessageReaction);
            socket.off("messagesSeen", onMessagesSeen);
            socket.off("typing", onTyping);
            socket.off("stopTyping", onStopTyping);
        };
    }, [authUser, queryClient, setTyping]);
};
