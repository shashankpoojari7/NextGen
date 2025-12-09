"use client";

import { Search, Bell } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNotificationStore } from "@/store/useNotificationStore";

export default function MobileHomeTopBar() {
  const pathname = usePathname();
  const notificationCount = useNotificationStore((s) => s.notificationCount);

  if (pathname !== "/") return null;

  return (
    <div className="md:hidden w-full bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 px-4 py-3 fixed top-0 z-50 flex items-center justify-between shadow-sm dark:shadow-none">
      <h2 className="curly-heading-mobile text-gray-900 dark:text-white text-xl font-semibold whitespace-nowrap">
        NextGen
      </h2>

      <div className="flex items-center gap-5 sm:gap-4 shrink">

        {/* Search Input (hidden on mobile) */}
        <Link href="/search" className="sm:flex items-center bg-gray-100 dark:bg-[#3A3A3A] px-4 py-2 rounded-sm text-gray-700 dark:text-gray-300 sm:w-[300px] hidden">
          <Search size={18} className="text-gray-500 dark:text-gray-400 mr-2" />
          <span className="text-sm">Search</span>
        </Link>

        {/* Search Icon (mobile) */}
        <Link href="/search">
          <Search size={22} className="text-gray-900 dark:text-white mr-2 block sm:hidden" />
        </Link>

        {/* 🔔 Notification Icon with Badge */}
        <Link href="/notification" className="relative">
          <Bell size={22} className="text-gray-900 dark:text-white" />

          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </Link>

      </div>
    </div>
  );
}