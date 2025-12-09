"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/services/axios";
import Link from "next/link";

export default function PeopleList() {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["discover-users"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/user/connect");
      return res.data.data;
    },
  });

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-200">
      <div className="w-full max-w-6xl mx-auto pb-10">

        {/* HEADER */}
        <div className="flex items-center py-4 px-4 md:px-6 sticky top-0 
                        bg-white/80 dark:bg-black/60 
                        backdrop-blur-md z-10 
                        border-b border-gray-300 dark:border-gray-800">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="mr-3 md:hidden p-2 rounded-full 
                      hover:bg-gray-200 dark:hover:bg-gray-800 
                      transition-colors duration-200"
          >
            <ChevronLeft size={24} className="text-gray-900 dark:text-white" />
          </button>
          <h1 className="font-bold text-2xl text-gray-900 dark:text-white">
            Discover Users
          </h1>
        </div>

        {/* LOADING */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-8 w-8 border-3 
                            border-gray-400 dark:border-gray-700 
                            border-t-blue-500 dark:border-t-blue-400 
                            rounded-full" />
          </div>
        )}

        {/* USER LIST GRID */}
        <div className="grid grid-cols-2 gap-3 md:gap-5 px-4 md:px-6 mt-6">
          {data?.map((user: any) => (
            <Link
              key={user._id}
              href={`/profile/${user.username}`}
              className="group rounded-2xl p-4 md:p-6 
                        bg-[#ededed] dark:bg-[#111111] 
                        border border-gray-300 dark:border-gray-800 
                        hover:border-gray-400 dark:hover:border-gray-700 
                        transition-all duration-300 flex flex-col items-center text-center shadow-sm"
            >
              {/* Profile Image */}
              <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden mb-4">
                <img
                  src={user.profile_image || "/no-profile.jpg"}
                  alt={`${user.username}'s profile`}
                  className="object-cover h-full w-full 
                             group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Username */}
              <h3 className="font-semibold text-gray-900 dark:text-white 
                             text-base md:text-lg truncate w-full px-2 mb-1">
                {user.username}
              </h3>

              {/* Full name */}
              <p className="text-gray-600 dark:text-gray-400 
                            text-xs md:text-sm truncate w-full px-2">
                {user.fullname || "New to NextGen!"}
              </p>
            </Link>
          ))}
        </div>

        {/* EMPTY STATE */}
        {!isLoading && (!data || data.length === 0) && (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-1">
              No users found
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Check back later for new users to connect with
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
