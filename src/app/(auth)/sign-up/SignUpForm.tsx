"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { signUpSchema } from "@/schemas/signUpSchemas";
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { CircleCheck, CircleX, Eye, EyeOff, Loader2 } from "lucide-react";
import axios, {AxiosError} from "axios";
import { ApiResponse } from "@/lib/ApiResponse";
import { useRouter } from "next/navigation";
import { useDebounceValue } from "usehooks-ts";
import Link from "next/link";
import { toast } from "sonner"

export default function SignUpForm() {
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [debouncedValue, setValue] = useDebounceValue('', 500)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [userMessage, setUserMessage] =useState('')
  const [uniqueUsername, setUniqueUsername] = useState(false)
  const [usernameMsg, setUsernameMsg] = useState(false)
  const [togglePassword, setTogglePassword] = useState(false)

  const router = useRouter()

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      identifier: "",
      password: "",
      username: "",
      fullname: "",
      dob: "",
    },
  })

  useEffect(() => {

  }, [])

  useEffect(() => {
    async function checkUsernameUnique(val : string){
      if(debouncedValue){
        setIsCheckingUsername(true)
        try {
          const response = await axios.post<ApiResponse>(`/api/user/check-unique-username/${debouncedValue}`)
          if(response.data.success) {
            setUserMessage(response.data.message)
            setUniqueUsername(true)
          }
        } catch(error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUserMessage(
            axiosError.response?.data.message ?? 'Error checking username'
          );
          setUniqueUsername(false)
        } finally {
          setIsCheckingUsername(false)
        }
      } else {
        setUserMessage('')
      }
    } 
    checkUsernameUnique(debouncedValue)
  },[debouncedValue])

  async function onSubmit(data: z.infer<typeof signUpSchema>) {
    setIsFormSubmitting(true)
    try {
      const response = await axios.post<ApiResponse>('/api/auth/sign-up', data)
      console.log("response", response);
      
      if(response.data.success) {
        toast.success(response?.data?.message || "User registered Successfully")
        router.push('/sign-in')
      } else {
        toast.error(response?.data?.message)
      }
    } catch (error: any) {
      console.log("error", error)
      toast.error(error.response?.data?.message)
    } finally {
      setIsFormSubmitting(false)
    }
  }

  return (
    <div className="text-black flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} 
          className="w-full m-5 sm:max-w-md md:max-w-xl max-w-sm bg-white border border-gray-200 p-8 rounded-lg shadow-sm space-y-6">
          <h1 className="text-3xl font-semibold text-center text-gray-800">
            Sign up
          </h1>
          <p className="text-sm text-center text-gray-500 mb-10">
            Sign up to see photos and videos from your friends.
          </p>
          <FormField
            control={form.control}
            name="identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile Number or Email address</FormLabel>
                <FormControl>
                  <Input
                  placeholder="Mobile Number or Email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input 
                      type={ togglePassword ? "text" : "password"}
                      placeholder="Password" {...field} />
                    </FormControl>
                    <div onClick={() => setTogglePassword(!togglePassword)}>
                    { togglePassword 
                      ? <Eye className="absolute right-3 top-1/2 -translate-y-1/2  text-black" size={20}/>
                      : <EyeOff className="absolute right-3 top-1/2 -translate-y-1/2 text-black" size={20}/>}
                    </div>
                  </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Username"
                      className="pr-10" 
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        setValue(e.target.value);
                      }}
                      onBlur={(e) => {
                        setUsernameMsg(false)
                      }}
                      onFocus={(e) => {
                        setUsernameMsg(true)
                      }}
                    />
                  </FormControl>
                  {isCheckingUsername && (
                    <Loader2
                      className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400"
                      size={18}
                    />
                  )}

                  {!isCheckingUsername && userMessage && uniqueUsername &&(
                    <>
                      {userMessage === "Username is available." ? (
                        <CircleCheck
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"
                          size={18}
                        />
                      ) : (
                        <CircleX
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500"
                          size={18}
                        />
                      )}
                    </>
                  )}
                </div>
                {userMessage && usernameMsg &&(
                  <p
                    className={`text-sm mt-1 ${
                      uniqueUsername
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {userMessage}
                  </p>
                )}

                
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fullname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fullname</FormLabel>
                <FormControl>
                  <Input 
                  type="text"
                  placeholder="Fullname" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input 
                  type="date"
                  {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full h-10 bg-blue-600 hover:bg-blue-700">
            { isFormSubmitting? <Loader2 className="animate-spin"/> : ('Submit') }
          </Button>
          <p className="text-center">
            Already have an Account? <Link href={'/sign-in'} className="text-blue-500">Sign In</Link>
          </p>
        </form>
      </Form>
    </div>
  )
}
