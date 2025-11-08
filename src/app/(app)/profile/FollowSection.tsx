"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { UserProfile } from "@/types/userProfileResponse";
import { cn } from "@/lib/utils";

export function FollowSection({ user }: { user: UserProfile }) {
  const { data: session } = useSession();
  const currentUserId = session?.user?._id;

  // ✅ Viewing own profile
  if (currentUserId === user._id) {
    return (
      <button className="w-full py-2 text-[16px] font-semibold border border-gray-800 bg-gray-800/70 hover:bg-gray-700 rounded-xl">
        Edit Profile
      </button>
    );
  }

  // ✅ If someone has requested to follow you
  if (user.hasRequestedToMe && !user.isRequested) {
    return (
      <button className="w-full py-2 text-[16px] font-semibold bg-cyan-500 hover:bg-cyan-400 rounded-xl">
        Follow
      </button>
    );
  }

  if (user.isFollowingMe && !user.isFollowing) {
    return (
      <button className="w-full py-2 text-[16px] font-semibold bg-cyan-500 hover:bg-cyan-400 rounded-xl">
        Follow back
      </button>
    );
  }

  // ✅ If you’ve already sent a follow request (private user)
  if (user.isRequested) {
    return (
      <button className="w-full py-2 text-[16px] font-semibold border border-[#25292f] bg-[#25292f] hover:border-transparent rounded-lg">
        Requested
      </button>
    );
  }

  // ✅ If you already follow the user
  if (user.isFollowing) {
    return (
      <button className="w-full py-2 text-[16px] font-semibold border border-gray-800 hover:bg-gray-800/70 hover:border-transparent rounded-xl">
        Following
      </button>
    );
  }

  // ✅ If they follow you, but you don’t follow back
  if (user.isFollowingMe) {
    return (
      <button className="w-full py-2 text-[16px] font-semibold bg-cyan-500 hover:bg-cyan-400 rounded-xl">
        Follow Back
      </button>
    );
  }

  // ✅ Default: Not following anyone
  return (
    <button className="w-full py-2 text-[16px] font-semibold bg-cyan-500 hover:bg-cyan-400 rounded-xl">
      Follow
    </button>
  );
}
