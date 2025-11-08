"use client";

import { useUserProfile } from "@/hooks/useUserProfile";
import { ApiResponse } from "@/lib/ApiResponse";
import { axiosInstance } from "@/services/axios";
import { UserProfile } from "@/types/userProfileResponse";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, MessageCircle, Camera } from "lucide-react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ProfilePost } from "../ProfilePost";
import { FollowSection } from "../FollowSection";

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const { data: session } = useSession()
  const { data, isLoading, isError } = useUserProfile(username);
  const queryClient = useQueryClient()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-400">
        Loading profile...
      </div>
    );
  }

  if (isError || !data || data.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Failed to load user profile.
      </div>
    );
  }

  const user = data[0];
  console.log(user);
  

  // const { following, setFollowing } =useState(user.)

  // const mutation = useMutation({
  //   mutationFn: async() => {
  //     return axiosInstance.post<ApiResponse>(`/api/users/follow?followingId=${user.username}&isPrivate=${user.isPrivate}`)
  //   }, 

  //   onMutate: async () => {
  //     await queryClient.cancelQueries({ queryKey: ["user-profile"] })

  //     const previousData = queryClient.getQueryData<UserProfile>(["user-profile"])

  //     set()
  //   }
  // })

  return (
    <>
      {
        user.hasRequestedToMe &&
        <div className="flex flex-col space-x-4 w-full px-3 mt-3 sm:mt-0">
          <div className="flex justify-center items-center w-full py-3 sm:py-6 text-[12px] sm:text-[16px] lg:text-[18px333]">
            <span className="font-bold mr-2">{user.username}</span> <span>has Requested to follow you</span>
          </div>
          <div className="flex w-full space-x-3 px-20 py-1">
            <button className="w-full py-1.5 text-[16px] font-semibold bg-cyan-500 hover:bg-cyan-400 rounded-xl">
              Accept
            </button>
            <button className="w-full py-1.5 text-[16px] font-semibold border border-gray-800 hover:bg-gray-800/70 hover:border-transparent rounded-xl">
              Delete
            </button>
          </div>
        </div>
      }
      {/* Profile Header */}
      <div className="sm:flex w-full">
        {/* Profile Image */}
        <div className="flex justify-center items-center px-7 sm:py-10 py-7 space-y-1">
          <div className="flex justify-center items-center rounded-full overflow-hidden h-40 w-40 border-3 border-cyan-700">
            <img
              className="w-40 h-40 object-cover"
              src={user.profile_image || "/no-profile.jpg"}
              alt={user.fullname || user.username}
            />
          </div>
        </div>

        {/* User Details */}
        <div className="flex flex-col sm:justify-start sm:items-start justify-center items-center w-full space-y-4 py-0 sm:py-10 my-auto px-3">
          <div className="flex flex-col space-y-2">
            <h1 className="text-2xl font-semibold">{user.username}</h1>
            <h3 className="text-[13px] text-center sm:text-start text-gray-400">
              {user.fullname}
            </h3>
          </div>

          {/* Stats */}
          <div className="flex space-x-10">
            <div className="flex flex-col justify-center items-center">
              <div className="text-[18px] font-semibold">{user.postsCount|| 0}</div>
              <div className="text-[12px] font-medium text-gray-400">Posts</div>
            </div>
            <div className="flex flex-col justify-center items-center">
              <div className="text-[18px] font-semibold">{user.followersCount}</div>
              <div className="text-[12px] font-medium text-gray-400">Followers</div>
            </div>
            <div className="flex flex-col justify-center items-center">
              <div className="text-[18px] font-semibold">{user.followingCount}</div>
              <div className="text-[12px] font-medium text-gray-400">Following</div>
            </div>
          </div>

          {/* Bio */}
          <div className="flex text-center sm:text-start sm:px-0 px-3">
            <p className="text-[13px] text-gray-400">
              {user.bio || ""}
            </p>
          </div>
        </div>
      </div>

      {/* Follow and Message Buttons */}
      <div className="flex space-x-4 w-full px-3 mt-3 sm:mt-0">
        <FollowSection user={user}/>
      </div>

      {/* Posts Section */}
      <div className="mx-2 sm:mx-0 mt-10">
        <div className="flex items-center gap-2 mb-5 px-2">
          <Camera className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">Posts</h2>
        </div>
        <ProfilePost userId={user._id}/>
      </div>
    </>
  );
}
