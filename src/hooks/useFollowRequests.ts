import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/services/axios";
import { ApiResponse } from "@/lib/ApiResponse";
import { FollowData } from "@/types/userFollowResponse";
import { getFollowRequests } from "@/services/getFollowRequests";

export function useFollowRequests() {
  return useQuery({
    queryKey: ["follow-requests"],
    queryFn: getFollowRequests
  });
}
