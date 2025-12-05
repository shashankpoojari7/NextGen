import { NextRequest } from "next/server"
import { ApiResponse } from "@/lib/ApiResponse";
import { NextResponse } from "next/server";
import { safeObjectId } from "@/helpers/ValidateMongooseId";
import mongoose from "mongoose";
import Post from "@/models/post.model";
import Share from "@/models/share.model";


export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }>  }) {

  const { id : postId } = await params
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

    const userComment = await Share.create({
      postId: validPostId,
      userId: validUserId,
    })

    await Post.findByIdAndUpdate(
      validPostId,
      { $inc: { shareCount: 1 } }, 
      
    );

    await session.commitTransaction();

    return NextResponse.json(
      new ApiResponse(200, "Post shared successfully", userComment),
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Share Error:", error);
    if (session) await session.abortTransaction();
    return NextResponse.json(
      new ApiResponse(500, "Something went wrong in comment."),
      { status: 500 }
    );
  } finally {
    if (session) session.endSession();
  }
}