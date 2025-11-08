"use client";

import { useState } from "react";
import { Heart, MessageCircle, Send } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/services/axios";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PostActionsProps {
  postId: string;
  initialLiked: boolean;
  initialLikes: number;
}

export function PostActions({ postId, initialLiked, initialLikes }: PostActionsProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(initialLikes);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      return axiosInstance.post(`/api/posts/like/${postId}`);
    },

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const previousPosts = queryClient.getQueryData<any[]>(["posts"]);

      setLiked((prev) => !prev);
      setLikes((prev) => (liked ? prev - 1 : prev + 1));

      queryClient.setQueryData<any[]>(["posts"], (old) =>
        old?.map((post) =>
          post._id === postId
            ? {
                ...post,
                likeCount: liked ? post.likeCount - 1 : post.likeCount + 1,
                isLiked: !liked,
              }
            : post
        )
      );
      return { previousPosts };
    },

    onError: (_error, _postId, context) => {
      toast.error("Something went wrong while liking the post!");
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success(liked ? "Post liked" : "Post disliked");
    },
  });

  return (
    <div className="flex flex-col w-full">
      {/* Action Buttons */}
      <div className="flex items-center w-full space-x-5 px-2 py-1">
        {/* Like */}
        <button
          onClick={() => mutation.mutate()}
          className="transition active:scale-90"
        >
          <Heart
            className={cn(
              "w-7 h-7 transition",
              liked
                ? "fill-red-500 text-red-500 scale-110"
                : "text-gray-300 hover:scale-105"
            )}
          />
        </button>

        {/* Comment */}
        <button>
          <MessageCircle className="w-7 h-7 text-gray-300 hover:text-white transition" />
        </button>

        {/* Share */}
        <button>
          <Send className="w-7 h-7 text-gray-300 hover:text-white transition" />
        </button>
      </div>

      {/* Likes Count */}
      <div className="w-full px-2 py-1 text-[14px]">
        <p className="font-semibold">
          {likes} {likes <= 1 ? "like" : "likes"}
        </p>
      </div>
    </div>
  );
}
