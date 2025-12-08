"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signUpSchema } from "@/schemas/signUpSchemas";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CircleCheck, CircleX, Eye, EyeOff, Loader2 } from "lucide-react";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/lib/ApiResponse";
import { useRouter } from "next/navigation";
import { useDebounceValue } from "usehooks-ts";
import Link from "next/link";
import { toast } from "sonner";

// Define the type for the form data based on the schema
type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpForm() {
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  
  // LOGIC FOR DEBOUNCING USERNAME CHECK (UNCHANGED)
  const [debouncedValue, setValue] = useDebounceValue("", 500);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [userMessage, setUserMessage] = useState("");
  const [uniqueUsername, setUniqueUsername] = useState(false);
  const [usernameMsg, setUsernameMsg] = useState(false);
  const [togglePassword, setTogglePassword] = useState(false);

  const router = useRouter();

  // FORM SETUP (UNCHANGED)
  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      identifier: "",
      password: "",
      username: "",
      fullname: "",
      dob: "",
    },
  });

  const { watch } = form;
  const watchedUsername = watch("username"); // Use watchedUsername for the input value
  
  // Set debounced value on username change (UNCHANGED)
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "username") {
        setValue(value.username || "");
      }
    });
    return () => subscription.unsubscribe();
  }, [form, setValue]);

  // Check username uniqueness (UNCHANGED)
  useEffect(() => {
    async function checkUsernameUnique(val: string) {
      // Logic checks for presence of debouncedValue to avoid initial/empty check
      if (debouncedValue) {
        setIsCheckingUsername(true);
        try {
          // Replace with your actual API endpoint logic
          const response = await fetch(
            `/api/user/check-unique-username/${debouncedValue}`
          );
          const data = await response.json();
          
          if (response.ok && data.success) { // Check for successful HTTP status and API success field
            setUserMessage(data.message);
            setUniqueUsername(true);
          } else {
            setUserMessage(data.message || "Username is not valid or taken.");
            setUniqueUsername(false);
          }
        } catch (error) {
          console.error("Error during username check:", error);
          setUserMessage("Error checking username");
          setUniqueUsername(false);
        } finally {
          setIsCheckingUsername(false);
        }
      } else if (!debouncedValue) {
        // Clear message if input is empty
        setUserMessage("");
        setUniqueUsername(false); // Assuming empty means not yet valid
      }
    }
    checkUsernameUnique(debouncedValue);
  }, [debouncedValue]);

  // SUBMIT HANDLER (UNCHANGED)
  async function onSubmit(data: SignUpFormData) {
    if (!uniqueUsername) {
      toast.error("Please choose a valid username");
      return;
    }

    setIsFormSubmitting(true);

    try {
      const response = await axios.post<ApiResponse>(
        "/api/auth/sign-up",
        data
      );

      if (response.data.success) {
        toast.success(response?.data?.message || "User registered Successfully");
        router.push("/sign-in");
      } else {
        // This handles server-side validation errors not caught by Zod
        toast.error(response?.data?.message || "Registration failed.");
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage = axiosError.response?.data?.message || "An unknown error occurred during sign-up.";
      toast.error(errorMessage);
    } finally {
      setIsFormSubmitting(false);
    }
  }

  // --- REFINED UI START ---

  return (
    // Responsive container setup (Center the form, apply background)
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          // Card styling: Responsive width, background, rounded corners, shadow
          className="w-full max-w-md md:max-w-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 rounded-xl shadow-lg space-y-6 transition-colors duration-300"
        >
          {/* Header */}
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
            Create Account
          </h1>
          <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">
            Sign up to see photos and videos from your friends.
          </p>

          {/* IDENTIFIER */}
          <FormField
            control={form.control}
            name="identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Email"
                    className="
                      bg-gray-800 text-gray-100
                      border border-gray-700
                      rounded-xl h-12 px-4
                      placeholder:text-gray-400
                      focus:outline-none
                      focus:ring-2 focus:ring-blue-600
                      transition-all duration-200
                    "
                    disabled={isFormSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* PASSWORD */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={togglePassword ? "text" : "password"}
                      placeholder="Password"
                      className="
                        bg-gray-800 text-gray-100
                        border border-gray-700
                        rounded-xl h-12 px-4 pr-12
                        placeholder:text-gray-400
                        focus:outline-none
                        focus:ring-2 focus:ring-blue-600
                        transition-all duration-200
                      "
                      disabled={isFormSubmitting}
                      {...field}
                    />
                  </FormControl>

                  <div
                    onClick={() => setTogglePassword(!togglePassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-200"
                  >
                    {togglePassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />


          {/* USERNAME (Username Check Logic Intact) */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">Username</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      placeholder="Username"
                      className="
                        bg-gray-800 text-gray-100
                        border border-gray-700
                        rounded-xl h-12 px-4 pr-12
                        placeholder:text-gray-400
                        focus:outline-none
                        focus:ring-2 focus:ring-blue-600
                        transition-all duration-200
                      "
                      {...field}
                      onFocus={() => setUsernameMsg(true)}
                      onBlur={() => setUsernameMsg(false)}
                    />
                  </FormControl>

                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {isCheckingUsername ? (
                      <Loader2 className="animate-spin text-blue-500" size={18} />
                    ) : userMessage ? (
                      uniqueUsername ? (
                        <CircleCheck className="text-green-500" size={18} />
                      ) : (
                        <CircleX className="text-red-500" size={18} />
                      )
                    ) : null}
                  </div>
                </div>

                {userMessage && usernameMsg && (
                  <p
                    className={`text-sm mt-1 ${
                      uniqueUsername ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {userMessage}
                  </p>
                )}

                <FormMessage />
              </FormItem>
            )}
          />


          {/* FULLNAME */}
          <FormField
            control={form.control}
            name="fullname"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Full Name"
                    className="
                      bg-gray-800 text-gray-100
                      border border-gray-700
                      rounded-xl h-12 px-4
                      placeholder:text-gray-400
                      focus:outline-none
                      focus:ring-2 focus:ring-blue-600
                      transition-all duration-200
                    "
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />


          {/* DOB */}
          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">Date of Birth</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    className="
                      bg-gray-800 text-gray-100
                      border border-gray-700
                      rounded-xl h-12 px-4
                      placeholder:text-gray-400
                      focus:outline-none
                      focus:ring-2 focus:ring-blue-600
                      transition-all duration-200
                    "
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />


          {/* SUBMIT */}
          <Button 
            type="submit" 
            className="w-full h-10 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
            disabled={isFormSubmitting || isCheckingUsername || !uniqueUsername} // Disable if checking or not unique
          >
            {isFormSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Submit"
            )}
          </Button>

          {/* Sign In Link */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an Account?{" "}
            <Link href={"/sign-in"} className="text-blue-600 dark:text-blue-500 hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </form>
      </Form>
    </div>
  );
}