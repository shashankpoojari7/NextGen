// useConversationList.ts
import { useQuery } from "@tanstack/react-query";
import { getConversationList } from "@/services/getConversationList";
import { ConversationListItem } from "@/types/chatResponse";

export function useConversationList() {
  return useQuery<ConversationListItem[]>({
    queryKey: ["conversation-list"],
    queryFn: getConversationList
  });
}
