"use client";

import {
  Bell,
  HomeIcon,
  Loader2,
  LogOut,
  MessageCircle,
  PlusCircle,
  Search,
  Settings,
  User,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
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
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { ApiResponse } from "@/lib/ApiResponse";
import { useQueryClient } from "@tanstack/react-query";
import { useNotificationStore } from "@/store/useNotificationStore";
import NotificationRightDrawer from "../notification/NotificationDrawer";
import { useDrawerStore } from "@/store/useDrawerStore";

function SideBar() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [open, setOpen] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const notificationCount = useNotificationStore((s) => s.notificationCount);
  const messageCount = useNotificationStore((s) => s.messageCount);

  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const { isNotificationDrawerOpen, toggle } = useDrawerStore();

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/sign-in" });
      toast.success("You have been logged out.");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setPreview(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || !caption.trim()) {
      toast.error("Please add an image and caption.");
      return;
    }
    
    setIsFormSubmitting(true)

    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("location", location);
    formData.append("image", imageFile);

    try {
      const response = await axios.post(
        "/api/posts/create-post",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setPreview(null);
        setImageFile(null);
        setCaption("");
        setLocation("");
        setOpen(false);
        setIsFormSubmitting(false)
        queryClient.invalidateQueries({queryKey: ['user-profile-posts']})
        queryClient.invalidateQueries({ queryKey: ["public-posts"] });
        queryClient.invalidateQueries({queryKey: ['user-profile']})
      }
    } catch (error: any) {
      setIsFormSubmitting(false)
      console.log(error.response.data.message);
    }
  };

  return (
    <>
      <nav
        className={`
          fixed top-0 left-0 h-screen hidden md:block 
          bg-white dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-gray-900 
          text-black dark:text-white px-3 py-2 z-50
          transition-all duration-300 ease-in-out
          ${isNotificationDrawerOpen ? "w-20" : "w-20 lg:w-60"}
        `}
      >
        <div className="flex flex-col justify-between w-full h-full">
          {/* Top Section */}
          <div className="flex flex-col">
            <div className={`flex h-25 items-center w-full ${isNotificationDrawerOpen ? "justify-center" : "justify-center lg:pl-3 lg:justify-start"}`}>
              <h2
                className={`curly-heading text-black dark:text-white text-2xl text-text font-bold ${isNotificationDrawerOpen ? "hidden" : "hidden lg:block"}`}
              >
                NextGen
              </h2>
              <Image
                src="/nextgen.png"
                alt="nextgen"
                width={40}
                height={40}
                className={isNotificationDrawerOpen ? "block" : "block lg:hidden"}
              />
            </div>

            {/* Nav Links */}
            <div className="flex flex-col justify-start space-y-2 mb-3">
              <Link
                href="/"
                className="
                  flex w-full items-center px-2 py-3 rounded-sm text-black dark:text-white 
                  hover:bg-gray-100 dark:hover:bg-[#1f1f1f]
                  transition-all duration-200"
              >
                <div className={`w-full flex items-center gap-2 ${isNotificationDrawerOpen ? "justify-center" : "justify-center lg:justify-start"}`}>
                  <HomeIcon className="w-6 h-6 block" />
                  <span className={`text-[16px] ml-3 font-bold ${isNotificationDrawerOpen ? "hidden" : "hidden lg:block"}`}>
                    Home
                  </span>
                </div>
              </Link>

              <Link
                href="/search"
                className="
                  flex w-full items-center px-2 py-3 rounded-sm text-black dark:text-white 
                  hover:bg-gray-100 dark:hover:bg-[#1f1f1f] 
                  transition-all duration-200"
              >
                <div className={`w-full flex items-center gap-2 ${isNotificationDrawerOpen ? "justify-center" : "justify-center lg:justify-start"}`}>
                  <Search className="w-6 h-6 block" />
                  <span className={`text-[16px] ml-3 font-bold ${isNotificationDrawerOpen ? "hidden" : "hidden lg:block"}`}>
                    Search
                  </span>
                </div>
              </Link>

              <Link
                href="/connect"
                className="
                  flex w-full items-center px-2 py-3 rounded-sm text-black dark:text-white 
                  hover:bg-gray-100 dark:hover:bg-[#1f1f1f] 
                  transition-all duration-200"
              >
                <div className={`w-full flex items-center gap-2 ${isNotificationDrawerOpen ? "justify-center" : "justify-center lg:justify-start"}`}>
                  <UserPlus className="w-6 h-6 block" />
                  <span className={`text-[16px] ml-3 font-bold ${isNotificationDrawerOpen ? "hidden" : "hidden lg:block"}`}>
                    Connect
                  </span>
                </div>
              </Link>

              <Link
                href="/messages"
                className="
                  flex w-full items-center px-2 py-3 rounded-sm text-black dark:text-white 
                  hover:bg-gray-100 dark:hover:bg-[#1f1f1f] 
                  transition-all duration-200"
              >
                <div className={`relative w-full flex items-center gap-2 ${isNotificationDrawerOpen ? "justify-center" : "justify-center lg:justify-start"}`}>
                  
                  <div className="relative">
                    <MessageCircle className="w-6 h-6 block" />
                    {messageCount > 0 && (
                      <span className="absolute -top-1.5 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full h-[17px] w-[17px] flex items-center justify-center">
                        {messageCount}
                      </span>
                    )}
                  </div>
                  <span className={`text-[16px] ml-3 font-bold ${isNotificationDrawerOpen ? "hidden" : "hidden lg:block"}`}>
                    Messages
                  </span>
                </div>
              </Link>

              <div 
                className="
                  flex w-full items-center px-2 py-3 rounded-sm text-black dark:text-white 
                  hover:bg-gray-100 dark:hover:bg-[#1f1f1f]
                  transition-all duration-200 cursor-pointer"
                onClick={toggle}
              >
                <div className={`relative w-full flex items-center gap-2 ${isNotificationDrawerOpen ? "justify-center" : "justify-center lg:justify-start"}`}>
                  <div className="relative">
                    <Bell className="w-6 h-6" />
                    {notificationCount > 0 && (
                      <span className="absolute -top-1.5 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full h-[17px] w-[17px] flex items-center justify-center">
                        {notificationCount}
                      </span>
                    )}
                  </div>
                  <span className={`text-[16px] ml-3 font-bold ${isNotificationDrawerOpen ? "hidden" : "hidden lg:block"}`}>Notifications</span>
                </div>
              </div>

              {/* ✅ Add Post Dialog */}
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <div className="
                    flex w-full items-center px-2 py-3 rounded-sm text-black dark:text-white 
                    hover:bg-gray-100 dark:hover:bg-[#1f1f1f] 
                    transition-all duration-200 cursor-pointer"
                  >
                    <div className={`w-full flex items-center gap-2 ${isNotificationDrawerOpen ? "justify-center" : "justify-center lg:justify-start"}`}>
                      <PlusCircle className="w-6 h-6 block" />
                      <span className={`text-[16px] ml-3 font-bold ${isNotificationDrawerOpen ? "hidden" : "hidden lg:block"}`}>
                        Add post
                      </span>
                    </div>
                  </div>
                </DialogTrigger>

                <DialogContent 
                onOpenAutoFocus={(e) => e.preventDefault()}
                className="sm:max-w-[600px] bg-white dark:bg-neutral-900 text-black dark:text-white rounded-xl border border-gray-200 dark:border-neutral-700 shadow-lg">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-center">
                      Create a New Post
                    </DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Image Upload */}
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                      {preview ? (
                        <>
                          <img
                            src={preview}
                            alt="Preview"
                            className="w-full max-h-[250px] object-cover rounded-md"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="mt-3"
                            onClick={() => {
                              setPreview(null);
                              setImageFile(null);
                            }}
                          >
                            Remove
                          </Button>
                        </>
                      ) : (
                        <>
                          <input
                            type="file"
                            id="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                          <label
                            htmlFor="file"
                            className="cursor-pointer text-center flex flex-col items-center text-sm text-gray-500 dark:text-gray-400"
                          >
                            <PlusCircle className="w-10 h-10 mb-2 text-gray-400 dark:text-gray-500" />
                            <span>Click to upload image</span>
                          </label>
                        </>
                      )}
                    </div>

                    {/* Caption */}
                    <div>
                      <label
                        htmlFor="caption"
                        className="block text-sm font-medium mb-1"
                      >
                        Caption
                      </label>
                      <textarea
                        id="caption"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-[#97bfb4]"
                        placeholder="Write a caption..."
                        rows={3}
                      />
                    </div>

                    {/* Location */}
                    <div>
                      <label
                        htmlFor="location"
                        className="block text-sm font-medium mb-1"
                      >
                        Location
                      </label>
                      <input
                        id="location"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-[#97bfb4]"
                        placeholder="e.g. Bangalore"
                      />
                    </div>

                    {/* Footer Buttons */}
                    <DialogFooter className="mt-3 flex items-center space-x-2 w-full">
                      <DialogClose asChild>
                        <Button variant="outline" className="py-4 px-9">Cancel</Button>
                      </DialogClose>
                      <Button
                        type="submit"
                        className="py-5 w-20 bg-[#97bfb4] hover:bg-[#86aea3] text-white dark:text-black flex justify-center items-center"
                        disabled={isFormSubmitting}
                      >
                        {isFormSubmitting ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          "Post"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <Link
                href={`/profile/${session?.user?.username}`}
                className="
                  flex w-full items-center px-2 py-3 rounded-sm text-black dark:text-white 
                  hover:bg-gray-100 dark:hover:bg-[#1f1f1f] 
                  transition-all duration-200"
              >
                <div className={`w-full flex items-center gap-2 ${isNotificationDrawerOpen ? "justify-center" : "justify-center lg:justify-start"}`}>
                  <img
                    src={session?.user?.image || "/no-profile.jpg"}
                    alt="profile"
                    width={32}
                    height={32}
                    className="rounded-full border border-gray-300 dark:border-gray-700 object-cover w-8 h-8"
                  />
                  <span className={`text-[16px] ml-3 font-bold ${isNotificationDrawerOpen ? "hidden" : "hidden lg:block"}`}>
                    Profile
                  </span>
                </div>
              </Link>
            </div>
          </div>

          <div className="flex flex-col space-y-2 mb-3">
            <Link
              href="/settings"
              className="
                flex w-full items-center px-2 py-3 rounded-sm text-black dark:text-white 
                hover:bg-gray-100 dark:hover:bg-[#1f1f1f] 
                transition-all duration-200"
            >
              <div className={`w-full flex items-center gap-2 ${isNotificationDrawerOpen ? "justify-center" : "justify-center lg:justify-start"}`}>
                <Settings className="w-6 h-6 block" />
                <span className={`text-[16px] ml-3 font-bold ${isNotificationDrawerOpen ? "hidden" : "hidden lg:block"}`}>
                  Settings
                </span>
              </div>
            </Link>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <div
                  className="
                    flex w-full items-center px-2 py-3 rounded-sm 
                    text-[#b94c4c] dark:text-[#ff7b7b]
                    hover:bg-[#fdecec] dark:hover:bg-[#2b1f1f] 
                    transition-all duration-200 cursor-pointer"
                >
                  <div className={`w-full flex items-center gap-2 ${isNotificationDrawerOpen ? "justify-center" : "justify-center lg:justify-start"}`}>
                    <LogOut className="w-6 h-6 block" />
                    <span className={`text-[16px] ml-3 font-bold ${isNotificationDrawerOpen ? "hidden" : "hidden lg:block"}`}>
                      Logout
                    </span>
                  </div>
                </div>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white dark:bg-neutral-900 text-black dark:text-white border border-gray-300 dark:border-neutral-700 rounded-lg shadow-lg">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-lg font-semibold text-red-600">
                    Confirm Logout
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-sm text-gray-600 dark:text-gray-400">
                    Are you sure you want to log out? You'll need to sign in again
                    to access your account.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleLogout}
                    className="bg-[#bf4a4a] hover:bg-[#a13c3c] text-white rounded-md px-4 py-2 font-medium"
                  >
                    Yes, Logout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </nav>
      {
        isNotificationDrawerOpen && <NotificationRightDrawer />
      }
    </>
  );
}

export default SideBar;