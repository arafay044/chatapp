import { useQuery } from "@tanstack/react-query";
import api from "../lib/axios";

export const useGifSearch = (q) => {
    return useQuery({
        queryKey: ["gif", q],
        queryFn: async () => {
            const { data } = await api.get("/api/gif/search", { params: { q } });
            return data;
        },
    });
};
