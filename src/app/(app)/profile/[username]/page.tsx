"use client";

import { useState } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { axiosInstance } from "@/services/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, Lock } from "lucide-react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { FollowSection } from "../FollowSection";
import { ProfilePost } from "../ProfilePost";
import { FollowData } from "@/types/userFollowResponse";
import { toast } from "sonner";
import { useFollowRequests } from "@/hooks/useFollowRequests";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import FollowingModal from "../FollowingModal";
import FollowersModal from "../FollowerModal";
import { ApiResponse } from "@/lib/ApiResponse";

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [isFollowingModelOpen, setIsFollowingModelOpen] = useState(false);
  const [isFollowerModelOpen, setIsFollowerModelOpen] = useState(false);

  const { data: session, update } = useSession();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useUserProfile(username);
  const { data: followRequests = [] } = useFollowRequests();

  const mutation = useMutation({
    mutationFn: async ({ action, id }: { action: "accept" | "delete"; id: string }) => {
      if (action === "accept") {
        return axiosInstance.post(`/api/user/accept-request/${id}`);
      } else {
        return axiosInstance.delete(`/api/user/delete-request?requestId=${id}`);
      }
    },

    onMutate: async ({ id }) => {
      await queryClient.cancelQueries();

      const previousRequests = queryClient.getQueryData<FollowData[]>(["follow-requests"]);

      if (previousRequests) {
        queryClient.setQueryData<FollowData[]>(
          ["follow-requests"],
          previousRequests.filter((req) => req?._id != id)
        );
      }

      return { previousRequests };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousRequests) {
        queryClient.setQueryData(["follow-requests"], context.previousRequests);
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
      await queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500 dark:text-gray-400">
        Loading profile...
      </div>
    );
  }

  if (isError || !data || data.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500 dark:text-red-500">
        Failed to load user profile.
      </div>
    );
  }

  const user = data[0];
  const hasRequestedToMe = followRequests.some(
    (req) => req.follower?._id === user._id
  );
  const requestId = followRequests.find(
    (req) => req.follower?._id === user._id
  )?._id;

  const isOwnProfile = session?.user?.id === user._id;
  const canViewFollowingList = isOwnProfile || user.isFollowing || !user.isPrivate;
  const canViewFollowersList = isOwnProfile || user.isFollowing || !user.isPrivate;

  const handleUploadPhoto = () => {
    setIsOptionsOpen(false);
  };

  const handleRemovePhoto = async() => {
    try {
      const response = await axiosInstance.delete<ApiResponse>('/api/user/remove-profile')

      if(response.data.success) {
        await update();
        await queryClient.invalidateQueries({
          queryKey: ["user-profile", username],
        });
        toast.success("Profile picture removed!");
        setIsOptionsOpen(false);
      }
    } catch (error: any) {
      toast.error("Failed to remove profile picture");
      console.error(error); 
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {hasRequestedToMe && (
        <div className="flex flex-col w-full px-3">
          <div className="flex flex-wrap justify-center items-center w-full py-4 text-sm text-gray-900 dark:text-white">
            <span className="font-bold mr-2">{user.username}</span>
            <span className="text-center">has requested to follow you</span>
          </div>
          <div className="flex w-full space-x-3 px-12 sm:px-20 lg:px-28 py-1">
            <button
              onClick={() => mutation.mutate({ action: "accept", id: requestId! })}
              className="w-full py-1 sm:py-1.5 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={() => mutation.mutate({ action: "delete", id: requestId! })}
              className="w-full py-1 sm:py-1.5 text-base font-semibold border border-gray-300 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800/70 hover:border-transparent text-gray-900 dark:text-white rounded-xl transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}
      
      {/* Profile Header */}
      <div className="flex flex-row w-full gap-2 sm:gap-6 mt-4 md:mt-6">
        {/* Profile Image */}
        <div className="flex justify-center items-start sm:items-center pl-6 px-1 pt-2 sm:pl-4 sm:pt-0 sm:px-7 sm:py-10 shrink-0">
          <div
            className="flex justify-center items-center rounded-full overflow-hidden h-22 w-22 sm:h-32 sm:w-32 lg:h-40 lg:w-40 border-3 border-cyan-700 dark:border-cyan-700 cursor-pointer hover:opacity-90 transition"
            onClick={() => setIsOptionsOpen(true)}
          >
            <img
              className="w-full h-full object-cover"
              src={user.profile_image || "/no-profile.jpg"}
              alt={user.fullname || user.username}
            />
          </div>
        </div>

        {/* User Info */}
        <div className="flex flex-col justify-start items-start w-full space-y-4 sm:py-10 px-3 sm:px-0">
          <div className="flex flex-col text-left space-y-1 sm:space-y-2 cursor-default w-full">
            <h1 className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white truncate">@{user.username}</h1>
            <h3 className="text-[12px] sm:text-[13px] text-gray-500 dark:text-gray-400 truncate">{user.fullname}</h3>
          </div>

          <div className="flex space-x-6 sm:space-x-10 justify-start w-full">
            <div className="flex flex-col items-center cursor-pointer">
              <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{user.postsCount || 0}</span>
              <span className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">Posts</span>
            </div>
            <div 
              className="flex flex-col items-center cursor-pointer"
              onClick={() => {
                if (canViewFollowersList) setIsFollowerModelOpen(true)
              }}
            >
              <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{user.followersCount}</span>
              <span className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">Followers</span>
            </div>
            <div 
              className="flex flex-col items-center cursor-pointer"
              onClick={() => {
                if (canViewFollowingList) setIsFollowingModelOpen(true)
              }}
            >
              <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{user.followingCount}</span>
              <span className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">Following</span>
            </div>
          </div>

          <p className="text-xs sm:text-[13px] text-gray-600 dark:text-gray-400 cursor-default text-left w-full line-clamp-3 sm:line-clamp-none">
            {user.bio || ""}
          </p>
        </div>
      </div>

      {/* Follow Section */}
      <div className="flex space-x-4 w-full px-3 mt-4 sm:mt-6">
        <FollowSection user={user} />
      </div>

      {/* Posts */}
      <div className="mx-2 mt-5 md:mt-10">
        {user.isFollowing || !user.isPrivate || session?.user?.id === user._id ? (
          <>
            <div className="flex items-center gap-2 mb-5 px-2">
              <Camera className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Posts</h2>
            </div>
            <ProfilePost userId={user._id} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="bg-gray-200 dark:bg-zinc-900 rounded-full p-6 mb-4">
              <Lock className="w-12 h-12 text-gray-900 dark:text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">This Account is Private</h3>
            <p className="text-gray-600 dark:text-zinc-400 text-center max-w-sm text-base">
              Follow this account to see their photos and videos
            </p>
          </div>
        )}
      </div>
      

      {/* --- PROFILE OPTIONS DIALOG --- */}
      <Dialog open={isOptionsOpen} onOpenChange={setIsOptionsOpen}>
        <DialogContent
          className="w-[90vw] max-w-[400px] bg-white dark:bg-[#262626] text-gray-900 dark:text-white border-none rounded-2xl p-0 overflow-hidden"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Profile Photo Options</DialogTitle>

          <div className="flex flex-col text-center divide-y divide-gray-300 dark:divide-gray-500">
            <button
              onClick={() => setIsFullscreenOpen(true)}
              className="py-4 text-base text-blue-500 dark:text-blue-500 font-semibold hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition active:bg-gray-200 dark:active:bg-[#333333]"
            >
              View Fullscreen
            </button>
            {isOwnProfile && (
              <>
                <button
                  onClick={handleUploadPhoto}
                  className="py-4 text-base text-blue-500 dark:text-blue-500 font-semibold hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition active:bg-gray-200 dark:active:bg-[#333333]"
                >
                  Upload Photo
                </button>
                <button
                  onClick={handleRemovePhoto}
                  className="py-4 text-base text-red-500 dark:text-red-500 font-semibold hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition active:bg-gray-200 dark:active:bg-[#333333]"
                >
                  Remove Current Photo
                </button>
              </>
            )}
            <button
              onClick={() => setIsOptionsOpen(false)}
              className="py-4 text-base text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition active:bg-gray-200 dark:active:bg-[#333333]"
            >
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- FULLSCREEN IMAGE VIEW --- */}
      <Dialog open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
        <DialogContent
          className="flex justify-center items-center bg-transparent border-none p-0 backdrop-blur-sm w-full h-full max-w-none"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Fullscreen Image</DialogTitle>

          <button
            onClick={() => setIsFullscreenOpen(false)}
            className="absolute top-6 right-6 text-gray-400 hover:text-white text-2xl font-light z-10"
          >
            ✕
          </button>

          <img
            src={user.profile_image || "/no-profile.jpg"}
            alt="Profile Fullscreen"
            className="max-h-[75vh] sm:max-h-[85vh] max-w-[80vw] object-contain rounded-lg shadow-2xl"
          />
        </DialogContent>
      </Dialog>

      {isFollowingModelOpen && <FollowingModal userId={user._id} closeModel={setIsFollowingModelOpen}/>}
      {isFollowerModelOpen && <FollowersModal userId={user._id} closeModel={setIsFollowerModelOpen}/>}
    </div>
  );
}