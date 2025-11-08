"use client"
import React from 'react'
import { Toaster } from "@/components/ui/sonner"
import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient()

export function MainWrapper({ children }: { children: React.ReactNode}) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <main className="w-full min-h-screen bg-background">
          {children}
        </main>
        <Toaster richColors expand={true}/>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  )
}

