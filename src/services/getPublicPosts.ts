import { axiosInstance } from "./axios";
import { ApiResponse } from "@/lib/ApiResponse";
import { PublicFeedResponse } from "@/types/postResponseType";

export const getPublicPosts = async (cursor?: string | null): Promise<PublicFeedResponse> => {
  const res = await axiosInstance.get<ApiResponse<PublicFeedResponse>>("/api/posts/feed/public", {
    params: {
      cursor
    }
  });

  console.log("public raw response:", res.data);
  if (!res.data.success || !res.data.data) {
    throw new Error("Invalid response structure");
  }

  return res.data.data;
  
};