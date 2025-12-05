import { getNotifications } from "@/services/getNotifications";
import { NotificationItem } from "@/types/notificationResponse";
import { useQuery } from "@tanstack/react-query";

export function useNotifications() {
  return useQuery<NotificationItem[]>({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  });
}
