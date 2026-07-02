import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../lib/axios";

export const useMessages = (conversationId) => {
    return useInfiniteQuery({
        queryKey: ["messages", conversationId],
        queryFn: async ({ pageParam }) => {
            const { data } = await api.get(`/api/messages/${conversationId}`, {
                params: { before: pageParam, limit: 30 },
            });
            return data;
        },
        initialPageParam: undefined,
        getNextPageParam: (lastPage) =>
            lastPage.hasMore ? lastPage.messages[0]?._id : undefined,
        enabled: Boolean(conversationId),
        staleTime: 10_000,
    });
};

// flattens infinite-query pages into a single oldest -> newest array
export const flattenMessagePages = (data) => {
    if (!data) return [];
    return [...data.pages].reverse().flatMap((page) => page.messages);
};

export const useSendMessage = (conversationId) => {
    return useMutation({
        mutationFn: async (payload) => {
            const { data } = await api.post(`/api/messages/send/${conversationId}`, payload);
            if (!data.success) throw new Error(data.message);
            return data.message;
        },
        onError: (error) => toast.error(error.message || "Failed to send message"),
    });
};

export const useEditMessage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, text }) => {
            const { data } = await api.put(`/api/messages/${id}`, { text });
            if (!data.success) throw new Error(data.message);
            return data.message;
        },
        onError: (error) => toast.error(error.message || "Failed to edit message"),
        onSettled: () => queryClient.invalidateQueries({ queryKey: ["messages"] }),
    });
};

export const useDeleteMessage = () => {
    return useMutation({
        mutationFn: async ({ id, forEveryone }) => {
            const { data } = await api.delete(`/api/messages/${id}`, { params: { forEveryone } });
            if (!data.success) throw new Error(data.message);
        },
        onError: (error) => toast.error(error.message || "Failed to delete message"),
    });
};

export const useReactToMessage = () => {
    return useMutation({
        mutationFn: async ({ id, emoji }) => {
            const { data } = await api.put(`/api/messages/${id}/react`, { emoji });
            if (!data.success) throw new Error(data.message);
            return data.reactions;
        },
    });
};

export const useSearchMessages = (conversationId) => {
    return useMutation({
        mutationFn: async (q) => {
            const { data } = await api.get(`/api/messages/search/${conversationId}`, { params: { q } });
            return data.messages;
        },
    });
};
