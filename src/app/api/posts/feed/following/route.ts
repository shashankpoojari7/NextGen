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

    const followingUsers = await Follow.find(
      {
        followerId: userObjectId,
        isAccepted: true,
      },
      { followingId: 1, _id: 0 }
    ).lean();

    const followingIds = followingUsers.map(f => f.followingId);
    console.log(followingUsers);
    console.log(followingIds);
    
    if (followingIds.length === 0) {
      return NextResponse.json(
        new ApiResponse(200, "No following posts", []),
        { status: 200 }
      );
    }

    const posts = await Post.aggregate([
      {
        $match: {
          userId: { $in: followingIds },
        },
      },
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
                    { $eq: ["$userId", userObjectId] }
                  ]
                }
              }
            }
          ],
          as: "likesData",
        },
      },
      {
        $addFields: {
          isLiked: { $gt: [{ $size: "$likesData" }, 0] },
        },
      },
      {
        $addFields: {
          userId: "$userData._id",
          username: "$userData.username",
          profile_image: "$userData.profile_image",
        },
      },
      { $sort: { createdAt: -1 } },
      { $limit: 3 },
      {
        $project: {
          userData: 0,
          likesData: 0,
        },
      },
    ]);

    return NextResponse.json(
      new ApiResponse(200, "Personal feed fetched successfully!", posts),
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
