import { useQuery } from "@tanstack/react-query";
import api from "../lib/axios";

export const useConversations = () => {
    return useQuery({
        queryKey: ["conversations"],
        queryFn: async () => {
            const { data } = await api.get("/api/conversations");
            return data;
        },
    });
};

export const useOpenOneToOne = () => {
    return async (userId) => {
        const { data } = await api.get(`/api/conversations/with/${userId}`);
        return data.conversation;
    };
};
