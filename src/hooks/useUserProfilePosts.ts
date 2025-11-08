import { getUserPost } from "@/services/getUserProfilePosts";
import { useQuery } from "@tanstack/react-query";


export function useUserProfilePosts( userId: string) {
  return useQuery({
    queryKey: ['user-profile-posts', userId],
    queryFn: () => getUserPost(userId),
    enabled: !!userId
  })
}