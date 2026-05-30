import { useInfiniteQuery } from "@tanstack/react-query";
import { getFollowingPosts } from "@/services/getFollowingPosts";
import { FollowingFeedResponse } from "@/types/postResponseType";

export const useFollowingPosts = () => {
  return useInfiniteQuery<FollowingFeedResponse>({
    queryKey: ["following-posts"],
    queryFn: ({ pageParam }) => getFollowingPosts(pageParam as string | null),
    initialPageParam: null,
    getNextPageParam: (lastPage) =>lastPage.hasMore ? lastPage.nextCursor : undefined,
  });
};