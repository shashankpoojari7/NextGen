import { useQuery } from "@tanstack/react-query";
import { getPublicPosts } from "@/services/getPublicPosts";
import { IncomingPostData } from "@/app/(app)/home/HomePage";

export function usePublicPosts() {
  return useQuery<IncomingPostData[]>({
    queryKey: ["public-posts"],
    queryFn: getPublicPosts,
  });
}
