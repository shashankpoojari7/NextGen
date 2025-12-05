import dbConnect from "@/database/dbConnection";
import Post from "@/models/post.model";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/ApiResponse";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // 👇 Replace with your actual authenticated user's ID
    const userId = request.headers.get("x-user-id"); // example only
    const userObjectId = userId ? new mongoose.Types.ObjectId(userId) : null;

    const posts = await Post.aggregate([
      // Lookup the user data (author)
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userData",
        },
      },
      { $unwind: "$userData" },

      // Only public users' posts
      {
        $match: { "userData.isPrivate": false },
      },

      // 👇 Lookup likes for each post
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

      // 👇 Determine if the current user liked this post
      ...(userObjectId
        ? [
            {
              $addFields: {
                isLiked: {
                  $in: [userObjectId, "$likesData.userId"],
                },
              },
            },
          ]
        : [
            {
              $addFields: {
                isLiked: false,
              },
            },
          ]),

      // Simplify structure
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

      // Remove unused fields
      {
        $project: {
          "userData": 0,
          "likesData": 0,
        },
      },
    ]);

    return NextResponse.json(
      new ApiResponse(200, "Public posts fetched successfully!", posts),
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
