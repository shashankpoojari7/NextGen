import { getUserProfile } from "@/services/getUserProfile"
import { UserProfile } from "@/types/userProfileResponse"
import { useQuery } from "@tanstack/react-query"


export function useUserProfile(username: string) {
  return useQuery<UserProfile[]>({
    queryKey:["user-profile", username],
    queryFn: () => getUserProfile(username),
    enabled: !!username, 
  })
}