import { getComments } from "@/services/getComments";
import { commentData } from "@/types/commentResponse";
import { useQuery } from "@tanstack/react-query";


export function useComments(postId: string) {
  return useQuery<commentData[]>({
    queryKey: ["post-comments", postId],
    queryFn: () => getComments(postId),
    enabled: !!postId
  })
}