import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/services/axios";
import { ApiResponse } from "@/lib/ApiResponse";

type userData = {
  username: string;
  fullname: string;
  bio: string;
  profile_image: string | null;
}

export function useUserSettings() {
  return useQuery({
    queryKey: ["user-settings"],
    queryFn: async () => {
      const res = await axiosInstance.get<ApiResponse<userData>>("/api/user/settings/update-profile-data");
      return res.data.data;
    },
  });
}
