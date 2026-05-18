"use client";

import { MailOpen, Github, Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// --- Helper Component: Password Input for better UX ---
// Ensures the user can see what they're typing
const PasswordInput = ({ name }: { name: string }) => {
  const [showPassword, setShowPassword] = useState(false);
  const baseClasses = "mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-2 pr-10 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:focus:ring-blue-400 focus:ring-opacity-50 outline-none transition-colors";

  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        id={name}
        name={name}
        required
        placeholder="••••••••"
        className={baseClasses}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
};
// --- End Helper Component ---

export function SignIn() {
  const [error, setError] = useState<string | null>(null);
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingGithub, setIsLoadingGithub] = useState(false);
  const router = useRouter();

  // --- LOGIC REMAINS UNCHANGED ---

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoadingCredentials(true);
    const formData = new FormData(e.currentTarget);
    const identifier = formData.get("email") as string;
    const password = formData.get("password") as string;

    const res = await signIn("credentials", {
      identifier,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError(res.error);
      console.log(res);
      toast.error(res.error);
    } else {
      toast.success("Logged in successfully.");
      router.replace("/");
    }
    setIsLoadingCredentials(false);
  };

  const handleGoogleLogin = async() => {
    setIsLoadingGoogle(true);
    await signIn("google", { callbackUrl: "/" })
  }

  const handleGithubLogin = async() => {
    setIsLoadingGithub(true);
    await signIn("github", { callbackUrl: "/" })
  }

  // --- REORDERED UI START ---

  return (
    // Centered container on the screen, responsive padding
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 rounded-xl space-y-6 p-8 sm:p-10">
        
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
          Login
        </h2>

        {/* 1. CREDENTIALS FORM (MOVED UP) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email/Identifier Field */}
          <div>
            <label htmlFor="credentials-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mobile Number, Email or Username
            </label>
            <input
              type="text"
              id="credentials-email"
              name="email"
              required
              placeholder="you@example.com"
              className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:focus:ring-blue-400 focus:ring-opacity-50 outline-none transition-colors"
              disabled={isLoadingCredentials}
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="credentials-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <PasswordInput name="password" />
          </div>

          {/* Error Display */}
          {error && (
            <p className="p-3 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 text-sm rounded-md text-center">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-10 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white py-2 rounded-md transition-colors flex items-center justify-center gap-2"
            disabled={isLoadingCredentials || isLoadingGoogle || isLoadingGithub}
          >
            {isLoadingCredentials && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <MailOpen className="h-4 w-4" />
            Login
          </Button>
        </form>
        
        {/* Sign Up Link (Kept here for good flow after Login button) */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <Link href="/sign-up" className="text-blue-600 dark:text-blue-500 hover:underline font-medium">
            Create Account
          </Link>
        </p>

        {/* 2. OR Separator (MOVED DOWN) */}
        <div className="flex items-center justify-center my-4">
          <div className="grow border-t border-gray-300 dark:border-gray-700"></div>
          <span className="mx-3 text-gray-500 dark:text-gray-400 text-sm">OR</span>
          <div className="grow border-t border-gray-300 dark:border-gray-700"></div>
        </div>

        {/* 3. SOCIAL LOGINS SECTION (MOVED DOWN) - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full h-10 bg-white dark:bg-gray-800 text-gray-900 hover:text-black dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            disabled={isLoadingGoogle || isLoadingCredentials || isLoadingGithub}
          >
            {isLoadingGoogle ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <span className="mr-2 text-xl">G</span>
            )}
            Google
          </Button>

          <Button
            onClick={handleGithubLogin}
            variant="outline"
            className="w-full h-10 bg-white dark:bg-gray-800 text-gray-900 hover:text-black dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            disabled={isLoadingGithub || isLoadingCredentials || isLoadingGoogle}
          >
            {isLoadingGithub ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Github className="h-4 w-4 mr-2" />
            )}
            GitHub
          </Button>
        </div>
        
      </div>
    </div>
  );
}