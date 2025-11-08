"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ProfileHeader from "./ProfileHeader";
import Post from "./Post";
import PostSkeleton from "@/components/skeletons/PostSkeleton";
import { usePublicPosts } from "@/hooks/usePublicPosts";

export interface IncomingPostData {
  _id: string;
  userId: string;
  imageUrl: string;
  caption: string;
  location?: string;
  isLiked: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  createdAt: string;
  updatedAt: string;
  username: string;
  profile_image: string;
}

function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { data: posts, isLoading, isError, error } = usePublicPosts();

  if (status === "unauthenticated") {
    toast.warning("You are not logged in, please login.");
    router.replace("/sign-in");
    return null;
  }

  if (isError) {
    console.error("Post fetch error:", error);
    toast.error("Failed to load posts");
  }

  return (
    <>
      <ProfileHeader />
      {isLoading ? (
        <PostSkeleton />
      ) : (
        posts?.map((p) => <Post key={p._id} post={p} />)
      )}
    </>
  );
}

export default HomePage;
