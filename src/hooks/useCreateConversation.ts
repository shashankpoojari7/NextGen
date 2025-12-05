import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/services/axios";
import { ApiResponse } from "@/lib/ApiResponse";

interface CreateConversationData {
  peerId: string;
  text: string;
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateConversationData) => {
      const res = await axiosInstance.post<ApiResponse>(
        "/api/chat/conversations/create-conversation",
        data
      );

      if (!res.data.success) throw new Error(res.data.message);
      return res.data.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['chat-conversation']});
    },
  });
}
