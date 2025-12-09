"use client";

import { useState, useEffect, FormEvent } from "react";
import { Ellipsis } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { IncomingPostData } from "@/types/postResponseType";
import { getTimeAgo } from "@/helpers/getTimeAgo";
import { PostActions } from "./PostActions";
import Link from "next/link";
import PostModalLayout from "../post-preview/PostModal";
import { useAddComment } from "@/hooks/useAddComment";
import { useSession } from "next-auth/react";
import { socket } from "@/lib/socketClient";
import { useGlobalLoader } from "@/store/useGlobalLoader";
import { axiosInstance } from "@/services/axios";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface PostProps {
  post: IncomingPostData;
}

export default function Post({ post }: PostProps) {
  const {
    _id,
    username,
    userId,
    profile_image,
    imageUrl,
    caption,
    likeCount,
    location,
    createdAt,
    isLiked,
  } = post;

  const [timeAgo, setTimeAgo] = useState(getTimeAgo(createdAt));
  const [openModal, setOpenModal] = useState(false);
  const [isPostOptionsOpen, setIsPostOptionsOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [localComments, setLocalComments] = useState<
    { username: string; text: string }[]
  >([]);

  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { mutateAsync: createComment, isPending } = useAddComment();

  const isOwner = session?.user?.id === userId;

  useEffect(() => {
    const interval = setInterval(
      () => setTimeAgo(getTimeAgo(createdAt)),
      30000
    );
    return () => clearInterval(interval);
  }, [createdAt]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    await createComment({ postId: _id, comment });

    setLocalComments((prev) => [
      { username: session?.user?.username || "You", text: comment },
      ...prev,
    ]);

    if (userId !== session?.user?.id) {
      socket.emit("notification", {
        to: userId,
        from: session?.user?.id,
        entityId: _id,
        type: "COMMENT",
        comment,
      });
    }

    setComment("");
  };

  const handleDeletePost = async () => {
    const loader = useGlobalLoader.getState();
    try {
      loader.show();
      const response = await axiosInstance.delete(
        `/api/posts/delete-post/${_id}`
      );

      if (!response.data.success) {
        toast.error(response.data.message || "Failed to delete post");
        return;
      }
      toast.success("Post deleted");
      setIsPostOptionsOpen(false);
      await queryClient.invalidateQueries({queryKey: ["public-posts"]})
    } catch (err) {
      toast.error("Failed to delete post");
    } finally {
      loader.hide();
    }
  };

  const OptionsModal = () => {
    if (!isPostOptionsOpen) return null;

    return (
      <div
        className="fixed inset-0 z-999 bg-black/70 dark:bg-black/70 flex items-center justify-center"
        onClick={() => setIsPostOptionsOpen(false)}
      >
        <div
          className="bg-white dark:bg-[#262626] w-[90%] max-w-[400px] rounded-xl overflow-hidden shadow-xl text-gray-900 dark:text-white"
          onClick={(e) => e.stopPropagation()}
        >
          {/* OWNER OPTIONS */}
          {isOwner ? (
            <>
              <button
                className="w-full py-4 text-blue-500 font-semibold border-b border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-[#333]"
                onClick={() => setIsPostOptionsOpen(false)}
              >
                Edit Post
              </button>

              <button
                className="w-full py-4 text-red-500 font-semibold border-b border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-[#333]"
                onClick={handleDeletePost}
              >
                Delete Post
              </button>
            </>
          ) : (
            <button
              className="w-full py-4 text-red-500 font-semibold border-b border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-[#333]"
              onClick={() => {
                toast.info("Reported");
                setIsPostOptionsOpen(false);
              }}
            >
              Report Post
            </button>
          )}

          {/* CANCEL */}
          <button
            className="w-full py-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#333]"
            onClick={() => setIsPostOptionsOpen(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col w-full space-y-1 px-1 sm:px-0">
        {/* HEADER */}
        <section className="flex w-full h-15 md:h-18 items-center">
          <div className="px-2">
            <div className="rounded-full w-11 h-11 overflow-hidden bg-gray-800">
              <img
                src={profile_image || "/no-profile.jpg"}
                alt={username}
                className="object-cover"
              />
            </div>
          </div>

          <div className="flex grow flex-col text-black dark:text-white pl-3">
            <Link href={`/profile/${username}`}>
              <p className="text-[14px] font-semibold">{username}</p>
            </Link>
            <p className="text-[12px] text-gray-600 dark:text-gray-400">
              {timeAgo} {location && `· ${location}`}
            </p>
          </div>

          <div className="ml-auto p-3 text-gray-900 dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-200 transition">
            <Ellipsis onClick={() => setIsPostOptionsOpen(true)} />
          </div>
        </section>

        {/* IMAGE */}
        <section
          onClick={() => setOpenModal(true)}
          className="w-full bg-white dark:bg-black rounded-sm overflow-hidden border border-[#2a2a2a]"
        >
          <img src={imageUrl} className="w-full max-h-[500px] object-contain" />
        </section>

        {/* ACTIONS + CAPTION */}
        <section className="flex flex-col w-full mt-1">
          <PostActions
            postId={_id}
            postUserId={userId}
            initialLiked={!!isLiked}
            initialLikes={likeCount}
            onOpenComments={() => setOpenModal(true)}
          />

          <div className="px-1 py-1 text-[14px]">
            <span className="font-bold mr-2 text-black dark:text-white">{username}</span>
            <span className="text-gray-700 dark:text-gray-300">{caption}</span>
          </div>

          {/* OPTIMISTIC COMMENTS */}
          {localComments.length > 0 && (
            <div className="px-1 space-y-1">
              {localComments.map((c, i) => (
                <p key={i} className="text-sm">
                  <span className="font-semibold">{c.username}</span> {c.text}
                </p>
              ))}
            </div>
          )}

          {/* COMMENT INPUT */}
          <form onSubmit={handleSubmit} className="flex w-full gap-2 mt-1">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-200 outline-none"
            />
            <button
              type="submit"
              disabled={isPending}
              className={`text-blue-400 text-sm ${
                !comment.trim() && "opacity-0"
              }`}
            >
              Post
            </button>
          </form>
        </section>
      </div>

      <Separator className="bg-gray-700 h-[0.5px] mt-2" />

      {openModal && (
        <PostModalLayout post={post} onClose={() => setOpenModal(false)} />
      )}

      <OptionsModal />
    </>
  );
}
