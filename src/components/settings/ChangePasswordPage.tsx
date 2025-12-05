"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Save, Loader2, Lock, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { axiosInstance } from "@/services/axios";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormSchema = z.infer<typeof passwordSchema>;

export default function ChangePasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<PasswordFormSchema>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    },
    mode: "onChange"
  });

  const onSubmit = async (values: PasswordFormSchema) => {
    setIsSubmitting(true);

    try {
      const payload = {
        oldPassword: values.currentPassword,
        newPassword: values.newPassword,
      };

      const res = await axiosInstance.patch(
        "/api/user/settings/change-password",
        payload
      );

      if (res.data.success) {
        toast.success("Password changed successfully!");
        form.reset();
      } else {
        toast.error(res.data.message || "Password update failed.");
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || "Something went wrong.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full mx-auto p-6 sm:p-10 bg-white dark:bg-[#0a0a0a] shadow-xl rounded-xl text-black dark:text-white">
      {/* HEADER */}
      <div className="flex flex-col mb-8 pb-4 border-b dark:border-gray-800">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-3 group text-black dark:text-white 
                    hover:text-[#97bfb4] dark:hover:text-[#97bfb4]"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition" />
          <div className="flex items-center gap-2">
            <Lock className="w-6 h-6 text-[#97bfb4]" />
            <h1 className="text-2xl font-bold">Change Password</h1>
          </div>
        </button>
      </div>

      {/* FORM */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">
                  Current Password
                </FormLabel>
                <FormControl>
                  <input
                    {...field}
                    type="password"
                    placeholder="Enter your current password"
                    className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-300 
                              dark:border-[#333] rounded-xl px-4 py-3.5 focus:ring-2
                              focus:ring-[#97bfb4]"
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">New Password</FormLabel>
                <FormControl>
                  <input
                    {...field}
                    type="password"
                    placeholder="Enter new password"
                    className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-300 
                              dark:border-[#333] rounded-xl px-4 py-3.5 focus:ring-2
                              focus:ring-[#97bfb4]"
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">
                  Confirm Password
                </FormLabel>
                <FormControl>
                  <input
                    {...field}
                    type="password"
                    placeholder="Re-enter new password"
                    className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-300 
                              dark:border-[#333] rounded-xl px-4 py-3.5 focus:ring-2
                              focus:ring-[#97bfb4]"
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          <button
            type="submit"
            disabled={!form.formState.isValid || isSubmitting}
            className="w-full bg-linear-to-r from-[#97bfb4] to-[#7da89e] 
                      hover:opacity-90 text-white font-semibold py-4 px-6 rounded-xl
                      flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Change Password
              </>
            )}
          </button>
        </form>
      </Form>
    </div>
  );
}
