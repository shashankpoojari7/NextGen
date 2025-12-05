export interface ConversationListItem {
  conversationId: string;
  peerId: string;
  username: string;
  profile_image?: string;
  lastMessage?: string;
  updatedAt: string;  
  unreadCount: number;
  createdAt: number,
}

export interface ChatSearchResponse {
  _id: string;
  username: string;
  profile_image: string;
}