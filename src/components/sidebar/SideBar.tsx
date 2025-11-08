"use client";

import { Orbitron, Pacifico } from "next/font/google";
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

const pacifico = Pacifico({ subsets: ["latin"], weight: "400" });
const orbitron = Orbitron({ subsets: ["latin"], weight: ["400", "500", "700"] });

function SideBar() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [open, setOpen] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const { data: session } = useSession()

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
      const response = await axios.post<ApiResponse>(
        "/api/posts/create-post",
        formData,
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setPreview(null);
        setImageFile(null);
        setCaption("");
        setLocation("");
        setOpen(false);
        setIsFormSubmitting(false)
      }
    } catch (error: any) {
      setIsFormSubmitting(false)
      console.log(error.response.data.message);
    }
  };

  return (
    <nav 
      className="fixed z-50 left-0 top-0 h-screen w-20 lg:w-60 px-3 py-2 bg-[#151515] border-r text-black dark:text-white hidden sm:block"
      style={{ borderRight: "1px solid rgba(255, 255, 255, 0.3)"}}
    >
      <div className="flex flex-col justify-between w-full h-full">
        {/* Top Section */}
        <div className="flex flex-col">
          <div className="flex h-25 lg:pl-3 items-center justify-center lg:justify-start w-full">
            <h2
              className={`curly-heading text-text text-2xl text-text font-bold lg:block xl:block hidden`}
            >
              NextGen
            </h2>
            <Image
              src="/nextgen.png"
              alt="nextgen"
              width={40}
              height={40}
              className="block md:block lg:hidden xl:hidden"
            />
          </div>

          {/* Nav Links */}
          <div className="flex flex-col justify-start space-y-2 mb-3">
            <Link
              href="/"
              className="flex w-full items-center px-2 py-3 dark:hover:text-black rounded-sm hover:bg-[#97bfb4]"
            >
              <div className="w-full flex items-center gap-2 lg:justify-start justify-center">
                <HomeIcon className="w-6 h-6 block" />
                <span className="text-[16px] ml-3 lg:block hidden font-bold">
                  Home
                </span>
              </div>
            </Link>

            <Link
              href="/search"
              className="flex w-full items-center px-2 py-3 dark:hover:text-black rounded-sm hover:bg-[#97bfb4]"
            >
              <div className="w-full flex items-center gap-2 lg:justify-start justify-center">
                <Search className="w-6 h-6 block" />
                <span className="text-[16px] ml-3 lg:block hidden font-bold">
                  Search
                </span>
              </div>
            </Link>

            <Link
              href="/messages"
              className="flex w-full items-center px-2 py-3 dark:hover:text-black rounded-sm hover:bg-[#97bfb4]"
            >
              <div className="w-full flex items-center gap-2 lg:justify-start justify-center">
                <MessageCircle className="w-6 h-6 block" />
                <span className="text-[16px] ml-3 lg:block hidden font-bold">
                  Messages
                </span>
              </div>
            </Link>

            <Link
              href="/notification"
              className="flex w-full items-center px-2 py-3 dark:hover:text-black rounded-sm hover:bg-[#97bfb4]"
            >
              <div className="w-full flex items-center gap-2 lg:justify-start justify-center">
                <Bell className="w-6 h-6 block" />
                <span className="text-[16px] ml-3 lg:block hidden font-bold">
                  Notifications
                </span>
              </div>
            </Link>

            {/* ✅ Add Post Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <div className="flex w-full items-center px-2 py-3 dark:hover:text-black rounded-sm hover:bg-[#97bfb4] cursor-pointer">
                  <div className="w-full flex items-center gap-2 lg:justify-start justify-center">
                    <PlusCircle className="w-6 h-6 block" />
                    <span className="text-[16px] ml-3 lg:block hidden font-bold">
                      Add post
                    </span>
                  </div>
                </div>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[600px] bg-white dark:bg-neutral-900 text-black dark:text-white rounded-xl border border-gray-200 dark:border-neutral-700 shadow-lg">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold text-center">
                    Create a New Post
                  </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Image Upload */}
                  <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4">
                    {preview ? ( // ✅ use preview instead of imageFile
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
                          className="cursor-pointer text-center flex flex-col items-center text-sm text-gray-500"
                        >
                          <PlusCircle className="w-10 h-10 mb-2 text-gray-400" />
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
                      className="w-full p-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-[#97bfb4]"
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
                      className="w-full p-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-[#97bfb4]"
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
                      className="py-5 w-20 text-black flex justify-center items-center"
                      disabled={isFormSubmitting}
                    >
                      {isFormSubmitting ? (
                        <Loader2 className="w-6 h-6 text-black animate-spin" />
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
              className="flex w-full items-center px-2 py-3 dark:hover:text-black rounded-sm hover:bg-[#97bfb4]"
            >
              <div className="w-full flex items-center gap-2 lg:justify-start justify-center">
                <User className="w-6 h-6 block" />
                <span className="text-[16px] ml-3 lg:block hidden font-bold">
                  Profile
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* Bottom Section - Logout */}
        <div className="flex flex-col space-y-2 mb-3">
          <Link
            href="#"
            className="flex w-full items-center px-2 py-3 dark:hover:text-black rounded-sm hover:bg-[#97bfb4]"
          >
            <div className="w-full flex items-center gap-2 lg:justify-start justify-center">
              <Settings className="w-6 h-6 block" />
              <span className="text-[16px] ml-3 lg:block hidden font-bold">
                Settings
              </span>
            </div>
          </Link>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <div className="flex w-full items-center px-2 py-3 dark:hover:text-black rounded-sm hover:bg-[#bf4a4a] cursor-pointer">
                <div className="w-full flex items-center gap-2 lg:justify-start justify-center">
                  <LogOut className="w-6 h-6 block" />
                  <span className="text-[16px] ml-3 lg:block hidden font-bold">
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
                  Are you sure you want to log out? You’ll need to sign in again
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
  );
}

export default SideBar;
