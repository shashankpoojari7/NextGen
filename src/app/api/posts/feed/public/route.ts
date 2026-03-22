import dbConnect from "@/database/dbConnection";
import Post from "@/models/post.model";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/ApiResponse";
import redis from "@/lib/redis";
import Follow from "@/models/follow.model";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const userId = request.headers.get("x-user-id");

    if(!userId) {
      return NextResponse.json(
        new ApiResponse(400, "Missing UserID."),
        { status: 400 }
      );
    }

    const cacheKey = `feed:public:user:${userId}`
    const cachedPosts = await redis.get(cacheKey);
    if (cachedPosts) {
      return NextResponse.json(
        new ApiResponse(200, "Public feed fetched successfully (cache)!", cachedPosts),
        { status: 200 }
      );
    }

    const following = await Follow.find(
      { followerId: userId, isAccepted: true },
      { followingId: 1, _id: 0 }
    ).lean();

    const followingIds = following.map(f => f.followingId);

    const posts = await Post.aggregate([
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
        $match: { 
          "userData.isPrivate": false,
          userId: { $nin: followingIds },
        },
      },
      {
        $lookup: {
          from: "likes",
          let: { postId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$postId", "$$postId"] } } },
          ],
          as: "likesData",
        },
      },

      {
        $addFields: {
          isLiked: {
            $in: [userId, "$likesData.userId"],
          },
        },
      },

      {
        $addFields: {
          userId: "$userData._id",
          username: "$userData.username",
          profile_image: "$userData.profile_image",
        },
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $project: {
          "userData": 0,
          "likesData": 0,
        },
      },
    ]);

    await redis.set(cacheKey, posts, { ex: 60 });

    return NextResponse.json(
      new ApiResponse(200, "Public feed fetched successfully!", posts),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Public Post Error:", error);
    return NextResponse.json(
      new ApiResponse(500, "Something went wrong while fetching posts!"),
      { status: 500 }
    );
  }
}
