"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Lock, User, ChevronRight, ChevronLeft, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { axiosInstance } from "@/services/axios";
import { useThemeStore } from "@/store/useThemeStore";

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, update } = useSession();

  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const darkMode = theme === "dark";
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    if (session?.user?.isPrivate !== undefined) {
      setIsPrivate(session.user.isPrivate);
    }
  }, [session]);

  const toggleDarkMode = () => {
    toggleTheme();
  };

  const togglePrivateAccount = async () => {
    const newVal = !isPrivate;
    setIsPrivate(newVal);

    try {
      await axiosInstance.patch("/api/user/settings/privacy", { isPrivate: newVal });
      await update({});
    } catch (err) {
      console.error("Privacy update failed:", err);
      setIsPrivate(!newVal);
    }
  };

  const SettingRow = ({
    icon,
    label,
    description,
    link,
  }: {
    icon: React.ReactNode;
    label: string;
    description: string;
    link: string;
  }) => (
    <Link
      href={link}
      className="flex items-center justify-between bg-gray-50 dark:bg-[#151515] 
      rounded-lg p-4 mb-4 border border-gray-200 dark:border-[#222]
      transition hover:bg-gray-100 dark:hover:bg-[#1a1a1a]"
    >
      <div className="flex items-center gap-4">
        {icon}
        <div>
          <h2 className="text-lg font-semibold">{label}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-500" />
    </Link>
  );

  return (
    <div className="min-h-screen w-full bg-white dark:bg-[#0a0a0a] text-black dark:text-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto">

        <button
          onClick={() => router.back()}
          className="flex items-center gap-3 text-black dark:text-white 
          hover:text-[#97bfb4] dark:hover:text-[#97bfb4] mb-8 transition group
          md:hidden"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          <h1 className="text-2xl font-bold">Settings</h1>
        </button>

        <h1 className="hidden md:block text-3xl font-bold mb-8">Settings</h1>

        {/* 🌙 Dark Mode */}
        <div className="bg-gray-50 dark:bg-[#151515] rounded-lg p-6 mb-6 border border-gray-200 dark:border-[#222]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Moon className="w-6 h-6 text-blue-500" />
              ) : (
                <Sun className="w-6 h-6 text-yellow-500" />
              )}
              <div>
                <h2 className="text-lg font-semibold">Dark Mode</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Toggle dark mode</p>
              </div>
            </div>

            <button
              onClick={toggleDarkMode}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                darkMode ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  darkMode ? "translate-x-7" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* 🔐 Private Account Toggle */}
        <div className="bg-gray-50 dark:bg-[#151515] rounded-lg p-6 mb-6 border border-gray-200 dark:border-[#222]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-[#97bfb4]" />
              <div>
                <h2 className="text-lg font-semibold">Private Account</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isPrivate
                    ? "Only approved followers can view your posts"
                    : "Your posts are visible to everyone"}
                </p>
              </div>
            </div>

            <button
              onClick={togglePrivateAccount}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                isPrivate ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  isPrivate ? "translate-x-7" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* 👤 Update Profile */}
        <SettingRow
          icon={<User className="w-6 h-6 text-[#97bfb4]" />}
          label="Update Profile"
          description="Edit your username, bio, and account info"
          link="/settings/update-profile"
        />

        {/* 🔐 Change Password */}
        <SettingRow
          icon={<Lock className="w-6 h-6 text-[#97bfb4]" />}
          label="Change Password"
          description="Update your account password"
          link="/settings/change-password"
        />

      </div>
    </div>
  );
}
