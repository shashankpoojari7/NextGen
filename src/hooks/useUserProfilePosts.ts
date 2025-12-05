import { getUserPost } from "@/services/getUserProfilePosts";
import { IncomingPostData } from "@/types/postResponseType";
import { useQuery } from "@tanstack/react-query";


export function useUserProfilePosts( userId: string) {
  return useQuery<IncomingPostData[]>({
    queryKey: ['user-profile-posts', userId],
    queryFn: () => getUserPost(userId),
    enabled: !!userId
  })
}