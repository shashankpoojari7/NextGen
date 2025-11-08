import { axiosInstance } from "./axios";
import { ApiResponse } from "@/lib/ApiResponse";
import { IncomingPostData } from "@/app/(app)/home/HomePage";

export const getPublicPosts = async (): Promise<IncomingPostData[]> => {
  const res = await axiosInstance.get<ApiResponse<IncomingPostData[]>>("/api/posts/public");

  if (!res.data.success || !Array.isArray(res.data.data)) {
    throw new Error("Invalid response structure");
  }

  return res.data.data;
};