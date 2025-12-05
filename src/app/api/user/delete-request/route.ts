import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/ApiResponse";
import dbConnect from "@/database/dbConnection";
import Follow from "@/models/follow.model";
import Notification from "@/models/notification.model";


export async function DELETE(request: NextRequest) {
  try {
    await dbConnect()

    const searchParams = request.nextUrl.searchParams;
    const followingUserId = searchParams.get("followingId");
    const requestId = searchParams.get("requestId");
    const userId = request.headers.get("x-user-id");

    if(!userId) {
      return NextResponse.json(
        new ApiResponse(400, "Invalid UserId"),
        { status: 400 }
      );
    }

    let deleted;

    if (requestId) {
      deleted = await Follow.deleteOne({
        _id: requestId,
        followingId: userId,
        isAccepted: false
      })
    }
    else if (followingUserId) {
      deleted = await Follow.deleteOne({
        followerId: userId,
        followingId: followingUserId,
        isAccepted: false
      })
    }

    if (!deleted || deleted.deletedCount === 0) {
      return NextResponse.json(
        new ApiResponse(404, "Follow request not found or already accepted"),
        { status: 404 }
      );
    }
    
    if(requestId){
      await Notification.deleteOne({
        entityId: requestId,
        type: "FOLLOW_REQUEST"
      })
    } else {
      await Notification.deleteOne({
      recipient: userId,
      actor: followingUserId,
      type: "FOLLOW_REQUEST"
    })
    }

    return NextResponse.json(
      new ApiResponse(200, "Follow request deleted successfully"),
      { status: 200 }
    );

  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      new ApiResponse(500, "Something went wrong: Accept-request"),
      { status: 500 }
    );
  }
}