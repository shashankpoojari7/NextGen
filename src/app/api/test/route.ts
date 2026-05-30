import dbConnect from "@/database/dbConnection";
import Post from "@/models/post.model";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/ApiResponse";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        new ApiResponse(400, "Missing UserID."),
        { status: 400 }
      );
    }

    const post = await Post.findOne().lean();

    console.log("Is Mongoose Document:", post instanceof mongoose.Document);
    console.log("Post:", post);

    return NextResponse.json(
      new ApiResponse(200, "Post fetched successfully!", post),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      new ApiResponse(500, "Something went wrong!"),
      { status: 500 }
    );
  }
}