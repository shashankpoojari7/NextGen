"use client";

import { useState, useEffect } from "react";
import { Ellipsis } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { IncomingPostData } from "@/app/(app)/home/HomePage";
import { getTimeAgo } from "@/helpers/getTimeAgo";
import { PostActions } from "./PostActions";
import Link from "next/link";

interface PostProps {
  post: IncomingPostData;
}

export default function Post({ post }: PostProps) {
  const {
    _id,
    username,
    profile_image,
    imageUrl,
    caption,
    likeCount,
    location,
    createdAt,
    isLiked,
  } = post;

  const [timeAgo, setTimeAgo] = useState(getTimeAgo(createdAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeAgo(getTimeAgo(createdAt));
    }, 30 * 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  return (
    <>
      <div className="flex flex-col w-full space-y-1 mt-2">
        {/* 🧑‍💻 Top Section (User Info) */}
        <section className="flex w-full h-18 items-center">
          {/* Profile Picture */}
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

          {/* Username & Time */}
          <div className="flex grow flex-col justify-center text-white pl-3">
            <Link href={`/profile/${username}`}>
              <p className="text-[14px] font-semibold">{username}</p>
            </Link>
            <p className="text-[12px] text-gray-400">
              {timeAgo} {location && `· ${location}`}
            </p>
          </div>

          {/* Menu (ellipsis) */}
          <div className="flex justify-center items-center ml-auto h-full p-3 text-gray-400 hover:text-gray-100 transition">
            <Ellipsis />
          </div>
        </section>

        {/* 🖼️ Post Image */}
        <section
          className="w-full bg-black flex justify-center items-center rounded-sm overflow-hidden"
          style={{ border: "0.1px solid #2a2a2a" }}
        >
          <img
            src={imageUrl}
            alt="post"
            className="w-full h-auto max-h-[500px] object-contain"
          />
        </section>

        {/* ❤️ Actions + Caption */}
        <section className="flex flex-col w-full mt-1">
          {/* Actions (Like, Comment, Share) */}
          <PostActions
            postId={_id}
            initialLiked={Boolean(isLiked)}
            initialLikes={likeCount}
          />

          {/* Caption */}
          <div className="w-full px-1 py-1 text-[14px]">
            <span className="font-bold mr-2">{username}</span>
            <span className="font-medium text-gray-300">{caption}</span>
          </div>

          {/* Comment Input */}
          <div className="flex w-full">
            <input
              className="w-full py-1 px-1 text-[14px] bg-transparent text-gray-300 focus:outline-none placeholder-gray-500"
              type="text"
              placeholder="Add a comment..."
            />
          </div>
        </section>
      </div>

      {/* Divider */}
      <Separator className="bg-gray-700 h-[0.5px] w-full mt-2" />
    </>
  );
}
