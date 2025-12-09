import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/database/dbConnection";
import User from "@/models/user.model";
import Follow from "@/models/follow.model";
import { ApiResponse } from "@/lib/ApiResponse";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        new ApiResponse(400, "Missing userId"),
        { status: 400 }
      );
    }

    const currentUserId = new mongoose.Types.ObjectId(userId);

    const following = await Follow.find({
      followerId: currentUserId,
      isAccepted: true
    }).select("followingId");

    const followingIds = following.map((f) => f.followingId);

    const discoverUsers = await User.find({
      _id: { $nin: [...followingIds, currentUserId] }
    })
      .select("username profile_image fullname")

    return NextResponse.json(
      new ApiResponse(200, "Users fetched successfully", discoverUsers),
      { status: 200 }
    );

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      new ApiResponse(500, "Failed to fetch discover users"),
      { status: 500 }
    );
  }
}
