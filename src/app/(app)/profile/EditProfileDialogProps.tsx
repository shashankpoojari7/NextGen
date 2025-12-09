"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useDebounceValue } from "usehooks-ts";
import { toast } from "sonner";
import { updateProfile } from "@/schemas/signUpSchemas";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { axiosInstance } from "@/services/axios";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CircleCheck, CircleX, Loader2, Camera, X } from "lucide-react";
import { ApiResponse } from "@/lib/ApiResponse";
import { useQueryClient } from "@tanstack/react-query";

interface EditProfileDialogProps {
  username: string;
  fullname: string;
  bio: string;
  profileImage: string;
}

export default function EditProfileDialog({
  username: initialUsername,
  fullname: initialFullname,
  bio: initialBio,
  profileImage,
}: EditProfileDialogProps) 
{
  const [isOpen, setIsOpen] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [userMessage, setUserMessage] = useState("");
  const [uniqueUsername, setUniqueUsername] = useState(false);
  const [usernameMsg, setUsernameMsg] = useState(false);
  const [debouncedValue, setValue] = useDebounceValue("", 500);
  const [imagePreview, setImagePreview] = useState(profileImage);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { data: session, update } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof updateProfile>>({
    resolver: zodResolver(updateProfile),
    defaultValues: {
      username: initialUsername,
      fullname: initialFullname,
      bio: initialBio,
    },
  });

  const { watch } = form;
  const watchedUsername = watch("username");
  const watchedBio = watch("bio");

  useEffect(() => {
  const subscription = form.watch((value, { name }) => {
    if (name === "username") {
      setValue(value.username || "");
    }
  });
  return () => subscription.unsubscribe();
}, [form, setValue]);

  useEffect(() => {
    async function checkUsernameUnique(val: string) {
      if (debouncedValue && debouncedValue !== initialUsername) {
        setIsCheckingUsername(true);
        try {
          const response = await fetch(
            `/api/user/check-unique-username/${debouncedValue}`
          );
          const data = await response.json();
          if (data.success) {
            setUserMessage(data.message);
            setUniqueUsername(true);
          } else {
            setUserMessage(data.message);
            setUniqueUsername(false);
          }
        } catch (error) {
          setUserMessage("Error checking username");
          setUniqueUsername(false);
        } finally {
          setIsCheckingUsername(false);
        }
      } else if (debouncedValue === initialUsername) {
        setUserMessage("");
        setUniqueUsername(true);
      } else {
        setUserMessage("");
      }
    }
    checkUsernameUnique(debouncedValue);
  }, [debouncedValue, initialUsername]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (data: z.infer<typeof updateProfile>) => {
    if (userMessage && !uniqueUsername) {
      toast.error("Please choose a valid username");
      return;
    }
    const oldUsername = session?.user?.username;
    setIsFormSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("fullname", data.fullname);
      formData.append("bio", data.bio || "");
      if (imageFile) formData.append("image", imageFile);

      const result = await axiosInstance.post<ApiResponse>("/api/user/update-profile", formData);
      if (result.data.success) {
        await update();
        if (oldUsername !== result.data.data.username) {
          router.replace(`/profile/${result.data.data.username}`);
        }
        queryClient.invalidateQueries({ queryKey: ["user-profile"]})
        toast.success("Profile updated successfully!");
        setIsOpen(false);
      } else {
        toast.error(result.data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsFormSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full py-2 sm:py-2.5 text-sm sm:text-base font-semibold border border-gray-300 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/70 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl transition-colors active:bg-gray-300 dark:active:bg-gray-600">
          Edit Profile
        </Button>
      </DialogTrigger>

      <DialogContent 
      onOpenAutoFocus={(e) => e.preventDefault()}
      className="w-[95vw] sm:w-full sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-white dark:bg-[#1c1c1c] text-gray-900 dark:text-white border border-gray-300 dark:border-gray-800 rounded-2xl shadow-xl p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-300 dark:border-gray-800 sticky top-0 bg-white dark:bg-[#1c1c1c] z-10">
          <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          {/* Profile Image */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-5 sm:mb-6">
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden border border-gray-300 dark:border-gray-800 shrink-0">
              <img
                src={imagePreview || profileImage || "/no-profile.jpg"}
                alt="Profile"
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm sm:text-base">{initialUsername}</h3>
              <label className="inline-flex items-center gap-2 text-xs sm:text-sm text-blue-500 dark:text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer font-medium">
                <Camera size={14} className="sm:w-4 sm:h-4" />
                Change profile photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Form */}
          <Form {...form}>
            <div className="space-y-4 sm:space-y-5">
              {/* Username */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                      Username
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Username"
                          spellCheck={false}
                          className="bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-800 text-gray-900 dark:text-white text-sm sm:text-base focus:border-gray-400 dark:focus:border-gray-700 focus:ring-0 rounded-lg h-10 sm:h-11 pr-10"
                          {...field}
                          onFocus={() => setUsernameMsg(true)}
                          onBlur={() => setUsernameMsg(false)}
                        />
                      </FormControl>

                      {/* Status Icons */}
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isCheckingUsername ? (
                          <Loader2
                            className="animate-spin text-gray-400 dark:text-gray-400"
                            size={16}
                          />
                        ) : (
                          userMessage && (
                            <>
                              {uniqueUsername ? (
                                <CircleCheck
                                  className="text-green-500 dark:text-green-500"
                                  size={16}
                                />
                              ) : (
                                <CircleX className="text-red-500 dark:text-red-500" size={16} />
                              )}
                            </>
                          )
                        )}
                      </div>
                    </div>

                    {/* Validation Message */}
                    {userMessage && usernameMsg && (
                      <p
                        className={`text-xs sm:text-sm mt-1 ${
                          uniqueUsername ? "text-green-500 dark:text-green-500" : "text-red-500 dark:text-red-500"
                        }`}
                      >
                        {userMessage}
                      </p>
                    )}
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />

              {/* Fullname */}
              <FormField
                control={form.control}
                name="fullname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Full Name"
                        spellCheck={false}
                        className="bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-800 text-gray-900 dark:text-white text-sm sm:text-base focus:border-gray-400 dark:focus:border-gray-700 focus:ring-0 rounded-lg h-10 sm:h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />

              {/* Bio */}
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                      Bio
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Write something about yourself..."
                        className="bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-800 text-gray-900 dark:text-white text-sm sm:text-base focus:border-gray-400 dark:focus:border-gray-700 focus:ring-0 rounded-lg resize-none"
                        {...field}
                      />
                    </FormControl>
                    <div className="flex justify-between items-center mt-1">
                      <FormMessage className="text-xs sm:text-sm" />
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {watchedBio?.length || 0}/150
                      </span>
                    </div>
                  </FormItem>
                )}
              />

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  className="w-full flex-1 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white text-sm sm:text-base border border-gray-300 dark:border-gray-800 rounded-lg h-10 sm:h-11 order-2 sm:order-1"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={form.handleSubmit(handleSave)}
                  className="w-full flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base rounded-lg h-10 sm:h-11 disabled:opacity-50 order-1 sm:order-2"
                >
                  {isFormSubmitting ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}