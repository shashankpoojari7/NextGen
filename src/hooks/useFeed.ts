import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { getFeed } from "@/services/getFeed";
import {
  FeedCursor,
  FeedResponse,
} from "@/types/postResponseType";

type PageParam = {
  followingCursor: FeedCursor | null;
  publicCursor: FeedCursor | null;
};

export const useFeed = () => {
  return useInfiniteQuery<FeedResponse, Error, InfiniteData<FeedResponse>, string[], PageParam>({
    queryKey: ["feed"],
    queryFn: ({ pageParam }) => getFeed( pageParam.followingCursor, pageParam.publicCursor),
    initialPageParam: {
      followingCursor: null,
      publicCursor: null,
    },

    getNextPageParam: (lastPage) => {
      if ( !lastPage.hasMoreFollowing && !lastPage.hasMorePublic) {
        return undefined;
      }

      return {
        followingCursor: lastPage.cursor.following,
        publicCursor: lastPage.cursor.public,
      };
    }
  });
};