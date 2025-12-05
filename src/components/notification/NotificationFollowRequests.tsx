"use client";

import { useFollowRequests } from "@/hooks/useFollowRequests";
import { FollowData } from "@/types/userFollowResponse";
import { Loader } from "lucide-react";
import Link from "next/link";
import { getTimeAgo } from "@/helpers/getTimeAgo";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/services/axios";
import { toast } from "sonner";

function NotificationFollowRequests() {
  const { 
    data: followRequests, 
    isLoading: followLoading, 
    error: followError 
  } = useFollowRequests();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ action, id }: { action: "accept" | "delete"; id: string }) => {
      if (action === "accept") {
        return axiosInstance.post(`/api/user/accept-request/${id}`);
      } else if (action === "delete") {
        return axiosInstance.delete(`/api/user/delete-request?requestId=${id}`);
      }
    },

    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["follow-requests"] });

      const previousData = queryClient.getQueryData<FollowData[]>(["follow-requests"]);

      if (previousData) {
        queryClient.setQueryData<FollowData[]>(
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

    onSuccess: (_data, variables) => {
      if (variables.action === "accept") {
        toast.success("You accepted the follow request!");
      } else if (variables.action === "delete") {
        toast.info("Follow request deleted.");
      }
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["follow-requests"] });
    },
  });

  if (followLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader className="animate-spin text-gray-400 w-6 h-6" />
      </div>
    );
  }

  if (followError) {
    return (
      <p className="text-red-500 text-center py-4">
        Failed to fetch follow requests.
      </p>
    );
  }

  const requests = followRequests || [];

  return (
    <div className="w-full">
      <div className="flex items-start w-full py-6 px-4 font-bold text-2xl ">
        <p>Follow Requests</p>
      </div>

      <div className="w-full px-4 py-2">
        {requests.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No follow requests found.
          </p>
        ) : (
          requests.map((req) => (
            <div
              key={req._id}
              className="flex items-center justify-between border-b border-gray-800 py-3"
            >
              <div className="flex items-center space-x-3">
                <div className="rounded-full overflow-hidden bg-gray-800 shrink-0 h-12 w-12 sm:h-12 sm:w-12">
                  <img
                    src={req.follower?.profile_image || "/no-profile.jpg"}
                    alt={req.follower?.username || "user"}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex flex-col text-sm">
                  <Link href={`/profile/${req.follower?.username}`}>
                    <span className="font-semibold text-gray-200">
                      {req.follower?.username}
                    </span>
                  </Link>
                  <span className="text-gray-400">
                    requested to follow you.{" "}
                    <span className="text-gray-500">
                      {getTimeAgo(req.createdAt)}
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => mutation.mutate({ action: "accept", id: req._id })}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-1.5 rounded-md transition"
                >
                  Confirm
                </button>
                <button 
                  onClick={() => mutation.mutate({ action: "delete", id: req._id })}
                  className="bg-[#2b2b2b] hover:bg-[#3b3b3b] text-white text-sm font-medium px-3 py-1.5 rounded-md transition"
                >
                  Delete
                </button>
              </div>
            </div>
            ))
        )}
      </div>
    </div>
  );
}

export default NotificationFollowRequests;