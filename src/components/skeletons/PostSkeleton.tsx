import React from 'react'
import { Ellipsis, Heart, MessageCircle, Send } from 'lucide-react';

function PostSkeleton() {
  const skeletons = Array.from({ length: 3 });

  return (
    <>
      {skeletons.map((_, index) => (
        <React.Fragment key={index}>
          <div className="flex flex-col w-full space-y-1 mt-2">
            {/* Top Section */}
            <section className="flex w-full h-18">
              <div className="flex justify-center items-center px-1 w-max h-full">
                <div className="rounded-full w-11 h-11 overflow-hidden bg-[#111111] skeleton-shimmer"></div>
              </div>
              <div className="flex grow flex-col justify-center text-white pl-3 space-y-2">
                <p className="text-[14px] font-semibold w-35 h-3 bg-[#111111] rounded-sm skeleton-shimmer"></p>
                <p className="text-[12px] w-20 h-2.5 bg-[#111111] rounded-sm skeleton-shimmer"></p>
              </div>
              <div className="flex justify-center items-center ml-auto h-full p-3">
                <Ellipsis className="text-[#3f3c3c]" />
              </div>
            </section>

            {/* Post Image */}
            <section
              className="w-full h-[500px] bg-[#111111] flex justify-center items-center rounded-sm overflow-hidden skeleton-shimmer"
              style={{ border: "0.1px solid #111111" }}
            ></section>

            {/* Actions + Caption */}
            <section className="flex flex-col w-full mt-1">
              <div className="flex items-center w-full space-x-5 px-1 py-1">
                <Heart className="w-7 h-7 text-[#111111]" />
                <MessageCircle className="w-7 h-7 text-[#111111]" />
                <Send className="w-7 h-7 text-[#111111]" />
              </div>
              <div className="w-full py-1 text-[14px]">
                <div className="font-semibold w-30 h-3 bg-[#111111] rounded-sm skeleton-shimmer"></div>
              </div>
              <div className="w-full flex py-2 text-[14px]">
                <div className="font-bold h-3 w-30 mr-2 bg-[#111111] rounded-sm skeleton-shimmer"></div>
                <div className="font-medium w-full bg-[#111111] rounded-sm skeleton-shimmer"></div>
              </div>
              <div className="flex w-full">
                <div className="w-full h-9 py-1 px-1 text-[14px] focus:outline-none bg-[#111111] rounded-sm skeleton-shimmer"></div>
              </div>
            </section>
          </div>
          <div className="bg-[#1a1a1a] h-[0.5px] w-full mt-2" />
        </React.Fragment>
      ))}
    </>
  );
}

export default PostSkeleton;
