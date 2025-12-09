"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PostModalLayout from "@/components/post-preview/PostModal";
import { IncomingPostData } from "@/types/postResponseType";

interface ProfilePostModalProps {
  posts: IncomingPostData[];
  initialIndex: number;
  onClose: () => void;
}

export default function ProfilePostModal({posts, initialIndex, onClose }: ProfilePostModalProps) 
{
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const currentPost = posts[currentIndex];

  const canPrev = currentIndex > 0;
  const canNext = currentIndex < posts.length - 1;

  const goPrev = () => {
    if (canPrev) setCurrentIndex((i) => i - 1);
  };

  const goNext = () => {
    if (canNext) setCurrentIndex((i) => i + 1);
  };

  return (
    <div className="fixed inset-0 bg-black/80 dark:bg-black/80 bg-white/95 backdrop-blur-sm flex items-center justify-center z-500"
      onClick={onClose}
    >
      <div className="relative flex justify-center items-center w-full h-full"
        onClick={(e) => e.stopPropagation()}
      >

        {canPrev && (
          <button
            onClick={goPrev}
            className="
              absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 
              z-600 bg-white dark:bg-white text-black shadow-xl
              w-6 h-6 sm:w-10 sm:h-10 rounded-full flex items-center justify-center
              hover:scale-110 transition
            "
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}

        {canNext && (
          <button
            onClick={goNext}
            className="
              absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 
              z-600 bg-white dark:bg-white text-black shadow-xl
              w-6 h-6 sm:w-10 sm:h-10 rounded-full flex items-center justify-center
              hover:scale-110 transition
            "
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}

        
          <PostModalLayout post={currentPost} onClose={onClose} isEmbedded />
      </div>
    </div>
  );
}