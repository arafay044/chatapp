import { useQuery } from "@tanstack/react-query";
import api from "../lib/axios";

export const useSearchUsers = (q) => {
    return useQuery({
        queryKey: ["userSearch", q],
        queryFn: async () => {
            const { data } = await api.get("/api/auth/search", { params: { q } });
            return data.users;
        },
        enabled: q.trim().length > 0,
    });
};
