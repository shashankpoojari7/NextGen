export interface FollowerUser {
  _id: string;
  username: string;
  fullname: string;
  profile_image: string;
}

export interface FollowData {
  _id: string;
  followerId: string;
  followingId: string;
  isAccepted: boolean;
  createdAt: string;
  updatedAt: string;
  follower: FollowerUser; 
}
