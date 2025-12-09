"use client";

import { useFollowRequests } from "@/hooks/useFollowRequests";
import { FollowData } from "@/types/userFollowResponse";
import { Loader } from "lucide-react";
import Link from "next/link";
import { getTimeAgo } from "@/helpers/getTimeAgo";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/services/axios";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

function NotificationFollowRequests() {
  const { data: followRequests, isLoading, error } = useFollowRequests();
  const queryClient = useQueryClient();
  const router = useRouter();

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

      const previousData = queryClient.getQueryData<FollowData[]>(["follow-requests"]);
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

    onSuccess: (_data, variables) => {
      if (variables.action === "accept") {
        toast.success("You accepted the follow request!");
      } else {
        toast.info("Follow request deleted.");
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-requests"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader className="animate-spin text-gray-400 w-6 h-6" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-red-500 text-center py-4">
        Failed to fetch follow requests.
      </p>
    );
  }

  const requests = followRequests || [];

  return (
    <div className="w-full">
      <div className="flex items-center w-full py-3 md:py-6 px-4 text-black dark:text-white">
        <button
          onClick={() => router.back()}
          className="mr-3 lg:hidden p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition"
        >
          <ChevronLeft size={26} />
        </button>

        <p className="font-bold text-2xl">Follow Requests</p>
      </div>

      <div className="w-full px-4 py-2">
        {requests.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-4">
            No follow requests found.
          </p>
        ) : (
          requests.map((req) => (
            <div
              key={req._id}
              className="
                flex items-center justify-between 
                border-b border-gray-300 dark:border-gray-800 
                py-3
              "
            >
              <div className="flex items-center space-x-3">
                <div className="
                  rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 
                  shrink-0 h-12 w-12
                ">
                  <img
                    src={req.follower?.profile_image || "/no-profile.jpg"}
                    alt={req.follower?.username || "user"}
                    className="object-cover w-full h-full"
                  />
                </div>

                <div className="flex flex-col text-sm">
                  <Link href={`/profile/${req.follower?.username}`}>
                    <span className="font-semibold text-gray-900 dark:text-gray-200">
                      {req.follower?.username}
                    </span>
                  </Link>
                  <span className="text-gray-600 dark:text-gray-400">
                    requested to follow you{" "}
                    <span className="text-gray-500">{getTimeAgo(req.createdAt)}</span>
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                {/* Confirm Button */}
                <button
                  onClick={() => mutation.mutate({ action: "accept", id: req._id })}
                  className="
                    bg-blue-600 hover:bg-blue-700 
                    text-white text-sm font-medium 
                    px-3 py-1.5 rounded-md transition
                  "
                >
                  Confirm
                </button>

                {/* Delete Button (light + dark mode) */}
                <button
                  onClick={() => mutation.mutate({ action: "delete", id: req._id })}
                  className="
                    bg-gray-200 text-gray-800 
                    hover:bg-gray-300 
                    dark:bg-[#2b2b2b] dark:text-white 
                    dark:hover:bg-[#3b3b3b] 
                    text-sm font-medium px-3 py-1.5 rounded-md transition
                  "
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
