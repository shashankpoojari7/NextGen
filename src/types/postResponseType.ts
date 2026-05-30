export interface IncomingPostData {
  _id: string;
  userId: string;
  imageUrl: string;
  caption: string;
  location?: string;
  isLiked: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  createdAt: string;
  updatedAt: string;
  username: string;
  profile_image: string;
  isPublicPost: boolean;
}

export interface FollowingFeedResponse {
  posts: IncomingPostData[];
  nextCursor: string | null;
  hasMore: boolean;
  switchToPublic: boolean;
}

export interface PublicFeedResponse {
  posts: IncomingPostData[];
  nextCursor: string | null;
  hasMore: boolean;
  switchToPublic: boolean;
}

export interface FeedCursor {
  createdAt: string;
  _id: string;
}

export interface FeedResponse {
  posts: IncomingPostData[];

  cursor: {
    following: FeedCursor | null;
    public: FeedCursor | null;
  };

  hasMoreFollowing: boolean;
  hasMorePublic: boolean;
}