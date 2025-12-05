import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/ApiResponse";
import dbConnect from "@/database/dbConnection";
import { safeObjectId } from "@/helpers/ValidateMongooseId";
import Post from "@/models/post.model";
import mongoose from "mongoose";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();

    const { id: profileUserId } = await params;

    const validProfileUserId = safeObjectId(profileUserId);
    if (!validProfileUserId) {
      return NextResponse.json(
        new ApiResponse(400, "Invalid or missing UserId"),
        { status: 400 }
      );
    }

    const loggedInUserId = request.headers.get("x-user-id");
    const validLoggedInUserId = loggedInUserId
      ? new mongoose.Types.ObjectId(loggedInUserId)
      : null;

    const posts = await Post.aggregate([
      {
        $match: {
          userId: validProfileUserId,
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
            { $match: { $expr: { $eq: ["$postId", "$$postId"] } } },
          ],
          as: "likesData",
        },
      },

      {
        $addFields: {
          isLiked: validLoggedInUserId
            ? { $in: [validLoggedInUserId, "$likesData.userId"] }
            : false,
        },
      },

      {
        $project: {
          _id: 1,
          userId: "$userData._id",
          username: "$userData.username",
          profile_image: "$userData.profile_image",
          imageUrl: 1,
          caption: 1,
          location: 1,
          likeCount: 1,
          commentCount: 1,
          shareCount: 1,
          createdAt: 1,
          updatedAt: 1,
          isLiked: 1,
        },
      },
    ]);

    return NextResponse.json(
      new ApiResponse(200, "User posts fetched successfully", posts),
      { status: 200 }
    );

  } catch (error) {
    console.error("User posts error:", error);
    return NextResponse.json(
      new ApiResponse(500, "Something went wrong while fetching user posts"),
      { status: 500 }
    );
  }
}
