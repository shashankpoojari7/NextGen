"use client";

import { useEffect, useRef, useState } from "react";
import { socket } from "@/lib/socketClient";
import { Send, ArrowLeft, MoreVertical } from "lucide-react";
import { axiosInstance } from "@/services/axios";
import { useRouter } from "next/navigation";
import { useMessages } from "@/hooks/useMessages";
import { useCreateConversation } from "@/hooks/useCreateConversation";
import { useConversationList } from "@/hooks/useConversationList";
import { useOnlineStore } from "@/store/useOnlineStore";
import { useActiveChatStore } from "@/store/useActiveChatStore";
import Link from "next/link";
import { useNotificationStore } from "@/store/useNotificationStore";

interface Message {
  conversationId: string;
  from: string;
  to: string;
  text: string;
  createdAt: string;
  isRead?: boolean;
}

const getTimeOnly = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};


export default function ChatTest({ peerId }: { peerId: string }) {
  const [text, setText] = useState("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [peerInfo, setPeerInfo] = useState<any>(null);

  const router = useRouter();
  const myId = socket.auth?.userId;
  const onlineUsers = useOnlineStore((state) => state.onlineUsers);
  const setActivePeer = useActiveChatStore((s) => s.setActivePeer);

  
  const { 
    data: conversationList = [], 
    refetch: refetchConversations 
  } = useConversationList(); 
  
  const { mutateAsync: createConversation } = useCreateConversation();

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const initialLoadRef = useRef(true);

  useEffect(() => {
    setActivePeer(peerId);
    useNotificationStore.getState().removeUnreadUser(peerId);
    return () => setActivePeer(null);
  }, []);

  useEffect(() => {
    if (!bottomRef.current) return;
    const scroll = () => {
        if (initialLoadRef.current) {
            bottomRef.current?.scrollIntoView({ behavior: "instant" as any });
            initialLoadRef.current = false;
        } else {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }
    const timer = setTimeout(scroll, 0); 
    return () => clearTimeout(timer);
  }, [messages]);

  useEffect(() => {
    async function markAsRead() {
      if(conversationId) {
        try {
          await axiosInstance.post(`api/chat/messages/mark-read/${conversationId}`)
        } catch (error: any) {
          console.log("error:", error?.message);
          
        }
      }
    }
    markAsRead()
  }, [messages])

  useEffect(() => {
    const existing = conversationList.find((c: any) => c.peerId === peerId);

    if (existing) {
      setConversationId(existing.conversationId);
      setPeerInfo({
        username: existing.username,
        profile_image: existing.profile_image,
      });
    } else {
      setConversationId(null);
      fetchPeerInfo();
    }
  }, [conversationList, peerId]);

  const fetchPeerInfo = async () => {
    try {
      const res = await axiosInstance.get(`/api/user/get-profile/${peerId}`);
      setPeerInfo(res.data.data);
    } catch (err) {
      console.error("Error fetching peer info:", err);
    }
  };
  const { data: apiResponseData = { messages: [] } } = useMessages(conversationId);

  useEffect(() => {
    if (!conversationId) return;

    const { messages: initialMessages } = apiResponseData;

    if (!initialMessages || !Array.isArray(initialMessages)) {
        console.error("API response data is missing the 'messages' array or it's invalid:", apiResponseData);
        return;
    }
    const formatted = initialMessages.map((m: any) => ({
      conversationId: m.conversationId,
      from: m.senderId,
      to: m.receiverId,
      text: m.content,
      createdAt: m.createdAt,
    }));
    
    setMessages(formatted);
    
  }, [apiResponseData, conversationId]); 

  useEffect(() => {
    if (!myId || !conversationId) return;

    const messageHandler = (msg: Message) => {
      if (msg.conversationId !== conversationId) return;
      setIsTyping(false);
      setMessages((prev) => [msg, ...prev]);
    };

    const typingHandler = () => {
      setIsTyping(true);
    };

    const stopTypingHandler = () => {
      setIsTyping(false);
    };

    socket.off("chat:message", messageHandler);
    socket.off("typing", typingHandler);
    socket.off("stop:typing", stopTypingHandler);

    socket.on("chat:message", messageHandler);
    socket.on("typing", typingHandler);
    socket.on("stop:typing", stopTypingHandler);

    return () => {
      socket.off("chat:message", messageHandler);
      socket.off("typing", typingHandler);
      socket.off("stop:typing", stopTypingHandler);
    };
  }, [myId, conversationId]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!text.trim() || !myId) return;

    if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
    }
    socket.emit("stop:typing", { to: peerId, from: myId });
    isTypingRef.current = false;

    let convoId = conversationId;

    if (!convoId) {
      const res = await createConversation({ peerId, text });
      convoId = res.conversationId;
      setConversationId(convoId);
      refetchConversations();
    }

    const saved = await axiosInstance.post("/api/chat/messages/create", {
      conversationId: convoId,
      from: myId,
      to: peerId,
      text,
    });
    
    const newMessage: Message = {
        conversationId: convoId!,
        from: myId,
        to: peerId,
        text,
        createdAt: saved.data.data.createdAt,
    }

    socket.emit("chat:send", newMessage);
    socket.emit("notification", {
      to: peerId,
      from: myId,
      type: "MESSAGE",
    });

    setMessages((prev) => [newMessage, ...prev]);

    setText("");
  };

  const handleChange = (e: any) => {
    const value = e.target.value;
    setText(value);

    if (!myId) return;

    if (value.trim() === "") {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        socket.emit("stop:typing", { to: peerId, from: myId });
      }
      return;
    }

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit("typing", {
        to: peerId,
        from: myId,
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;

      socket.emit("stop:typing", {
        to: peerId,
        from: myId,
      });
    }, 2000);
  };

  const isOnline = onlineUsers.has(peerId);

  return (
    <div className="flex flex-col bg-white dark:bg-linear-to-b dark:from-[#0e0e0f] dark:via-[#0a0a0b] dark:to-[#000000]" style={{ height: "100dvh" }}>
      {/* Header */}
      <div className="shrink-0 sticky top-0 z-30 bg-white dark:bg-[#0e0e0f] border-b border-gray-200 dark:border-[#1a1a1c]">
        <div className="flex items-center justify-between px-3 sm:px-4 py-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => router.push("/messages")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-xl transition-all duration-200"
            >
              <ArrowLeft size={22} className="text-gray-900 dark:text-white" />
            </button>

            <div className="relative">
              <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-full overflow-hidden bg-linear-to-br from-blue-500 to-purple-600 p-0.5">
                <div className="h-full w-full rounded-full overflow-hidden bg-gray-200 dark:bg-slate-800">
                  <img
                    src={peerInfo?.profile_image || "/no-profile.jpg"}
                    className="h-full w-full object-cover"
                    alt="Profile"
                  />
                </div>
              </div>

              {isOnline && (
                <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />
              )}
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <Link href={`/profile/${peerInfo?.username}`}>
                <p className="text-base font-semibold text-gray-900 dark:text-white truncate hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                  {peerInfo?.username || "Loading..."}
                </p>
              </Link>
              {isTyping ? (
                <p className="text-xs text-blue-500 dark:text-blue-400 font-medium animate-pulse">
                    typing...
                </p>
              ) : isOnline ? (
                <p className="text-xs text-green-500 dark:text-green-400 font-medium">
                  Active now
                </p>
              ) : null}
            </div>
          </div>

          <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-xl transition-all duration-200">
            <MoreVertical size={18} className="text-gray-700 dark:text-white/80" />
          </button>
        </div>
      </div>

      {/* Messages container */}
      <div className="flex-1 flex flex-col-reverse overflow-y-auto px-3 sm:px-4 pb-2 pt-2">
        <div ref={bottomRef} />

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-end gap-2 mb-3">
            <img
              src={peerInfo?.profile_image || "/no-profile.jpg"}
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover mr-1 mt-3 sm:mt-2 mb-1 sm:mr-2.5 self-end"
              alt="Typing"
            />
            <div className="bg-gray-200 dark:bg-slate-700/90 dark:backdrop-blur-sm px-4 py-4 rounded-2xl">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="h-2 w-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="h-2 w-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((m, i) => {
          const isMe = m.from === myId;
          const msgBelow = messages[i - 1]; 
          const isGroupedBelow = msgBelow?.from === m.from; 

          const bubbleBgClass = isMe 
            ? "bg-blue-600" 
            : "bg-gray-200 dark:bg-slate-700/90 dark:backdrop-blur-sm";

          const textColorClass = isMe
            ? "text-white"
            : "text-gray-900 dark:text-white";

          const marginBottom = isGroupedBelow ? "mb-1" : "mb-1";
          return (
            <div key={i}>
              {/* Removed: Unread bar rendering */}

              <div
                className={`flex w-full ${marginBottom} ${isMe ? "justify-end" : "justify-start"}`}
              >
                {/* Avatar on bottom of cluster only */}
                {!isMe && !isGroupedBelow && (
                  <img
                    src={peerInfo?.profile_image || "/no-profile.jpg"}
                    className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover mr-3 sm:mr-4 self-end"
                    alt="Peer Profile"
                  />
                )}

                {/* Spacer when grouped */}
                {!isMe && isGroupedBelow && (
                  <div className="w-7 sm:w-8 mr-3 sm:mr-4" />
                )}

                <div className={`relative max-w-[75%] sm:max-w-[70%] py-2 px-3 text-sm sm:text-base leading-relaxed ${textColorClass} rounded-2xl wrap-break-word break-all whitespace-pre-wrap 
                    ${bubbleBgClass} 
                    ${isMe ? "rounded-bl-2xl" : "rounded-br-2xl"}
                `}>
                  {m.text}
                  {/* Optional: Add TimeStamp inside bubble */}
                  <span className={`block text-right text-[10px] mt-1 leading-none ${isMe ? 'text-white/50' : 'text-gray-500 dark:text-white/50'}`}>
                    {getTimeOnly(m.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

      </div>

      {/* Input area */}
      <div className="shrink-0 sticky bottom-0 bg-white dark:bg-[#0e0e0f] border-t border-gray-200 dark:border-[#1a1a1c] p-3 sm:p-4 z-30">
        <form className="flex gap-2 sm:gap-3 max-w-4xl mx-auto" onSubmit={handleSubmit}>
          <div className="flex-1 relative">
            <input
              value={text}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Type a message..."
              className="w-full bg-gray-100 dark:bg-[#131315] border border-gray-300 dark:border-[#1f1f21] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 
                rounded-2xl px-4 py-3 focus:outline-none focus:ring-0 focus:border-gray-300 dark:focus:border-[#1f1f21]"
            />
          </div>

          <button
            type="submit"
            disabled={!text.trim()}
            className={`px-5 sm:px-6 rounded-2xl transition-all duration-200 shadow-lg ${
              text.trim()
                ? "bg-blue-600 hover:bg-blue-700 active:scale-95"
                : "bg-gray-300 dark:bg-slate-700/50 cursor-not-allowed opacity-50"
            }`}
          >
            <Send size={18} className="text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}