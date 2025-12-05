import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/ApiResponse";
import dbConnect from "@/database/dbConnection";
import Follow from "@/models/follow.model";
import { safeObjectId } from "@/helpers/ValidateMongooseId";
import Notification from "@/models/notification.model";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const followingUserId = searchParams.get("followingId");
    const isPrivateParam = searchParams.get("isPrivate") === "true"; 
    const userId = request.headers.get("x-user-id");

    if (!userId || !followingUserId) {
      return NextResponse.json(
        new ApiResponse(400, "Invalid followingId or userId"),
        { status: 400 }
      );
    }

    if (userId === followingUserId) {
      return NextResponse.json(
        new ApiResponse(400, "User cannot follow themselves"),
        { status: 400 }
      );
    }

    const existingRequest = await Follow.findOne({
      followerId: userId,
      followingId: followingUserId,
      isAccepted: false,
    });

    if (existingRequest) {
      return NextResponse.json(
        new ApiResponse(409, "Follow request already sent."),
        { status: 409 }
      );
    }

    const alreadyFollowing = await Follow.findOne({
      followerId: userId,
      followingId: followingUserId,
      isAccepted: true,
    });

    if (alreadyFollowing) {
      return NextResponse.json(
        new ApiResponse(409, "User is already a follower."),
        { status: 409 }
      );
    }

    const followRequest = await Follow.create({
      followerId: userId,
      followingId: followingUserId,
      isAccepted: !isPrivateParam,
    });

    if (isPrivateParam) {
      await Notification.create({
        recipient: followingUserId,
        actor: userId,
        type: "FOLLOW_REQUEST",
        entityId: followRequest._id
      })
      return NextResponse.json(
        new ApiResponse(201, "Follow request sent successfully."),
        { status: 201 }
      );
    } else {
      await Notification.create({
        recipient: followingUserId,
        actor: userId,
        type: "FOLLOW"
      })
      return NextResponse.json(
        new ApiResponse(201, "Followed successfully."),
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      new ApiResponse(500, "Something went wrong while following a user!!"),
      { status: 500 }
    );
  }
}
