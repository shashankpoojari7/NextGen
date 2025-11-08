import dbConnect from "@/database/dbConnection";
import mongoose from "mongoose";
import Post from "@/models/post.model";
import { ApiResponse } from "@/lib/ApiResponse";
import { NextResponse } from "next/server";
import { safeObjectId } from "@/helpers/ValidateMongooseId";

export async function PATCH(request: Request) {
  
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      new ApiResponse(400, "Invalid or missing JSON body"),
      { status: 400 }
    );
  }

  try {
    await dbConnect()

    const { postId, caption } = body || {}
    const userId = request.headers.get("x-user-id")

    const validUserId = safeObjectId(userId as string);
    const validPostId = safeObjectId(postId as string);
    
    if (!validUserId || !validPostId) {
      return NextResponse.json(
        new ApiResponse(400, "Invalid UserId or PostId"),
        { status: 400 }
      );
    }

    const post = await Post.findOne({_id: validPostId})

    if(!post) {
      return NextResponse.json(
        new ApiResponse(404, "Post not found"),
        { status: 404 }
      );
    }
    
    if(!post.userId.equals(validUserId)) {
      return NextResponse.json(
        new ApiResponse(401, "Unauthorized user"),
        { status: 401 }
      );
    }

    post.caption = caption
    await post.save()

    return NextResponse.json(
      new ApiResponse(200, "Post edited successfully "),
      { status: 200 }
    );

  } catch (error: any) {
    return NextResponse.json(
      new ApiResponse(500, "Something went wrong while editing the post"),
      { status: 500 }
    );
  }

}