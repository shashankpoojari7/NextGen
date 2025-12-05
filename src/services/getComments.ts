import { ApiResponse } from "@/lib/ApiResponse";
import { axiosInstance } from "./axios"
import { commentData } from "@/types/commentResponse";


export const getComments = async(postId: string) => {
  const response = await axiosInstance.get<ApiResponse<commentData[]>>(`/api/posts/comment/get-comments/${postId}`)

  if (!response.data.success || !Array.isArray(response.data.data)) {
    throw new Error("Invalid response structure");
  }

  return response.data.data
}