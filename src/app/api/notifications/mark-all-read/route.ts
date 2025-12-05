import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/ApiResponse";
import dbConnect from "@/database/dbConnection";
import Notification from "@/models/notification.model";

export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();

    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(new ApiResponse(400, "Invalid UserId"), { status: 400 });
    }

    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true } }
    );

    return NextResponse.json(
      new ApiResponse(200, "All notifications marked as read",)
    );

  } catch (error: any) {
    console.error("Notification Error:", error);
    return NextResponse.json(
      new ApiResponse(500, "Something went wrong while marking Notification as read"),
      { status: 500 }
    );
  }
}
