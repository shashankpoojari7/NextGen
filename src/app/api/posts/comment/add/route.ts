import { NextRequest } from "next/server"
import { ApiResponse } from "@/lib/ApiResponse";
import { NextResponse } from "next/server";
import { safeObjectId } from "@/helpers/ValidateMongooseId";
import Post from "@/models/post.model";
import Comment from "@/models/comment.model";
import mongoose from "mongoose";
import Notification from "@/models/notification.model";

export async function POST(request: NextRequest) {
  
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      new ApiResponse(400, "Invalid or missing JSON body"),
      { status: 400 }
    );
  }

  const { comment, postId } = body || {};
  const userId = request.headers.get("x-user-id")
  
  const validUserId = safeObjectId(userId as string);
  const validPostId = safeObjectId(postId as string);

  if (!validUserId || !validPostId) {
    return NextResponse.json(
      new ApiResponse(400, "Invalid or missing PostId or UserID."),
      { status: 400 }
    );
  }

  let session;

  try {
    const post = await Post.findById(postId)

    if(!post) {
      return NextResponse.json(
        new ApiResponse(404, "Post not found"),
        { status: 404 }
      );
    }

    session = await mongoose.startSession();
    session.startTransaction();

    const userComment = await Comment.create({
      postId: validPostId,
      userId: validUserId,
      text: comment
    })

    await Post.findByIdAndUpdate(
      validPostId,
      { $inc: { commentCount: 1 } }, 
      { session }
    );

    await session.commitTransaction();

    if (String(post.userId) !== String(validUserId)) {
      await Notification.create({
        recipient: post.userId,
        actor: validUserId,
        type: "COMMENT",
        entityId: validPostId,
      });
    }

    return NextResponse.json(
      new ApiResponse(200, "Comment added successfully", userComment),
      { status: 200 }
    );

  } catch (error: any) {
    console.error("comment Error:", error);
    if (session) await session.abortTransaction();
    return NextResponse.json(
      new ApiResponse(500, "Something went wrong in comment."),
      { status: 500 }
    );
  } finally {
    if (session) session.endSession();
  }
}