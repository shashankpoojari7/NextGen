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
}