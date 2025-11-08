import dbConnect from "@/database/dbConnection";
import Post from "@/models/post.model";
import { ApiResponse } from "@/lib/ApiResponse";
import { NextRequest, NextResponse } from "next/server";
import cloudinary, { extractPublicId } from "@/lib/Cloudinary";
import { safeObjectId } from "@/helpers/ValidateMongooseId";
import Comment from "@/models/comment.model";
import Like from "@/models/like.model";
import Share from "@/models/share.model";
import mongoose from "mongoose";


export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {

  let session;
  try {
    await dbConnect()

    const { id: postId } = await params
    const userId = request.headers.get("x-user-id")

    const validUserId = safeObjectId(userId as string)
    const validPostId = safeObjectId(postId as string)

    if (!validPostId || !validUserId) {
      return NextResponse.json(
        new ApiResponse(400, "Invalid postId or userId"),
        { status: 400 }
      );
    }

    const post = await Post.findOne({_id: validPostId})
    console.log(post);

    if(!post){
      return NextResponse.json(
        new ApiResponse(404, "Post Not found"),
        { status: 404 }
      );
    }

    if (!post.userId.equals(validUserId)) {
      return NextResponse.json(
        new ApiResponse(403, "You are not authorized to delete this post."),
        { status: 403 }
      );
    }

    session = await mongoose.startSession();
    session.startTransaction();
    
    await Comment.deleteMany({postId: validPostId}, { session })
    await Like.deleteMany({postId: validPostId}, { session })
    await Share.deleteMany({postId: validPostId}, { session })

    const postDeleted = await Post.deleteOne({_id: postId}, { session })

    if (postDeleted.deletedCount === 0) {
      return NextResponse.json(
        new ApiResponse(404, "Post not found or already deleted"),
        { status: 404 }
      );
    }

    const public_id = extractPublicId(post.imageUrl)
    console.log(public_id)


    if (!public_id) {
      await session.abortTransaction();
      return NextResponse.json(
        new ApiResponse(400, "Invalid image URL: public_id could not be extracted"),
        { status: 400 }
      );
    }

    const res = await cloudinary.uploader.destroy(public_id)
    console.log(res)

    if (res.result !== "ok") {
      await session.abortTransaction();
      return NextResponse.json(
        new ApiResponse(500, "Failed to delete image from Cloudinary, rolled back DB changes"),
        { status: 500 }
      );
    }

    await session.commitTransaction();

    return NextResponse.json(
      new ApiResponse(200, "Post deleted"),
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Delete Post Error:", error)
    if (session) await session.abortTransaction();
    return NextResponse.json(
      new ApiResponse(500, "Something went wrong while deleting the post"),
      { status: 500 }
    );
  } finally {
    if (session) session.endSession();
  }
}