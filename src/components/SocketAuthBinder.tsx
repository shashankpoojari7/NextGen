"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { socket } from "@/lib/socketClient";
import { useOnlineStore } from "@/store/useOnlineStore";

export default function SocketAuthBinder() {
  const { data: session } = useSession();

  const setOnlineList = useOnlineStore((s) => s.setOnlineList);
  const addOnlineUser = useOnlineStore((s) => s.addOnlineUser);
  const removeOnlineUser = useOnlineStore((s) => s.removeOnlineUser);

  useEffect(() => {
    if (!session?.user?.id) return;
    
    socket.auth = { userId: session.user.id };

    if (!socket.connected) {
      socket.connect();
    }

    socket.on("presence:list", ({ online }) => {
      setOnlineList(online);
    });

    // 🔥 User online
    socket.on("presence:online", ({ userId }) => {
      addOnlineUser(userId);
    });

    // 🔥 User offline
    socket.on("presence:offline", ({ userId }) => {
      removeOnlineUser(userId);
    });

    return () => {
      socket.off("presence:list");
      socket.off("presence:online");
      socket.off("presence:offline");
      socket.offAny();
    };
  }, [session?.user?.id]);

  return null;
}
