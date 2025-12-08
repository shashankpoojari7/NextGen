"use client";

import { useEffect, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import Link from "next/link";
import { Loader, MessageCircleMore, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useConversationList } from "@/hooks/useConversationList";
import { useChatSearch } from "@/hooks/useChatSearch";
import { useOnlineStore } from "@/store/useOnlineStore";
import { socket } from "@/lib/socketClient";
import { useQueryClient } from "@tanstack/react-query";

function MessageBar() {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounceValue(search, 500);
  const queryClient = useQueryClient()

  const { data: searchResults = [], isLoading: searchLoading } = useChatSearch(debouncedSearch);
  const { data: conversations = [], isLoading: convoLoading } = useConversationList();

  useEffect(() => {
      const handler = () => {
        queryClient.invalidateQueries({queryKey: ["conversation-list"]})
      }
      socket.off("chat:message", handler);
  
      socket.on("chat:message", handler);
  
      return () => {
        socket.off("chat:message", handler);
      };
    }, []);

  const isSearching = debouncedSearch.length > 0;

  const onlineUsers = useOnlineStore((state) => state.onlineUsers)

  return (
    <div className="h-screen w-full px-3 py-2 bg-white dark:bg-[#151515] text-black dark:text-white">
      {/* Header */}
      <div className="flex w-full p-2 md:p-3">
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-300">Chats</h2>
      </div>

      {/* Search Input */}
      <div className="flex border border-gray-400 dark:border-gray-700 rounded-lg px-3 py-2 mb-4 mt-2  items-center">
        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-gray-700 dark:text-gray-200 text-sm focus:outline-none"
        />
      </div>

      {/* CONTENT */}
      <div className="flex flex-col space-y-1 w-full h-[85vh] overflow-auto">
        {isSearching ? (
          // --- SEARCH RESULTS LAYOUT ---
          <>
            {searchLoading && (
              <div className="flex justify-center py-10">
                <Loader className="animate-spin w-7 text-gray-300" />
              </div>
            )}

            {!searchLoading && searchResults.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <Search className="w-10 h-10 mb-4" />
                    <p className="text-lg font-semibold">No users found</p>
                    <p className="text-sm">Try searching by username.</p>
                </div>
            )}

            {!searchLoading &&
              searchResults.map((user: any) => (
                <Link key={user._id} href={`/messages/${user._id}`}>
                  <div className="flex w-full h-18 py-3 hover:bg-[#6c6b6b28] cursor-pointer rounded-lg">
                    <div className="flex justify-center items-center w-max h-full px-2">
                      <div className="relative">
                        <div className="h-13 w-13 rounded-full overflow-hidden bg-gray-800">
                          <img
                            src={user.profile_image || "/no-profile.jpg"}
                            className="h-full w-full object-cover"
                            alt="Profile"
                          />
                        </div>
                        {onlineUsers.has(user._id) && (
                          <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-[#151515]"></div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col justify-center grow pl-2">
                      <p className="text-[15px] font-semibold">{user.username}</p>
                      <p className="text-[12px] text-gray-400">Tap to chat</p>
                    </div>
                  </div>
                </Link>
              ))}
          </>
        ) : (
          // --- CONVERSATION LIST LAYOUT ---
          <>
            {convoLoading ? (
              <div className="flex justify-center py-10">
                <Loader className="animate-spin w-7 text-gray-300" />
              </div>
            ) : conversations.length === 0 ? ( 
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <MessageCircleMore className="w-10 h-10 mb-4" />
                <p className="text-lg font-semibold">Start a new conversation</p>
                <p className="text-sm text-center px-4">
                  Your direct messages will appear here. Search for a user to begin chatting!
                </p>
              </div>
            ) : (
              conversations.map((convo: any) => {
                const isUnread = convo.unreadCount > 0;
                
                // Determine CSS classes based on unread status (WhatsApp/Instagram style)
                const messageClass = isUnread 
                  ? "text-[12px] font-bold text-black dark:text-white truncate" 
                  : "text-[12px] text-gray-600 dark:text-gray-400 truncate";       
                
                return (
                  <Link key={convo.conversationId} href={`/messages/${convo.peerId}`}>
                    <div className="flex w-full h-18 py-3 hover:bg-[#6c6b6b28] cursor-pointer rounded-lg">
                      <div className="flex justify-center items-center w-max h-full px-2">
                        <div className="relative">
                          <div className="h-13 w-13 rounded-full overflow-hidden bg-gray-800">
                            <img
                              src={convo.profile_image || "/no-profile.jpg"}
                              className="h-full w-full object-cover"
                              alt="Profile"
                            />
                          </div>
                          {onlineUsers.has(convo.peerId) && (
                            <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-[#151515]"></div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col justify-center grow pl-2">
                        <p className="text-[15px] font-semibold">
                          {convo.username}
                        </p>
                        {/* Apply conditional styling to the last message */}
                        <p className={messageClass}>
                          {convo.lastMessage || "No messages yet"}
                        </p>
                      </div>
                      
                      {/* Unread count badge */}
                      {isUnread && (
                        <div className="flex items-center pl-4 pr-3">
                          <span className="bg-blue-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-semibold">
                            {convo.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MessageBar;