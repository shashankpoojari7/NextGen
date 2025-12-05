import { getChatSearch } from "@/services/getChatSearch";
import { ChatSearchResponse } from "@/types/chatResponse";
import { useQuery } from "@tanstack/react-query";

export function useChatSearch(username: string) {
  return useQuery<ChatSearchResponse[]>({
    queryKey: ["chat-search", username],
    queryFn: () => getChatSearch(username),
    enabled: !!username
  })
}