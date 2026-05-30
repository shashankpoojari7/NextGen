import { useInfiniteQuery } from "@tanstack/react-query";
import { getPublicPosts } from "@/services/getPublicPosts";
import { PublicFeedResponse } from "@/types/postResponseType";

export const usePublicPosts = (enabled: boolean) => {
  return useInfiniteQuery<PublicFeedResponse>({
    queryKey: ["public-posts"],
    queryFn: ({ pageParam }) => getPublicPosts(pageParam as string | null),
    initialPageParam: null,
    enabled,
    getNextPageParam: (lastPage) =>lastPage.hasMore ? lastPage.nextCursor : undefined,
  });
}
