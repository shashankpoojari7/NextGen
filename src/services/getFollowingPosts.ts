import { FollowingFeedResponse } from "@/types/postResponseType";
import { axiosInstance } from "./axios";
import { ApiResponse } from "@/lib/ApiResponse";

export const getFollowingPosts = async (cursor?: string | null): Promise<FollowingFeedResponse> => {
  const res = await axiosInstance.get<ApiResponse<FollowingFeedResponse>>("/api/posts/feed/following", {
    params: {
      cursor,
    },
  });
  if (!res.data.success || !res.data.data) {
    throw new Error("Invalid response structure");
  }
  
  return res.data.data;
};