import { useQuery } from "@tanstack/react-query";
import { getMessages } from "@/services/getMessages";

export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ["chat-messages", conversationId],
    queryFn: () => getMessages(conversationId as string),
    enabled: !!conversationId,
    initialData: {
      messages: [],
      unreadCount: 0,
    },
  });
}
