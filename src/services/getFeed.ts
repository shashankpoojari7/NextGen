import { axiosInstance } from "./axios";
import { ApiResponse } from "@/lib/ApiResponse";
import { FeedResponse, FeedCursor } from "@/types/postResponseType";

export const getFeed = async (
  followingCursor: FeedCursor | null,
  publicCursor: FeedCursor | null
): Promise<FeedResponse> => {
  const res = await axiosInstance.get<ApiResponse<FeedResponse>>(
    "/api/posts/feed",
    {
      params: {
        ...(followingCursor && {
          followingCursor: followingCursor._id,
        }),
        ...(publicCursor && {
          publicCursor: publicCursor._id,
        }),
      },
    }
  );

  if (!res.data.success || !res.data.data) {
    throw new Error("Invalid response structure");
  }

  return res.data.data;
};