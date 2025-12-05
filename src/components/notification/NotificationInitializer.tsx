"use client";

import { useNotifications } from "@/hooks/useNotifications";
import { useConversationList } from "@/hooks/useConversationList";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useEffect } from "react";

export default function NotificationInitializer() {
  const { data: notifications } = useNotifications();
  const { data: conversations } = useConversationList();

  const setNotificationCount = useNotificationStore((s) => s.setNotificationCount);
  const setUnreadUsers = useNotificationStore((s) => s.setUnreadUsers);

  useEffect(() => {
    if (notifications) {
      const unread = notifications.filter((n) => !n.isRead).length;
      setNotificationCount(unread);
    }
  }, [notifications]);

  useEffect(() => {
    if (conversations) {
      const unreadUserIds = conversations
        .filter((c) => c.unreadCount > 0)
        .map((c) => c.peerId);
      setUnreadUsers(unreadUserIds);
    }
  }, [conversations]);

  return null;
}
