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

    const cursor = request.nextUrl.searchParams.get("cursor");
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const followingUsers = await Follow.find(
      { followerId: userObjectId, isAccepted: true },
      { followingId: 1, _id: 0 }
    ).lean();

    const followingIds = followingUsers.map(f => f.followingId);

    if (followingIds.length === 0) {
      return NextResponse.json(
        new ApiResponse(200, "No following posts", {
          posts: [],
          nextCursor: null,
          hasMore: false,
          switchToPublic: true,
        }),
        { status: 200 }
      );
    }

    const LIMIT = 1;

    const matchStage: any = {
      userId: { $in: followingIds },
    };

    if (cursor) {
      matchStage._id = { $lt: new mongoose.Types.ObjectId(cursor) };
    }

    const posts = await Post.aggregate([
      { $match: matchStage },
      { $sort: { _id: -1 } },          // ✅ sort FIRST
      { $limit: LIMIT + 1 },            // ✅ fetch one extra to detect hasMore
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
      {
        $project: {
          userData: 0,
          likesData: 0,
        },
      },
    ]);

    const hasMore = posts.length > LIMIT;        // ✅ reliable check
    if (hasMore) posts.pop();                     // ✅ remove extra doc

    const nextCursor = posts.length > 0 ? posts[posts.length - 1]._id : null;

    return NextResponse.json(
      new ApiResponse(200, "Personal feed fetched successfully!", {
        posts,
        nextCursor,
        hasMore,
        switchToPublic: !hasMore,
      }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Following Feed Error:", error);
    return NextResponse.json(
      new ApiResponse(500, "Something went wrong while fetching following feed!"),
      { status: 500 }
    );
  }
}