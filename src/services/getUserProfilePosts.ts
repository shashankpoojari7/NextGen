import { ApiResponse } from "@/lib/ApiResponse";
import { axiosInstance } from "./axios";
import { UserProfilePosts } from "@/types/userProfileResponse";


export const getUserPost = async (userId: string) => {
  const response = await axiosInstance.get<ApiResponse<UserProfilePosts[]>>(`/api/posts/user-posts/${userId}`)

  if (!response.data.success || !Array.isArray(response.data.data)) {
    throw new Error("Invalid response structure");
  }

  return response.data.data
}