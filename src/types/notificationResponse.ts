export interface NotificationItem {
  _id: string;
  type: "LIKE" | "COMMENT" | "FOLLOW" | "FOLLOW_REQUEST";
  isRead: boolean;
  createdAt: string;
  followRequestId?: string;
  senderUsername: string;
  senderImage: string;
  postPreview?: string | null;
}