"use client";

import { toast } from "sonner";
import ProfileHeader from "./ProfileHeader";
import Post from "./Post";
import PostSkeleton from "@/components/skeletons/PostSkeleton";
import { usePublicPosts } from "@/hooks/usePublicPosts";

function HomePage() {
  const { data: posts, isLoading, isError, error } = usePublicPosts();

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
