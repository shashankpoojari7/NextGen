import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/ApiResponse";
import dbConnect from "@/database/dbConnection";
import { safeObjectId } from "@/helpers/ValidateMongooseId";
import Post from "@/models/post.model";


export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const { id: userId} = await params
    const validUserId = safeObjectId(userId)

    if(!validUserId) {
      return NextResponse.json(
        new ApiResponse(400, "Missing parameters: UserId"),
        { status: 400 }
      );
    }

    const posts = await Post.find({
      userId: validUserId
    }).select("_id userId imageUrl likeCount commentCount shareCount")


    return NextResponse.json(
      new ApiResponse(200, "Posts fetched successfully", posts),
      { status: 200 }
    );

  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      new ApiResponse(500, "Something went wrong while fetching user posts!!"),
      { status: 500 }
    );
  }
}