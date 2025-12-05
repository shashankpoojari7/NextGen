import { useQuery } from "@tanstack/react-query";
import { FollowData } from "@/types/userFollowResponse";
import { getFollowRequests } from "@/services/getFollowRequests";

export function useFollowRequests() {
  return useQuery<FollowData[]>({
    queryKey: ["follow-requests"],
    queryFn: getFollowRequests
  });
}
