import { axiosInstance } from "./axios";
import { ApiResponse } from "@/lib/ApiResponse";

export const getMessages = async (conversationId: string) => {
  const res = await axiosInstance.get<ApiResponse>(
    `/api/chat/messages/${conversationId}`
  );

  return res.data.data;
};
