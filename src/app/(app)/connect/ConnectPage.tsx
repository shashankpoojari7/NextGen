"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/services/axios";
import Link from "next/link";
import ConnectSkeleton from "@/components/skeletons/ConnectSkeleton";
import Image from "next/image";

export interface ConnectType  {
  _id: string,
  username :string,
  profile_image: string,
  fullname: string,
}


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
        <div className="flex items-center py-4 px-4 md:px-6 sticky top-0 bg-white/80 dark:bg-black/60 backdrop-blur-md z-10 border-b border-gray-300 dark:border-gray-800">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="mr-3 md:hidden p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            <ChevronLeft size={24} className="text-gray-900 dark:text-white" />
          </button>
          <h1 className="font-bold text-2xl text-gray-900 dark:text-white">
            Discover Users
          </h1>
        </div>

        {isLoading && (
          <div className="grid grid-cols-2 gap-3 md:gap-5 px-4 md:px-6 mt-6">
            <ConnectSkeleton count={6}/>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 md:gap-5 px-4 md:px-6 mt-6">
          {data?.map((user: ConnectType) => (
            <Link
              key={user._id}
              href={`/profile/${user.username}`}
              className="group rounded-2xl p-4 md:p-6bg-[#ededed] dark:bg-[#111111] border border-gray-300 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-700 transition-all duration-300 flex flex-col items-center text-center shadow-sm">
              <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden mb-4">
                <Image
                  fill
                  src={user.profile_image || "/no-profile.jpg"}
                  alt={`${user.username}'s profile`}
                  className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <h3 className="font-semibold text-gray-900 dark:text-white text-base md:text-lg truncate w-full px-2 mb-1">
                {user.username}
              </h3>

              <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm truncate w-full px-2">
                {user.fullname}
              </p>
            </Link>
          ))}
        </div>

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
