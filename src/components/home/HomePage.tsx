"use client";

import { useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";

import ProfileHeader from "./ProfileHeader";
import Post from "./Post";

import {
  PostSkeleton,
  FeedSpinner,
} from "@/components/skeletons/PostSkeleton";

import { useFeed } from "@/hooks/useFeed";

function HomePage() {
  const {data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage} = useFeed();

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isError) {
      console.error("Feed error:", error);
      toast.error("Failed to load posts");
    }
  }, [isError, error]);

  const tryFetch = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    fetchNextPage();
  }, [
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          tryFetch();
        }
      },
      {
        root: null,
        rootMargin: "300px",
        threshold: 0,
      }
    );

    const element = loadMoreRef.current;

    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [tryFetch]);

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  if (isLoading) {
    return (
      <>
        <ProfileHeader />
        <PostSkeleton />
      </>
    );
  }

  if (posts.length === 0) {
    return (
      <>
        <ProfileHeader />

        <div className="text-center text-gray-400 mt-10">
          <p className="text-lg font-semibold">
            No new posts available
          </p>

          <p className="text-sm mt-1">
            Check back later for updates!
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <ProfileHeader />

      {posts.map((post) => (
        <Post
          key={post._id}
          post={post}
        />
      ))}

      <div
        ref={loadMoreRef}
        className="h-16"
      />

      {isFetchingNextPage && (
        <FeedSpinner />
      )}
    </>
  );
}

export default HomePage;