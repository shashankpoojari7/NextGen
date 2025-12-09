"use client";

import { useState } from "react";
import { Heart, MessageCircle, Send } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/services/axios";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { socket } from "@/lib/socketClient";
import { useSession } from "next-auth/react";

interface PostActionsProps {
  postId: string;
  postUserId: string; 
  initialLiked: boolean;
  initialLikes: number;
  onOpenComments?: () => void;
}

export function PostActions({ postId, postUserId, initialLiked, initialLikes, onOpenComments }: PostActionsProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(initialLikes);
  const { data: session } = useSession();
  const actorId = session?.user?.id;
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => {
      return axiosInstance.post(`/api/posts/like/${postId}`);
    },

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["public-posts"] });

      const previousPosts = queryClient.getQueryData<any[]>(["public-posts"]);

      setLiked((prev) => !prev);
      setLikes((prev) => (liked ? prev - 1 : prev + 1));

      queryClient.setQueryData<any[]>(["public-posts"], (old) =>
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
        queryClient.setQueryData(["public-posts"], context.previousPosts);
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["public-posts"] });
      if (liked && actorId !== postUserId) {
        socket.emit("notification", {
          to: postUserId,
          from: actorId,
          entityId: postId,
          type: "LIKE",
        });
      }
      toast.success(liked ? "Post liked" : "Post disliked");
    },
  });

  return (
    <div className="flex flex-col w-full">
      {/* Action Buttons */}
      <div className="flex items-center w-full space-x-4 lg:space-x-5 px-1 sm:py-1 py-0.5">
        {/* Like */}
        <button
          onClick={() => mutation.mutate()}
          className="transition active:scale-90"
        >
          <Heart
            className={cn(
              "w-6 h-6 lg:w-7 lg:h-7 transition",
              liked
                ? "fill-red-500 text-red-500 scale-110"
                : "text-gray-900 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white hover:scale-105"
            )}
          />
        </button>

        {/* Comment */}
        <button onClick={onOpenComments}>
          <MessageCircle className="w-6 h-6 lg:w-7 lg:h-7 text-gray-900 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white transition" />
        </button>

        {/* Share */}
        <button>
          <Send className="w-6 h-6 lg:w-7 lg:h-7 text-gray-900 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white transition" />
        </button>
      </div>

      {/* Likes Count */}
      <div className="w-full px-1 py-1 text-gray-900 dark:text-white text-xs lg:text-[14px]">
        <p className="font-semibold">
          {likes} {likes <= 1 ? "like" : "likes"}
        </p>
      </div>
    </div>
  );
}