"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { getTimeAgo } from "@/helpers/getTimeAgo";
import { Ellipsis } from "lucide-react";
import { useAddComment } from "@/hooks/useAddComment";
import { PostActions } from "../home/PostActions";
import { useComments } from "@/hooks/useComments";
import { IncomingPostData } from "@/types/postResponseType";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { axiosInstance } from "@/services/axios";
import { useQueryClient } from "@tanstack/react-query";
import { useGlobalLoader } from "@/store/useGlobalLoader";

interface PostModalLayoutProps {
  post: IncomingPostData;
  onClose: () => void;
  isEmbedded?: boolean;
}

export default function PostModalLayout({
  post,
  onClose,
  isEmbedded = false,
}: PostModalLayoutProps) {
  const {
    _id,
    username,
    profile_image,
    userId,
    imageUrl,
    caption,
    likeCount,
    location,
    createdAt,
    isLiked,
    userId: postOwnerId,
  } = post;

  const [timeAgo, setTimeAgo] = useState(getTimeAgo(createdAt));
  const [isPostOptionsOpen, setIsPostOptionsOpen] = useState(false);
  const [comment, setComment] = useState("");
  const { mutateAsync: createComment, isPending } = useAddComment();
  const { data: comments, isLoading } = useComments(_id);
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const isOwner = session?.user?._id === userId;

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
      onClose();

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["user-profile-posts", postOwnerId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["user-profile", username],
        }),
        queryClient.invalidateQueries({
          queryKey: ["feed-posts"],
        }),
      ]);

    } catch (error: any) {
      toast.error("Failed to delete post. Please try again.");
      console.error("Delete Post Error (Client):", error);
    } finally {
      loader.hide();
    }
  };

  // 🔹 DESKTOP LAYOUT (md and above)
  const desktopContent = (
    <div
      className="hidden md:flex  bg-[#212328] mx-auto rounded-xl w-[90%]  max-h-[75vh] lg:max-h-[85vh] overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-6 text-white hover:text-gray-300 text-4xl font-light z-999"
      >
        ×
      </button>
      {/* LEFT: IMAGE */}
      <div className="flex-1 bg-black flex items-center justify-center">
        <img src={imageUrl} alt={_id} className="w-full h-full object-contain xl:object-cover" />
      </div>

      {/* RIGHT: COMMENTS PANEL */}
      <div className="w-[40%] text-white flex flex-col border-l border-gray-700">
        {/* HEADER */}
        <div className="px-1 border-b border-gray-700/50">
          <section className="flex w-full h-18 items-center">
            <div className="flex justify-center items-center px-2">
              <img
                src={profile_image || "/no-profile.jpg"}
                alt={username}
                className="w-11 h-11 rounded-full object-cover bg-gray-800"
              />
            </div>

            <div className="flex grow flex-col justify-center pl-2 lg:pl-3">
              <Link href={`/profile/${username}`}>
                <p className="text-[13px] lg:text-[14px] font-semibold">{username}</p>
              </Link>
              <p className="text-[11px] lg:text-[12px] text-gray-400">
                {timeAgo} {location && `· ${location}`}
              </p>
            </div>

            <div className="ml-auto p-2 flex items-center justify-center overflow-visible"
            onClick={() => setIsPostOptionsOpen(true)}>
              <Ellipsis className="text-gray-400 hover:text-white transition" />
            </div>
          </section>
        </div>

        {/* COMMENTS LIST */}
        <div className="border-b border-gray-700/50 flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading && (
            <p className="text-gray-500 text-sm">Loading comments...</p>
          )}

          {comments?.map((c, index) => (
            <div key={index} className="flex items-start space-x-3">
              <img
                src={c.profile_image || "/no-profile.jpg"}
                className="w-8 h-8 rounded-full object-cover"
                alt={c.username}
              />

              <div className="flex flex-col">
                <p className="text-xs lg:text-sm flex items-center gap-2">
                  <Link href={`/profile/${c.username}`}>
                    <span className="font-semibold">{c.username}</span>
                  </Link>

                  {c.userId === postOwnerId && (
                    <span className="text-[10px] bg-gray-700 text-gray-200 px-1.5 py-px rounded-sm">
                      Author
                    </span>
                  )}

                  <span className="text-gray-300">{c.text}</span>
                </p>

                <p className="text-gray-500 text-[10px] lg:text-xs">
                  {getTimeAgo(String(c.createdAt))}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ACTIONS + CAPTION */}
        <section className="flex flex-col w-full px-1 py-1">
          <PostActions
            postId={_id}
            postUserId={userId}
            initialLiked={Boolean(isLiked)}
            initialLikes={likeCount}
          />

          <div className="w-full px-1.5 py-1 text-[13px] lg:text-[14px]">
            <Link href={`/profile/${username}`}>
              <span className="font-bold mr-2 ">{username}</span>
            </Link>
            <span className="text-gray-300">{caption}</span>
          </div>
        </section>

        {/* ADD COMMENT */}
        <div className="p-2 lg:p-4 border-t border-gray-700/50 ">
          <form
            onSubmit={handleSubmit}
            className="flex w-full gap-2 items-center"
          >
            <input
              className="flex-1 bg-transparent text-sm text-gray-200 outline-none"
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
        </div>
      </div>
    </div>
  );

  // 🔹 MOBILE/TABLET LAYOUT (below md)
  const mobileContent = (
    <div
      className="md:hidden bg-[#2a2d32] rounded-sm w-[85%] h-[70vh] sm:h-[90vh]
                overflow-hidden flex flex-col mx-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-6 text-white hover:text-gray-300 text-4xl font-light z-999"
      >
        ×
      </button>

      {/* HEADER */}
      <div className="px-1 border-b border-gray-700/50">
        <section className="flex w-full h-15 sm:h-16 items-center">
          <div className="flex justify-center items-center px-2 sm:px-3">
            <img
              src={profile_image || "/no-profile.jpg"}
              alt={username}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover bg-gray-800"
            />
          </div>

          <div className="flex grow flex-col justify-center pl-1.5 sm:pl">
            <Link href={`/profile/${username}`}>
              <p className="text-[13px] sm:text-[15px] font-semibold">{username}</p>
            </Link>
            <p className="text-[9px] sm:text-[11px] text-gray-400">
              {timeAgo} {location && `· ${location}`}
            </p>
          </div>

          <div
            className="ml-auto p-2 flex items-center justify-center overflow-visible"
            onClick={() => setIsPostOptionsOpen(true)}
          >
            <Ellipsis className="text-white w-5 h-5" />
          </div>
        </section>
      </div>

      {/* IMAGE */}
      <div className="flex-1 bg-black flex items-center justify-center overflow-hidden">
        <img src={imageUrl} alt={_id} className="w-full h-full object-contain" />
      </div>

      {/* ACTIONS + CAPTION */}
      <div className="bg-[#2a2d32] px-2 py-1 sm:py-3 sm:px-3 border-t border-gray-700/50">
        <PostActions
          postId={_id}
          postUserId={userId}
          initialLiked={Boolean(isLiked)}
          initialLikes={likeCount}
        />

        <p className="text-xs sm:text-sm text-white sm:mt-2">
          <span className="font-semibold mr-2">{username}</span>
          <span className="text-gray-200">{caption}</span>
        </p>
      </div>

      {/* COMMENT FORM */}
      <div className="p-2.5 sm:p-3 border-t border-gray-700/50 bg-[#2a2d32] mt-1 sm:mt-0">
        <form onSubmit={handleSubmit} className="flex w-full">
          <input
            className="flex-1 bg-transparent text-xs sm:text-sm text-gray-200 outline-none placeholder:text-gray-500"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
          />
          <button
            type="submit"
            disabled={isPending}
            className={`text-blue-400 text-xs sm:text-sm font-semibold disabled:opacity-40 ${
              !comment.trim() ? "hidden" : "block"
            }`}
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );


  // ⭐️ CUSTOM OptionsModal (Reverted to original logic with Z-index adjustment)
  const OptionsModal = () => {
    if (!isPostOptionsOpen) return null;

    return (
      <div
        // 🚨 IMPORTANT FIX: Increased z-index to ensure it sits above the main modal (z-500)
        className="fixed inset-0 z-900 bg-black/60 flex items-center justify-center"
        onClick={() => setIsPostOptionsOpen(false)}
      >
        <div
          className="bg-[#262626] w-[90%] max-w-[400px] text-[16px] rounded-xl overflow-hidden shadow-xl text-white"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Owner options */}
          {isOwner ? (
            <>
              <button
                className="w-full py-2 sm:py-4 text-blue-400 font-semibold border-b border-gray-700 hover:bg-[#333]"
                onClick={() => {
                  setIsPostOptionsOpen(false);
                }}
              >
                Edit Post
              </button>

              <button
                className="w-full py-2 sm:py-4 text-red-500 font-semibold border-b border-gray-700 hover:bg-[#333]"
                onClick={handleDeletePost}
              >
                Delete Post
              </button>
            </>
          ) : (
            <>
              <button
                className="w-full py-2 sm:py-4 text-red-400 font-semibold border-b border-gray-700 hover:bg-[#333]"
                onClick={() => {
                  toast.info("Reported");
                  setIsPostOptionsOpen(false);
                }}
              >
                Report Post
              </button>
            </>
          )}

          {/* Cancel */}
          <button
            className="w-full py-2 sm:py-4 text-gray-300 font-medium hover:bg-[#333]"
            onClick={() => setIsPostOptionsOpen(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  const content = (
    <>
      {desktopContent}
      {mobileContent}
      <OptionsModal /> 
    </>
  );

  if (isEmbedded) return content;

  return (
    <div className="fixed inset-0 bg-black/80  flex items-center justify-center z-500"
      onClick={onClose}
    >
      <div className="relative flex justify-center items-center w-full h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hidden md:block">{desktopContent}</div>
        <div className="flex md:hidden items-center justify-center w-full">
          {mobileContent}
        </div>
      </div>
      <OptionsModal />
    </div>
  );
}