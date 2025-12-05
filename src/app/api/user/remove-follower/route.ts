import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/ApiResponse";
import dbConnect from "@/database/dbConnection";
import Follow from "@/models/follow.model";
import { safeObjectId } from "@/helpers/ValidateMongooseId";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const followerId = searchParams.get("followerId");
    const userId = request.headers.get("x-user-id");

    const validUserId = safeObjectId(userId as string);
    const validFollowerId = safeObjectId(followerId as string);

    if (!validUserId || !validFollowerId) {
      return NextResponse.json(
        new ApiResponse(400, "Invalid followerId or userId"),
        { status: 400 }
      );
    }

    const res = await Follow.deleteOne({
      followerId: validFollowerId,
      followingId: validUserId,
      isAccepted: true
    });

    if (!res.acknowledged || res.deletedCount === 0) {
      return NextResponse.json(
        new ApiResponse(400, "Follower relationship not found"),
        { status: 400 }
      );
    }

    return NextResponse.json(
      new ApiResponse(200, "Follower removed successfully."),
      { status: 200 }
    );

  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      new ApiResponse(500, "Something went wrong while removing follower!!"),
      { status: 500 }
    );
  }
}
