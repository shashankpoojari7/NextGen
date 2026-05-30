import dbConnect from "@/database/dbConnection";
import Post from "@/models/post.model";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/ApiResponse";
import Follow from "@/models/follow.model";
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

    const LIMIT = 1;
    const cursor = request.nextUrl.searchParams?.get("cursor");
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const following = await Follow.find(
      { followerId: userObjectId, isAccepted: true },
      { followingId: 1, _id: 0 }
    ).lean();

    const followingIds = following.map(f => f.followingId);

    const preMatchStage: any = {
      userId: { $nin: [...followingIds, userObjectId] },
    };

    if (cursor) {
      preMatchStage._id = { $lt: new mongoose.Types.ObjectId(cursor) };
    }

    const posts = await Post.aggregate([
      { $match: preMatchStage },
      { $sort: { _id: -1 } },          // ✅ sort FIRST on raw posts
      { $limit: LIMIT + 1 },            // ✅ fetch one extra
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
                    { $eq: ["$isPrivate", false] },  // ✅ private filter inside lookup
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
      { $unwind: "$userData" },         // ✅ drops private accounts silently
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
      new ApiResponse(200, "Public feed fetched successfully!", {
        posts,
        nextCursor,
        hasMore,
      }),
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