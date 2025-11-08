export interface UserProfilePosts {
  _id: string;
  userId: string;
  imageUrl: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
}

export interface UserProfile {
  _id: string;
  username: string;
  fullname: string;
  bio: string;
  profile_image: string;
  isPrivate: boolean;
  followersCount: number;
  followingCount: number;
  isRequested: boolean,
  hasRequestedToMe: boolean,
  isFollowing: boolean,
  isFollowingMe: boolean,
  postsCount: number;
  createdAt: string;
  updatedAt: string;
}

