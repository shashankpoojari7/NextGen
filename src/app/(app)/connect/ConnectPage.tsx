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
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-200">
      <div className="w-full max-w-6xl mx-auto pb-10">
        {/* Header */}
        <div className="flex items-center py-4 px-4 md:px-6 text-gray-900 dark:text-white sticky top-0 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md z-10 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => router.back()}
            className="mr-3 lg:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            aria-label="Go back"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="font-bold text-2xl">Discover Users</h1>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-8 w-8 border-3 border-gray-300 dark:border-gray-600 border-t-blue-500 dark:border-t-blue-400 rounded-full" />
          </div>
        )}

        {/* Users Grid - 2 columns on all screen sizes */}
        <div className="grid grid-cols-2 gap-3 md:gap-5 px-4 md:px-6 mt-6">
          {data?.map((user: any) => (
            <Link
              key={user._id}
              href={`/profile/${user.username}`}
              className="group bg-[#1a1a1a] dark:bg-[#1a1a1a] rounded-2xl p-4 md:p-6 border border-gray-700 dark:border-gray-800 hover:border-gray-600 dark:hover:border-gray-600 transition-all duration-300 flex flex-col items-center text-center"
            >
              {/* Profile Image */}
              <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden mb-4 flex-shrink-0">
                <img
                  src={user.profile_image || "/no-profile.jpg"}
                  alt={`${user.username}'s profile`}
                  className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Username */}
              <h3 className="font-semibold text-white text-base md:text-lg truncate w-full px-2 mb-1">
                {user.username}
              </h3>

              {/* Full Name */}
              <p className="text-gray-400 text-xs md:text-sm truncate w-full px-2">
                {user.fullname || "New to NextGen!"}
              </p>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {!isLoading && (!data || data.length === 0) && (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="text-gray-400 dark:text-gray-500 text-center">
              <p className="text-xl font-semibold mb-2">No users found</p>
              <p className="text-sm">Check back later for new users to connect with</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}