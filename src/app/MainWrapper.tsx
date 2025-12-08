"use client";

import React, { useEffect, useState } from 'react'
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner"
import { QueryClient, QueryClientProvider} from '@tanstack/react-query'
import SocketAuthBinder from '@/components/SocketAuthBinder'
import Notification from '@/components/notification/Notification'
import { socket } from '@/lib/socketClient'
import NotificationInitializer from '@/components/notification/NotificationInitializer'
import { useNotificationStore } from '@/store/useNotificationStore'
import GlobalLoader from '@/components/GlobalLoader';
import { useActiveChatStore } from "@/store/useActiveChatStore";
import { usePathname } from 'next/navigation';
import { useDrawerStore } from '@/store/useDrawerStore';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import SplashScreen from '@/components/SplashScreen';

const queryClient = new QueryClient()

export function MainWrapper({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [notification, setNotification] = useState(null);
  const pathname = usePathname();
  const incrementNotification = useNotificationStore((s) => s.incrementNotification);
  const isNotificationDrawerOpen = useDrawerStore((s) => s.isNotificationDrawerOpen);
  const addUnreadUser = useNotificationStore((s) => s.addUnreadUser);
  const activePeerId = useActiveChatStore((s) => s.activePeerId);

  useEffect(() => {
    const handler = (data: any) => {
      if (data.type === "LIKE" || data.type === "COMMENT") {
        incrementNotification();
      }
      if(data.type === "FOLLOW") {
        incrementNotification();
        if (pathname === "/notification" || isNotificationDrawerOpen ) {
          queryClient.invalidateQueries({queryKey: ["notifications"]})
        }
        if ( pathname === "/notification/follow-requests" ) {
          queryClient.invalidateQueries({queryKey: ["follow-requests"]})
        }
        return
      }
      if (data.type === "MESSAGE") {
        const fromUserId = data.from;
        if (fromUserId === activePeerId) return;
        addUnreadUser(fromUserId);
      }
      setNotification(data);
    };
    socket.on("notification", handler);
    return () => {
      socket.off("notification", handler);
    };
  }, [activePeerId, incrementNotification, addUnreadUser, isNotificationDrawerOpen]);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <SessionProvider>
      <SocketAuthBinder/>
      <QueryClientProvider client={queryClient}>
        <NotificationInitializer />
        <Notification data={notification} />
        <main className="w-full min-h-screen bg-background">
          {children}
        </main>
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        <Toaster richColors expand={true}/>
        <GlobalLoader />
      </QueryClientProvider>
    </SessionProvider>
  );
}
