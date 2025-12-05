import { X, UserPlus, UserCheck, Clock, Loader2, Search, UserX, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useEffect, useState } from "react";
import { axiosInstance } from "@/services/axios";
import { ApiResponse } from "@/lib/ApiResponse";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

interface FollowerUser {
  _id: string;
  username: string;
  profile_image: string;
  isPrivate?: boolean;
  isFollowing?: boolean;
  isRequested?: boolean;
  isFollowingMe?: boolean;
  hasRequestedToMe?: boolean;
}

interface FollowersModalProps {
  closeModel: (value: boolean) => void;
  userId: string;
}

export default function FollowersModal({ closeModel, userId }: FollowersModalProps) {
  const { data: session } = useSession();
  const [followers, setFollowers] = useState<FollowerUser[]>([]);
  const [filteredFollowers, setFilteredFollowers] = useState<FollowerUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const queryClient = useQueryClient()

  const isOwnProfile = session?.user?.id === userId;

  useEffect(() => {
    async function fetchUsersFollowersList() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axiosInstance.get<ApiResponse>(`/api/user/follower/${userId}`);
        setFollowers(response.data.data || []);
        setFilteredFollowers(response.data.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load followers");
        console.error("Error fetching followers:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsersFollowersList();
  }, [userId]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredFollowers(followers);
    } else {
      const filtered = followers.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFollowers(filtered);
    }
  }, [searchQuery, followers]);

  const handleFollow = async (targetUserId: string, isPrivate: boolean = false) => {
    try {
      setActionLoading(targetUserId);
      const res = await axiosInstance.post<ApiResponse>(`/api/user/follow?followingId=${targetUserId}&isPrivate=${isPrivate}`);
      if(res.data.success){
        setFollowers(prev => prev.map(user => 
          user._id === targetUserId 
            ? { ...user, isFollowing: !isPrivate, isRequested: isPrivate }
            : user
        ));
      }
      
    } catch (err) {
      console.error("Error following user:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnfollow = async (targetUserId: string) => {
    try {
      setActionLoading(targetUserId);
      const res = await axiosInstance.post<ApiResponse>(`/api/user/unfollow?followingId=${targetUserId}`);
      if(res.data.success){
        setFollowers(prev => prev.map(user => 
          user._id === targetUserId 
            ? { ...user, isFollowing: false, isRequested: false }
            : user
        ));
      }
    } catch (err) {
      console.error("Error unfollowing user:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveFollower = async (targetUserId: string, username: string) => {
    try {
      setActionLoading(targetUserId);
      const res = await axiosInstance.post<ApiResponse>(`/api/user/remove-follower?followerId=${targetUserId}`);
      if(res.data.success){
        setFollowers(prev => prev.filter(user => user._id !== targetUserId));
        await queryClient.invalidateQueries({queryKey: ["user-profile"]})
      }
    } catch (err) {
      console.error("Error removing follower:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnsendRequest = async (targetUserId: string) => {
    try {
      setActionLoading(targetUserId);
      const res = await axiosInstance.post<ApiResponse>(`/api/user/unsend-request?followingId=${targetUserId}`);
      if(res.data.success){
        setFollowers(prev => prev.map(user => 
          user._id === targetUserId 
            ? { ...user, isRequested: false }
            : user
        ));
      }
    } catch (err) {
      console.error("Error unsending request:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const renderActionButton = (user: FollowerUser) => {
    const isLoadingAction = actionLoading === user._id;

    if (isOwnProfile) {
      if (isLoadingAction) {
        return (
          <button
            disabled
            className="flex items-center justify-center w-[110px] px-4 py-1.5 bg-gray-700 rounded-lg text-sm font-semibold"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
          </button>
        );
      }
      
      return (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="flex items-center justify-center space-x-1 w-[110px] px-4 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-semibold transition">
              <UserX className="w-4 h-4" />
              <span>Remove</span>
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white dark:bg-neutral-900 text-black dark:text-white border border-gray-300 dark:border-neutral-700 rounded-lg shadow-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg font-semibold text-white">
                Remove Follower
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-gray-600 dark:text-gray-400">
                Are you sure you want to remove <span className="font-bold text-gray-200">{user.username}</span> from your followers? They won't be notified.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleRemoveFollower(user._id, user.username)}
                className="bg-[#bf4a4a] hover:bg-[#a13c3c] text-white rounded-md px-4 py-2 font-medium"
              >
                Yes, Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    }

    if (session?.user?.id && user._id === session.user.id) {
      return(
      <button className="flex items-center justify-center space-x-1 w-[110px] px-4 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-semibold transition">
        <User className="w-4 h-4" />
        <span>You</span>
      </button>
      )
    }

    if (isLoadingAction) {
      return (
        <button
          disabled
          className="flex items-center justify-center w-[110px] px-4 py-1.5 bg-gray-700 rounded-lg text-sm font-semibold"
        >
          <Loader2 className="w-4 h-4 animate-spin" />
        </button>
      );
    }

    if (user.isFollowing) {
      return (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="flex items-center justify-center space-x-1 w-[110px] px-4 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-semibold transition">
              <UserCheck className="w-4 h-4" />
              <span>Following</span>
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="sm:max-w-[400px] bg-[#1c1c1c] text-white border-none rounded-2xl shadow-xl">
            <AlertDialogHeader className="flex flex-col items-center justify-center space-y-2 py-4">
              <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-gray-700">
                <img
                  src={user.profile_image || "/no-profile.jpg"}
                  alt={user.username}
                  className="object-cover w-full h-full"
                />
              </div>
              <AlertDialogTitle className="text-lg font-semibold text-center mt-2">
                @{user.username}
              </AlertDialogTitle>
            </AlertDialogHeader>
            <div className="flex flex-col overflow-hidden mt-2 border-gray-700">
              <button
                onClick={() => {
                  handleUnfollow(user._id);
                }}
                className="w-full py-3 text-red-500 font-semibold text-center hover:bg-[#2a2a2a] transition-all border-gray-700"
              >
                Unfollow
              </button>
              <AlertDialogCancel className="w-full py-3 text-gray-300 font-medium text-center hover:bg-[#2a2a2a] border-none transition-all m-0 rounded-none">
                Cancel
              </AlertDialogCancel>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      );
    }

    // Request is pending
    if (user.isRequested) {
      return (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="flex items-center justify-center space-x-1 w-[110px] px-4 py-1.5 bg-gray-700 rounded-lg text-sm font-semibold opacity-70">
              <Clock className="w-4 h-4" />
              <span>Requested</span>
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white dark:bg-neutral-900 text-black dark:text-white border border-gray-300 dark:border-neutral-700 rounded-lg shadow-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg font-semibold text-white">
                Remove Follow Request
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-gray-600 dark:text-gray-400">
                Once removed, your follow request will be canceled. You can always send it again later if you wish.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleUnsendRequest(user._id)}
                className="bg-[#bf4a4a] hover:bg-[#a13c3c] text-white rounded-md px-4 py-2 font-medium"
              >
                Yes, Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    }

    // User follows back (they follow you)
    if (user.isFollowingMe) {
      return (
        <button
          onClick={() => handleFollow(user._id, user.isPrivate || false)}
          className="flex items-center justify-center space-x-1 w-[110px] px-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-[12px] font-semibold transition"
        >
          <UserPlus className="w-4 h-4" />
          <span className="">Follow Back</span>
        </button>
      );
    }

    return (
      <button
        onClick={() => handleFollow(user._id, user.isPrivate || false)}
        className="flex items-center justify-center space-x-1 w-[110px] px-4 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition"
      >
        <UserPlus className="w-4 h-4" />
        <span>Follow</span>
      </button>
    );
  };

  return (
    <Dialog open={true} onOpenChange={() => closeModel(false)}>
      <DialogContent
        className="sm:max-w-[600px] bg-[#262626] text-white border-none rounded-2xl p-0 overflow-hidden max-h-[80vh]"
        showCloseButton={false}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <DialogTitle className="text-lg font-semibold">Followers</DialogTitle>
          <button
            onClick={() => closeModel(false)}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#3a3a3a] border border-gray-600 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto max-h-[calc(80vh-140px)]">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10 px-4">
              <p className="text-red-500 text-center">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition"
              >
                Retry
              </button>
            </div>
          ) : filteredFollowers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4">
              <p className="text-gray-400 text-center">
                {searchQuery ? "No users found" : "No followers yet"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {filteredFollowers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-[#2a2a2a] transition"
                >
                  {/* User Info */}
                  <div className="flex items-center space-x-3 flex-1 min-w-0 mr-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-cyan-700 shrink-0">
                      <img
                        src={user.profile_image || "/no-profile.jpg"}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-sm truncate">
                        <Link href={`/profile/${user.username}`}>
                          @{user.username}
                        </Link>
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="shrink-0">
                    {renderActionButton(user)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}