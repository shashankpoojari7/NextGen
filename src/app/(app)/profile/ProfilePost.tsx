"use client"

import { Heart, MessageCircle, Camera } from "lucide-react";
import { useUserProfilePosts } from "@/hooks/useUserProfilePosts";


export function ProfilePost({ userId }: { userId: string; }) {
  const { data: posts, isLoading, isError, error } = useUserProfilePosts(userId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10 text-gray-400">
        <p>Loading posts...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center py-10 text-red-400">
        <p>{error instanceof Error ? error.message : "Failed to load posts."}</p>
      </div>
    );
  }

  return (
    <div>
      {posts && posts.length > 0 ? (
        <div className="grid grid-cols-3 gap-0.5 bg-black rounded-sm overflow-hidden">
          {posts.map((p) => (
            <div
              key={p._id}
              className="relative overflow-hidden bg-black"
              style={{ aspectRatio: "3 / 4" }}
            >
              <img
                src={p.imageUrl}
                alt={p._id || ""}
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 hidden md:flex items-center justify-center bg-black/0 hover:bg-black/40 opacity-0 hover:opacity-100 transition">
                <div className="flex justify-around w-full text-white text-sm font-semibold absolute bottom-3">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" /> {p.likeCount}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" /> {p.commentCount}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center py-20 text-gray-400">
          <Camera className="w-10 h-10 mb-3 text-gray-600" />
          <p>No posts yet</p>
        </div>
      )}
    </div>
  );
}
