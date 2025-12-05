import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/ApiResponse";
import { NextResponse } from "next/server";
import Comment from "@/models/comment.model";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        new ApiResponse(401, "Unauthorized: Missing x-user-id header"),
        { status: 401 }
      );
    }

    if (!postId) {
      return NextResponse.json(
        new ApiResponse(400, "Missing parameter: PostId"),
        { status: 400 }
      );
    }

    const validPostId = new mongoose.Types.ObjectId(postId);

    const postComments = await Comment.aggregate([
      { $match: { postId: validPostId } },

      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },

      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $project: {
          _id: 1,
          userId: 1,
          postId: 1,
          text: 1,
          createdAt: 1,
          updatedAt: 1,
          username: "$user.username",
          profile_image: "$user.profile_image",
        },
      },

      { $sort: { createdAt: 1 } },
    ]);

    return NextResponse.json(
      new ApiResponse(200, "User Comment fetched successfully", postComments),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("user comment Error:", error);
    return NextResponse.json(
      new ApiResponse(
        500,
        "User Comment Error",
        error?.message || error.toString()
      ),
      { status: 500 }
    );
  }
}
