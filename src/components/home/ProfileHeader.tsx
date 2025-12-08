"use client";

import { useSession } from "next-auth/react";

export default function ProfileHeader() {
  const { data: session } = useSession();

  return (
    <div className="w-full mt-[60px] mb-3  md:mt-2 px-1">
      <div className="flex items-center justify-between p-3 md:p-4 bg-primary dark:bg-neutral-900 rounded-lg mb-1.5 sm:mb-2 border dark:border-gray-800">
        <div>
          <p className="text-[16px] md:text-[18px] font-semibold text-black dark:text-white">
            Welcome back, {session?.user?.fullname} 👋
          </p>
          <p className="text-[12px] md:text-[13px] text-neutral-800 dark:text-gray-400">
            Explore new posts and connect today.
          </p>
        </div>

        <img
          src={session?.user?.image || "/no-profile.jpg"}
          alt={session?.user?.username}
          className="w-12 h-12 rounded-full border dark:border-gray-700"
        />
      </div>

      <div className="border dark:border-gray-700 rounded-lg px-3 md:px-4 py-2 md:py-3 bg-primary dark:bg-black">
        <input
          type="text"
          placeholder="What's on your mind?"
          className="w-full bg-transparent text-black dark:text-gray-200 text-sm focus:outline-none"
        />
      </div>

    </div>
  );
}
