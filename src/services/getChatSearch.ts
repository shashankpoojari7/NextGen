import { ApiResponse } from "@/lib/ApiResponse"
import { axiosInstance } from "./axios"
import { ChatSearchResponse } from "@/types/chatResponse";


export const getChatSearch = async( username: string ):Promise<any> => {
  const response = await axiosInstance.get<ApiResponse<ChatSearchResponse[]>>(`/api/chat/conversations/search/${username}`)

  if (!response.data.success || !Array.isArray(response.data.data)) {
    throw new Error("Invalid response structure");
  }

  return response.data.data;
}