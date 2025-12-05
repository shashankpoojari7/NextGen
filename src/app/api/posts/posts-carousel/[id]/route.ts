import dbConnect from "@/database/dbConnection";
import Post from "@/models/post.model";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/ApiResponse";
import mongoose from "mongoose";

export async function GET( request: NextRequest, { params }: { params: Promise<{ id: string }> }) 
{
  try {
    await dbConnect();

    const { id: userId} = await params;
    const validUserId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : null;

    if (!validUserId) {
      return NextResponse.json(
        new ApiResponse(400, "Invalid or Missing UserId"),
        { status: 400 }
      );
    }

    // Optional current user (to calculate "isLiked")
    const currentUserId = request.headers.get("x-user-id");
    const currentUserObjId = currentUserId
      ? new mongoose.Types.ObjectId(currentUserId)
      : null;

    const posts = await Post.aggregate([
      // Match only the posts of this user
      { $match: { userId: validUserId } },

      // Lookup user data
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userData",
        },
      },
      { $unwind: "$userData" },

      // Lookup likes
      {
        $lookup: {
          from: "likes",
          let: { pid: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$postId", "$$pid"] },
              },
            },
          ],
          as: "likesData",
        },
      },

      // Add isLiked
      {
        $addFields: {
          isLiked: currentUserObjId
            ? { $in: [currentUserObjId, "$likesData.userId"] }
            : false,
        },
      },

      // Construct final response
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

      // Sort newest first
      { $sort: { createdAt: -1 } },
    ]);

    return NextResponse.json(
      new ApiResponse(200, "User posts fetched successfully!", posts),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("User Posts Error:", error);
    return NextResponse.json(
      new ApiResponse(
        500,
        "Something went wrong while fetching user posts!",
        error?.message
      ),
      { status: 500 }
    );
  }
}
