import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../lib/axios";

export const useCreateGroup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ groupName, participantIds, groupIcon }) => {
            const { data } = await api.post("/api/conversations/group", { groupName, participantIds, groupIcon });
            if (!data.success) throw new Error(data.message);
            return data.conversation;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            toast.success("Group created");
        },
        onError: (error) => toast.error(error.message || "Failed to create group"),
    });
};

export const useUpdateGroup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, groupName, groupIcon }) => {
            const { data } = await api.put(`/api/conversations/group/${id}`, { groupName, groupIcon });
            if (!data.success) throw new Error(data.message);
            return data.conversation;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["conversations"] }),
        onError: (error) => toast.error(error.message || "Failed to update group"),
    });
};

export const useUpdateGroupMembers = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, add = [], remove = [] }) => {
            const { data } = await api.put(`/api/conversations/group/${id}/members`, { add, remove });
            if (!data.success) throw new Error(data.message);
            return data.conversation;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["conversations"] }),
        onError: (error) => toast.error(error.message || "Failed to update members"),
    });
};

export const useToggleMute = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const { data } = await api.put(`/api/conversations/${id}/mute`);
            if (!data.success) throw new Error(data.message);
            return data.muted;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["conversations"] }),
    });
};
