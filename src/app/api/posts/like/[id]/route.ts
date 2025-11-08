import dbConnect from "@/database/dbConnection";
import { ApiResponse } from "@/lib/ApiResponse";
import { NextRequest, NextResponse } from "next/server";
import { safeObjectId } from "@/helpers/ValidateMongooseId";
import mongoose from "mongoose";
import Post from "@/models/post.model";
import Like from "@/models/like.model";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  let session;
  try {
    await dbConnect();

    const { id: postId } = await params;
    const userId = request.headers.get("x-user-id");

    const validUserId = safeObjectId(userId as string);
    const validPostId = safeObjectId(postId as string);

    if (!validUserId || !validPostId) {
      return NextResponse.json(
        new ApiResponse(400, "Invalid UserId or PostId"),
        { status: 400 }
      );
    }

    const post = await Post.findById(validPostId);
    if (!post) {
      return NextResponse.json(
        new ApiResponse(404, "Post not found"),
        { status: 404 }
      );
    }

    session = await mongoose.startSession();
    session.startTransaction();

    let message;

    const alreadyLiked = await Like.findOne({ postId: validPostId, userId: validUserId }).session(session);

    if (alreadyLiked) {
      await Like.deleteOne({ postId: validPostId, userId: validUserId }, { session });
      await Post.findByIdAndUpdate(
        validPostId,
        { $inc: { likeCount: -1 } },
        { session }
      );
      message = "Post disliked successfully.";
    } else {
      await Like.create([{ postId: validPostId, userId: validUserId }], { session });
      await Post.findByIdAndUpdate(
        validPostId,
        { $inc: { likeCount: 1 } }, 
        { session }
      );
      message = "Post liked successfully.";
    }

    await session.commitTransaction();
    return NextResponse.json(new ApiResponse(200, message), { status: 200 });

  } catch (error: any) {
    console.error("Error in like toggle route:", error);
    if (session) await session.abortTransaction();
    return NextResponse.json(new ApiResponse(500, "Something went wrong"), { status: 500 });
  } finally {
    if (session) session.endSession();
  }
}