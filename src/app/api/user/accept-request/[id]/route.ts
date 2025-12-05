import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/ApiResponse";
import dbConnect from "@/database/dbConnection";
import Follow from "@/models/follow.model";
import { safeObjectId } from "@/helpers/ValidateMongooseId";
import Notification from "@/models/notification.model";


export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id: requestId } = await params

    const validRequestId = safeObjectId(requestId)

    if(!validRequestId) {
      return NextResponse.json(
        new ApiResponse(400, "Missing Parameter: RequestId"),
        { status: 400 }
      );
    }

    await Follow.findByIdAndUpdate(
      { _id: validRequestId },
      { $set: { isAccepted: true } }
    )

    await Notification.deleteOne({
      entityId: validRequestId,
      type: "FOLLOW_REQUEST"
    })

    return NextResponse.json(
      new ApiResponse(200, "Request Accepted Successfully"),
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