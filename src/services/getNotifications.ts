import { axiosInstance } from "./axios";
import { ApiResponse } from "@/lib/ApiResponse";
import { NotificationItem } from "@/types/notificationResponse";

export const getNotifications = async (): Promise<NotificationItem[]> => {
  const res = await axiosInstance.get<ApiResponse<NotificationItem[]>>("/api/notifications");

  if (!res.data.success || !Array.isArray(res.data.data)) {
    throw new Error("Invalid response structure");
  }

  return res.data.data;
};