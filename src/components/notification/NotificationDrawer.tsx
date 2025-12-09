"use client";

import { ChevronRight, Loader, X } from "lucide-react";
import { useDrawerStore } from "@/store/useDrawerStore";
import Link from "next/link";
import { NotificationItem } from "@/types/notificationResponse";
import { getTimeAgo } from "@/helpers/getTimeAgo";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/services/axios";
import { FollowData } from "@/types/userFollowResponse";
import { useEffect } from "react";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useNotifications } from "@/hooks/useNotifications";

export default function NotificationRightDrawer() {
  const { data, isLoading, error } = useNotifications();
  const queryClient = useQueryClient();
  const resetNotification = useNotificationStore((s) => s.resetNotification);
  const { isNotificationDrawerOpen, toggle } = useDrawerStore();

  useEffect(() => {
    async function markRead() {
      try {
        await axiosInstance.patch("/api/notifications/mark-all-read");
        resetNotification();
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      } catch (err) {
        console.error("Failed to mark notifications as read", err);
      }
    }
    markRead();
  }, []);

  const mutation = useMutation({
    mutationFn: async ({ action, id }: { action: "accept" | "delete"; id: string }) => {
      if (action === "accept") {
        return axiosInstance.post(`/api/user/accept-request/${id}`);
      } else {
        return axiosInstance.delete(`/api/user/delete-request?requestId=${id}`);
      }
    },

    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["follow-requests"] });

      const previousData =
        queryClient.getQueryData<FollowData[]>(["follow-requests"]);

      if (previousData) {
        queryClient.setQueryData(
          ["follow-requests"],
          previousData.filter((req) => req._id !== id)
        );
      }

      return { previousData };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["follow-requests"], context.previousData);
      }
      toast.error("Something went wrong. Please try again.");
    },

    onSuccess: (_data, vars) => {
      if (vars.action === "accept") toast.success("Request accepted");
      else toast.info("Request deleted");
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["follow-requests"] });
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-6">
        <Loader className="w-7 h-7 animate-spin text-gray-400" />
      </div>
    );

  if (error)
    return <p className="text-red-500 text-center py-4">Failed to load notifications</p>;

  const notifications = data || [];

  const thisWeek = notifications.filter((n) => isWithinDays(n.createdAt, 7));
  const thisMonth = notifications.filter((n) => !isWithinDays(n.createdAt, 7));

  return (
    <div
      className={`
        fixed top-0 -left-100 h-screen z-40
        bg-white dark:bg-black border-l border-gray-200 dark:border-[#222]
        w-[400px] ml-20 hidden md:block
        transition-transform duration-300 ease-in-out
        ${isNotificationDrawerOpen ? "block translate-x-full" : "hidden translate-x-0"}
      `}
    >
      {/* FIXED HEADER */}
      <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200 dark:border-[#222] sticky top-0 bg-white dark:bg-black z-20">
        <h2 className="text-2xl text-black dark:text-white font-bold">Notifications</h2>

        <button
          onClick={toggle}
          className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full"
        >
          <X className="text-gray-900 dark:text-white" size={22} />
        </button>
      </div>

      <div className="h-[calc(100vh-64px)] overflow-y-auto">
        <FollowRequestBanner notifications={notifications} />

        {thisWeek.length > 0 && (
          <div className="border-b border-gray-200 dark:border-gray-800">
            <SectionHeader title="This week" />
            {thisWeek.map((n) => (
              <NotificationRow key={n._id} item={n} mutation={mutation} />
            ))}
          </div>
        )}

        {thisMonth.length > 0 && (
          <div className="border-b border-gray-200 dark:border-gray-800">
            <SectionHeader title="This month" />
            {thisMonth.map((n) => (
              <NotificationRow key={n._id} item={n} mutation={mutation} />
            ))}
          </div>
        )}

        {notifications.length === 0 && (
          <div className="flex justify-center py-10">
            <p className="text-gray-500">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FollowRequestBanner({ notifications }: { notifications: NotificationItem[] }) {
  const requests = notifications.filter((n) => n.type === "FOLLOW_REQUEST");
  if (requests.length === 0) return null;

  return (
    <Link href={"/notification/follow-requests"}>
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800">
            <img
              src={requests[0].senderImage || "/no-profile.jpg"}
              alt="request"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 dark:text-white">Follow requests</span>
            <span className="text-sm text-gray-500">
              {requests[0].senderUsername} + {requests.length - 1} others
            </span>
          </div>
        </div>

        <ChevronRight className="text-gray-900 dark:text-white" />
      </div>
    </Link>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="px-4 py-3">
      <h3 className="text-base font-bold text-gray-900 dark:text-white">{title}</h3>
    </div>
  );
}

function isWithinDays(date: string, days: number) {
  const diff =
    (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24);
  return diff <= days;
}

function NotificationRow({ item, mutation }: { item: NotificationItem; mutation: any }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Link href={`/profile/${item.senderUsername}`}>
          <div className="h-11 w-11 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 shrink-0">
            <img
              src={item.senderImage || "/no-profile.jpg"}
              alt="profile"
              className="w-full h-full object-cover"
            />
          </div>
        </Link>

        <div className="flex flex-col min-w-0">
          <NotificationText item={item} />
          <span className="text-xs text-gray-500">{getTimeAgo(item.createdAt)}</span>
        </div>
      </div>

      <RightAction item={item} mutation={mutation} />
    </div>
  );
}

function NotificationText({ item }: { item: NotificationItem }) {
  const name = (
    <Link href={`/profile/${item.senderUsername}`}>
      <span className="font-semibold text-gray-900 dark:text-white">
        {item.senderUsername}
      </span>
    </Link>
  );

  if (item.type === "LIKE")
    return (
      <span className="text-sm text-gray-700">
        {name} <span className="text-gray-600">liked your post.</span>
      </span>
    );

  if (item.type === "COMMENT")
    return (
      <span className="text-sm text-gray-700">
        {name} <span className="text-gray-600">commented on your post.</span>
      </span>
    );

  if (item.type === "FOLLOW")
    return (
      <span className="text-sm text-gray-700">
        {name} <span className="text-gray-600">started following you.</span>
      </span>
    );

  if (item.type === "FOLLOW_REQUEST")
    return (
      <span className="text-sm text-gray-700">
        {name} <span className="text-gray-600">requested to follow you.</span>
      </span>
    );

  return null;
}

function RightAction({ item, mutation }: { item: NotificationItem; mutation: any }) {
  if (item.type === "LIKE" || item.type === "COMMENT") {
    return (
      item.postPreview && (
        <div className="h-11 w-11 rounded overflow-hidden bg-gray-200 dark:bg-gray-800 ml-3">
          <img src={item.postPreview} className="w-full h-full object-cover" />
        </div>
      )
    );
  }

  if (item.type === "FOLLOW") return null;

  if (item.type === "FOLLOW_REQUEST") {
    return (
      <div className="flex gap-2 ml-3">
        <button
          onClick={() =>
            mutation.mutate({
              action: "accept",
              id: item.followRequestId,
            })
          }
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md"
        >
          Confirm
        </button>

        <button
          onClick={() =>
            mutation.mutate({
              action: "delete",
              id: item.followRequestId,
            })
          }
          className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-[#2b2b2b] dark:hover:bg-[#3b3b3b] text-gray-900 dark:text-white text-sm font-medium rounded-md"
        >
          Delete
        </button>
      </div>
    );
  }

  return null;
}
