import { create } from "zustand";

export const useConversationStore = create((set) => ({
    selectedConversation: null,
    replyingTo: null,
    typingByConversation: {}, // conversationId -> Set of userIds currently typing

    selectConversation: (conversation) => set({ selectedConversation: conversation, replyingTo: null }),
    clearSelectedConversation: () => set({ selectedConversation: null, replyingTo: null }),
    setReplyingTo: (message) => set({ replyingTo: message }),
    clearReplyingTo: () => set({ replyingTo: null }),

    setTyping: (conversationId, userId, isTyping) =>
        set((state) => {
            const current = new Set(state.typingByConversation[conversationId] || []);
            if (isTyping) current.add(userId);
            else current.delete(userId);
            return {
                typingByConversation: { ...state.typingByConversation, [conversationId]: current },
            };
        }),
}));
