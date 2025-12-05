import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/ApiResponse";
import dbConnect from "@/database/dbConnection";
import Follow from "@/models/follow.model";
import { safeObjectId } from "@/helpers/ValidateMongooseId";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const followingUserId = searchParams.get("followingId");
    const userId = request.headers.get("x-user-id");

    const validUserId = safeObjectId(userId as string);
    const validFollowingUserId = safeObjectId(followingUserId as string);

    if (!validUserId || !validFollowingUserId) {
      return NextResponse.json(
        new ApiResponse(400, "Invalid followingId or userId"),
        { status: 400 }
      );
    }

    const res = await Follow.deleteOne({
      followerId: validUserId,
      followingId: validFollowingUserId,
      isAccepted: true
    })

    if(!res.acknowledged && !(res.deletedCount == 0)) {
      return NextResponse.json(
        new ApiResponse(400, "Request not found"),
        { status: 400 }
      );
    }

    return NextResponse.json(
      new ApiResponse(200, "Unfollowed successfully."),
      { status: 200 }
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      new ApiResponse(500, "Something went wrong while following a user!!"),
      { status: 500 }
    );
  }
}
