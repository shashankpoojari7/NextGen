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
  const [comment, setComment] = useState<string>("");
  const { data: session } = useSession();
  const [localComments, setLocalComments] = useState<{ username: string; text: string }[]>([]);

  const { mutateAsync: createComment, isPending } = useAddComment();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeAgo(getTimeAgo(createdAt));
    }, 30000);

    return () => clearInterval(interval);
  }, [createdAt]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    await createComment({ postId: _id, comment });

    setLocalComments((prev) => [
      { username: session?.user?.username as string, text: comment },
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

  return (
    <>
      <div className="flex flex-col w-full space-y-1 px-1 sm:px-0">
        {/* Top Section */}
        <section className="flex w-full h-18 items-center">
          <div className="flex justify-center items-center px-2">
            <div className="rounded-full w-11 h-11 overflow-hidden bg-gray-800">
              <img
                src={profile_image || "/no-profile.jpg"}
                alt={username}
                width={44}
                height={44}
                className="object-cover"
              />
            </div>
          </div>

          <div className="flex grow flex-col justify-center text-black dark:text-white pl-3">
            <Link href={`/profile/${username}`}>
              <p className="text-[14px] font-semibold">{username}</p>
            </Link>
            <p className="text-[12px] text-gray-600 dark:text-gray-400">
              {timeAgo} {location && `· ${location}`}
            </p>
          </div>

          <div className="flex justify-center items-center ml-auto h-full p-3 text-gray-900 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-100 transition">
            <Ellipsis />
          </div>
        </section>

        {/* Post Image */}
        <section
          onClick={() => setOpenModal(true)}
          className="w-full bg-white dark:bg-black flex justify-center items-center rounded-sm overflow-hidden"
          style={{ border: "0.1px solid #2a2a2a" }}
        >
          <img
            src={imageUrl}
            alt="post"
            className="w-full h-auto max-h-[500px] object-contain"
          />
        </section>

        {/* Actions + Caption */}
        <section className="flex flex-col w-full mt-1">
          <PostActions
            postId={_id}
            postUserId = {userId}
            initialLiked={Boolean(isLiked)}
            initialLikes={likeCount}
            onOpenComments={() => setOpenModal(true)}
          />

          {/* Caption */}
          <div className="w-full px-1 py-1 text-[14px]">
            <span className="font-bold mr-2  text-black dark:text-white">{username}</span>
            <span className="font-medium text-gray-700 dark:text-gray-300">{caption}</span>
          </div>

          {/* ✓ Show Optimistic Feed Comments ABOVE the form */}
          {localComments.length > 0 && (
            <div className="px-1 space-y-1">
              {localComments.map((c, index) => (
                <div key={index} className="text-sm">
                  <span className="font-semibold mr-2  text-black dark:text-white">{c.username}</span>
                  <span className="text-gray-700 dark:text-gray-300">{c.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* Comment Input */}
          <form onSubmit={handleSubmit} className="flex w-full gap-2 items-center mt-1">
            <input
              className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-200 outline-none"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
            />
            <button
              type="submit"
              disabled={isPending}
              className={`text-blue-400 text-sm disabled:opacity-40 ${
                !comment.trim() ? "hidden" : "block"
              }`}
            >
              Post
            </button>
          </form>
        </section>
      </div>

      {/* Divider */}
      <Separator className="bg-gray-700 h-[0.5px] w-full mt-2" />

      {/* Modal */}
      {openModal && (
        <PostModalLayout
          post={post}
          onClose={() => setOpenModal(false)}
        />
      )}
    </>
  );
}
