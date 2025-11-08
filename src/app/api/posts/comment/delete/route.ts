import { NextRequest } from "next/server"
import { ApiResponse } from "@/lib/ApiResponse";
import { NextResponse } from "next/server";
import { safeObjectId } from "@/helpers/ValidateMongooseId";
import Post from "@/models/post.model";
import Comment from "@/models/comment.model";
import mongoose from "mongoose";


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

  const { commentId, postId } = body || {};
  const userId = request.headers.get("x-user-id")
  
  const validUserId = safeObjectId(userId as string);
  const validPostId = safeObjectId(postId as string);
  const validCommentId = safeObjectId(commentId as string);

  if (!validUserId || !validPostId || !validCommentId) {
    return NextResponse.json(
      new ApiResponse(400, "Invalid or missing Post, User, or Comment ID."),
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

    const deletedComment = await Comment.deleteOne({
      _id: validCommentId,
      userId: validUserId,
      postId: validPostId
    }, { session })

    if(deletedComment.deletedCount == 0)  {
      return NextResponse.json(
        new ApiResponse(404, "Comment not found"),
        { status: 404 }
      );
    }

    await Post.findByIdAndUpdate(
      validPostId,
      { $inc: { commentCount: -1 } }, 
      { session }
    );

    await session.commitTransaction();

    return NextResponse.json(
      new ApiResponse(200, "Comment deleted successfully"),
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