import { ApiResponse } from "@/lib/ApiResponse"
import { axiosInstance } from "./axios"
import { UserProfile } from "@/types/userProfileResponse"


export const getUserProfile = async(username: string):Promise<UserProfile[]> => {
  const response = await axiosInstance.get<ApiResponse<UserProfile[]>>(`/api/user/user-profile/${username}`)

  if (!response.data.success || !Array.isArray(response.data.data)) {
    throw new Error("Invalid response structure");
  }

  return response.data.data
}