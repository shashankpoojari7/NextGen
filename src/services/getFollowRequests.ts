import { FollowData } from "@/types/userFollowResponse"
import { axiosInstance } from "./axios"
import { ApiResponse } from "@/lib/ApiResponse"


export const getFollowRequests = async():Promise<FollowData[]> => {
  const response = await axiosInstance.get<ApiResponse<FollowData[]>>("/api/user/follow-requests")

  if (!response.data.success || !Array.isArray(response.data.data)) {
    throw new Error("Invalid response structure");
  }

  return response.data.data;
} 