"use client";

import { useSession } from "next-auth/react";

export default function ProfileHeader() {
  const { data: session } = useSession();

  return (
    <div className="w-full mt-[65px] mb-3 md:mt-2 px-1">
      <div className="flex items-center justify-between p-3 md:p-4 bg-linear-to-r from-teal-400 to-emerald-400 dark:bg-linear-to-r dark:from-teal-600 dark:to-emerald-600 rounded-lg mb-1.5 sm:mb-2 shadow-md">
        <div>
          <p className="text-[16px] md:text-[18px] font-semibold text-gray-900 dark:text-white">
            Welcome back, {session?.user?.fullname} 👋
          </p>
          <p className="text-[12px] md:text-[13px] text-gray-800 dark:text-gray-200">
            Explore new posts and connect today.
          </p>
        </div>

        <img
          src={session?.user?.image || "/no-profile.jpg"}
          alt={session?.user?.username}
          className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-300 shadow-sm"
        />
      </div>

      <div className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 md:px-4 py-2 md:py-3 bg-gray-50 dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-950 transition-colors">
        <input
          type="text"
          placeholder="What's on your mind?"
          className="w-full bg-transparent text-gray-900 dark:text-gray-200 placeholder:text-gray-500 dark:placeholder:text-gray-500 text-sm focus:outline-none"
        />
      </div>

    </div>
  );
}