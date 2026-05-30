import dbConnect from "@/database/dbConnection";
import Post from "@/models/post.model";
import Follow from "@/models/follow.model";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/ApiResponse";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        new ApiResponse(400, "Missing UserID."),
        { status: 400 }
      );
    }
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const { searchParams } = new URL(request.url);
    const followingCursor = searchParams.get("followingCursor") || null;
    const publicCursor =    searchParams.get("publicCursor") || null;

    const FEED_SIZE = 5;
    const FOLLOWING_SIZE = 3;
    
    const followingUsers = await Follow.find(
      { followerId: userObjectId, isAccepted: true },
      { followingId: 1, _id: 0 }
    ).lean();

    const followingIds = followingUsers.map(f => f.followingId);

    const matchStage = {
      userId: { $in: followingIds },
      ...(followingCursor && {
        _id: { $lt: new mongoose.Types.ObjectId(followingCursor) },
      }),
    };

    let followingPosts = [];
    let publicPosts = [];

    let hasMoreFollowing = false;
    let hasMorePublic = false;

    if (followingIds.length != 0) {
      followingPosts = await Post.aggregate([
        { $match: matchStage },
        { $sort: { _id: -1 } },
        { $limit: FOLLOWING_SIZE + 1 },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userData",
          },
        },
        { $unwind: "$userData" },
        {
          $lookup: {
            from: "likes",
            let: { postId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$postId", "$$postId"] },
                      { $eq: ["$userId", userObjectId] },
                    ],
                  },
                },
              },
            ],
            as: "likesData",
          },
        },
        {
          $addFields: {
            isLiked: { $gt: [{ $size: "$likesData" }, 0] },
            userId: "$userData._id",
            username: "$userData.username",
            profile_image: "$userData.profile_image",
          },
        },
        { $project: { userData: 0, likesData: 0 } },
      ]);
      hasMoreFollowing =
      followingPosts.length > FOLLOWING_SIZE;

      if (hasMoreFollowing) {
        followingPosts.pop();
      }
    }

    if(followingPosts.length < 5) {
      const LIMIT = FEED_SIZE - followingPosts.length;

       const preMatchStage = {
        userId: { $nin: [...followingIds, userObjectId] },
        ...(publicCursor && {
          _id: { $lt: new mongoose.Types.ObjectId(publicCursor) },
        }),
      };

      publicPosts = await Post.aggregate([
        { $match: preMatchStage },
        { $sort: { _id: -1, createdAt: -1, } },
        { $limit: LIMIT + 1 },
        {
          $lookup: {
            from: "users",
            let: { userId: "$userId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$_id", "$$userId"] },
                      { $eq: ["$isPrivate", false] },
                    ],
                  },
                },
              },
            ],
            localField: "userId",
            foreignField: "_id",
            as: "userData",
          },
        },
        { $unwind: "$userData" },
        {
          $lookup: {
            from: "likes",
            let: { postId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$postId", "$$postId"] },
                      { $eq: ["$userId", userObjectId] },
                    ],
                  },
                },
              },
            ],
            as: "likesData",
          },
        },
        {
          $addFields: {
            isLiked: { $gt: [{ $size: "$likesData" }, 0] },
            userId: "$userData._id",
            username: "$userData.username",
            profile_image: "$userData.profile_image",
          },
        },
        { $project: { userData: 0, likesData: 0 } },
      ]);

      hasMorePublic = publicPosts.length > LIMIT;

      if (hasMorePublic) {
        publicPosts.pop();
      }
    }

    const lastFollowingPost = followingPosts[followingPosts.length - 1];
    const lastPublicPost = publicPosts[publicPosts.length - 1];

    followingPosts = followingPosts.map(post => ({
      ...post,
      isPublicPost: false
    }));

    publicPosts = publicPosts.map(post => ({
      ...post,
      isPublicPost: true
    }));

    return NextResponse.json(
      new ApiResponse(200, "Following feed fetched successfully!", {
        posts: [...followingPosts, ...publicPosts],
        cursor: {
          following: lastFollowingPost ? {
            createdAt: lastFollowingPost?.createdAt,
            _id: lastFollowingPost?._id
          } : null,
          public:  lastPublicPost ? {
            createdAt: lastPublicPost?.createdAt,
            _id: lastPublicPost?._id
          } : null
        },
        hasMoreFollowing,
        hasMorePublic
      }),
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Feed Error:", error);
    return NextResponse.json(
      new ApiResponse(500, "Something went wrong while fetching feed!"),
      { status: 500 }
    );
  }
}