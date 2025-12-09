"use client";

import { useState, useRef, useEffect } from "react";
import { Save, Pencil, Loader2, CircleCheck, CircleX, ChevronLeft } from "lucide-react";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useDebounceValue } from "usehooks-ts";
import { toast } from "sonner";
import { axiosInstance } from "@/services/axios";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

export default function UpdateProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data, isLoading } = useUserSettings();
  const queryClient = useQueryClient();
  const { update } = useSession();

  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
    bio: "",
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  const [debouncedUsername, setDebouncedUsername] = useDebounceValue("", 600);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isUsernameUnique, setIsUsernameUnique] = useState(true);

  useEffect(() => {
    if (!data) return;

    setFormData({
      username: data.username || "",
      fullname: data.fullname || "",
      bio: data.bio || "",
    });

    setProfileImage(data.profile_image || null);
    setDebouncedUsername(data.username);
  }, [data, setDebouncedUsername]);

  useEffect(() => {
    const checkUsername = async () => {
      if (!debouncedUsername) return;

      if (debouncedUsername === data?.username) {
        setUsernameMessage("");
        setIsUsernameUnique(true);
        return;
      }

      setIsCheckingUsername(true);

      try {
        const res = await fetch(`/api/user/check-unique-username/${debouncedUsername}`);
        const json = await res.json();

        setUsernameMessage(json.message);
        setIsUsernameUnique(json.success);
      } catch (error) {
        setUsernameMessage("Error checking username");
        setIsUsernameUnique(false);
      } finally {
        setIsCheckingUsername(false);
      }
    };

    checkUsername();
  }, [debouncedUsername, data]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setIsChanged(true);

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "username") {
      setDebouncedUsername(value);
    }
  };

  const handleImageUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setIsChanged(true);

    const reader = new FileReader();
    reader.onloadend = () => setProfileImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!isChanged) return;

    if (!isUsernameUnique) {
      toast.error("Choose a different username");
      return;
    }

    setIsSaving(true);

    try {
      const form = new FormData();
      form.append("username", formData.username);
      form.append("fullname", formData.fullname);
      form.append("bio", formData.bio);
      if (imageFile) form.append("image", imageFile);

      const result = await axiosInstance.post("/api/user/update-profile", form);

      if (result.data.success) {
        await update();

        queryClient.invalidateQueries({ queryKey: ["user-settings"] });
        toast.success("Profile updated!");

        setIsChanged(false);
      } else {
        toast.error(result.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Update failed");
    } finally {
      setIsSaving(false);
    }
  };

  // Skeleton
  if (isLoading) {
    return <div className="animate-pulse p-10 min-h-screen" />;
  }

  // UI
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-black dark:text-white p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 mb-10 group"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition" />
          <h1 className="text-2xl font-bold">Update Profile</h1>
        </button>

        {/* Profile Card */}
        <div className="bg-[#97bfb4] dark:bg-[#7da89e] text-white rounded-3xl p-8 shadow-xl">
          <div className="flex items-center gap-6">
            {/* Image */}
            <div className="relative">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white/40 shadow-lg">
                <img
                  src={profileImage || "/no-profile.jpg"}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Upload */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow"
              >
                <Pencil className="w-4 h-4 text-[#97bfb4]" />
              </button>
            </div>

            {/* User Info */}
            <div>
              <h2 className="text-3xl font-bold">{formData.fullname}</h2>
              <p className="opacity-90">@{formData.username}</p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* FORM */}
        <div className="space-y-6 mt-6">
          {/* Username */}
          <div>
            <label className="font-semibold mb-1 block">Username</label>

            <div className="relative">
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-white dark:bg-[#1a1a1a] 
                          text-black dark:text-white 
                          border border-gray-300 dark:border-gray-700 
                          rounded-2xl px-4 py-3 outline-none 
                          focus:ring-2 focus:ring-[#97bfb4] dark:focus:ring-[#7da89e]"
              />

              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                {isCheckingUsername ? (
                  <Loader2 className="animate-spin text-gray-400" size={18} />
                ) : usernameMessage ? (
                  isUsernameUnique ? (
                    <CircleCheck className="text-green-500" size={18} />
                  ) : (
                    <CircleX className="text-red-500" size={18} />
                  )
                ) : null}
              </span>
            </div>

            {usernameMessage && (
              <p
                className={`text-sm mt-1 ${
                  isUsernameUnique ? "text-green-600" : "text-red-500"
                }`}
              >
                {usernameMessage}
              </p>
            )}
          </div>

          {/* Fullname */}
          <div>
            <label className="font-semibold mb-1 block">Full Name</label>
            <input
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              className="w-full bg-white dark:bg-[#1a1a1a] 
                        text-black dark:text-white 
                        border border-gray-300 dark:border-gray-700 
                        rounded-2xl px-4 py-3 outline-none
                        focus:ring-2 focus:ring-[#97bfb4] dark:focus:ring-[#7da89e]"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="font-semibold mb-1 block">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="w-full h-32 bg-white dark:bg-[#1a1a1a] 
                        text-black dark:text-white 
                        border border-gray-300 dark:border-gray-700 
                        rounded-2xl p-4 outline-none
                        focus:ring-2 focus:ring-[#97bfb4] dark:focus:ring-[#7da89e]"
            />
          </div>

          {/* Save */}
          <button
            onClick={handleSubmit}
            disabled={!isChanged || isSaving}
            className="w-full bg-linear-to-r from-[#97bfb4] to-[#7da89e] 
                      text-white py-4 rounded-2xl 
                      flex justify-center items-center gap-3 
                      disabled:opacity-50 disabled:cursor-not-allowed
                      shadow-md"
          >
            {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
