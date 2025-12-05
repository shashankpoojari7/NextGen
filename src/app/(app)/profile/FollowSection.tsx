"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { UserProfile } from "@/types/userProfileResponse";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/services/axios";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Image from "next/image";
import EditProfileDialog from "./EditProfileDialogProps";
import Link from "next/link";
import { socket } from "@/lib/socketClient";
import { ApiResponse } from "@/lib/ApiResponse";

export function FollowSection({ user }: { user: UserProfile }) {
  const [profile, setProfile] = useState<UserProfile>(user);
  const { data: session } = useSession();
  const currentUserId = session?.user?._id;

  useEffect(() => {
    setProfile(user);
  }, [user]);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ action, id }: { action: "follow" | "unsend" | "unfollow"; id: string }) => {
      if (action === "follow") {
        const res = await axiosInstance.post<ApiResponse>(`/api/user/follow?followingId=${profile._id}&isPrivate=${profile.isPrivate}`);
        if(res?.data?.success) {
          socket.emit("notification", {
            type: "FOLLOW",
            from: currentUserId,
            to: profile._id,
          });
        }
        return res
      } else if (action === "unsend") {
        return axiosInstance.post(`/api/user/unsend-request?followingId=${profile._id}`);
      } else if (action === "unfollow") {
        return axiosInstance.post(`/api/user/unfollow?followingId=${profile._id}`);
      }
    },

    onMutate: async () => {
      await queryClient.cancelQueries();

      const previousProfile = profile;

      const next: UserProfile = { ...profile };

      if (!profile.isFollowing) {
        if (profile.isPrivate) {
          next.isRequested = true;
        } else {
          next.isFollowing = true;
        }
      }

      setProfile(next);

      return { previousProfile };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousProfile) {
        setProfile(context.previousProfile);
      }
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });

  if (currentUserId === profile._id) {
    return (
      <EditProfileDialog
        username={profile.username}
        fullname={profile.fullname || ""}
        bio={profile.bio || ""}
        profileImage={profile.profile_image || "/no-profile.jpg"}
      />
    );
  }

  if (profile.isRequested) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button className="w-full py-2 sm:py-2.5 text-sm sm:text-base font-semibold border border-[#25292f] bg-[#25292f] hover:border-transparent rounded-lg transition-colors active:bg-[#1a1d21]">
            Requested
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent className="w-[90vw] max-w-[425px] bg-white dark:bg-neutral-900 text-black dark:text-white border border-gray-300 dark:border-neutral-700 rounded-lg shadow-lg mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg font-semibold text-white">
              Remove Follow Request
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Once removed, your follow request will be canceled. You can always send it again later if you wish.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="w-full sm:w-auto border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800 m-0">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => mutation.mutate({ action: "unsend", id: profile._id })}
              className="w-full sm:w-auto bg-[#bf4a4a] hover:bg-[#a13c3c] text-white rounded-md px-4 py-2 font-medium"
            >
              Yes, Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (profile.isFollowingMe && !profile.isFollowing) {
    return (
      <button
        onClick={() => mutation.mutate({ action: "follow", id: profile._id })}
        className="w-full py-2 sm:py-2.5 text-sm sm:text-base font-semibold bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors active:bg-blue-800"
      >
        Follow back
      </button>
    );
  }

  if (profile.isFollowing) {
    return (
      <div className="flex w-full gap-2 sm:gap-3">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="flex-1 py-2 sm:py-2.5 text-sm sm:text-base font-semibold border border-gray-800 hover:bg-gray-800/70 hover:border-transparent rounded-xl transition-colors active:bg-gray-800">
              Following
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="w-[90vw] sm:max-w-[500px] bg-[#1c1c1c] text-white border-none rounded-2xl shadow-xl">
            <AlertDialogHeader className="flex flex-col items-center justify-center space-y-2 py-3 sm:py-4">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full overflow-hidden border-2 border-gray-700">
                <img
                  src={profile.profile_image || "/no-profile.jpg"}
                  alt={profile.username}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              </div>
              <AlertDialogTitle className="text-base sm:text-lg font-semibold text-center mt-2">
                {profile.username}
              </AlertDialogTitle>
            </AlertDialogHeader>
            <div className="flex flex-col overflow-hidden mt-2 gap-1">
              <button
                onClick={() => mutation.mutate({ action: "unfollow", id: profile._id })}
                className="w-full py-3 text-sm sm:text-base text-red-500 font-semibold text-center hover:bg-[#2a2a2a] transition-all active:bg-[#333333]"
              >
                Unfollow
              </button>
              <AlertDialogCancel className="w-full py-3 text-sm sm:text-base text-gray-300 font-medium text-center hover:bg-[#2a2a2a] active:bg-[#333333] border-none transition-all m-0 rounded-none">
                Cancel
              </AlertDialogCancel>
            </div>
          </AlertDialogContent>
        </AlertDialog>
        <Link href={`/messages/${user._id}`} className="flex-1">
          <button className="w-full py-2 sm:py-2.5 text-sm sm:text-base font-semibold border border-gray-800 hover:bg-gray-800/70 hover:border-transparent rounded-xl transition-colors active:bg-gray-800">
            Message
          </button>
        </Link>
      </div>
    );
  }

  return (
    <button
      onClick={() => mutation.mutate({ action: "follow", id: profile._id })}
      className="w-full py-2 sm:py-2.5 text-sm sm:text-base font-semibold bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors active:bg-blue-800"
    >
      Follow
    </button>
  );
}