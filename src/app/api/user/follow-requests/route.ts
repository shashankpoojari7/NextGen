import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/ApiResponse";
import dbConnect from "@/database/dbConnection";
import Follow from "@/models/follow.model";
import User from "@/models/user.model";
import { safeObjectId } from "@/helpers/ValidateMongooseId";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const userId = request.headers.get("x-user-id");
    const validUserId = safeObjectId(userId as string);

    if (!validUserId) {
      return NextResponse.json(
        new ApiResponse(400, "Invalid followingId or userId"),
        { status: 400 }
      );
    }

    // ✅ Fetch pending follow requests with follower details
    const followRequests = await Follow.aggregate([
      {
        $match: {
          followingId: validUserId,
          isAccepted: false,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "followerId",
          foreignField: "_id",
          as: "follower",
        },
      },
      {
        $unwind: "$follower", 
      },
      {
        $project: {
          _id: 1,
          followerId: 1,
          followingId: 1,
          isAccepted: 1,
          createdAt: 1,
          updatedAt: 1,
          "follower._id": 1,
          "follower.username": 1,
          "follower.profile_image": 1,
        },
      },
    ]);

    return NextResponse.json(
      new ApiResponse(200, "Follow requests fetched successfully.", followRequests),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Follow Request Fetch Error:", error);
    return NextResponse.json(
      new ApiResponse(500, "Something went wrong while fetching follow requests"),
      { status: 500 }
    );
  }
}
