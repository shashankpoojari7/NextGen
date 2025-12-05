"use client"

import { Heart, MessageCircle, Camera } from "lucide-react";
import { useUserProfilePosts } from "@/hooks/useUserProfilePosts";
import { useState } from "react";
import ProfilePostModal from "@/components/post-preview/ProfilePostModal";
import { IncomingPostData } from "@/types/postResponseType";

export function ProfilePost({ userId }: { userId: string; }) {
  const { data: posts, isLoading, isError, error } = useUserProfilePosts(userId);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8 sm:py-10 text-gray-400">
        <p className="text-sm sm:text-base">Loading posts...</p>
      </div>
    );
  }

  if (isError || !posts) {
    return (
      <div className="flex justify-center items-center py-8 sm:py-10 text-red-400">
        <p className="text-sm sm:text-base text-center px-4">
          {error instanceof Error ? error.message : "Failed to load posts."}
        </p>
      </div>
    );
  }

  const typedPosts = posts as IncomingPostData[];
  return (
    <div>
      {typedPosts.length > 0 ? (
        <div className="grid grid-cols-3 gap-0.5 sm:gap-1 bg-black rounded-sm overflow-hidden">
          {typedPosts.map((p, index) => (
            <div
              key={p._id}
              className="relative overflow-hidden bg-black cursor-pointer group"
              style={{ aspectRatio: "3 / 4" }}
              onClick={() => setOpenIndex(index)}
            >
              <img
                src={p.imageUrl}
                alt={p._id || ""}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Hover overlay - Desktop */}
              <div className="absolute inset-0 hidden md:flex items-end justify-center bg-black/0 hover:bg-black/50 opacity-0 hover:opacity-100 transition-all duration-300">
                <div className="flex justify-center items-center gap-4 lg:gap-6 w-full text-white text-xs lg:text-sm font-semibold pb-3 lg:pb-4">
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4 lg:w-5 lg:h-5 fill-white" /> 
                    <span>{p.likeCount}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 lg:w-5 lg:h-5 fill-white" /> 
                    <span>{p.commentCount}</span>
                  </div>
                </div>
              </div>

              {/* Stats overlay - Mobile (always visible) */}
              <div className="absolute inset-0 flex md:hidden items-end justify-center bg-linear-to-t from-black/60 via-transparent to-transparent pointer-events-none">
                <div className="flex justify-center items-center gap-3 sm:gap-4 w-full text-white text-[10px] sm:text-xs font-semibold pb-2 sm:pb-3">
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> 
                    <span>{p.likeCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> 
                    <span>{p.commentCount}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center py-16 sm:py-20 text-gray-400">
          <Camera className="w-8 h-8 sm:w-10 sm:h-10 mb-2 sm:mb-3 text-gray-600" />
          <p className="text-sm sm:text-base">No posts yet</p>
        </div>
      )}

      {openIndex !== null && (
        <ProfilePostModal
          posts={typedPosts}
          initialIndex={openIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </div>
  );
}
