import { ApiResponse } from "@/lib/ApiResponse";
import { axiosInstance } from "./axios";
import { IncomingPostData } from "@/types/postResponseType";


export const getUserPost = async (userId: string):Promise<IncomingPostData[]> => {
  const response = await axiosInstance.get<ApiResponse<IncomingPostData[]>>(`/api/posts/user-posts/${userId}`)

  if (!response.data.success || !Array.isArray(response.data.data)) {
    throw new Error("Invalid response structure");
  }

  return response.data.data
}