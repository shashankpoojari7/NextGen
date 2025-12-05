"use client";

import Link from "next/link";
import {
  HomeIcon,
  Search,
  MessageCircle,
  PlusCircle,
  User,
  Bell,
  Loader2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { ApiResponse } from "@/lib/ApiResponse";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useNotificationStore } from "@/store/useNotificationStore"; 

export default function BottomBar() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const messageCount = useNotificationStore((s) => s.messageCount);

  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = event => setPreview(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile || !caption.trim()) {
      toast.error("Please add an image and caption.");
      return;
    }

    setIsFormSubmitting(true);

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

        // RESET STATES
        setPreview(null);
        setImageFile(null);
        setCaption("");
        setLocation("");
        setOpen(false);

        queryClient.invalidateQueries({ queryKey: ["user-profile-posts"] });
        queryClient.invalidateQueries({ queryKey: ["public-posts"] });
        queryClient.invalidateQueries({queryKey: ['user-profile']})
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Upload failed");
    }

    setIsFormSubmitting(false);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 w-full bg-[#151515] border-t border-gray-700 
                      md:hidden flex justify-between px-5 sm:px-10 py-4 z-50">

        <Link href="/" className="flex flex-col items-center text-white">
          <HomeIcon className="h-6 w-6" />
        </Link>

        <Link href="/search" className="flex flex-col items-center text-white">
          <Search className="h-6 w-6" />
        </Link>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="flex flex-col items-center text-white">
              <PlusCircle className="h-6 w-6" />
            </button>
          </DialogTrigger>
          <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}
            className="bg-white dark:bg-neutral-900 text-black dark:text-white rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-center">
                Create a New Post
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4">
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
                      id="mobile-file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="mobile-file"
                      className="cursor-pointer flex flex-col items-center text-gray-400"
                    >
                      <PlusCircle className="w-10 h-10 mb-2" />
                      <span>Tap to upload image</span>
                    </label>
                  </>
                )}
              </div>

              {/* CAPTION */}
              <div>
                <label className="block text-sm font-medium mb-1">Caption</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={3}
                  className="w-full p-2 border rounded-md bg-transparent focus:ring-2 focus:ring-[#97bfb4]"
                  placeholder="Write a caption..."
                />
              </div>

              {/* LOCATION */}
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2 border rounded-md bg-transparent focus:ring-2 focus:ring-[#97bfb4]"
                  placeholder="e.g. Bangalore"
                />
              </div>

              {/* BUTTONS */}
              <DialogFooter className="flex justify-between">

                <DialogClose asChild>
                  <Button variant="outline" className="px-6">
                    Cancel
                  </Button>
                </DialogClose>

                <Button type="submit" disabled={isFormSubmitting}>
                  {isFormSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span className="text-black">Post</span>
                  )}
                </Button>

              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Link href="/messages" className="relative flex flex-col items-center text-white">
          <div className="relative">
            <MessageCircle className="h-6 w-6" />

            {/* 🔴 Show badge if unread messages exist */}
            {messageCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold 
                              rounded-full h-[15px] w-[15px] flex items-center justify-center">
                {messageCount}
              </span>
            )}
          </div>
        </Link>

        <Link
          href={`/profile/${session?.user?.username}`}
          className="flex flex-col items-center text-white"
        >
          <User className="h-6 w-6" />
        </Link>

      </div>
    </>
  );
}
