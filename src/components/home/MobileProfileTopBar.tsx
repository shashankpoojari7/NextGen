"use client";

import { Settings, ChevronDown, LogOut, ArrowLeft } from "lucide-react";
import { usePathname, useParams, useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function MobileProfileTopBar() {
  const pathname = usePathname();
  const params = useParams();
  const { data: session } = useSession();
  const router = useRouter();

  if (!pathname.startsWith("/profile/")) return null;
  const username = params.username as string;
  const isOwnProfile = session?.user?.username === username;

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/sign-in" });
      toast.success("You have been logged out.");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

return (
    <>
      <div className="md:hidden fixed top-0 left-0 w-full h-14 bg-white dark:bg-black px-4 z-50
                      flex items-center justify-between border-b border-gray-200 dark:border-gray-900 shadow-sm dark:shadow-none">

        {isOwnProfile ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="text-gray-900 dark:text-white p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-600/20 active:bg-red-100 dark:active:bg-red-600/30 transition">
                <LogOut size={22} strokeWidth={1.7} />
              </button>
            </AlertDialogTrigger>

            <AlertDialogContent className="bg-white dark:bg-neutral-900 text-gray-900 dark:text-white border border-gray-200 dark:border-neutral-700 rounded-xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-500">
                  Logout Confirmation
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                  Are you sure you want to log out?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-100 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 text-gray-900 dark:text-white rounded-md px-4 py-2">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-md px-4 py-2"
                >
                  Logout
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <button
            onClick={() => router.back()}
            className="text-gray-900 dark:text-white p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/20 active:bg-gray-200 dark:active:bg-gray-700/30 transition"
          >
            <ArrowLeft size={24} />
          </button>
        )}

        {/* CENTER — Username */}
        <div className="flex items-center gap-1 absolute left-1/2 transform -translate-x-1/2">
          <h2 className="text-gray-900 dark:text-white text-[17px] font-semibold truncate max-w-[130px]">
            {username}
          </h2>
          {isOwnProfile && <ChevronDown size={18} className="text-gray-900 dark:text-white" />}
        </div>

        {/* RIGHT SIDE */}
        {isOwnProfile ? (
          <Link href="/settings" className="text-gray-900 dark:text-white p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/20 active:bg-gray-200 dark:active:bg-gray-700/30 transition">
            <Settings size={22} strokeWidth={1.7} />
          </Link>
        ) : (
          /** When viewing others, leave right side empty */
          <div className="w-10" />
        )}
      </div>

      <div className="h-14 md:hidden"></div>
    </>
  );
}