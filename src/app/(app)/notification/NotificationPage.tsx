"use client";

import { useFollowRequests } from "@/hooks/useFollowRequests";
import { FollowData } from "@/types/userFollowResponse";
import { Loader } from "lucide-react";
import Link from "next/link";
import { getTimeAgo } from "@/helpers/getTimeAgo";

function NotificationPage() {
  const { data, isLoading, error } = useFollowRequests();

  const followRequests: FollowData[] = data || [];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-start w-full py-4 px-4 mt-1 font-bold text-2xl border border-gray-600/70">
        <p>Follow Requests</p>
      </div>

      {/* Body */}
      <div className="w-full px-4 py-2">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader className="animate-spin text-gray-400 w-6 h-6" />
          </div>
        ) : error ? (
          <p className="text-red-500 text-center py-4">
            Failed to fetch follow requests.
          </p>
        ) : followRequests.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No follow requests found.
          </p>
        ) : (
          followRequests.map((req: FollowData) => (

            <div
              key={req._id}
              className="flex items-center justify-between border-b border-gray-800 py-3"
            >
              {/* Left: Profile and info */}
              <div className="flex items-center space-x-3">
                {/* Profile image */}
                <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-800">
                  <img
                    src={req.follower?.profile_image || "/no-profile.jpg"}
                    alt={req.follower?.username || "user"}
                    className="object-cover w-full h-full"
                  />
                </div>

                {/* Follower text */}
                <div className="flex flex-col text-sm">
                  <Link href={`/profile/${req.follower?.username}`}>
                    <span className="font-semibold text-gray-200">
                      {req.follower?.username}
                    </span>
                  </Link>
                  <span className="text-gray-400">
                    requested to follow you.{" "}
                    <span className="text-gray-500">{getTimeAgo(req.createdAt)}</span>
                  </span>
                </div>
              </div>

              {/* Right: Buttons */}
              <div className="flex space-x-2">
                <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-1.5 rounded-md transition">
                  Confirm
                </button>
                <button className="bg-[#2b2b2b] hover:bg-[#3b3b3b] text-white text-sm font-medium px-3 py-1.5 rounded-md transition">
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

export default NotificationPage;
