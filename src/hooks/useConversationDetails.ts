import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/services/axios";

export function useConversationDetails(peerId: string | null) {
  return useQuery({
    queryKey: ["conversation-details", peerId],
    queryFn: async () => {
      if (!peerId) return null;

      const res = await axiosInstance.get(`/api/chat/conversations/get-or-null?peerId=${peerId}`);
      return res.data.data || null;
    },
    enabled: !!peerId,
  });
}
