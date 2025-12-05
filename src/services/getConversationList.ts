import { ApiResponse } from "@/lib/ApiResponse";
import { axiosInstance } from "./axios"
import { ConversationListItem } from "@/types/chatResponse";


export const getConversationList = async():Promise<ConversationListItem[]> => {
  const response = await axiosInstance.get<ApiResponse<ConversationListItem[]>>('/api/chat/conversations/fetch-conversation')

  if (!response.data.success || !Array.isArray(response.data.data)) {
    throw new Error("Invalid response structure");
  }

  return response.data.data;
}