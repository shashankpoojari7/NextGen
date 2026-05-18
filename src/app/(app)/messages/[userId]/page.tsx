"use client";

import ChatTest from "@/components/messages/ChatTest";
import { useParams } from "next/navigation";

export default function ChatPage() {
  const params = useParams();
  const peerId = params.userId as string;

  return <ChatTest peerId={peerId} />;
}
