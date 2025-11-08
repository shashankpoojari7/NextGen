"use client";

import { MailOpen, Github } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function SignIn() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
  };

  const handleGoogleLogin = async() => {
    await signIn("google", { callbackUrl: "/" })
  }

  const handleGithubLogin = async() => {
    await signIn("github", { callbackUrl: "/" })
  }

  return (
    <div className="max-w-lg mx-auto mt-20 px-10 py-12 bg-white shadow-xl border border-gray-200 rounded-lg space-y-8">
      <h2 className="text-3xl font-semibold text-center mb-6">Login</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <label htmlFor="credentials-email" className="block">
          <span className="text-gray-700">
            Mobile Number, Email or Username
          </span>
          <input
            type="text"
            id="credentials-email"
            name="email"
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 outline-none"
          />
        </label>

        <label htmlFor="credentials-password" className="block">
          <span className="text-gray-700">Password</span>
          <input
            type="password"
            id="credentials-password"
            name="password"
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 outline-none"
          />
        </label>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <input
          type="submit"
          value="Sign In"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
        />

        <p className="text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link href="/sign-up" className="text-blue-500 hover:underline">
            Create Account
          </Link>
        </p>
      </form>

      <div className="flex items-center justify-center my-4">
        <div className="grow border-t border-gray-300"></div>
        <span className="mx-3 text-gray-500 text-sm">OR</span>
        <div className="grow border-t border-gray-300"></div>
      </div>

      <div className="space-y-3">
        <Button
          onClick={handleGoogleLogin}
          className="rounded-lg w-full p-5 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center gap-2"
        >
          <MailOpen className="h-5 w-5" />
          Continue with Google
        </Button>

        <Button
          onClick={handleGithubLogin}
          className="rounded-lg w-full p-5 bg-gray-800 hover:bg-gray-900 text-white flex items-center justify-center gap-2"
        >
          <Github className="h-5 w-5" />
          Continue with GitHub
        </Button>
      </div>
    </div>
  );
}
